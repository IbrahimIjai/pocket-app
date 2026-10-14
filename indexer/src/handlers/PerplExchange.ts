/*
 * Pocket × Envio: indexes the Perpl Exchange on Monad into per-account trade history.
 * Docs: https://docs.envio.dev
 */
import { indexer } from "envio"
import type { Account, EvmOnEventContext, Trade } from "envio"

const ZERO = 0n

const sideOf = (positionType: bigint) => (positionType === 0n ? "long" : "short")
const openKey = (accountId: bigint, perpId: bigint) => `${accountId}-${perpId}`

type Ctx = EvmOnEventContext

async function account(context: Ctx, accountId: bigint): Promise<Account | undefined> {
  return context.Account.get(accountId.toString())
}

async function openTrade(context: Ctx, accountId: bigint, perpId: bigint): Promise<Trade | undefined> {
  const pointer = await context.OpenPosition.get(openKey(accountId, perpId))
  return pointer ? context.Trade.get(pointer.tradeId) : undefined
}

indexer.onEvent({ contract: "PerplExchange", event: "AccountCreated" }, async ({ event, context }) => {
  context.Account.set({
    id: event.params.id.toString(),
    address: event.params.account.toLowerCase(),
    createdAt: event.block.timestamp,
    depositsCNS: ZERO,
    withdrawalsCNS: ZERO,
    realizedPnlCNS: ZERO,
    fundingCNS: ZERO,
    tradesOpened: 0,
    tradesClosed: 0,
    liquidations: 0,
  })
})

for (const kind of ["deposit", "withdrawal"] as const) {
  indexer.onEvent(
    { contract: "PerplExchange", event: kind === "deposit" ? "CollateralDeposit" : "CollateralWithdrawal" },
    async ({ event, context }) => {
      const acct = await account(context, event.params.accountId)
      if (!acct) return
      context.Transfer.set({
        id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
        accountId: acct.id,
        address: acct.address,
        kind,
        amountCNS: event.params.amountCNS,
        balanceCNS: event.params.balanceCNS,
        timestamp: event.block.timestamp,
        txHash: event.transaction.hash,
      })
      context.Account.set(
        kind === "deposit"
          ? { ...acct, depositsCNS: acct.depositsCNS + event.params.amountCNS }
          : { ...acct, withdrawalsCNS: acct.withdrawalsCNS + event.params.amountCNS },
      )
    },
  )
}

// Opening: V1 and V2 carry the same fields we need.
for (const ev of ["PositionOpened", "PositionOpenedV2"] as const) {
  indexer.onEvent({ contract: "PerplExchange", event: ev }, async ({ event, context }) => {
    const p = event.params
    const acct = await account(context, p.accountId)
    if (!acct) return
    const id = `${p.accountId}-${p.perpId}-${event.block.number}-${event.logIndex}`
    context.Trade.set({
      id,
      accountId: acct.id,
      address: acct.address,
      perpId: Number(p.perpId),
      side: sideOf(p.positionType),
      leverageHdths: p.leverageHdths,
      entryPricePNS: p.pricePNS,
      depositCNS: p.depositCNS,
      lotLNS: p.lotLNS,
      status: "open",
      realizedPnlCNS: ZERO,
      fundingCNS: ZERO,
      feesCNS: p.insFeeCNS + p.protFeeCNS,
      exitPricePNS: undefined,
      openedAt: event.block.timestamp,
      openTx: event.transaction.hash,
      closedAt: undefined,
      closeTx: undefined,
    })
    context.OpenPosition.set({ id: openKey(p.accountId, p.perpId), tradeId: id })
    context.Account.set({ ...acct, tradesOpened: acct.tradesOpened + 1 })
  })
}

for (const ev of ["PositionIncreased", "PositionIncreasedV2"] as const) {
  indexer.onEvent({ contract: "PerplExchange", event: ev }, async ({ event, context }) => {
    const p = event.params
    const trade = await openTrade(context, p.accountId, p.perpId)
    if (!trade) return
    context.Trade.set({
      ...trade,
      depositCNS: p.endDepositCNS > trade.depositCNS ? p.endDepositCNS : trade.depositCNS,
      lotLNS: p.endLotLNS > trade.lotLNS ? p.endLotLNS : trade.lotLNS,
      feesCNS: trade.feesCNS + p.insFeeCNS + p.protFeeCNS,
    })
  })
}

indexer.onEvent({ contract: "PerplExchange", event: "PositionDecreased" }, async ({ event, context }) => {
  const p = event.params
  const trade = await openTrade(context, p.accountId, p.perpId)
  if (!trade) return
  context.Trade.set({
    ...trade,
    realizedPnlCNS: trade.realizedPnlCNS + p.deltaPnlCNS,
    fundingCNS: trade.fundingCNS + p.fundingCNS,
  })
})

async function finish(
  context: Ctx,
  args: {
    accountId: bigint
    perpId: bigint
    status: "closed" | "liquidated"
    pricePNS: bigint
    deltaPnlCNS: bigint
    fundingCNS: bigint
    timestamp: number
    txHash: string
  },
) {
  const trade = await openTrade(context, args.accountId, args.perpId)
  const acct = await account(context, args.accountId)
  if (!trade || !acct) return
  const realized = trade.realizedPnlCNS + args.deltaPnlCNS
  const funding = trade.fundingCNS + args.fundingCNS
  context.Trade.set({
    ...trade,
    status: args.status,
    realizedPnlCNS: realized,
    fundingCNS: funding,
    exitPricePNS: args.pricePNS,
    closedAt: args.timestamp,
    closeTx: args.txHash,
  })
  context.OpenPosition.deleteUnsafe(openKey(args.accountId, args.perpId))
  context.Account.set({
    ...acct,
    realizedPnlCNS: acct.realizedPnlCNS + args.deltaPnlCNS,
    fundingCNS: acct.fundingCNS + args.fundingCNS,
    tradesClosed: acct.tradesClosed + 1,
    liquidations: acct.liquidations + (args.status === "liquidated" ? 1 : 0),
  })
}

indexer.onEvent({ contract: "PerplExchange", event: "PositionClosed" }, async ({ event, context }) => {
  const p = event.params
  await finish(context, {
    accountId: p.accountId,
    perpId: p.perpId,
    status: "closed",
    pricePNS: p.pricePNS,
    deltaPnlCNS: p.deltaPnlCNS,
    fundingCNS: p.fundingCNS,
    timestamp: event.block.timestamp,
    txHash: event.transaction.hash,
  })
})

indexer.onEvent({ contract: "PerplExchange", event: "PositionLiquidated" }, async ({ event, context }) => {
  const p = event.params
  // Partial liquidations leave a position open; only a full one ends the trade.
  if (p.liqLotLNS < p.posLotLNS) {
    const trade = await openTrade(context, p.posAccountId, p.perpId)
    if (trade) {
      context.Trade.set({
        ...trade,
        realizedPnlCNS: trade.realizedPnlCNS + p.deltaPnlCNS,
        fundingCNS: trade.fundingCNS + p.fundingCNS,
      })
    }
    return
  }
  await finish(context, {
    accountId: p.posAccountId,
    perpId: p.perpId,
    status: "liquidated",
    pricePNS: p.liqPricePNS,
    deltaPnlCNS: p.deltaPnlCNS,
    fundingCNS: p.fundingCNS,
    timestamp: event.block.timestamp,
    txHash: event.transaction.hash,
  })
})

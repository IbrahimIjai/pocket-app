import { describe, it } from "vitest"
import { createTestIndexer } from "envio"

const ADDR = "0x00000000000000000000000000000000000000a1" as const

const created = { contract: "PerplExchange" as const, event: "AccountCreated" as const, params: { account: ADDR, id: 7n } }

const opened = {
  contract: "PerplExchange" as const,
  event: "PositionOpenedV2" as const,
  params: {
    perpId: 1n,
    accountId: 7n,
    positionType: 0n,
    leverageHdths: 200n,
    depositCNS: 5_000_000n,
    pnlCollateralizedCNS: 0n,
    pricePNS: 832_000n,
    lotLNS: 12n,
    insFeeCNS: 1_000n,
    protFeeCNS: 2_000n,
    priceResiduePNSQ16: 0n,
  },
}

describe("Pocket Perpl indexer", () => {
  it("tracks a deposit and a full open → close trade", async (t) => {
    const indexer = createTestIndexer()
    await indexer.process({
      chains: {
        143: {
          simulate: [
            created,
            {
              contract: "PerplExchange",
              event: "CollateralDeposit",
              params: { accountId: 7n, amountCNS: 10_000_000n, balanceCNS: 10_000_000n },
            },
            opened,
            {
              contract: "PerplExchange",
              event: "PositionClosed",
              params: { perpId: 1n, accountId: 7n, positionType: 0n, pricePNS: 840_000n, deltaPnlCNS: 96_000n, fundingCNS: -500n },
            },
          ],
        },
      },
    })

    const account = await indexer.Account.getOrThrow("7")
    t.expect(account.address).toBe(ADDR)
    t.expect(account.depositsCNS).toBe(10_000_000n)
    t.expect(account.tradesOpened).toBe(1)
    t.expect(account.tradesClosed).toBe(1)
    t.expect(account.realizedPnlCNS).toBe(96_000n)

    const trades = await indexer.Trade.getAll()
    t.expect(trades).toHaveLength(1)
    const trade = trades[0]!
    t.expect(trade.status).toBe("closed")
    t.expect(trade.side).toBe("long")
    t.expect(trade.address).toBe(ADDR)
    t.expect(trade.entryPricePNS).toBe(832_000n)
    t.expect(trade.exitPricePNS).toBe(840_000n)
    t.expect(trade.realizedPnlCNS).toBe(96_000n)
    t.expect(trade.fundingCNS).toBe(-500n)
    t.expect(trade.feesCNS).toBe(3_000n)
    t.expect(trade.closeTx).toBeDefined()

    t.expect(await indexer.OpenPosition.get("7-1")).toBeUndefined()
    const transfers = await indexer.Transfer.getAll()
    t.expect(transfers.map((x) => x.kind)).toEqual(["deposit"])
  })

  it("marks a fully liquidated position and counts it", async (t) => {
    const indexer = createTestIndexer()
    await indexer.process({
      chains: {
        143: {
          simulate: [
            created,
            opened,
            {
              contract: "PerplExchange",
              event: "PositionLiquidated",
              params: {
                perpId: 1n,
                posAccountId: 7n,
                positionType: 0n,
                markPricePNS: 700_000n,
                liqPricePNS: 710_000n,
                liqLotLNS: 12n,
                posLotLNS: 12n,
                deltaPnlCNS: -5_000_000n,
                fundingCNS: 0n,
                posAmountCNS: 0n,
                posDepositCNS: 5_000_000n,
                accAmountCNS: 0n,
                accBalanceCNS: 0n,
                onOrderBook: false,
              },
            },
          ],
        },
      },
    })
    const [trade] = await indexer.Trade.getAll()
    t.expect(trade!.status).toBe("liquidated")
    t.expect(trade!.realizedPnlCNS).toBe(-5_000_000n)
    t.expect((await indexer.Account.getOrThrow("7")).liquidations).toBe(1)
  })

  it("ignores events for accounts it has never seen", async (t) => {
    const indexer = createTestIndexer()
    await indexer.process({ chains: { 143: { simulate: [opened] } } })
    t.expect(await indexer.Trade.getAll()).toHaveLength(0)
  })
})

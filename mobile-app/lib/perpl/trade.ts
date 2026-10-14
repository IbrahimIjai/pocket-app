// Live Perpl execution from the user's own Mera account (plan Phase 6).
// ⚠️ Not yet verified with a funded round trip (plan step 5.3). Every tx sets explicit gas
// because Monad charges the declared gas limit, not gas used (POCKET.md §5.4).
import { erc20Abi, getAddress, type Abi, type Address, type Hash } from 'viem';
import { publicClient, type PocketWalletClient } from '../chain';
import { config } from '../config';
import type { Market, Multiplier, Side } from '../types';
import { ExchangeAbi } from './abi';
import { cnsToUsd, readAccount, readPositions, usdToCns, type ChainPosition } from './exchange';
import { getContext } from './market-data';
import { leverageToHdths, lotToLNS, priceToPNS } from './units';

const EXCHANGE = () => getAddress(config.perplExchange);
const AUSD = () => getAddress(config.ausd);

const SLIPPAGE = 0.005; // price bound for IOC market orders: mark ± 0.5%
const SLIPPAGE_BPS = 50n;
const GAS_HEADROOM = 120n; // estimate × 1.2
const OrderType = { OpenLong: 0, OpenShort: 1, CloseLong: 2, CloseShort: 3 } as const;

export type TradeStep =
  | 'approving'
  | 'opening-account'
  | 'depositing'
  | 'ordering'
  | 'closing'
  | 'withdrawing';

export class TradeError extends Error {
  constructor(
    message: string,
    public step?: TradeStep
  ) {
    super(message);
  }
}

async function send(
  wallet: PocketWalletClient,
  call: { address: Address; abi: Abi; functionName: string; args: readonly unknown[] },
  step: TradeStep
): Promise<Hash> {
  try {
    const estimate = await publicClient.estimateContractGas({ ...call, account: wallet.account });
    const hash = await wallet.writeContract({
      ...call,
      gas: (estimate * GAS_HEADROOM) / 100n,
    } as Parameters<PocketWalletClient['writeContract']>[0]);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status !== 'success') throw new Error('Transaction reverted.');
    return hash;
  } catch (error) {
    throw new TradeError(friendly(error), step);
  }
}

function friendly(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);
  if (/insufficient funds|gas required exceeds/i.test(msg))
    return 'You need a little MON for network fees.';
  if (/InsufficientBalance|transfer amount exceeds balance/i.test(msg))
    return 'Not enough AUSD in your Pocket for this trade.';
  if (/ExceedsMaxNegPnlCollat|slippage/i.test(msg)) return 'The price moved too fast. Try again.';
  if (/SESSION_ENDED/i.test(msg)) return 'Your session ended. Unlock your Pocket again.';
  return 'The trade didn’t go through. Your money is safe — try again.';
}

async function instanceMinimums() {
  const ctx = await getContext();
  const inst = ctx.instances.find((i) => getAddress(i.address) === EXCHANGE()) ?? ctx.instances[0];
  return {
    minOpen: BigInt(inst.min_account_open_amount),
    minDeposit: BigInt(inst.min_deposit_amount),
    minWithdraw: BigInt(inst.min_withdraw_amount),
  };
}

async function ensureAllowance(wallet: PocketWalletClient, owner: Address, amount: bigint) {
  const allowance = await publicClient.readContract({
    address: AUSD(),
    abi: erc20Abi,
    functionName: 'allowance',
    args: [owner, EXCHANGE()],
  });
  if (allowance >= amount) return;
  await send(
    wallet,
    { address: AUSD(), abi: erc20Abi, functionName: 'approve', args: [EXCHANGE(), amount] },
    'approving'
  );
}

/** USD that must be free on Perpl to open: margin + open fee + buffer for close fee/slippage. */
export function requiredCollateralUsd(riskUsd: number, k: number, market: Market) {
  const notional = riskUsd * k;
  const fees = notional * market.takerFeeRate * 2;
  const buffer = Math.max(riskUsd * 0.02, 0.05);
  return Math.ceil((riskUsd + fees + buffer) * 100) / 100;
}

export async function openLiveTrade(p: {
  wallet: PocketWalletClient;
  address: Address;
  market: Market;
  side: Side;
  riskUsd: number;
  k: Multiplier;
  onStep?: (s: TradeStep) => void;
}) {
  const { wallet, address, market, side, riskUsd, k, onStep } = p;
  if (market.priceDecimals === undefined || market.sizeDecimals === undefined) {
    throw new TradeError('Market data is still loading.');
  }
  const started = Date.now();
  const needed = usdToCns(requiredCollateralUsd(riskUsd, k, market));
  const mins = await instanceMinimums();
  const account = await readAccount(address);

  // 1. Make sure enough collateral is free on Perpl. Minimums mean the first deposit may exceed
  //    the risk; the extra stays free in the account (not in the position) and can be withdrawn.
  if (!account) {
    const amount = needed > mins.minOpen ? needed : mins.minOpen;
    onStep?.('approving');
    await ensureAllowance(wallet, address, amount);
    onStep?.('opening-account');
    await send(
      wallet,
      {
        address: EXCHANGE(),
        abi: ExchangeAbi as Abi,
        functionName: 'createAccount',
        args: [amount],
      },
      'opening-account'
    );
  } else if (account.balanceCNS < needed) {
    const short = needed - account.balanceCNS;
    const amount = short > mins.minDeposit ? short : mins.minDeposit;
    onStep?.('approving');
    await ensureAllowance(wallet, address, amount);
    onStep?.('depositing');
    await send(
      wallet,
      {
        address: EXCHANGE(),
        abi: ExchangeAbi as Abi,
        functionName: 'depositCollateral',
        args: [amount],
      },
      'depositing'
    );
  }

  // 2. IOC market order. Lots round down so notional (and so the loss) never exceeds the choice.
  onStep?.('ordering');
  const bound = market.price * (side === 'long' ? 1 + SLIPPAGE : 1 - SLIPPAGE);
  const lotLNS = lotToLNS((riskUsd * k) / market.price, market.sizeDecimals);
  if (lotLNS === 0n) throw new TradeError('That amount is too small for this market.');
  const hash = await send(
    wallet,
    {
      address: EXCHANGE(),
      abi: ExchangeAbi as Abi,
      functionName: 'execOrder',
      args: [
        {
          orderDescId: 0n,
          perpId: BigInt(market.marketId),
          orderType: side === 'long' ? OrderType.OpenLong : OrderType.OpenShort,
          orderId: 0n,
          pricePNS: priceToPNS(bound, market.priceDecimals),
          lotLNS,
          expiryBlock: 0n,
          postOnly: false,
          fillOrKill: false,
          immediateOrCancel: true,
          maxMatches: 0n,
          leverageHdths: leverageToHdths(k),
          lastExecutionBlock: 0n,
          amountCNS: 0n,
          maxSlippageBps: SLIPPAGE_BPS,
        },
      ],
    },
    'ordering'
  );

  // 3. Confirm the position exists (IOC can fill nothing if the book is thin).
  const acct = await readAccount(address);
  const [position] = acct ? await readPositions(acct.accountId, [market.marketId]) : [];
  if (!position)
    throw new TradeError('The order didn’t fill. Nothing was traded — try again.', 'ordering');
  return { hash, position, settleMs: Date.now() - started, at: Date.now() };
}

export async function closeLiveTrade(p: {
  wallet: PocketWalletClient;
  address: Address;
  market: Market;
  onStep?: (s: TradeStep) => void;
}) {
  const { wallet, address, market, onStep } = p;
  if (market.priceDecimals === undefined) throw new TradeError('Market data is still loading.');
  const started = Date.now();
  const account = await readAccount(address);
  if (!account) throw new TradeError('No Perpl account found.');
  const [position]: ChainPosition[] = await readPositions(account.accountId, [market.marketId]);
  if (!position) throw new TradeError('This trade is already closed.');

  onStep?.('closing');
  const long = position.side === 'long';
  const bound = market.price * (long ? 1 - SLIPPAGE : 1 + SLIPPAGE);
  const hash = await send(
    wallet,
    {
      address: EXCHANGE(),
      abi: ExchangeAbi as Abi,
      functionName: 'execOrder',
      args: [
        {
          orderDescId: 0n,
          perpId: BigInt(market.marketId),
          orderType: long ? OrderType.CloseLong : OrderType.CloseShort,
          orderId: 0n,
          pricePNS: priceToPNS(bound, market.priceDecimals),
          lotLNS: position.lotLNS,
          expiryBlock: 0n,
          postOnly: false,
          fillOrKill: false,
          immediateOrCancel: true,
          maxMatches: 0n,
          leverageHdths: 100n,
          lastExecutionBlock: 0n,
          amountCNS: 0n,
          maxSlippageBps: SLIPPAGE_BPS,
        },
      ],
    },
    'closing'
  );
  const settleMs = Date.now() - started;

  const after = await readAccount(address);
  const [still] = after ? await readPositions(after.accountId, [market.marketId]) : [];
  if (still) throw new TradeError('The close didn’t fully fill. Try again.', 'closing');

  // Result = what the account holds now minus what it held before, relative to the deposit.
  const freeBefore = account.balanceCNS;
  const freeAfter = after?.balanceCNS ?? 0n;
  const returnedUsd = cnsToUsd(freeAfter - freeBefore);
  const pnlUsd = returnedUsd - cnsToUsd(position.depositCNS);

  // Best effort: move everything back to the wallet. Perpl rate-limits withdrawals exchange-wide.
  const withdrawn = await withdrawAll({ wallet, address, onStep }).catch(() => false);
  return {
    hash,
    pnlUsd,
    riskUsd: cnsToUsd(position.depositCNS),
    settleMs,
    withdrawn,
    at: Date.now(),
  };
}

/** Withdraw all free collateral from Perpl back to the wallet. Returns false if nothing/limited. */
export async function withdrawAll(p: {
  wallet: PocketWalletClient;
  address: Address;
  onStep?: (s: TradeStep) => void;
}) {
  const account = await readAccount(p.address);
  if (!account) return false;
  const mins = await instanceMinimums();
  if (account.balanceCNS < mins.minWithdraw) return false;
  p.onStep?.('withdrawing');
  await send(
    p.wallet,
    {
      address: EXCHANGE(),
      abi: ExchangeAbi as Abi,
      functionName: 'withdrawCollateral',
      args: [account.balanceCNS],
    },
    'withdrawing'
  );
  return true;
}

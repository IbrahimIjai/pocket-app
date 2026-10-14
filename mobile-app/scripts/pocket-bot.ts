/**
 * Pocket Bot — "max loss first" automation on Perpl (Monad mainnet).
 *
 * Opens a trade sized by the user's maximum loss (lib/risk.ts), watches the live Perpl mark
 * price, and closes automatically on take-profit, stop-loss or a time limit. Then it withdraws
 * free collateral back to the wallet and prints every MonadVision link.
 *
 * Key: put POCKET_BOT_KEY=0x… in mobile-app/.env.local (gitignored; Bun loads it automatically).
 *
 *   bun run scripts/pocket-bot.ts                     # dry run: prints the plan, sends nothing
 *   bun run scripts/pocket-bot.ts --live              # real trades
 *   bun run scripts/pocket-bot.ts --live --symbol BTC --side long --risk 5 --k 2 \
 *     --tp 0.5 --sl 2 --hold 90 --rounds 1
 */
import { privateKeyToAccount } from 'viem/accounts';
import { pocketWalletClient } from '../lib/chain';
import { EXPLORER_TX, formatPrice, formatUsd } from '../lib/format';
import { readAccount, readPositions, readWallet, cnsToUsd } from '../lib/perpl/exchange';
import { getContext, getTicker, toMarket } from '../lib/perpl/market-data';
import { closeLiveTrade, openLiveTrade, requiredCollateralUsd } from '../lib/perpl/trade';
import { pnlUsd, sizeTrade, type Multiplier, type Side } from '../lib/risk';

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const opt = (name: string, fallback: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const LIVE = flag('live');
const SYMBOL = opt('symbol', 'BTC').toUpperCase();
const SIDE = (opt('side', 'long') === 'short' ? 'short' : 'long') as Side;
const RISK = Number(opt('risk', '5'));
const K = Number(opt('k', '2')) as Multiplier;
const TP_USD = Number(opt('tp', '0.5')); // close when up this many dollars
const SL_USD = Number(opt('sl', String(RISK * 0.4))); // close early when down this many dollars
const HOLD_S = Number(opt('hold', '90')); // close after this many seconds regardless
const ROUNDS = Number(opt('rounds', '1'));
const POLL_MS = 2_000;

const log = (...a: unknown[]) => console.log(new Date().toISOString().slice(11, 19), ...a);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function liveMarket() {
  const [ctx, ticker] = await Promise.all([getContext(), getTicker()]);
  const raw = ctx.markets.find(
    (m) => (m.size_units || m.symbol || m.name).toUpperCase() === SYMBOL
  );
  if (!raw) throw new Error(`Unknown Perpl market ${SYMBOL}`);
  return toMarket(raw, ticker.d[String(raw.id)] ?? raw.state);
}

async function main() {
  if (![2, 5, 10].includes(K)) throw new Error('--k must be 2, 5 or 10');
  if (!(RISK >= 1)) throw new Error('--risk must be at least 1 (USD)');

  const market = await liveMarket();
  if (K > market.maxLeverage) throw new Error(`${SYMBOL} allows up to ${market.maxLeverage}×`);
  const plan = sizeTrade({
    riskUsd: RISK,
    k: K,
    markPrice: market.price,
    side: SIDE,
    mmr: market.mmr,
    takerFeeRate: market.takerFeeRate,
  });

  log(
    `Pocket Bot · ${SYMBOL} ${SIDE === 'long' ? 'Up' : 'Down'} · ${K}× · max loss ${formatUsd(RISK)}`
  );
  log(
    `Mark ${formatPrice(market.price)} → notional ${formatUsd(plan.notional)}, auto-close ≈ ${formatPrice(plan.autoClosePrice)}`
  );
  log(
    `Rules: take profit +${formatUsd(TP_USD)} · stop −${formatUsd(SL_USD)} · max hold ${HOLD_S}s · ${ROUNDS} round(s)`
  );
  log(
    `Needs ≈ ${formatUsd(requiredCollateralUsd(RISK, K, market))} free on Perpl (min deposit $10)`
  );

  const key = process.env.POCKET_BOT_KEY;
  if (!LIVE || !key) {
    log(
      LIVE ? 'POCKET_BOT_KEY is not set (mobile-app/.env.local).' : 'Dry run — add --live to trade.'
    );
    return;
  }
  if (!/^0x[0-9a-fA-F]{64}$/.test(key))
    throw new Error('POCKET_BOT_KEY must be a 0x-prefixed 32-byte hex key');

  const account = privateKeyToAccount(key as `0x${string}`);
  const wallet = pocketWalletClient(account);
  const address = account.address;
  const bal = await readWallet(address);
  log(
    `Wallet ${address} · AUSD ${formatUsd(cnsToUsd(bal.ausd))} · MON ${(Number(bal.mon) / 1e18).toFixed(4)}`
  );
  if (bal.mon === 0n) throw new Error('Wallet needs a little MON for gas');

  const txs: string[] = [];
  for (let round = 1; round <= ROUNDS; round++) {
    log(`— Round ${round}/${ROUNDS}: opening`);
    const opened = await openLiveTrade({
      wallet,
      address,
      market: await liveMarket(),
      side: SIDE,
      riskUsd: RISK,
      k: K,
      onStep: (s) => log(`  ${s}…`),
    });
    txs.push(opened.hash);
    log(`  filled in ${opened.settleMs}ms · ${EXPLORER_TX(opened.hash)}`);

    const acct = await readAccount(address);
    const [pos] = acct ? await readPositions(acct.accountId, [market.marketId]) : [];
    if (!pos) throw new Error('Position not found after fill');
    const entry = Number(pos.pricePNS) / 10 ** (market.priceDecimals ?? 0);
    const size = Number(pos.lotLNS) / 10 ** (market.sizeDecimals ?? 0);
    log(
      `  entry ${formatPrice(entry)} · size ${size} ${SYMBOL} · collateral ${formatUsd(cnsToUsd(pos.depositCNS))}`
    );

    const started = Date.now();
    let reason = 'time limit';
    while (Date.now() - started < HOLD_S * 1000) {
      await sleep(POLL_MS);
      const m = await liveMarket();
      const pnl = pnlUsd({ entry, mark: m.price, size, side: SIDE });
      log(`  mark ${formatPrice(m.price)} · P&L ${formatUsd(pnl, { sign: true })}`);
      if (pnl >= TP_USD) {
        reason = 'take profit';
        break;
      }
      if (pnl <= -SL_USD) {
        reason = 'stop loss';
        break;
      }
    }

    log(`  closing (${reason})`);
    const closed = await closeLiveTrade({
      wallet,
      address,
      market: await liveMarket(),
      onStep: (s) => log(`  ${s}…`),
    });
    txs.push(closed.hash);
    log(
      `  closed in ${closed.settleMs}ms · result ${formatUsd(closed.pnlUsd, { sign: true })} · ${EXPLORER_TX(closed.hash)}${closed.withdrawn ? ' · withdrawn to wallet' : ''}`
    );
  }

  log('Done. On-chain activity:');
  for (const h of txs) console.log('  ', EXPLORER_TX(h));
}

main().catch((e) => {
  console.error('Pocket Bot stopped:', e instanceof Error ? e.message : e);
  process.exit(1);
});

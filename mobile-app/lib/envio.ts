// Trade history from the Envio HyperIndex indexer (indexer/), keyed by owner address.
import { config } from './config';
import type { Market, Trade } from './types';

type IndexedTrade = {
  id: string;
  perpId: number;
  side: 'long' | 'short';
  status: 'open' | 'closed' | 'liquidated';
  leverageHdths: string;
  depositCNS: string;
  realizedPnlCNS: string;
  fundingCNS: string;
  feesCNS: string;
  openedAt: number;
  closedAt: number | null;
  openTx: string;
  closeTx: string | null;
};

const QUERY = `query History($address: String!) {
  Trade(where: { address: { _eq: $address }, status: { _neq: "open" } }, order_by: { closedAt: desc }, limit: 100) {
    id perpId side status leverageHdths depositCNS realizedPnlCNS fundingCNS feesCNS openedAt closedAt openTx closeTx
  }
}`;

const CNS = 1e6; // AUSD 6 dp
const MULTIPLIERS = [2, 5, 10] as const;

export const envioEnabled = () => Boolean(config.envioUrl);

export async function fetchIndexedTrades(address: string, markets: Market[]): Promise<Trade[]> {
  const res = await fetch(config.envioUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query: QUERY, variables: { address: address.toLowerCase() } }),
  });
  if (!res.ok) throw new Error(`Envio ${res.status}`);
  const json = (await res.json()) as { data?: { Trade: IndexedTrade[] }; errors?: unknown };
  if (!json.data) throw new Error('Envio query failed');

  return json.data.Trade.map((t) => {
    const symbol = markets.find((m) => m.marketId === t.perpId)?.symbol ?? `#${t.perpId}`;
    const lev = Number(t.leverageHdths) / 100;
    const k = MULTIPLIERS.reduce((b, x) => (Math.abs(x - lev) < Math.abs(b - lev) ? x : b));
    const risk = Number(t.depositCNS) / CNS;
    const pnl = (Number(t.realizedPnlCNS) + Number(t.fundingCNS) - Number(t.feesCNS)) / CNS;
    return {
      id: t.id,
      symbol,
      side: t.side,
      k,
      riskUsd: risk,
      pnlUsd: pnl,
      openedAt: t.openedAt * 1000,
      closedAt: (t.closedAt ?? t.openedAt) * 1000,
      autoClosed: t.status === 'liquidated',
      openTx: t.openTx as `0x${string}`,
      closeTx: (t.closeTx ?? undefined) as `0x${string}` | undefined,
      indexed: true,
    } satisfies Trade;
  });
}

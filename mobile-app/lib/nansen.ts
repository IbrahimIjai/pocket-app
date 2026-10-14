// Client for Pocket web's Nansen route (the API key lives on the server).
import { config } from './config';

export type SmartMoney = {
  symbol: string;
  lookbackHours: number;
  longOpenedUsd: number;
  shortOpenedUsd: number;
  longClosedUsd: number;
  shortClosedUsd: number;
  traders: number;
  trades: number;
  bias: 'long' | 'short' | 'neutral';
  top: { label: string; side: string; action: string; valueUsd: number; at?: string }[];
};

export class NotConfigured extends Error {}

export async function fetchSmartMoney(symbol: string): Promise<SmartMoney> {
  const res = await fetch(
    `${config.webUrl}/api/nansen/smart-money?symbol=${encodeURIComponent(symbol)}`
  );
  const json = (await res.json().catch(() => ({}))) as SmartMoney & { error?: string };
  if (res.status === 503) throw new NotConfigured(json.error ?? 'Not configured');
  if (!res.ok) throw new Error(json.error ?? 'Smart-money data unavailable.');
  return json;
}

const compact = (v: number) =>
  `$${Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(v)}`;

/** One plain sentence a casual trader can read before tapping Up or Down. */
export function summarize(s: SmartMoney): string {
  const net = s.longOpenedUsd - s.shortOpenedUsd;
  if (s.trades === 0) return `No smart-money ${s.symbol} trades in the last ${s.lookbackHours}h.`;
  if (s.bias === 'neutral') {
    return `Smart traders are split on ${s.symbol}: ${compact(s.longOpenedUsd)} of new longs vs ${compact(s.shortOpenedUsd)} of new shorts in the last ${s.lookbackHours}h.`;
  }
  return `Smart traders added ${compact(Math.abs(net))} more ${net > 0 ? 'longs' : 'shorts'} than ${net > 0 ? 'shorts' : 'longs'} on ${s.symbol} in the last ${s.lookbackHours}h.`;
}

export { compact as compactUsd };

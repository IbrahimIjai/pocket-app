// Display formatting. Keep every number the user sees going through here.

export function formatUsd(value: number, opts: { sign?: boolean; cents?: boolean } = {}) {
  const { sign = false, cents = true } = opts;
  const abs = Math.abs(value);
  const body = abs.toLocaleString('en-US', {
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  });
  const prefix = value < 0 ? '−' : sign && value > 0 ? '+' : '';
  return `${prefix}$${body}`;
}

/** Asset prices: big numbers get no cents, tiny ones (MON) get more precision. */
export function formatPrice(price: number) {
  const digits = price >= 1000 ? 0 : price >= 1 ? 2 : 4;
  return `$${price.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

export function formatPct(value: number, opts: { sign?: boolean; digits?: number } = {}) {
  const { sign = true, digits = 1 } = opts;
  const prefix = value < 0 ? '−' : sign && value > 0 ? '+' : '';
  return `${prefix}${Math.abs(value).toFixed(digits)}%`;
}

export function shortAddress(address: string) {
  return `${address.slice(0, 5)}…${address.slice(-4)}`;
}

export function timeAgo(ms: number, now = Date.now()) {
  const s = Math.max(0, Math.round((now - ms) / 1000));
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export const EXPLORER_TX = (hash: string) => `https://monadvision.com/tx/${hash}`;

// Perpl scaled-integer conversions. Decimals always come from the market config: no defaults.

export const scalePrice = (scaled: number, priceDecimals: number) => scaled / 10 ** priceDecimals;

export const unscalePrice = (price: number, priceDecimals: number) =>
  Math.round(price * 10 ** priceDecimals);

/** `initial_margin` / `maintenance_margin` are leverage × 100 (verified 2026-10-14). */
export const maxLeverageFrom = (initialMargin: number) => initialMargin / 100;
export const mmrFrom = (maintenanceMargin: number) => 100 / maintenanceMargin;

/** Fees are micros: 345 → 0.000345 (0.0345%). */
export const microsToRate = (micros: number) => micros / 1e6;

// On-chain order units (mirror PerplBot src/sdk/trading/orders.ts).
export const priceToPNS = (price: number, priceDecimals: number) =>
  BigInt(Math.round(price * 10 ** priceDecimals));
export const lotToLNS = (size: number, sizeDecimals: number) =>
  BigInt(Math.floor(size * 10 ** sizeDecimals)); // round down: never exceed the user's risk
export const leverageToHdths = (k: number) => BigInt(Math.round(k * 100));

/// <reference types="bun" />
import { expect, test } from 'bun:test';

process.env.EXPO_PUBLIC_ENVIO_URL = 'https://indexer.test/v1/graphql';
const { fetchIndexedTrades } = await import('./envio');

test('maps indexed Perpl trades to app trades', async () => {
  let body = '';
  globalThis.fetch = (async (_url: string, init: RequestInit) => {
    body = String(init.body);
    return new Response(
      JSON.stringify({
        data: {
          Trade: [
            {
              id: '7-1-100-2',
              perpId: 1,
              side: 'long',
              status: 'liquidated',
              leverageHdths: '500',
              depositCNS: '5000000',
              realizedPnlCNS: '-5000000',
              fundingCNS: '0',
              feesCNS: '3000',
              openedAt: 1000,
              closedAt: 2000,
              openTx: '0xaa',
              closeTx: '0xbb',
            },
          ],
        },
      })
    );
  }) as typeof fetch;

  const [t] = await fetchIndexedTrades('0xABC', [{ symbol: 'BTC', marketId: 1 } as never]);
  expect(JSON.parse(body).variables.address).toBe('0xabc');
  expect(t).toMatchObject({
    symbol: 'BTC',
    k: 5,
    riskUsd: 5,
    pnlUsd: -5.003,
    autoClosed: true,
    closedAt: 2_000_000,
    indexed: true,
  });
});

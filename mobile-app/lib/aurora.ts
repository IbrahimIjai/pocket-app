// Client for Pocket web's Aurora Intents routes (the API key lives on the server).
import { config } from './config';

export type Origin = { id: string; label: string };
export type Deposit = {
  origin: string;
  originLabel: string;
  depositAddress: `0x${string}`;
  amountIn?: string;
  amountOut?: string;
  timeEstimateSec?: number;
  deadline?: string;
};
export type DepositStatus = {
  status: string;
  amountOut?: string;
  destinationTx?: string;
  refundReason?: string;
};

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${config.webUrl}${path}`, init);
  const json = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(json.error ?? 'Any-chain deposits are unavailable right now.');
  return json;
}

export const getOrigins = () =>
  call<{ origins: Origin[] }>('/api/aurora/deposit').then((r) => r.origins);

export const createDeposit = (recipient: string, origin: string, amount: number) =>
  call<Deposit>('/api/aurora/deposit', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ recipient, origin, amount }),
  });

export const getDepositStatus = (depositAddress: string) =>
  call<DepositStatus>(`/api/aurora/status?depositAddress=${depositAddress}`);

/** Plain-language step for each Aurora/1Click status. */
export function describeStatus(s: string): { label: string; done: boolean; failed: boolean } {
  switch (s) {
    case 'PENDING_DEPOSIT':
      return { label: 'Waiting for your transfer…', done: false, failed: false };
    case 'KNOWN_DEPOSIT_TX':
    case 'PROCESSING':
      return { label: 'Transfer seen. Routing it to Monad…', done: false, failed: false };
    case 'SUCCESS':
      return { label: 'Arrived in your Pocket as USDC on Monad', done: true, failed: false };
    case 'INCOMPLETE_DEPOSIT':
      return {
        label: 'Less than the quoted amount arrived. It will be refunded.',
        done: false,
        failed: true,
      };
    case 'REFUNDED':
      return { label: 'Refunded to your address on the source chain', done: true, failed: true };
    case 'FAILED':
      return {
        label: 'The deposit failed. Contact support with the address below.',
        done: true,
        failed: true,
      };
    default:
      return { label: 'Checking status…', done: false, failed: false };
  }
}

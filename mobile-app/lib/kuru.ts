// Spot swaps on Monad through Kuru Flow (Kuru's routing aggregator over its on-chain order books).
// Docs: https://docs.kuru.io/kuru-flow/flow-overview. No API key: a short-lived JWT per user address.
import { erc20Abi, getAddress, parseUnits, type Address, type Hash } from 'viem';
import { publicClient, type PocketWalletClient } from './chain';
import { config } from './config';

const FLOW = 'https://ws.kuru.io/api';
const NATIVE = '0x0000000000000000000000000000000000000000' as const;
const GAS_HEADROOM = 120n;
const DEFAULT_SLIPPAGE_BPS = 50;

export type SpotToken = {
  symbol: 'MON' | 'AUSD' | 'USDC';
  name: string;
  address: Address;
  decimals: number;
};

export const SPOT_TOKENS: Record<SpotToken['symbol'], SpotToken> = {
  MON: { symbol: 'MON', name: 'Monad', address: NATIVE, decimals: 18 },
  AUSD: { symbol: 'AUSD', name: 'Agora dollar', address: getAddress(config.ausd), decimals: 6 },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    address: getAddress('0x754704Bc059F8C67012fEd69BC8A327a5aafb603'),
    decimals: 6,
  },
};

export type SpotQuote = {
  from: SpotToken;
  to: SpotToken;
  amountIn: bigint;
  out: bigint; // expected output (base units)
  minOut: bigint; // worst case after slippage
  tx: { to: Address; data: `0x${string}`; value: bigint };
};

const tokens = new Map<string, { token: string; expiresAt: number }>();

async function jwt(user: Address) {
  const cached = tokens.get(user);
  if (cached && cached.expiresAt - 60 > Date.now() / 1000) return cached.token;
  const res = await fetch(`${FLOW}/generate-token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ user_address: user }),
  });
  const json = (await res.json()) as { token?: string; expires_at?: number; error?: string };
  if (!res.ok || !json.token) throw new Error('Kuru is unavailable right now. Try again.');
  tokens.set(user, { token: json.token, expiresAt: json.expires_at ?? Date.now() / 1000 + 3600 });
  return json.token;
}

export async function quoteSpot(p: {
  user: Address;
  from: SpotToken;
  to: SpotToken;
  amount: string; // human units, e.g. "12.5"
  slippageBps?: number;
}): Promise<SpotQuote> {
  const amountIn = parseUnits(p.amount, p.from.decimals);
  if (amountIn <= 0n) throw new Error('Enter an amount.');
  const res = await fetch(`${FLOW}/quote`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${await jwt(p.user)}` },
    body: JSON.stringify({
      userAddress: p.user,
      tokenIn: p.from.address,
      tokenOut: p.to.address,
      amount: amountIn.toString(),
      slippageTolerance: p.slippageBps ?? DEFAULT_SLIPPAGE_BPS,
    }),
  });
  const json = (await res.json()) as {
    status?: string;
    message?: string;
    output?: string;
    minOut?: string;
    transaction?: { to?: string; calldata?: string; value?: string };
  };
  if (!res.ok || json.status !== 'success' || !json.output || !json.transaction?.to) {
    throw new Error(json.message ?? 'No route for this swap right now.');
  }
  const data = json.transaction.calldata ?? '';
  return {
    from: p.from,
    to: p.to,
    amountIn,
    out: BigInt(json.output),
    minOut: BigInt(json.minOut ?? json.output),
    tx: {
      to: getAddress(json.transaction.to),
      data: (data.startsWith('0x') ? data : `0x${data}`) as `0x${string}`,
      value: BigInt(json.transaction.value ?? '0'),
    },
  };
}

/** Approve (ERC-20 input only), then send Kuru Flow's prepared transaction from the user's wallet. */
export async function executeSpot(
  wallet: PocketWalletClient,
  q: SpotQuote,
  onStep?: (s: 'approving' | 'swapping') => void
): Promise<Hash> {
  const account = wallet.account;
  if (q.from.address !== NATIVE) {
    const allowance = await publicClient.readContract({
      address: q.from.address,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [account.address, q.tx.to],
    });
    if (allowance < q.amountIn) {
      onStep?.('approving');
      const gas = await publicClient.estimateContractGas({
        address: q.from.address,
        abi: erc20Abi,
        functionName: 'approve',
        args: [q.tx.to, q.amountIn],
        account,
      });
      const hash = await wallet.writeContract({
        address: q.from.address,
        abi: erc20Abi,
        functionName: 'approve',
        args: [q.tx.to, q.amountIn],
        gas: (gas * GAS_HEADROOM) / 100n,
      });
      await publicClient.waitForTransactionReceipt({ hash });
    }
  }
  onStep?.('swapping');
  const gas = await publicClient.estimateGas({ account, ...q.tx });
  const hash = await wallet.sendTransaction({ ...q.tx, gas: (gas * GAS_HEADROOM) / 100n });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status !== 'success')
    throw new Error('The swap reverted. Nothing was spent except gas.');
  return hash;
}

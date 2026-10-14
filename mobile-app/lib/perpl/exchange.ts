// Read-only exchange helpers. Transaction submission stays gated on Phase 5's round trip.
import { BaseError, ContractFunctionRevertedError, erc20Abi, getAddress, type Address } from 'viem';
import { publicClient } from '../chain';
import { config } from '../config';
import { ExchangeAbi } from './abi';

export async function readAccount(address: Address, blockNumber?: bigint) {
  try {
    return await publicClient.readContract({
      address: getAddress(config.perplExchange),
      abi: ExchangeAbi,
      functionName: 'getAccountByAddr',
      args: [address],
      blockNumber,
    });
  } catch (error) {
    const revert =
      error instanceof BaseError
        ? error.walk((cause) => cause instanceof ContractFunctionRevertedError)
        : undefined;
    if (
      revert instanceof ContractFunctionRevertedError &&
      revert.data?.errorName === 'AccountDoesNotExist'
    ) {
      return null;
    }
    // A connectivity or ABI failure must never be treated as a new account.
    throw error;
  }
}

export async function getAccountId(address: Address): Promise<bigint | null> {
  return (await readAccount(address))?.accountId ?? null;
}

// ---------------------------------------------------------------------------
// Live portfolio reads (Phase 4/6).

const AUSD_DECIMALS = 6; // verified 2026-10-14: AUSD and Perpl CNS both 6 dp
export const cnsToUsd = (cns: bigint) => Number(cns) / 10 ** AUSD_DECIMALS;
export const usdToCns = (usd: number) => BigInt(Math.round(usd * 10 ** AUSD_DECIMALS));

export const MONAD_USDC = getAddress('0x754704bc059f8c67012fed69bc8a327a5aafb603'); // 6 dp

export async function readWallet(address: Address) {
  const balanceOf = (token: Address) =>
    publicClient.readContract({
      address: token,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [address],
    });
  const [ausd, usdc, mon] = await Promise.all([
    balanceOf(getAddress(config.ausd)),
    balanceOf(MONAD_USDC),
    publicClient.getBalance({ address }),
  ]);
  return { ausd, usdc, mon };
}

export type ChainPosition = {
  perpId: number;
  side: 'long' | 'short';
  depositCNS: bigint;
  pricePNS: bigint;
  lotLNS: bigint;
  pnlCNS: bigint;
  markPNS: bigint;
};

/** Open positions for this account across the given markets (lot 0 = no position). */
export async function readPositions(
  accountId: bigint,
  perpIds: number[]
): Promise<ChainPosition[]> {
  const results = await Promise.all(
    perpIds.map((perpId) =>
      publicClient
        .readContract({
          address: getAddress(config.perplExchange),
          abi: ExchangeAbi,
          functionName: 'getPosition',
          args: [BigInt(perpId), accountId],
        })
        .then(([p, markPNS]) => ({ perpId, p, markPNS }))
        .catch(() => null)
    )
  );
  return results
    .filter((r): r is NonNullable<typeof r> => r !== null && r.p.lotLNS > 0n)
    .map(({ perpId, p, markPNS }) => ({
      perpId,
      side: p.positionType === 0 ? 'long' : 'short',
      depositCNS: p.depositCNS,
      pricePNS: p.pricePNS,
      lotLNS: p.lotLNS,
      pnlCNS: p.pnlCNS,
      markPNS,
    }));
}

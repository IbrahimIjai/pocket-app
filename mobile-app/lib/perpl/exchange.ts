// Read-only exchange helpers. Transaction submission stays gated on Phase 5's round trip.
import { BaseError, ContractFunctionRevertedError, getAddress, type Address } from 'viem';
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

// Read-only: no signer, private key, approval, deposit, or transaction submission.
import { BaseError, formatUnits, getAddress, isAddress, zeroAddress } from 'viem';
import { publicClient } from '../lib/chain';
import { config } from '../lib/config';
import { ExchangeAbi, ERC20Abi } from '../lib/perpl/abi';
import { readAccount } from '../lib/perpl/exchange';

async function main() {
  const response = await fetch(`${config.perplApiUrl}/v1/pub/context`);
  if (!response.ok) throw new Error(`Perpl context HTTP ${response.status}`);
  const context = (await response.json()) as {
    instances: { address: string; collateral_token_id: number; [key: string]: unknown }[];
    tokens: { id: number; address: string; symbol: string; decimals: number }[];
    markets: {
      id: number;
      perpetual_id: number;
      size_units: string;
      symbol: string;
      config: unknown;
    }[];
  };
  const btc = context.markets.find((m) => (m.size_units || m.symbol).toUpperCase() === 'BTC');
  if (!btc) throw new Error('BTC is missing from Perpl context.');
  const exchange = getAddress(config.perplExchange);
  const instance = context.instances.find(
    (i) => i.address.toLowerCase() === exchange.toLowerCase()
  );
  if (!instance) throw new Error('Configured exchange is missing from Perpl context.');
  const accountAddress = process.env.PROBE_ADDRESS || zeroAddress;
  if (!isAddress(accountAddress)) throw new Error('PROBE_ADDRESS must be an EVM address.');
  const blockNumber = await publicClient.getBlockNumber();
  if ((await publicClient.getChainId()) !== 143) throw new Error('RPC is not Monad mainnet.');
  const perpId = BigInt(btc.perpetual_id);
  const [perpetual, exchangeInfo, minOpen, takerFee, margins, withdraw, account, ausdDecimals] =
    await Promise.all([
      publicClient.readContract({
        address: exchange,
        abi: ExchangeAbi,
        functionName: 'getPerpetualInfo',
        args: [perpId],
        blockNumber,
      }),
      publicClient.readContract({
        address: exchange,
        abi: ExchangeAbi,
        functionName: 'getExchangeInfo',
        blockNumber,
      }),
      publicClient.readContract({
        address: exchange,
        abi: ExchangeAbi,
        functionName: 'getMinAccountOpenCNS',
        blockNumber,
      }),
      publicClient.readContract({
        address: exchange,
        abi: ExchangeAbi,
        functionName: 'getTakerFee',
        args: [perpId],
        blockNumber,
      }),
      publicClient.readContract({
        address: exchange,
        abi: ExchangeAbi,
        functionName: 'getMarginFractions',
        args: [perpId, 0n],
        blockNumber,
      }),
      publicClient.readContract({
        address: exchange,
        abi: ExchangeAbi,
        functionName: 'getWithdrawAllowanceData',
        args: [blockNumber],
        blockNumber,
      }),
      readAccount(accountAddress, blockNumber),
      publicClient.readContract({
        address: getAddress(config.ausd),
        abi: ERC20Abi,
        functionName: 'decimals',
        blockNumber,
      }),
    ]);
  const collateralDecimals = Number(exchangeInfo[3]);
  if (exchangeInfo[4].toLowerCase() !== config.ausd.toLowerCase()) {
    throw new Error('Configured AUSD does not match exchange collateral.');
  }
  const report = {
    observedAt: new Date().toISOString(),
    chainId: 143,
    blockNumber,
    exchange,
    marketId: btc.id,
    perpetualId: perpId,
    instance,
    apiBtcConfig: btc.config,
    perpetual,
    exchangeInfo,
    collateralDecimals,
    ausdDecimals,
    minAccountOpenCNS: minOpen,
    minAccountOpenUsd: formatUnits(minOpen, collateralDecimals),
    takerFeeMicros: takerFee,
    takerFeeRate: Number(takerFee) / 1_000_000,
    marginFractions: margins,
    // These are reciprocal leverage hundredths, not basis points.
    maxLeverage: Number(margins[0]) / 100,
    maintenanceMarginRatio: 100 / Number(margins[1]),
    withdrawAllowance: withdraw,
    accountAddress,
    account,
  };
  console.log(
    JSON.stringify(report, (_, value) => (typeof value === 'bigint' ? value.toString() : value), 2)
  );
}

main().catch((error: unknown) => {
  // RPC errors can contain authenticated URLs and request bodies.
  console.error(
    'Read-only Perpl probe failed:',
    error instanceof BaseError
      ? error.shortMessage
      : error instanceof Error
        ? error.message.replace(/https?:\/\/[^\s]+/g, '[RPC URL]')
        : 'unknown error'
  );
  process.exitCode = 1;
});

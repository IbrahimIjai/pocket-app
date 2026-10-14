/**
 * SPDX-License-Identifier: MIT
 * Perpl Exchange ABI copied from 0x70626a/PerplBot (package.json: MIT).
 * Source: https://github.com/0x70626a/PerplBot/blob/main/src/sdk/contracts/abi.ts
 * Upstream header: Contract ABIs for Perpl protocol.
 */
export { erc20Abi as ERC20Abi } from 'viem';

export const ExchangeAbi = [
  // Account management
  {
    type: 'function',
    name: 'createAccount',
    inputs: [{ name: 'amountCNS', type: 'uint256' }],
    outputs: [{ name: 'accountId', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'depositCollateral',
    inputs: [{ name: 'amountCNS', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'withdrawCollateral',
    inputs: [{ name: 'amountCNS', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  // Order execution
  {
    type: 'function',
    name: 'execOrder',
    inputs: [
      {
        name: 'orderDesc',
        type: 'tuple',
        components: [
          { name: 'orderDescId', type: 'uint256' },
          { name: 'perpId', type: 'uint256' },
          { name: 'orderType', type: 'uint8' },
          { name: 'orderId', type: 'uint256' },
          { name: 'pricePNS', type: 'uint256' },
          { name: 'lotLNS', type: 'uint256' },
          { name: 'expiryBlock', type: 'uint256' },
          { name: 'postOnly', type: 'bool' },
          { name: 'fillOrKill', type: 'bool' },
          { name: 'immediateOrCancel', type: 'bool' },
          { name: 'maxMatches', type: 'uint256' },
          { name: 'leverageHdths', type: 'uint256' },
          { name: 'lastExecutionBlock', type: 'uint256' },
          { name: 'amountCNS', type: 'uint256' },
          { name: 'maxSlippageBps', type: 'uint256' },
        ],
      },
    ],
    outputs: [
      {
        name: 'signature',
        type: 'tuple',
        components: [
          { name: 'perpId', type: 'uint256' },
          { name: 'orderId', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'execOrders',
    inputs: [
      {
        name: 'orderDescs',
        type: 'tuple[]',
        components: [
          { name: 'orderDescId', type: 'uint256' },
          { name: 'perpId', type: 'uint256' },
          { name: 'orderType', type: 'uint8' },
          { name: 'orderId', type: 'uint256' },
          { name: 'pricePNS', type: 'uint256' },
          { name: 'lotLNS', type: 'uint256' },
          { name: 'expiryBlock', type: 'uint256' },
          { name: 'postOnly', type: 'bool' },
          { name: 'fillOrKill', type: 'bool' },
          { name: 'immediateOrCancel', type: 'bool' },
          { name: 'maxMatches', type: 'uint256' },
          { name: 'leverageHdths', type: 'uint256' },
          { name: 'lastExecutionBlock', type: 'uint256' },
          { name: 'amountCNS', type: 'uint256' },
          { name: 'maxSlippageBps', type: 'uint256' },
        ],
      },
      { name: 'revertOnFail', type: 'bool' },
    ],
    outputs: [
      {
        name: 'signatures',
        type: 'tuple[]',
        components: [
          { name: 'perpId', type: 'uint256' },
          { name: 'orderId', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'nonpayable',
  },
  // Position management
  {
    type: 'function',
    name: 'increasePositionCollateral',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'amountCNS', type: 'uint256' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'requestDecreasePositionCollateral',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'amountCNS', type: 'uint256' },
      { name: 'clampToMaximum', type: 'bool' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'decreasePositionCollateral',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'accountId', type: 'uint256' },
      { name: 'impactAdjPricePNS', type: 'uint32' },
      { name: 'borrowMarginFracHdths', type: 'uint16' },
      { name: 'positionType', type: 'uint8' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'allowOrderForwarding',
    inputs: [{ name: 'allow', type: 'bool' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  // Liquidations
  {
    type: 'function',
    name: 'buyLiquidations',
    inputs: [
      {
        name: 'liquidationDescs',
        type: 'tuple[]',
        components: [
          { name: 'perpId', type: 'uint256' },
          { name: 'posAccountId', type: 'uint256' },
          { name: 'lotLNS', type: 'uint256' },
          { name: 'leverageHdths', type: 'uint256' },
          { name: 'limitPricePNS', type: 'uint256' },
          { name: 'maxSlippageBps', type: 'uint256' },
        ],
      },
      { name: 'revertOnFail', type: 'bool' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  // View functions
  {
    type: 'function',
    name: 'getAccountByAddr',
    inputs: [{ name: 'accountAddress', type: 'address' }],
    outputs: [
      {
        name: 'accountInfo',
        type: 'tuple',
        components: [
          { name: 'accountId', type: 'uint256' },
          { name: 'balanceCNS', type: 'uint256' },
          { name: 'lockedBalanceCNS', type: 'uint256' },
          { name: 'frozen', type: 'uint8' },
          { name: 'accountAddr', type: 'address' },
          {
            name: 'positions',
            type: 'tuple',
            components: [
              { name: 'bank1', type: 'uint256' },
              { name: 'bank2', type: 'uint256' },
              { name: 'bank3', type: 'uint256' },
              { name: 'bank4', type: 'uint256' },
            ],
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getAccountById',
    inputs: [{ name: 'accountId', type: 'uint256' }],
    outputs: [
      {
        name: 'accountInfo',
        type: 'tuple',
        components: [
          { name: 'accountId', type: 'uint256' },
          { name: 'balanceCNS', type: 'uint256' },
          { name: 'lockedBalanceCNS', type: 'uint256' },
          { name: 'frozen', type: 'uint8' },
          { name: 'accountAddr', type: 'address' },
          {
            name: 'positions',
            type: 'tuple',
            components: [
              { name: 'bank1', type: 'uint256' },
              { name: 'bank2', type: 'uint256' },
              { name: 'bank3', type: 'uint256' },
              { name: 'bank4', type: 'uint256' },
            ],
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getPosition',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'accountId', type: 'uint256' },
    ],
    outputs: [
      {
        name: 'positionInfo',
        type: 'tuple',
        components: [
          { name: 'accountId', type: 'uint256' },
          { name: 'nextNodeId', type: 'uint256' },
          { name: 'prevNodeId', type: 'uint256' },
          { name: 'positionType', type: 'uint8' },
          { name: 'depositCNS', type: 'uint256' },
          { name: 'pricePNS', type: 'uint256' },
          { name: 'lotLNS', type: 'uint256' },
          { name: 'entryBlock', type: 'uint256' },
          { name: 'pnlCNS', type: 'int256' },
          { name: 'deltaPnlCNS', type: 'int256' },
          { name: 'premiumPnlCNS', type: 'int256' },
        ],
      },
      { name: 'markPricePNS', type: 'uint256' },
      { name: 'markPriceValid', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getPerpetualInfo',
    inputs: [{ name: 'perpId', type: 'uint256' }],
    outputs: [
      {
        name: 'perpetualInfo',
        type: 'tuple',
        components: [
          { name: 'name', type: 'string' },
          { name: 'symbol', type: 'string' },
          { name: 'priceDecimals', type: 'uint256' },
          { name: 'lotDecimals', type: 'uint256' },
          { name: 'linkFeedId', type: 'bytes32' },
          { name: 'priceTolPer100K', type: 'uint256' },
          { name: 'marginTol', type: 'uint256' },
          { name: 'marginTolDecimals', type: 'uint256' },
          { name: 'refPriceMaxAgeSec', type: 'uint256' },
          { name: 'positionBalanceCNS', type: 'uint256' },
          { name: 'insuranceBalanceCNS', type: 'uint256' },
          { name: 'markPNS', type: 'uint256' },
          { name: 'markTimestamp', type: 'uint256' },
          { name: 'lastPNS', type: 'uint256' },
          { name: 'lastTimestamp', type: 'uint256' },
          { name: 'oraclePNS', type: 'uint256' },
          { name: 'oracleTimestampSec', type: 'uint256' },
          { name: 'longOpenInterestLNS', type: 'uint256' },
          { name: 'shortOpenInterestLNS', type: 'uint256' },
          { name: 'fundingStartBlock', type: 'uint256' },
          { name: 'fundingRatePct100k', type: 'int16' },
          { name: 'absFundingClampPctPer100K', type: 'uint256' },
          { name: 'status', type: 'uint8' },
          { name: 'basePricePNS', type: 'uint256' },
          { name: 'maxBidPriceONS', type: 'uint256' },
          { name: 'minBidPriceONS', type: 'uint256' },
          { name: 'maxAskPriceONS', type: 'uint256' },
          { name: 'minAskPriceONS', type: 'uint256' },
          { name: 'numOrders', type: 'uint256' },
          { name: 'ignOracle', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getExchangeInfo',
    inputs: [],
    outputs: [
      { name: 'balanceCNS', type: 'uint256' },
      { name: 'protocolBalanceCNS', type: 'uint256' },
      { name: 'recycleBalanceCNS', type: 'uint256' },
      { name: 'collateralDecimals', type: 'uint256' },
      { name: 'collateralToken', type: 'address' },
      { name: 'verifierProxy', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getTakerFee',
    inputs: [{ name: 'perpId', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getMakerFee',
    inputs: [{ name: 'perpId', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  // Trading events
  {
    type: 'event',
    name: 'OrderRequest',
    inputs: [
      { name: 'perpId', type: 'uint256', indexed: false },
      { name: 'accountId', type: 'uint256', indexed: false },
      { name: 'orderDescId', type: 'uint256', indexed: false },
      { name: 'orderId', type: 'uint256', indexed: false },
      { name: 'orderType', type: 'uint8', indexed: false },
      { name: 'pricePNS', type: 'uint256', indexed: false },
      { name: 'lotLNS', type: 'uint256', indexed: false },
      { name: 'expiryBlock', type: 'uint256', indexed: false },
      { name: 'postOnly', type: 'bool', indexed: false },
      { name: 'fillOrKill', type: 'bool', indexed: false },
      { name: 'immediateOrCancel', type: 'bool', indexed: false },
      { name: 'maxMatches', type: 'uint256', indexed: false },
      { name: 'leverageHdths', type: 'uint256', indexed: false },
      { name: 'lastExecutionBlock', type: 'uint256', indexed: false },
      { name: 'amountCNS', type: 'uint256', indexed: false },
      { name: 'maxSlippageBps', type: 'uint256', indexed: false },
      { name: 'gasLeft', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'OrderPlaced',
    inputs: [
      { name: 'orderId', type: 'uint256', indexed: false },
      { name: 'lotLNS', type: 'uint256', indexed: false },
      { name: 'lockedBalanceCNS', type: 'uint256', indexed: false },
      { name: 'amountCNS', type: 'int256', indexed: false },
      { name: 'balanceCNS', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'MakerOrderFilled',
    inputs: [
      { name: 'perpId', type: 'uint256', indexed: false },
      { name: 'accountId', type: 'uint256', indexed: false },
      { name: 'orderId', type: 'uint256', indexed: false },
      { name: 'pricePNS', type: 'uint256', indexed: false },
      { name: 'lotLNS', type: 'uint256', indexed: false },
      { name: 'feeCNS', type: 'uint256', indexed: false },
      { name: 'lockedBalanceCNS', type: 'uint256', indexed: false },
      { name: 'amountCNS', type: 'int256', indexed: false },
      { name: 'balanceCNS', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'OrderCancelled',
    inputs: [
      { name: 'lockedBalanceCNS', type: 'uint256', indexed: false },
      { name: 'amountCNS', type: 'int256', indexed: false },
      { name: 'balanceCNS', type: 'uint256', indexed: false },
    ],
  },
  // Order query functions
  {
    type: 'function',
    name: 'getOrderIdIndex',
    inputs: [{ name: 'perpId', type: 'uint256' }],
    outputs: [
      { name: 'root', type: 'uint256' },
      { name: 'leaves', type: 'uint256[]' },
      { name: 'numOrders', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getOrder',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'orderId', type: 'uint256' },
    ],
    outputs: [
      {
        name: 'order',
        type: 'tuple',
        components: [
          { name: 'accountId', type: 'uint32' },
          { name: 'orderType', type: 'uint8' },
          { name: 'priceONS', type: 'uint24' },
          { name: 'lotLNS', type: 'uint40' },
          { name: 'recycleFeeRaw', type: 'uint16' },
          { name: 'expiryBlock', type: 'uint32' },
          { name: 'leverageHdths', type: 'uint16' },
          { name: 'orderId', type: 'uint16' },
          { name: 'prevOrderId', type: 'uint16' },
          { name: 'nextOrderId', type: 'uint16' },
          { name: 'maxSlippageBps', type: 'uint16' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  // Orderbook view functions
  {
    type: 'function',
    name: 'getVolumeAtBookPrice',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'priceONS', type: 'uint256' },
    ],
    outputs: [
      { name: 'bids', type: 'uint256' },
      { name: 'expBids', type: 'uint256' },
      { name: 'asks', type: 'uint256' },
      { name: 'expAsks', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getNextPriceBelowWithOrders',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'priceONS', type: 'uint256' },
    ],
    outputs: [{ name: 'priceBelowONS', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getOrdersAtPriceLevel',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'priceONS', type: 'uint256' },
      { name: 'pageStartOrderId', type: 'uint256' },
      { name: 'ordersPerPage', type: 'uint256' },
    ],
    outputs: [
      {
        name: 'ordersAtPriceLevel',
        type: 'tuple[]',
        components: [
          { name: 'accountId', type: 'uint32' },
          { name: 'orderType', type: 'uint8' },
          { name: 'priceONS', type: 'uint24' },
          { name: 'lotLNS', type: 'uint40' },
          { name: 'recycleFeeRaw', type: 'uint16' },
          { name: 'expiryBlock', type: 'uint32' },
          { name: 'leverageHdths', type: 'uint16' },
          { name: 'orderId', type: 'uint16' },
          { name: 'prevOrderId', type: 'uint16' },
          { name: 'nextOrderId', type: 'uint16' },
          { name: 'maxSlippageBps', type: 'uint16' },
        ],
      },
      { name: 'numOrders', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  // ============ New View Functions (rc_v1.1.7) ============
  {
    type: 'function',
    name: 'getPositions',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'pageStartPositionId', type: 'uint256' },
      { name: 'positionsPerPage', type: 'uint256' },
    ],
    outputs: [
      {
        name: 'positions',
        type: 'tuple[]',
        components: [
          { name: 'accountId', type: 'uint256' },
          { name: 'nextNodeId', type: 'uint256' },
          { name: 'prevNodeId', type: 'uint256' },
          { name: 'positionType', type: 'uint8' },
          { name: 'depositCNS', type: 'uint256' },
          { name: 'pricePNS', type: 'uint256' },
          { name: 'lotLNS', type: 'uint256' },
          { name: 'entryBlock', type: 'uint256' },
          { name: 'pnlCNS', type: 'int256' },
          { name: 'deltaPnlCNS', type: 'int256' },
          { name: 'premiumPnlCNS', type: 'int256' },
        ],
      },
      { name: 'numPositions', type: 'uint256' },
      { name: 'refPricePNS', type: 'uint256' },
      { name: 'refPriceStatus', type: 'uint8' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getLiquidationInfo',
    inputs: [{ name: 'perpId', type: 'uint256' }],
    outputs: [
      {
        name: 'liquidationInfo',
        type: 'tuple',
        components: [
          { name: 'liqInsAmtPer100K', type: 'uint256' },
          { name: 'liqUserAmtPer100K', type: 'uint256' },
          { name: 'liqProtocolAmtPer100K', type: 'uint256' },
          { name: 'btlPriceThreshPer100K', type: 'uint256' },
          { name: 'btlInsAmtPer100K', type: 'uint256' },
          { name: 'btlUserAmtPer100K', type: 'uint256' },
          { name: 'btlBuyerAmtPer100K', type: 'uint256' },
          { name: 'btlProtocolAmtPer100K', type: 'uint256' },
          { name: 'btlRestrictBuyers', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getMarginFractions',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'lotLNS', type: 'uint256' },
    ],
    outputs: [
      { name: 'perpInitMarginFracHdths', type: 'uint256' },
      { name: 'perpMaintMarginFracHdths', type: 'uint256' },
      { name: 'dynamicInitMarginFracHdths', type: 'uint256' },
      { name: 'oiMaxLNS', type: 'uint256' },
      { name: 'unityDescentThreshHdths', type: 'uint256' },
      { name: 'overColDescentThreshHdths', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getFundingInterval',
    inputs: [],
    outputs: [{ name: 'fundingInterval', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getFundingSumAtBlock',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'blockNumber', type: 'uint256' },
    ],
    outputs: [
      { name: 'fundingSumPNS', type: 'int48' },
      { name: 'fundingEventBlock', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getPositionIds',
    inputs: [{ name: 'perpId', type: 'uint256' }],
    outputs: [
      { name: 'startNodeId', type: 'uint256' },
      { name: 'endNodeId', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'numberOfAccounts',
    inputs: [],
    outputs: [{ name: 'numAccounts', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getMinAccountOpenCNS',
    inputs: [],
    outputs: [{ name: 'minAccountOpenCNS', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getMinimumPostCNS',
    inputs: [],
    outputs: [{ name: 'minimumPostCNS', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getRecycleFeeCNS',
    inputs: [],
    outputs: [{ name: 'recycleFeeCNS', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isHalted',
    inputs: [],
    outputs: [{ name: 'halted', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getOrderLocks',
    inputs: [{ name: 'accountId', type: 'uint256' }],
    outputs: [
      {
        name: 'orderLocks',
        type: 'tuple[]',
        components: [
          { name: 'orderLockId', type: 'uint32' },
          { name: 'nextOrderLockId', type: 'uint32' },
          { name: 'prevOrderLockId', type: 'uint32' },
          { name: 'orderType', type: 'uint8' },
          { name: 'lotLNS', type: 'uint40' },
          { name: 'amountCNS', type: 'uint80' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getPerpOrderLocks',
    inputs: [
      { name: 'accountId', type: 'uint256' },
      { name: 'perpId', type: 'uint256' },
    ],
    outputs: [
      {
        name: 'perpOrderLocks',
        type: 'tuple[]',
        components: [
          { name: 'orderLockId', type: 'uint32' },
          { name: 'nextOrderLockId', type: 'uint32' },
          { name: 'prevOrderLockId', type: 'uint32' },
          { name: 'orderType', type: 'uint8' },
          { name: 'lotLNS', type: 'uint40' },
          { name: 'amountCNS', type: 'uint80' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getWithdrawAllowanceData',
    inputs: [{ name: 'blockNumber', type: 'uint256' }],
    outputs: [
      { name: 'allowanceCNS', type: 'uint256' },
      { name: 'expiryBlock', type: 'uint256' },
      { name: 'lastAllowanceBlock', type: 'uint256' },
      { name: 'cnsPerBlock', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  // ============ Admin/Keeper Functions (rc_v1.1.7) ============
  {
    type: 'function',
    name: 'autoDeleverage',
    inputs: [
      {
        name: 'adlDescs',
        type: 'tuple[]',
        components: [
          { name: 'perpId', type: 'uint256' },
          { name: 'posAccountId', type: 'uint256' },
          { name: 'sortedPositionIds', type: 'uint256[]' },
        ],
      },
      { name: 'revertOnFail', type: 'bool' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'forceClose',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'posAccountId', type: 'uint256' },
      { name: 'sortedPositionIds', type: 'uint256[]' },
      { name: 'revertOnFail', type: 'bool' },
    ],
    outputs: [{ name: 'success', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'liquidation',
    inputs: [
      {
        name: 'liquidationDesc',
        type: 'tuple',
        components: [
          { name: 'perpId', type: 'uint256' },
          { name: 'posAccountId', type: 'uint256' },
          { name: 'lotLNS', type: 'uint256' },
          { name: 'userProceedsToPosition', type: 'bool' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'liquidations',
    inputs: [
      {
        name: 'liquidationDescs',
        type: 'tuple[]',
        components: [
          { name: 'perpId', type: 'uint256' },
          { name: 'posAccountId', type: 'uint256' },
          { name: 'lotLNS', type: 'uint256' },
          { name: 'userProceedsToPosition', type: 'bool' },
        ],
      },
      { name: 'revertOnFail', type: 'bool' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'execPerpOps',
    inputs: [
      {
        name: 'operations',
        type: 'tuple[]',
        components: [
          { name: 'opDescId', type: 'uint256' },
          { name: 'perpId', type: 'uint256' },
          { name: 'opType', type: 'uint8' },
          { name: 'pricePNS', type: 'uint32' },
          { name: 'fundingRatePct100k', type: 'int256' },
          { name: 'allowOverwrite', type: 'bool' },
          { name: 'unverifiedReport', type: 'bytes' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  // ============ Exchange Errors (179 from dex-sdk rc_v1.1.7) ============
  {
    type: 'error',
    name: 'AbsValueExceedsMaximum',
    inputs: [
      { name: 'value', type: 'int256' },
      { name: 'maximum', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'AccountDoesNotExist',
    inputs: [{ name: 'accountAddress', type: 'address' }],
  },
  {
    type: 'error',
    name: 'AccountExists',
    inputs: [
      { name: 'sender', type: 'address' },
      { name: 'accountId', type: 'uint256' },
    ],
  },
  { type: 'error', name: 'AccountFrozen', inputs: [{ name: 'status', type: 'uint8' }] },
  {
    type: 'error',
    name: 'AccountIdAlreadySet',
    inputs: [
      { name: 'proposedAccountId', type: 'uint256' },
      { name: 'accountId', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'AccountIdDoesNotExist',
    inputs: [{ name: 'accountId', type: 'uint256' }],
  },
  { type: 'error', name: 'AddressBlocked', inputs: [{ name: 'addr', type: 'address' }] },
  {
    type: 'error',
    name: 'AmountExceedsAvailableBalance',
    inputs: [
      { name: 'amountCNS', type: 'uint256' },
      { name: 'availableBalanceCNS', type: 'uint256' },
      { name: 'balanceCNS', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'BankruptcyPriceExceedsReferencePrice',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'accountId', type: 'uint256' },
      { name: 'positionType', type: 'uint8' },
      { name: 'bankruptcyPricePNS', type: 'uint256' },
      { name: 'refPricePNS', type: 'uint256' },
      { name: 'refIsMark', type: 'bool' },
    ],
  },
  {
    type: 'error',
    name: 'BuyToLiquidateBuyerRestricted',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'buyer', type: 'address' },
    ],
  },
  {
    type: 'error',
    name: 'BuyToLiquidateParamsExceedUnity',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'insAmtPer100K', type: 'uint256' },
      { name: 'userAmtPer100K', type: 'uint256' },
      { name: 'buyerAmtPer100K', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'BuyToLiquidateSlippageExceeded',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'posAccountId', type: 'uint256' },
      { name: 'positionType', type: 'uint8' },
      { name: 'referencePricePNS', type: 'uint256' },
      { name: 'limitPricePNS', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'CancelExistingInvalidCloseOrders',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'accountId', type: 'uint256' },
      { name: 'lockedLotLNS', type: 'uint256' },
      { name: 'lockedPositionType', type: 'uint8' },
      { name: 'newPositionType', type: 'uint8' },
    ],
  },
  {
    type: 'error',
    name: 'CancelOrdersBeforeRemovingContract',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'numOrders', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'CannotChangeCloseOrderLocks',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'orderId', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'CantBuyToLiquidate',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'posAccountId', type: 'uint256' },
      { name: 'positionType', type: 'uint8' },
      { name: 'markPricePNS', type: 'uint256' },
      { name: 'refIsMark', type: 'bool' },
      { name: 'bsLiqPricePNS', type: 'uint256' },
      { name: 'liqPricePNS', type: 'uint256' },
      { name: 'bkptPricePNS', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'CantChangeCloseOrder',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'orderId', type: 'uint256' },
      { name: 'accountId', type: 'uint256' },
    ],
  },
  { type: 'error', name: 'CantClearNullOrderId', inputs: [] },
  {
    type: 'error',
    name: 'CantClearSlotsOnExistingPerp',
    inputs: [{ name: 'perpId', type: 'uint256' }],
  },
  {
    type: 'error',
    name: 'CantDeleverageAgainstOpposingPositions',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'accountId', type: 'uint256' },
      { name: 'forceClose', type: 'bool' },
      { name: 'positionType', type: 'uint8' },
      { name: 'deleveragePricePNS', type: 'uint256' },
      { name: 'sortedPositionIds', type: 'uint256[]' },
    ],
  },
  {
    type: 'error',
    name: 'CantLiquidateInsolventPos',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'posAccountId', type: 'uint256' },
      { name: 'positionType', type: 'uint8' },
      { name: 'lotSize', type: 'uint256' },
      { name: 'realizedPricePNS', type: 'uint256' },
      { name: 'realizedFmvCNS', type: 'int256' },
    ],
  },
  {
    type: 'error',
    name: 'CantLiquidatePosAboveMMR',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'posAccountId', type: 'uint256' },
      { name: 'positionType', type: 'uint8' },
      { name: 'refPricePNS', type: 'uint256' },
      { name: 'refIsMark', type: 'bool' },
      { name: 'liqPricePNS', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'CantLiquidatePosOnBookSevere',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'posAccountId', type: 'uint256' },
      { name: 'positionType', type: 'uint8' },
      { name: 'fillPricePNS', type: 'uint256' },
      { name: 'liqPricePNS', type: 'uint256' },
      { name: 'bkptPricePNS', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'CantPostOrder',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'accountId', type: 'uint256' },
      { name: 'orderType', type: 'uint8' },
      { name: 'pricePNS', type: 'uint256' },
      { name: 'lotLNS', type: 'uint256' },
      { name: 'reason', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'CantSettleMatchOrder',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'accountId', type: 'uint256' },
      { name: 'orderType', type: 'uint8' },
      { name: 'pricePNS', type: 'uint256' },
      { name: 'lotLNS', type: 'uint256' },
      { name: 'reason', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'ChangeExpiredOrderNeedsNewExpiry',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'orderId', type: 'uint256' },
      { name: 'accountId', type: 'uint256' },
      { name: 'expiryBlock', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'CloseOrderExceedsPosition',
    inputs: [
      { name: 'posLotLNS', type: 'uint256' },
      { name: 'orderLotLNS', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'CloseOrderPositionMismatch',
    inputs: [
      { name: 'positionType', type: 'uint8' },
      { name: 'orderType', type: 'uint8' },
    ],
  },
  { type: 'error', name: 'ContractCannotBeRemoved', inputs: [{ name: 'perpId', type: 'uint256' }] },
  {
    type: 'error',
    name: 'ContractDecimalsExceedResolution',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'collateralDecimals', type: 'uint256' },
      { name: 'priceDecimals', type: 'uint256' },
      { name: 'lotDecimals', type: 'uint256' },
    ],
  },
  { type: 'error', name: 'ContractDoesNotExist', inputs: [{ name: 'perpId', type: 'uint256' }] },
  {
    type: 'error',
    name: 'ContractIdExceedsMaximum',
    inputs: [{ name: 'perpId', type: 'uint256' }],
  },
  { type: 'error', name: 'ContractIdInUse', inputs: [{ name: 'perpId', type: 'uint256' }] },
  {
    type: 'error',
    name: 'ContractInsufficientFunds',
    inputs: [
      { name: 'balanceCNS', type: 'uint256' },
      { name: 'requestCNS', type: 'uint256' },
    ],
  },
  { type: 'error', name: 'ContractIsPaused', inputs: [{ name: 'perpId', type: 'uint256' }] },
  { type: 'error', name: 'ContractNotPaused', inputs: [{ name: 'perpId', type: 'uint256' }] },
  {
    type: 'error',
    name: 'CriticalMakerOrderSettlementFailed',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'accountId', type: 'uint256' },
      { name: 'orderId', type: 'uint256' },
      { name: 'pricePNS', type: 'uint256' },
      { name: 'lotLNS', type: 'uint256' },
      { name: 'resultCode', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'CriticalPerpetualInsolvent',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'perpPositionBalCNS', type: 'uint256' },
      { name: 'perpInsuranceBalCNS', type: 'uint256' },
      { name: 'amountCNS', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'CrossesBook',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'accountId', type: 'uint256' },
      { name: 'pricePNS', type: 'uint256' },
      { name: 'isBid', type: 'bool' },
      { name: 'minAskOrMaxBidPNS', type: 'uint256' },
      { name: 'maxOrdersChecked', type: 'bool' },
    ],
  },
  {
    type: 'error',
    name: 'DecreaseCollateralParamsDontExist',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'accountId', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'DecrementUnderflows',
    inputs: [
      { name: 'decrement', type: 'uint256' },
      { name: 'minuend', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'DeleveragePositionListEmpty',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'accountId', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'DifferenceExceedsInt256',
    inputs: [
      { name: 'value1', type: 'uint256' },
      { name: 'value2', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'DifferenceExceedsMaximum',
    inputs: [
      { name: 'value', type: 'uint256' },
      { name: 'decrement', type: 'uint256' },
      { name: 'maximum', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'ExceedsLastExecutionBlock',
    inputs: [{ name: 'lastExecutionBlock', type: 'uint256' }],
  },
  { type: 'error', name: 'ExchangeHalted', inputs: [] },
  {
    type: 'error',
    name: 'ExpiryTimestampOutsideRange',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'value', type: 'uint256' },
      { name: 'minimum', type: 'uint256' },
      { name: 'maximum', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'FundingEventSetTooEarly',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'blockNumber', type: 'uint256' },
      { name: 'fundingEventBlock', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'FundingExitBlockPreceedsEntryBlock',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'entryBlock', type: 'uint256' },
      { name: 'exitBlock', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'FundingIntervalIncorrect',
    inputs: [
      { name: 'proposed', type: 'uint256' },
      { name: 'required', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'FundingPaymentExceedsMaxPnsSevere',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'positionId', type: 'uint256' },
      { name: 'fundingPaymentPnsPerLot', type: 'uint256' },
      { name: 'startFundingBlock', type: 'uint256' },
      { name: 'exitFundingBlock', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'FundingPriceExceedsTol',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'fundingPricePNS', type: 'uint256' },
      { name: 'oraclePNS', type: 'uint256' },
      { name: 'tolerancePer100k', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'FundingSumAlreadySet',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'fundingEventBlock', type: 'uint256' },
      { name: 'storageIndex', type: 'uint256' },
      { name: 'fundingSumOffset', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'ImmediateOrderUnderMinimum',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'accountId', type: 'uint256' },
      { name: 'orderAmountCNS', type: 'uint256' },
      { name: 'minAmountCNS', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'IncompatibleCollateralToken',
    inputs: [
      { name: 'tokenAddress', type: 'address' },
      { name: 'tokenDecimals', type: 'uint256' },
      { name: 'expectedTokenDecimals', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'InitialMarginFractionEqualsOrExceedsMaintenance',
    inputs: [
      { name: 'initMarginFracHdths', type: 'uint256' },
      { name: 'maintMarginFracHdths', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'InsolventPositionCannotBeForcedClose',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'posAccountId', type: 'uint256' },
      { name: 'positionType', type: 'uint8' },
      { name: 'bankruptcyPricePNS', type: 'uint256' },
      { name: 'refPricePNS', type: 'uint256' },
      { name: 'refIsMark', type: 'bool' },
    ],
  },
  {
    type: 'error',
    name: 'InsufficentAmountToOpenAccount',
    inputs: [
      { name: 'sender', type: 'address' },
      { name: 'amountCNS', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'InsufficientFunds',
    inputs: [
      { name: 'balanceCNS', type: 'uint256' },
      { name: 'amountCNS', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'InsuficientFundsForRecycleFee',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'accountId', type: 'uint256' },
      { name: 'balanceCNS', type: 'uint256' },
      { name: 'lockedCNS', type: 'uint256' },
      { name: 'recycleFeeCNS', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'InvalidBankruptcyPrice',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'accountId', type: 'uint256' },
      { name: 'depositCNS', type: 'uint256' },
      { name: 'posPricePNS', type: 'uint256' },
      { name: 'liqLotLNS', type: 'uint256' },
      { name: 'premiumPnlCNS', type: 'int256' },
    ],
  },
  {
    type: 'error',
    name: 'InvalidBorrowFraction',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'proposedBorrowFracHdths', type: 'uint256' },
      { name: 'minMarginFracHdths', type: 'uint256' },
      { name: 'initMarginFracHdths', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'InvalidExpiryBlock',
    inputs: [
      { name: 'expiryBlock', type: 'uint256' },
      { name: 'blockNumber', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'InvalidLinkReportForContract',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'perpFeedId', type: 'bytes32' },
      { name: 'reportFeedId', type: 'bytes32' },
    ],
  },
  {
    type: 'error',
    name: 'InvalidLinkReportVersion',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'reportVersion', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'InvalidLiquidationPrice',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'accountId', type: 'uint256' },
      { name: 'depositCNS', type: 'uint256' },
      { name: 'posPricePNS', type: 'uint256' },
      { name: 'liqLotLNS', type: 'uint256' },
      { name: 'premiumPnlCNS', type: 'int256' },
    ],
  },
  {
    type: 'error',
    name: 'InvalidMinWithdrawLimit',
    inputs: [
      { name: 'minCNS', type: 'uint256' },
      { name: 'maxCNS', type: 'uint256' },
      { name: 'proposedCNS', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'InvalidOrderId',
    inputs: [
      { name: 'orderId', type: 'uint256' },
      { name: 'min', type: 'uint256' },
      { name: 'max', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'InvalidOrderLock',
    inputs: [
      { name: 'orderType', type: 'uint8' },
      { name: 'amountCNS', type: 'uint256' },
      { name: 'lotLNS', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'InvalidProposedInitFraction',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'proposedInitMarginFracHdths', type: 'uint256' },
      { name: 'initMarginFracHdths', type: 'uint256' },
      { name: 'maintMarginFracHdths', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'InvalidProposedMaintFraction',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'proposedMaintMarginFracHdths', type: 'uint256' },
      { name: 'maintMarginFracHdths', type: 'uint256' },
      { name: 'initMarginFracHdths', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'InvalidSynthPerpPrice',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'oraclePNS', type: 'uint256' },
      { name: 'oracleTimestamp', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'InvalidWithdrawLimitThousandths',
    inputs: [
      { name: 'minThousandths', type: 'uint256' },
      { name: 'maxThousandths', type: 'uint256' },
      { name: 'proposedThousandths', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'LeverageOutOfRange',
    inputs: [
      { name: 'levHdths', type: 'uint256' },
      { name: 'minLevHdths', type: 'uint256' },
      { name: 'maxLevHdths', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'LinkDsOracleNotConfigured',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'verifierProxy', type: 'address' },
      { name: 'linkDsFeedId', type: 'bytes32' },
    ],
  },
  {
    type: 'error',
    name: 'LinkDsPriceUninitialized',
    inputs: [{ name: 'perpId', type: 'uint256' }],
  },
  {
    type: 'error',
    name: 'LiquidationBuyerSettlementFailed',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'accountId', type: 'uint256' },
      { name: 'liquidationType', type: 'uint8' },
      { name: 'pricePNS', type: 'uint256' },
      { name: 'lotLNS', type: 'uint256' },
      { name: 'resultCode', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'LiquidationParamsExceedUnity',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'insAmtPer100K', type: 'uint256' },
      { name: 'liqAmtPer100K', type: 'uint256' },
      { name: 'userAmtPer100K', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'LotOutOfRange',
    inputs: [
      { name: 'lotLNS', type: 'uint256' },
      { name: 'minLotLNS', type: 'uint256' },
      { name: 'maxLotLNS', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'MarkExceedsTol',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'markPNS', type: 'uint256' },
      { name: 'synthPerpPricePNS', type: 'uint256' },
      { name: 'tolerancePer100k', type: 'uint256' },
    ],
  },
  { type: 'error', name: 'MarkPriceUninitialized', inputs: [{ name: 'perpId', type: 'uint256' }] },
  {
    type: 'error',
    name: 'MaximumAccountOrders',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'accountId', type: 'uint256' },
    ],
  },
  { type: 'error', name: 'NegativeDepositCheckFailedSevere', inputs: [] },
  { type: 'error', name: 'NoAccountsRemain', inputs: [] },
  { type: 'error', name: 'NotWhitelisted', inputs: [{ name: 'addr', type: 'address' }] },
  {
    type: 'error',
    name: 'NullOrderIdSpecifiedSevere',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'accountId', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'OpenInterestInequalSevere',
    inputs: [
      { name: 'longOiLNS', type: 'uint256' },
      { name: 'shortOiLNS', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'OracleAgeExceedsMax',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'oracleTimestamp', type: 'uint256' },
      { name: 'timestamp', type: 'uint256' },
      { name: 'maxAgeSec', type: 'uint256' },
    ],
  },
  { type: 'error', name: 'OrderBookFull', inputs: [{ name: 'perpId', type: 'uint256' }] },
  {
    type: 'error',
    name: 'OrderBookPriceOutOfRange',
    inputs: [
      { name: 'specifiedPriceONS', type: 'uint256' },
      { name: 'maxONS', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'OrderDoesNotExist',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'orderId', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'OrderDoesntExistSevere',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'orderId', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'OrderIdIsNotAtSpecifiedPriceLevel',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'specifiedPriceONS', type: 'uint256' },
      { name: 'orderId', type: 'uint256' },
      { name: 'orderPriceONS', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'OrderLockDoesntExistSevere',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'orderId', type: 'uint256' },
      { name: 'accountId', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'OrderLockExistsSevere',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'orderId', type: 'uint256' },
      { name: 'accountId', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'OrderPostFailed',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'accountId', type: 'uint256' },
      { name: 'orderType', type: 'uint8' },
      { name: 'priceONS', type: 'uint256' },
      { name: 'lotLNS', type: 'uint256' },
      { name: 'isBid', type: 'bool' },
    ],
  },
  {
    type: 'error',
    name: 'OrderSizeExceedsAvailableSize',
    inputs: [
      { name: 'orderLotLNS', type: 'uint256' },
      { name: 'availableLotLNS', type: 'uint256' },
      { name: 'positionLotLNS', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'PermissionlessCancelOrdersOutOfRange',
    inputs: [
      { name: 'permissionlessCancelMinOrders', type: 'uint256' },
      { name: 'minimum', type: 'uint256' },
      { name: 'maximum', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'PerpInsolvencyCheckFailedSevere',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'positionBalanceCNS', type: 'uint256' },
      { name: 'insuranceBalanceCNS', type: 'uint256' },
      { name: 'amountCNS', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'PositionAlreadyInListSevere',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'accountId', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'PositionCannotBeDeleveraged',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'accountId', type: 'uint256' },
      { name: 'forceClose', type: 'bool' },
      { name: 'positionType', type: 'uint8' },
      { name: 'adlLotLNS', type: 'uint256' },
      { name: 'delevPricePNS', type: 'uint256' },
      { name: 'refPricePNS', type: 'uint256' },
      { name: 'refIsMark', type: 'bool' },
    ],
  },
  {
    type: 'error',
    name: 'PositionDoesNotExist',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'accountId', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'PositionInsufficientFunds',
    inputs: [
      { name: 'unrealizedDeltaPnlCNS', type: 'int256' },
      { name: 'posValueAboveMarginCNS', type: 'int256' },
    ],
  },
  {
    type: 'error',
    name: 'PostOrderUnderMinimum',
    inputs: [
      { name: 'orderAmountCNS', type: 'uint256' },
      { name: 'minAmountCNS', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'PriceOutOfRange',
    inputs: [
      { name: 'pricePNS', type: 'uint256' },
      { name: 'minPricePNS', type: 'uint256' },
      { name: 'maxPricePNS', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'ProposedFeeExceedsMax',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'proposedFeePer100K', type: 'uint256' },
      { name: 'maxFeePer100K', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'ProposedFundingRateClampExceedsMax',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'proposedClampPctPer100k', type: 'uint256' },
      { name: 'maxClampPctPer100k', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'ProposedPriceAgeExceedsMax',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'proposedAgeSec', type: 'uint256' },
      { name: 'maxAgeSec', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'ProposedPriceTolExceedsMax',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'proposedTol', type: 'uint256' },
      { name: 'maxTolPer100k', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'ReferencePriceAgesExceedMax',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'markTimestamp', type: 'uint256' },
      { name: 'oracleTimestamp', type: 'uint256' },
      { name: 'timestamp', type: 'uint256' },
      { name: 'maxAgeSec', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'ReportAgeExceedsLastUpdate',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'lastUpdateTimestamp', type: 'uint256' },
      { name: 'reportValidFromTimestamp', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'ReportExpiresTooSoon',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'expiresAt', type: 'uint256' },
      { name: 'minRequired', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'ReportFromFuture',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'reportTimestamp', type: 'uint256' },
      { name: 'blockTimestamp', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'ReportPriceIsNegative',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'reportPrice', type: 'int256' },
    ],
  },
  {
    type: 'error',
    name: 'SenderIsNotAdministrator',
    inputs: [{ name: 'sender', type: 'address' }],
  },
  {
    type: 'error',
    name: 'SenderIsNotPositionAdministrator',
    inputs: [{ name: 'sender', type: 'address' }],
  },
  {
    type: 'error',
    name: 'SenderIsNotPriceAdministrator',
    inputs: [{ name: 'sender', type: 'address' }],
  },
  {
    type: 'error',
    name: 'SumExceedsMaximum',
    inputs: [
      { name: 'existingValue', type: 'uint256' },
      { name: 'increment', type: 'uint256' },
      { name: 'maximum', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'SyntheticPriceError',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'linkPricePNS', type: 'uint256' },
      { name: 'fundingRatePct100k', type: 'int256' },
    ],
  },
  {
    type: 'error',
    name: 'TakerOrderSettlementFailed',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'accountId', type: 'uint256' },
      { name: 'pricePNS', type: 'uint256' },
      { name: 'filledLotLNS', type: 'uint256' },
      { name: 'unfillableLotLNS', type: 'uint256' },
      { name: 'resultCode', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'TooManyBytesInName',
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'numBytes', type: 'uint256' },
      { name: 'maxBytes', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'TooManyBytesInSymbol',
    inputs: [
      { name: 'symbol', type: 'string' },
      { name: 'numBytes', type: 'uint256' },
      { name: 'maxBytes', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'UintIntSumIsNegative',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'addend', type: 'int256' },
    ],
  },
  { type: 'error', name: 'UnfreezeAccountNotPermitted', inputs: [] },
  {
    type: 'error',
    name: 'UnityMustBeLessThanOverColDescent',
    inputs: [
      { name: 'unityDescentThreshHdths', type: 'uint256' },
      { name: 'overColDescentThreshHdths', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'UnmatchedLotRemainsInFillOrKill',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'accountId', type: 'uint256' },
      { name: 'unmatchedLotLNS', type: 'uint256' },
    ],
  },
  { type: 'error', name: 'UnspecifiedCollateral', inputs: [] },
  {
    type: 'error',
    name: 'UnsupportedOperation',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'opType', type: 'uint8' },
    ],
  },
  { type: 'error', name: 'UnwindNotInitialized', inputs: [{ name: 'perpId', type: 'uint256' }] },
  {
    type: 'error',
    name: 'UnwindProcessInitialized',
    inputs: [{ name: 'perpId', type: 'uint256' }],
  },
  { type: 'error', name: 'UnwindProcessStarted', inputs: [{ name: 'perpId', type: 'uint256' }] },
  { type: 'error', name: 'UpdateOracleFailed', inputs: [{ name: 'perpId', type: 'uint256' }] },
  {
    type: 'error',
    name: 'ValueExceedsMaximum',
    inputs: [
      { name: 'value', type: 'uint256' },
      { name: 'maximum', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'ValueOutsideRange',
    inputs: [
      { name: 'value', type: 'uint256' },
      { name: 'minimum', type: 'uint256' },
      { name: 'maximum', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'WithdrawRateLimitExceeded',
    inputs: [
      { name: 'amountCNS', type: 'uint256' },
      { name: 'allowanceCNS', type: 'uint256' },
      { name: 'amountPerBlockCNS', type: 'uint256' },
      { name: 'expiryBlock', type: 'uint256' },
    ],
  },
  {
    type: 'error',
    name: 'WrongAccountForOrder',
    inputs: [
      { name: 'perpId', type: 'uint256' },
      { name: 'orderId', type: 'uint256' },
      { name: 'accountId', type: 'uint256' },
    ],
  },
] as const;

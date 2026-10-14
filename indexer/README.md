# Pocket × Envio: Perpl indexer

Envio HyperIndex indexer for the Perpl Exchange on Monad (`0x34B6…2a6F`, chain 143). It turns raw exchange events into per-account history that the Pocket app and dashboard query over GraphQL:

| Entity | What |
|---|---|
| `Account` | Perpl account id ↔ owner address, totals (deposits, withdrawals, realized P&L, funding, trades, liquidations) |
| `Trade` | One row per position lifecycle: side, leverage, entry/exit price, max collateral and size, realized P&L, funding, fees, open/close tx, status `open \| closed \| liquidated` |
| `Transfer` | Collateral deposits and withdrawals |

Events: `AccountCreated`, `CollateralDeposit`, `CollateralWithdrawal`, `PositionOpened(V2)`, `PositionIncreased(V2)`, `PositionDecreased`, `PositionClosed`, `PositionLiquidated`. ABI from the official [PerplFoundation/dex-sdk](https://github.com/PerplFoundation/dex-sdk).

```bash
bun install
bun run test      # simulated-event tests (no network)
cp .env.example .env   # set ENVIO_API_TOKEN (https://envio.dev/app/api-tokens) for HyperSync
bun run dev       # local indexer + GraphQL at http://localhost:8080
```

Example query (lowercase address):

```graphql
query History($address: String!) {
  Trade(where: { address: { _eq: $address } }, order_by: { openedAt: desc }, limit: 50) {
    perpId side status entryPricePNS exitPricePNS depositCNS lotLNS realizedPnlCNS fundingCNS feesCNS openedAt closedAt openTx closeTx
  }
}
```

Deploy on Envio's hosted service (connect this repo, root `indexer/`), then set `EXPO_PUBLIC_ENVIO_URL` in the app to the GraphQL endpoint.

## Carmine SDK

TypeScript utilities for interacting with the Carmine options AMM on Starknet. The SDK wraps on-chain contracts, off-chain data APIs, and governance helpers so you can quote premia, manage liquidity, and fetch analytics with minimal boilerplate.

### Install

```bash
pnpm add carmine-sdk
# or: npm install carmine-sdk / yarn add carmine-sdk
```

### Initialization

Before using any module, configure the RPC and API endpoints once in your app:

```ts
import { initCarmineSdk } from "carmine-sdk";

initCarmineSdk({
  rpcUrl: "https://your-starknet-rpc",
  apiUrl: "https://backend-api-url", // default
});
```

### Off-chain data (REST API)

```ts
import { CarmineApi } from "carmine-sdk/api";

const prices = await CarmineApi.livePrices();
const pool = await CarmineApi.poolState("0x…lpAddress");
const trades = await CarmineApi.tradeEvents(undefined, {
  limit: 20,
  offset: 0,
});
const liquidity = await CarmineApi.liquidityEvents("0x…user", {
  limit: 50,
  offset: 0,
});
```

### On-chain AMM helpers

```ts
import { CarmineAmm, ETH_USDC_CALL } from "carmine-sdk/core";

const options = CarmineAmm.getAllNonExpiredOptionsWithPremia(ETH_USDC_CALL);
const option = options[0];
const size = 1;
const slippage = 0.05; // 5% slippage
const premia = await option.getPremia(size, false); // size 1, isClosing false
const call = option.tradeOpen(size, premia, slipapge);

// user's wallet then executes "call"
```

### Governance

```ts
import { Governance, VoteStatus } from "carmine-sdk/governance";

const live = await Governance.getRichLiveProposals("0x…user");
const voteCall = Governance.voteCall(live[0].id, VoteStatus.Yay);
```

### Development

```bash
pnpm install
pnpm lint
pnpm test
pnpm build
```

The build uses `tsup` to emit CJS/ESM bundles with type declarations. Tests run with `vitest`.

import { liquidityPoolBySymbol } from "./../src/core/liquidityPool";
import { initSdk } from "../src/config";

initSdk();

async function run() {
  const lp = liquidityPoolBySymbol("STRK", "USDC", 0).unwrap();
  const status = await lp.fetchPoolStatus();
  console.log(lp.poolId, status);
}

run();

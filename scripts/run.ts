import { initSdk } from "../src/core/config";
import { ETH_USDC_CALL_ADDRESS } from "../src/core/constants";
import { CarmineApi } from "../src/api";

async function run() {
  const res = await CarmineApi.poolState(ETH_USDC_CALL_ADDRESS);
  console.log(res);
}

initSdk({
  rpcUrl: "http://51.195.57.196:6060",
  apiUrl: "http://localhost:3000",
});
run();

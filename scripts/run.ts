import { initSdk } from "../src/config";
import { tokenBySymbol } from "../src/core/token";

async function run() {
  console.time("f");
  const token = tokenBySymbol("ETH").unwrap();
  const balance = await token.fetchBalance(
    "0x3d1525605db970fa1724693404f5f64cba8af82ec4aab514e6ebd3dec4838ad"
  );
  console.timeEnd("f");
  console.log("ETH balance", balance);
}

initSdk();
run();

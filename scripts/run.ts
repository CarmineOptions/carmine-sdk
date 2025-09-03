import { getAmmContract, getAuxContract } from "./../src/rpc/contracts";
import { initSdk } from "../src/config";
import { num } from "starknet";
import { BTC_USDC_CALL_ADDRESS, BTC_USDC_PUT_ADDRESS } from "../src/constants";

initSdk();

async function run() {
  const amm = getAmmContract();
  const aux = getAuxContract();
  const lps = (await amm.get_all_lptoken_addresses()) as bigint[];

  const auxLps = [BigInt(BTC_USDC_CALL_ADDRESS), BigInt(BTC_USDC_PUT_ADDRESS)];

  for (let i = 0; i < lps.length; i++) {
    const lp = lps[i];
    if (auxLps.includes(lp)) {
      const key = `AUX ${num.toHex(lp)}`;
      console.time(key);
      const opts = (await aux.get_all_non_expired_options_with_premia(
        lp
      )) as unknown[];
      console.timeEnd(key);
    } else {
      const key = `AMM ${num.toHex(lp)}`;
      console.time(key);
      const opts = (await amm.get_all_non_expired_options_with_premia(
        lp
      )) as unknown[];
      console.timeEnd(key);
    }
  }
}

run();

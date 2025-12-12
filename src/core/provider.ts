import { RpcProvider } from "starknet";
import { getConfig } from "./config";

let provider: RpcProvider | undefined = undefined;

export const getProvider = (): RpcProvider => {
  if (provider) {
    return provider;
  }
  const cfg = getConfig();
  provider = new RpcProvider({ nodeUrl: cfg.rpcUrl });
  return provider;
};

export const resetProvider = () => {
  provider = undefined;
};

import { API_URL_DEFAULT, RPC_URL_DEFAULT } from "./constants";
import { SdkConfig } from "./types";

let config: Required<SdkConfig> | undefined;

export const initSdk = (cfg: SdkConfig = {}) => {
  config = {
    rpcUrl: cfg.rpcUrl ?? RPC_URL_DEFAULT,
    apiUrl: cfg.apiUrl ?? API_URL_DEFAULT,
  };
};

export const getConfig = (): Required<SdkConfig> => {
  if (!config) {
    throw new Error("Carmine SDK not initialized.");
  }
  return config;
};

export const resetConfig = () => {
  config = undefined;
};

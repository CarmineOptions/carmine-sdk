import { Token } from "./token";

export type Pool = {
  base: Token;
  quote: Token;
  address: string;
};

export type PoolId =
  | "eth-usdc-call"
  | "eth-usdc-put"
  | "btc-usdc-call"
  | "btc-usdc-put"
  | "eth-strk-call"
  | "eth-strk-put"
  | "strk-usdc-call"
  | "strk-usdc-put"
  | "ekubo-usdc-call"
  | "ekubo-usdc-put";

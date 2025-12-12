import {
  OptionSideLong,
  OptionSideShort,
  OptionTypeCall,
  OptionTypePut,
} from "./constants";
import { Cubit } from "../core/Cubit";

export const callType = 0;
export const putType = 1;
export const longSide = 0;
export const shortSide = 1;

export type TokenAddress = string;
export type U256 = { low: bigint; high: bigint };
export interface SdkConfig {
  rpcUrl?: string;
  apiUrl?: string;
}

export type OptionSide = typeof OptionSideLong | typeof OptionSideShort;
export type OptionType = typeof OptionTypeCall | typeof OptionTypePut;
export type Maturity = number;
export type Fixed = { mag: bigint; sign: boolean };

export type OptionDescriptor = {
  option_side: OptionSide;
  option_type: OptionType;
  maturity: Maturity;
  strike_price: Fixed;
  base_token_address: TokenAddress;
  quote_token_address: TokenAddress;
};
export type OptionPremia = {
  withoutFees: Cubit;
  withFees: Cubit;
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

export type PoolStatus = {
  unlocked: number;
  locked: number;
  position: number;
  tvl: number;
};

export type AllNonExpired = {
  option: OptionDescriptor;
  premia: Fixed;
};

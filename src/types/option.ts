import { TokenAddress } from "./common";

export type OptionSide = 0 | 1;
export type OptionType = 0 | 1;
export type Maturity = number;
export type Fixed = {
  mag: bigint;
  sign: boolean;
};

export type OptionDescriptor = {
  optionSide: OptionSide;
  optionType: OptionType;
  maturity: Maturity;
  strikePrice: Fixed;
  baseTokenAddress: TokenAddress;
  quoteTokenAddress: TokenAddress;
};
export type OptionPremia = {
  withoutFees: Fixed;
  withFees: Fixed;
};
export interface OptionStruct {
  base_token_address: string;
  maturity: number;
  option_side: number;
  option_type: number;
  quote_token_address: string;
  strike_price: Fixed;
}

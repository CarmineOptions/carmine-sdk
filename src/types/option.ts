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

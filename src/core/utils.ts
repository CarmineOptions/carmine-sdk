import { BigNumberish } from "starknet";
import Decimal from "./decimal";

export const sanitizeAddress = (address: string): string => {
  const lower = address.trim().toLowerCase();
  const withoutPrefix = lower.startsWith("0x") ? lower.slice(2) : lower;
  const stripped = withoutPrefix.replace(/^0+/, "");

  // If address was all zeroes, keep single zero
  const normalized = stripped.length === 0 ? "0" : stripped;

  return `0x${normalized}`;
};

export const lpTokensToHumanReadable = (tokens: BigNumberish): number => {
  const factor = new Decimal(10).pow(18);
  const dec = new Decimal(tokens);
  return dec.div(factor).toNumber();
};

import { BigNumberish } from "starknet";
import Decimal from "./decimal";
import { U256 } from "./types";
import { u256ToDecimal } from "./conversions";

export const sanitizeAddress = (address: string): string => {
  const lower = address.trim().toLowerCase();
  const withoutPrefix = lower.startsWith("0x") ? lower.slice(2) : lower;
  const stripped = withoutPrefix.replace(/^0+/, "");

  // If address was all zeroes, keep single zero
  const normalized = stripped.length === 0 ? "0" : stripped;

  return `0x${normalized}`;
};

export const lpTokensToHumanReadable = (
  tokens: BigNumberish | U256
): number => {
  const factor = new Decimal(10).pow(18);

  if (typeof tokens === "object") {
    if (tokens?.low !== undefined && tokens?.high !== undefined) {
      const dec = u256ToDecimal(tokens);
      return dec.div(factor).toNumber();
    }
    // unreachable
    throw Error("Invalid raw size format");
  }
  const dec = new Decimal(tokens);
  return dec.div(factor).toNumber();
};

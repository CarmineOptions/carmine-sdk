import { Fixed } from "../types/option";
import { MATH_64_BASE } from "../constants";
import { U256 } from "../types/common";
import Decimal from "../utils/decimal";

export const fixedToNumber = (n: Fixed): number => {
  const d = new Decimal(n.mag);
  const val = d.div(MATH_64_BASE).toNumber();

  if (n.sign) {
    return -val;
  }
  return val;
};

export const numberToFixed = (n: number): Fixed => {
  const sign = n < 0;
  const mag = BigInt(
    new Decimal(Math.abs(n)).mul(MATH_64_BASE).round().toString()
  );

  return {
    mag,
    sign,
  };
};

export const decimalToBigInt = (d: Decimal): bigint => {
  return BigInt(d.toFixed(0));
};

export const decimalToU256 = (n: Decimal): U256 => {
  const value = decimalToBigInt(n);
  const mask = (1n << 128n) - 1n;

  const low = value & mask;
  const high = value >> 128n;

  return { low, high };
};

export const u256ToDecimal = ({ low, high }: U256): Decimal => {
  const base = new Decimal(2).pow(128); // 2^128
  return new Decimal(high.toString())
    .mul(base)
    .add(new Decimal(low.toString()));
};

export const u256ToBigInt = ({ low, high }: U256): bigint => {
  const base = new Decimal(2).pow(128); // 2^128
  const dec = new Decimal(high.toString())
    .mul(base)
    .add(new Decimal(low.toString()));
  return decimalToBigInt(dec);
};

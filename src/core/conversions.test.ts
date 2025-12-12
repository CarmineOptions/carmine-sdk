import { describe, it, expect } from "vitest";
import { decimalToU256, fixedToNumber, u256ToDecimal } from "./conversions";
import Decimal from "./decimal";
import { U256 } from "./types";

describe("Fixed conversions", () => {
  it("converts positive Fixed", () => {
    expect(fixedToNumber({ mag: 44272185776902923878400n, sign: false })).toBe(
      2400
    );
  });

  it("converts negative Fixed", () => {
    expect(fixedToNumber({ mag: 44272185776902923878400n, sign: true })).toBe(
      -2400
    );
  });
});

describe("decimal to u256", () => {
  it("zero", () => {
    const value = new Decimal(0);
    const u256 = decimalToU256(value);

    expect(u256.high).toBe(0n);
    expect(u256.low).toBe(0n);
  });

  it("small number", () => {
    const value = new Decimal(123456789);
    const u256 = decimalToU256(value);

    expect(u256.high).toBe(0n);
    expect(u256.low).toBe(123456789n);
  });

  it("large number", () => {
    const value = new Decimal(2).pow(128).mul(123).add(123456789);
    const u256 = decimalToU256(value);

    expect(u256.high).toBe(123n);
    expect(u256.low).toBe(123456789n);
  });

  it("very large number", () => {
    const value = new Decimal(
      "100000000000000000000000000000000000000000000000000"
    );
    const u256 = decimalToU256(value);

    // mod(100000000000000000000000000000000000000000000000000, 2^128) - calculated on WolframAlpha
    const expectedLow = 194599656488044247630319707454198251520n;
    // floor(100000000000000000000000000000000000000000000000000 / 2^128) - calculated on WolframAlpha
    const expectedHigh = 293873587705n;

    expect(u256.high).toBe(expectedHigh);
    expect(u256.low).toBe(expectedLow);
  });
});

describe("u256 to decimal", () => {
  it("zero", () => {
    const u256: U256 = { high: 0n, low: 0n };
    const dec = u256ToDecimal(u256);

    expect(dec.eq(0)).toBe(true);
  });

  it("small number", () => {
    const u256: U256 = { high: 0n, low: 123456789n };
    const dec = u256ToDecimal(u256);

    expect(dec.eq(123456789)).toBe(true);
  });

  it("large number", () => {
    const u256: U256 = { high: 123n, low: 123456789n };
    const dec = u256ToDecimal(u256);
    const expected = new Decimal(2).pow(128).mul(123).add(123456789);

    expect(dec.eq(expected)).toBe(true);
  });

  it("very large number", () => {
    // mod(100000000000000000000000000000000000000000000000000, 2^128) - calculated on WolframAlpha
    const low = 194599656488044247630319707454198251520n;
    // floor(100000000000000000000000000000000000000000000000000 / 2^128) - calculated on WolframAlpha
    const high = 293873587705n;
    const u256: U256 = { high, low };
    const dec = u256ToDecimal(u256);
    const expected = new Decimal(
      "100000000000000000000000000000000000000000000000000"
    );
    expect(dec.eq(expected)).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { Cubit } from "./Cubit";
import { MATH_64_BASE } from "./constants";

describe("Cubit", () => {
  it("creates from positive fixed components", () => {
    const mag = BigInt(MATH_64_BASE.toString());
    const cubit = new Cubit({ mag, sign: false });

    expect(cubit.mag).toBe(mag);
    expect(cubit.sign).toBe(false);
    expect(cubit.val).toBe(1);
  });

  it("creates from negative fixed components", () => {
    const mag = BigInt(MATH_64_BASE.mul(3).toString());
    const cubit = new Cubit({ mag, sign: true });

    expect(cubit.mag).toBe(mag);
    expect(cubit.sign).toBe(true);
    expect(cubit.val).toBe(-3);
  });

  it("exposes asObject with bigint mag and boolean sign", () => {
    const cubit = new Cubit({ mag: 10n, sign: true });

    expect(cubit.asObject).toEqual({ mag: 10n, sign: true });
  });

  it("exposes asArray with raw components", () => {
    const cubit = new Cubit({ mag: 5n, sign: false });

    expect(cubit.asArray).toEqual([5n, false]);
  });
});

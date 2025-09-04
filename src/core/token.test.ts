import { describe, it, expect } from "vitest";
import { tokenByAddress, tokenBySymbol } from "./token";
import {
  AMM_ADDRESS,
  BTC_ADDRESS,
  ETH_ADDRESS,
  USDC_ADDRESS,
} from "../constants";

describe("Tokens", () => {
  it("by valid address", () => {
    const tMaybe = tokenByAddress(ETH_ADDRESS);

    expect(tMaybe.isSome).toBe(true);

    const t = tMaybe.unwrap();

    expect(t.symbol).toBe("ETH");
    expect(t.decimals).toBe(18);
    expect(t.name).toBe("ethereum");
  });

  it("by invalid address", () => {
    const tMaybe = tokenByAddress("0x012345abc");

    expect(tMaybe.isNone).toBe(true);
  });

  it("by valid symbol", () => {
    const tMaybe = tokenBySymbol("USDC");

    expect(tMaybe.isSome).toBe(true);

    const t = tMaybe.unwrap();

    expect(t.symbol).toBe("USDC");
    expect(t.decimals).toBe(6);
    expect(t.name).toBe("usd-coin");
  });

  it("by invalid symbol", () => {
    const tMaybe = tokenBySymbol("MYCOIN");

    expect(tMaybe.isNone).toBe(true);
  });

  it("ETH approve", () => {
    const t = tokenBySymbol("ETH").unwrap();

    const call = t.approveCalldata(1.23);

    expect(call).toStrictEqual({
      calldata: [AMM_ADDRESS, "1230000000000000000", "0"],
      contractAddress: ETH_ADDRESS,
      entrypoint: "approve",
    });
  });

  it("USDC approve", () => {
    const t = tokenBySymbol("USDC").unwrap();

    const call = t.approveCalldata(1.23);

    expect(call).toStrictEqual({
      calldata: [AMM_ADDRESS, "1230000", "0"],
      contractAddress: USDC_ADDRESS,
      entrypoint: "approve",
    });
  });

  it("BTC approve", () => {
    const t = tokenBySymbol("wBTC").unwrap();

    const call = t.approveCalldata(1.23);

    expect(call).toStrictEqual({
      calldata: [AMM_ADDRESS, "123000000", "0"],
      contractAddress: BTC_ADDRESS,
      entrypoint: "approve",
    });
  });

  it("raw-human readable conversions", () => {
    const t = tokenBySymbol("ETH").unwrap();

    const num = 12.345;
    const u256 = {
      high: 0n,
      low: 12345000000000000000n,
    };

    expect(t.toRaw(num)).toStrictEqual(u256);
    expect(t.toHumanReadable(u256)).toStrictEqual(num);

    const num_1 = 0.000000000000000001;
    const u256_1 = {
      high: 0n,
      low: 1n,
    };

    expect(t.toRaw(num_1)).toStrictEqual(u256_1);
    expect(t.toHumanReadable(u256_1)).toStrictEqual(num_1);
  });
});

import { describe, it, expect } from "vitest";
import {
  AMM_ADDRESS,
  BTC_ADDRESS,
  ETH_ADDRESS,
  USDC_ADDRESS,
} from "../constants";
import {
  LiquidityPool,
  liquidityPoolByAddress,
  liquidityPoolBySymbol,
} from "./liquidityPool";
import { callType, longSide, putType } from "./common";
import { tokenByAddress, tokenBySymbol } from "./token";

describe("LiquidityPool class", () => {
  it("correctly creates class", () => {
    const lp = new LiquidityPool(ETH_ADDRESS, USDC_ADDRESS, callType);

    expect(lp.optionType).toBe(callType);
    expect(lp.base.symbol).toBe("ETH");
    expect(lp.quote.symbol).toBe("USDC");
    expect(lp.underlying.symbol).toBe("ETH");
    expect(lp.isCall).toBe(true);
    expect(lp.isPut).toBe(false);
  });

  it("correctly creates wBTC pool", () => {
    const lp = new LiquidityPool(BTC_ADDRESS, USDC_ADDRESS, callType);

    expect(lp.optionType).toBe(callType);
    expect(lp.base.symbol).toBe("wBTC");
    expect(lp.quote.symbol).toBe("USDC");
    expect(lp.isCall).toBe(true);
    expect(lp.isPut).toBe(false);
  });

  it("deposit call", () => {
    const lp = liquidityPoolByAddress(
      ETH_ADDRESS,
      USDC_ADDRESS,
      callType
    ).unwrap();
    const call = lp.depositCall(5);
    const expectedSize = 5 * 10 ** 18;

    expect(call).toStrictEqual({
      calldata: [
        ETH_ADDRESS,
        USDC_ADDRESS,
        ETH_ADDRESS,
        callType.toString(),
        expectedSize.toString(),
        "0",
      ],
      contractAddress: AMM_ADDRESS,
      entrypoint: "deposit_liquidity",
    });
  });

  it("withdraw call", () => {
    const lp = liquidityPoolByAddress(
      ETH_ADDRESS,
      USDC_ADDRESS,
      callType
    ).unwrap();
    const call = lp.withdrawCall(5);
    const expectedSize = 5 * 10 ** 18;

    expect(call).toStrictEqual({
      calldata: [
        ETH_ADDRESS,
        USDC_ADDRESS,
        ETH_ADDRESS,
        callType.toString(),
        expectedSize.toString(),
        "0",
      ],
      contractAddress: AMM_ADDRESS,
      entrypoint: "withdraw_liquidity",
    });
  });

  it("fails for non-existent pool", () => {
    expect(() => new LiquidityPool(USDC_ADDRESS, USDC_ADDRESS, 0)).toThrow();
  });

  it("lp by address", () => {
    const lp = liquidityPoolByAddress(ETH_ADDRESS, USDC_ADDRESS, 0).unwrap();

    expect(lp.isCall).toBe(true);
    expect(lp.base.symbol).toBe("ETH");
    expect(lp.quote.symbol).toBe("USDC");
  });

  it("lp by symbol", () => {
    const lp = liquidityPoolBySymbol("ETH", "USDC", 1).unwrap();

    expect(lp.isPut).toBe(true);
    expect(lp.base.symbol).toBe("ETH");
    expect(lp.quote.symbol).toBe("USDC");
  });

  it("call LP", () => {
    const lp = new LiquidityPool(ETH_ADDRESS, USDC_ADDRESS, callType);

    expect(lp.isCall).toBe(true);
    expect(lp.isPut).toBe(false);
    expect(lp.underlying).toStrictEqual(tokenByAddress(ETH_ADDRESS).unwrap());
  });

  it("put LP", () => {
    const lp = new LiquidityPool(ETH_ADDRESS, USDC_ADDRESS, putType);

    expect(lp.isCall).toBe(false);
    expect(lp.isPut).toBe(true);
    expect(lp.underlying).toStrictEqual(tokenByAddress(USDC_ADDRESS).unwrap());
  });
});

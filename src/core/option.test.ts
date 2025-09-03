import { describe, it, expect, vi } from "vitest";
import { OptionDescriptor } from "../types/option";
import { Option } from "./option";
import { ETH_ADDRESS, USDC_ADDRESS } from "../constants";

const TEST_OPTION_DESCRIPTOR: OptionDescriptor = {
  optionSide: 1,
  optionType: 0,
  maturity: 1760054399,
  strikePrice: {
    mag: 90389045961176802918400n,
    sign: false,
  },
  baseTokenAddress: ETH_ADDRESS,
  quoteTokenAddress: USDC_ADDRESS,
};

const MOCK_TIMESTAMP = 1735686000;

describe("Option class", () => {
  it("correctly creates class from descriptor", () => {
    const optionClass = new Option(TEST_OPTION_DESCRIPTOR);

    expect(optionClass.strikePrice).toBe(4900);
    expect(optionClass.maturity).toBe(TEST_OPTION_DESCRIPTOR.maturity);
    expect(optionClass.optionSide).toBe(TEST_OPTION_DESCRIPTOR.optionSide);
    expect(optionClass.optionType).toBe(TEST_OPTION_DESCRIPTOR.optionType);
    expect(optionClass.base.symbol).toBe("ETH");
    expect(optionClass.quote.symbol).toBe("USDC");
    expect(optionClass.strikePriceRaw).toEqual(
      TEST_OPTION_DESCRIPTOR.strikePrice
    );
    expect(optionClass.isCall).toBe(true);
    expect(optionClass.isPut).toBe(false);
    expect(optionClass.isLong).toBe(false);
    expect(optionClass.isShort).toBe(true);
  });

  it("long call", () => {
    const optionClass = new Option({
      ...TEST_OPTION_DESCRIPTOR,
      optionSide: 0,
      optionType: 0,
    });

    expect(optionClass.isCall).toBe(true);
    expect(optionClass.isPut).toBe(false);
    expect(optionClass.isLong).toBe(true);
    expect(optionClass.isShort).toBe(false);
  });

  it("short call", () => {
    const optionClass = new Option({
      ...TEST_OPTION_DESCRIPTOR,
      optionSide: 1,
      optionType: 0,
    });

    expect(optionClass.isCall).toBe(true);
    expect(optionClass.isPut).toBe(false);
    expect(optionClass.isLong).toBe(false);
    expect(optionClass.isShort).toBe(true);
  });

  it("long put", () => {
    const optionClass = new Option({
      ...TEST_OPTION_DESCRIPTOR,
      optionSide: 0,
      optionType: 1,
    });

    expect(optionClass.isCall).toBe(false);
    expect(optionClass.isPut).toBe(true);
    expect(optionClass.isLong).toBe(true);
    expect(optionClass.isShort).toBe(false);
  });

  it("short put", () => {
    const optionClass = new Option({
      ...TEST_OPTION_DESCRIPTOR,
      optionSide: 1,
      optionType: 1,
    });

    expect(optionClass.isCall).toBe(false);
    expect(optionClass.isPut).toBe(true);
    expect(optionClass.isLong).toBe(false);
    expect(optionClass.isShort).toBe(true);
  });

  it("trade settle calldata", () => {
    const optionClass = new Option(TEST_OPTION_DESCRIPTOR);
    const calldata = optionClass.tradeSettleCalldata(1);
    expect(calldata).toStrictEqual([
      TEST_OPTION_DESCRIPTOR.optionType.toString(),
      TEST_OPTION_DESCRIPTOR.strikePrice.mag.toString(),
      TEST_OPTION_DESCRIPTOR.strikePrice.sign ? "1" : "0",
      TEST_OPTION_DESCRIPTOR.maturity.toString(),
      TEST_OPTION_DESCRIPTOR.optionSide.toString(),
      "1000000000000000000",
      TEST_OPTION_DESCRIPTOR.quoteTokenAddress,
      TEST_OPTION_DESCRIPTOR.baseTokenAddress,
    ]);
  });

  it("trade calldata", () => {
    const mockedNow = new Date(MOCK_TIMESTAMP * 1000); // fixed time
    vi.useFakeTimers();
    vi.setSystemTime(mockedNow);

    const optionClass = new Option(TEST_OPTION_DESCRIPTOR);
    const deadline = 300; // 5 mins
    const calldata = optionClass.tradeCalldata(1.54321, 0.0123, deadline);
    expect(calldata).toStrictEqual([
      TEST_OPTION_DESCRIPTOR.optionType.toString(),
      TEST_OPTION_DESCRIPTOR.strikePrice.mag.toString(),
      TEST_OPTION_DESCRIPTOR.strikePrice.sign ? "1" : "0",
      TEST_OPTION_DESCRIPTOR.maturity.toString(),
      TEST_OPTION_DESCRIPTOR.optionSide.toString(),
      "1543210000000000000",
      TEST_OPTION_DESCRIPTOR.quoteTokenAddress,
      TEST_OPTION_DESCRIPTOR.baseTokenAddress,
      "226894952106627485",
      "0",
      (MOCK_TIMESTAMP + deadline).toString(),
    ]);
  });

  it("option calldata", () => {
    const optionClass = new Option(TEST_OPTION_DESCRIPTOR);
    expect(optionClass.optCalldata).toStrictEqual([
      TEST_OPTION_DESCRIPTOR.optionSide.toString(),
      TEST_OPTION_DESCRIPTOR.maturity.toString(),
      TEST_OPTION_DESCRIPTOR.strikePrice.mag.toString(),
      TEST_OPTION_DESCRIPTOR.strikePrice.sign ? "1" : "0",
      TEST_OPTION_DESCRIPTOR.quoteTokenAddress,
      TEST_OPTION_DESCRIPTOR.baseTokenAddress,
      TEST_OPTION_DESCRIPTOR.optionType.toString(),
    ]);
  });
});

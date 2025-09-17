import { describe, it, expect, vi, beforeEach } from "vitest";
import { OptionDescriptor } from "../types/option";
import { Option } from "./option";
import { ETH_ADDRESS, USDC_ADDRESS } from "../constants";
import { getAmmContract } from "../rpc/contracts";
import { callType, longSide, putType, shortSide } from "./common";

const TEST_OPTION_DESCRIPTOR: OptionDescriptor = {
  optionSide: shortSide,
  optionType: callType,
  maturity: 1760054399,
  strikePrice: {
    mag: 90389045961176802918400n,
    sign: false,
  },
  baseTokenAddress: ETH_ADDRESS,
  quoteTokenAddress: USDC_ADDRESS,
};

const MOCK_TIMESTAMP = 1735686000;

const MOCK_FIXED_0 = {
  mag: 9476871643369720057n,
  sign: false,
};

const MOCK_FIXED_1 = {
  mag: 9761177792670811658n,
  sign: false,
};

vi.mock("../rpc/contracts", () => {
  return {
    getAmmContract: vi.fn(),
  };
});

describe("Option class", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

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

  it("option struct", () => {
    const optionClass = new Option(TEST_OPTION_DESCRIPTOR);
    expect(optionClass.optStruct).toStrictEqual({
      option_side: TEST_OPTION_DESCRIPTOR.optionSide,
      option_type: TEST_OPTION_DESCRIPTOR.optionType,
      maturity: TEST_OPTION_DESCRIPTOR.maturity,
      strike_price: TEST_OPTION_DESCRIPTOR.strikePrice,
      base_token_address: TEST_OPTION_DESCRIPTOR.baseTokenAddress,
      quote_token_address: TEST_OPTION_DESCRIPTOR.quoteTokenAddress,
    });
  });

  it("retrieves correct premia", async () => {
    const mockAmm = {
      get_total_premia: vi.fn().mockResolvedValue({
        0: MOCK_FIXED_0,
        1: MOCK_FIXED_1,
      }),
    };

    // @ts-expect-error mocking imported function
    getAmmContract.mockReturnValue(mockAmm);

    const option = new Option(TEST_OPTION_DESCRIPTOR);

    const result = await option.getPremiaRaw(1.23, false);

    expect(result.isSome).toBe(true);
    expect(result.unwrap()).toEqual({
      withoutFees: MOCK_FIXED_0,
      withFees: MOCK_FIXED_1,
    });
  });

  it("premia with slippage", () => {
    // long call
    const opt = new Option({ ...TEST_OPTION_DESCRIPTOR, optionSide: longSide });
    const premia = 0.123;
    const slippage = 0.02;

    expect(opt.addSlippageToPremia(premia, 0.02, false)).toBe(
      premia * (1 + slippage)
    );
    expect(opt.addSlippageToPremia(premia, 0.02, true)).toBe(
      premia * (1 - slippage)
    );
    expect(() => opt.addSlippageToPremia(premia, 0.9, false)).toThrow(
      "Out of bounds slippage"
    );
    expect(() => opt.addSlippageToPremia(premia, -0.001, false)).toThrow(
      "Out of bounds slippage"
    );

    // short call
    const opt2 = new Option(TEST_OPTION_DESCRIPTOR);
    expect(opt2.addSlippageToPremia(premia, 0.02, false)).toBe(
      premia * (1 - slippage)
    );
    expect(opt2.addSlippageToPremia(premia, 0.02, true)).toBe(
      premia * (1 + slippage)
    );
  });

  it("to approve", () => {
    const premia = 0.123;
    const slippage = 0.02;
    const size = 3.21;

    // long call
    const longCall = new Option({
      ...TEST_OPTION_DESCRIPTOR,
      optionSide: longSide,
      optionType: callType,
    });
    const expectedLongCall = longCall.base.toRaw(premia * (1 + slippage));
    expect(
      longCall.toApprove(size, premia, slippage, false),
      "Long Call"
    ).toStrictEqual(expectedLongCall);

    // short call
    const shortCall = new Option({
      ...TEST_OPTION_DESCRIPTOR,
      optionSide: shortSide,
      optionType: callType,
    });
    const expectedShortCall = shortCall.base.toRaw(
      size - premia * (1 - slippage)
    );
    expect(
      shortCall.toApprove(size, premia, slippage, false),
      "Short Call"
    ).toStrictEqual(expectedShortCall);

    // long put
    const longPut = new Option({
      ...TEST_OPTION_DESCRIPTOR,
      optionSide: longSide,
      optionType: putType,
    });
    const expectedLongPut = longPut.quote.toRaw(premia * (1 + slippage));
    expect(longPut.toApprove(size, premia, slippage, false)).toStrictEqual(
      expectedLongPut
    );

    // short put
    const shortPut = new Option({
      ...TEST_OPTION_DESCRIPTOR,
      optionSide: shortSide,
      optionType: putType,
    });
    const expectedShortPut = shortPut.quote.toRaw(
      size * shortPut.strikePrice - premia * (1 - slippage)
    );
    expect(shortPut.toApprove(size, premia, slippage, false)).toStrictEqual(
      expectedShortPut
    );
  });

  it("trade open", () => {
    const premia = 0.123;
    const slippage = 0.02;
    const size = 3.21;

    const opt = new Option({
      ...TEST_OPTION_DESCRIPTOR,
      optionSide: longSide,
      optionType: callType,
    });
    expect(opt.tradeOpen(size, premia, slippage)).toStrictEqual([
      {
        calldata: [
          "0x47472e6755afc57ada9550b6a3ac93129cc4b5f98f51c73e0644d129fd208d9",
          "125460000000000000",
          "0",
        ],
        contractAddress:
          "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        entrypoint: "approve",
      },
      {
        calldata: [
          "0",
          "90389045961176802918400",
          "0",
          "1760054399",
          "0",
          "3210000000000000000",
          "0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
          "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          "2314328511487600346",
          "0",
          "1735686300",
        ],
        contractAddress:
          "0x47472e6755afc57ada9550b6a3ac93129cc4b5f98f51c73e0644d129fd208d9",
        entrypoint: "trade_open",
      },
    ]);
  });

  it("trade close", () => {
    const premia = 0.123;
    const slippage = 0.02;
    const size = 3.21;

    const opt = new Option({
      ...TEST_OPTION_DESCRIPTOR,
      optionSide: longSide,
      optionType: callType,
    });
    expect(opt.tradeClose(size, premia, slippage)).toStrictEqual([
      {
        calldata: [
          "0x47472e6755afc57ada9550b6a3ac93129cc4b5f98f51c73e0644d129fd208d9",
          "120540000000000000",
          "0",
        ],
        contractAddress:
          "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
        entrypoint: "approve",
      },
      {
        calldata: [
          "0",
          "90389045961176802918400",
          "0",
          "1760054399",
          "0",
          "3210000000000000000",
          "0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
          "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
          "2223570530644949352",
          "0",
          "1735686300",
        ],
        contractAddress:
          "0x47472e6755afc57ada9550b6a3ac93129cc4b5f98f51c73e0644d129fd208d9",
        entrypoint: "trade_close",
      },
    ]);
  });

  it("trade settle", () => {
    const opt = new Option({
      ...TEST_OPTION_DESCRIPTOR,
      optionSide: longSide,
      optionType: callType,
    });
    expect(opt.tradeSettle(3.21)).toStrictEqual({
      calldata: [
        "0",
        "90389045961176802918400",
        "0",
        "1760054399",
        "0",
        "3210000000000000000",
        "0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
        "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
      ],
      contractAddress:
        "0x47472e6755afc57ada9550b6a3ac93129cc4b5f98f51c73e0644d129fd208d9",
      entrypoint: "trade_settle",
    });
  });
});

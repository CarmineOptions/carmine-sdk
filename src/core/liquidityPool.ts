import { Fixed, OptionSide, OptionType } from "../types/option";
import { TokenAddress } from "../types/common";
import {
  AMM_ADDRESS,
  BTC_ADDRESS,
  BTC_USDC_CALL_ADDRESS,
  BTC_USDC_PUT_ADDRESS,
  EKUBO_ADDRESS,
  EKUBO_USDC_CALL_ADDRESS,
  EKUBO_USDC_PUT_ADDRESS,
  ETH_ADDRESS,
  ETH_STRK_CALL_ADDRESS,
  ETH_STRK_PUT_ADDRESS,
  ETH_USDC_CALL_ADDRESS,
  ETH_USDC_PUT_ADDRESS,
  STRK_ADDRESS,
  STRK_USDC_CALL_ADDRESS,
  STRK_USDC_PUT_ADDRESS,
  USDC_ADDRESS,
} from "../constants";
import { PoolId, PoolStatus } from "../types/pool";
import { Token, tokenByAddress } from "./token";
import { Maybe } from "./maybe";
import { Call, Calldata } from "starknet";
import { callType, putType } from "./common";
import Decimal from "../utils/decimal";
import { getAmmContract, getAuxContract } from "../rpc/contracts";
import { abi } from "../rpc/abi";
import { fixedToNumber } from "./conversions";

const POOL_ID_TO_ADDRESS_MAP: Record<PoolId, string> = {
  "eth-usdc-call": ETH_USDC_CALL_ADDRESS,
  "eth-usdc-put": ETH_USDC_PUT_ADDRESS,
  "btc-usdc-call": BTC_USDC_CALL_ADDRESS,
  "btc-usdc-put": BTC_USDC_PUT_ADDRESS,
  "eth-strk-call": ETH_STRK_CALL_ADDRESS,
  "eth-strk-put": ETH_STRK_PUT_ADDRESS,
  "strk-usdc-call": STRK_USDC_CALL_ADDRESS,
  "strk-usdc-put": STRK_USDC_PUT_ADDRESS,
  "ekubo-usdc-call": EKUBO_USDC_CALL_ADDRESS,
  "ekubo-usdc-put": EKUBO_USDC_PUT_ADDRESS,
};

const getPoolId = (base: Token, quote: Token, type: OptionType): PoolId => {
  const b = base.symbol === "wBTC" ? "btc" : base.symbol.toLowerCase();
  const q = quote.symbol === "wBTC" ? "btc" : quote.symbol.toLowerCase();
  const t = type === 0 ? "call" : "put";

  return `${b}-${q}-${t}` as PoolId;
};

const getLpAddress = (id: PoolId): Maybe<string> => {
  return new Maybe(POOL_ID_TO_ADDRESS_MAP[id]);
};

export class LiquidityPool {
  public readonly base: Token;
  public readonly quote: Token;
  public readonly optionType: OptionType;
  public readonly lpAddress: string;
  public readonly poolId: PoolId;

  constructor(
    baseAddress: TokenAddress,
    quoteAddress: TokenAddress,
    type: OptionType
  ) {
    this.base = tokenByAddress(baseAddress).unwrap();
    this.quote = tokenByAddress(quoteAddress).unwrap();
    this.optionType = type;
    this.poolId = getPoolId(this.base, this.quote, this.optionType);
    this.lpAddress = getLpAddress(this.poolId).unwrap();
  }

  get isCall(): boolean {
    return this.optionType === callType;
  }
  get isPut(): boolean {
    return this.optionType === putType;
  }
  get underlying(): Token {
    return this.isCall ? this.base : this.quote;
  }
  get factor(): Decimal {
    return new Decimal(10).pow(new Decimal(this.underlying.decimals));
  }

  lpCalldata(size: number): Calldata {
    const rawSize = new Decimal(size).mul(this.factor).floor();
    return [
      this.underlying.address,
      this.quote.address,
      this.base.address,
      this.optionType.toString(),
      rawSize.toString(),
      "0", // u256 high - this will cause problem for number >= 2^128
    ];
  }

  lpCall(size: number, entrypoint: string): Call {
    return {
      contractAddress: AMM_ADDRESS,
      entrypoint,
      calldata: this.lpCalldata(size),
    };
  }

  depositCall(size: number): Call {
    return this.lpCall(size, "deposit_liquidity");
  }

  deposit(size: number): Call[] {
    const approve = this.underlying.tokenApproveCall(size);

    return [approve, this.lpCall(size, "deposit_liquidity")];
  }

  withdraw(size: number): Call {
    return this.lpCall(size, "withdraw_liquidity");
  }

  private async fetchNonExpiredOptionsWithPremiaRawData() {
    if (this.base.symbol === "wBTC") {
      const aux = getAuxContract().typedv2(abi);
      return aux.get_all_non_expired_options_with_premia(this.lpAddress);
    }
    const amm = getAmmContract().typedv2(abi);
    return amm.get_all_non_expired_options_with_premia(this.lpAddress);
  }

  async fetchNonExpiredOptionsWithPremia() {
    // avoid circular import
    const { OptionWithPremia } = await import("./option");

    const rawData = await this.fetchNonExpiredOptionsWithPremiaRawData();
    return rawData.map(
      ({ option, premia }) =>
        new OptionWithPremia(
          {
            optionSide: Number(option.option_side) as OptionSide,
            optionType: this.optionType,
            maturity: Number(option.maturity),
            strikePrice: {
              mag: BigInt(option.strike_price.mag),
              sign: option.strike_price.sign,
            },
            baseTokenAddress: this.base.address,
            quoteTokenAddress: this.quote.address,
          },
          { mag: BigInt(premia.mag), sign: premia.sign }
        )
    );
  }

  async fetchUnlockedCapital(): Promise<number> {
    const amm = getAmmContract().typedv2(abi);
    const res = (await amm.get_unlocked_capital(this.lpAddress)) as bigint;
    const humanReadable = this.underlying.toHumanReadable(res);
    return humanReadable;
  }

  async fetchLockedCapital(): Promise<number> {
    const amm = getAmmContract().typedv2(abi);
    const res = (await amm.get_pool_locked_capital(this.lpAddress)) as bigint;
    const humanReadable = this.underlying.toHumanReadable(res);
    return humanReadable;
  }

  async fetchPoolPosition(): Promise<number> {
    const amm = getAmmContract().typedv2(abi);
    const res = (await amm.get_value_of_pool_position(this.lpAddress)) as Fixed;
    const humanReadable = fixedToNumber(res);
    return humanReadable;
  }

  async fetchPoolTvl(): Promise<number> {
    const promises = [this.fetchUnlockedCapital(), this.fetchPoolPosition()];
    const res = await Promise.all(promises);
    return res[0] + res[1];
  }

  async fetchPoolStatus(): Promise<PoolStatus> {
    const promises = [
      this.fetchUnlockedCapital(),
      this.fetchLockedCapital(),
      this.fetchPoolPosition(),
    ];
    const res = await Promise.all(promises);
    const [unlocked, locked, position] = res;
    const tvl = unlocked + position;
    return { unlocked, locked, position, tvl };
  }
}

export const allLiquidityPools: LiquidityPool[] = [
  new LiquidityPool(ETH_ADDRESS, USDC_ADDRESS, 0),
  new LiquidityPool(ETH_ADDRESS, USDC_ADDRESS, 1),
  new LiquidityPool(BTC_ADDRESS, USDC_ADDRESS, 0),
  new LiquidityPool(BTC_ADDRESS, USDC_ADDRESS, 1),
  new LiquidityPool(STRK_ADDRESS, USDC_ADDRESS, 0),
  new LiquidityPool(STRK_ADDRESS, USDC_ADDRESS, 1),
  new LiquidityPool(EKUBO_ADDRESS, USDC_ADDRESS, 0),
  new LiquidityPool(EKUBO_ADDRESS, USDC_ADDRESS, 1),
  new LiquidityPool(ETH_ADDRESS, STRK_ADDRESS, 0),
  new LiquidityPool(ETH_ADDRESS, STRK_ADDRESS, 1),
];

export const liquidityPoolByAddress = (
  baseAddress: TokenAddress,
  quoteAddress: TokenAddress,
  type: OptionType
): Maybe<LiquidityPool> => {
  const biB = BigInt(baseAddress);
  const biQ = BigInt(quoteAddress);
  return new Maybe(
    allLiquidityPools.find(
      (lp) =>
        BigInt(lp.base.address) === biB &&
        BigInt(lp.quote.address) === biQ &&
        lp.optionType === type
    )
  );
};

export const liquidityPoolBySymbol = (
  baseSymbol: string,
  quoteSymbol: string,
  type: OptionType
): Maybe<LiquidityPool> => {
  return new Maybe(
    allLiquidityPools.find(
      (lp) =>
        lp.base.symbol === baseSymbol &&
        lp.quote.symbol === quoteSymbol &&
        lp.optionType === type
    )
  );
};

import { Calldata } from "starknet";
import {
  Fixed,
  Maturity,
  OptionDescriptor,
  OptionPremia,
  OptionSide,
  OptionStruct,
} from "../types/option";
import { fixedToNumber, numberToFixed } from "./conversions";
import { LiquidityPool } from "./liquidityPool";
import { Maybe, None, Some } from "./maybe";
import { getAmmContract } from "../rpc/contracts";
import { abi } from "../rpc/abi";

export class Option extends LiquidityPool {
  public readonly optionSide: OptionSide;
  public readonly maturity: Maturity;
  public readonly strikePrice: number;
  public readonly strikePriceRaw: Fixed;

  constructor(o: OptionDescriptor) {
    super(o.baseTokenAddress, o.quoteTokenAddress, o.optionType);
    this.optionSide = o.optionSide;
    this.maturity = o.maturity;
    this.strikePriceRaw = o.strikePrice;
    this.strikePrice = fixedToNumber(this.strikePriceRaw);
  }

  private toRawSize(n: number): bigint {
    return this.base.toRawBigInt(n);
  }
  get isLong(): boolean {
    return this.optionSide === 0;
  }
  get isShort(): boolean {
    return this.optionSide === 1;
  }
  get optStruct(): OptionStruct {
    return {
      option_side: this.optionSide,
      maturity: this.maturity,
      strike_price: this.strikePriceRaw,
      quote_token_address: this.quote.address,
      base_token_address: this.base.address,
      option_type: this.optionType,
    };
  }

  tradeSettleCalldata(size: number): Calldata {
    return [
      this.optionType.toString(),
      this.strikePriceRaw.mag.toString(10),
      "0", // Fixed sign - always positiove
      this.maturity.toString(),
      this.optionSide.toString(),
      this.toRawSize(size).toString(),
      this.quote.address,
      this.base.address,
    ];
  }
  tradeCalldata(
    size: number,
    premiaLimit: number,
    deadlineLimit = 3600
  ): Calldata {
    const tsNow = Math.round(new Date().getTime() / 1000);
    const deadline = tsNow + deadlineLimit;
    const premiaFixed = numberToFixed(premiaLimit);

    return [
      ...this.tradeSettleCalldata(size),
      premiaFixed.mag.toString(),
      "0", // Fixed sign - always positive
      deadline.toString(),
    ];
  }
  async getPremiaRaw(
    size: number,
    isClosing: boolean
  ): Promise<Maybe<OptionPremia>> {
    const amm = getAmmContract().typedv2(abi);
    const rawSize = this.toRawSize(size);
    const res = await amm
      .get_total_premia(this.optStruct, rawSize, isClosing)
      .catch(() => null);

    if (res === null) {
      return None();
    }

    // response is [Fixed without fees, Fixed with fees]
    const withoutFees: Fixed = res[0] as Fixed;
    const withFees: Fixed = res[1] as Fixed;

    return Some({ withFees, withoutFees });
  }
  async getPremia(size: number, isClosing: boolean): Promise<Maybe<number>> {
    const rawPremiaMaybe = await this.getPremiaRaw(size, isClosing);

    if (rawPremiaMaybe.isNone) {
      return None();
    }

    const rawPremia = rawPremiaMaybe.unwrap();
    return Some(fixedToNumber(rawPremia.withFees));
  }
  async getPremiaWithoutFees(
    size: number,
    isClosing: boolean
  ): Promise<Maybe<number>> {
    const rawPremiaMaybe = await this.getPremiaRaw(size, isClosing);

    if (rawPremiaMaybe.isNone) {
      return None();
    }

    const rawPremia = rawPremiaMaybe.unwrap();
    return Some(fixedToNumber(rawPremia.withoutFees));
  }
}

export class OptionWithPremia extends Option {
  public readonly premia: number;
  public readonly premiaRaw: Fixed;

  constructor(o: OptionDescriptor, premia: Fixed) {
    super(o);
    this.premiaRaw = premia;
    this.premia = fixedToNumber(premia);
  }
}

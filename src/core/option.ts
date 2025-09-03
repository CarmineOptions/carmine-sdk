import { Calldata } from "starknet";
import { Fixed, Maturity, OptionDescriptor, OptionSide } from "../types/option";
import Decimal from "../utils/decimal";
import { fixedToNumber, numberToFixed } from "./conversions";
import { LiquidityPool } from "./liquidityPool";

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

  private toRawSize(n: number): string {
    const base = new Decimal(10).pow(new Decimal(this.base.decimals));
    const v = new Decimal(n).mul(base);

    return v.toString();
  }
  get isLong(): boolean {
    return this.optionSide === 0;
  }
  get isShort(): boolean {
    return this.optionSide === 1;
  }
  get optCalldata(): Calldata {
    return [
      this.optionSide.toString(),
      this.maturity.toString(),
      this.strikePriceRaw.mag.toString(10),
      "0", // Fixed sign - always positiove
      this.quote.address,
      this.base.address,
      this.optionType.toString(),
    ];
  }
  tradeSettleCalldata(size: number): Calldata {
    return [
      this.optionType.toString(),
      this.strikePriceRaw.mag.toString(10),
      "0", // Fixed sign - always positiove
      this.maturity.toString(),
      this.optionSide.toString(),
      this.toRawSize(size),
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

import { Call, Calldata } from "starknet";
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
import Decimal from "../utils/decimal";
import { U256 } from "../types/common";
import { longSide, shortSide } from "./common";
import { AMM_ADDRESS } from "../constants";

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
    return this.optionSide === longSide;
  }
  get isShort(): boolean {
    return this.optionSide === shortSide;
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

  addSlippageToPremia(
    premia: number,
    slippage: number,
    isClosing: boolean
  ): number {
    if (slippage > 0.6 || slippage < 0) {
      throw Error("Out of bounds slippage");
    }

    const premiaDec = new Decimal(premia);

    // opening Long or closing Short
    if (this.isLong !== isClosing) {
      return premiaDec.mul(1 + slippage).toNumber();
    }

    // opening Short or closing Long
    return premiaDec.mul(1 - slippage).toNumber();
  }
  toApprove(
    size: number,
    premia: number,
    slippage: number,
    isClosing: boolean
  ): U256 {
    const premiaWithSlippage = this.addSlippageToPremia(
      premia,
      slippage,
      isClosing
    );

    if (this.isLong) {
      // Long Call and Long Put, approve premia with slippage
      return this.underlying.toRaw(premiaWithSlippage);
    }
    if (this.isCall) {
      // Short Call, approve locked capital minus premia with slippage
      return this.underlying.toRaw(size - premiaWithSlippage);
    }

    // Short Put - locked capital minus premia with slippage
    // locked capital is size * strike price
    return this.underlying.toRaw(size * this.strikePrice - premiaWithSlippage);
  }
  approveCall(
    size: number,
    premia: number,
    slippage: number,
    isClosing: boolean
  ): Call {
    const approveSize = this.toApprove(size, premia, slippage, isClosing);

    return this.underlying.tokenApproveCallRaw(approveSize);
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
    deadlineLimit: number
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
  tradeOpen(
    size: number,
    premia: number,
    slippage: number,
    deadlineLimit = 300
  ): Call[] {
    const isClosing = false;
    const premiaWithSlippage = this.addSlippageToPremia(
      premia,
      slippage,
      isClosing
    );
    const approve = this.approveCall(size, premia, slippage, isClosing);
    const trade = {
      entrypoint: "trade_open",
      contractAddress: AMM_ADDRESS,
      calldata: this.tradeCalldata(size, premiaWithSlippage, deadlineLimit),
    };
    return [approve, trade];
  }
  tradeClose(
    size: number,
    premia: number,
    slippage: number,
    deadlineLimit = 300
  ): Call[] {
    const isClosing = true;
    const premiaWithSlippage = this.addSlippageToPremia(
      premia,
      slippage,
      isClosing
    );
    const approve = this.approveCall(size, premia, slippage, isClosing);
    const trade = {
      entrypoint: "trade_close",
      contractAddress: AMM_ADDRESS,
      calldata: this.tradeCalldata(size, premiaWithSlippage, deadlineLimit),
    };
    return [approve, trade];
  }
  tradeSettle(size: number): Call {
    return {
      entrypoint: "trade_settle",
      contractAddress: AMM_ADDRESS,
      calldata: this.tradeSettleCalldata(size),
    };
  }
  async getPremiaRaw(
    size: number,
    isClosing: boolean
  ): Promise<Maybe<OptionPremia>> {
    const amm = getAmmContract();
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

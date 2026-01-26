import { Call, Calldata, Contract } from "starknet";
import {
  Fixed,
  Maturity,
  OptionDescriptor,
  OptionDescriptorWithLpAddress,
  OptionPremia,
  OptionSide,
  OptionType,
  U256,
} from "./types";
import { numberToFixed } from "./conversions";
import { LiquidityPool, liquidityPoolByLpAddress } from "./liquidityPool";
import Decimal from "./decimal";
import { longSide, shortSide } from "./types";
import { AMM_ADDRESS, OptionSideLong } from "./constants";
import { Cubit } from "./Cubit";
import { CarmineAmm } from "./CarmineAmm";
import { erc20Abi } from "./erc20Abi";
import { getProvider } from "./provider";

export class Option extends LiquidityPool {
  public readonly optionSide: OptionSide;
  public readonly maturity: Maturity;
  public readonly strikePrice: Cubit;

  constructor(o: OptionDescriptor) {
    super(
      o.base_token_address,
      o.quote_token_address,
      Number(o.option_type) as OptionType,
    );
    this.optionSide = Number(o.option_side) as OptionSide;
    this.maturity = Number(o.maturity);
    this.strikePrice = new Cubit(o.strike_price);
  }

  private toRawSize(n: number): bigint {
    return this.base.toRawBigInt(n);
  }
  get isFresh(): boolean {
    return this.maturity * 1000 > new Date().getTime();
  }
  get isExpired(): boolean {
    return !this.isFresh;
  }
  get isLong(): boolean {
    return this.optionSide === longSide;
  }
  get isShort(): boolean {
    return this.optionSide === shortSide;
  }
  get descriptor(): OptionDescriptor {
    return {
      option_side: this.optionSide,
      maturity: this.maturity,
      strike_price: this.strikePrice.asObject,
      quote_token_address: this.quote.address,
      base_token_address: this.base.address,
      option_type: this.optionType,
    };
  }
  get optionId(): string {
    return `${this.poolId}-${this.optionSide === 0 ? "long" : "short"}-${
      this.maturity
    }-${this.strikePrice.val}`;
  }
  get sideAsText(): string {
    return this.optionSide === OptionSideLong ? "Long" : "Short";
  }

  addSlippageToPremia(
    premia: number,
    slippage: number,
    isClosing: boolean,
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
    isClosing: boolean,
  ): U256 {
    const premiaWithSlippage = this.addSlippageToPremia(
      premia,
      slippage,
      isClosing,
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
    return this.underlying.toRaw(
      size * this.strikePrice.val - premiaWithSlippage,
    );
  }
  approveCall(
    size: number,
    premia: number,
    slippage: number,
    isClosing: boolean,
  ): Call {
    const approveSize = this.toApprove(size, premia, slippage, isClosing);

    return this.underlying.tokenApproveCallRaw(approveSize);
  }
  tradeSettleCalldata(size: number): Calldata {
    return [
      this.optionType.toString(),
      ...this.strikePrice.asArray,
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
    deadlineLimit: number,
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
    deadlineLimit = 300,
  ): Call[] {
    const isClosing = false;
    const premiaWithSlippage = this.addSlippageToPremia(
      premia,
      slippage,
      isClosing,
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
    deadlineLimit = 300,
  ): Call[] {
    const isClosing = true;
    const premiaWithSlippage = this.addSlippageToPremia(
      premia,
      slippage,
      isClosing,
    );
    const approve = this.approveCall(size, premia, slippage, isClosing);
    const trade = {
      entrypoint: "trade_close",
      contractAddress: AMM_ADDRESS,
      calldata: this.tradeCalldata(size, premiaWithSlippage, deadlineLimit),
    };
    return [approve, trade];
  }

  async getPremia(size: number, isClosing: boolean): Promise<OptionPremia> {
    return await CarmineAmm.getTotalPremia(
      this.descriptor,
      this.toRawSize(size),
      isClosing,
    );
  }
  async getPremiaWithoutFees(
    size: number,
    isClosing: boolean,
  ): Promise<number> {
    const { withoutFees } = await this.getPremia(size, isClosing);

    return withoutFees.val;
  }
}

export class OptionWithPremia extends Option {
  public readonly premia: Cubit;

  constructor(o: OptionDescriptor, premia: Fixed) {
    super(o);
    this.premia = new Cubit(premia);
  }
}

export class OptionWithUserPosition extends Option {
  public readonly value: Cubit;
  public readonly size: U256;
  public readonly sizeHuman: number;

  constructor(o: OptionDescriptor, value: Fixed, size: U256) {
    super(o);
    this.value = new Cubit(value);
    this.size = size;
    this.sizeHuman = this.underlying.toHumanReadable(size);
  }

  get isInTheMoney(): boolean {
    return !!this.value && this.isExpired;
  }

  get isOutOfTheMoney(): boolean {
    return !this.value && this.isExpired;
  }

  tradeCloseFull(
    premia: number,
    slippage: number,
    deadlineLimit = 300,
  ): Call[] {
    return this.tradeClose(
      this.underlying.toHumanReadable(this.size),
      premia,
      slippage,
      deadlineLimit,
    );
  }

  tradeSettle(): Call {
    return {
      entrypoint: "trade_settle",
      contractAddress: AMM_ADDRESS,
      calldata: this.tradeSettleCalldata(
        this.underlying.toHumanReadable(this.size),
      ),
    };
  }
}

export class NonSettledOption extends Option {
  public readonly optionAddress: string;
  public size: bigint | undefined;

  constructor(input: OptionDescriptorWithLpAddress) {
    const pool = liquidityPoolByLpAddress(input.lp_address).unwrap();
    const o: OptionDescriptor = {
      option_side: input.option_side as OptionSide,
      option_type: pool.optionType,
      maturity: input.maturity,
      strike_price: {
        mag: BigInt(input.strike_price),
        sign: false,
      },
      base_token_address: pool.base.address,
      quote_token_address: pool.quote.address,
    };
    super(o);
    this.optionAddress = input.option_address;
  }

  async fetchSize(user: string): Promise<bigint> {
    const contract = new Contract({
      abi: erc20Abi,
      address: this.optionAddress,
      providerOrAccount: getProvider(),
    }).typedv2(erc20Abi);
    const balance = (await contract.balance_of(user)) as bigint;
    this.size = balance;

    return balance;
  }

  tradeSettle(): Call {
    return {
      entrypoint: "trade_settle",
      contractAddress: AMM_ADDRESS,
      calldata: [
        this.optionType.toString(),
        ...this.strikePrice.asArray,
        this.maturity.toString(),
        this.optionSide.toString(),
        (this.size as bigint).toString(10),
        this.quote.address,
        this.base.address,
      ],
    };
  }
}

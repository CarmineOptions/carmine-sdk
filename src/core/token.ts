import {
  BigNumberish,
  Call,
  Contract,
  defaultProvider,
  TypedContractV2,
} from "starknet";
import {
  AMM_ADDRESS,
  BTC_ADDRESS,
  EKUBO_ADDRESS,
  ETH_ADDRESS,
  STRK_ADDRESS,
  USDC_ADDRESS,
} from "../constants";
import { Maybe } from "./maybe";
import { decimalToBigInt, decimalToU256, u256ToDecimal } from "./conversions";
import Decimal from "../utils/decimal";
import { U256 } from "../types/common";
import { erc20Abi } from "../rpc/erc20Abi";
import { getProvider } from "../rpc/provider";

type TokenDescriptor = {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logo: string;
};

export class Token {
  public readonly address: string;
  public readonly name: string;
  public readonly symbol: string;
  public readonly decimals: number;
  public readonly logo: string;
  public readonly factor: Decimal;
  private contract?: TypedContractV2<typeof erc20Abi>;

  constructor({ address, name, symbol, decimals, logo }: TokenDescriptor) {
    this.address = address;
    this.name = name;
    this.symbol = symbol;
    this.decimals = decimals;
    this.logo = logo;
    this.factor = new Decimal(10).pow(this.decimals);
  }

  private getContract(): TypedContractV2<typeof erc20Abi> {
    if (!this.contract) {
      // Lazily initialize to avoid requiring SDK config at module load time.
      this.contract = new Contract({
        abi: erc20Abi,
        address: this.address,
        providerOrAccount: getProvider(),
      }).typedv2(erc20Abi);
    }
    return this.contract;
  }

  toHumanReadable(rawSize: BigNumberish | U256): number {
    if (typeof rawSize === "object") {
      if (rawSize?.low !== undefined && rawSize?.high !== undefined) {
        const dec = u256ToDecimal(rawSize);
        return dec.div(this.factor).toNumber();
      }
      // unreachable
      throw Error("Invalid raw size format");
    }
    const dec = new Decimal(rawSize);
    return dec.div(this.factor).toNumber();
  }

  toRaw(size: number): U256 {
    const dec = new Decimal(size).mul(this.factor);
    return decimalToU256(dec);
  }

  toRawBigInt(size: number): bigint {
    const dec = new Decimal(size).mul(this.factor);
    return decimalToBigInt(dec);
  }

  tokenApproveCall(size: number): Call {
    const { low, high } = decimalToU256(new Decimal(size).mul(this.factor));
    return {
      contractAddress: this.address,
      entrypoint: "approve",
      calldata: [AMM_ADDRESS, low.toString(), high.toString()],
    };
  }

  tokenApproveCallRaw(size: U256): Call {
    return {
      contractAddress: this.address,
      entrypoint: "approve",
      calldata: [AMM_ADDRESS, size.low.toString(), size.high.toString()],
    };
  }

  async fetchBalance(userAddress: string): Promise<number> {
    const res = (await this.getContract().balance_of(userAddress)) as bigint;

    return this.toHumanReadable(res);
  }
}

const TOKENS: Token[] = [
  new Token({
    address: ETH_ADDRESS,
    name: "ethereum",
    symbol: "ETH",
    decimals: 18,
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
  }),
  new Token({
    address: USDC_ADDRESS,
    name: "usd-coin",
    symbol: "USDC",
    decimals: 6,
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
  }),
  new Token({
    address: BTC_ADDRESS,
    name: "wrapped-bitcoin",
    symbol: "wBTC",
    decimals: 8,
    logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png",
  }),
  new Token({
    address: STRK_ADDRESS,
    name: "starknet",
    symbol: "STRK",
    decimals: 18,
    logo: "https://assets.coingecko.com/coins/images/26433/small/starknet.png",
  }),
  new Token({
    address: EKUBO_ADDRESS,
    name: "ekubo",
    symbol: "EKUBO",
    decimals: 18,
    logo: "https://assets.coingecko.com/coins/images/37715/standard/135474885.png",
  }),
];

export const tokenByAddress = (a: string): Maybe<Token> => {
  const bnAddress = BigInt(a);
  return new Maybe(TOKENS.find((t) => BigInt(t.address) === bnAddress));
};

export const tokenBySymbol = (s: string): Maybe<Token> => {
  return new Maybe(TOKENS.find((t) => t.symbol === s));
};

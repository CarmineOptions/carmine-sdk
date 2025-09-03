import { Call } from "starknet";
import {
  AMM_ADDRESS,
  BTC_ADDRESS,
  EKUBO_ADDRESS,
  ETH_ADDRESS,
  STRK_ADDRESS,
  USDC_ADDRESS,
} from "../constants";
import { Maybe } from "./maybe";
import { decimalToU256 } from "./conversions";
import Decimal from "../utils/decimal";

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

  constructor({ address, name, symbol, decimals, logo }: TokenDescriptor) {
    this.address = address;
    this.name = name;
    this.symbol = symbol;
    this.decimals = decimals;
    this.logo = logo;
    this.factor = new Decimal(10).pow(this.decimals);
  }

  approveCalldata(size: number): Call {
    const { low, high } = decimalToU256(new Decimal(size).mul(this.factor));
    return {
      contractAddress: this.address,
      entrypoint: "approve",
      calldata: [AMM_ADDRESS, low.toString(), high.toString()],
    };
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

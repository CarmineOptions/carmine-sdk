import { OptionSide } from "../core";
import { Cubit } from "../core/Cubit";

export type StateResponse = {
  locked: string;
  unlocked: string;
  position: string;
  balance: string;
  value: string;
  timestamp: string;
  block_number: number;
  value_week_ago: string;
  apy_all_time: number;
  apy_week: number;
  change_all_time: number;
  change_week: number;
  date_week_ago: string;
  date_genesis: string;
  underlying_price: string;
};

export type State = {
  locked: bigint;
  unlocked: bigint;
  position: Cubit;
  balance: bigint;
  value: bigint;
  timestamp: Date;
  blockNumber: number;
  valueWeekAgo: bigint;
  apyAllTime: number;
  apyWeek: number;
  changeAllTime: number;
  changeWeek: number;
  dateWeekAgo: Date;
  dateGenesis: Date;
  underlyingPrice: bigint;
};

export type LivePrices = [keyof string, number];

export type Pagination = {
  limit: number;
  offset: number;
};

export type PaginatedResponse<T> = {
  data: T;
  total: number;
  has_next: boolean;
};

export type DataResponse<T> = {
  data: T;
};

export type TradeEventResponse = {
  block_number: number;
  caller: string;
  event_name: string;
  lp_address: string;
  maturity: number;
  option_address: string;
  option_side: number;
  strike_price: string;
  timestamp: string;
  tx: string;
  capital: string;
  tokens: string;
};

export type TradeEvent = {
  blockNumber: number;
  caller: string;
  eventName: string;
  lpAddress: string;
  maturity: number;
  optionAddress: string;
  optionSide: OptionSide;
  strikePrice: Cubit;
  timestamp: Date;
  tx: string;
  capital: number;
  tokens: number;
};

export type LiquidityEventResponse = {
  block_number: number;
  caller: string;
  capital: string;
  event_name: string;
  lp_address: string;
  timestamp: string;
  tokens: string;
  tx: string;
};

export type LiquidityEvent = {
  blockNumber: number;
  caller: string;
  capital: number;
  eventName: string;
  lpAddress: string;
  timestamp: Date;
  tokens: number;
  tx: string;
};

export type VoteEventResponse = {
  block_number: number;
  opinion: number;
  prop_id: number;
  timestamp: string;
  tx: string;
  voter: string;
};

export type VoteEvent = {
  blockNumber: number;
  opinion: number;
  propId: number;
  timestamp: Date;
  tx: string;
  voter: string;
};

export type UserPointsResponse = {
  user_address: string;
  trade_points: number;
  liquidity_points: number;
  vote_points: number;
  referral_points: number;
  total_points: number;
  position: number;
};

export type TopUsersResponse = {
  top: UserPointsResponse[];
  user: UserPointsResponse | null;
};

export type UserPoints = {
  userAddress: string;
  tradePoints: number;
  liquidityPoints: number;
  votePoints: number;
  referralPoints: number;
  totalPoints: number;
  position: number;
};

export type TopUsers = {
  top: UserPoints[];
  user?: UserPoints;
};

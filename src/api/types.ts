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
  block_number: number;
  value_week_ago: bigint;
  apy_all_time: number;
  apy_week: number;
  change_all_time: number;
  change_week: number;
  date_week_ago: Date;
  date_genesis: Date;
  underlying_price: bigint;
};

export type LivePrices = [keyof string, number];

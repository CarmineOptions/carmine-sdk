import { lpTokensToHumanReadable, sanitizeAddress } from "./../core/utils";
import { Cubit } from "../core/Cubit";
import {
  LivePrices,
  PaginatedResponse,
  Pagination,
  State,
  StateResponse,
  LiquidityEvent,
  LiquidityEventResponse,
  TradeEvent,
  TradeEventResponse,
  VoteEvent,
  VoteEventResponse,
  TopUsersResponse,
  UserPointsResponse,
  UserPoints,
  TopUsers,
} from "./types";
import { UrlBuilder } from "./UrlBuilder";
import { liquidityPoolByLpAddress, OptionSide } from "../core";

export namespace CarmineApi {
  async function sendRequest<T>(url: string): Promise<T> {
    const res = await fetch(url);

    if (!res.ok) {
      throw Error(`failed fetching ${url}`);
    }

    const data: T = await res.json();
    return data;
  }

  export async function poolState(lpAddress: string): Promise<State> {
    const urlBuilder = new UrlBuilder("/state").setQuery(
      "lp_address",
      sanitizeAddress(lpAddress)
    );
    const res = await sendRequest<StateResponse>(urlBuilder.url);

    return {
      locked: BigInt(res.locked),
      unlocked: BigInt(res.unlocked),
      position: new Cubit({ mag: BigInt(res.position), sign: false }),
      balance: BigInt(res.balance),
      value: BigInt(res.value),
      timestamp: new Date(res.timestamp),
      blockNumber: res.block_number,
      valueWeekAgo: BigInt(res.value_week_ago),
      apyAllTime: res.apy_all_time,
      apyWeek: res.apy_week,
      changeAllTime: res.change_all_time,
      changeWeek: res.change_week,
      dateWeekAgo: new Date(res.date_week_ago),
      dateGenesis: new Date(res.date_genesis),
      underlyingPrice: BigInt(res.locked),
    };
  }

  export async function livePrices(): Promise<LivePrices> {
    const urlBuilder = new UrlBuilder("/live-prices");
    return await sendRequest<LivePrices>(urlBuilder.url);
  }

  export async function tradeEvents(
    user: string | undefined,
    { limit = 20, offset = 0 }: Pagination
  ): Promise<PaginatedResponse<TradeEvent[]>> {
    const urlBuilder = new UrlBuilder("/events/trade")
      .setQuery("limit", limit.toString())
      .setQuery("offset", offset.toString());

    if (user !== undefined) {
      urlBuilder.setQuery("user", sanitizeAddress(user));
    }

    const res = await sendRequest<PaginatedResponse<TradeEventResponse[]>>(
      urlBuilder.url
    );

    const transformed: TradeEvent[] = res.data.map((e) => {
      const pool = liquidityPoolByLpAddress(e.lp_address).unwrap();
      const capital = pool.underlying.toHumanReadable(BigInt(e.capital));
      // tokens have always 18 decimals
      const tokens = lpTokensToHumanReadable(e.tokens);

      return {
        blockNumber: e.block_number,
        caller: e.caller,
        eventName: e.event_name,
        lpAddress: e.lp_address,
        maturity: e.maturity,
        optionAddress: e.option_address,
        optionSide: Number(e.option_side) as OptionSide,
        strikePrice: new Cubit({ mag: BigInt(e.strike_price), sign: false }),
        timestamp: new Date(e.timestamp),
        tx: e.tx,
        tokens,
        capital,
      };
    });

    return {
      data: transformed,
      total: res.total,
      has_next: res.has_next,
    };
  }

  export async function liquidityEvents(
    user: string | undefined,
    { limit = 20, offset = 0 }: Pagination
  ): Promise<PaginatedResponse<LiquidityEvent[]>> {
    const urlBuilder = new UrlBuilder("/events/liquidity")
      .setQuery("limit", limit.toString())
      .setQuery("offset", offset.toString());

    if (user !== undefined) {
      urlBuilder.setQuery("user", sanitizeAddress(user));
    }

    const res = await sendRequest<PaginatedResponse<LiquidityEventResponse[]>>(
      urlBuilder.url
    );

    const transformed: LiquidityEvent[] = res.data.map((e) => {
      const pool = liquidityPoolByLpAddress(e.lp_address).unwrap();
      const capital = pool.underlying.toHumanReadable(BigInt(e.capital));
      // tokens have always 18 decimals
      const tokens = lpTokensToHumanReadable(e.tokens);

      return {
        blockNumber: e.block_number,
        caller: e.caller,
        capital,
        eventName: e.event_name,
        lpAddress: e.lp_address,
        timestamp: new Date(e.timestamp),
        tokens,
        tx: e.tx,
      };
    });

    return {
      data: transformed,
      total: res.total,
      has_next: res.has_next,
    };
  }

  export async function voteEvents(
    user: string | undefined,
    { limit = 20, offset = 0 }: Pagination
  ): Promise<PaginatedResponse<VoteEvent[]>> {
    const urlBuilder = new UrlBuilder("/events/vote")
      .setQuery("limit", limit.toString())
      .setQuery("offset", offset.toString());

    if (user !== undefined) {
      urlBuilder.setQuery("user", sanitizeAddress(user));
    }

    const res = await sendRequest<PaginatedResponse<VoteEventResponse[]>>(
      urlBuilder.url
    );

    const transformed: VoteEvent[] = res.data.map((e) => {
      return {
        blockNumber: e.block_number,
        voter: e.voter,
        propId: e.prop_id,
        opinion: e.opinion,
        timestamp: new Date(e.timestamp),
        tx: e.tx,
      };
    });

    return {
      data: transformed,
      total: res.total,
      has_next: res.has_next,
    };
  }

  export async function userPoints(
    user: string | undefined,
    limit?: number
  ): Promise<TopUsers> {
    const urlBuilder = new UrlBuilder("/user-points/total");
    if (limit) {
      urlBuilder.setQuery("limit", limit.toString());
    }
    if (user !== undefined) {
      urlBuilder.setQuery("user", sanitizeAddress(user));
    }

    const res = await sendRequest<TopUsersResponse>(urlBuilder.url);

    const transformUser = (userResponse: UserPointsResponse): UserPoints => {
      return {
        userAddress: userResponse.user_address,
        tradePoints: userResponse.trade_points,
        liquidityPoints: userResponse.liquidity_points,
        votePoints: userResponse.vote_points,
        referralPoints: userResponse.referral_points,
        totalPoints: userResponse.total_points,
        position: userResponse.position,
      };
    };

    const top = res.top.map(transformUser);
    const final: TopUsers = { top };

    if (res.user) {
      final.user = transformUser(res.user);
    }

    return final;
  }
}

import { Cubit } from "../core/Cubit";
import { LivePrices, State, StateResponse } from "./types";
import { UrlBuilder } from "./UrlBuilder";

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
      lpAddress
    );
    const res = await sendRequest<StateResponse>(urlBuilder.url);

    return {
      locked: BigInt(res.locked),
      unlocked: BigInt(res.unlocked),
      position: new Cubit({ mag: BigInt(res.position), sign: false }),
      balance: BigInt(res.balance),
      value: BigInt(res.value),
      timestamp: new Date(res.timestamp),
      block_number: res.block_number,
      value_week_ago: BigInt(res.value_week_ago),
      apy_all_time: res.apy_all_time,
      apy_week: res.apy_week,
      change_all_time: res.change_all_time,
      change_week: res.change_week,
      date_week_ago: new Date(res.date_week_ago),
      date_genesis: new Date(res.date_genesis),
      underlying_price: BigInt(res.locked),
    };
  }

  export async function livePrices(): Promise<LivePrices> {
    const urlBuilder = new UrlBuilder("/live-prices");
    return await sendRequest<LivePrices>(urlBuilder.url);
  }
}

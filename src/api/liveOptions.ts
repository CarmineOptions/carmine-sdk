import { Maybe, None, Some } from "../core/maybe";
import { OptionWithPremia } from "../core/option";
import { OptionDescriptor, OptionSide, OptionType } from "../types/option";
import { apiCall } from "./common";

export const fetchLiveOptions = async (): Promise<
  Maybe<OptionWithPremia[]>
> => {
  const res = await apiCall<string[]>("live-options");

  if (res.isNone) {
    return None();
  }

  const data = res.unwrap();

  const batchSize = 9;
  const options: OptionWithPremia[] = [];

  for (let i = 0; i < data.length / batchSize; i++) {
    const cur = data.slice(i * batchSize, (i + 1) * batchSize);
    try {
      const o: OptionDescriptor = {
        optionSide: Number(cur[0]) as OptionSide,
        optionType: Number(cur[6]) as OptionType,
        maturity: Number(cur[1]),
        strikePrice: {
          mag: BigInt(cur[2]),
          sign: Number(cur[3]) === 1,
        },
        baseTokenAddress: cur[5],
        quoteTokenAddress: cur[4],
      };
      const premia = {
        mag: BigInt(cur[7]),
        sign: Number(cur[8]) === 1,
      };
      options.push(new OptionWithPremia(o, premia));
    } catch (error) {
      return None();
    }
  }

  return Some(options);
};

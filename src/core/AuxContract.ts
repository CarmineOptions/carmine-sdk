import { TypedContractV2, Contract } from "starknet";
import { auxAbi } from "./auxAbi";
import { AUX_ADDRESS } from "./constants";
import { getProvider } from "./provider";
import { OptionWithPremia } from "./option";
import { AllNonExpired } from "./types";

export namespace AuxContract {
  // Lazily created contract instance
  let _contract: TypedContractV2<typeof auxAbi> | undefined;

  function contract(): TypedContractV2<typeof auxAbi> {
    if (!_contract) {
      const provider = getProvider();
      _contract = new Contract({
        abi: auxAbi,
        address: AUX_ADDRESS,
        providerOrAccount: provider,
      }).typedv2(auxAbi);
    }
    return _contract;
  }

  export async function getAllNonExpiredOptionsWithPremia(
    lpAddress: string
  ): Promise<OptionWithPremia[]> {
    const res = (await contract().get_all_non_expired_options_with_premia(
      lpAddress
    )) as AllNonExpired[];

    return res.map(
      ({ option, premia }) => new OptionWithPremia(option, premia)
    );
  }
}

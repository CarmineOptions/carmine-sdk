import { Contract, TypedContractV2 } from "starknet";
import { ammAbi } from "./ammAbi";
import { OptionWithPremia } from "./option";
import { getProvider } from "./provider";
import { AMM_ADDRESS } from "./constants";
import { Fixed, OptionDescriptor, OptionPremia } from "./types";
import { Cubit } from "./Cubit";
import { AuxContract } from "./AuxContract";

export namespace CarmineAmm {
  // Lazily created contract instance
  let _contract: TypedContractV2<typeof ammAbi> | undefined;

  function contract(): TypedContractV2<typeof ammAbi> {
    if (!_contract) {
      const provider = getProvider();
      _contract = new Contract({
        abi: ammAbi,
        address: AMM_ADDRESS,
        providerOrAccount: provider,
      }).typedv2(ammAbi);
    }
    return _contract;
  }

  export async function getAllNonExpiredOptionsWithPremia(
    lpAddress: string
  ): Promise<OptionWithPremia[]> {
    // AuxContract fetches premia for smaller size for BTC to make premia more sensible
    return await AuxContract.getAllNonExpiredOptionsWithPremia(lpAddress);
  }

  export async function getTotalPremia(
    option: OptionDescriptor,
    size: bigint,
    isClosing: boolean
  ): Promise<OptionPremia> {
    const res = await contract().get_total_premia(option, size, isClosing);
    const withoutFees = new Cubit(res[0] as Fixed);
    const withFees = new Cubit(res[1] as Fixed);
    return { withFees, withoutFees };
  }

  export async function getUserPoolInfo(
    userAddress: string,
    lpAddress: string
  ) {
    return AuxContract.getUserPoolInfo(userAddress, lpAddress);
  }
}

import { Contract, TypedContractV2 } from "starknet";
import { AMM_ADDRESS, AUX_ADDRESS } from "./constants";
import { getProvider } from "./provider";
import { ammAbi } from "./ammAbi";

let ammContract: TypedContractV2<typeof ammAbi> | undefined = undefined;
let auxContract: TypedContractV2<typeof ammAbi> | undefined = undefined;

export const getAmmContract = () => {
  if (ammContract) {
    return ammContract;
  }
  const provider = getProvider();
  ammContract = new Contract({
    abi: ammAbi,
    address: AMM_ADDRESS,
    providerOrAccount: provider,
  }).typedv2(ammAbi);

  return ammContract;
};

export const getAuxContract = () => {
  if (auxContract) {
    return auxContract;
  }
  const provider = getProvider();
  auxContract = new Contract({
    abi: ammAbi,
    address: AUX_ADDRESS,
    providerOrAccount: provider,
  }).typedv2(ammAbi);

  return auxContract;
};

export const resetContracts = () => {
  ammContract = undefined;
  auxContract = undefined;
};

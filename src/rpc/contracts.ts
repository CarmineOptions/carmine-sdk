import { Contract, TypedContractV2 } from "starknet";
import { AMM_ADDRESS, AUX_ADDRESS } from "../constants";
import { getProvider } from "./provider";
import { ammAbi } from "./ammAbi";
import { governanceAbi } from "./governanceAbi";

let ammContract: TypedContractV2<typeof ammAbi> | undefined = undefined;
let auxContract: TypedContractV2<typeof ammAbi> | undefined = undefined;
let governanceContract: TypedContractV2<typeof governanceAbi> | undefined =
  undefined;

export const getAmmContract = () => {
  if (ammContract) {
    return ammContract;
  }
  const provider = getProvider();
  ammContract = new Contract(ammAbi, AMM_ADDRESS, provider).typedv2(ammAbi);

  return ammContract;
};

export const getAuxContract = () => {
  if (auxContract) {
    return auxContract;
  }
  const provider = getProvider();
  auxContract = new Contract(ammAbi, AUX_ADDRESS, provider).typedv2(ammAbi);

  return auxContract;
};

export const getGovernanceContract = () => {
  if (governanceContract) {
    return governanceContract;
  }
  const provider = getProvider();
  governanceContract = new Contract(
    governanceAbi,
    AUX_ADDRESS,
    provider
  ).typedv2(governanceAbi);

  return governanceContract;
};

export const resetContracts = () => {
  ammContract = undefined;
  auxContract = undefined;
  governanceContract = undefined;
};

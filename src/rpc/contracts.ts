import { Contract } from "starknet";
import { abi } from "./abi";
import { AMM_ADDRESS, AUX_ADDRESS } from "../constants";
import { getProvider } from "./provider";

let ammContract: Contract | undefined = undefined;
let auxContract: Contract | undefined = undefined;

export const getAmmContract = (): Contract => {
  if (ammContract) {
    return ammContract;
  }
  const provider = getProvider();
  ammContract = new Contract(abi, AMM_ADDRESS, provider);

  return ammContract;
};

export const getAuxContract = (): Contract => {
  if (auxContract) {
    return auxContract;
  }
  const provider = getProvider();
  auxContract = new Contract(abi, AUX_ADDRESS, provider);

  return auxContract;
};

export const resetContracts = () => {
  ammContract = undefined;
  auxContract = undefined;
};

import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { initCarmineSdk } from "..";
import { getAmmContract, getAuxContract, resetContracts } from "./contracts";
import { AMM_ADDRESS, AUX_ADDRESS, RPC_URL_DEFAULT } from "../constants";

describe("smart contracts", () => {
  beforeAll(() => {
    initCarmineSdk();
  });
  beforeEach(() => {
    resetContracts();
  });

  it("AMM contract", async () => {
    const contract = getAmmContract();

    expect(contract.address).toBe(AMM_ADDRESS);
    expect(contract.providerOrAccount.channel.nodeUrl).toBe(RPC_URL_DEFAULT);
  });

  it("AMM contract from cache", async () => {
    const contract = getAmmContract();
    expect(contract.address).toBe(AMM_ADDRESS);
    expect(contract.providerOrAccount.channel.nodeUrl).toBe(RPC_URL_DEFAULT);
    const cachedContract = getAmmContract();
    expect(contract).toBe(cachedContract);
  });

  it("AUX contract", async () => {
    const contract = getAuxContract();

    expect(contract.address).toBe(AUX_ADDRESS);
    expect(contract.providerOrAccount.channel.nodeUrl).toBe(RPC_URL_DEFAULT);
  });

  it("AUX contract from cache", async () => {
    const contract = getAuxContract();
    expect(contract.address).toBe(AUX_ADDRESS);
    expect(contract.providerOrAccount.channel.nodeUrl).toBe(RPC_URL_DEFAULT);
    const cachedContract = getAuxContract();
    expect(contract).toBe(cachedContract);
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { initCarmineSdk } from "..";
import { getProvider, resetProvider } from "./provider";
import { resetConfig } from "../config";
import { RPC_URL_DEFAULT } from "../constants";

describe("starknet RPC provider", () => {
  beforeEach(() => {
    resetProvider();
    resetConfig();
  });

  it("provider with default RPC URL", async () => {
    initCarmineSdk();

    const provider = getProvider();

    expect(provider.channel.nodeUrl).toBe(RPC_URL_DEFAULT);
  });

  it("provider with custom RPC URL", async () => {
    const customRpcUrl = "https://custom.rpc";
    initCarmineSdk({ rpcUrl: customRpcUrl });

    const provider = getProvider();

    expect(provider.channel.nodeUrl).toBe(customRpcUrl);
  });

  it("cached provider", async () => {
    const customRpcUrl = "https://custom.rpc";
    initCarmineSdk({ rpcUrl: customRpcUrl });

    // creates and stores to cache
    const provider = getProvider();

    expect(provider.channel.nodeUrl).toBe(customRpcUrl);

    // retrieved from cache
    const cachedProvider = getProvider();

    expect(cachedProvider.channel.nodeUrl).toBe(customRpcUrl);
    expect(cachedProvider).toBe(provider);
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { getProvider, resetProvider } from "./provider";
import { RPC_URL_DEFAULT } from "./constants";
import { initSdk, resetConfig } from "./config";

describe("starknet RPC provider", () => {
  beforeEach(() => {
    resetProvider();
    resetConfig();
  });

  it("provider with default RPC URL", async () => {
    initSdk();

    const provider = getProvider();

    expect(provider.channel.nodeUrl).toBe(RPC_URL_DEFAULT);
  });

  it("provider with custom RPC URL", async () => {
    const customRpcUrl = "https://custom.rpc";
    initSdk({ rpcUrl: customRpcUrl });

    const provider = getProvider();

    expect(provider.channel.nodeUrl).toBe(customRpcUrl);
  });

  it("cached provider", async () => {
    const customRpcUrl = "https://custom.rpc";
    initSdk({ rpcUrl: customRpcUrl });

    // creates and stores to cache
    const provider = getProvider();

    expect(provider.channel.nodeUrl).toBe(customRpcUrl);

    // retrieved from cache
    const cachedProvider = getProvider();

    expect(cachedProvider.channel.nodeUrl).toBe(customRpcUrl);
    expect(cachedProvider).toBe(provider);
  });
});

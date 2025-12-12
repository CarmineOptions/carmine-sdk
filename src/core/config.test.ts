import { describe, it, expect, beforeEach } from "vitest";
import { resetConfig, getConfig, initSdk } from "./config";
import { API_URL_DEFAULT, RPC_URL_DEFAULT } from "./constants";

describe("SDK config", () => {
  beforeEach(() => {
    resetConfig();
  });

  it("throws if getConfig() is called before initSdk()", () => {
    expect(() => getConfig()).toThrow("Carmine SDK not initialized.");
  });

  it("returns default values if nothing is provided", () => {
    initSdk();

    const cfg = getConfig();
    expect(cfg.apiUrl).toBe(API_URL_DEFAULT);
    expect(cfg.rpcUrl).toBe(RPC_URL_DEFAULT);
  });

  it("uses user-provided config values", () => {
    initSdk({ apiUrl: "https://custom.api" });

    const cfg = getConfig();
    expect(cfg.apiUrl).toBe("https://custom.api");
    expect(cfg.rpcUrl).toBe(RPC_URL_DEFAULT); // still default
  });

  it("uses fully provided config", () => {
    initSdk({
      apiUrl: "https://custom.api",
      rpcUrl: "https://custom.rpc",
    });

    const cfg = getConfig();
    expect(cfg.apiUrl).toBe("https://custom.api");
    expect(cfg.rpcUrl).toBe("https://custom.rpc");
  });
});

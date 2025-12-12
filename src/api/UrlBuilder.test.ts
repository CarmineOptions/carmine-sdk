import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { initSdk, resetConfig } from "../core/config";
import { UrlBuilder } from "./UrlBuilder";

const MOCK_BASE = "https://example.com";

describe("UrlBuilder", () => {
  beforeEach(() => {
    initSdk({ apiUrl: MOCK_BASE });
  });

  afterEach(() => {
    resetConfig();
  });

  it("sets base from config", () => {
    expect(new UrlBuilder("/state").base).toBe(MOCK_BASE);
  });

  it("builds url with provided path", () => {
    expect(new UrlBuilder("/state").url).toBe(`${MOCK_BASE}/state`);
  });

  it("adds query params with a value", () => {
    const url = new UrlBuilder("/state").setQuery("marketId", "1").url;
    expect(url).toBe(`${MOCK_BASE}/state?marketId=1`);
  });

  it("overwrites an existing query param value", () => {
    const url = new UrlBuilder("/state")
      .setQuery("marketId", "1")
      .setQuery("marketId", "2").url;
    expect(url).toBe(`${MOCK_BASE}/state?marketId=2`);
  });

  it("appends multiple query params", () => {
    const url = new UrlBuilder("/state")
      .setQuery("first", "1")
      .setQuery("second", "2").url;
    expect(url).toBe(`${MOCK_BASE}/state?first=1&second=2`);
  });

  it("works when base already has a trailing slash", () => {
    resetConfig();
    initSdk({ apiUrl: `${MOCK_BASE}/` });

    const url = new UrlBuilder("state").setQuery("foo", "bar").url;
    expect(url).toBe(`${MOCK_BASE}/state?foo=bar`);
  });
});

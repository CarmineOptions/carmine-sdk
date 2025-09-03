import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { fetchLiveOptions } from "./liveOptions";
import { initCarmineSdk } from "..";

const MOCK_DATA = [
  "0x0",
  "0x68ba27ff",
  "0x9c40000000000000000",
  "0x0",
  "0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
  "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  "0x0",
  "0x743f969b548ac182",
  "0x0",
  "0x1",
  "0x68ba27ff",
  "0x9c40000000000000000",
  "0x0",
  "0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
  "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  "0x0",
  "0x6d7a05226fed1bd6",
  "0x0",
  "0x0",
  "0x68ba27ff",
  "0xbb80000000000000000",
  "0x0",
  "0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
  "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  "0x0",
  "0x56c3171987ea087b",
  "0x0",
];

const MOCK_RESPONSE = { status: "success", data: MOCK_DATA };

describe("fetch live options", () => {
  beforeAll(() => {
    initCarmineSdk();
  });
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns data when fetch succeeds", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(MOCK_RESPONSE),
        } as Response)
      )
    );

    const result = await fetchLiveOptions();
    expect(result.isSome).toBe(true);
    const opts = result.unwrap();
    expect(opts.length).toBe(3);
  });

  it("returns None when server fail", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: "Server error",
        } as Response)
      )
    );

    const result = await fetchLiveOptions();

    await expect(result.isNone).toBe(true);
  });

  it("returns none when incorrect data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(["1", "2", "3"]),
        } as Response)
      )
    );

    const result = await fetchLiveOptions();
    expect(result.isNone).toBe(true);
  });
});

import { getConfig } from "../config";
import { Maybe, None, Some } from "../core/maybe";
import { ApiConfig, ApiResponse } from "./types";

const DEFAULT_CONFIG: ApiConfig = {
  version: 1,
  network: "mainnet",
  params: {},
};

const buildUrl = (path: string, cfg?: Partial<ApiConfig>) => {
  const { version, network, params } = { ...DEFAULT_CONFIG, ...cfg };
  const config = getConfig();
  const url = new URL(`${config.apiUrl}/v${version}/${network}/${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) =>
      url.searchParams.append(key, value)
    );
  }
  return url.toString();
};

export const apiCall = async <T>(
  path: string,
  cfg?: Partial<ApiConfig>
): Promise<Maybe<T>> => {
  const url = buildUrl(path, cfg);
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    return None();
  }

  const content: ApiResponse<T> = await res.json();

  if (!(content?.status === "success")) {
    return None();
  }

  const data: T = content.data;

  return Some(data);
};

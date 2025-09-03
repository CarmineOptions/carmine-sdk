export type ApiResponseFail = {
  status: "bad_request" | "server_error";
  message: string;
};

export type ApiResponseSuccess<T> = { status: "success"; data: T };

export type ApiResponse<T> = ApiResponseFail | ApiResponseSuccess<T>;

export type ApiConfig = {
  version: number;
  network: "mainnet"; // SDK only supports mainnet
  params: Record<string, string>;
};

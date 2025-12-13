import Decimal from "./decimal";

export const MATH_64_BASE = new Decimal(2).pow(new Decimal(64));

export const AMM_ADDRESS =
  "0x47472e6755afc57ada9550b6a3ac93129cc4b5f98f51c73e0644d129fd208d9";
export const AUX_ADDRESS =
  "0x4580d85b9d19b9412bb982bcb31ecb6ebb4363221e27b349b569f60410f6ef";
export const GOVERNANCE_ADDRESS =
  "0x1405ab78ab6ec90fba09e6116f373cda53b0ba557789a4578d8c1ec374ba0f";
export const ETH_ADDRESS =
  "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
export const USDC_ADDRESS =
  "0x53c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8";
export const BTC_ADDRESS =
  "0x3fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac";
export const STRK_ADDRESS =
  "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";
export const EKUBO_ADDRESS =
  "0x75afe6402ad5a5c20dd25e10ec3b3986acaa647b77e4ae24b0cbc9a54a27a87";
export const VE_CRM_ADDRESS =
  "0x3c0286e9e428a130ae7fbbe911b794e8a829c367dd788e7cfe3efb0367548fa";
export const CRM_ADDRESS =
  "0x51c4b1fe3bf6774b87ad0b15ef5d1472759076e42944fff9b9f641ff13e5bbe";

export const ETH_USDC_CALL_ADDRESS =
  "0x70cad6be2c3fc48c745e4a4b70ef578d9c79b46ffac4cd93ec7b61f951c7c5c";
export const ETH_USDC_PUT_ADDRESS =
  "0x466e3a6731571cf5d74c5b0d9c508bfb71438de10f9a13269177b01d6f07159";
export const BTC_USDC_CALL_ADDRESS =
  "0x35db72a814c9b30301f646a8fa8c192ff63a0dc82beb390a36e6e9eba55b6db";
export const BTC_USDC_PUT_ADDRESS =
  "0x1bf27366077765c922f342c8de257591d1119ebbcbae7a6c4ff2f50ede4c54c";
export const ETH_STRK_CALL_ADDRESS =
  "0x6df66db6a4b321869b3d1808fc702713b6cbb69541d583d4b38e7b1406c09aa";
export const ETH_STRK_PUT_ADDRESS =
  "0x4dcd9632353ed56e47be78f66a55a04e2c1303ebcb8ec7ea4c53f4fdf3834ec";
export const STRK_USDC_CALL_ADDRESS =
  "0x2b629088a1d30019ef18b893cebab236f84a365402fa0df2f51ec6a01506b1d";
export const STRK_USDC_PUT_ADDRESS =
  "0x6ebf1d8bd43b9b4c5d90fb337c5c0647b406c6c0045da02e6675c43710a326f";
export const EKUBO_USDC_CALL_ADDRESS =
  "0x78a090c99bfc993fe8bbd19487351e501dbe7b50ab695966605e0839b34182a";
export const EKUBO_USDC_PUT_ADDRESS =
  "0xe12a16c964dc68850c1f6cbea9062c36bed7676265eec7f563c728c53e536f";

// export const RPC_URL_DEFAULT = "https://starknet.api.onfinality.io/public";
export const RPC_URL_DEFAULT = "http://51.195.57.196:6060";
export const API_URL_DEFAULT = "https://backend.carmine.finance";

export const OptionSideLong = 0;
export const OptionSideShort = 1;
export const OptionTypeCall = 0;
export const OptionTypePut = 1;

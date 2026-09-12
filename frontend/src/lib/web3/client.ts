import { createPublicClient, http, defineChain } from "viem";

/**
 * Avalanche Fuji C-Chain definition (Chain ID 43113)
 */
export const avalancheFuji = defineChain({
  id: 43113,
  name: "Avalanche Fuji Testnet",
  nativeCurrency: {
    name: "Avalanche",
    symbol: "AVAX",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://api.avax-test.network/ext/bc/C/rpc"],
    },
    public: {
      http: ["https://api.avax-test.network/ext/bc/C/rpc"],
    },
  },
  blockExplorers: {
    default: {
      name: "SnowTrace",
      url: "https://testnet.snowtrace.io",
    },
  },
  testnet: true,
});

/**
 * Read-only Public Client for Avalanche Fuji
 */
export const publicClient = createPublicClient({
  chain: avalancheFuji,
  transport: http(),
});

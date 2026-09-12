/**
 * RoutePay Protocol Addresses on Avalanche Fuji Testnet (Chain ID: 43113)
 */
export const ROUTEPAY_ADDRESSES = {
  // Avalanche Fuji C-Chain
  fuji: {
    chainId: 43113,
    rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
    explorerUrl: "https://testnet.snowtrace.io",
    // Contract address will be populated upon deployment
    tradeEscrow: process.env.NEXT_PUBLIC_TRADE_ESCROW_ADDRESS || "0x0000000000000000000000000000000000000000",
    // Mock or Testnet USDC on Fuji
    mockUsdc: process.env.NEXT_PUBLIC_USDC_ADDRESS || "0x5425890298aed601595a70AB815c96711a31Bc65",
  },
} as const;

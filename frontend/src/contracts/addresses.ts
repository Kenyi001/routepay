/**
 * RoutePay Protocol Addresses on Avalanche Fuji Testnet (Chain ID: 43113)
 * Deployed: 2026-09-13 via script/Deploy.s.sol (TradeEscrow + ERC-2771 Forwarder)
 */
export const ROUTEPAY_ADDRESSES = {
  // Avalanche Fuji C-Chain
  fuji: {
    chainId: 43113,
    rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
    explorerUrl: "https://testnet.snowtrace.io",
    // TradeEscrow v2 — with customsOracle + ERC-2771 meta-tx support
    tradeEscrow:
      process.env.NEXT_PUBLIC_TRADE_ESCROW_ADDRESS ||
      "0x33cA337680366d337931a6f22226214d09594011",
    // ERC-2771 Forwarder for gasless relaying
    erc2771Forwarder:
      process.env.NEXT_PUBLIC_ERC2771_FORWARDER ||
      "0x33E5Adf857F02C5e56174c99b610C86e04610a6D",
    // Circle USDC on Fuji testnet
    mockUsdc:
      process.env.NEXT_PUBLIC_USDC_ADDRESS ||
      "0x5425890298aed601595a70AB815c96711a31Bc65",
  },
} as const;

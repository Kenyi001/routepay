"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { avalancheFuji } from "@/lib/web3/client";

interface Web3ContextType {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType>({
  address: null,
  chainId: null,
  isConnected: false,
  isConnecting: false,
  error: null,
  connect: async () => {},
  disconnect: () => {},
  switchNetwork: async () => {},
});

export function Web3Provider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getEthereum = () => {
    if (typeof window !== "undefined" && "ethereum" in window) {
      return (window as unknown as { ethereum: any }).ethereum;
    }
    return null;
  };

  const switchNetwork = useCallback(async () => {
    const ethereum = getEthereum();
    if (!ethereum) return;

    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${avalancheFuji.id.toString(16)}` }],
      });
    } catch (switchError: any) {
      // If network is not added to wallet (error code 4902)
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${avalancheFuji.id.toString(16)}`,
                chainName: avalancheFuji.name,
                nativeCurrency: avalancheFuji.nativeCurrency,
                rpcUrls: avalancheFuji.rpcUrls.default.http,
                blockExplorerUrls: [avalancheFuji.blockExplorers.default.url],
              },
            ],
          });
        } catch (addError) {
          console.error("Error adding Avalanche Fuji network:", addError);
        }
      } else {
        console.error("Error switching to Avalanche Fuji:", switchError);
      }
    }
  }, []);

  const connect = useCallback(async () => {
    const ethereum = getEthereum();
    if (!ethereum) {
      // A regular mobile browser (Edge, Chrome, Safari) never injects
      // window.ethereum — only a wallet app's own built-in browser does.
      const isMobile = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      setError(
        isMobile
          ? "No wallet detected in this browser. Open this page from inside the MetaMask or Core Wallet app's built-in browser to connect."
          : "No Web3 wallet found. Please install Core Wallet or MetaMask."
      );
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts: string[] = await ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]);
      }

      const currentChainIdHex: string = await ethereum.request({
        method: "eth_chainId",
      });
      const parsedChainId = parseInt(currentChainIdHex, 16);
      setChainId(parsedChainId);

      if (parsedChainId !== avalancheFuji.id) {
        await switchNetwork();
      }
    } catch (err: any) {
      console.error("Connection error:", err);
      setError(err?.message || "Failed to connect wallet.");
    } finally {
      setIsConnecting(false);
    }
  }, [switchNetwork]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setChainId(null);
    setError(null);
  }, []);

  useEffect(() => {
    const ethereum = getEthereum();
    if (!ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAddress(accounts[0]);
      }
    };

    const handleChainChanged = (chainHex: string) => {
      setChainId(parseInt(chainHex, 16));
    };

    ethereum.on?.("accountsChanged", handleAccountsChanged);
    ethereum.on?.("chainChanged", handleChainChanged);

    // Auto-reconnect if already permitted
    ethereum.request?.({ method: "eth_accounts" }).then((accounts: string[]) => {
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]);
        ethereum.request?.({ method: "eth_chainId" }).then((chainHex: string) => {
          setChainId(parseInt(chainHex, 16));
        });
      }
    }).catch(() => {});

    return () => {
      ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
      ethereum.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [disconnect]);

  return (
    <Web3Context.Provider
      value={{
        address,
        chainId,
        isConnected: !!address,
        isConnecting,
        error,
        connect,
        disconnect,
        switchNetwork,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  return useContext(Web3Context);
}

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { avalancheFuji } from "@/lib/web3/client";

export type WalletType = "metamask" | "core" | "auto";

interface Web3ContextType {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectedWallet: WalletType | null;
  error: string | null;
  connect: (walletType?: WalletType) => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType>({
  address: null,
  chainId: null,
  isConnected: false,
  isConnecting: false,
  connectedWallet: null,
  error: null,
  connect: async () => {},
  disconnect: () => {},
  switchNetwork: async () => {},
});

/**
 * Specifically finds the MetaMask provider when multiple wallets (Core, MetaMask, Phantom) are installed.
 */
function getMetaMaskProvider() {
  if (typeof window === "undefined") return null;
  const win = window as any;

  // 1. Check window.ethereum.providers array (standard when multiple Web3 extensions are active)
  if (win.ethereum?.providers?.length) {
    const mmProvider = win.ethereum.providers.find(
      (p: any) => p.isMetaMask && !p.isAvalanche
    );
    if (mmProvider) return mmProvider;
  }

  // 2. Direct check on window.ethereum if it's explicitly MetaMask and not Core
  if (win.ethereum?.isMetaMask && !win.ethereum?.isAvalanche) {
    return win.ethereum;
  }

  // 3. Fallback to window.ethereum
  return win.ethereum || null;
}

/**
 * Specifically finds the Core Wallet provider (Avalanche Native).
 */
function getCoreProvider() {
  if (typeof window === "undefined") return null;
  const win = window as any;

  // 1. Dedicated Core Wallet provider object
  if (win.avalanche) return win.avalanche;

  // 2. Check window.ethereum.providers array
  if (win.ethereum?.providers?.length) {
    const coreProvider = win.ethereum.providers.find(
      (p: any) => p.isAvalanche
    );
    if (coreProvider) return coreProvider;
  }

  // 3. Direct check on window.ethereum
  if (win.ethereum?.isAvalanche) return win.ethereum;

  return win.ethereum || null;
}

export function Web3Provider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<WalletType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getProvider = (targetWallet: WalletType = "metamask") => {
    if (targetWallet === "metamask") {
      return getMetaMaskProvider() || getCoreProvider();
    }
    if (targetWallet === "core") {
      return getCoreProvider() || getMetaMaskProvider();
    }
    // Auto detection
    return getMetaMaskProvider() || getCoreProvider();
  };

  const switchNetwork = useCallback(async () => {
    const ethereum = getProvider(connectedWallet || "metamask");
    if (!ethereum) return;

    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${avalancheFuji.id.toString(16)}` }],
      });
    } catch (switchError: any) {
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
  }, [connectedWallet]);

  const connect = useCallback(
    async (preferredWallet: WalletType = "metamask") => {
      const provider = getProvider(preferredWallet);

      if (!provider) {
        setError(
          preferredWallet === "metamask"
            ? "No se detectó MetaMask. Instala la extensión de MetaMask en Chrome."
            : "No se detectó billetera Web3 compatible."
        );
        return;
      }

      setIsConnecting(true);
      setError(null);

      try {
        const accounts: string[] = await provider.request({
          method: "eth_requestAccounts",
        });

        if (accounts && accounts.length > 0) {
          setAddress(accounts[0]);
          setConnectedWallet(preferredWallet);
        }

        const currentChainIdHex: string = await provider.request({
          method: "eth_chainId",
        });
        const parsedChainId = parseInt(currentChainIdHex, 16);
        setChainId(parsedChainId);

        if (parsedChainId !== avalancheFuji.id) {
          try {
            await provider.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: `0x${avalancheFuji.id.toString(16)}` }],
            });
          } catch (switchError: any) {
            if (switchError.code === 4902) {
              await provider.request({
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
            }
          }
        }
      } catch (err: any) {
        console.error("Connection error:", err);
        setError(err?.message || "Error al conectar la billetera.");
      } finally {
        setIsConnecting(false);
      }
    },
    []
  );

  const disconnect = useCallback(() => {
    setAddress(null);
    setChainId(null);
    setConnectedWallet(null);
    setError(null);
  }, []);

  useEffect(() => {
    const provider = getProvider("metamask");
    if (!provider) return;

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

    provider.on?.("accountsChanged", handleAccountsChanged);
    provider.on?.("chainChanged", handleChainChanged);

    // Auto-reconnect if already permitted
    provider
      .request?.({ method: "eth_accounts" })
      .then((accounts: string[]) => {
        if (accounts && accounts.length > 0) {
          setAddress(accounts[0]);
          setConnectedWallet("metamask");
          provider.request?.({ method: "eth_chainId" }).then((chainHex: string) => {
            setChainId(parseInt(chainHex, 16));
          });
        }
      })
      .catch(() => {});

    return () => {
      provider.removeListener?.("accountsChanged", handleAccountsChanged);
      provider.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [disconnect]);

  return (
    <Web3Context.Provider
      value={{
        address,
        chainId,
        isConnected: !!address,
        isConnecting,
        connectedWallet,
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

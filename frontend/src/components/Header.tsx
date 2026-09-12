import React from "react";
import { useWeb3 } from "@/context/Web3Context";

interface HeaderProps {
  networkName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  networkName = "Avalanche Fuji",
}) => {
  const { address, isConnected, isConnecting, connect, disconnect } = useWeb3();

  return (
    <header className="flex items-center justify-between py-3 border-b border-white/10 w-full">
      <div className="flex items-center gap-3">
        {/* Brand Icon with Crimson & Sapphire Gradient */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E84142] via-[#0A58CA] to-[#073B8A] flex items-center justify-center font-black text-white text-xl shadow-lg shadow-[#0A58CA]/30 border border-white/20">
          R
        </div>
        <div>
          <h1 className="font-extrabold text-xl tracking-tight text-white flex items-center gap-2">
            RoutePay
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0A58CA]/25 text-blue-300 border border-[#0A58CA]/40 font-mono font-bold uppercase">
              Escrow
            </span>
          </h1>
          <p className="text-[10px] text-slate-400 font-mono tracking-wider">
            TANGEM NFC · AVALANCHE FUJI
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
          {networkName}
        </span>

        {isConnected && address ? (
          <button
            onClick={disconnect}
            className="px-3 py-1.5 rounded-xl bg-[#0F172A] border border-white/15 text-xs font-mono text-slate-200 hover:border-[#E84142] hover:text-[#E84142] transition-colors shadow-sm"
            title="Desconectar Billetera Web3"
          >
            {`${address.slice(0, 5)}...${address.slice(-4)}`}
          </button>
        ) : (
          <button
            onClick={connect}
            disabled={isConnecting}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#0A58CA] to-[#E84142] hover:opacity-95 text-white font-extrabold text-xs shadow-md shadow-[#0A58CA]/30 active:scale-95 transition-all disabled:opacity-50"
          >
            {isConnecting ? "Conectando..." : "Conectar Wallet"}
          </button>
        )}
      </div>
    </header>
  );
};

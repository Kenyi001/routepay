import React from "react";

interface HeaderProps {
  networkName?: string;
  walletAddress?: string;
}

export const Header: React.FC<HeaderProps> = ({
  networkName = "Avalanche Fuji",
  walletAddress = "0x71C...C42",
}) => {
  return (
    <header className="flex items-center justify-between py-3 border-b border-white/10 w-full">
      <div className="flex items-center gap-3">
        {/* Brand Icon in Avalanche Red #E84142 */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E84142] to-[#B91C1C] flex items-center justify-center font-black text-white text-xl shadow-lg shadow-[#E84142]/30 border border-white/20">
          R
        </div>
        <div>
          <h1 className="font-extrabold text-xl tracking-tight text-white flex items-center gap-2">
            RoutePay
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E84142]/20 text-[#E84142] border border-[#E84142]/30 font-mono font-semibold uppercase">
              Escrow
            </span>
          </h1>
          <p className="text-[10px] text-slate-400 font-mono tracking-wider">
            TANGEM NFC · AVALANCHE FUJI
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
          {networkName}
        </span>
      </div>
    </header>
  );
};

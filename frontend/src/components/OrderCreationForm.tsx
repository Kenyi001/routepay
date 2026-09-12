import React from "react";

interface OrderCreationFormProps {
  origin: string;
  destination: string;
  frightAmount: string;
  setFrightAmount: (val: string) => void;
  manifestId: string;
  setManifestId: (val: string) => void;
  carrierAddress: string;
  setCarrierAddress: (val: string) => void;
  orderStatus: "none" | "funded" | "in_transit" | "settled";
  onOpenPollarModal: () => void;
  onCreateOrderDirect: () => void;
  protocolFee: string;
  carrierPayout: string;
}

export const OrderCreationForm: React.FC<OrderCreationFormProps> = ({
  origin,
  destination,
  frightAmount,
  setFrightAmount,
  manifestId,
  setManifestId,
  carrierAddress,
  setCarrierAddress,
  orderStatus,
  onOpenPollarModal,
  onCreateOrderDirect,
  protocolFee,
  carrierPayout,
}) => {
  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4 border border-white/10 shadow-xl bg-[#27272A]/90">
      {/* Header card */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <h2 className="font-extrabold text-sm text-white flex items-center gap-2">
            Crear Orden de Custodia Escrow
          </h2>
          <p className="text-[11px] text-slate-400">Contrato inteligente de pago condicionado</p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-semibold">
          Pollar On-Ramp
        </span>
      </div>

      <div className="flex flex-col gap-3.5 text-xs">
        {/* Route Details Box */}
        <div className="bg-[#18181B] p-3.5 rounded-xl border border-white/5 flex flex-col gap-1.5 shadow-inner">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-[10px] font-mono uppercase tracking-wider">
              Ruta Internacional de Carga
            </span>
            <span className="text-[10px] text-[#E84142] font-mono font-bold">1,200 KM</span>
          </div>

          <div className="flex items-center gap-2 text-white font-semibold py-1">
            <span className="text-sm">🇨🇱</span>
            <span className="truncate">{origin}</span>
            <span className="text-[#E84142] font-bold">➔</span>
            <span className="text-sm">🇧🇴</span>
            <span className="truncate">{destination}</span>
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-white/5 font-mono">
            <span>Paso Fronterizo:</span>
            <span className="text-slate-200">Tambo Quemado (Aduana)</span>
          </div>
        </div>

        {/* Manifest ID Input */}
        <div>
          <label className="text-slate-300 text-[11px] font-medium block mb-1">
            ID de Manifiesto Aduanero (<span className="font-mono text-[#E84142]">MIC/DTA</span>)
          </label>
          <input
            type="text"
            value={manifestId}
            onChange={(e) => setManifestId(e.target.value)}
            placeholder="MIC-DTA-2026-AR-BO-XXXX"
            className="w-full bg-[#18181B] border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-[#E84142] transition-all"
          />
        </div>

        {/* Freight Amount Input */}
        <div>
          <label className="text-slate-300 text-[11px] font-medium block mb-1">
            Monto del Flete (USDC en Avalanche)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">$</span>
            <input
              type="number"
              value={frightAmount}
              onChange={(e) => setFrightAmount(e.target.value)}
              className="w-full bg-[#18181B] border border-white/10 rounded-xl pl-8 pr-16 py-2.5 text-white font-mono font-extrabold text-sm focus:outline-none focus:border-[#E84142] transition-all"
            />
            <span className="absolute right-3.5 top-2.5 text-[#10B981] font-mono text-xs font-bold">
              USDC
            </span>
          </div>
        </div>

        {/* Carrier Wallet Address */}
        <div>
          <label className="text-slate-300 text-[11px] font-medium block mb-1">
            Wallet del Transportista Certificado
          </label>
          <input
            type="text"
            value={carrierAddress}
            onChange={(e) => setCarrierAddress(e.target.value)}
            className="w-full bg-[#18181B]/60 border border-white/5 rounded-xl px-3 py-2 text-slate-400 font-mono text-xs"
          />
        </div>

        {/* Breakdown box */}
        <div className="bg-[#18181B] p-3 rounded-xl border border-white/5 text-[11px] flex flex-col gap-1.5 text-slate-400">
          <div className="flex justify-between">
            <span>Pago al Transportista (99.5%):</span>
            <span className="font-mono text-white font-bold">${carrierPayout} USDC</span>
          </div>
          <div className="flex justify-between">
            <span>Comisión Protocolo RoutePay (0.5%):</span>
            <span className="font-mono text-slate-300">${protocolFee} USDC</span>
          </div>
        </div>
      </div>

      {/* Primary Action Buttons */}
      {orderStatus === "none" ? (
        <div className="flex flex-col gap-2.5 mt-1">
          <button
            onClick={onOpenPollarModal}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white font-extrabold text-xs shadow-lg shadow-[#10B981]/25 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>📱</span> Cargar fondos con QR BOB (Pollar On-Ramp)
          </button>

          <button
            onClick={onCreateOrderDirect}
            className="w-full py-3 rounded-xl bg-[#E84142] hover:bg-[#D03738] text-white font-extrabold text-xs shadow-lg shadow-[#E84142]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
          >
            <span>🔒</span> Bloquear ${frightAmount} USDC en Smart Contract
          </button>
        </div>
      ) : (
        <div className="p-3.5 bg-[#10B981]/15 border border-[#10B981]/40 rounded-xl text-center flex flex-col gap-1">
          <p className="text-xs text-[#10B981] font-bold flex items-center justify-center gap-1">
            <span>✓</span> Orden #101 Fondeada Exitosamente
          </p>
          <p className="text-[11px] text-slate-300 font-mono">
            ${frightAmount} USDC custodiados en Avalanche Fuji
          </p>
        </div>
      )}
    </div>
  );
};

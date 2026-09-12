import React from "react";

interface TransitTimelineProps {
  orderStatus: "none" | "funded" | "in_transit" | "settled";
  carrierPayout: string;
  onStartTransit: () => void;
  onGoToTangemTap: () => void;
  onOpenTruckModal?: () => void;
  txHash?: string | null;
  explorerUrl?: string;
  isLoading?: boolean;
}

export const TransitTimeline: React.FC<TransitTimelineProps> = ({
  orderStatus,
  carrierPayout,
  onStartTransit,
  onGoToTangemTap,
  onOpenTruckModal,
  txHash,
  explorerUrl = "https://testnet.snowtrace.io",
  isLoading = false,
}) => {
  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4 border border-white/10 shadow-xl bg-[#27272A]/90">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <h2 className="font-extrabold text-sm text-white flex items-center gap-2">
            Panel del Transportista / Monitor
          </h2>
          <p className="text-[11px] text-slate-400">Seguimiento en tiempo real de flete</p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1E3A8A] text-blue-200 border border-blue-400/30 font-semibold">
          Orden #101
        </span>
      </div>

      {/* Highlighted Escrow Card with Cobalt Blue #0D1B2A & Crypto Green #10B981 accents */}
      <div className="bg-gradient-to-br from-[#0D1B2A] via-[#1E3A8A]/80 to-[#18181B] p-4.5 rounded-2xl border border-blue-400/30 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[#10B981] text-xs font-bold font-mono">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            🔒 FONDOS EN CUSTODIA SMART CONTRACT
          </span>
          <span className="text-[10px] text-slate-300 font-mono">Avalanche Fuji</span>
        </div>

        <div className="text-3xl font-black font-mono text-white mt-2 flex items-baseline gap-2">
          ${carrierPayout}
          <span className="text-sm font-semibold text-[#10B981]">USDC</span>
        </div>

        <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
          Los fondos están bloqueados y garantizados. Se liberarán instantáneamente a tu wallet en cuanto el receptor apoye su tarjeta física Tangem NFC.
        </p>
      </div>

      {/* Stepper Timeline with 4 States */}
      <div className="bg-[#18181B] p-4 rounded-xl border border-white/5 flex flex-col gap-3.5 text-xs">
        <span className="text-slate-400 text-[10px] font-mono uppercase tracking-wider font-semibold">
          Progreso del Viaje (Arica ➔ Santa Cruz)
        </span>

        <div className="flex flex-col gap-3">
          {/* Step 1: Creado */}
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  orderStatus !== "none"
                    ? "bg-[#10B981] text-black"
                    : "bg-[#27272A] text-slate-400 border border-white/20"
                }`}
              >
                ✓
              </div>
              <div className="w-0.5 h-6 bg-white/10 my-0.5"></div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-white">1. Orden Creada</span>
                <span className="text-[10px] font-mono text-slate-400">Puerto Arica</span>
              </div>
              <p className="text-[11px] text-slate-400">Manifiesto aduanero cargado por importador.</p>
            </div>
          </div>

          {/* Step 2: Custodiado */}
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  orderStatus === "funded" || orderStatus === "in_transit" || orderStatus === "settled"
                    ? "bg-[#10B981] text-black"
                    : "bg-[#27272A] text-slate-400 border border-white/20"
                }`}
              >
                {orderStatus === "funded" || orderStatus === "in_transit" || orderStatus === "settled" ? "✓" : "2"}
              </div>
              <div className="w-0.5 h-6 bg-white/10 my-0.5"></div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-white">2. Custodiado en Smart Contract</span>
                <span
                  className={`text-[10px] font-mono ${
                    orderStatus !== "none" ? "text-[#10B981] font-bold" : "text-slate-500"
                  }`}
                >
                  {orderStatus !== "none" ? "Garantizado" : "Pendiente"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Depósito en USDC bloqueado en la red Avalanche.</p>
            </div>
          </div>

          {/* Step 3: En Tránsito */}
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  orderStatus === "in_transit" || orderStatus === "settled"
                    ? "bg-[#E84142] text-white animate-pulse"
                    : "bg-[#27272A] text-slate-400 border border-white/20"
                }`}
              >
                {orderStatus === "settled" ? "✓" : "3"}
              </div>
              <div className="w-0.5 h-6 bg-white/10 my-0.5"></div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-white">3. En Tránsito (Frontera)</span>
                <span
                  className={`text-[10px] font-mono ${
                    orderStatus === "in_transit"
                      ? "text-[#E84142] font-bold"
                      : orderStatus === "settled"
                      ? "text-[#10B981]"
                      : "text-slate-500"
                  }`}
                >
                  {orderStatus === "in_transit"
                    ? "En Ruta (Tambo Quemado)"
                    : orderStatus === "settled"
                    ? "Completado"
                    : "Pendiente"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Tránsito internacional y cruce de aduana.</p>
            </div>
          </div>

          {/* Step 4: Entregado */}
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  orderStatus === "settled"
                    ? "bg-[#10B981] text-black"
                    : "bg-[#27272A] text-slate-400 border border-white/20"
                }`}
              >
                {orderStatus === "settled" ? "✓" : "4"}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-white">4. Entregado & Liquidado</span>
                <span
                  className={`text-[10px] font-mono ${
                    orderStatus === "settled" ? "text-[#10B981] font-bold" : "text-slate-500"
                  }`}
                >
                  {orderStatus === "settled" ? "Liquidación Instantánea" : "Pendiente Tap NFC"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Verificación presencial mediante firma Tangem NFC.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Demo helper button to show Cyber-Truck road animation anytime */}
      {onOpenTruckModal && (
        <button
          onClick={onOpenTruckModal}
          type="button"
          className="w-full py-2 rounded-xl bg-[#18181B] hover:bg-[#323236] text-slate-300 hover:text-[#E84142] font-mono text-[11px] border border-white/10 transition-all flex items-center justify-center gap-1.5 shadow-sm"
        >
          <span>🚚</span> Ver animación del camión en ruta (Demo)
        </button>
      )}

      {/* Dynamic Actions */}
      {orderStatus === "funded" && (
        <button
          onClick={onStartTransit}
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-[#1E3A8A] hover:bg-[#2546A5] text-white font-extrabold text-xs shadow-lg shadow-[#1E3A8A]/40 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 border border-blue-400/30"
        >
          <span>🚛</span> {isLoading ? "Registrando salida en Fuji..." : "Confirmar Salida de Puerto (Iniciar Tránsito)"}
        </button>
      )}

      {orderStatus === "in_transit" && (
        <button
          onClick={onGoToTangemTap}
          className="w-full py-3 rounded-xl bg-[#E84142] hover:bg-[#D03738] text-white font-extrabold text-xs shadow-lg shadow-[#E84142]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span>📍</span> Llegué a Destino ➔ Proceder al Tap Tangem
        </button>
      )}

      {orderStatus === "settled" && (
        <div className="p-3.5 bg-[#10B981]/15 border border-[#10B981]/40 rounded-xl text-center flex flex-col gap-1">
          <p className="text-xs text-[#10B981] font-extrabold">🎉 ¡Flete Cobrado con Éxito!</p>
          <p className="text-[11px] text-slate-300">
            ${carrierPayout} USDC acreditados inmediatamente a tu billetera
          </p>
          {txHash && (
            <a
              href={`${explorerUrl}/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-1 text-[10px] font-mono text-[#10B981] hover:underline break-all"
            >
              Ver Tx en SnowTrace ↗ ({txHash.slice(0, 16)}...)
            </a>
          )}
        </div>
      )}
    </div>
  );
};

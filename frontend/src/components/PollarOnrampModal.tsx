import React, { useState } from "react";

interface PollarOnrampModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPayment: () => void;
  amountUsdc: string;
}

export const PollarOnrampModal: React.FC<PollarOnrampModalProps> = ({
  isOpen,
  onClose,
  onConfirmPayment,
  amountUsdc,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  // Rate assumption: 1 USDC = 7.95 BOB
  const bobAmount = (parseFloat(amountUsdc || "2500") * 7.95).toLocaleString("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onConfirmPayment();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm bg-[#1F2937] border border-white/15 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            <div>
              <h3 className="font-extrabold text-sm text-white">Pollar On-Ramp QR</h3>
              <p className="text-[10px] text-[#10B981] font-mono">Pago Simple QR en Bolivianos (BOB)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#0F172A] text-slate-400 hover:text-white flex items-center justify-center text-sm border border-white/10"
          >
            ✕
          </button>
        </div>

        {/* QR Code graphic container */}
        <div className="flex flex-col items-center bg-[#0F172A] p-4 rounded-xl border border-white/5 gap-3 shadow-inner">
          <div className="relative p-3 bg-white rounded-xl shadow-lg flex items-center justify-center">
            {/* SVG Simulated QR Code */}
            <svg
              className="w-36 h-36"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="100" height="100" fill="white" />
              {/* Corner markers */}
              <rect x="5" y="5" width="30" height="30" fill="black" />
              <rect x="10" y="10" width="20" height="20" fill="white" />
              <rect x="15" y="15" width="10" height="10" fill="black" />

              <rect x="65" y="5" width="30" height="30" fill="black" />
              <rect x="70" y="10" width="20" height="20" fill="white" />
              <rect x="75" y="15" width="10" height="10" fill="black" />

              <rect x="5" y="65" width="30" height="30" fill="black" />
              <rect x="10" y="70" width="20" height="20" fill="white" />
              <rect x="15" y="75" width="10" height="10" fill="black" />

              {/* Data pattern */}
              <rect x="40" y="5" width="10" height="10" fill="black" />
              <rect x="50" y="15" width="10" height="10" fill="black" />
              <rect x="40" y="25" width="10" height="10" fill="black" />
              <rect x="45" y="45" width="15" height="15" fill="#0A58CA" />
              <rect x="65" y="40" width="10" height="20" fill="black" />
              <rect x="40" y="65" width="20" height="10" fill="black" />
              <rect x="65" y="65" width="30" height="30" fill="black" />
              <rect x="70" y="70" width="20" height="20" fill="white" />
              <rect x="75" y="75" width="10" height="10" fill="#10B981" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-8 h-8 rounded-lg bg-[#0A58CA] text-white font-black text-xs flex items-center justify-center shadow-md">
                P
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-slate-400 font-mono">Total a pagar:</p>
            <p className="text-xl font-black font-mono text-[#10B981]">{bobAmount} BOB</p>
            <p className="text-[11px] text-slate-400">
              Recibes: <span className="text-white font-bold font-mono">${amountUsdc} USDC</span> (Avalanche Fuji)
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="text-[11px] text-slate-400 flex flex-col gap-1 bg-[#0F172A]/60 p-2.5 rounded-lg border border-white/5">
          <p className="flex items-center gap-1.5 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0A58CA]"></span> Escanea con la app de tu banco boliviano (BNB, BCP, Mercantil).
          </p>
          <p className="flex items-center gap-1.5 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span> Pollar convierte BOB ➔ USDC e insta-fondea el Smart Contract.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-[#0F172A] hover:bg-white/10 text-slate-300 font-semibold text-xs border border-white/10 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handlePay}
            disabled={isProcessing}
            className="flex-2 py-2.5 rounded-xl bg-gradient-to-r from-[#0A58CA] to-[#1D4ED8] hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-[#0A58CA]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
          >
            {isProcessing ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                Verificando QR...
              </>
            ) : (
              "Simular Pago QR Exitoso"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

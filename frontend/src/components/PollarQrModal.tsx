"use client";

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface PollarQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  amountUsd?: string;
  manifestId?: string;
}

export default function PollarQrModal({
  isOpen,
  onClose,
  onPaymentSuccess,
  amountUsd = "2500",
  manifestId = "MIC-DTA-2026-AR-BO-0911",
}: PollarQrModalProps) {
  const { language } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const bobAmount = (parseFloat(amountUsd || "2500") * 6.96).toLocaleString("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);
      setTimeout(() => {
        onPaymentSuccess();
        onClose();
        setIsPaid(false);
      }, 1200);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-slate-900/95 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl shadow-emerald-500/20 flex flex-col items-center text-center relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="w-full flex justify-between items-center mb-3">
          <div className="flex items-center gap-2 text-left">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
              P
            </div>
            <div>
              <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                POLLAR ON-RAMP · BOB TO USDC
              </p>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {language === "es" ? "Pago QR Simple Bolivia" : "Bolivia Simple QR Payment"}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs"
          >
            ✕
          </button>
        </div>

        {/* QR Code Container (Cyber-Fintech Styled) */}
        <div className="relative my-2 p-3 bg-white rounded-2xl shadow-lg border-2 border-emerald-500/30 flex flex-col items-center justify-center">
          {/* Mock QR SVG representation */}
          <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="150" height="150" fill="white" />
            {/* Corner Markers */}
            <rect x="10" y="10" width="36" height="36" rx="6" fill="#022c22" />
            <rect x="16" y="16" width="24" height="24" rx="3" fill="white" />
            <rect x="22" y="22" width="12" height="12" rx="2" fill="#022c22" />

            <rect x="104" y="10" width="36" height="36" rx="6" fill="#022c22" />
            <rect x="110" y="16" width="24" height="24" rx="3" fill="white" />
            <rect x="116" y="22" width="12" height="12" rx="2" fill="#022c22" />

            <rect x="10" y="104" width="36" height="36" rx="6" fill="#022c22" />
            <rect x="16" y="110" width="24" height="24" rx="3" fill="white" />
            <rect x="22" y="116" width="12" height="12" rx="2" fill="#022c22" />

            {/* Simulated Data Matrix Dots */}
            <rect x="56" y="14" width="8" height="8" rx="1" fill="#0f766e" />
            <rect x="70" y="14" width="8" height="8" rx="1" fill="#0f766e" />
            <rect x="84" y="14" width="8" height="8" rx="1" fill="#0f766e" />
            <rect x="56" y="28" width="8" height="8" rx="1" fill="#0f766e" />
            <rect x="74" y="32" width="16" height="8" rx="1" fill="#022c22" />

            <rect x="14" y="56" width="8" height="8" rx="1" fill="#0f766e" />
            <rect x="28" y="56" width="8" height="8" rx="1" fill="#022c22" />
            <rect x="42" y="56" width="8" height="8" rx="1" fill="#0f766e" />
            <rect x="56" y="56" width="12" height="12" rx="2" fill="#059669" />
            <rect x="72" y="52" width="10" height="10" rx="2" fill="#022c22" />
            <rect x="86" y="56" width="8" height="8" rx="1" fill="#0f766e" />
            <rect x="104" y="56" width="16" height="8" rx="1" fill="#022c22" />
            <rect x="126" y="56" width="8" height="8" rx="1" fill="#0f766e" />

            <rect x="14" y="72" width="16" height="8" rx="1" fill="#022c22" />
            <rect x="36" y="70" width="8" height="8" rx="1" fill="#0f766e" />
            <rect x="52" y="74" width="10" height="10" rx="2" fill="#022c22" />
            <rect x="68" y="68" width="14" height="14" rx="2" fill="#059669" />
            <rect x="88" y="72" width="16" height="8" rx="1" fill="#022c22" />
            <rect x="110" y="70" width="8" height="8" rx="1" fill="#0f766e" />
            <rect x="124" y="72" width="12" height="8" rx="1" fill="#022c22" />

            <rect x="56" y="92" width="8" height="8" rx="1" fill="#0f766e" />
            <rect x="70" y="88" width="10" height="10" rx="2" fill="#022c22" />
            <rect x="86" y="92" width="8" height="8" rx="1" fill="#059669" />
            <rect x="104" y="88" width="16" height="16" rx="2" fill="#022c22" />
            <rect x="126" y="92" width="8" height="8" rx="1" fill="#0f766e" />

            <rect x="56" y="110" width="16" height="8" rx="1" fill="#022c22" />
            <rect x="78" y="114" width="8" height="8" rx="1" fill="#0f766e" />
            <rect x="92" y="110" width="12" height="12" rx="2" fill="#059669" />
            <rect x="110" y="114" width="8" height="8" rx="1" fill="#022c22" />
            <rect x="124" y="110" width="12" height="12" rx="2" fill="#0f766e" />

            {/* Pollar Emblem in center */}
            <circle cx="75" cy="75" r="16" fill="white" stroke="#10b981" strokeWidth="2.5" />
            <text x="69" y="81" fill="#059669" fontSize="16" fontWeight="bold" fontFamily="sans-serif">
              P
            </text>
          </svg>

          <span className="text-[10px] font-mono text-slate-600 font-bold mt-1">
            SIMPLE · QR INTEROPERABLE
          </span>
        </div>

        {/* Currency Conversion Summary */}
        <div className="w-full bg-slate-950/70 border border-white/10 rounded-2xl p-3 flex flex-col gap-1.5 text-left text-xs font-mono my-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">
              {language === "es" ? "A pagar en Bolivianos:" : "Pay in Bolivianos:"}
            </span>
            <span className="text-base font-bold text-emerald-400 font-mono">
              Bs. {bobAmount}
            </span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400">
              {language === "es" ? "Recibe en Avalanche Fuji:" : "Receives on Avalanche:"}
            </span>
            <span className="text-white font-bold">${amountUsd} USDC</span>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-white/5">
            <span>Tasa Pollar: 1 USDC = 6.96 BOB</span>
            <span className="text-emerald-400">Comisión 0%</span>
          </div>
        </div>

        {/* Supported Bolivian Banks Badges */}
        <div className="w-full flex items-center justify-center gap-2 text-[9px] font-mono text-slate-400 mb-3">
          <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-white/5">Banco Unión</span>
          <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-white/5">BCP</span>
          <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-white/5">BNB</span>
          <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-white/5">Ganadero</span>
        </div>

        {/* Simulation Button */}
        {isPaid ? (
          <div className="w-full py-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 animate-success-pop">
            <span>✓</span> {language === "es" ? "¡Pago QR Confirmado en Pollar!" : "QR Payment Confirmed on Pollar!"}
          </div>
        ) : (
          <button
            onClick={handleSimulatePayment}
            disabled={isProcessing}
            type="button"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/25 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                <span>{language === "es" ? "Confirmando transferencia..." : "Confirming transfer..."}</span>
              </>
            ) : (
              <>
                <span>📱</span>
                <span>
                  {language === "es"
                    ? "Simular Escaneo y Pago QR (Banca Móvil)"
                    : "Simulate Scan & QR Payment (Mobile Banking)"}
                </span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

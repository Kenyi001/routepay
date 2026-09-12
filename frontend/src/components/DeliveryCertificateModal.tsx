"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";

interface DeliveryCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetDemo: () => void;
  orderId?: string;
  manifestId?: string;
  carrierPayout?: string;
  protocolFee?: string;
  txHash?: string | null;
  explorerUrl?: string;
}

export default function DeliveryCertificateModal({
  isOpen,
  onClose,
  onResetDemo,
  manifestId = "MIC-DTA-2026-AR-BO-0911",
  carrierPayout = "2,487.50",
  protocolFee = "12.50",
  txHash,
  explorerUrl = "https://testnet.snowtrace.io",
}: DeliveryCertificateModalProps) {
  const { language } = useLanguage();

  if (!isOpen) return null;

  const displayHash = txHash || "0x9a8f27b4e61d8892f3e104c99715a67c51e038892b3a98716b12f71694f31b28";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-up">
      <div className="w-full max-w-md bg-gradient-to-b from-slate-900 via-[#0a1224] to-[#040814] border-2 border-emerald-400/50 rounded-3xl p-6 shadow-2xl shadow-emerald-500/25 flex flex-col items-center text-center relative overflow-hidden">
        {/* Certificate Watermark / Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Animated Certificate Wax Seal */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-100 text-black flex items-center justify-center font-black text-2xl shadow-xl shadow-amber-500/40 border-2 border-amber-200 my-1 animate-seal-pop">
          ✓
        </div>

        <p className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-extrabold mt-2">
          {language === "es" ? "CERTIFICADO CRIPTOGRÁFICO DE ENTREGA" : "CRYPTOGRAPHIC PROOF OF DELIVERY"}
        </p>

        <h3 className="text-lg font-extrabold text-white tracking-tight">
          {language === "es" ? "Liquidación Comercial Completada" : "Commercial Settlement Completed"}
        </h3>

        <p className="text-xs text-slate-300 mt-1 max-w-xs leading-relaxed">
          {language === "es"
            ? "Mercadería recibida y verificada presencialmente con chip de hardware Tangem NFC."
            : "Physical goods verified and accepted in-person with Tangem NFC hardware chip."}
        </p>

        {/* Detailed Breakdown Card */}
        <div className="w-full bg-slate-950/80 border border-white/10 rounded-2xl p-4 flex flex-col gap-2.5 text-left text-xs font-mono my-3 shadow-inner">
          <div className="flex justify-between items-center text-[11px] pb-1.5 border-b border-white/5">
            <span className="text-slate-400">{language === "es" ? "Corredor:" : "Corridor:"}</span>
            <span className="text-white font-bold">🇨🇱 Arica ➔ 🇧🇴 Santa Cruz</span>
          </div>

          <div className="flex justify-between items-center text-[11px] pb-1.5 border-b border-white/5">
            <span className="text-slate-400">{language === "es" ? "Manifiesto Aduanero:" : "Customs Manifest:"}</span>
            <span className="text-cyan-400 font-bold">{manifestId}</span>
          </div>

          <div className="flex justify-between items-center text-[11px] pb-1.5 border-b border-white/5">
            <span className="text-slate-400">{language === "es" ? "Validación Hardware:" : "Hardware Validation:"}</span>
            <span className="text-emerald-400 font-bold">Tangem CC EAL6+ (EIP-712)</span>
          </div>

          <div className="flex justify-between items-center text-[11px] pb-1.5 border-b border-white/5">
            <span className="text-slate-400">{language === "es" ? "Red Blockchain:" : "Blockchain Network:"}</span>
            <span className="text-white font-bold">Avalanche Fuji C-Chain</span>
          </div>

          {/* Atomic Settlement Distribution */}
          <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/20 flex flex-col gap-1 mt-1">
            <div className="flex justify-between items-center">
              <span className="text-emerald-300 font-semibold">
                {language === "es" ? "Transportista (99.5%):" : "Carrier Payout (99.5%):"}
              </span>
              <span className="text-base font-bold text-white">${carrierPayout} USDC</span>
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span>{language === "es" ? "Comisión RoutePay (0.5%):" : "Protocol Fee (0.5%):"}</span>
              <span>${protocolFee} USDC</span>
            </div>
          </div>

          {/* Transaction Link */}
          <div className="pt-1 text-center">
            <a
              href={`${explorerUrl}/tx/${displayHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-mono break-all inline-flex items-center gap-1"
            >
              <span>Tx: {displayHash.slice(0, 16)}...{displayHash.slice(-8)}</span>
              <span>(SnowTrace ↗)</span>
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/10 transition-all"
          >
            {language === "es" ? "Cerrar" : "Close"}
          </button>
          <button
            onClick={onResetDemo}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black text-xs font-extrabold shadow-lg shadow-emerald-500/20 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1"
          >
            <span>↺</span>
            <span>{language === "es" ? "Reiniciar Demo" : "Reset Demo"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

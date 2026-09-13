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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-up">
      <div
        className="w-full max-w-sm rp-card p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden"
        style={{ background: "#FFFFFF", borderColor: "var(--border)" }}
      >
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-3">
          <div className="flex items-center gap-2 text-left">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-white shadow-md shadow-[#08A16E]/30"
              style={{ background: "linear-gradient(135deg, #08A16E 0%, #1ABD7C 100%)" }}
            >
              P
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider font-bold" style={{ color: "var(--green-main)" }}>
                POLLAR ON-RAMP · BOB ➔ USDC
              </p>
              <h3 className="text-sm font-extrabold" style={{ color: "var(--navy)" }}>
                {language === "es" ? "Pago QR Simple Bolivia" : "Bolivia Simple QR Payment"}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors text-xs font-bold"
          >
            ✕
          </button>
        </div>

        {/* QR Code Container with High-Tech Laser Sweep */}
        <div
          className="relative my-2 p-3.5 bg-white rounded-2xl shadow-sm border-2 flex flex-col items-center justify-center overflow-hidden"
          style={{ borderColor: "rgba(8, 161, 110, 0.4)" }}
        >
          {/* Laser Scanner Bar */}
          {!isPaid && <div className="qr-laser-scanner"></div>}

          <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="150" height="150" fill="white" />
            <rect x="10" y="10" width="36" height="36" rx="6" fill="#012053" />
            <rect x="16" y="16" width="24" height="24" rx="3" fill="white" />
            <rect x="22" y="22" width="12" height="12" rx="2" fill="#012053" />

            <rect x="104" y="10" width="36" height="36" rx="6" fill="#012053" />
            <rect x="110" y="16" width="24" height="24" rx="3" fill="white" />
            <rect x="116" y="22" width="12" height="12" rx="2" fill="#012053" />

            <rect x="10" y="104" width="36" height="36" rx="6" fill="#012053" />
            <rect x="16" y="110" width="24" height="24" rx="3" fill="white" />
            <rect x="22" y="116" width="12" height="12" rx="2" fill="#012053" />

            <rect x="56" y="14" width="8" height="8" rx="1" fill="#08A16E" />
            <rect x="70" y="14" width="8" height="8" rx="1" fill="#08A16E" />
            <rect x="84" y="14" width="8" height="8" rx="1" fill="#08A16E" />
            <rect x="56" y="28" width="8" height="8" rx="1" fill="#08A16E" />
            <rect x="74" y="32" width="16" height="8" rx="1" fill="#012053" />

            <rect x="14" y="56" width="8" height="8" rx="1" fill="#08A16E" />
            <rect x="28" y="56" width="8" height="8" rx="1" fill="#012053" />
            <rect x="42" y="56" width="8" height="8" rx="1" fill="#08A16E" />
            <rect x="56" y="56" width="12" height="12" rx="2" fill="#08A16E" />
            <rect x="72" y="52" width="10" height="10" rx="2" fill="#012053" />
            <rect x="86" y="56" width="8" height="8" rx="1" fill="#08A16E" />
            <rect x="104" y="56" width="16" height="8" rx="1" fill="#012053" />
            <rect x="126" y="56" width="8" height="8" rx="1" fill="#08A16E" />

            <rect x="14" y="72" width="16" height="8" rx="1" fill="#012053" />
            <rect x="36" y="70" width="8" height="8" rx="1" fill="#08A16E" />
            <rect x="52" y="74" width="10" height="10" rx="2" fill="#012053" />
            <rect x="68" y="68" width="14" height="14" rx="2" fill="#08A16E" />
            <rect x="88" y="72" width="16" height="8" rx="1" fill="#012053" />
            <rect x="110" y="70" width="8" height="8" rx="1" fill="#08A16E" />
            <rect x="124" y="72" width="12" height="8" rx="1" fill="#012053" />

            <rect x="56" y="92" width="8" height="8" rx="1" fill="#08A16E" />
            <rect x="70" y="88" width="10" height="10" rx="2" fill="#012053" />
            <rect x="86" y="92" width="8" height="8" rx="1" fill="#08A16E" />
            <rect x="104" y="88" width="16" height="16" rx="2" fill="#012053" />
            <rect x="126" y="92" width="8" height="8" rx="1" fill="#08A16E" />

            <rect x="56" y="110" width="16" height="8" rx="1" fill="#012053" />
            <rect x="78" y="114" width="8" height="8" rx="1" fill="#08A16E" />
            <rect x="92" y="110" width="12" height="12" rx="2" fill="#08A16E" />
            <rect x="110" y="114" width="8" height="8" rx="1" fill="#012053" />
            <rect x="124" y="110" width="12" height="12" rx="2" fill="#08A16E" />

            <circle cx="75" cy="75" r="16" fill="white" stroke="#08A16E" strokeWidth="2.5" />
            <text x="69" y="81" fill="#08A16E" fontSize="16" fontWeight="bold" fontFamily="sans-serif">
              P
            </text>
          </svg>

          <span className="text-[10px] font-mono text-slate-500 font-bold mt-1">
            SIMPLE · QR INTEROPERABLE
          </span>
        </div>

        {/* Currency Conversion Summary */}
        <div
          className="w-full rounded-2xl p-3.5 flex flex-col gap-1.5 text-left text-xs font-mono my-2 shadow-inner"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          <div className="flex justify-between items-center">
            <span style={{ color: "var(--text-secondary)" }}>
              {language === "es" ? "A pagar en Bolivianos:" : "Pay in Bolivianos:"}
            </span>
            <span className="text-base font-bold font-mono" style={{ color: "var(--green-main)" }}>
              Bs. {bobAmount}
            </span>
          </div>
          <div className="flex justify-between items-center text-[11px]">
            <span style={{ color: "var(--text-secondary)" }}>
              {language === "es" ? "Recibe en Avalanche:" : "Receives on Avalanche:"}
            </span>
            <span className="font-bold" style={{ color: "var(--navy)" }}>${amountUsd} USDC</span>
          </div>
          <div
            className="flex justify-between items-center text-[10px] pt-1"
            style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted)" }}
          >
            <span>Tasa Pollar: 1 USDC = 6.96 BOB</span>
            <span style={{ color: "var(--green-main)" }} className="font-bold">Comisión 0%</span>
          </div>
        </div>

        {/* Supported Bolivian Banks Badges */}
        <div className="w-full flex items-center justify-center gap-1.5 text-[9px] font-mono mb-3">
          {["Banco Unión", "BCP", "BNB", "Ganadero"].map((bank) => (
            <span
              key={bank}
              className="px-2 py-0.5 rounded-md"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
            >
              {bank}
            </span>
          ))}
        </div>

        {/* Action Button */}
        {isPaid ? (
          <div
            className="w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 animate-success-pop shadow-md"
            style={{ background: "rgba(8, 161, 110, 0.15)", border: "1px solid rgba(8, 161, 110, 0.4)", color: "var(--green-main)" }}
          >
            <span>✓</span> {language === "es" ? "¡Pago QR Confirmado en Pollar!" : "QR Payment Confirmed on Pollar!"}
          </div>
        ) : (
          <button
            onClick={handleSimulatePayment}
            disabled={isProcessing}
            type="button"
            className="rp-btn-green w-full py-3.5 text-xs flex items-center justify-center gap-2 shadow-lg"
          >
            {isProcessing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{language === "es" ? "Confirmando transferencia…" : "Confirming transfer…"}</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                  <line x1="12" y1="18" x2="12.01" y2="18"></line>
                </svg>
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

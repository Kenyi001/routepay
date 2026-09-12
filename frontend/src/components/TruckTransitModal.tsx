"use client";

import React, { useEffect, useState } from "react";

interface TruckTransitModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  orderId?: string;
  manifestId?: string;
  amount?: string;
}

export default function TruckTransitModal({
  isOpen,
  onClose,
  title = "Despacho en Ruta Internacional",
  orderId = "1",
  manifestId = "MIC-DTA-2026-AR-BO-0911",
  amount = "2,487.50",
}: TruckTransitModalProps) {
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setIsCompleted(false);
      return;
    }

    // Progression timer: from 0% to 100% in ~2.8 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCompleted(true);
          return 100;
        }
        return prev + 2.5;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900/95 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl shadow-cyan-500/20 flex flex-col items-center text-center relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="w-full flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-left">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <div>
              <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                Corredor Bioceánico Arica ➔ Santa Cruz
              </p>
              <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/10">
            Orden #{orderId}
          </span>
        </div>

        {/* SCENIC ROAD & TRUCK CONTAINER */}
        <div className="w-full relative h-40 bg-gradient-to-b from-[#070b14] via-[#0b1329] to-[#04060c] rounded-2xl border border-white/10 overflow-hidden flex flex-col justify-between p-3 my-2 shadow-inner">
          {/* Mountains silhouette backdrop */}
          <div className="absolute top-4 left-0 right-0 h-16 opacity-30 pointer-events-none flex justify-between items-end px-2">
            <div className="w-24 h-12 bg-slate-700 clip-mountain"></div>
            <div className="w-36 h-16 bg-slate-600 clip-mountain"></div>
            <div className="w-28 h-10 bg-slate-700 clip-mountain"></div>
          </div>

          {/* Location indicator badges */}
          <div className="relative z-10 flex justify-between text-[10px] font-mono text-slate-400">
            <span className={`transition-colors ${progress < 50 ? "text-cyan-400 font-bold" : "text-emerald-400"}`}>
              🇨🇱 Arica (Salida)
            </span>
            <span className={`transition-colors ${progress >= 40 && progress < 85 ? "text-cyan-400 font-bold" : ""}`}>
              🏔️ Tambo Quemado
            </span>
            <span className={`transition-colors ${progress >= 85 ? "text-emerald-400 font-bold" : ""}`}>
              🇧🇴 Santa Cruz
            </span>
          </div>

          {/* CYBER-TRUCK & ROAD SECTION */}
          <div className="relative w-full h-24 flex items-end pb-2">
            {/* The Road Surface */}
            <div className="absolute bottom-1 left-0 right-0 h-9 bg-slate-950 border-t border-slate-700 flex items-center overflow-hidden">
              {/* Moving road dashed line */}
              <svg className="w-full h-2" viewBox="0 0 300 8" preserveAspectRatio="none">
                <line
                  x1="0"
                  y1="4"
                  x2="300"
                  y2="4"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  className="road-moving-dashes"
                />
              </svg>
            </div>

            {/* Heavy Freight Cyber-Truck SVG */}
            <div
              className={`relative z-20 flex items-end transition-all duration-300 truck-bouncing`}
              style={{
                left: `${Math.min(progress * 0.7, 68)}%`,
              }}
            >
              <svg width="115" height="58" viewBox="0 0 115 58" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Headlight beam */}
                <polygon points="102,40 150,25 150,55 102,45" fill="url(#headlightGradient)" className="headlight-glow" />

                {/* Truck Container / Trailer */}
                <rect x="2" y="10" width="70" height="34" rx="3" fill="#0f172a" stroke="#06b6d4" strokeWidth="1.5" />
                <line x1="2" y1="20" x2="72" y2="20" stroke="#06b6d4" strokeWidth="1" opacity="0.4" />
                <line x1="2" y1="32" x2="72" y2="32" stroke="#06b6d4" strokeWidth="1" opacity="0.4" />

                {/* RoutePay Escrow Logo on Container */}
                <rect x="8" y="15" width="56" height="18" rx="2" fill="#020617" />
                <text x="14" y="24" fill="#38bdf8" fontSize="6.5" fontFamily="monospace" fontWeight="bold">
                  ROUTEPAY
                </text>
                <text x="14" y="30" fill="#10b981" fontSize="5" fontFamily="monospace">
                  ESCROW · AVAX
                </text>

                {/* Cabin */}
                <path
                  d="M74 22 H88 L98 32 V44 H74 V22 Z"
                  fill="#1e293b"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />
                {/* Windshield */}
                <path d="M86 25 L94 33 H84 V25 H86 Z" fill="#38bdf8" opacity="0.75" />

                {/* Front Bumper & Grill */}
                <rect x="96" y="38" width="6" height="6" rx="1" fill="#0ea5e9" />

                {/* Wheels */}
                {/* Back trailer wheels */}
                <circle cx="16" cy="45" r="6" fill="#020617" stroke="#94a3b8" strokeWidth="2" />
                <circle cx="16" cy="45" r="2.5" fill="#38bdf8" />

                <circle cx="32" cy="45" r="6" fill="#020617" stroke="#94a3b8" strokeWidth="2" />
                <circle cx="32" cy="45" r="2.5" fill="#38bdf8" />

                {/* Front wheels */}
                <circle cx="88" cy="45" r="6" fill="#020617" stroke="#94a3b8" strokeWidth="2" />
                <circle cx="88" cy="45" r="2.5" fill="#38bdf8" />

                <defs>
                  <linearGradient id="headlightGradient" x1="102" y1="42" x2="150" y2="40" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#38bdf8" stopOpacity="0.6" />
                    <stop offset="1" stopColor="#38bdf8" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="w-full flex flex-col gap-1.5 my-2">
          <div className="flex justify-between text-[11px] font-mono text-slate-300">
            <span>{isCompleted ? "Ruta completada" : "En marcha hacia aduana..."}</span>
            <span className="text-cyan-400 font-bold">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 rounded-full transition-all duration-150 shadow-md shadow-cyan-500/50"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* DETAILS & SUCCESS CARD */}
        {isCompleted ? (
          <div className="w-full flex flex-col gap-3 p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl mt-2 animate-success-pop text-left">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/30">
                ✓
              </span>
              <h4 className="font-bold text-sm text-emerald-300">¡Salida Confirmada con Éxito!</h4>
            </div>

            <p className="text-xs text-slate-300">
              El camión pesado está registrado en tránsito en la aduana de Arica. Fondos asegurados en Avalanche Fuji:
            </p>

            <div className="bg-slate-900/80 p-2.5 rounded-xl border border-white/5 flex justify-between items-center font-mono text-xs">
              <span className="text-slate-400">Garantía Retenida:</span>
              <span className="font-bold text-emerald-400 text-sm">${amount} USDC</span>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
              <span>Manifiesto: {manifestId}</span>
              <span className="text-cyan-400">Verificado en Fuji</span>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-extrabold text-xs shadow-lg shadow-emerald-500/25 hover:opacity-95 active:scale-95 transition-all"
            >
              Continuar al Panel de Monitoreo ➔
            </button>
          </div>
        ) : (
          <div className="w-full p-3 bg-slate-950/50 border border-white/5 rounded-xl mt-2 text-xs text-slate-400 flex items-center justify-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            Registrando coordenadas y manifiesto en Avalanche...
          </div>
        )}
      </div>
    </div>
  );
}

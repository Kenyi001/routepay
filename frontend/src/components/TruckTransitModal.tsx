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
  orderId = "101",
  manifestId = "MIC-DTA-2026-AR-BO-0911",
  amount = "2,487.50",
}: TruckTransitModalProps) {
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Live Telemetry Simulation
  const speed = progress > 0 && progress < 100 ? 84 : 0;
  const altitude =
    progress < 30
      ? 15 // Arica sea level
      : progress < 80
      ? Math.round(4680 * (progress / 80)) // Mountain pass at Tambo Quemado
      : Math.round(4680 - (4680 - 416) * ((progress - 80) / 20)); // Santa Cruz valley

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setIsCompleted(false);
      return;
    }

    // Smooth progress animation: 0% to 100% in ~3.2 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCompleted(true);
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-[#27272A] border border-white/15 rounded-3xl p-6 shadow-2xl shadow-[#E84142]/25 flex flex-col items-center text-center relative overflow-hidden">
        {/* Ambient glow halos */}
        <div className="absolute -top-24 -left-24 w-56 h-56 bg-[#E84142]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-[#10B981]/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Modal Header */}
        <div className="w-full flex justify-between items-center mb-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-3 h-3 rounded-full bg-[#E84142] animate-ping"></div>
            <div>
              <p className="text-[10px] font-mono text-[#E84142] uppercase tracking-wider font-black">
                Corredor Bioceánico Arica ➔ Santa Cruz
              </p>
              <h3 className="text-base font-black text-white tracking-tight">{title}</h3>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#18181B] text-slate-300 border border-white/10 font-bold">
            Orden #{orderId}
          </span>
        </div>

        {/* LIVE TELEMETRY HUD BAR */}
        <div className="w-full bg-[#18181B] rounded-xl p-2.5 mb-2 border border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">GPS:</span>
            <span className="text-[#E84142] font-bold">
              {progress < 40 ? "18.478° S, 70.312° W" : progress < 85 ? "18.279° S, 69.043° W" : "17.783° S, 63.182° W"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div>
              <span className="text-slate-400">Velocidad: </span>
              <span className="text-white font-bold">{speed} km/h</span>
            </div>
            <div>
              <span className="text-slate-400">Altitud: </span>
              <span className="text-[#10B981] font-bold">{altitude.toLocaleString()} m</span>
            </div>
          </div>
        </div>

        {/* HIGH-TECH SCENIC ROAD & CYBER-TRUCK CANVAS */}
        <div className="w-full relative h-48 bg-gradient-to-b from-[#070B14] via-[#0D1B2A] to-[#121214] rounded-2xl border border-white/15 overflow-hidden flex flex-col justify-between p-3.5 my-1 shadow-2xl">
          {/* Starfield Backdrop */}
          <div className="absolute top-2 left-4 right-4 h-12 flex justify-between pointer-events-none opacity-60 star-field">
            <span className="text-[8px] text-white">✦</span>
            <span className="text-[6px] text-slate-300">✦</span>
            <span className="text-[9px] text-white">★</span>
            <span className="text-[6px] text-slate-300">✦</span>
            <span className="text-[8px] text-white">✦</span>
          </div>

          {/* Andean Mountain Silhouette Backdrop */}
          <div className="absolute top-5 left-0 right-0 h-20 opacity-30 pointer-events-none flex items-end justify-between px-1">
            <svg viewBox="0 0 500 80" className="w-full h-full fill-slate-700 stroke-[#E84142]/40" strokeWidth="1">
              <path d="M0,80 L40,50 L90,65 L150,30 L220,70 L300,20 L370,60 L440,35 L500,80 Z" />
            </svg>
          </div>

          {/* Location Waypoints Header */}
          <div className="relative z-10 flex justify-between text-[10px] font-mono text-slate-400 pt-1">
            <span
              className={`transition-colors duration-300 ${
                progress < 40 ? "text-[#E84142] font-black underline" : "text-[#10B981] font-bold"
              }`}
            >
              🇨🇱 Arica (Puerto)
            </span>
            <span
              className={`transition-colors duration-300 ${
                progress >= 40 && progress < 85 ? "text-[#E84142] font-black underline" : ""
              }`}
            >
              🏔️ Tambo Quemado (Aduana)
            </span>
            <span
              className={`transition-colors duration-300 ${
                progress >= 85 ? "text-[#10B981] font-black underline" : ""
              }`}
            >
              🇧🇴 Santa Cruz (Destino)
            </span>
          </div>

          {/* CYBER-TRUCK & ANIMATED ROAD SECTION */}
          <div className="relative w-full h-28 flex items-end pb-1">
            {/* The Road Surface */}
            <div className="absolute bottom-2 left-0 right-0 h-10 bg-[#121214] border-t-2 border-slate-700 flex items-center overflow-hidden shadow-inner">
              {/* Moving road dashed lane line */}
              <svg className="w-full h-2" viewBox="0 0 300 8" preserveAspectRatio="none">
                <line
                  x1="0"
                  y1="4"
                  x2="300"
                  y2="4"
                  stroke="#E84142"
                  strokeWidth="3"
                  strokeDasharray="14 14"
                  className="road-moving-dashes"
                />
              </svg>
            </div>

            {/* Dust Particles behind truck */}
            {!isCompleted && (
              <div
                className="absolute bottom-4 z-10 pointer-events-none dust-particles"
                style={{
                  left: `${Math.min(progress * 0.7, 70)}%`,
                }}
              >
                <div className="w-2 h-2 rounded-full bg-slate-500/40 blur-xs"></div>
                <div className="w-3 h-3 rounded-full bg-slate-400/30 blur-xs -ml-2"></div>
              </div>
            )}

            {/* Ultra-Detailed Heavy Freight Cyber-Truck SVG */}
            <div
              className={`relative z-20 flex items-end transition-all duration-300 ${
                !isCompleted ? "truck-bouncing" : ""
              }`}
              style={{
                left: `${Math.min(progress * 0.7, 72)}%`,
              }}
            >
              <svg width="130" height="66" viewBox="0 0 130 66" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Headlight beam projection cone */}
                <polygon
                  points="114,46 175,25 175,64 114,52"
                  fill="url(#headlightGradient)"
                  className="headlight-glow"
                />

                {/* Red Tail Light Beam Trail */}
                <rect x="-15" y="44" width="18" height="4" fill="url(#tailGradient)" opacity="0.7" />

                {/* Main Heavy Freight Container Body */}
                <rect x="2" y="10" width="82" height="38" rx="4" fill="url(#containerGradient)" stroke="#E84142" strokeWidth="1.5" />
                <line x1="2" y1="22" x2="84" y2="22" stroke="#E84142" strokeWidth="1" opacity="0.35" />
                <line x1="2" y1="36" x2="84" y2="36" stroke="#E84142" strokeWidth="1" opacity="0.35" />

                {/* Metallic Container Rib Lines */}
                <line x1="22" y1="10" x2="22" y2="48" stroke="#121214" strokeWidth="1" opacity="0.5" />
                <line x1="42" y1="10" x2="42" y2="48" stroke="#121214" strokeWidth="1" opacity="0.5" />
                <line x1="62" y1="10" x2="62" y2="48" stroke="#121214" strokeWidth="1" opacity="0.5" />

                {/* RoutePay Branding & Escrow Decal */}
                <rect x="8" y="15" width="68" height="22" rx="3" fill="#121214" stroke="#E84142" strokeWidth="1" />
                <text x="14" y="26" fill="#FFFFFF" fontSize="7.5" fontFamily="monospace" fontWeight="900">
                  ROUTEPAY
                </text>
                <text x="14" y="33" fill="#10B981" fontSize="5.5" fontFamily="monospace" fontWeight="bold">
                  ESCROW · AVAX FUJI
                </text>

                {/* Active Status LED on Container */}
                <circle cx="70" cy="22" r="2" fill="#10B981" className="animate-pulse" />

                {/* Aerodynamic Cabin Head */}
                <path
                  d="M86 24 H102 L114 36 V50 H86 V24 Z"
                  fill="url(#cabinGradient)"
                  stroke="#E84142"
                  strokeWidth="1.5"
                />

                {/* Cabin Windshield Tint */}
                <path d="M100 27 L110 37 H98 V27 H100 Z" fill="#E84142" opacity="0.8" />

                {/* Front Bumper & Red LED Grille Bar */}
                <rect x="112" y="44" width="6" height="6" rx="1.5" fill="#E84142" />
                <rect x="108" y="46" width="4" height="2" fill="#FFFFFF" />

                {/* Heavy Duty Wheels with Spinning Spokes */}
                {/* Back Trailer Wheel 1 */}
                <g transform="translate(18, 51)">
                  <circle cx="0" cy="0" r="7" fill="#121214" stroke="#94A3B8" strokeWidth="2" />
                  <g className={!isCompleted ? "wheel-spinning" : ""}>
                    <line x1="-5" y1="0" x2="5" y2="0" stroke="#E84142" strokeWidth="1.5" />
                    <line x1="0" y1="-5" x2="0" y2="5" stroke="#E84142" strokeWidth="1.5" />
                  </g>
                  <circle cx="0" cy="0" r="2" fill="#FFFFFF" />
                </g>

                {/* Back Trailer Wheel 2 */}
                <g transform="translate(36, 51)">
                  <circle cx="0" cy="0" r="7" fill="#121214" stroke="#94A3B8" strokeWidth="2" />
                  <g className={!isCompleted ? "wheel-spinning" : ""}>
                    <line x1="-5" y1="0" x2="5" y2="0" stroke="#E84142" strokeWidth="1.5" />
                    <line x1="0" y1="-5" x2="0" y2="5" stroke="#E84142" strokeWidth="1.5" />
                  </g>
                  <circle cx="0" cy="0" r="2" fill="#FFFFFF" />
                </g>

                {/* Front Steering Wheel */}
                <g transform="translate(100, 51)">
                  <circle cx="0" cy="0" r="7" fill="#121214" stroke="#94A3B8" strokeWidth="2" />
                  <g className={!isCompleted ? "wheel-spinning" : ""}>
                    <line x1="-5" y1="0" x2="5" y2="0" stroke="#E84142" strokeWidth="1.5" />
                    <line x1="0" y1="-5" x2="0" y2="5" stroke="#E84142" strokeWidth="1.5" />
                  </g>
                  <circle cx="0" cy="0" r="2" fill="#FFFFFF" />
                </g>

                {/* Gradients */}
                <defs>
                  <linearGradient id="headlightGradient" x1="114" y1="48" x2="175" y2="45" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#E84142" stopOpacity="0.75" />
                    <stop offset="1" stopColor="#E84142" stopOpacity="0" />
                  </linearGradient>

                  <linearGradient id="tailGradient" x1="3" y1="46" x2="-15" y2="46" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#E84142" stopOpacity="0.8" />
                    <stop offset="1" stopColor="#E84142" stopOpacity="0" />
                  </linearGradient>

                  <linearGradient id="containerGradient" x1="2" y1="10" x2="84" y2="48" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#1E3A8A" />
                    <stop offset="0.6" stopColor="#0D1B2A" />
                    <stop offset="1" stopColor="#121214" />
                  </linearGradient>

                  <linearGradient id="cabinGradient" x1="86" y1="24" x2="114" y2="50" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#27272A" />
                    <stop offset="1" stopColor="#18181B" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* PROGRESS BAR & PERCENTAGE */}
        <div className="w-full flex flex-col gap-1.5 my-3">
          <div className="flex justify-between text-[11px] font-mono text-slate-200 font-medium">
            <span>{isCompleted ? "✓ Ruta bioceánica completada" : "Transitando tramo Tambo Quemado..."}</span>
            <span className="text-[#E84142] font-black">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2.5 bg-[#18181B] rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#E84142] via-[#1E3A8A] to-[#10B981] rounded-full transition-all duration-150 shadow-md shadow-[#E84142]/40"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* DETAILS & SUCCESS CARD */}
        {isCompleted ? (
          <div className="w-full flex flex-col gap-3 p-4 bg-[#10B981]/15 border border-[#10B981]/40 rounded-2xl mt-1 text-left animate-success-pop shadow-xl">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center font-black text-base border border-[#10B981]/40 shadow-inner">
                ✓
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-[#10B981]">¡Salida Confirmada y en Regla!</h4>
                <p className="text-[10px] text-slate-300 font-mono">Manifiesto aduanero validado en Avalanche Fuji</p>
              </div>
            </div>

            <div className="bg-[#18181B] p-3 rounded-xl border border-white/5 flex justify-between items-center font-mono text-xs shadow-inner">
              <span className="text-slate-400">Fondos Garantizados en Custodia:</span>
              <span className="font-black text-[#10B981] text-base">${amount} USDC</span>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-1">
              <span>MIC/DTA: {manifestId}</span>
              <span className="text-[#10B981] font-bold">Smart Contract Locked</span>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-1 py-3 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white font-black text-xs shadow-lg shadow-[#10B981]/30 hover:opacity-95 active:scale-98 transition-all"
            >
              Continuar al Panel de Monitoreo ➔
            </button>
          </div>
        ) : (
          <div className="w-full p-3 bg-[#18181B] border border-white/5 rounded-xl mt-1 text-xs text-slate-300 flex items-center justify-center gap-2 font-mono shadow-inner">
            <span className="w-2 h-2 rounded-full bg-[#E84142] animate-ping"></span>
            Registrando coordenadas GPS y manifiesto en Avalanche...
          </div>
        )}
      </div>
    </div>
  );
}

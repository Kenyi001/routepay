"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

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
  title,
  orderId = "1",
  manifestId = "MIC-DTA-2026-AR-BO-0911",
  amount = "2,487.50",
}: TruckTransitModalProps) {
  const { t, language } = useLanguage();
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const displayTitle = title || t.truckModal.title;

  // Determine active tramo
  const currentTramo = progress < 40 ? 1 : progress < 85 ? 2 : 3;

  // Live Telemetry Simulation
  const speed = progress > 0 && progress < 100 ? (progress < 20 || progress > 80 ? 65 : 88) : 0;
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

    // Eased velocity progression: 0% to 100% in ~3.2 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCompleted(true);
          return 100;
        }
        const delta = prev < 15 ? 1.6 : prev > 85 ? 1.6 : 2.4;
        return Math.min(prev + delta, 100);
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-up">
      <div className="w-full max-w-lg bg-[#1F2937] border border-white/15 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-[#0A58CA]/25 flex flex-col items-center text-center relative overflow-hidden">
        {/* Ambient glow halos */}
        <div className="absolute -top-24 -left-24 w-56 h-56 bg-[#0A58CA]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-[#E84142]/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Modal Header */}
        <div className="w-full flex justify-between items-center mb-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-3 h-3 rounded-full bg-[#E84142] animate-ping"></div>
            <div>
              <p className="text-[10px] font-mono text-[#0A58CA] uppercase tracking-wider font-black">
                {t.truckModal.corridor}
              </p>
              <h3 className="text-base font-black text-white tracking-tight">{displayTitle}</h3>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#0F172A] text-slate-300 border border-white/10 font-bold">
            {t.truckModal.order} #{orderId}
          </span>
        </div>

        {/* DYNAMIC ACTIVE TRAMO HUD CARD */}
        <div className="w-full bg-[#0F172A] rounded-2xl p-3 mb-2.5 border border-white/10 shadow-lg text-left transition-all">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-blue-300 font-black flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0A58CA] animate-pulse"></span>
              {currentTramo === 1 && (language === "es" ? "📍 Tramo 1: Despacho en Puerto (Chile)" : "📍 Leg 1: Port Dispatch (Chile)")}
              {currentTramo === 2 && (language === "es" ? "🏔️ Tramo 2: Aduana Fronteriza (Tambo Quemado)" : "🏔️ Leg 2: Customs Border (Tambo Quemado)")}
              {currentTramo === 3 && (language === "es" ? "📦 Tramo 3: Arribo a Almacén Central (Santa Cruz)" : "📦 Leg 3: Central Warehouse Arrival (Santa Cruz)")}
            </span>

            <span
              className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                currentTramo === 1
                  ? "bg-[#0A58CA]/25 text-blue-300 border border-[#0A58CA]/40"
                  : currentTramo === 2
                  ? "bg-[#E84142]/25 text-[#E84142] border border-[#E84142]/40"
                  : "bg-[#10B981]/25 text-[#10B981] border border-[#10B981]/40"
              }`}
            >
              {currentTramo === 1 && (language === "es" ? "Salida" : "Departure")}
              {currentTramo === 2 && (language === "es" ? "Aduana 4,680m" : "Customs 4,680m")}
              {currentTramo === 3 && (language === "es" ? "Destino Final" : "Final Destination")}
            </span>
          </div>

          <p className="text-xs font-semibold text-white">
            {currentTramo === 1 && (language === "es" ? "Carga pesada inspeccionada y saliendo del Puerto de Arica." : "Heavy freight inspected and leaving Port of Arica.")}
            {currentTramo === 2 && (language === "es" ? "Revisión de precintos y manifiesto MIC/DTA en paso cordillerano." : "Seal and manifest MIC/DTA inspection at mountain pass.")}
            {currentTramo === 3 && (language === "es" ? "Llegada a almacén central. Listo para Tap de confirmación Tangem NFC." : "Arrived at central warehouse. Ready for Tangem NFC tap confirmation.")}
          </p>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2 pt-2 border-t border-white/5">
            <span>Velocidad: <strong className="text-white">{speed} km/h</strong></span>
            <span>Altitud: <strong className="text-white">{altitude} msnm</strong></span>
            <span>Distancia: <strong className="text-[#0A58CA]">{Math.round((progress / 100) * 1200)} / 1,200 km</strong></span>
          </div>
        </div>

        {/* WAYPOINT STEPPER BAR WITH ACTIVE NODE PULSE */}
        <div className="w-full flex items-center justify-between px-2 mb-2.5 text-[10px] font-mono">
          <div className="flex flex-col items-start">
            <span className={`font-black flex items-center gap-1 ${currentTramo >= 1 ? "text-blue-300" : "text-slate-500"}`}>
              <span className={`w-2.5 h-2.5 rounded-full ${currentTramo >= 1 ? "bg-[#0A58CA] shadow-md shadow-[#0A58CA]" : "bg-slate-700"} ${currentTramo === 1 ? "animate-pulse" : ""}`}></span>
              {t.truckModal.arica}
            </span>
            <span className="text-[9px] text-slate-500 pl-3.5">Km 0 · 15m</span>
          </div>

          <div className="flex-1 h-[2.5px] mx-2 bg-slate-800 relative rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0A58CA] to-[#E84142] transition-all duration-150"
              style={{ width: `${Math.min(progress * 2.5, 100)}%` }}
            ></div>
          </div>

          <div className="flex flex-col items-center">
            <span className={`font-black flex items-center gap-1 ${currentTramo >= 2 ? "text-[#E84142]" : "text-slate-500"}`}>
              <span className={`w-2.5 h-2.5 rounded-full ${currentTramo >= 2 ? "bg-[#E84142] shadow-md shadow-[#E84142]" : "bg-slate-700"} ${currentTramo === 2 ? "animate-pulse" : ""}`}></span>
              {t.truckModal.tambo}
            </span>
            <span className="text-[9px] text-slate-500">Km 480 · 4,680m</span>
          </div>

          <div className="flex-1 h-[2.5px] mx-2 bg-slate-800 relative rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#E84142] to-[#10B981] transition-all duration-150"
              style={{ width: `${Math.max(0, Math.min((progress - 40) * 2.2, 100))}%` }}
            ></div>
          </div>

          <div className="flex flex-col items-end">
            <span className={`font-black flex items-center gap-1 ${currentTramo >= 3 ? "text-[#10B981]" : "text-slate-500"}`}>
              <span className={`w-2.5 h-2.5 rounded-full ${currentTramo >= 3 ? "bg-[#10B981] shadow-md shadow-[#10B981]" : "bg-slate-700"} ${currentTramo === 3 ? "animate-pulse" : ""}`}></span>
              {t.truckModal.santaCruz}
            </span>
            <span className="text-[9px] text-slate-500 pr-3.5">Km 1,200 · 416m</span>
          </div>
        </div>

        {/* SCENIC ROAD & CYBER-TRUCK CONTAINER */}
        <div className="w-full relative h-48 bg-gradient-to-b from-[#0B0F19] via-[#0F172A] to-[#04060C] rounded-2xl border border-white/10 overflow-hidden flex flex-col justify-between p-3 my-1 shadow-2xl">
          {/* Mountains silhouette backdrop */}
          <div className="absolute top-2 left-0 right-0 h-28 opacity-45 pointer-events-none flex justify-between items-end px-1">
            {/* Mountain 1 - Arica Volcanos */}
            <svg width="120" height="90" viewBox="0 0 120 90" fill="none" className="translate-y-2">
              <polygon points="0,90 60,10 120,90" fill="#1E293B" />
              <polygon points="45,30 60,10 75,30" fill="#94A3B8" opacity="0.6" />
            </svg>

            {/* Mountain 2 - Sajama Peak (Bolivia 6,542m) */}
            <svg width="180" height="110" viewBox="0 0 180 110" fill="none" className="-mx-8 z-0">
              <polygon points="0,110 90,5 180,110" fill="#0F172A" />
              <polygon points="70,30 90,5 110,30" fill="#CBD5E1" opacity="0.8" />
            </svg>

            {/* Mountain 3 - Cordillera Real */}
            <svg width="140" height="95" viewBox="0 0 140 95" fill="none" className="translate-y-1">
              <polygon points="0,95 70,15 140,95" fill="#1E293B" />
              <polygon points="55,35 70,15 85,35" fill="#94A3B8" opacity="0.5" />
            </svg>
          </div>

          {/* Stars & Night Sky Effect */}
          <div className="absolute top-2 left-6 w-1 h-1 bg-white rounded-full opacity-60 star-field"></div>
          <div className="absolute top-5 left-28 w-1.5 h-1.5 bg-blue-200 rounded-full opacity-80 animate-pulse"></div>
          <div className="absolute top-3 right-20 w-1 h-1 bg-white rounded-full opacity-70 star-field"></div>
          <div className="absolute top-8 right-36 w-1 h-1 bg-amber-100 rounded-full opacity-50"></div>

          {/* CYBER-TRUCK & ROAD SECTION */}
          <div className="relative w-full h-32 flex items-end pb-1 mt-auto">
            {/* The Road Surface */}
            <div className="absolute bottom-1 left-0 right-0 h-11 bg-[#020617] border-t-2 border-slate-600 flex items-center overflow-hidden shadow-2xl">
              {/* Moving road dashed line */}
              <svg className="w-full h-3" viewBox="0 0 400 12" preserveAspectRatio="none">
                <line
                  x1="0"
                  y1="6"
                  x2="400"
                  y2="6"
                  stroke="#F59E0B"
                  strokeWidth="3.5"
                  className="road-moving-dashes"
                />
              </svg>
            </div>

            {/* Dust Particles trailing behind wheels */}
            {!isCompleted && (
              <div
                className="absolute bottom-3.5 z-10 pointer-events-none dust-particles"
                style={{
                  left: `${Math.min(progress * 0.68, 65)}%`,
                }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-slate-400/40 blur-xs"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-slate-300/30 blur-xs -ml-2"></div>
              </div>
            )}

            {/* Heavy Freight Cyber-Truck SVG with Custom Color Accents */}
            <div
              className={`relative z-20 flex items-end transition-all duration-300 ${!isCompleted ? "truck-bouncing" : ""}`}
              style={{
                left: `${Math.min(progress * 0.68, 66)}%`,
              }}
            >
              <svg width="135" height="68" viewBox="0 0 135 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Dual Headlight Beams */}
                <polygon points="120,44 190,26 190,64 120,52" fill="url(#headlightBeamGradient)" className="headlight-glow" />

                {/* Truck Container / Trailer with Electric Sapphire Frame */}
                <rect x="2" y="10" width="82" height="40" rx="4" fill="url(#containerGradient)" stroke="#0A58CA" strokeWidth="2" />
                <line x1="2" y1="22" x2="84" y2="22" stroke="#0A58CA" strokeWidth="1.5" opacity="0.6" />
                <line x1="2" y1="36" x2="84" y2="36" stroke="#0A58CA" strokeWidth="1.5" opacity="0.6" />

                {/* Vertical aerodynamic container ribs */}
                <line x1="22" y1="10" x2="22" y2="50" stroke="#0F172A" strokeWidth="1" opacity="0.5" />
                <line x1="42" y1="10" x2="42" y2="50" stroke="#0F172A" strokeWidth="1" opacity="0.5" />
                <line x1="62" y1="10" x2="62" y2="50" stroke="#0F172A" strokeWidth="1" opacity="0.5" />

                {/* RoutePay Escrow Logo on Container */}
                <rect x="8" y="16" width="68" height="22" rx="3" fill="#020617" stroke="#1E293B" strokeWidth="1" />
                <text x="14" y="27" fill="#38BDF8" fontSize="7.5" fontFamily="monospace" fontWeight="900" letterSpacing="1">
                  ROUTEPAY
                </text>
                <text x="14" y="34" fill="#E84142" fontSize="5.5" fontFamily="monospace" fontWeight="bold">
                  AVALANCHE FUJI ESCROW
                </text>

                {/* Connecting Joint Hitch */}
                <rect x="84" y="36" width="6" height="6" fill="#374151" />

                {/* Cabin (Heavy Truck Semi Cab) */}
                <path
                  d="M86 24 H104 L116 36 V52 H86 V24 Z"
                  fill="url(#cabinGradient)"
                  stroke="#E84142"
                  strokeWidth="2"
                />

                {/* Windshield with Night Reflection */}
                <path d="M102 27 L112 37 H98 V27 H102 Z" fill="#38BDF8" opacity="0.85" />

                {/* Cabin Door Window */}
                <rect x="90" y="28" width="6" height="7" rx="1" fill="#020617" opacity="0.7" />

                {/* Aerodynamic Roof Spoiler */}
                <path d="M86 24 L102 18 V24 H86 Z" fill="#E84142" opacity="0.9" />

                {/* Front Bumper & Crimson Grill */}
                <rect x="114" y="44" width="7" height="8" rx="2" fill="#E84142" />
                <line x1="115" y1="46" x2="120" y2="46" stroke="#FFFFFF" strokeWidth="1" />
                <line x1="115" y1="49" x2="120" y2="49" stroke="#FFFFFF" strokeWidth="1" />

                {/* Twin Vertical Exhaust Chimney behind cab */}
                <rect x="87" y="12" width="2" height="12" fill="#9CA3AF" />
                <rect x="87" y="10" width="3" height="2" fill="#D1D5DB" />

                {/* WHEELS with Animated Hubcap Illusion */}
                {/* Back Trailer Wheel 1 */}
                <g transform="translate(16, 53)">
                  <circle cx="0" cy="0" r="7" fill="#020617" stroke="#6B7280" strokeWidth="2.5" />
                  <g className={!isCompleted ? "wheel-spinning" : ""}>
                    <line x1="-5" y1="0" x2="5" y2="0" stroke="#E84142" strokeWidth="1.5" />
                    <line x1="0" y1="-5" x2="0" y2="5" stroke="#E84142" strokeWidth="1.5" />
                  </g>
                  <circle cx="0" cy="0" r="2" fill="#FFFFFF" />
                </g>

                {/* Back Trailer Wheel 2 */}
                <g transform="translate(34, 53)">
                  <circle cx="0" cy="0" r="7" fill="#020617" stroke="#6B7280" strokeWidth="2.5" />
                  <g className={!isCompleted ? "wheel-spinning" : ""}>
                    <line x1="-5" y1="0" x2="5" y2="0" stroke="#E84142" strokeWidth="1.5" />
                    <line x1="0" y1="-5" x2="0" y2="5" stroke="#E84142" strokeWidth="1.5" />
                  </g>
                  <circle cx="0" cy="0" r="2" fill="#FFFFFF" />
                </g>

                {/* Tractor Intermediate Wheel */}
                <g transform="translate(82, 53)">
                  <circle cx="0" cy="0" r="7" fill="#020617" stroke="#6B7280" strokeWidth="2.5" />
                  <g className={!isCompleted ? "wheel-spinning" : ""}>
                    <line x1="-5" y1="0" x2="5" y2="0" stroke="#0A58CA" strokeWidth="1.5" />
                    <line x1="0" y1="-5" x2="0" y2="5" stroke="#0A58CA" strokeWidth="1.5" />
                  </g>
                  <circle cx="0" cy="0" r="2" fill="#FFFFFF" />
                </g>

                {/* Front Steer Wheel */}
                <g transform="translate(106, 53)">
                  <circle cx="0" cy="0" r="7" fill="#020617" stroke="#6B7280" strokeWidth="2.5" />
                  <g className={!isCompleted ? "wheel-spinning" : ""}>
                    <line x1="-5" y1="0" x2="5" y2="0" stroke="#E84142" strokeWidth="1.5" />
                    <line x1="0" y1="-5" x2="0" y2="5" stroke="#E84142" strokeWidth="1.5" />
                  </g>
                  <circle cx="0" cy="0" r="2" fill="#FFFFFF" />
                </g>

                {/* Gradients */}
                <defs>
                  <linearGradient id="headlightBeamGradient" x1="120" y1="48" x2="190" y2="44" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#38BDF8" stopOpacity="0.75" />
                    <stop offset="0.6" stopColor="#38BDF8" stopOpacity="0.3" />
                    <stop offset="1" stopColor="#38BDF8" stopOpacity="0" />
                  </linearGradient>

                  <linearGradient id="containerGradient" x1="2" y1="10" x2="84" y2="48" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#0A58CA" />
                    <stop offset="0.6" stopColor="#073B8A" />
                    <stop offset="1" stopColor="#0F172A" />
                  </linearGradient>

                  <linearGradient id="cabinGradient" x1="86" y1="24" x2="114" y2="50" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#1F2937" />
                    <stop offset="1" stopColor="#0F172A" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* PROGRESS BAR & PERCENTAGE */}
        <div className="w-full flex flex-col gap-1.5 my-2.5">
          <div className="flex justify-between text-[11px] font-mono text-slate-200 font-medium">
            <span>{isCompleted ? t.truckModal.completed : t.truckModal.inProgress}</span>
            <span className="text-[#0A58CA] font-black">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2.5 bg-[#0F172A] rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#0A58CA] via-[#E84142] to-[#10B981] rounded-full transition-all duration-150 shadow-md shadow-[#0A58CA]/40"
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
                <h4 className="font-extrabold text-sm text-[#10B981]">{t.truckModal.successTitle}</h4>
                <p className="text-[10px] text-slate-300 font-mono">{t.truckModal.successDesc}</p>
              </div>
            </div>

            <div className="bg-[#0F172A] p-3 rounded-xl border border-white/5 flex justify-between items-center font-mono text-xs shadow-inner">
              <span className="text-slate-400">{t.truckModal.escrowLocked}</span>
              <span className="font-black text-[#10B981] text-base">${amount} USDC</span>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-1">
              <span>{t.truckModal.manifest} {manifestId}</span>
              <span className="text-[#10B981] font-bold">{t.truckModal.verifiedFuji}</span>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-1 py-3 rounded-xl bg-gradient-to-r from-[#10B981] to-[#059669] text-white font-black text-xs shadow-lg shadow-[#10B981]/30 hover:opacity-95 active:scale-98 transition-all"
            >
              {t.truckModal.btnContinue}
            </button>
          </div>
        ) : (
          <div className="w-full p-3 bg-[#0F172A] border border-white/5 rounded-xl mt-1 text-xs text-slate-300 flex items-center justify-center gap-2 font-mono shadow-inner">
            <span className="w-2 h-2 rounded-full bg-[#0A58CA] animate-ping"></span>
            {t.truckModal.registeringCoords}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface TruckTransitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmWithTangem?: () => void;
  title?: string;
  orderId?: string;
  manifestId?: string;
  amount?: string;
}

export default function TruckTransitModal({
  isOpen,
  onClose,
  onConfirmWithTangem,
  title,
  orderId = "101",
  manifestId = "MIC-DTA-2026-AR-BO-0911",
  amount = "2,487.50",
}: TruckTransitModalProps) {
  const { language } = useLanguage();
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const displayTitle = title || (language === "es" ? "Tramo en Ruta y Telemetría" : "Route Leg & Live Telemetry");

  // Determine active tramo and active waypoints
  const currentTramo = progress < 35 ? 1 : progress < 75 ? 2 : 3;
  const isAricaActive = progress < 35;
  const isTamboActive = progress >= 35 && progress < 75;
  const isSantaCruzActive = progress >= 75;

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

    // Smooth velocity progression: 0% to 100% in ~8.5 seconds (slower & cinematic)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCompleted(true);
          return 100;
        }
        const delta = prev < 15 ? 0.4 : prev > 85 ? 0.4 : 0.6;
        return Math.min(prev + delta, 100);
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProceedToTangem = () => {
    if (onConfirmWithTangem) {
      onConfirmWithTangem();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Modal Header */}
        <div className="w-full flex justify-between items-center mb-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-3 h-3 rounded-full bg-[var(--blue-main)] animate-ping"></div>
            <div>
              <p className="text-[10px] font-mono text-[var(--blue-main)] uppercase tracking-wider font-bold">
                {language === "es" ? "Corredor Bioceánico Pacífico — Atlántico" : "Bioceanic Corridor Pacific — Atlantic"}
              </p>
              <h3 className="text-base font-extrabold text-[var(--navy)] tracking-tight">{displayTitle}</h3>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-100 text-[var(--navy)] border border-slate-200 font-bold">
            Orden #{orderId}
          </span>
        </div>

        {/* DYNAMIC ACTIVE TRAMO HUD CARD */}
        <div className="w-full bg-[#F8FAFC] rounded-2xl p-3.5 mb-2.5 border border-slate-200 shadow-sm text-left transition-all">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--navy)] font-black flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--blue-main)] animate-pulse"></span>
              {currentTramo === 1 && (
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
                  </svg>
                  {language === "es" ? "Tramo 1: Despacho en Puerto (Chile)" : "Leg 1: Port Dispatch (Chile)"}
                </span>
              )}
              {currentTramo === 2 && (
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 2 22 22 22 12 2"></polygon>
                  </svg>
                  {language === "es" ? "Tramo 2: Aduana Fronteriza (Tambo Quemado)" : "Leg 2: Customs Border (Tambo Quemado)"}
                </span>
              )}
              {currentTramo === 3 && (
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                  {language === "es" ? "Tramo 3: Arribo a Almacén Central (Santa Cruz)" : "Leg 3: Central Warehouse Arrival (Santa Cruz)"}
                </span>
              )}
            </span>

            <span
              className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase transition-all ${
                currentTramo === 1
                  ? "bg-blue-100 text-blue-800 border border-blue-200 shadow-xs scale-105"
                  : currentTramo === 2
                  ? "bg-amber-100 text-amber-800 border border-amber-200 shadow-xs scale-105"
                  : "bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-xs scale-105"
              }`}
            >
              {currentTramo === 1 && (language === "es" ? "Salida" : "Departure")}
              {currentTramo === 2 && (language === "es" ? "Aduana 4,680m" : "Customs 4,680m")}
              {currentTramo === 3 && (language === "es" ? "Destino Final" : "Final Destination")}
            </span>
          </div>

          <p className="text-xs font-semibold text-slate-700">
            {currentTramo === 1 && (language === "es" ? "Carga pesada inspeccionada y saliendo del Puerto de Arica." : "Heavy freight inspected and leaving Port of Arica.")}
            {currentTramo === 2 && (language === "es" ? "Revisión de precintos y manifiesto MIC/DTA en paso cordillerano." : "Seal and manifest MIC/DTA inspection at mountain pass.")}
            {currentTramo === 3 && (language === "es" ? "Llegada a almacén central. Listo para Tap de confirmación Tangem NFC." : "Arrived at central warehouse. Ready for Tangem NFC tap confirmation.")}
          </p>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-2.5 pt-2 border-t border-slate-200">
            <span>Velocidad: <strong className="text-[var(--navy)]">{speed} km/h</strong></span>
            <span>Altitud: <strong className="text-[var(--navy)]">{altitude} msnm</strong></span>
            <span>Distancia: <strong className="text-[var(--blue-main)]">{Math.round((progress / 100) * 1200)} / 1,200 km</strong></span>
          </div>
        </div>

        {/* WAYPOINT STEPPER BAR WITH DYNAMIC ELEVATION & GLOW ANIMATION */}
        <div className="w-full flex items-center justify-between px-3 py-2 mb-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-[10px] font-mono shadow-xs">
          {/* Waypoint 1: Arica */}
          <div
            className={`flex flex-col items-start transition-all duration-500 ease-out transform ${
              isAricaActive
                ? "-translate-y-2 scale-110 z-10"
                : "translate-y-0 scale-95 opacity-75"
            }`}
          >
            <span
              className={`font-black flex items-center gap-1.5 transition-colors duration-300 ${
                isAricaActive
                  ? "text-blue-700 drop-shadow-sm font-extrabold"
                  : progress >= 35
                  ? "text-blue-600"
                  : "text-slate-400"
              }`}
            >
              <span
                className={`w-3 h-3 rounded-full flex items-center justify-center transition-all ${
                  isAricaActive
                    ? "bg-[#03409E] ring-4 ring-blue-200 shadow-md"
                    : progress >= 35
                    ? "bg-[#03409E]"
                    : "bg-slate-300"
                }`}
              >
                {progress >= 35 ? (
                  <span className="text-[8px] text-white font-bold">✓</span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                )}
              </span>
              CL Arica (Puerto)
            </span>
            <span
              className={`text-[9px] pl-4.5 transition-colors ${
                isAricaActive ? "text-slate-800 font-bold" : "text-slate-400"
              }`}
            >
              Km 0 · 15m
            </span>
          </div>

          {/* Progress Connector Line 1 */}
          <div className="flex-1 h-[3px] mx-2 bg-slate-200 relative rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-amber-500 transition-all duration-300"
              style={{ width: `${Math.min(progress * 2.85, 100)}%` }}
            ></div>
          </div>

          {/* Waypoint 2: Tambo Quemado */}
          <div
            className={`flex flex-col items-center transition-all duration-500 ease-out transform ${
              isTamboActive
                ? "-translate-y-2 scale-110 z-10"
                : "translate-y-0 scale-95 opacity-75"
            }`}
          >
            <span
              className={`font-black flex items-center gap-1.5 transition-colors duration-300 ${
                isTamboActive
                  ? "text-amber-700 drop-shadow-sm font-extrabold"
                  : progress >= 75
                  ? "text-amber-700"
                  : "text-slate-400"
              }`}
            >
              <span
                className={`w-3 h-3 rounded-full flex items-center justify-center transition-all ${
                  isTamboActive
                    ? "bg-amber-500 ring-4 ring-amber-200 shadow-md"
                    : progress >= 75
                    ? "bg-amber-500"
                    : "bg-slate-300"
                }`}
              >
                {progress >= 75 ? (
                  <span className="text-[8px] text-white font-bold">✓</span>
                ) : isTamboActive ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                ) : null}
              </span>
              Tambo Quemado (Aduana)
            </span>
            <span
              className={`text-[9px] transition-colors ${
                isTamboActive ? "text-slate-800 font-bold" : "text-slate-400"
              }`}
            >
              Km 480 · 4,680m
            </span>
          </div>

          {/* Progress Connector Line 2 */}
          <div className="flex-1 h-[3px] mx-2 bg-slate-200 relative rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${Math.max(0, Math.min((progress - 35) * 2.5, 100))}%` }}
            ></div>
          </div>

          {/* Waypoint 3: Santa Cruz */}
          <div
            className={`flex flex-col items-end transition-all duration-500 ease-out transform ${
              isSantaCruzActive
                ? "-translate-y-2 scale-110 z-10"
                : "translate-y-0 scale-95 opacity-75"
            }`}
          >
            <span
              className={`font-black flex items-center gap-1.5 transition-colors duration-300 ${
                isSantaCruzActive
                  ? "text-emerald-700 drop-shadow-sm font-extrabold"
                  : "text-slate-400"
              }`}
            >
              <span
                className={`w-3 h-3 rounded-full flex items-center justify-center transition-all ${
                  isSantaCruzActive
                    ? "bg-emerald-600 ring-4 ring-emerald-200 shadow-md"
                    : "bg-slate-300"
                }`}
              >
                {isCompleted ? (
                  <span className="text-[8px] text-white font-bold">✓</span>
                ) : isSantaCruzActive ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                ) : null}
              </span>
              BO Santa Cruz (Destino)
            </span>
            <span
              className={`text-[9px] pr-4.5 transition-colors ${
                isSantaCruzActive ? "text-slate-800 font-bold" : "text-slate-400"
              }`}
            >
              Km 1,200 · 416m
            </span>
          </div>
        </div>

        {/* SCENIC ROAD & CYBER-TRUCK CONTAINER */}
        <div className="w-full relative h-48 bg-gradient-to-b from-[#EBF3FF] via-[#F8FAFC] to-[#E2E8F0] rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between p-3 my-1 shadow-inner">
          {/* Daytime Mountains silhouette backdrop */}
          <div className="absolute top-2 left-0 right-0 h-28 opacity-80 pointer-events-none flex justify-between items-end px-1">
            {/* Mountain 1 - Arica Volcanos */}
            <svg width="120" height="90" viewBox="0 0 120 90" fill="none" className="translate-y-2">
              <polygon points="0,90 60,15 120,90" fill="#94A3B8" />
              <polygon points="45,35 60,15 75,35" fill="#FFFFFF" opacity="0.9" />
            </svg>

            {/* Mountain 2 - Sajama Peak (Bolivia 6,542m) */}
            <svg width="180" height="110" viewBox="0 0 180 110" fill="none" className="-mx-8 z-0">
              <polygon points="0,110 90,8 180,110" fill="#64748B" />
              <polygon points="70,35 90,8 110,35" fill="#FFFFFF" opacity="0.95" />
            </svg>

            {/* Mountain 3 - Cordillera Real */}
            <svg width="140" height="95" viewBox="0 0 140 95" fill="none" className="translate-y-1">
              <polygon points="0,95 70,20 140,95" fill="#94A3B8" />
              <polygon points="55,40 70,20 85,40" fill="#FFFFFF" opacity="0.85" />
            </svg>
          </div>

          {/* Light Daytime clouds */}
          <div className="absolute top-3 left-6 w-12 h-3 bg-white/70 rounded-full blur-[1px]"></div>
          <div className="absolute top-6 left-32 w-16 h-4 bg-white/80 rounded-full blur-[1px]"></div>
          <div className="absolute top-4 right-16 w-14 h-3 bg-white/75 rounded-full blur-[1px]"></div>

          {/* CYBER-TRUCK & ROAD SECTION */}
          <div className="relative w-full h-32 flex items-end pb-1 mt-auto">
            {/* The Road Surface */}
            <div className="absolute bottom-1 left-0 right-0 h-11 bg-[#334155] border-t-2 border-slate-400 flex items-center overflow-hidden shadow-md">
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

            {/* Heavy Freight Truck SVG with Brand RoutePay Styling */}
            <div
              className={`relative z-20 flex flex-col items-center transition-all duration-300 ${!isCompleted ? "truck-bouncing" : ""}`}
              style={{
                left: `${Math.min(progress * 0.68, 66)}%`,
              }}
            >
              {/* Floating Active Tramo Badge directly above truck */}
              <div className="-mb-1 px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-white/20 text-[9px] font-mono font-black text-white shadow-xl backdrop-blur-sm whitespace-nowrap animate-pulse transition-all">
                {progress < 35 && <span className="text-sky-300">🇨🇱 CL Arica (Salida)</span>}
                {progress >= 35 && progress < 75 && <span className="text-amber-300">🏔️ BO Tambo (4,680m)</span>}
                {progress >= 75 && <span className="text-emerald-300">🇧🇴 BO Santa Cruz (Destino)</span>}
              </div>

              <svg width="135" height="68" viewBox="0 0 135 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Truck Container / Trailer with White & Navy Styling */}
                <rect x="2" y="10" width="82" height="40" rx="4" fill="#FFFFFF" stroke="#03409E" strokeWidth="2" />
                <line x1="2" y1="22" x2="84" y2="22" stroke="#03409E" strokeWidth="1" opacity="0.4" />
                <line x1="2" y1="36" x2="84" y2="36" stroke="#03409E" strokeWidth="1" opacity="0.4" />

                {/* Vertical aerodynamic container ribs */}
                <line x1="22" y1="10" x2="22" y2="50" stroke="#CBD5E1" strokeWidth="1" />
                <line x1="42" y1="10" x2="42" y2="50" stroke="#CBD5E1" strokeWidth="1" />
                <line x1="62" y1="10" x2="62" y2="50" stroke="#CBD5E1" strokeWidth="1" />

                {/* RoutePay Escrow Logo on Container */}
                <rect x="8" y="16" width="68" height="22" rx="3" fill="#012053" stroke="#03409E" strokeWidth="1" />
                <text x="14" y="27" fill="#FFFFFF" fontSize="7.5" fontFamily="monospace" fontWeight="900" letterSpacing="1">
                  ROUTEPAY
                </text>
                <text x="14" y="34" fill="#1ABD7C" fontSize="5.5" fontFamily="monospace" fontWeight="bold">
                  AVALANCHE ESCROW
                </text>

                {/* Connecting Joint Hitch */}
                <rect x="84" y="36" width="6" height="6" fill="#475569" />

                {/* Cabin (Heavy Truck Semi Cab) */}
                <path
                  d="M86 24 H104 L116 36 V52 H86 V24 Z"
                  fill="#03409E"
                  stroke="#012053"
                  strokeWidth="2"
                />

                {/* Windshield */}
                <path d="M102 27 L112 37 H98 V27 H102 Z" fill="#93C5FD" opacity="0.9" />

                {/* Cabin Door Window */}
                <rect x="90" y="28" width="6" height="7" rx="1" fill="#1E293B" opacity="0.8" />

                {/* Roof Spoiler */}
                <path d="M86 24 L102 18 V24 H86 Z" fill="#0A51B2" />

                {/* Front Bumper & Grill */}
                <rect x="114" y="44" width="7" height="8" rx="2" fill="#012053" />
                <line x1="115" y1="46" x2="120" y2="46" stroke="#FFFFFF" strokeWidth="1" />
                <line x1="115" y1="49" x2="120" y2="49" stroke="#FFFFFF" strokeWidth="1" />

                {/* Exhaust Chimney */}
                <rect x="87" y="12" width="2" height="12" fill="#94A3B8" />
                <rect x="87" y="10" width="3" height="2" fill="#CBD5E1" />

                {/* Wheels */}
                <circle cx="16" cy="53" r="7" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
                <circle cx="16" cy="53" r="3" fill="#94A3B8" />

                <circle cx="34" cy="53" r="7" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
                <circle cx="34" cy="53" r="3" fill="#94A3B8" />

                <circle cx="82" cy="53" r="7" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
                <circle cx="82" cy="53" r="3" fill="#0A51B2" />

                <circle cx="106" cy="53" r="7" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
                <circle cx="106" cy="53" r="3" fill="#0A51B2" />
              </svg>
            </div>
          </div>
        </div>

        {/* PROGRESS BAR & PERCENTAGE */}
        <div className="w-full flex flex-col gap-1.5 my-2.5">
          <div className="flex justify-between text-[11px] font-mono text-slate-600 font-medium">
            <span>{isCompleted ? (language === "es" ? "Tramo Completado ✓" : "Leg Completed ✓") : (language === "es" ? "Tránsito en progreso…" : "Transit in progress…")}</span>
            <span className="text-[var(--blue-main)] font-black">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[var(--blue-main)] via-[var(--blue-bright)] to-[var(--green-main)] rounded-full transition-all duration-150 shadow-sm"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* DETAILS & SUCCESS CARD (CON REDIRECCIONAMIENTO DIRECTO A TANGEM) */}
        {isCompleted ? (
          <div className="w-full flex flex-col gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl mt-1 text-left animate-success-pop shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-base border border-emerald-300">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-emerald-800">
                  {language === "es" ? "¡Arribo a Almacén Central Confirmado!" : "Central Warehouse Arrival Confirmed!"}
                </h4>
                <p className="text-[11px] text-emerald-700">
                  {language === "es"
                    ? "Carga lista para verificación física y liberación de fondos con tu tarjeta Tangem."
                    : "Freight ready for physical verification and funds release with your Tangem card."}
                </p>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-emerald-100 flex justify-between items-center font-mono text-xs shadow-sm">
              <span className="text-slate-600">{language === "es" ? "Custodia en Smart Contract:" : "Locked Escrow:"}</span>
              <span className="font-black text-emerald-700 text-base">${amount} USDC</span>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-1">
              <span>Manifiesto: {manifestId}</span>
              <span className="text-emerald-700 font-bold">Avalanche Fuji Verificado</span>
            </div>

            {/* BOTÓN PRINCIPAL CON REDIRECCIÓN DIRECTA A CONFIRMAR CON TANGEM */}
            <button
              onClick={handleProceedToTangem}
              className="w-full mt-1 py-3.5 rounded-xl bg-gradient-to-r from-[var(--green-main)] to-[#067A53] text-white font-extrabold text-xs shadow-lg shadow-emerald-700/20 hover:opacity-95 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                <line x1="2" y1="10" x2="22" y2="10"></line>
              </svg>
              Confirmar Pago con Tarjeta Tangem NFC
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-2">
            <div className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-center gap-2 font-mono">
              <span className="w-2 h-2 rounded-full bg-[var(--blue-main)] animate-ping"></span>
              {language === "es" ? "Registrando coordenadas de telemetría en tiempo real…" : "Registering live telemetry coordinates…"}
            </div>

            {/* Opción para ir directo a la tarjeta Tangem si el usuario no desea esperar */}
            <button
              type="button"
              onClick={handleProceedToTangem}
              className="py-2 text-[11px] font-semibold text-[var(--blue-main)] hover:underline flex items-center justify-center gap-1"
            >
              <span>Ir directo a Confirmación de Pago con Tarjeta Tangem</span>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

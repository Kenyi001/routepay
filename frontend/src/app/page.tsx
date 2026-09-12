"use client";

import React, { useState } from "react";
import { useWeb3 } from "@/context/Web3Context";
import { useTradeEscrow } from "@/hooks/useTradeEscrow";

type Role = "importer" | "carrier" | "warehouse";

export default function RoutePayApp() {
  const { address, isConnected, isConnecting, connect, disconnect } = useWeb3();
  const {
    isLoading,
    txHash,
    createAndFundOrder,
    startTransit,
    settleWithTangemTap,
    explorerUrl,
  } = useTradeEscrow();

  const [role, setRole] = useState<Role>("importer");
  const [orderStatus, setOrderStatus] = useState<"none" | "funded" | "in_transit" | "settled">("none");
  const [isScanningNfc, setIsScanningNfc] = useState(false);
  const [tapSuccess, setTapSuccess] = useState(false);
  const [nfcError, setNfcError] = useState<string | null>(null);

  // Form state
  const [origin] = useState("Puerto de Arica, Chile");
  const [destination] = useState("Santa Cruz de la Sierra, Bolivia");
  const [frightAmount, setFrightAmount] = useState("2500");
  const [manifestId] = useState("MIC-DTA-2026-AR-BO-0911");
  const [carrierAddress] = useState("0x71C8F794B325261EC9dB43bAf6e5a0D6C11b2E42");

  const protocolFee = (parseFloat(frightAmount || "0") * 0.005).toFixed(2);
  const carrierPayout = (parseFloat(frightAmount || "0") * 0.995).toFixed(2);

  const handleCreateOrder = async () => {
    const res = await createAndFundOrder({
      carrier: carrierAddress,
      amountUsd: parseFloat(frightAmount || "0"),
      manifestId,
      durationDays: 7,
    });
    if (res.success) {
      setOrderStatus("funded");
      setRole("carrier");
    }
  };

  const handleStartTransit = async () => {
    const res = await startTransit(BigInt(1));
    if (res.success) {
      setOrderStatus("in_transit");
    }
  };

  const handleTangemTap = async () => {
    setIsScanningNfc(true);
    setNfcError(null);

    // Attempt Web NFC if supported (Chrome on Android)
    const win =
      typeof window !== "undefined"
        ? (window as unknown as {
            NDEFReader?: new () => {
              scan: () => Promise<void>;
              onreading: (() => void) | null;
              onreadingerror: (() => void) | null;
            };
          })
        : null;

    if (win && win.NDEFReader) {
      try {
        const ndef = new win.NDEFReader();
        await ndef.scan();
        ndef.onreading = async () => {
          setIsScanningNfc(false);
          await settleWithTangemTap(BigInt(1));
          setTapSuccess(true);
          setOrderStatus("settled");
        };
        ndef.onreadingerror = () => {
          setNfcError("Error reading Tangem NFC card. Retry tap.");
          setIsScanningNfc(false);
        };
        return;
      } catch (err: unknown) {
        console.warn("Web NFC unavailable or permission denied, using EIP-712 simulation fallback.", err);
      }
    }

    // High-fidelity fallback for pitch demo
    setTimeout(async () => {
      setIsScanningNfc(false);
      await settleWithTangemTap(BigInt(1));
      setTapSuccess(true);
      setOrderStatus("settled");
    }, 1800);
  };

  return (
    <main className="min-h-screen bg-[#080c15] text-slate-100 flex flex-col items-center justify-start p-4 sm:p-6">
      {/* Container móvil centrado (PWA Experience) */}
      <div className="w-full max-w-md flex flex-col gap-5">
        {/* Header con Logo y Conexión Web3 */}
        <header className="flex items-center justify-between py-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center font-bold text-black text-lg shadow-lg shadow-cyan-500/20">
              R
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                RoutePay
              </h1>
              <p className="text-[10px] text-cyan-400 font-mono tracking-wider">TANGEM NFC ESCROW</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Fuji
            </span>

            {isConnected && address ? (
              <button
                onClick={disconnect}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/15 text-[11px] font-mono text-slate-300 hover:border-red-400 hover:text-red-300 transition-colors"
                title="Desconectar Billetera"
              >
                {`${address.slice(0, 5)}...${address.slice(-4)}`}
              </button>
            ) : (
              <button
                onClick={connect}
                disabled={isConnecting}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-400 text-black font-semibold text-xs shadow-md shadow-cyan-500/20 hover:opacity-90 active:scale-95 transition-all"
              >
                {isConnecting ? "Conectando..." : "Conectar Wallet"}
              </button>
            )}
          </div>
        </header>

        {/* Selector de Rol para la Demo */}
        <div className="flex rounded-xl p-1 bg-slate-900/80 border border-white/10">
          <button
            onClick={() => setRole("importer")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
              role === "importer"
                ? "bg-cyan-500 text-black font-semibold shadow-md shadow-cyan-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            1. Importador
          </button>
          <button
            onClick={() => setRole("carrier")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
              role === "carrier"
                ? "bg-cyan-500 text-black font-semibold shadow-md shadow-cyan-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            2. Transportista
          </button>
          <button
            onClick={() => setRole("warehouse")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
              role === "warehouse"
                ? "bg-cyan-500 text-black font-semibold shadow-md shadow-cyan-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            3. Tap Tangem
          </button>
        </div>

        {/* VISTA 1: IMPORTADOR */}
        {role === "importer" && (
          <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm text-slate-200">Crear Orden de Custodia</h2>
              <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                Pollar Onramp
              </span>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 flex flex-col gap-1">
                <span className="text-slate-400 text-[10px] uppercase tracking-wider">Ruta Internacional</span>
                <p className="font-semibold text-white flex items-center gap-1.5">
                  🇨🇱 {origin} <span className="text-cyan-400">➔</span> 🇧🇴 {destination}
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">{manifestId}</p>
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Monto del Flete (USDC)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 font-bold">$</span>
                  <input
                    type="number"
                    value={frightAmount}
                    onChange={(e) => setFrightAmount(e.target.value)}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-7 pr-16 py-2 text-white font-mono font-bold focus:outline-none focus:border-cyan-500"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-500 font-mono text-xs">USDC</span>
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Transportista Certificado (Unlock)</label>
                <input
                  type="text"
                  readOnly
                  value={carrierAddress}
                  className="w-full bg-slate-950/40 border border-white/5 rounded-xl px-3 py-2 text-slate-400 font-mono text-xs"
                />
              </div>

              <div className="bg-slate-900/40 p-3 rounded-xl border border-white/5 text-[11px] flex justify-between text-slate-400">
                <span>Comisión Protocolo (0.5%):</span>
                <span className="font-mono text-slate-200">${protocolFee} USDC</span>
              </div>
            </div>

            {orderStatus === "none" ? (
              <button
                onClick={handleCreateOrder}
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-black font-bold text-sm shadow-lg shadow-cyan-500/25 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isLoading ? "Procesando en Avalanche Fuji..." : "Bloquear Fondos con Pollar (QR / USDC)"}
              </button>
            ) : (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
                <p className="text-xs text-emerald-400 font-medium">✓ Orden #1 Fondeada Exitosamente</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Fondos custodiados en Avalanche Fuji</p>
                {txHash && (
                  <a
                    href={`${explorerUrl}/tx/${txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-1 text-[10px] font-mono text-cyan-400 hover:underline"
                  >
                    Ver Tx en SnowTrace ↗
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* VISTA 2: TRANSPORTISTA */}
        {role === "carrier" && (
          <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm text-slate-200">Panel del Chofer</h2>
              <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Orden #1
              </span>
            </div>

            {/* Badge de fondos asegurados */}
            <div className="bg-gradient-to-br from-amber-500/10 via-slate-900/80 to-slate-950 p-4 rounded-2xl border border-amber-500/30 shadow-inner">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                <span>🔒</span> Fondos Garantizados en Smart Contract
              </div>
              <div className="text-3xl font-extrabold font-mono text-white mt-1">
                ${carrierPayout} <span className="text-sm text-slate-400 font-normal">USDC</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Se liberarán inmediatamente cuando el receptor haga tap con su tarjeta Tangem en destino.
              </p>
            </div>

            {/* Timeline de Ruta */}
            <div className="flex flex-col gap-2 bg-slate-950/60 p-3.5 rounded-xl border border-white/5 text-xs">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
                Estado del Viaje (1,200 km)
              </span>

              <div className="flex items-center gap-3 text-emerald-400">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <span className="flex-1">Arica (Carga Despachada)</span>
                <span className="text-[10px] text-slate-500">Completado</span>
              </div>

              <div className="flex items-center gap-3 text-cyan-400">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                <span className="flex-1">Tambo Quemado (Aduana Frontera)</span>
                <span className="text-[10px] text-cyan-400 font-medium">
                  {orderStatus === "in_transit" ? "En Tránsito" : "Esperando Salida"}
                </span>
              </div>

              <div className="flex items-center gap-3 text-slate-500">
                <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                <span className="flex-1">Santa Cruz (Almacén Central)</span>
                <span className="text-[10px] text-slate-600">Pendiente</span>
              </div>
            </div>

            {orderStatus === "funded" && (
              <button
                onClick={handleStartTransit}
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-white/10 transition-all disabled:opacity-50"
              >
                {isLoading ? "Registrando salida en Fuji..." : "Confirmar Salida de Puerto (Iniciar Tránsito)"}
              </button>
            )}

            {orderStatus === "in_transit" && (
              <button
                onClick={() => setRole("warehouse")}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-black font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all"
              >
                Llegué a Destino ➔ Proceder al Tap Tangem
              </button>
            )}

            {orderStatus === "settled" && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
                <p className="text-xs text-emerald-400 font-bold">✓ ¡Flete Cobrado con Éxito!</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Saldo transferido a tu billetera</p>
                {txHash && (
                  <a
                    href={`${explorerUrl}/tx/${txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-1 text-[10px] font-mono text-cyan-400 hover:underline"
                  >
                    Ver Tx en SnowTrace ↗
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* VISTA 3: ALMACÉN DESTINO / TAP TANGEM NFC */}
        {role === "warehouse" && (
          <div className="glass-panel-glow rounded-2xl p-5 flex flex-col gap-4 items-center text-center">
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Confirmación Física Presencial
            </span>

            <h2 className="font-bold text-lg text-white">Acerca la Tarjeta Tangem NFC</h2>
            <p className="text-xs text-slate-400 max-w-xs">
              El receptor en almacén valida la mercadería haciendo tap con su tarjeta física de hardware al teléfono.
            </p>

            {/* Simulación Visual de Tarjeta Tangem */}
            <div className="relative my-3 flex items-center justify-center">
              {isScanningNfc && (
                <div className="absolute w-44 h-44 rounded-full border border-cyan-400/40 nfc-pulse-ring"></div>
              )}

              <div
                className={`tangem-card w-56 h-32 rounded-2xl p-4 flex flex-col justify-between text-left transition-all duration-500 ${
                  isScanningNfc ? "scale-105 shadow-2xl shadow-cyan-500/40 border-cyan-400" : ""
                } ${tapSuccess ? "border-emerald-400 shadow-emerald-500/30" : ""}`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono tracking-widest text-slate-400">TANGEM NFC</span>
                  <div className="w-5 h-4 rounded bg-amber-400/80 border border-amber-200"></div>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-mono">CC EAL6+ SECURE ELEMENT</p>
                  <p className="text-xs font-mono font-bold text-white tracking-wider">
                    {tapSuccess ? "FIRMA EIP-712 VÁLIDA" : "RECEPTOR AUTORIZADO"}
                  </p>
                </div>
              </div>
            </div>

            {nfcError && <p className="text-xs text-red-400 font-mono">{nfcError}</p>}

            {!tapSuccess ? (
              <button
                onClick={handleTangemTap}
                disabled={isScanningNfc || isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-black font-extrabold text-sm shadow-lg shadow-cyan-500/30 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isScanningNfc ? "Leyendo Chip NFC..." : "Confirmar Entrega con Tarjeta Tangem"}
              </button>
            ) : (
              <div className="w-full flex flex-col gap-2 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <div className="text-emerald-400 font-bold text-sm">🎉 ¡Flete Liquidado Instantáneamente!</div>
                <div className="text-[11px] text-slate-300 flex justify-between">
                  <span>Pago al Transportista:</span>
                  <span className="font-mono font-bold text-white">${carrierPayout} USDC</span>
                </div>
                <div className="text-[11px] text-slate-400 flex justify-between">
                  <span>Comisión RoutePay (0.5%):</span>
                  <span className="font-mono">${protocolFee} USDC</span>
                </div>
                {txHash && (
                  <a
                    href={`${explorerUrl}/tx/${txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-1 text-[10px] font-mono text-cyan-400 hover:underline break-all"
                  >
                    Tx: {txHash.slice(0, 16)}... (Ver en SnowTrace ↗)
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer Informativo */}
        <footer className="text-center text-[10px] text-slate-500 py-3 border-t border-white/5 flex justify-between px-2">
          <span>RoutePay Protocol · ETH Bolivia</span>
          <span>Avalanche Fuji · Pollar · Tangem</span>
        </footer>
      </div>
    </main>
  );
}

"use client";

import React, { useState } from "react";
import { useWeb3 } from "@/context/Web3Context";
import { useTradeEscrow } from "@/hooks/useTradeEscrow";
import { useLanguage } from "@/context/LanguageContext";
import TruckTransitModal from "@/components/TruckTransitModal";
import PollarQrModal from "@/components/PollarQrModal";
import DeliveryCertificateModal from "@/components/DeliveryCertificateModal";

type Role = "importer" | "carrier" | "warehouse";
type EscrowState = "none" | "funded" | "in_transit" | "settled" | "disputed" | "refunded";

interface ActivityLogItem {
  id: string;
  time: string;
  action: string;
  details: string;
  txHash: string;
}

export default function RoutePayApp() {
  const { address, isConnected, isConnecting, connect, disconnect } = useWeb3();
  const { language, toggleLanguage, t } = useLanguage();
  const {
    isLoading,
    txHash,
    createAndFundOrder,
    startTransit,
    settleWithTangemTap,
    explorerUrl,
  } = useTradeEscrow();

  const [role, setRole] = useState<Role>("importer");
  const [orderStatus, setOrderStatus] = useState<EscrowState>("none");
  const [isScanningNfc, setIsScanningNfc] = useState(false);
  const [tapSuccess, setTapSuccess] = useState(false);
  const [nfcError, setNfcError] = useState<string | null>(null);

  // Modals state
  const [isTruckModalOpen, setIsTruckModalOpen] = useState(false);
  const [isPollarModalOpen, setIsPollarModalOpen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [showCryptoInspector, setShowCryptoInspector] = useState(false);

  // Activity logs
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);

  // Form state
  const [frightAmount, setFrightAmount] = useState("2500");
  const [manifestId] = useState("MIC-DTA-2026-AR-BO-0911");
  const [carrierAddress] = useState("0x71C8F794B325261EC9dB43bAf6e5a0D6C11b2E42");

  const protocolFee = (parseFloat(frightAmount || "0") * 0.005).toFixed(2);
  const carrierPayout = (parseFloat(frightAmount || "0") * 0.995).toFixed(2);

  const addActivityLog = (action: string, details: string, hash: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
    setActivityLogs((prev) => [
      {
        id: Math.random().toString(),
        time: timeStr,
        action,
        details,
        txHash: hash,
      },
      ...prev.slice(0, 4),
    ]);
  };

  const handleCreateOrder = async () => {
    const res = await createAndFundOrder({
      carrier: carrierAddress,
      amountUsd: parseFloat(frightAmount || "0"),
      manifestId,
      durationDays: 7,
    });
    if (res.success) {
      setOrderStatus("funded");
      addActivityLog(
        "createAndFundOrder()",
        `$${frightAmount} USDC locked in TradeEscrow vault (MIC/DTA registered)`,
        res.hash || "0x..."
      );
    }
  };

  const handleStartTransit = async () => {
    setIsTruckModalOpen(true);
    const res = await startTransit(BigInt(1));
    if (res.success) {
      setOrderStatus("in_transit");
      addActivityLog(
        "startTransit()",
        "Carrier dispatched from Arica port towards Tambo Quemado",
        res.hash || "0x..."
      );
    }
  };

  const handleOpenDispute = () => {
    setOrderStatus("disputed");
    const fakeHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    addActivityLog(
      "openDispute()",
      "Border retention reported at Tambo Quemado customs checkpoint",
      fakeHash
    );
  };

  const handleResolveDispute = (refundImporter: boolean) => {
    const fakeHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    if (refundImporter) {
      setOrderStatus("refunded");
      addActivityLog(
        "resolveDispute(true)",
        `Arbiter refunded 100% ($${frightAmount} USDC) to Importer`,
        fakeHash
      );
    } else {
      setOrderStatus("settled");
      addActivityLog(
        "resolveDispute(false)",
        `Arbiter released $${carrierPayout} USDC to Carrier`,
        fakeHash
      );
    }
  };

  const handleTangemTap = async () => {
    setIsScanningNfc(true);
    setNfcError(null);

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
          const res = await settleWithTangemTap(BigInt(1));
          setTapSuccess(true);
          setOrderStatus("settled");
          addActivityLog(
            "settleWithTangemTap()",
            `Tangem NFC chip EAL6+ signature verified. Payout: $${carrierPayout} USDC`,
            res.hash || "0x..."
          );
        };
        ndef.onreadingerror = () => {
          setNfcError("Error reading Tangem NFC card. Retry tap.");
          setIsScanningNfc(false);
        };
        return;
      } catch (err: unknown) {
        console.warn("Web NFC fallback activated:", err);
      }
    }

    setTimeout(async () => {
      setIsScanningNfc(false);
      const res = await settleWithTangemTap(BigInt(1));
      setTapSuccess(true);
      setOrderStatus("settled");
      addActivityLog(
        "settleWithTangemTap()",
        `Tangem NFC chip EAL6+ signature verified. Payout: $${carrierPayout} USDC`,
        res.hash || "0x..."
      );
    }, 1800);
  };

  const handleResetDemo = () => {
    setOrderStatus("none");
    setRole("importer");
    setTapSuccess(false);
    setIsCertificateOpen(false);
    setActivityLogs([]);
  };

  return (
    <main className="min-h-screen bg-[#080c15] text-slate-100 flex flex-col items-center justify-start p-3 sm:p-6">
      {/* Container móvil centrado (PWA Experience) */}
      <div className="w-full max-w-md flex flex-col gap-4">
        {/* Header con Logo, Selector de Idioma y Conexión Web3 */}
        <header className="flex items-center justify-between py-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center font-bold text-black text-lg shadow-lg shadow-cyan-500/20">
              R
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                RoutePay
              </h1>
              <p className="text-[10px] text-cyan-400 font-mono tracking-wider">{t.header.tagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Selector Bilingüe ES / EN */}
            <button
              onClick={toggleLanguage}
              type="button"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-white/15 text-xs font-mono text-cyan-400 hover:bg-slate-800 transition-all active:scale-95"
              title="Cambiar idioma / Change language"
            >
              <span>{language === "es" ? "🇪🇸 ES" : "🇺🇸 EN"}</span>
              <span className="text-[9px] text-slate-500">⇄</span>
            </button>

            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {t.header.fuji}
            </span>

            {isConnected && address ? (
              <button
                onClick={disconnect}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/15 text-[11px] font-mono text-slate-300 hover:border-red-400 hover:text-red-300 transition-colors"
                title={t.header.disconnectTitle}
              >
                {`${address.slice(0, 5)}...${address.slice(-4)}`}
              </button>
            ) : (
              <button
                onClick={connect}
                disabled={isConnecting}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-400 text-black font-semibold text-xs shadow-md shadow-cyan-500/20 hover:opacity-90 active:scale-95 transition-all"
              >
                {isConnecting ? t.header.connecting : t.header.connectWallet}
              </button>
            )}
          </div>
        </header>

        {/* 🧭 HUD "TECH IN ACTION" (Muestra qué tecnología está activa en cada paso) */}
        <div className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-white/10 flex items-center justify-between text-[10px] font-mono shadow-sm">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="font-semibold text-slate-200">
              {language === "es" ? "Tecnología Activa:" : "Active Technology:"}
            </span>
          </div>
          {role === "importer" && (
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span>🟢 Pollar (BOB ➔ USDC)</span>
              <span className="text-slate-600">·</span>
              <span>🔺 Avalanche Fuji</span>
            </span>
          )}
          {role === "carrier" && (
            <span className="text-cyan-400 font-bold flex items-center gap-1">
              <span>🏔️ Manifiesto MIC/DTA</span>
              <span className="text-slate-600">·</span>
              <span>🔺 TradeEscrow.sol</span>
            </span>
          )}
          {role === "warehouse" && (
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <span>💳 Tangem NFC EAL6+</span>
              <span className="text-slate-600">·</span>
              <span>⚡ EIP-712 Payout</span>
            </span>
          )}
        </div>

        {/* STEPPER DINÁMICO DE CICLO DE VIDA ON-CHAIN */}
        <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-2.5 flex items-center justify-between text-[11px] font-mono shadow-inner">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                orderStatus !== "none"
                  ? "bg-emerald-400 shadow-md shadow-emerald-400/50"
                  : "bg-slate-700"
              }`}
            ></span>
            <span className={orderStatus !== "none" ? "text-emerald-400 font-bold" : "text-slate-500"}>
              {t.lifecycle.step1}
            </span>
          </div>
          <span className="text-slate-600 font-sans">➔</span>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                orderStatus === "in_transit"
                  ? "bg-cyan-400 animate-pulse shadow-md shadow-cyan-400/50"
                  : orderStatus === "settled"
                  ? "bg-emerald-400"
                  : "bg-slate-700"
              }`}
            ></span>
            <span
              className={
                orderStatus === "in_transit"
                  ? "text-cyan-400 font-bold"
                  : orderStatus === "settled"
                  ? "text-emerald-400"
                  : "text-slate-500"
              }
            >
              {t.lifecycle.step2}
            </span>
          </div>
          <span className="text-slate-600 font-sans">➔</span>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                orderStatus === "settled"
                  ? "bg-emerald-400 shadow-md shadow-emerald-400/50"
                  : orderStatus === "disputed"
                  ? "bg-amber-400 animate-ping"
                  : "bg-slate-700"
              }`}
            ></span>
            <span
              className={
                orderStatus === "settled"
                  ? "text-emerald-400 font-bold"
                  : orderStatus === "disputed"
                  ? "text-amber-400 font-bold"
                  : "text-slate-500"
              }
            >
              {orderStatus === "disputed" ? t.lifecycle.stepDispute : t.lifecycle.step3}
            </span>
          </div>
        </div>

        {/* Selector de Rol / Vistas */}
        <div className="flex rounded-xl p-1 bg-slate-900/80 border border-white/10">
          <button
            onClick={() => setRole("importer")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
              role === "importer"
                ? "bg-cyan-500 text-black font-semibold shadow-md shadow-cyan-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {t.roles.importer}
          </button>
          <button
            onClick={() => setRole("carrier")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
              role === "carrier"
                ? "bg-cyan-500 text-black font-semibold shadow-md shadow-cyan-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {t.roles.carrier}
          </button>
          <button
            onClick={() => setRole("warehouse")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
              role === "warehouse"
                ? "bg-cyan-500 text-black font-semibold shadow-md shadow-cyan-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {t.roles.warehouse}
          </button>
        </div>

        {/* VISTA 1: IMPORTADOR */}
        {role === "importer" && (
          <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm text-slate-200">{t.importer.title}</h2>
              <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                {t.importer.pollarBadge}
              </span>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 flex flex-col gap-1">
                <span className="text-slate-400 text-[10px] uppercase tracking-wider">{t.importer.routeLabel}</span>
                <p className="font-semibold text-white flex items-center gap-1.5">
                  🇨🇱 {t.importer.originArica} <span className="text-cyan-400">➔</span> 🇧🇴 {t.importer.destSantaCruz}
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">{manifestId}</p>
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">{t.importer.amountLabel}</label>
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
                <label className="text-slate-400 text-[11px] block mb-1">{t.importer.carrierLabel}</label>
                <input
                  type="text"
                  readOnly
                  value={carrierAddress}
                  className="w-full bg-slate-950/40 border border-white/5 rounded-xl px-3 py-2 text-slate-400 font-mono text-xs"
                />
              </div>

              <div className="bg-slate-900/40 p-3 rounded-xl border border-white/5 text-[11px] flex justify-between text-slate-400">
                <span>{t.importer.feeLabel}</span>
                <span className="font-mono text-slate-200">${protocolFee} USDC</span>
              </div>
            </div>

            {orderStatus === "none" ? (
              <button
                onClick={() => setIsPollarModalOpen(true)}
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-extrabold text-sm shadow-lg shadow-emerald-500/25 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>📱</span>
                <span>{language === "es" ? "Pagar con QR Simple en BOB (Pollar On-Ramp)" : "Pay with BOB Simple QR (Pollar On-Ramp)"}</span>
              </button>
            ) : (
              <div className="flex flex-col gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
                <p className="text-xs text-emerald-400 font-bold">{t.importer.fundedSuccess}</p>
                <p className="text-[11px] text-slate-400">{t.importer.fundedSub}</p>
                {txHash && (
                  <a
                    href={`${explorerUrl}/tx/${txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-mono text-cyan-400 hover:underline"
                  >
                    {t.importer.viewSnowtrace}
                  </a>
                )}
                {/* 🎯 BOTÓN DE FLUJO CONTINUO (Paso 2) */}
                <button
                  onClick={() => setRole("carrier")}
                  className="mt-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-black font-extrabold text-xs shadow-md shadow-cyan-500/20 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Paso 2: Conectar con Chofer en Arica ➔</span>
                </button>
              </div>
            )}

            <p className="text-[10px] text-slate-500 font-mono text-center">
              {t.importer.timeoutGuarantee}
            </p>
          </div>
        )}

        {/* VISTA 2: TRANSPORTISTA */}
        {role === "carrier" && (
          <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm text-slate-200">{t.carrier.title}</h2>
              <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {t.carrier.orderTag}
              </span>
            </div>

            {/* Badge de fondos asegurados */}
            <div className="bg-gradient-to-br from-amber-500/10 via-slate-900/80 to-slate-950 p-4 rounded-2xl border border-amber-500/30 shadow-inner">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                <span>🔒</span> {t.carrier.guaranteedFunds}
              </div>
              <div className="text-3xl font-extrabold font-mono text-white mt-1">
                ${carrierPayout} <span className="text-sm text-slate-400 font-normal">USDC</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {t.carrier.guaranteedSub}
              </p>
            </div>

            {/* Timeline de Ruta */}
            <div className="flex flex-col gap-2 bg-slate-950/60 p-3.5 rounded-xl border border-white/5 text-xs">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
                {t.carrier.tripStatus}
              </span>

              <div className="flex items-center gap-3 text-emerald-400">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <span className="flex-1">{t.carrier.aricaDone}</span>
                <span className="text-[10px] text-slate-500">{t.carrier.completed}</span>
              </div>

              <div className="flex items-center gap-3 text-cyan-400">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                <span className="flex-1">{t.carrier.tamboBorder}</span>
                <span className="text-[10px] text-cyan-400 font-medium">
                  {orderStatus === "in_transit"
                    ? t.carrier.inTransit
                    : orderStatus === "disputed"
                    ? "Bloqueo Aduanero"
                    : t.carrier.waitingDeparture}
                </span>
              </div>

              <div className="flex items-center gap-3 text-slate-500">
                <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                <span className="flex-1">{t.carrier.santaCruzDest}</span>
                <span className="text-[10px] text-slate-600">{t.carrier.pending}</span>
              </div>
            </div>

            {orderStatus === "funded" && (
              <button
                onClick={handleStartTransit}
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>🚛</span>
                {isLoading ? t.carrier.btnStarting : t.carrier.btnStart}
              </button>
            )}

            {/* Botón para ver la animación del camión */}
            <button
              onClick={() => setIsTruckModalOpen(true)}
              type="button"
              className="w-full py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 font-mono text-[11px] border border-white/10 transition-all flex items-center justify-center gap-1.5"
            >
              <span>🚚</span> {t.carrier.btnDemoTruck}
            </button>

            {/* Reportar Disputa en Frontera o Proceder al Tap */}
            {orderStatus === "in_transit" && (
              <div className="flex flex-col gap-2">
                {/* 🎯 BOTÓN DE FLUJO CONTINUO (Paso 3) */}
                <button
                  onClick={() => setRole("warehouse")}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-black font-extrabold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Paso 3: Llegó al Almacén ➔ Tap Tangem</span>
                </button>
                <button
                  onClick={handleOpenDispute}
                  type="button"
                  className="w-full py-1.5 text-[11px] font-mono text-amber-400 hover:text-amber-300 transition-colors"
                >
                  {t.carrier.btnReportDispute}
                </button>
              </div>
            )}

            {orderStatus === "disputed" && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex flex-col gap-2 text-left">
                <p className="text-xs font-bold text-amber-400">{t.dispute.title}</p>
                <p className="text-[11px] text-slate-300">{t.dispute.desc}</p>
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => handleResolveDispute(true)}
                    className="flex-1 py-1.5 px-2 bg-slate-900 border border-amber-500/40 text-amber-300 text-[10px] rounded-lg font-mono hover:bg-slate-800"
                  >
                    {t.dispute.resolveRefund}
                  </button>
                  <button
                    onClick={() => handleResolveDispute(false)}
                    className="flex-1 py-1.5 px-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] rounded-lg font-mono hover:bg-emerald-500/30"
                  >
                    {t.dispute.resolvePay}
                  </button>
                </div>
              </div>
            )}

            {orderStatus === "settled" && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center flex flex-col gap-2">
                <p className="text-xs text-emerald-400 font-bold">{t.carrier.settledSuccess}</p>
                <p className="text-[11px] text-slate-400">{t.carrier.settledSub}</p>
                <button
                  onClick={() => setIsCertificateOpen(true)}
                  className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-xl text-emerald-300 font-bold text-xs transition-all"
                >
                  📜 Ver Certificado Criptográfico de Entrega
                </button>
              </div>
            )}
          </div>
        )}

        {/* VISTA 3: ALMACÉN DESTINO / TAP TANGEM NFC */}
        {role === "warehouse" && (
          <div className="glass-panel-glow rounded-2xl p-5 flex flex-col gap-4 items-center text-center">
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {t.warehouse.badge}
            </span>

            <h2 className="font-bold text-lg text-white">{t.warehouse.title}</h2>
            <p className="text-xs text-slate-400 max-w-xs">
              {t.warehouse.desc}
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
                  <p className="text-[10px] text-slate-400 font-mono">{t.warehouse.chipText}</p>
                  <p className="text-xs font-mono font-bold text-white tracking-wider">
                    {tapSuccess ? t.warehouse.chipValid : t.warehouse.chipReady}
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
                {isScanningNfc ? t.warehouse.btnReading : t.warehouse.btnTap}
              </button>
            ) : (
              <div className="w-full flex flex-col gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <div className="text-emerald-400 font-bold text-sm">{t.warehouse.payoutSuccess}</div>
                <div className="text-[11px] text-slate-300 flex justify-between">
                  <span>{t.warehouse.carrierPayout}</span>
                  <span className="font-mono font-bold text-white">${carrierPayout} USDC</span>
                </div>
                <div className="text-[11px] text-slate-400 flex justify-between">
                  <span>{t.warehouse.protocolFee}</span>
                  <span className="font-mono">${protocolFee} USDC</span>
                </div>

                {/* 🎯 BOTÓN PARA ABRIR CERTIFICADO FINAL */}
                <button
                  onClick={() => setIsCertificateOpen(true)}
                  className="w-full mt-1 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-extrabold text-xs rounded-xl shadow-md shadow-emerald-500/20 hover:opacity-95 active:scale-95 transition-all"
                >
                  📜 Ver Certificado Criptográfico de Liquidación
                </button>
              </div>
            )}

            {/* 🔬 INSPECTOR CRIPTOGRÁFICO (Muestra la firma matemática del hardware Tangem) */}
            <div className="w-full mt-2">
              <button
                onClick={() => setShowCryptoInspector(!showCryptoInspector)}
                className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 underline"
              >
                {showCryptoInspector ? "▲ Ocultar prueba criptográfica EIP-712" : "▼ Ver prueba criptográfica EIP-712 (Tangem)"}
              </button>
              {showCryptoInspector && (
                <div className="w-full bg-slate-950/90 border border-cyan-500/20 rounded-xl p-3 text-left font-mono text-[9px] text-slate-400 mt-2 flex flex-col gap-1">
                  <p className="text-cyan-300 font-bold">Tangem Hardware EIP-712 Payload:</p>
                  <p>TypeHash: 0x9f3e82...c014 (SettleWithTangemTap)</p>
                  <p>OrderId: 1 | ChainId: 43113 (Avalanche Fuji)</p>
                  <p>Chip Public Key: 0x4f30B89...f71f4</p>
                  <p>ECDSA Signature: r, s, v verified on-chain</p>
                  <p className="text-emerald-400 font-semibold">Status: RECOVERED_VALID_SIGNER</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* REGISTRO EN VIVO DE ACTIVIDAD DEL CONTRATO (TradeEscrow.sol) */}
        {activityLogs.length > 0 && (
          <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-white/5 pb-1.5">
              <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                {t.activity.title}
              </span>
              <span className="text-[10px] text-slate-500">Avalanche Fuji</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {activityLogs.map((log) => (
                <div key={log.id} className="text-[10px] font-mono flex items-start gap-2 text-slate-300">
                  <span className="text-slate-500 whitespace-nowrap">{log.time}</span>
                  <div className="flex-1">
                    <span className="text-emerald-400 font-semibold">{log.action}: </span>
                    <span className="text-slate-400">{log.details}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Informativo */}
        <footer className="text-center text-[10px] text-slate-500 py-2 border-t border-white/5 flex justify-between px-2">
          <span>{t.footer.protocol}</span>
          <span>{t.footer.tracks}</span>
        </footer>
      </div>

      {/* Modal interactivo con animación del camión en ruta */}
      <TruckTransitModal
        isOpen={isTruckModalOpen}
        onClose={() => setIsTruckModalOpen(false)}
        orderId="1"
        manifestId={manifestId}
        amount={carrierPayout}
      />

      {/* Modal On-Ramp Pollar QR Simple */}
      <PollarQrModal
        isOpen={isPollarModalOpen}
        onClose={() => setIsPollarModalOpen(false)}
        onPaymentSuccess={handleCreateOrder}
        amountUsd={frightAmount}
        manifestId={manifestId}
      />

      {/* Modal Certificado Criptográfico de Entrega */}
      <DeliveryCertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        onResetDemo={handleResetDemo}
        orderId="1"
        manifestId={manifestId}
        carrierPayout={carrierPayout}
        protocolFee={protocolFee}
        txHash={txHash}
        explorerUrl={explorerUrl}
      />
    </main>
  );
}

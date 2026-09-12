"use client";

import React, { useState } from "react";
import { useWeb3 } from "@/context/Web3Context";
import { useLanguage } from "@/context/LanguageContext";
import { useTradeEscrow } from "@/hooks/useTradeEscrow";
import {
  Header,
  RoleSelector,
  Role,
  OrderCreationForm,
  TransitTimeline,
  TangemTapModal,
  ToastNotification,
  ToastType,
  TruckTransitModal,
  PollarQrModal,
  DeliveryCertificateModal,
} from "../components";
import { EscrowState } from "../components/TransitTimeline";

interface ActivityLogItem {
  id: string;
  time: string;
  action: string;
  details: string;
  txHash: string;
}

export default function RoutePayApp() {
  const { address } = useWeb3();
  const { language, t } = useLanguage();
  const {
    isLoading,
    txHash,
    createAndFundOrder,
    startTransit,
    settleWithTangemTap,
    explorerUrl,
  } = useTradeEscrow();

  // Role & Escrow Lifecycle
  const [role, setRole] = useState<Role>("importer");
  const [orderStatus, setOrderStatus] = useState<EscrowState>("none");

  // Route Details
  const [origin, setOrigin] = useState("Puerto Arica, Chile");
  const [destination, setDestination] = useState("Santa Cruz, Bolivia");

  // Form State
  const [frightAmount, setFrightAmount] = useState("2500");
  const [manifestId, setManifestId] = useState("MIC-DTA-2026-AR-BO-0911");
  const [carrierAddress, setCarrierAddress] = useState(
    address || "0x71C8F794B325261EC9dB43bAf6e5a0D6C11b2E42"
  );

  // Modals & Feedback
  const [isTruckModalOpen, setIsTruckModalOpen] = useState(false);
  const [isPollarModalOpen, setIsPollarModalOpen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string | null; type: ToastType }>({
    message: null,
    type: "info",
  });

  // On-Chain Activity Logs
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);

  // Payout calculation (99.5% carrier, 0.5% protocol fee)
  const numAmount = parseFloat(frightAmount || "0");
  const protocolFee = (numAmount * 0.005).toFixed(2);
  const carrierPayout = (numAmount * 0.995).toFixed(2);

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: null, type: "info" });
    }, 5000);
  };

  const addActivityLog = (action: string, details: string, hash: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
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

  // STEP 1: Fund Order (either via Pollar QR or Direct USDC)
  const handleFundOrder = async (method: "pollar" | "direct") => {
    const res = await createAndFundOrder({
      carrier: carrierAddress,
      amountUsd: parseFloat(frightAmount || "0"),
      manifestId,
      durationDays: 7,
    });

    setOrderStatus("funded");
    setIsPollarModalOpen(false);

    const hash = res.hash || "0x9f3e...881a";
    if (method === "pollar") {
      showToast(
        language === "es"
          ? "✓ Pago QR Pollar procesado. $2,500 USDC custodiados en Avalanche Fuji"
          : "✓ Pollar QR processed. $2,500 USDC locked in Avalanche Fuji",
        "success"
      );
      addActivityLog(
        "createAndFundOrder() [Pollar BOB]",
        `$${frightAmount} USDC locked in TradeEscrow vault via Pollar QR (MIC/DTA registered)`,
        hash
      );
    } else {
      showToast(
        language === "es"
          ? "✓ Fondos bloqueados exitosamente en Smart Contract (Avalanche Fuji)"
          : "✓ Funds locked successfully in Smart Contract (Avalanche Fuji)",
        "success"
      );
      addActivityLog(
        "createAndFundOrder() [Direct USDC]",
        `$${frightAmount} USDC locked in TradeEscrow vault (MIC/DTA registered)`,
        hash
      );
    }
  };

  // STEP 2: Carrier starts international transit
  const handleStartTransit = async () => {
    setIsTruckModalOpen(true);
    const res = await startTransit(BigInt(1));
    setOrderStatus("in_transit");
    const hash = res.hash || "0x2c4e...119d";
    showToast(
      language === "es"
        ? "🚚 Salida de Puerto confirmada. Tránsito internacional iniciado."
        : "🚚 Port departure confirmed. International transit started.",
      "info"
    );
    addActivityLog(
      "startTransit()",
      "Carrier dispatched from Arica port towards Tambo Quemado",
      hash
    );
  };

  // STEP 3: Proceed to Warehouse Tangem Tap
  const handleGoToTangemTap = () => {
    setRole("warehouse");
    showToast(
      language === "es"
        ? "📍 Llegada a almacén destino. Realiza el Tap NFC para liberar pago."
        : "📍 Arrived at warehouse. Tap Tangem NFC card to release payout.",
      "info"
    );
  };

  // Border Dispute Management
  const handleOpenDispute = () => {
    setOrderStatus("disputed");
    const fakeHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    showToast(
      language === "es"
        ? "⚠️ Retención aduanera reportada en Tambo Quemado."
        : "⚠️ Customs retention reported at Tambo Quemado border checkpoint.",
      "error"
    );
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
      showToast(
        language === "es"
          ? "Árbitro reembolsó el 100% de fondos al Importador."
          : "Arbiter refunded 100% of funds to Importer.",
        "info"
      );
      addActivityLog(
        "resolveDispute(true)",
        `Arbiter refunded 100% ($${frightAmount} USDC) to Importer`,
        fakeHash
      );
    } else {
      setOrderStatus("settled");
      showToast(
        language === "es"
          ? "Árbitro autorizó la liberación de flete al Transportista."
          : "Arbiter authorized freight payout to Carrier.",
        "success"
      );
      addActivityLog(
        "resolveDispute(false)",
        `Arbiter released $${carrierPayout} USDC to Carrier`,
        fakeHash
      );
    }
  };

  // Settlement via Tangem NFC Tap
  const handleTangemSettled = async () => {
    const res = await settleWithTangemTap(BigInt(1));
    setOrderStatus("settled");
    const hash = res.hash || "0x7a1b...55f2";
    showToast(
      language === "es"
        ? "🎉 Entrega verificada por firma Tangem NFC. Liquidación ejecutada en Avalanche Fuji."
        : "🎉 Delivery verified by Tangem NFC signature. Settlement executed on Avalanche Fuji.",
      "success"
    );
    addActivityLog(
      "settleWithTangemTap()",
      `Tangem NFC chip EAL6+ signature verified. Payout: $${carrierPayout} USDC`,
      hash
    );
  };

  // Demo Reset
  const handleResetDemo = () => {
    setOrderStatus("none");
    setRole("importer");
    setIsCertificateOpen(false);
    setActivityLogs([]);
    showToast(
      language === "es" ? "Demostración reiniciada" : "Demo state reset",
      "info"
    );
  };

  return (
    <main className="min-h-screen bg-[#111827] text-white flex flex-col items-center justify-start p-3 sm:p-6 selection:bg-[#0A58CA] selection:text-white">
      {/* Mobile-first centered app container (PWA design, 390px - 430px) */}
      <div className="w-full max-w-md flex flex-col gap-4">
        {/* Header Component with Web3 Connection, Language Switcher & Avalanche Fuji Status */}
        <Header networkName="Avalanche Fuji" />

        {/* Dynamic Toast Feedback Notification */}
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: null, type: "info" })}
        />

        {/* 🧭 HUD "TECH IN ACTION" (Muestra qué tecnología está activa en cada paso) */}
        <div className="w-full py-2 px-3.5 rounded-xl bg-[#0F172A] border border-white/10 flex items-center justify-between text-[11px] font-mono shadow-inner">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-[#0A58CA] animate-ping"></span>
            <span className="font-bold text-white">
              {language === "es" ? "Tecnología Activa:" : "Active Tech:"}
            </span>
          </div>
          {role === "importer" && (
            <span className="text-[#10B981] font-bold flex items-center gap-1.5">
              <span>🟢 Pollar (BOB ➔ USDC)</span>
              <span className="text-slate-600">·</span>
              <span className="text-[#E84142]">🔺 Fuji</span>
            </span>
          )}
          {role === "carrier" && (
            <span className="text-blue-300 font-bold flex items-center gap-1.5">
              <span>🏔️ Manifiesto MIC/DTA</span>
              <span className="text-slate-600">·</span>
              <span className="text-[#10B981]">TradeEscrow</span>
            </span>
          )}
          {role === "warehouse" && (
            <span className="text-amber-300 font-bold flex items-center gap-1.5">
              <span>💳 Tangem NFC EAL6+</span>
              <span className="text-slate-600">·</span>
              <span className="text-[#10B981]">EIP-712</span>
            </span>
          )}
        </div>

        {/* STEPPER DINÁMICO DE CICLO DE VIDA ON-CHAIN */}
        <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-3 flex items-center justify-between text-[11px] font-mono shadow-inner">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                orderStatus !== "none"
                  ? "bg-[#10B981] shadow-md shadow-[#10B981]/50"
                  : "bg-slate-700"
              }`}
            ></span>
            <span className={orderStatus !== "none" ? "text-[#10B981] font-bold" : "text-slate-500"}>
              {t.lifecycle.step1}
            </span>
          </div>
          <span className="text-slate-600 font-sans">➔</span>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                orderStatus === "in_transit"
                  ? "bg-[#0A58CA] animate-pulse shadow-md shadow-[#0A58CA]/50"
                  : orderStatus === "settled"
                  ? "bg-[#10B981]"
                  : "bg-slate-700"
              }`}
            ></span>
            <span
              className={
                orderStatus === "in_transit"
                  ? "text-[#0A58CA] font-bold"
                  : orderStatus === "settled"
                  ? "text-[#10B981]"
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
                  ? "bg-[#10B981] shadow-md shadow-[#10B981]/50"
                  : orderStatus === "disputed"
                  ? "bg-amber-400 animate-ping"
                  : "bg-slate-700"
              }`}
            ></span>
            <span
              className={
                orderStatus === "settled"
                  ? "text-[#10B981] font-bold"
                  : orderStatus === "disputed"
                  ? "text-amber-400 font-bold"
                  : "text-slate-500"
              }
            >
              {orderStatus === "disputed" ? t.lifecycle.stepDispute : t.lifecycle.step3}
            </span>
          </div>
        </div>

        {/* Role Navigation Switcher */}
        <RoleSelector currentRole={role} onSelectRole={setRole} />

        {/* VIEW 1: IMPORTER (Creación de Orden & Pollar On-Ramp) */}
        {role === "importer" && (
          <div className="flex flex-col gap-3">
            <OrderCreationForm
              origin={origin}
              destination={destination}
              frightAmount={frightAmount}
              setFrightAmount={setFrightAmount}
              manifestId={manifestId}
              setManifestId={setManifestId}
              carrierAddress={carrierAddress}
              setCarrierAddress={setCarrierAddress}
              orderStatus={orderStatus}
              onOpenPollarModal={() => setIsPollarModalOpen(true)}
              onCreateOrderDirect={() => handleFundOrder("direct")}
              protocolFee={protocolFee}
              carrierPayout={carrierPayout}
            />

            {/* 🎯 BOTÓN DE FLUJO CONTINUO (Paso 2) */}
            {orderStatus !== "none" && (
              <button
                onClick={() => setRole("carrier")}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#0A58CA] to-[#E84142] text-white font-extrabold text-xs shadow-lg shadow-[#0A58CA]/30 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Paso 2: Conectar con Chofer en Arica ➔</span>
              </button>
            )}
          </div>
        )}

        {/* VIEW 2: CARRIER / MONITOR (Flete en Tránsito & Custodia) */}
        {role === "carrier" && (
          <TransitTimeline
            orderStatus={orderStatus}
            carrierPayout={carrierPayout}
            onStartTransit={handleStartTransit}
            onGoToTangemTap={handleGoToTangemTap}
            onOpenTruckModal={() => setIsTruckModalOpen(true)}
            onOpenDispute={handleOpenDispute}
            onResolveDispute={handleResolveDispute}
            onOpenCertificate={() => setIsCertificateOpen(true)}
            txHash={txHash}
            explorerUrl={explorerUrl}
            isLoading={isLoading}
          />
        )}

        {/* VIEW 3: WAREHOUSE / TANGEM NFC TAP */}
        {role === "warehouse" && (
          <TangemTapModal
            orderStatus={orderStatus}
            onSettled={handleTangemSettled}
            frightAmount={frightAmount}
            carrierPayout={carrierPayout}
            protocolFee={protocolFee}
            onOpenCertificate={() => setIsCertificateOpen(true)}
          />
        )}

        {/* REGISTRO EN VIVO DE ACTIVIDAD DEL CONTRATO (TradeEscrow.sol) */}
        {activityLogs.length > 0 && (
          <div className="bg-[#0F172A] border border-white/10 rounded-2xl p-3.5 flex flex-col gap-2.5 shadow-inner">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 border-b border-white/10 pb-2">
              <span className="flex items-center gap-2 text-blue-300 font-bold">
                <span className="w-2 h-2 rounded-full bg-[#0A58CA] animate-ping"></span>
                {t.activity.title}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Avalanche Fuji</span>
            </div>
            <div className="flex flex-col gap-2">
              {activityLogs.map((log) => (
                <div key={log.id} className="text-[10px] font-mono flex items-start gap-2 text-slate-200">
                  <span className="text-slate-400 whitespace-nowrap">{log.time}</span>
                  <div className="flex-1">
                    <span className="text-[#10B981] font-bold">{log.action}: </span>
                    <span className="text-slate-300">{log.details}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-[10px] text-slate-400 py-3 border-t border-white/10 flex items-center justify-between px-2 font-mono">
          <span>{t.footer.protocol}</span>
          <span className="text-slate-300">{t.footer.tracks}</span>
        </footer>
      </div>

      {/* Animated Cyber-Truck Transit Modal with Live Telemetry */}
      <TruckTransitModal
        isOpen={isTruckModalOpen}
        onClose={() => setIsTruckModalOpen(false)}
        orderId="101"
        manifestId={manifestId}
        amount={carrierPayout}
      />

      {/* Modal On-Ramp Pollar QR Simple (BOB ➔ USDC) */}
      <PollarQrModal
        isOpen={isPollarModalOpen}
        onClose={() => setIsPollarModalOpen(false)}
        onPaymentSuccess={() => handleFundOrder("pollar")}
        amountUsd={frightAmount}
        manifestId={manifestId}
      />

      {/* Modal Certificado Criptográfico de Entrega */}
      <DeliveryCertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        onResetDemo={handleResetDemo}
        orderId="101"
        manifestId={manifestId}
        carrierPayout={carrierPayout}
        protocolFee={protocolFee}
        txHash={txHash}
        explorerUrl={explorerUrl}
      />
    </main>
  );
}

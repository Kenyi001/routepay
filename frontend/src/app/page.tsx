"use client";

import React, { useState } from "react";
import { useWeb3 } from "@/context/Web3Context";
import { useLanguage } from "@/context/LanguageContext";
import { useTradeEscrow } from "@/hooks/useTradeEscrow";
import {
  Header,
  RoleSelector,
  Role,
  LoginScreen,
  LoginRole,
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
    errorMessage,
    createAndFundOrder,
    startTransit,
    signTangemTap,
    settleWithTangemTap,
    refundOnTimeout,
    explorerUrl,
  } = useTradeEscrow();

  // ─── Auth gate ────────────────────────────────────────────────────
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [userLoginRole, setUserLoginRole] = useState<LoginRole>("importer");

  // Dashboard role matches login role directly
  const [role, setRole] = useState<Role>("importer");

  const handleLogin = (selectedRole: LoginRole, name: string) => {
    setUserLoginRole(selectedRole);
    setUserName(name);
    // Carriers default to carrier panel; importers are permanently locked to importer
    setRole(selectedRole);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setOrderStatus("none");
    setActivityLogs([]);
  };

  // ─── Escrow lifecycle ─────────────────────────────────────────────
  const [orderStatus, setOrderStatus] = useState<EscrowState>("none");
  const [currentOrderId, setCurrentOrderId] = useState<bigint>(BigInt(1));

  // Route details
  const [origin, setOrigin] = useState("Puerto Arica, Chile");
  const [destination, setDestination] = useState("Santa Cruz, Bolivia");

  // Form state
  const [frightAmount, setFrightAmount] = useState("2500");
  const [manifestId, setManifestId] = useState("MIC-DTA-2026-AR-BO-0911");
  const [carrierAddress, setCarrierAddress] = useState(
    address || "0x71C8F794B325261EC9dB43bAf6e5a0D6C11b2E42"
  );

  // Modals
  const [isTruckModalOpen, setIsTruckModalOpen] = useState(false);
  const [isPollarModalOpen, setIsPollarModalOpen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isTangemModalOpen, setIsTangemModalOpen] = useState(false);

  const [toast, setToast] = useState<{ message: string | null; type: ToastType }>({
    message: null,
    type: "info",
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);

  // Derived values
  const numAmount = parseFloat(frightAmount || "0");
  const protocolFee = (numAmount * 0.005).toFixed(2);
  const carrierPayout = (numAmount * 0.995).toFixed(2);

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: null, type: "info" }), 5000);
  };

  const addLog = (action: string, details: string, hash: string) => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    setActivityLogs((prev) => [{ id: Math.random().toString(), time, action, details, txHash: hash }, ...prev.slice(0, 4)]);
  };

  // ─── Handlers ─────────────────────────────────────────────────────
  const handleFundOrder = async (method: "pollar" | "direct") => {
    const res = await createAndFundOrder({ carrier: carrierAddress, amountUsd: numAmount, manifestId, durationDays: 7 });

    if (!res.success) {
      showToast(
        language === "es"
          ? `No se pudo bloquear el pago: ${errorMessage || "transacción rechazada o fallida"}`
          : `Could not lock funds: ${errorMessage || "transaction rejected or failed"}`,
        "error"
      );
      return;
    }

    if (res.orderId) {
      setCurrentOrderId(BigInt(res.orderId));
    }
    setOrderStatus("funded");
    setIsPollarModalOpen(false);
    const hash = res.hash || "0x9f3e...881a";
    if (method === "pollar") {
      showToast(language === "es" ? "Pago QR Pollar procesado. $2,500 USDC custodiados en Avalanche." : "Pollar QR processed. $2,500 USDC locked on Avalanche.", "success");
      addLog("createAndFundOrder() [Pollar BOB]", `$${frightAmount} USDC locked via Pollar QR (MIC/DTA registered)`, hash);
    } else {
      showToast(language === "es" ? "Fondos bloqueados en el contrato de custodia." : "Funds locked in escrow contract.", "success");
      addLog("createAndFundOrder() [Direct USDC]", `$${frightAmount} USDC locked in TradeEscrow vault (MIC/DTA registered)`, hash);
    }
  };

  const handleStartTransit = async () => {
    setIsTruckModalOpen(true);
    const res = await startTransit(currentOrderId);
    setOrderStatus("in_transit");
    const hash = res.hash || "0x2c4e...119d";
    showToast(language === "es" ? "Salida de Puerto confirmada. Tránsito iniciado." : "Port departure confirmed. Transit started.", "info");
    addLog("startTransit()", "Carrier dispatched from Arica port towards Tambo Quemado", hash);
  };

  // Trigger Tangem NFC modal directly from carrier workflow
  const handleOpenTangemModal = () => {
    setIsTangemModalOpen(true);
  };

  // Settlement via Tangem NFC Tap
  const handleTangemSettled = async () => {
    // On a phone with Web NFC, the physical Tangem card signs this digest.
    // Here, the connected wallet (importer) signs it instead — same digest,
    // same on-chain check, real signature either way (not a fake placeholder).
    const signature = await signTangemTap(currentOrderId);

    if (!signature) {
      showToast(
        language === "es"
          ? "No se pudo generar la firma (¿wallet conectada? ¿contrato desplegado?)."
          : "Could not generate signature (wallet connected? contract deployed?).",
        "error"
      );
      return;
    }

    const res = await settleWithTangemTap(currentOrderId, signature);

    if (!res.success) {
      showToast(
        language === "es"
          ? `La liquidación on-chain falló: ${errorMessage || "revisá la consola"}`
          : `On-chain settlement failed: ${errorMessage || "check the console"}`,
        "error"
      );
      return;
    }

    setOrderStatus("settled");
    const hash = res.hash || "0x7a1b...55f2";
    showToast(language === "es" ? "Entrega verificada por Tangem NFC. Liquidación ejecutada en Avalanche." : "Delivery verified by Tangem NFC. Settlement executed on Avalanche.", "success");
    addLog("settleWithTangemTap()", `Tangem NFC EAL6+ verified. Payout: $${carrierPayout} USDC`, hash);
  };

  // Timeout Refund: if shipment exceeds estimated duration
  const handleClaimTimeoutRefund = async () => {
    const res = await refundOnTimeout(currentOrderId);

    if (!res.success) {
      showToast(
        language === "es"
          ? `No se pudo procesar el reembolso: ${errorMessage || "revisá la consola"}`
          : `Could not process refund: ${errorMessage || "check the console"}`,
        "error"
      );
      return;
    }

    setOrderStatus("refunded");
    const hash = res.hash || "0x8f4c...33b1";
    showToast(
      language === "es"
        ? "Plazo vencido. Fondos ($2,500 USDC) reembolsados íntegramente al Importador."
        : "Timeout expired. Funds ($2,500 USDC) refunded to Importer.",
      "error"
    );
    addLog("refundOnTimeout() [Demora Excesiva]", `Escrow refunded 100% ($${frightAmount} USDC) to Importer on Avalanche`, hash);
  };

  const handleOpenDispute = () => {
    setOrderStatus("disputed");
    const h = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    showToast(language === "es" ? "Retención aduanera reportada en Tambo Quemado." : "Customs retention reported at Tambo Quemado.", "error");
    addLog("openDispute()", "Border retention reported at Tambo Quemado customs checkpoint", h);
  };

  const handleResolveDispute = (refundImporter: boolean) => {
    const h = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    if (refundImporter) {
      setOrderStatus("refunded");
      showToast(language === "es" ? "Árbitro reembolsó el 100% al Importador." : "Arbiter refunded 100% to Importer.", "info");
      addLog("resolveDispute(true)", `Arbiter refunded 100% ($${frightAmount} USDC) to Importer`, h);
    } else {
      setOrderStatus("settled");
      showToast(language === "es" ? "Árbitro autorizó la liberación del flete." : "Arbiter authorized freight payout.", "success");
      addLog("resolveDispute(false)", `Arbiter released $${carrierPayout} USDC to Carrier`, h);
    }
  };

  const handleResetDemo = () => {
    setOrderStatus("none");
    setRole("importer");
    setIsCertificateOpen(false);
    setIsTangemModalOpen(false);
    setActivityLogs([]);
    showToast(language === "es" ? "Demostración reiniciada." : "Demo state reset.", "info");
  };

  // ─── Login gate ───────────────────────────────────────────────────
  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // ─── Lifecycle step colors ─────────────────────────────────────────
  const stepDot = (active: boolean, transit: boolean, dispute: boolean, refunded: boolean) => {
    if (refunded) return { background: "var(--error)", boxShadow: "0 0 0 4px rgba(220,38,38,0.2)" };
    if (dispute)  return { background: "var(--warning)", boxShadow: "0 0 0 4px rgba(245,158,11,0.2)" };
    if (active)   return { background: "var(--green-main)", boxShadow: "0 0 0 4px rgba(8,161,110,0.15)" };
    if (transit)  return { background: "var(--blue-bright)", boxShadow: "0 0 0 4px rgba(10,81,178,0.15)" };
    return { background: "var(--border)" };
  };

  // ─── Dashboard ────────────────────────────────────────────────────
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-start p-3 sm:p-5"
      style={{ background: "var(--bg)" }}
    >
      <div className="w-full max-w-md flex flex-col gap-4">

        {/* Header con Logo oficial, Avatar del usuario y Logout */}
        <Header userName={userName} userRole={userLoginRole} onLogout={handleLogout} />

        {/* Toast */}
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: null, type: "info" })}
        />

        {/* ─── Active Tech HUD ──────────────────────── */}
        <div
          className="w-full py-2 px-3.5 rounded-xl flex items-center justify-between text-[11px] font-mono"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "0 1px 4px rgba(1,32,83,0.06)",
          }}
        >
          <div className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
            <span
              className="w-2 h-2 rounded-full animate-ping"
              style={{ background: "var(--blue-bright)" }}
            />
            <span className="font-bold" style={{ color: "var(--navy)" }}>
              {language === "es" ? "Tech activa:" : "Active tech:"}
            </span>
          </div>
          {role === "importer" && (
            <span className="font-bold flex items-center gap-1.5" style={{ color: "var(--green-main)" }}>
              <span className="w-2 h-2 rounded-full bg-[var(--green-main)]"></span>
              Pollar (BOB ➔ USDC)
              <span style={{ color: "var(--border)" }}>·</span>
              <span style={{ color: "var(--blue-bright)" }}>Avalanche</span>
            </span>
          )}
          {role === "carrier" && (
            <span className="font-bold flex items-center gap-1.5" style={{ color: "var(--blue-main)" }}>
              MIC/DTA
              <span style={{ color: "var(--border)" }}>·</span>
              <span style={{ color: "var(--green-main)" }}>TradeEscrow · Tangem</span>
            </span>
          )}
        </div>

        {/* ─── On-chain lifecycle stepper ───────────── */}
        <div
          className="rounded-xl p-3 flex items-center justify-between text-[11px] font-mono"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          {/* Step 1: Funded */}
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full transition-all"
              style={stepDot(orderStatus !== "none", false, false, false)}
            />
            <span
              className="font-semibold"
              style={{ color: orderStatus !== "none" ? "var(--green-main)" : "var(--text-muted)" }}
            >
              {t.lifecycle.step1}
            </span>
          </div>
          <span style={{ color: "var(--border)" }}>→</span>
          {/* Step 2: In Transit */}
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full transition-all ${orderStatus === "in_transit" ? "animate-pulse" : ""}`}
              style={stepDot(orderStatus === "settled", orderStatus === "in_transit", false, false)}
            />
            <span
              className="font-semibold"
              style={{
                color:
                  orderStatus === "in_transit" ? "var(--blue-bright)"
                  : orderStatus === "settled" ? "var(--green-main)"
                  : "var(--text-muted)",
              }}
            >
              {t.lifecycle.step2}
            </span>
          </div>
          <span style={{ color: "var(--border)" }}>→</span>
          {/* Step 3: Settled / Disputed / Refunded */}
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full transition-all ${orderStatus === "disputed" ? "animate-ping" : ""}`}
              style={stepDot(orderStatus === "settled", false, orderStatus === "disputed", orderStatus === "refunded")}
            />
            <span
              className="font-semibold"
              style={{
                color:
                  orderStatus === "settled" ? "var(--green-main)"
                  : orderStatus === "refunded" ? "var(--error)"
                  : orderStatus === "disputed" ? "var(--warning)"
                  : "var(--text-muted)",
              }}
            >
              {orderStatus === "refunded"
                ? "Reembolsado"
                : orderStatus === "disputed"
                ? t.lifecycle.stepDispute
                : t.lifecycle.step3}
            </span>
          </div>
        </div>

        {/* ─── Role tab switcher: solo visible para el Transportista ── */}
        {userLoginRole === "carrier" && (
          <RoleSelector currentRole={role} onSelectRole={setRole} />
        )}

        {/* ─── VIEW 1: IMPORTER ─────────────────────── */}
        {/* Importer role is LOCKED — userLoginRole === "importer" always shows this, never carrier panel */}
        {userLoginRole === "importer" && (
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
          </div>
        )}

        {/* ─── VIEW 2: CARRIER (De Inicio a Fin del Envío) ── */}
        {/* Carriers see their full panel. They can also switch to an order summary tab (role=importer). */}
        {userLoginRole === "carrier" && role === "carrier" && (
          <TransitTimeline
            orderStatus={orderStatus}
            carrierPayout={carrierPayout}
            frightAmount={frightAmount}
            onStartTransit={handleStartTransit}
            onOpenTangemModal={handleOpenTangemModal}
            onClaimTimeoutRefund={handleClaimTimeoutRefund}
            onOpenTruckModal={() => setIsTruckModalOpen(true)}
            onOpenDispute={handleOpenDispute}
            onResolveDispute={handleResolveDispute}
            onOpenCertificate={() => setIsCertificateOpen(true)}
            txHash={txHash}
            explorerUrl={explorerUrl}
            isLoading={isLoading}
          />
        )}

        {/* ─── VIEW 2b: CARRIER → Orden del Flete (tarjeta Tangem grande + resumen) ── */}
        {userLoginRole === "carrier" && role === "importer" && (
          <div className="flex flex-col gap-3">

            {/* ─── Resumen compacto de la orden ─── */}
            <div
              className="rp-card p-4 flex flex-col gap-3"
              style={{ border: "1px solid var(--border)" }}
            >
              <div className="flex items-center justify-between pb-2" style={{ borderBottom: "1px solid var(--border)" }}>
                <h2 className="font-extrabold text-sm flex items-center gap-2" style={{ color: "var(--navy)" }}>
                  <svg className="w-4 h-4 text-[var(--blue-main)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  Orden del Importador
                </h2>
                <span className="rp-badge rp-badge-blue font-mono text-[10px]">Solo lectura</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <span className="text-[10px] font-mono uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>Manifiesto</span>
                  <span className="font-bold font-mono text-[11px]" style={{ color: "var(--navy)" }}>{manifestId}</span>
                </div>
                <div className="p-2.5 rounded-lg" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <span className="text-[10px] font-mono uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>Monto</span>
                  <span className="font-bold font-mono" style={{ color: "var(--green-main)" }}>${frightAmount} USDC</span>
                </div>
                <div className="p-2.5 rounded-lg" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <span className="text-[10px] font-mono uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>Tu Cobro (99.5%)</span>
                  <span className="font-bold font-mono" style={{ color: "var(--blue-main)" }}>${carrierPayout} USDC</span>
                </div>
                <div className="p-2.5 rounded-lg" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <span className="text-[10px] font-mono uppercase tracking-wider block" style={{ color: "var(--text-muted)" }}>Estado</span>
                  <span className="font-bold" style={{ color: orderStatus === "none" ? "var(--text-muted)" : orderStatus === "in_transit" ? "var(--blue-bright)" : orderStatus === "settled" ? "var(--green-main)" : "var(--error)" }}>
                    {orderStatus === "none" ? "Sin fondear" : orderStatus === "funded" ? "Fondeado" : orderStatus === "in_transit" ? "En Tránsito" : orderStatus === "settled" ? "Liquidado" : orderStatus === "refunded" ? "Reembolsado" : "En Disputa"}
                  </span>
                </div>
              </div>
            </div>

            {/* ─── TARJETA TANGEM GRANDE (igual al modal) ─── */}
            <div
              className="rp-card p-5 flex flex-col gap-4 items-center text-center w-full"
              style={{ borderColor: orderStatus === "settled" ? "var(--green-main)" : "var(--border)" }}
            >
              {/* Badge */}
              <span className="rp-badge rp-badge-blue text-[10px] uppercase tracking-wider">
                CONFIRMACIÓN FÍSICA PRESENCIAL HARDWARE
              </span>

              <div>
                <h2 className="font-black text-xl" style={{ color: "var(--navy)" }}>
                  {orderStatus === "settled" ? "¡Entrega Verificada!" : "Acerca la Tarjeta Tangem NFC"}
                </h2>
                <p className="text-xs mt-1 max-w-xs" style={{ color: "var(--text-secondary)" }}>
                  {orderStatus === "settled"
                    ? "Firma EIP-712 válida. Pago liberado instantáneamente en Avalanche."
                    : "El receptor en almacén valida la llegada haciendo tap con su tarjeta de hardware en el teléfono Android."}
                </p>
              </div>

              {/* ─── 3D Card Flip (EXACTAMENTE igual al modal) ─── */}
              <div className="relative flex items-center justify-center w-full my-1">
                <div className="card-flip-scene" style={{ maxWidth: 280, height: 170 }}>
                  <div className={`card-flip-inner ${orderStatus === "settled" ? "flipped" : ""}`}>

                    {/* Front face */}
                    <div className="card-face card-front p-4 flex flex-col justify-between text-left">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono font-bold tracking-widest text-white/80 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-400" />
                          TANGEM NFC
                        </span>
                        <div className="w-7 h-5 rounded bg-yellow-400/90 border border-yellow-200 shadow-inner flex items-center justify-center text-[7px] font-black text-black">
                          CHIP
                        </div>
                      </div>

                      <div>
                        <p className="text-[9px] text-white/60 font-mono tracking-wider">CC EAL6+ SECURE ELEMENT</p>
                        <p className="text-xs font-extrabold text-white font-mono tracking-wider mt-0.5">
                          RECEPTOR AUTORIZADO
                        </p>
                      </div>

                      <div className="flex justify-between items-end text-[9px] font-mono text-white/60">
                        <span>ROUTE PAY PROTOCOL</span>
                        <span className="text-red-400 font-bold">TAP TO SIGN</span>
                      </div>
                    </div>

                    {/* Back face — success */}
                    <div className="card-face card-back p-4 flex flex-col justify-between text-left">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono font-bold tracking-widest text-white/80 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                          TANGEM NFC
                        </span>
                        <span className="text-[9px] font-black text-white bg-white/20 px-2 py-0.5 rounded-full">EIP-712 ✓</span>
                      </div>

                      <div className="text-center">
                        <div className="w-10 h-10 mx-auto mb-1 rounded-full bg-white/20 flex items-center justify-center text-white">
                          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        <p className="text-xs font-black text-white">FIRMA VERIFICADA</p>
                        <p className="text-[9px] text-white/70 font-mono mt-0.5">HARDWARE CONFIRMED</p>
                      </div>

                      <div className="flex justify-between items-end text-[9px] font-mono text-white/70">
                        <span>ROUTE PAY PROTOCOL</span>
                        <span className="text-white font-bold">${carrierPayout} RELEASED</span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* CTA — abre el modal real de Tangem */}
              {orderStatus !== "settled" && (
                <button
                  onClick={handleOpenTangemModal}
                  className="rp-btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                    <line x1="2" y1="10" x2="22" y2="10"></line>
                  </svg>
                  <strong>Confirmar Entrega con Tarjeta Tangem NFC</strong>
                </button>
              )}

              {orderStatus === "settled" && (
                <div
                  className="w-full p-3.5 rounded-xl text-center"
                  style={{ background: "rgba(8,161,110,0.08)", border: "1px solid rgba(8,161,110,0.3)" }}
                >
                  <p className="font-black text-sm flex items-center justify-center gap-1.5" style={{ color: "var(--green-main)" }}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Flete Liquidado · ${carrierPayout} USDC acreditados
                  </p>
                </div>
              )}

              {/* Why Tangem */}
              <p className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                ¿Por qué Tangem NFC? · Hardware EAL6+ · Imposible falsificar sin la tarjeta física
              </p>
            </div>

          </div>
        )}

        {/* ─── Activity log ─────────────────────────── */}
        {activityLogs.length > 0 && (
          <div
            className="rounded-xl p-4 flex flex-col gap-3"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="flex items-center justify-between text-[11px] font-mono pb-2"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <span className="flex items-center gap-2 font-bold" style={{ color: "var(--blue-main)" }}>
                <span
                  className="w-2 h-2 rounded-full animate-ping"
                  style={{ background: "var(--blue-bright)" }}
                />
                {t.activity.title}
              </span>
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>TradeEscrow.sol</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {activityLogs.map((log) => (
                <div key={log.id} className="text-[10px] font-mono flex items-start gap-2 rp-log-item">
                  <span style={{ color: "var(--text-muted)" }} className="whitespace-nowrap">{log.time}</span>
                  <div className="flex-1">
                    <span className="font-bold" style={{ color: "var(--green-main)" }}>{log.action}: </span>
                    <span style={{ color: "var(--text-secondary)" }}>{log.details}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Footer ───────────────────────────────── */}
        <footer
          className="text-center text-[10px] py-3 flex items-center justify-between px-1 font-mono"
          style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted)" }}
        >
          <span>{t.footer.protocol}</span>
          <span style={{ color: "var(--text-secondary)" }}>{t.footer.tracks}</span>
        </footer>
      </div>

      {/* ─── Modals ──────────────────────────────────────────────────── */}

      {/* Tangem NFC Verification Modal (Overlay activado por el transportista al llegar a destino) */}
      <TangemTapModal
        isOpen={isTangemModalOpen}
        onClose={() => setIsTangemModalOpen(false)}
        orderStatus={orderStatus}
        onSettled={() => {
          handleTangemSettled();
          // Dejar un instante para ver la animación antes de cerrar
          setTimeout(() => setIsTangemModalOpen(false), 2200);
        }}
        frightAmount={frightAmount}
        carrierPayout={carrierPayout}
        protocolFee={protocolFee}
        onOpenCertificate={() => {
          setIsTangemModalOpen(false);
          setIsCertificateOpen(true);
        }}
      />

      {/* Animated Cyber-Truck Transit Modal with Live Telemetry */}
      <TruckTransitModal
        isOpen={isTruckModalOpen}
        onClose={() => setIsTruckModalOpen(false)}
        onConfirmWithTangem={() => {
          setIsTruckModalOpen(false);
          handleOpenTangemModal();
        }}
        orderId={currentOrderId.toString()}
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
        orderId={currentOrderId.toString()}
        manifestId={manifestId}
        carrierPayout={carrierPayout}
        protocolFee={protocolFee}
        txHash={txHash}
        explorerUrl={explorerUrl}
      />
    </main>
  );
}

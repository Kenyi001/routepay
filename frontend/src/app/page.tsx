"use client";

import React, { useState } from "react";
import {
  Header,
  RoleSelector,
  Role,
  OrderCreationForm,
  PollarOnrampModal,
  TransitTimeline,
  TangemTapModal,
  ToastNotification,
  ToastType,
} from "../components";

export default function RoutePayApp() {
  const [role, setRole] = useState<Role>("importer");
  const [orderStatus, setOrderStatus] = useState<"none" | "funded" | "in_transit" | "settled">("none");
  const [isPollarModalOpen, setIsPollarModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string | null; type: ToastType }>({
    message: null,
    type: "info",
  });

  // Form state
  const [origin] = useState("Puerto de Arica, Chile");
  const [destination] = useState("Santa Cruz de la Sierra, Bolivia");
  const [frightAmount, setFrightAmount] = useState("2500");
  const [manifestId, setManifestId] = useState("MIC-DTA-2026-AR-BO-0911");
  const [carrierAddress, setCarrierAddress] = useState("0x71C...Carrier42");

  // Payout calculation
  const numAmount = parseFloat(frightAmount || "0");
  const protocolFee = (numAmount * 0.005).toFixed(2);
  const carrierPayout = (numAmount * 0.995).toFixed(2);

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: null, type: "info" });
    }, 5000);
  };

  const handleFundOrder = (method: "pollar" | "direct") => {
    setOrderStatus("funded");
    setIsPollarModalOpen(false);

    if (method === "pollar") {
      showToast(
        "✓ Pago QR Pollar procesado. $2,500 USDC custodiados en Avalanche Fuji",
        "success"
      );
    } else {
      showToast(
        "✓ Fondos bloqueados exitosamente en Smart Contract (Avalanche Fuji)",
        "success"
      );
    }

    setRole("carrier");
  };

  const handleStartTransit = () => {
    setOrderStatus("in_transit");
    showToast(
      "🚚 Salida de Puerto confirmada. Tránsito internacional iniciado.",
      "info"
    );
  };

  const handleGoToTangemTap = () => {
    setRole("warehouse");
    showToast("📍 Llegada a almacén destino. Realiza el Tap NFC para liberar pago.", "info");
  };

  const handleTangemSettled = () => {
    setOrderStatus("settled");
    showToast(
      "🎉 Entrega verificada por firma Tangem NFC. Liquidación ejecutada.",
      "success"
    );
  };

  return (
    <main className="min-h-screen bg-[#121214] text-white flex flex-col items-center justify-start p-4 sm:p-6 selection:bg-[#E84142] selection:text-white">
      {/* Mobile-first centered app container (PWA design, 390px - 430px) */}
      <div className="w-full max-w-md flex flex-col gap-5">
        {/* Header Component */}
        <Header networkName="Avalanche Fuji" walletAddress="0x71C...C42" />

        {/* Dynamic Toast Feedback Notification */}
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: null, type: "info" })}
        />

        {/* Role Navigation Switcher */}
        <RoleSelector currentRole={role} onSelectRole={setRole} />

        {/* VIEW 1: IMPORTER (Creación de Orden & Pollar On-Ramp) */}
        {role === "importer" && (
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
        )}

        {/* VIEW 2: CARRIER / MONITOR (Flete en Tránsito & Custodia) */}
        {role === "carrier" && (
          <TransitTimeline
            orderStatus={orderStatus}
            carrierPayout={carrierPayout}
            onStartTransit={handleStartTransit}
            onGoToTangemTap={handleGoToTangemTap}
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
          />
        )}

        {/* Pollar BOB QR On-Ramp Modal */}
        <PollarOnrampModal
          isOpen={isPollarModalOpen}
          onClose={() => setIsPollarModalOpen(false)}
          onConfirmPayment={() => handleFundOrder("pollar")}
          amountUsdc={frightAmount}
        />

        {/* Footer */}
        <footer className="text-center text-[10px] text-slate-500 py-3 border-t border-white/5 flex items-center justify-between px-2 font-mono">
          <span>RoutePay Protocol · ETH Bolivia</span>
          <span className="text-slate-400">Avalanche Fuji · Pollar · Tangem</span>
        </footer>
      </div>
    </main>
  );
}

"use client";

import React, { useState } from "react";
import { useWeb3 } from "@/context/Web3Context";
import { useLanguage } from "@/context/LanguageContext";

export type LoginRole = "importer" | "carrier";

interface LoginScreenProps {
  onLogin: (role: LoginRole, name: string) => void;
}

const ROLE_CARDS: {
  id: LoginRole;
  emoji: string;
  titleEs: string;
  titleEn: string;
  descEs: string;
  descEn: string;
  color: string;
}[] = [
  {
    id: "importer",
    emoji: "📦",
    titleEs: "Importador",
    titleEn: "Importer",
    descEs: "Crea órdenes de flete y bloquea USDC en el contrato de custodia.",
    descEn: "Create freight orders and lock USDC in the escrow contract.",
    color: "#03409E",
  },
  {
    id: "carrier",
    emoji: "🚛",
    titleEs: "Transportista",
    titleEn: "Carrier",
    descEs: "Gestiona el viaje de inicio a fin y cobra al verificar la entrega.",
    descEn: "Manage shipment from start to finish and collect upon delivery verification.",
    color: "#08A16E",
  },
];

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const { isConnected, isConnecting, connect, address } = useWeb3();
  const { language, toggleLanguage } = useLanguage();
  const [selected, setSelected] = useState<LoginRole | null>(null);
  const [name, setName] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const isEs = language === "es";
  const isNameValid = name.trim().length >= 2;
  const canSubmit = Boolean(selected && isNameValid);

  const handleContinue = () => {
    setAttemptedSubmit(true);
    if (!selected || !isNameValid) return;
    onLogin(selected, name.trim());
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-5"
      style={{ background: "var(--bg)" }}
    >
      <div className="w-full max-w-sm flex flex-col gap-6">

        {/* ─── Logo + Lang ─────────────────────────── */}
        <div className="animate-fade-up flex items-start justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/Logo.png"
              alt="RoutePay Logo"
              className="w-12 h-12 object-contain rounded-2xl shadow-md"
            />
            <div>
              <h1 className="text-xl font-black tracking-tight" style={{ color: "var(--navy)" }}>
                RoutePay
              </h1>
              <p className="text-[11px] font-semibold" style={{ color: "var(--green-main)" }}>
                Smart Freight Escrow · Avalanche
              </p>
            </div>
          </div>
          <button
            onClick={toggleLanguage}
            className="text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors"
            style={{
              border: "1.5px solid var(--border)",
              color: "var(--blue-main)",
              background: "var(--surface)",
            }}
          >
            {language === "es" ? "🇪🇸 ES" : "🇺🇸 EN"}
          </button>
        </div>

        {/* ─── Heading ─────────────────────────────── */}
        <div className="animate-fade-up-delay">
          <h2 className="text-2xl font-black" style={{ color: "var(--navy)" }}>
            {isEs ? "Iniciar Sesión" : "Sign In"}
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {isEs
              ? "Seleccioná tu rol e ingresá tus datos para acceder."
              : "Select your role and enter your details to proceed."}
          </p>
        </div>

        {/* ─── Role Cards ──────────────────────────── */}
        <div className="animate-fade-up-delay2 flex flex-col gap-3">
          {ROLE_CARDS.map((card) => {
            const isActive = selected === card.id;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setSelected(card.id)}
                className="w-full text-left rounded-2xl p-4 border-2 transition-all duration-200 cursor-pointer"
                style={{
                  borderColor: isActive ? card.color : "var(--border)",
                  background: isActive ? `${card.color}0c` : "var(--surface)",
                  boxShadow: isActive ? `0 0 0 3px ${card.color}22` : "none",
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: `${card.color}15` }}
                  >
                    {card.emoji}
                  </span>
                  <div className="flex-1">
                    <div className="font-bold text-sm" style={{ color: isActive ? card.color : "var(--navy)" }}>
                      {isEs ? card.titleEs : card.titleEn}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                      {isEs ? card.descEs : card.descEn}
                    </div>
                  </div>
                  {/* Radio indicator */}
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{ borderColor: isActive ? card.color : "var(--border)" }}
                  >
                    {isActive && (
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: card.color }} />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
          {attemptedSubmit && !selected && (
            <p className="text-[11px] font-semibold text-red-500">
              {isEs ? "⚠️ Debes seleccionar un rol para continuar." : "⚠️ Please select a role to continue."}
            </p>
          )}
        </div>

        {/* ─── Name field (REQUERIDO) ───────────────── */}
        <div className="animate-fade-up-delay2 flex flex-col gap-1">
          <label className="rp-label">
            {isEs ? "Nombre o Razón Social *" : "Full Name or Company *"}
          </label>
          <input
            className="rp-input"
            placeholder={
              selected === "carrier"
                ? isEs ? "Ej: Transportes Arica SRL" : "e.g. Arica Freight Logistics"
                : isEs ? "Ej: Comercial Andina SA" : "e.g. Andean Imports LLC"
            }
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              borderColor: attemptedSubmit && !isNameValid ? "#DC2626" : undefined,
            }}
          />
          {attemptedSubmit && !isNameValid && (
            <p className="text-[11px] font-semibold text-red-500">
              {isEs ? "⚠️ El nombre es obligatorio (mínimo 2 caracteres)." : "⚠️ Name is required (min 2 chars)."}
            </p>
          )}
        </div>

        {/* ─── Wallet + CTA ────────────────────────── */}
        <div className="flex flex-col gap-2">
          {!isConnected ? (
            <button
              onClick={connect}
              disabled={isConnecting}
              className="rp-btn-primary w-full text-sm py-3.5 flex items-center justify-center gap-2"
              style={{ opacity: isConnecting ? 0.6 : 1 }}
            >
              <span>🔗</span>
              {isConnecting
                ? (isEs ? "Conectando Billetera…" : "Connecting Wallet…")
                : (isEs ? "Conectar Billetera Web3" : "Connect Web3 Wallet")}
            </button>
          ) : (
            <div
              className="p-2.5 rounded-xl flex items-center justify-between text-xs font-mono"
              style={{
                background: "rgba(8, 161, 110, 0.08)",
                border: "1px solid rgba(8, 161, 110, 0.25)",
              }}
            >
              <span className="flex items-center gap-1.5" style={{ color: "var(--green-main)" }}>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Wallet Conectada
              </span>
              <span className="font-bold text-slate-600">
                {address ? `${address.slice(0, 6)}…${address.slice(-4)}` : ""}
              </span>
            </div>
          )}

          <button
            onClick={handleContinue}
            disabled={!canSubmit}
            className="rp-btn-primary w-full text-sm py-3.5 mt-1"
            style={{
              opacity: !canSubmit ? 0.5 : 1,
              cursor: !canSubmit ? "not-allowed" : "pointer",
              background:
                selected === "carrier"
                  ? "linear-gradient(135deg, #08A16E 0%, #1ABD7C 100%)"
                  : undefined,
            }}
          >
            {isEs
              ? `Ingresar como ${selected ? (selected === "importer" ? "Importador" : "Transportista") : "…"} →`
              : `Enter as ${selected ? (selected === "importer" ? "Importer" : "Carrier") : "…"} →`}
          </button>
        </div>

        {/* ─── Footer ──────────────────────────────── */}
        <p className="text-center text-[10px]" style={{ color: "var(--text-muted)" }}>
          Avalanche C-Chain · Smart Trade Escrow · Tangem EAL6+
        </p>
      </div>
    </div>
  );
};

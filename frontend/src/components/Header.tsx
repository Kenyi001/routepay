import React from "react";
import { useWeb3 } from "@/context/Web3Context";
import { useLanguage } from "@/context/LanguageContext";
import { LoginRole } from "./LoginScreen";

interface HeaderProps {
  userName?: string;
  userRole?: LoginRole;
  onLogout?: () => void;
}

const ROLE_LABEL: Record<LoginRole, { es: string; en: string; color: string }> = {
  importer: { es: "Importador", en: "Importer", color: "#03409E" },
  carrier:  { es: "Transportista", en: "Carrier", color: "#08A16E" },
};

/** Generate a deterministic avatar color from a string */
function avatarColor(seed: string): string {
  const colors = ["#03409E", "#0A51B2", "#08A16E", "#012053", "#196ACA"];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export const Header: React.FC<HeaderProps> = ({ userName, userRole, onLogout }) => {
  const { address, isConnected, disconnect } = useWeb3();
  const { language, toggleLanguage } = useLanguage();
  const isEs = language === "es";

  const displayName = userName || (address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "User");
  const avatarBg = avatarColor(displayName);
  const roleInfo = userRole ? ROLE_LABEL[userRole] : null;

  return (
    <header
      className="flex items-center justify-between py-3 px-1 w-full"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      {/* ─── Left: Logo ──────────────────────────────── */}
      <div className="flex items-center gap-2.5">
        <img
          src="/Logo.png"
          alt="RoutePay Logo"
          className="h-10 w-10 object-contain rounded-xl shadow-sm"
        />
        <div>
          <h1
            className="font-extrabold text-base leading-tight tracking-tight"
            style={{ color: "var(--navy)" }}
          >
            RoutePay
          </h1>
          {roleInfo && (
            <span
              className="text-[10px] font-bold"
              style={{ color: roleInfo.color }}
            >
              {isEs ? roleInfo.es : roleInfo.en}
            </span>
          )}
        </div>
      </div>

      {/* ─── Right: Controls ─────────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Language toggle */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-colors"
          style={{
            border: "1.5px solid var(--border)",
            color: "var(--blue-main)",
            background: "var(--surface)",
          }}
          title={isEs ? "Change language" : "Cambiar idioma"}
        >
          {language === "es" ? "🇪🇸" : "🇺🇸"}
        </button>

        {/* Network chip — only shows when connected */}
        {isConnected && (
          <span
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
            style={{
              background: "rgba(8, 161, 110, 0.10)",
              color: "var(--green-main)",
              border: "1px solid rgba(8, 161, 110, 0.25)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "var(--green-main)" }}
            />
            AVAX
          </span>
        )}

        {/* Avatar + name + disconnect / connect */}
        {isConnected && address ? (
          <button
            onClick={onLogout ?? disconnect}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all"
            style={{
              border: "1.5px solid var(--border)",
              background: "var(--surface)",
            }}
            title={isEs ? "Salir / Desconectar" : "Sign out / Disconnect"}
          >
            {/* Avatar circle */}
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-[9px] flex-shrink-0"
              style={{ background: avatarBg }}
            >
              {initials(displayName)}
            </div>
            <span
              className="text-[11px] font-semibold hidden sm:block max-w-[80px] truncate"
              style={{ color: "var(--text-primary)" }}
            >
              {displayName}
            </span>
          </button>
        ) : (
          <button
            onClick={() => {/* handled by login screen */}}
            className="rp-btn-primary text-xs py-1.5 px-3"
          >
            {isEs ? "Conectar" : "Connect"}
          </button>
        )}
      </div>
    </header>
  );
};

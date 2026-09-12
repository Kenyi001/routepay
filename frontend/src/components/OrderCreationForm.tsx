import React from "react";
import { EscrowState } from "./TransitTimeline";

interface OrderCreationFormProps {
  origin: string;
  destination: string;
  frightAmount: string;
  setFrightAmount: (val: string) => void;
  manifestId: string;
  setManifestId: (val: string) => void;
  carrierAddress: string;
  setCarrierAddress: (val: string) => void;
  orderStatus: EscrowState;
  onOpenPollarModal: () => void;
  onCreateOrderDirect: () => void;
  protocolFee: string;
  carrierPayout: string;
}

export const OrderCreationForm: React.FC<OrderCreationFormProps> = ({
  origin,
  destination,
  frightAmount,
  setFrightAmount,
  manifestId,
  setManifestId,
  carrierAddress,
  setCarrierAddress,
  orderStatus,
  onOpenPollarModal,
  onCreateOrderDirect,
  protocolFee,
  carrierPayout,
}) => {
  return (
    <div className="rp-card p-5 flex flex-col gap-4 w-full">
      {/* ─── Header ─────────────────────────────────── */}
      <div
        className="flex items-center justify-between pb-3"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div>
          <h2 className="font-extrabold text-sm flex items-center gap-2" style={{ color: "var(--navy)" }}>
            📦 Panel del Importador
          </h2>
          <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
            Creación y custodia de órdenes de flete internacional
          </p>
        </div>
        <span className="rp-badge rp-badge-green font-mono text-[10px]">
          Pollar BOB ➔ USDC
        </span>
      </div>

      {/* ─── AVISO DINÁMICO DE ESTADO DEL PEDIDO AL IMPORTADOR ─── */}
      {orderStatus === "in_transit" && (
        <div
          className="p-4 rounded-xl flex flex-col gap-2.5 animate-fade-up"
          style={{
            background: "linear-gradient(135deg, rgba(3, 64, 158, 0.08) 0%, rgba(8, 161, 110, 0.08) 100%)",
            border: "1.5px solid var(--blue-main)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-black text-xs flex items-center gap-1.5" style={{ color: "var(--blue-main)" }}>
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
              🚛 ESTADO EN VIVO: Carga en Tránsito
            </span>
            <span className="rp-badge rp-badge-blue text-[9px] font-mono">
              Ruta Activa
            </span>
          </div>

          <div
            className="p-3 rounded-lg flex flex-col gap-1 text-xs"
            style={{ background: "#fff", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center justify-between font-bold" style={{ color: "var(--navy)" }}>
              <span>📍 Notificación de Almacén:</span>
              <span className="text-[10px] font-mono text-amber-600">Arribo en curso / Almacén</span>
            </div>
            <p className="text-[11px] leading-relaxed mt-0.5" style={{ color: "var(--text-secondary)" }}>
              Tu flete internacional (MIC/DTA <strong>{manifestId}</strong>) está en ruta hacia tu almacén en <strong>{destination}</strong>.
            </p>
          </div>

          {/* Tarjeta aclaratoria sobre posesión de la tarjeta Tangem */}
          <div
            className="p-3 rounded-lg flex items-start gap-2.5 text-xs"
            style={{ background: "rgba(8, 161, 110, 0.08)", border: "1px solid rgba(8, 161, 110, 0.25)" }}
          >
            <span className="text-xl">💳</span>
            <div>
              <p className="font-bold text-[11px]" style={{ color: "var(--green-main)" }}>
                Tarjeta Tangem NFC (En poder exclusivo del Transportista)
              </p>
              <p className="text-[10px] text-slate-600 leading-relaxed mt-0.5">
                Cuando el camión llegue a tu almacén, <strong>únicamente el transportista tiene la tarjeta física Tangem</strong> para apoyar en el dispositivo. Vos inspeccionás la carga y él firma el Tap para liberar el flete custodiado.
              </p>
            </div>
          </div>
        </div>
      )}

      {orderStatus === "settled" && (
        <div
          className="p-4 rounded-xl flex flex-col gap-1 text-center"
          style={{
            background: "rgba(8, 161, 110, 0.08)",
            border: "1.5px solid var(--green-main)",
          }}
        >
          <p className="text-xs font-black flex items-center justify-center gap-1.5" style={{ color: "var(--green-main)" }}>
            <span>🎉</span> ¡Tu pedido ya llegó a almacén y fue recibido!
          </p>
          <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
            El transportista confirmó la entrega con su tarjeta Tangem NFC. Fondos (${carrierPayout} USDC) liberados con éxito.
          </p>
        </div>
      )}

      {orderStatus === "refunded" && (
        <div
          className="p-3.5 rounded-xl flex flex-col gap-1 text-center"
          style={{
            background: "rgba(220, 38, 38, 0.08)",
            border: "1.5px solid var(--error)",
          }}
        >
          <p className="text-xs font-black" style={{ color: "var(--error)" }}>
            ⚠️ Fondos Reembolsados al Importador
          </p>
          <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
            El pedido superó el plazo estimado y los ${frightAmount} USDC fueron acreditados de vuelta a tu billetera.
          </p>
        </div>
      )}

      {/* ─── Formulario de Creación de Orden ─────────── */}
      <div className="flex flex-col gap-3.5 text-xs">
        {/* Route Details Box */}
        <div
          className="p-3.5 rounded-xl flex flex-col gap-2"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold" style={{ color: "var(--text-muted)" }}>
              Ruta Internacional de Carga
            </span>
            <span className="text-[10px] font-mono font-bold" style={{ color: "var(--blue-main)" }}>
              1,200 KM
            </span>
          </div>

          <div className="flex items-center gap-2 font-bold py-0.5" style={{ color: "var(--navy)" }}>
            <span className="text-base">🇨🇱</span>
            <span className="truncate">{origin}</span>
            <span style={{ color: "var(--blue-light)" }}>➔</span>
            <span className="text-base">🇧🇴</span>
            <span className="truncate">{destination}</span>
          </div>

          <div
            className="flex justify-between items-center text-[11px] pt-1.5 font-mono"
            style={{ borderTop: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            <span>Paso Fronterizo:</span>
            <span className="font-semibold" style={{ color: "var(--navy)" }}>Tambo Quemado (Aduana)</span>
          </div>
        </div>

        {/* Manifest ID Input */}
        <div>
          <label className="rp-label">
            ID de Manifiesto Aduanero (MIC/DTA) *
          </label>
          <input
            type="text"
            value={manifestId}
            onChange={(e) => setManifestId(e.target.value)}
            placeholder="MIC-DTA-2026-AR-BO-XXXX"
            className="rp-input font-mono"
          />
        </div>

        {/* Freight Amount Input */}
        <div>
          <label className="rp-label">
            Monto del Flete (USDC en Avalanche) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 font-bold text-slate-400">$</span>
            <input
              type="number"
              value={frightAmount}
              onChange={(e) => setFrightAmount(e.target.value)}
              className="rp-input pl-8 pr-16 font-mono font-bold text-sm"
            />
            <span
              className="absolute right-3.5 top-2.5 font-mono text-xs font-bold"
              style={{ color: "var(--green-main)" }}
            >
              USDC
            </span>
          </div>
        </div>

        {/* Carrier Wallet Address */}
        <div>
          <label className="rp-label">
            Wallet del Transportista Certificado
          </label>
          <input
            type="text"
            value={carrierAddress}
            onChange={(e) => setCarrierAddress(e.target.value)}
            className="rp-input font-mono text-xs"
            style={{ background: "var(--surface-2)" }}
          />
        </div>

        {/* Breakdown box */}
        <div
          className="p-3 rounded-xl text-[11px] flex flex-col gap-1.5"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
        >
          <div className="flex justify-between">
            <span>Pago al Transportista (99.5%):</span>
            <span className="font-mono font-bold" style={{ color: "var(--navy)" }}>${carrierPayout} USDC</span>
          </div>
          <div className="flex justify-between">
            <span>Comisión Protocolo RoutePay (0.5%):</span>
            <span className="font-mono font-semibold">${protocolFee} USDC</span>
          </div>
        </div>
      </div>

      {/* ─── Acciones de Fondeo ──────────────────────── */}
      {orderStatus === "none" ? (
        <div className="flex flex-col gap-2.5 mt-1">
          <button
            onClick={onOpenPollarModal}
            className="rp-btn-green w-full py-3.5 text-xs flex items-center justify-center gap-2"
          >
            <span>📱</span> Cargar Fondos con QR BOB (Pollar On-Ramp)
          </button>

          <button
            onClick={onCreateOrderDirect}
            className="rp-btn-primary w-full py-3.5 text-xs flex items-center justify-center gap-1.5"
          >
            <span>🔒</span> Bloquear ${frightAmount} USDC en Custodia Smart Contract
          </button>
        </div>
      ) : (
        <div
          className="p-3.5 rounded-xl text-center flex flex-col gap-1"
          style={{
            background: "rgba(8, 161, 110, 0.08)",
            border: "1px solid rgba(8, 161, 110, 0.3)",
          }}
        >
          <p className="text-xs font-bold flex items-center justify-center gap-1" style={{ color: "var(--green-main)" }}>
            <span>✓</span> Orden #101 Fondeada y Custodiada en Avalanche
          </p>
          <p className="text-[11px] font-mono" style={{ color: "var(--text-secondary)" }}>
            ${frightAmount} USDC bloqueados en el contrato TradeEscrow
          </p>
        </div>
      )}
    </div>
  );
};

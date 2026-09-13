import React, { useState } from "react";

export type EscrowState = "none" | "pending" | "funded" | "in_transit" | "settled" | "disputed" | "refunded";

interface TransitTimelineProps {
  orderStatus: EscrowState;
  carrierPayout: string;
  frightAmount?: string;
  onStartTransit: () => void;
  onOpenTangemModal: () => void;
  onClaimTimeoutRefund: () => void;
  onOpenTruckModal?: () => void;
  onOpenDispute?: () => void;
  onResolveDispute?: (refundImporter: boolean) => void;
  onOpenCertificate?: () => void;
  txHash?: string | null;
  explorerUrl?: string;
  isLoading?: boolean;
}

export const TransitTimeline: React.FC<TransitTimelineProps> = ({
  orderStatus,
  carrierPayout,
  frightAmount = "2500",
  onStartTransit,
  onOpenTangemModal,
  onClaimTimeoutRefund,
  onOpenTruckModal,
  onOpenDispute,
  onResolveDispute,
  onOpenCertificate,
  txHash,
  explorerUrl = "https://testnet.snowtrace.io",
  isLoading = false,
}) => {
  const [showTimeoutConfirm, setShowTimeoutConfirm] = useState(false);

  return (
    <div className="rp-card p-5 flex flex-col gap-4 w-full">
      {/* ─── Header ─────────────────────────────────── */}
      <div
        className="flex items-center justify-between pb-3"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div>
          <h2 className="font-extrabold text-sm flex items-center gap-2" style={{ color: "var(--navy)" }}>
            <svg className="w-4 h-4 text-[var(--blue-main)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="3" width="15" height="13" rx="1"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
            Panel del Transportista
          </h2>
          <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
            Seguimiento de envío de inicio a fin
          </p>
        </div>
        <span className="rp-badge rp-badge-blue font-mono text-[10px]">
          MIC/DTA · Orden #101
        </span>
      </div>

      {/* ─── Custody Balance Card ────────────────────── */}
      <div
        className="p-4 rounded-2xl relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, var(--navy) 0%, var(--blue-main) 100%)",
          color: "#fff",
          boxShadow: "0 6px 20px rgba(1, 32, 83, 0.20)",
        }}
      >
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-bold font-mono text-green-300">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            FONDOS EN CUSTODIA SMART CONTRACT
          </span>
          <span className="text-[10px] font-mono text-blue-200">Avalanche</span>
        </div>

        <div className="text-3xl font-black font-mono text-white mt-2 flex items-baseline gap-2">
          ${carrierPayout}
          <span className="text-sm font-semibold text-green-300">USDC</span>
        </div>

        <p className="text-[11px] text-blue-100 mt-1.5 leading-relaxed">
          {orderStatus === "settled"
            ? "Flete cobrado y transferido a tu billetera."
            : orderStatus === "refunded"
            ? "Fondos reembolsados al importador por exceder el tiempo estimado."
            : "Fondos 100% garantizados en custodia on-chain. Se liberan al transportista al verificar la entrega con la tarjeta Tangem NFC."}
        </p>

        <div
          className="mt-2.5 pt-2 flex items-center justify-between text-[10px] font-mono"
          style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}
        >
          <span className="text-blue-200">Portador de Tarjeta Tangem:</span>
          <span className="font-bold text-green-300">Transportista (Firma Presencial) ✓</span>
        </div>
      </div>

      {/* ─── Ruta y Estimación de Tiempo ─────────────── */}
      <div
        className="rounded-xl p-3 text-xs flex items-center justify-between"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
      >
        <div>
          <span className="text-[10px] font-bold block uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Ruta Internacional
          </span>
          <span className="font-bold" style={{ color: "var(--navy)" }}>
            Arica (CL) ➔ Santa Cruz (BO)
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold block uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Tiempo Estimado
          </span>
          <span className="font-bold" style={{ color: "var(--blue-main)" }}>
            7 días (Plazo Smart Contract)
          </span>
        </div>
      </div>

      {/* ─── Timeline: De Inicio a Fin del Envío ─────── */}
      <div
        className="rounded-xl p-4 flex flex-col gap-3.5 text-xs"
        style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
      >
        <span className="text-[10px] font-mono uppercase tracking-wider font-bold" style={{ color: "var(--text-secondary)" }}>
          Ciclo de Envío (Inicio a Fin)
        </span>

        <div className="flex flex-col gap-3">
          {/* Paso 1: Salida / Despacho en Puerto */}
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{
                  background: orderStatus !== "none" && orderStatus !== "pending" ? "var(--green-main)" : "var(--surface)",
                  color: orderStatus !== "none" && orderStatus !== "pending" ? "#fff" : "var(--text-muted)",
                  border: orderStatus !== "none" && orderStatus !== "pending" ? "none" : "1.5px solid var(--border)",
                }}
              >
                ✓
              </div>
              <div className="w-0.5 h-6 my-0.5" style={{ background: "var(--border)" }} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="font-bold" style={{ color: "var(--navy)" }}>
                  1. Inicio: Salida de Puerto Arica
                </span>
                <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                  {orderStatus !== "none" && orderStatus !== "pending" ? "Completado" : "Pendiente"}
                </span>
              </div>
              <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                Carga asignada y fondos depositados en el contrato de custodia.
              </p>
            </div>
          </div>

          {/* Paso 2: Tránsito Internacional & Aduana */}
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{
                  background:
                    orderStatus === "settled" ? "var(--green-main)"
                    : orderStatus === "in_transit" ? "var(--blue-bright)"
                    : "var(--surface)",
                  color: orderStatus === "funded" || orderStatus === "none" || orderStatus === "pending" ? "var(--text-muted)" : "#fff",
                  border:
                    orderStatus === "funded" || orderStatus === "none" || orderStatus === "pending"
                      ? "1.5px solid var(--border)"
                      : "none",
                }}
              >
                {orderStatus === "settled" ? "✓" : "2"}
              </div>
              <div className="w-0.5 h-6 my-0.5" style={{ background: "var(--border)" }} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="font-bold" style={{ color: "var(--navy)" }}>
                  2. Tránsito: Frontera Tambo Quemado
                </span>
                <span
                  className="text-[10px] font-mono font-bold"
                  style={{
                    color:
                      orderStatus === "in_transit" ? "var(--blue-bright)"
                      : orderStatus === "settled" ? "var(--green-main)"
                      : "var(--text-muted)",
                  }}
                >
                  {orderStatus === "in_transit" ? "En Ruta Activa" : orderStatus === "settled" ? "Superado" : "Pendiente"}
                </span>
              </div>
              <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                Tránsito internacional de flete y control aduanero binacional.
              </p>
            </div>
          </div>

          {/* Paso 3: Fin: Llegada & Tap Tangem NFC */}
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{
                  background: orderStatus === "settled" ? "var(--green-main)" : "var(--surface)",
                  color: orderStatus === "settled" ? "#fff" : "var(--text-muted)",
                  border: orderStatus === "settled" ? "none" : "1.5px solid var(--border)",
                }}
              >
                {orderStatus === "settled" ? "✓" : "3"}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <span className="font-bold" style={{ color: "var(--navy)" }}>
                  3. Llegada a Almacén & Tap Tangem (Exclusivo Transportista)
                </span>
                <span
                  className="text-[10px] font-mono font-bold"
                  style={{ color: orderStatus === "settled" ? "var(--green-main)" : "var(--text-muted)" }}
                >
                  {orderStatus === "settled" ? "Liquidado ✓" : "Llegada Notificada"}
                </span>
              </div>
              <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                El importador ya fue notificado de tu arribo al almacén. Como transportista portador de la tarjeta Tangem, acercala a tu dispositivo para confirmar la entrega y liberar el pago.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Botón Telemetría de Camión ─────────────── */}
      {onOpenTruckModal && (
        <button
          onClick={onOpenTruckModal}
          type="button"
          className="rp-btn-outline w-full py-2.5 text-xs flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4 text-[var(--blue-main)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
          Ver Tramo en Ruta y Telemetría
        </button>
      )}

      {/* ─── ACCIONES POR ESTADO ────────────────────── */}

      {/* ESTADO 1: Funded -> Iniciar Tránsito */}
      {orderStatus === "funded" && (
        <button
          onClick={onStartTransit}
          disabled={isLoading}
          className="rp-btn-primary w-full py-3.5 text-xs flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          {isLoading ? "Registrando salida en blockchain…" : "Iniciar Tránsito: Confirmar Salida de Puerto Arica"}
        </button>
      )}

      {/* ESTADO 2: In Transit -> Llegada & Tap Tangem NFC */}
      {orderStatus === "in_transit" && (
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onOpenTangemModal}
            className="rp-btn-green w-full py-3.5 text-xs flex items-center justify-center gap-2 shadow-lg"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
            </svg>
            <strong>Confirmar Entrega en Almacén (Firma con Tarjeta Tangem)</strong>
          </button>

          {onOpenDispute && (
            <button
              onClick={onOpenDispute}
              type="button"
              className="py-1 text-[11px] font-mono hover:underline flex items-center justify-center gap-1.5"
              style={{ color: "var(--warning)" }}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              Reportar Retención en Aduana (Tambo Quemado)
            </button>
          )}

          {/* ─── BOTÓN DE REEMBOLSO POR RETRASO / TIMEOUT ─── */}
          <div
            className="mt-2 p-3 rounded-xl flex flex-col gap-2"
            style={{
              background: "rgba(220, 38, 38, 0.05)",
              border: "1px dashed rgba(220, 38, 38, 0.3)",
            }}
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold flex items-center gap-1.5" style={{ color: "var(--error)" }}>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                ¿El flete tardó más del tiempo estimado?
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                Deadline: 7 días
              </span>
            </div>
            <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
              Si el transportista supera el plazo máximo estipulado sin entregar la carga, el smart contract permite solicitar el reembolso íntegro de los fondos custodiados.
            </p>

            {!showTimeoutConfirm ? (
              <button
                type="button"
                onClick={() => setShowTimeoutConfirm(true)}
                className="py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                style={{
                  background: "transparent",
                  border: "1.5px solid var(--error)",
                  color: "var(--error)",
                }}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 4v6h-6"></path>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
                Solicitar Reembolso por Expiración de Tiempo Estimado
              </button>
            ) : (
              <div className="flex flex-col gap-2 p-2 rounded-lg bg-red-50 border border-red-200">
                <p className="text-[11px] font-semibold text-red-700">
                  ¿Confirmar solicitud de reembolso por demora excesiva? Se ejecutará <code>refundOnTimeout()</code> en Avalanche.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTimeoutConfirm(false);
                      onClaimTimeoutRefund();
                    }}
                    disabled={isLoading}
                    className="flex-1 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    {isLoading ? "Procesando…" : "Sí, Reembolsar Fondos al Importador"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTimeoutConfirm(false)}
                    className="py-1.5 px-3 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ESTADO: Reembolsado por Timeout */}
      {orderStatus === "refunded" && (
        <div
          className="p-3.5 rounded-xl flex flex-col gap-2 text-center"
          style={{
            background: "rgba(220, 38, 38, 0.08)",
            border: "1px solid rgba(220, 38, 38, 0.3)",
          }}
        >
          <p className="text-xs font-extrabold flex items-center justify-center gap-1.5" style={{ color: "var(--error)" }}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            Fondos Reembolsados al Importador
          </p>
          <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
            El flete superó el tiempo estimado de entrega. El smart contract ejecutó <code>refundOnTimeout()</code> devolviendo el 100% (${frightAmount} USDC) al importador.
          </p>
        </div>
      )}

      {/* ESTADO: Disputado */}
      {orderStatus === "disputed" && onResolveDispute && (
        <div
          className="p-3.5 rounded-xl flex flex-col gap-2 text-left"
          style={{
            background: "rgba(245, 158, 11, 0.10)",
            border: "1px solid rgba(245, 158, 11, 0.4)",
          }}
        >
          <p className="text-xs font-bold flex items-center gap-1.5" style={{ color: "var(--warning)" }}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            Retención Aduanera Reportada en Tambo Quemado
          </p>
          <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
            Fiscalización aduanera en curso. Resolución mediante árbitro:
          </p>
          <div className="flex gap-2 mt-1">
            <button
              onClick={() => onResolveDispute(true)}
              className="flex-1 py-2 px-2 text-[10px] font-bold rounded-lg border border-amber-400 bg-white text-amber-800 hover:bg-amber-50"
            >
              Reembolsar Importador (100%)
            </button>
            <button
              onClick={() => onResolveDispute(false)}
              className="flex-1 py-2 px-2 text-[10px] font-bold rounded-lg text-white bg-green-600 hover:bg-green-700"
            >
              Liberar Flete a Transportista
            </button>
          </div>
        </div>
      )}

      {/* ESTADO: Settled -> Cobrado con éxito */}
      {orderStatus === "settled" && (
        <div
          className="p-4 rounded-xl text-center flex flex-col gap-2.5 animate-success-pop"
          style={{
            background: "rgba(8, 161, 110, 0.08)",
            border: "1.5px solid rgba(8, 161, 110, 0.35)",
          }}
        >
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-[var(--green-main)] flex items-center justify-center">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <p className="text-sm font-extrabold" style={{ color: "var(--green-main)" }}>
            ¡Flete Cobrado con Éxito!
          </p>
          <p className="text-xs font-mono font-bold" style={{ color: "var(--navy)" }}>
            ${carrierPayout} USDC acreditados a tu billetera
          </p>
          <p className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
            Entrega física confirmada presencialmente mediante clave criptográfica de tarjeta Tangem NFC.
          </p>

          {onOpenCertificate && (
            <button
              onClick={onOpenCertificate}
              className="rp-btn-green w-full py-2.5 text-xs mt-1 flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              Ver Certificado Criptográfico de Entrega
            </button>
          )}

          {txHash && (
            <a
              href={`${explorerUrl}/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] font-mono hover:underline break-all mt-1"
              style={{ color: "var(--blue-light)" }}
            >
              Ver Tx en SnowTrace ↗ ({txHash.slice(0, 18)}…)
            </a>
          )}
        </div>
      )}
    </div>
  );
};

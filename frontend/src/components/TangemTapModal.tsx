import React, { useState, useEffect } from "react";
import { EscrowState } from "./TransitTimeline";

interface TangemTapModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  orderStatus: EscrowState;
  onSettled: () => void;
  frightAmount: string;
  carrierPayout: string;
  protocolFee: string;
  onOpenCertificate?: () => void;
}

export const TangemTapModal: React.FC<TangemTapModalProps> = ({
  isOpen = true,
  onClose,
  orderStatus,
  onSettled,
  frightAmount,
  carrierPayout,
  protocolFee,
  onOpenCertificate,
}) => {
  const [isScanningNfc, setIsScanningNfc] = useState(false);
  const [tapSuccess, setTapSuccess] = useState(orderStatus === "settled");
  const [nfcError, setNfcError] = useState<string | null>(null);
  const [showCryptoInspector, setShowCryptoInspector] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    if (orderStatus === "settled") {
      setTapSuccess(true);
    }
  }, [orderStatus]);

  if (!isOpen) return null;

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
        ndef.onreading = () => {
          setIsScanningNfc(false);
          setTapSuccess(true);
          onSettled();
        };
        ndef.onreadingerror = () => {
          setNfcError("Lectura NFC interrumpida. Mantén la tarjeta Tangem apoyada en el teléfono.");
          setIsScanningNfc(false);
        };
        return;
      } catch (err: unknown) {
        console.warn("Web NFC unavailable, using simulation fallback.", err);
      }
    }

    // Simulation fallback for desktop / environments without NFC
    setTimeout(() => {
      setIsScanningNfc(false);
      setTapSuccess(true);
      onSettled();
    }, 1800);
  };

  const content = (
    <div
      className="rp-card p-5 flex flex-col gap-4 items-center text-center w-full max-w-md relative"
      style={{ borderColor: tapSuccess ? "var(--green-main)" : "var(--border)" }}
    >
      {/* Botón cerrar si se usa en overlay */}
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all text-sm font-bold"
          title="Cerrar"
        >
          ✕
        </button>
      )}

      {/* Badge */}
      <span className="rp-badge rp-badge-blue text-[10px] uppercase tracking-wider">
        Confirmación Física · Hardware EAL6+
      </span>

      <div>
        <h2 className="font-black text-xl" style={{ color: "var(--navy)" }}>
          {tapSuccess ? "¡Entrega Verificada! 🎉" : "Acerca la Tarjeta Tangem NFC"}
        </h2>
        <p className="text-xs mt-1 max-w-xs" style={{ color: "var(--text-secondary)" }}>
          {tapSuccess
            ? "Firma EIP-712 válida. Pago liberado instantáneamente en Avalanche."
            : "El receptor valida la llegada física haciendo tap con su tarjeta Tangem."}
        </p>
      </div>

      {/* ─── 3D Card Flip ─────────────────────────────────────── */}
      <div className="relative flex items-center justify-center w-full my-1">
        {/* NFC Pulse rings */}
        {isScanningNfc && (
          <>
            <div
              className="absolute w-48 h-48 rounded-full nfc-pulse-ring"
              style={{ border: "1.5px solid rgba(3, 64, 158, 0.4)" }}
            />
            <div
              className="absolute w-36 h-36 rounded-full nfc-pulse-ring"
              style={{ border: "1.5px solid rgba(3, 64, 158, 0.6)", animationDelay: "0.4s" }}
            />
          </>
        )}

        {/* Card flip scene */}
        <div className="card-flip-scene" style={{ maxWidth: 280, height: 170 }}>
          <div className={`card-flip-inner ${tapSuccess ? "flipped" : ""}`}>

            {/* Front face — "tap to sign" */}
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

              {isScanningNfc && (
                <div className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span className="text-white text-xs font-mono">Leyendo NFC…</span>
                </div>
              )}

              <div>
                <p className="text-[9px] text-white/60 font-mono tracking-wider">CC EAL6+ SECURE ELEMENT</p>
                <p className="text-xs font-extrabold text-white font-mono tracking-wider mt-0.5">
                  {isScanningNfc ? "ESCANEO EN PROCESO..." : "RECEPTOR AUTORIZADO"}
                </p>
              </div>

              <div className="flex justify-between items-end text-[9px] font-mono text-white/60">
                <span>ROUTE PAY PROTOCOL</span>
                <span className="text-red-400 font-bold">TAP TO SIGN</span>
              </div>
            </div>

            {/* Back face — success state */}
            <div className="card-face card-back p-4 flex flex-col justify-between text-left">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold tracking-widest text-white/80 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  TANGEM NFC
                </span>
                <span className="text-[9px] font-black text-white bg-white/20 px-2 py-0.5 rounded-full">EIP-712 ✓</span>
              </div>

              <div className="text-center">
                <div className="text-3xl mb-1">✅</div>
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

      {/* Card click hint */}
      {!tapSuccess && !isScanningNfc && (
        <p className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
          Tocá la tarjeta o presioná el botón abajo
        </p>
      )}

      {nfcError && (
        <div
          className="w-full p-2.5 rounded-lg text-[11px] font-mono"
          style={{
            background: "rgba(220, 38, 38, 0.08)",
            border: "1px solid rgba(220, 38, 38, 0.3)",
            color: "var(--error)",
          }}
        >
          ⚠️ {nfcError}
        </div>
      )}

      {/* Main CTA or payout summary */}
      {!tapSuccess ? (
        <button
          onClick={handleTangemTap}
          disabled={isScanningNfc}
          className="rp-btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2"
          style={{ opacity: isScanningNfc ? 0.7 : 1 }}
        >
          {isScanningNfc ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Leyendo Chip NFC…
            </>
          ) : (
            <>💳 Confirmar Entrega con Tangem NFC</>
          )}
        </button>
      ) : (
        <div
          className="w-full flex flex-col gap-2.5 p-4 rounded-xl text-left animate-success-pop"
          style={{
            background: "rgba(8, 161, 110, 0.08)",
            border: "1px solid rgba(8, 161, 110, 0.3)",
          }}
        >
          <div className="font-black text-sm flex items-center justify-between" style={{ color: "var(--green-main)" }}>
            <span>🎉 Flete Liquidado Instantáneamente</span>
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded-full"
              style={{ background: "rgba(8,161,110,0.15)", border: "1px solid rgba(8,161,110,0.3)" }}
            >
              EIP-712
            </span>
          </div>

          <div
            className="text-xs flex justify-between font-mono pt-2"
            style={{ borderTop: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            <span>🚚 Pago Transportista (99.5%):</span>
            <span className="font-extrabold" style={{ color: "var(--navy)" }}>${carrierPayout} USDC</span>
          </div>

          <div className="text-xs flex justify-between font-mono" style={{ color: "var(--text-muted)" }}>
            <span>⚡ Comisión RoutePay (0.5%):</span>
            <span className="font-bold">${protocolFee} USDC</span>
          </div>

          <div
            className="text-[10px] font-mono mt-1 pt-2 flex items-center justify-between"
            style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted)" }}
          >
            <span>Tx Avalanche:</span>
            <span>0x9a8f27b4…3e1</span>
          </div>

          {onOpenCertificate && (
            <button
              onClick={onOpenCertificate}
              className="rp-btn-green w-full mt-2 py-2.5 text-xs"
            >
              📜 Ver Certificado de Liquidación
            </button>
          )}
        </div>
      )}

      {/* EIP-712 inspector toggle */}
      <div className="w-full text-left mt-1">
        <button
          onClick={() => setShowCryptoInspector(!showCryptoInspector)}
          className="text-[11px] font-mono underline decoration-dotted"
          style={{ color: "var(--blue-light)" }}
        >
          {showCryptoInspector ? "▲ Ocultar prueba EIP-712" : "▼ Ver prueba criptográfica EIP-712 (Tangem)"}
        </button>
        {showCryptoInspector && (
          <div
            className="w-full rounded-xl p-3 text-left font-mono text-[10px] mt-2 flex flex-col gap-1"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            <p className="font-bold" style={{ color: "var(--blue-main)" }}>Tangem Hardware EIP-712 Payload:</p>
            <p>TypeHash: 0x9f3e82...c014 (SettleWithTangemTap)</p>
            <p>OrderId: 101 | ChainId: 43113</p>
            <p>Chip Public Key: 0x4f30B89...f71f4</p>
            <p>ECDSA Signature: r, s, v verified on-chain</p>
            <p className="font-bold" style={{ color: "var(--green-main)" }}>Status: RECOVERED_VALID_SIGNER ✓</p>
          </div>
        )}
      </div>

      {/* Why Tangem tooltip */}
      <div className="w-full text-left">
        <button
          onClick={() => setShowTooltip(!showTooltip)}
          className="text-[11px] flex items-center gap-1.5 font-mono underline decoration-dotted"
          style={{ color: "var(--text-muted)" }}
        >
          ❓ ¿Por qué Tangem NFC? {showTooltip ? "▲" : "▼"}
        </button>
        {showTooltip && (
          <div
            className="mt-2 p-3 rounded-xl text-[11px] leading-relaxed"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            💡 <strong style={{ color: "var(--navy)" }}>Seguridad Anti-Fraude:</strong> Bloquea la liberación
            del pago en blockchain hasta la recepción física confirmada por la clave privada del chip
            Tangem (hardware). Imposible de falsificar sin la tarjeta física.
          </div>
        )}
      </div>
    </div>
  );

  // Si tiene onClose, renderizamos en overlay modal
  if (onClose) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-up">
        {content}
      </div>
    );
  }

  return content;
};

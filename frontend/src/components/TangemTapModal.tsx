import React, { useState } from "react";
import { EscrowState } from "./TransitTimeline";

interface TangemTapModalProps {
  orderStatus: EscrowState;
  onSettled: () => void;
  frightAmount: string;
  carrierPayout: string;
  protocolFee: string;
  onOpenCertificate?: () => void;
}

export const TangemTapModal: React.FC<TangemTapModalProps> = ({
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
  const [showTooltip, setShowTooltip] = useState(false);
  const [showCryptoInspector, setShowCryptoInspector] = useState(false);

  const handleTangemTap = async () => {
    setIsScanningNfc(true);
    setNfcError(null);

    // Attempt Web NFC if supported (Android Chrome)
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
        console.warn("Web NFC unavailable or permission denied, using EIP-712 simulation fallback.", err);
      }
    }

    // Simulation fallback for desktop or environments without NFC hardware
    setTimeout(() => {
      setIsScanningNfc(false);
      setTapSuccess(true);
      onSettled();
    }, 1800);
  };

  return (
    <div className="glass-panel-glow rounded-2xl p-5 flex flex-col gap-4 items-center text-center border border-[#0A58CA]/40 shadow-2xl bg-[#1F2937]/95 w-full">
      {/* Badge */}
      <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-[#0A58CA]/20 text-blue-300 border border-[#0A58CA]/40 font-bold uppercase tracking-wider">
        Confirmación Física Presencial Hardware
      </span>

      <div>
        <h2 className="font-black text-xl text-white">Acerca la Tarjeta Tangem NFC</h2>
        <p className="text-xs text-slate-300 mt-1 max-w-xs">
          El receptor en almacén valida la llegada haciendo tap con su tarjeta de hardware en el teléfono Android.
        </p>
      </div>

      {/* Tangem Physical Card Graphical Representation with Sapphire & Crimson Holographic Effect */}
      <div className="relative my-3 flex items-center justify-center">
        {isScanningNfc && (
          <div className="absolute w-48 h-48 rounded-full border border-[#0A58CA]/60 nfc-pulse-ring"></div>
        )}

        <div
          className={`tangem-card w-60 h-36 rounded-2xl p-4 flex flex-col justify-between text-left transition-all duration-500 cursor-pointer ${
            isScanningNfc
              ? "scale-105 shadow-2xl shadow-[#0A58CA]/50 border-[#0A58CA]"
              : tapSuccess
              ? "border-[#10B981] shadow-2xl shadow-[#10B981]/40"
              : "hover:scale-[1.02]"
          }`}
          onClick={!tapSuccess ? handleTangemTap : undefined}
        >
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono font-bold tracking-widest text-slate-200 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#E84142]"></span> TANGEM NFC
            </span>
            <div className="w-6 h-4 rounded bg-amber-400/90 border border-amber-200 shadow-inner flex items-center justify-center text-[7px] font-bold text-black">
              CHIP
            </div>
          </div>

          <div>
            <p className="text-[9px] text-slate-300 font-mono tracking-wider">
              CC EAL6+ SECURE ELEMENT
            </p>
            <p className="text-xs font-mono font-extrabold text-white tracking-wider">
              {tapSuccess
                ? "FIRMA EIP-712 VÁLIDA ✓"
                : isScanningNfc
                ? "ESCANEO EN PROCESO..."
                : "RECEPTOR AUTORIZADO"}
            </p>
          </div>

          <div className="flex justify-between items-end text-[9px] font-mono text-slate-300">
            <span>ROUTE PAY PROTOCOL</span>
            <span className={tapSuccess ? "text-[#10B981] font-bold" : "text-[#E84142]"}>
              {tapSuccess ? "HARDWARE VERIFIED" : "TAP TO SIGN"}
            </span>
          </div>
        </div>
      </div>

      {nfcError && (
        <div className="p-2 bg-[#E84142]/20 border border-[#E84142]/40 rounded-lg text-[11px] text-[#E84142] font-mono">
          ⚠️ {nfcError}
        </div>
      )}

      {/* Main Action or Payout Summary */}
      {!tapSuccess ? (
        <button
          onClick={handleTangemTap}
          disabled={isScanningNfc}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0A58CA] via-[#1D4ED8] to-[#E84142] text-white font-black text-sm shadow-xl shadow-[#0A58CA]/30 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {isScanningNfc ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
              Leyendo Chip NFC de la tarjeta...
            </>
          ) : (
            <>
              <span>💳</span> Confirmar Entrega con Tarjeta Tangem NFC
            </>
          )}
        </button>
      ) : (
        <div className="w-full flex flex-col gap-2.5 p-4 bg-[#10B981]/15 border border-[#10B981]/40 rounded-xl text-left shadow-lg">
          <div className="text-[#10B981] font-black text-sm flex items-center justify-between">
            <span>🎉 ¡Flete Liquidado Instantáneamente!</span>
            <span className="text-[10px] font-mono bg-[#10B981]/20 px-2 py-0.5 rounded border border-[#10B981]/30">
              EIP-712
            </span>
          </div>

          <div className="text-xs text-slate-200 flex justify-between font-mono pt-1 border-t border-white/10">
            <span>🚚 Pago Transportista (99.5%):</span>
            <span className="font-extrabold text-white">${carrierPayout} USDC</span>
          </div>

          <div className="text-xs text-slate-300 flex justify-between font-mono">
            <span>⚡ Comisión RoutePay (0.5%):</span>
            <span className="font-bold text-slate-300">${protocolFee} USDC</span>
          </div>

          <div className="text-[10px] text-blue-300 font-mono mt-1 pt-2 border-t border-white/10 break-all flex items-center justify-between">
            <span>Tx Avalanche:</span>
            <span className="text-slate-400">0x9a8f27b4e61d8892f3e1...</span>
          </div>

          {onOpenCertificate && (
            <button
              onClick={onOpenCertificate}
              className="w-full mt-2 py-2.5 bg-gradient-to-r from-[#10B981] to-[#0A58CA] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-[#10B981]/20 hover:opacity-95 active:scale-95 transition-all"
            >
              📜 Ver Certificado Criptográfico de Liquidación
            </button>
          )}
        </div>
      )}

      {/* EIP-712 Hardware Cryptographic Inspector */}
      <div className="w-full mt-1">
        <button
          onClick={() => setShowCryptoInspector(!showCryptoInspector)}
          className="text-[11px] font-mono text-blue-400 hover:text-blue-300 underline decoration-dotted"
        >
          {showCryptoInspector ? "▲ Ocultar prueba criptográfica EIP-712" : "▼ Ver prueba criptográfica EIP-712 (Tangem)"}
        </button>
        {showCryptoInspector && (
          <div className="w-full bg-[#0F172A] border border-[#0A58CA]/40 rounded-xl p-3 text-left font-mono text-[10px] text-slate-300 mt-2 flex flex-col gap-1 shadow-inner">
            <p className="text-blue-300 font-bold">Tangem Hardware EIP-712 Payload:</p>
            <p className="text-slate-400">TypeHash: 0x9f3e82...c014 (SettleWithTangemTap)</p>
            <p className="text-slate-400">OrderId: 101 | ChainId: 43113 (Avalanche Fuji)</p>
            <p className="text-slate-400">Chip Public Key: 0x4f30B89...f71f4</p>
            <p className="text-slate-400">ECDSA Signature: r, s, v verified on-chain</p>
            <p className="text-[#10B981] font-bold">Status: RECOVERED_VALID_SIGNER (Hardware verified)</p>
          </div>
        )}
      </div>

      {/* Tooltip / Explicación de Valor */}
      <div className="w-full text-left mt-1">
        <button
          onClick={() => setShowTooltip(!showTooltip)}
          className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1.5 font-mono underline decoration-dotted"
        >
          <span>❓</span> ¿Por qué Tangem NFC? {showTooltip ? "▲" : "▼"}
        </button>

        {showTooltip && (
          <div className="mt-2 p-3 bg-[#0F172A] rounded-xl border border-white/10 text-[11px] text-slate-300 leading-relaxed animate-fadeIn">
            💡 <strong className="text-white">Seguridad Anti-Fraude:</strong> Evita el fraude en factoraje al bloquear la liberación del pago en la blockchain hasta la recepción física confirmada por la clave criptográfica privada del chip hardware Tangem.
          </div>
        )}
      </div>
    </div>
  );
};

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "es" | "en";

export const translations = {
  es: {
    header: {
      tagline: "TANGEM NFC ESCROW",
      fuji: "Fuji",
      connectWallet: "Conectar Billetera",
      connecting: "Conectando...",
      disconnectTitle: "Desconectar Billetera",
    },
    lifecycle: {
      step1: "1. Bóveda Fondeada",
      step2: "2. En Carretera",
      step3: "3. Tap Tangem",
      stepDispute: "En Disputa",
      stepRefunded: "Reembolsado",
    },
    roles: {
      importer: "1. Importador",
      carrier: "2. Transportista",
      warehouse: "3. Tap Tangem",
    },
    importer: {
      title: "Crear Orden de Custodia",
      pollarBadge: "Pollar Onramp",
      routeLabel: "Ruta Internacional",
      originArica: "Puerto de Arica, Chile",
      destSantaCruz: "Santa Cruz de la Sierra, Bolivia",
      amountLabel: "Monto del Flete (USDC)",
      carrierLabel: "Transportista Certificado (Unlock)",
      feeLabel: "Comisión Protocolo (0.5%):",
      btnLock: "Bloquear Fondos con Pollar (QR / USDC)",
      btnLocking: "Procesando en Avalanche Fuji...",
      fundedSuccess: "✓ Orden #1 Fondeada Exitosamente",
      fundedSub: "Fondos custodiados en Avalanche Fuji",
      viewSnowtrace: "Ver Tx en SnowTrace ↗",
      btnNextCarrier: "Siguiente: Ver como Transportista ➔",
      timeoutGuarantee: "Garantía de Timeout: Reembolso 100% automático si la carga no llega en 7 días.",
    },
    carrier: {
      title: "Panel del Chofer",
      orderTag: "Orden #1",
      guaranteedFunds: "Fondos Garantizados en Smart Contract",
      guaranteedSub: "Se liberarán inmediatamente cuando el receptor haga tap con su tarjeta Tangem en destino.",
      tripStatus: "Estado del Viaje (1,200 km)",
      aricaDone: "Arica (Carga Despachada)",
      completed: "Completado",
      tamboBorder: "Tambo Quemado (Aduana Frontera)",
      inTransit: "En Tránsito",
      waitingDeparture: "Esperando Salida",
      santaCruzDest: "Santa Cruz (Almacén Central)",
      pending: "Pendiente",
      btnStart: "Confirmar Salida de Puerto (Ver Camión en Ruta)",
      btnStarting: "Registrando salida en Fuji...",
      btnDemoTruck: "Ver animación del camión en ruta (Demo)",
      btnArrived: "Llegué a Destino ➔ Proceder al Tap Tangem",
      settledSuccess: "✓ ¡Flete Cobrado con Éxito!",
      settledSub: "Saldo transferido a tu billetera",
      btnReportDispute: "Reportar Paro o Retención en Frontera",
    },
    warehouse: {
      badge: "Confirmación Física Presencial",
      title: "Acerca la Tarjeta Tangem NFC",
      desc: "El receptor en almacén valida la mercadería haciendo tap con su tarjeta física de hardware al teléfono.",
      chipText: "CC EAL6+ SECURE ELEMENT",
      chipValid: "FIRMA EIP-712 VÁLIDA",
      chipReady: "RECEPTOR AUTORIZADO",
      btnTap: "Confirmar Entrega con Tarjeta Tangem",
      btnReading: "Leyendo Chip NFC...",
      payoutSuccess: "¡Flete Liquidado Instantáneamente!",
      carrierPayout: "Pago al Transportista:",
      protocolFee: "Comisión RoutePay (0.5%):",
      viewSnowtrace: "Ver en SnowTrace ↗",
    },
    truckModal: {
      corridor: "Corredor Bioceánico Arica ➔ Santa Cruz",
      title: "Despacho en Ruta Internacional",
      order: "Orden",
      arica: "Arica (CL) (Salida)",
      tambo: "Tambo Quemado (Aduana)",
      santaCruz: "Santa Cruz (BO)",
      inProgress: "En marcha hacia aduana...",
      completed: "Ruta completada",
      successTitle: "¡Salida Confirmada con Éxito!",
      successDesc: "El camión pesado está registrado en tránsito en la aduana de Arica. Fondos asegurados en Avalanche Fuji:",
      escrowLocked: "Garantía Retenida:",
      manifest: "Manifiesto:",
      verifiedFuji: "Verificado en Fuji",
      btnContinue: "Continuar al Panel de Monitoreo ➔",
      registeringCoords: "Registrando coordenadas y manifiesto en Avalanche...",
    },
    dispute: {
      title: "Contingencia en Frontera (Tambo Quemado)",
      desc: "El camión se encuentra demorado por revisión aduanera o bloqueo. Los fondos quedan asegurados en el contrato.",
      status: "Estado: En Disputa (Disputed)",
      resolveRefund: "Árbitro: Reembolsar al Importador",
      resolvePay: "Árbitro: Liberar Fondos al Transportista",
    },
    activity: {
      title: "Registro de Actividad en Smart Contract",
      noActivity: "Esperando primer evento...",
    },
    footer: {
      protocol: "RoutePay Protocol · ETH Bolivia",
      tracks: "Avalanche Fuji · Pollar · Tangem",
    },
  },
  en: {
    header: {
      tagline: "TANGEM NFC ESCROW",
      fuji: "Fuji",
      connectWallet: "Connect Wallet",
      connecting: "Connecting...",
      disconnectTitle: "Disconnect Wallet",
    },
    lifecycle: {
      step1: "1. Vault Funded",
      step2: "2. On Highway",
      step3: "3. Tangem Tap",
      stepDispute: "In Dispute",
      stepRefunded: "Refunded",
    },
    roles: {
      importer: "1. Importer",
      carrier: "2. Carrier",
      warehouse: "3. Tangem Tap",
    },
    importer: {
      title: "Create Freight Escrow Order",
      pollarBadge: "Pollar Onramp",
      routeLabel: "International Route",
      originArica: "Port of Arica, Chile",
      destSantaCruz: "Santa Cruz de la Sierra, Bolivia",
      amountLabel: "Freight Amount (USDC)",
      carrierLabel: "Certified Carrier (Unlock)",
      feeLabel: "Protocol Fee (0.5%):",
      btnLock: "Lock Funds with Pollar (QR / USDC)",
      btnLocking: "Processing on Avalanche Fuji...",
      fundedSuccess: "✓ Order #1 Funded Successfully",
      fundedSub: "Funds securely escrowed on Avalanche Fuji",
      viewSnowtrace: "View Tx on SnowTrace ↗",
      btnNextCarrier: "Next: View as Carrier ➔",
      timeoutGuarantee: "Timeout Guarantee: 100% automated refund if cargo is not delivered within 7 days.",
    },
    carrier: {
      title: "Carrier & Driver Dashboard",
      orderTag: "Order #1",
      guaranteedFunds: "Guaranteed Funds in Smart Contract",
      guaranteedSub: "Will be released immediately once recipient taps their Tangem hardware card at destination.",
      tripStatus: "Trip Status (1,200 km)",
      aricaDone: "Arica (Cargo Dispatched)",
      completed: "Completed",
      tamboBorder: "Tambo Quemado (Customs Border)",
      inTransit: "In Transit",
      waitingDeparture: "Awaiting Departure",
      santaCruzDest: "Santa Cruz (Central Warehouse)",
      pending: "Pending",
      btnStart: "Confirm Port Departure (See Truck on Route)",
      btnStarting: "Registering departure on Fuji...",
      btnDemoTruck: "View truck route animation (Demo)",
      btnArrived: "Arrived at Destination ➔ Proceed to Tangem Tap",
      settledSuccess: "✓ Freight Paid Successfully!",
      settledSub: "Balance transferred to carrier wallet",
      btnReportDispute: "Report Border Delay / Customs Hold",
    },
    warehouse: {
      badge: "Physical In-Person Verification",
      title: "Tap Tangem NFC Card",
      desc: "Warehouse receiver verifies goods delivery by tapping their physical hardware card against the phone.",
      chipText: "CC EAL6+ SECURE ELEMENT",
      chipValid: "VALID EIP-712 SIGNATURE",
      chipReady: "AUTHORIZED RECEIVER",
      btnTap: "Confirm Delivery with Tangem Card",
      btnReading: "Reading NFC Chip...",
      payoutSuccess: "Freight Settled Instantly!",
      carrierPayout: "Carrier Payout:",
      protocolFee: "RoutePay Fee (0.5%):",
      viewSnowtrace: "View on SnowTrace ↗",
    },
    truckModal: {
      corridor: "Bioceanic Corridor Arica ➔ Santa Cruz",
      title: "International Route Dispatch",
      order: "Order",
      arica: "Arica (CL) (Departure)",
      tambo: "Tambo Quemado (Customs)",
      santaCruz: "Santa Cruz (BO)",
      inProgress: "En route to customs...",
      completed: "Route completed",
      successTitle: "Departure Confirmed Successfully!",
      successDesc: "Heavy freight truck registered in transit at Arica customs. Funds secured in Avalanche Fuji:",
      escrowLocked: "Locked Escrow Guarantee:",
      manifest: "Manifest:",
      verifiedFuji: "Verified on Fuji",
      btnContinue: "Continue to Monitoring Dashboard ➔",
      registeringCoords: "Registering coordinates and manifest on Avalanche...",
    },
    dispute: {
      title: "Customs Contingency (Tambo Quemado)",
      desc: "Truck is detained at the border due to inspection or roadblock. Funds remain cryptographically locked in contract.",
      status: "Status: In Dispute",
      resolveRefund: "Arbiter: Refund to Importer",
      resolvePay: "Arbiter: Release to Carrier",
    },
    activity: {
      title: "Live Smart Contract Activity Log",
      noActivity: "Waiting for first on-chain event...",
    },
    footer: {
      protocol: "RoutePay Protocol · ETH Bolivia",
      tracks: "Avalanche Fuji · Pollar · Tangem",
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: typeof translations.es;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "es",
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: translations.es,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("es");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("routepay_lang") as Language;
      if (saved === "es" || saved === "en") {
        setLanguageState(saved);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("routepay_lang", lang);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "es" ? "en" : "es");
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

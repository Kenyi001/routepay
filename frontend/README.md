# RoutePay Frontend

App móvil-first en Next.js + wagmi/viem para el flujo de escrow de flete.

## Stack

- Next.js
- wagmi / viem (conexión a Avalanche Fuji)
- Web NFC API (`NDEFReader`) para el tap de la tarjeta Tangem — **solo funciona en Chrome
  para Android**; no soportado en Safari/iOS (ver riesgo en `docs/ARCHITECTURE.md`)
- Checkout de Pollar para el onramp BOB → USDC

## Pantallas (ver `02-Arquitectura/TAREAS-Y-ROLES.md` en el repo de planificación)

1. **Importador:** formulario para crear orden (monto, destino, dirección del transportista).
2. **Transportista:** estado en ruta ("Fondos asegurados en contrato").
3. **Entrega y Tap:** botón "Confirmar entrega física con tarjeta Tangem" que dispara la
   lectura NFC y liquida el pago.

## Cómo correrlo

```bash
npm install
cp .env.example .env.local
npm run dev
```

> Nota: esta carpeta aún no tiene la app inicializada (`create-next-app` pendiente) —
> es la base para que Victor arranque el setup real.

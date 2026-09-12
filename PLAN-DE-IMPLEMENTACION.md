# 🚀 RoutePay — Plan de Implementación y Reparto de Tareas

> **Hackathon:** ETH Bolivia Buildathon 2026 (Cochabamba)  
> **Proyecto:** RoutePay — Smart Trade & Logistics Escrow con Tangem NFC y Pollar en Avalanche Fuji  
> **Ramas Activas:** `frontend/amira`, `frontend/victor`, `frontend/amira-y-victor`, `main`

---

## 📌 Flujo de Trabajo en Git

```
                  ┌──> frontend/amira (UI/UX, componentes, diseño) ──┐
main (base/backend)                                                   ├──> frontend/amira-y-victor ──> PR a main
                  └──> frontend/victor (Wagmi, Viem, hooks Web3)  ──┘
```

1. **Amira** trabaja en su rama: `frontend/amira`
2. **Víctor** trabaja en su rama: `frontend/victor`
3. Ambos integran sus cambios en la rama compartida: **`frontend/amira-y-victor`**
4. Una vez probado el flujo completo de punta a punta, se hace el merge final a **`main`**.

---

## 🎨 Tareas de Amira (Frontend UI/UX Lead)
* **Rama de trabajo:** `frontend/amira`
* **Guía detallada:** Ver [`TASKS-AMIRA.md`](./TASKS-AMIRA.md)

### Tareas Prioritarias:
1. **Modularizar componentes (`src/components/`):**
   - Extraer la lógica visual de `src/app/page.tsx` en componentes independientes:
     - `OrderCreationForm.tsx`: Formulario del importador (Manifiesto aduanero `MIC/DTA`, ruta Arica ➔ Santa Cruz, monto USDC y botón On-Ramp Pollar QR).
     - `TransitTimeline.tsx`: Stepper de seguimiento de ruta (Creado ➔ Custodiado ➔ En Tránsito ➔ Entregado).
     - `TangemTapModal.tsx`: Visualización holográfica de la tarjeta Tangem con ondas de pulso NFC animadas.
     - `SettlementBreakdown.tsx`: Desglose de liquidación ($2,487.50 USDC transportista / $12.50 USDC protocolo).
2. **Estética Cyber-Fintech:**
   - Aplicar la paleta de tracks: Rojo Avalanche (`#E84142`), Verde Pollar (`#10B981`), Plateado Tangem (`#94A3B8`), Dorado RoutePay (`#F59E0B`).
   - Agregar bordes con resplandor (`glow effects`) y microanimaciones en botones y tarjetas.
3. **Optimización Mobile-First (Clave para la Demo):**
   - Garantizar que toda la pantalla quepa perfectamente en smartphones Android (390px a 430px de ancho) sin scroll horizontal incómodo, para que el tap físico de la tarjeta Tangem se luzca frente al jurado.
4. **Estados y Notificaciones:**
   - Diseñar toasts de confirmación de firma y modales de error explicativos.

---

## ⚡ Tareas de Víctor (Frontend Web3 & Integrations Lead)
* **Rama de trabajo:** `frontend/victor`

### Tareas Prioritarias:
1. **Configuración de Wagmi / Viem:**
   - Instanciar el cliente Web3 conectado a **Avalanche Fuji C-Chain** (Chain ID: `43113`, RPC: `https://api.avax-test.network/ext/bc/C/rpc`).
   - Configurar el conector de wallet (RainbowKit, AppKit o injected) para Core Wallet / MetaMask.
2. **Conexión de Smart Contracts:**
   - Importar el ABI tipado desde `src/contracts/TradeEscrowAbi.ts` y las direcciones desde `src/contracts/addresses.ts`.
   - Implementar hooks de escritura:
     - `useWriteContract` para `createAndFundOrder` (incluyendo previo `approve` del token MockUSDC).
     - `useWriteContract` para `startTransit`.
     - `useWriteContract` para `settleWithTangemTap(orderId, signature)`.
3. **Integración con la UI de Amira:**
   - Recibir los componentes de Amira en `frontend/amira-y-victor` y conectar los estados de carga (`isPending`, `isConfirming`, `isSuccess`) con los loaders y toasts.

---

## ⚙️ Tareas de Dax (Smart Contracts & Protocol Backend Lead)
* **Rama de trabajo:** `main` (o `backend/contracts`)
* **Guía detallada:** Ver [`TASKS-DAX.md`](./TASKS-DAX.md)

### Estado Actual:
- [x] **`TradeEscrow.sol` implementado:**
  - `createAndFundOrder()`: Depósito atómico con `SafeERC20`.
  - `startTransit()`: Control de acceso para transportista.
  - `settleWithTangemTap()`: Verificación EIP-712/ECDSA de la tarjeta Tangem NFC, liquidación al 99.5% y fee del 0.5%.
  - `refundOnTimeout()`: Reembolso por vencimiento de plazo.
  - `openDispute()` y `resolveDispute()`: Arbitraje en frontera.
- [x] **Suite de Tests en Foundry:** 8 de 8 tests pasados (`forge test -vvv`).
- [x] **ABIs exportados a Frontend:** `TradeEscrow.json` y `TradeEscrowAbi.ts` generados.

### Tareas Pendientes:
- [x] **Fondos Verificados en Billetera On-Chain:**
  - `1.25 AVAX` en Fuji C-Chain (`0x4f30B06F8884F8632532A8fdDAd5C8CEc34f71f4`).
  - `40.00 USDC` oficiales de Circle en Fuji (`0x5425890298aed601595a70AB815c96711a31Bc65`).
  - Simulación de `Deploy.s.sol` completada con éxito (gas estimado: 0.00268 AVAX).
- [ ] **Despliegue a Avalanche Fuji:**
  - Ejecutar `forge script script/Deploy.s.sol --rpc-url https://api.avax-test.network/ext/bc/C/rpc --broadcast`.
  - Actualizar `NEXT_PUBLIC_TRADE_ESCROW_ADDRESS` en `src/contracts/addresses.ts` con la dirección oficial desplegada.
- [ ] **Corrida Real de Carga (Checklist 7/7):**
  - Ver detalle completo en [`docs/CORRIDA-REAL-DE-CARGA.md`](./docs/CORRIDA-REAL-DE-CARGA.md).

---

## 🏁 Criterio de Éxito para la Demo
- Tiempo total del flujo de demostración frente al jurado: **menos de 90 segundos**.
- Flujo: Importador crea escrow ➔ Pollar carga saldo ➔ Transportista inicia tránsito ➔ Receptor hace Tap con firma criptográfica en el teléfono ➔ Liquidación instantánea en Avalanche Fuji C-Chain.


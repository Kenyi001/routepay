# 🚚 Corrida Real de Carga — Estado y Validación On-Chain

> **Documento de Auditoría y Estado Técnico de Demostración**
> **Proyecto:** RoutePay Protocol · ETH Bolivia Buildathon 2026
> **Red:** Avalanche Fuji Testnet (Chain ID: `43113`)
> **Fecha de Verificación:** 12 de septiembre de 2026

---

## 👛 Billetera Auditada en Vivo

* **Dirección (C-Chain):** [`0x4f30B06F8884F8632532A8fdDAd5C8CEc34f71f4`](https://testnet.snowtrace.io/address/0x4f30B06F8884F8632532A8fdDAd5C8CEc34f71f4)
* **Saldo AVAX (Gas C-Chain):** **`1.24999 AVAX`** *(Verificado on-chain vía RPC oficial Fuji)*
* **Saldo USDC (Circle Fuji):** **`40.000000 USDC`** *(Contrato oficial: `0x5425890298aed601595a70AB815c96711a31Bc65`)*

---

## 📊 Matriz de Cumplimiento (Checklist Oficial de 7 Puntos)

| # | Hito / Requisito | Estado | Nivel | Evidencia Técnica / Acción Requerida |
|:---:|---|:---:|:---:|---|
| **1** | **Wallet del importador tiene USDC de testnet** | ✅ **CUMPLIDO** | **Crítico** | `balanceOf = 40.00 USDC` de Circle oficial en Fuji verificado. |
| **2** | **Wallet tiene AVAX de testnet para gas** | ✅ **CUMPLIDO** | Normal | `1.25 AVAX` en C-Chain. Deploy requiere solo `0.00268 AVAX` (alcanza para 50+ txs). |
| **3** | **`createAndFundOrder` confirmado on-chain** | ⏳ **Listo para Desplegar** | **Crítico** | Simulación de `Deploy.s.sol` pasó con éxito (0 errores). Falta broadcast a Fuji. |
| **4** | **`startTransit` confirmado on-chain** | ⏳ **Pendiente** | Normal | Se valida una vez fondeada la orden en el contrato deployed. |
| **5** | **Tap Tangem firmado de verdad con MetaMask** | ⏳ **Identificado para Wiring** | **Crítico** | Reemplazar `setTimeout` por llamada real a `personal_sign` con popup en MetaMask. |
| **6** | **Transportista recibió el USDC en su wallet** | ⏳ **Pendiente** | **Crítico** | Verificación de saldo final del chofer tras el tap de liquidación. |
| **7** | **Ensayo cronometrado contra el guion de Ronald** | ⏳ **Pendiente** | Normal | Ensayo del bloque de demo de 90 segundos (`docs/pitch-y-defensa.md`). |

---

## 🔍 Detalle Técnico de lo Verificado y Próximos Pasos

### 1. Fondos y Balances (Completado al 100%)
Se ejecutaron llamadas RPC directas al nodo de Avalanche Fuji (`https://api.avax-test.network/ext/bc/C/rpc`):
```bash
# Verificación de Saldo AVAX (Resultado: 1249999999777796040 wei = 1.25 AVAX)
cast balance 0x4f30B06F8884F8632532A8fdDAd5C8CEc34f71f4 --rpc-url https://api.avax-test.network/ext/bc/C/rpc

# Verificación de Saldo USDC (Resultado: 40000000 = 40.00 USDC)
cast call 0x5425890298aed601595a70AB815c96711a31Bc65 "balanceOf(address)(uint256)" 0x4f30B06F8884F8632532A8fdDAd5C8CEc34f71f4 --rpc-url https://api.avax-test.network/ext/bc/C/rpc
```

### 2. Simulación de Despliegue de Contratos (Completado con Éxito)
Se ejecutó la simulación en EVM del script [`script/Deploy.s.sol`](file:///c:/Users/usuario/Desktop/descargas/Hackatones/skills/routepay/contracts/script/Deploy.s.sol):
* **Compilador:** Solc `0.8.24` con optimizador (200 runs) y `via_ir = true`.
* **Gas estimado:** `2,683,884` gas (`0.00268 AVAX`).
* **Contratos calculados:**
  - `ERC2771Forwarder`: `0x7bA20DCd66D3EA1f8E2f56a25ba8Db58AEE6735e`
  - `TradeEscrow`: `0x8E3ABABC691790aC21F1CFC82ECE0bD9D25b93b8`

### 3. Pasos Inmediatos para Cerrar los Puntos 3, 4, 5 y 6:
1. **Ejecutar Broadcast On-Chain:**
   ```powershell
   cd contracts
   forge script script/Deploy.s.sol --rpc-url https://api.avax-test.network/ext/bc/C/rpc --broadcast
   ```
2. **Actualizar Dirección Oficial en Frontend:**
   Copiar la dirección resultante de `TradeEscrow` a `src/contracts/addresses.ts`.
3. **Conectar Firma Real `personal_sign`:**
   Asegurar que el botón del Tap en el frontend invoque a MetaMask para pedir la firma digital en vivo.
4. **Ejecutar la Corrida End-to-End con 10 USDC:**
   Fondeo real on-chain ➔ Tránsito ➔ Tap ➔ Liquidación verificable en Snowtrace.

# ⚙️ RoutePay — Tareas para Dax (Smart Contracts & Protocol Backend Lead)

> **Rama de trabajo:** `main` (o `backend/contracts`)  
> **Objetivo:** Implementar la lógica completa de `TradeEscrow.sol`, pasar el 100% de los tests en Foundry, desplegar en Avalanche Fuji con Core Wallet y exportar los ABIs a Frontend.

---

## 🚀 Entorno de Trabajo

```bash
cd contracts
forge build
forge test -vvv
```

Fondo disponible para gas: **2.49999 AVAX** en Core Wallet (Red Avalanche Fuji C-Chain).

---

## 📋 Lista de Tareas Prioritarias

### 1. Implementación de Lógica en `contracts/src/TradeEscrow.sol`
- [ ] **`createAndFundOrder(bytes32 orderId, address carrier, uint256 amount, address token)`**:
  - Validar que `amount > 0` y `carrier != address(0)`.
  - Transferir tokens ERC20 del importador al contrato vía `IERC20(token).safeTransferFrom(msg.sender, address(this), amount)`.
  - Guardar la orden con estado `OrderStatus.Funded` y registrar timestamp de expiración.
  - Emitir evento `OrderCreated(orderId, msg.sender, carrier, amount, token)`.
- [ ] **`startTransit(bytes32 orderId)`**:
  - Restringir a `msg.sender == order.carrier`.
  - Validar que el estado sea `OrderStatus.Funded`.
  - Actualizar estado a `OrderStatus.InTransit`.
  - Emitir evento `OrderInTransit(orderId)`.
- [ ] **`settleWithTangemTap(bytes32 orderId, bytes calldata signature)`**:
  - Verificar que el estado sea `OrderStatus.InTransit`.
  - Validar que quien invoca o la firma provenga de la dirección autorizada del almacén receptor (Tangem card pubkey).
  - Calcular comisión del protocolo: `fee = (amount * 50) / 10000` (0.50%).
  - Calcular pago al transportista: `payout = amount - fee`.
  - Transferir `payout` al `carrier` y `fee` al `treasury`.
  - Actualizar estado a `OrderStatus.Settled`.
  - Emitir evento `OrderSettled(orderId, carrier, payout, fee)`.
- [ ] **`refundOnTimeout(bytes32 orderId)`**:
  - Permitir al importador recuperar los fondos si el transportista no inicia tránsito o vence la ventana de entrega.
- [ ] **`resolveDispute(bytes32 orderId, address payoutRecipient)`**:
  - Mecanismo administrado para arbitraje aduanero en caso de retención en frontera.

---

### 2. Suite de Tests en `contracts/test/TradeEscrow.t.sol`
Completar las aserciones de los 6 casos de prueba con Foundry:
- [ ] `test_CreateOrder()`: Verifica creación y almacenamiento del struct.
- [ ] `test_FundOrder()`: Verifica transferencia de balances de MockUSDC.
- [ ] `test_StartTransit()`: Verifica transición de estado y restricción de caller.
- [ ] `test_SettleWithTangemTap()`: Verifica liquidación atómica (99.5% carrier, 0.5% treasury).
- [ ] `test_RevertIf_UnauthorizedSettle()`: Verifica que terceros no puedan liquidar sin firma válida.
- [ ] `test_RefundOnTimeout()`: Verifica recuperación de fondos por vencimiento.

---

### 3. Despliegue en Avalanche Fuji C-Chain
- [ ] Configurar `.env` local con la clave privada de Core Wallet:
  ```env
  AVALANCHE_FUJI_RPC=https://api.avax-test.network/ext/bc/C/rpc
  PRIVATE_KEY=0x... (de Core Wallet)
  ```
- [ ] Ejecutar script de despliegue:
  ```bash
  forge script script/Deploy.s.sol:Deploy --rpc-url $AVALANCHE_FUJI_RPC --broadcast --verify
  ```

---

### 4. Exportar Artefactos a Frontend
- [ ] Copiar el ABI generado en `contracts/out/TradeEscrow.sol/TradeEscrow.json` hacia `frontend/src/contracts/TradeEscrow.json`.
- [ ] Crear archivo `frontend/src/contracts/addresses.ts` con la dirección del contrato desplegado en Fuji.
- [ ] Notificar a Víctor para que conecte los hooks de lectura/escritura en `frontend/victor`.

# 🎨 RoutePay — Tareas para Amira (Frontend UI/UX Lead)

> **Rama de trabajo:** `frontend/amira`  
> **Objetivo:** Pulir la interfaz visual cyber-fintech, modularizar los componentes y dejar la experiencia lista para el pitch en pantalla móvil de Android.

---

## 🚀 Setup Rápido

```bash
git checkout frontend/amira
git pull origin frontend/amira
cd frontend
npm install
npm run dev
```
Abre en tu navegador: `http://localhost:3000`

---

## 📋 Lista de Tareas Prioritarias

### 1. Modularización de Componentes (`frontend/src/components/`)
Actualmente toda la interfaz está en un solo archivo (`src/app/page.tsx`). Tu primera tarea es dividirlo en componentes limpios y reutilizables:

- [ ] **`OrderCreationForm.tsx`** (Vista Importador):
  - Selector de ruta: Arica ➔ Tambo Quemado ➔ Santa Cruz.
  - Inputs: ID de Manifiesto Aduanero (`MIC/DTA`), Monto en USDC, dirección de wallet del transportista.
  - Botón de On-Ramp Pollar: Modal o botón con badge esmeralda *"Cargar fondos con QR BOB (Pollar)"*.
- [ ] **`TransitTimeline.tsx`** (Vista Transportista / Monitor):
  - Stepper con 4 estados: `Creado` ➔ `Custodiado en Smart Contract` ➔ `En Tránsito (Frontera)` ➔ `Entregado`.
  - Tarjeta dorada destacada: *"Fondos asegurados en Avalanche Fuji: $2,487.50 USDC"*.
- [ ] **`TangemTapModal.tsx`** (Vista Aduana / Almacén Receptor):
  - Animación de la tarjeta física Tangem con resplandor holográfico y ondas de pulso NFC concéntricas.
  - Desglose de liquidación instantánea:
    - 🚚 Transportista (99.5%): `$2,487.50 USDC`
    - ⚡ Tarifa Protocolo RoutePay (0.5%): `$12.50 USDC`
  - Feedback visual de éxito con confeti o pulso verde neón al completar el tap.

---

### 2. Pulido Visual & Cyber-Fintech Aesthetics
- [ ] **Paleta de Colores Oficial:**
  - Fondo: Cyber Dark `#0B0F19` y Glassmorphism `#131B2E`/`#1E293B`.
  - Acentos de Tracks:
    - 🔺 **Avalanche Red:** `#E84142`
    - 🟢 **Pollar Emerald:** `#10B981`
    - 💳 **Tangem Holographic Steel:** `#94A3B8` / Gradientes plateados
    - ⚡ **RoutePay Gold:** `#F59E0B`
- [ ] **Micro-interacciones:**
  - Animaciones de hover suaves en los botones principales.
  - Bordes con degradados brillantes (`glowing borders`).

---

### 3. Mobile-First (Clave para el Pitch)
- [ ] Asegurarse de que toda la app se vea perfecta en celulares (390px a 430px de ancho) sin scroll horizontal.
- [ ] En la presentación presencial frente al jurado, el transportista o receptor usará un teléfono Android para apoyar la tarjeta física Tangem. La tarjeta de tap NFC debe caber completa en la pantalla del celular sin necesidad de hacer scroll.

---

### 4. Notificaciones & Estados Vacíos
- [ ] **Toasts / Alertas:**
  - Toast de éxito: *"Entrega verificada por firma NFC. Fondos liberados en Avalanche Fuji."*
  - Toast de error: *"Lectura NFC interrumpida. Mantén la tarjeta Tangem apoyada en el reverso del teléfono."*
- [ ] **Tooltip de Valor:**
  - Explicación breve: *"¿Por qué Tangem NFC? Evita el fraude en factoraje al bloquear el pago hasta la recepción física confirmada por hardware."*

---

## 🔄 Flujo de Entrega (Git)

Cuando termines una tarea o al final de tu sesión:

```bash
git add .
git commit -m "feat(ui): [descripción breve de lo que hiciste]"
git push origin frontend/amira
```

Una vez que tengas tus componentes listos, avisale a **Víctor** para que hagamos el merge hacia `frontend/amira-y-victor` y conectemos los smart contracts.

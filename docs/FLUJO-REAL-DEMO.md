# Flujo real de la demo — qué es de verdad y qué es narrativa

> Escrito porque hubo confusión sobre "cómo llega la plata del importador al
> transportista" — acá está el mapa completo, paso por paso, de qué pasa on-chain de
> verdad vs qué se cuenta en el pitch como contexto.

## La pregunta que había que responder

*"El importador paga en BS o USDT/USDC, ¿y cómo le llega el monto al transportista? ¿Qué
tan bien se representa eso en la demo? ¿Funciona con MetaMask?"*

## Respuesta corta

**En la demo en vivo, lo que se mueve de verdad on-chain es USDC de testnet en
Avalanche Fuji — no bolivianos.** El USDC ya está confirmado como el contrato real de
Circle en Fuji (no un mock inventado). MetaMask sí funciona — de hecho, encontramos y
arreglamos un bug real que hubiera hecho fallar el paso más importante de la demo si
no se corregía (detalle abajo).

## El flujo completo, paso por paso

1. **Importador conecta MetaMask** (red Avalanche Fuji, chainId 43113) con balance de
   USDC de testnet (se consigue con faucet — ver abajo) y un poco de AVAX para el gas.
2. **Importador crea la orden** (`createAndFundOrder`): MetaMask pide confirmar la
   transacción, se descuenta el USDC de su wallet y queda **custodiado en el contrato**
   `TradeEscrow.sol`. Esto es 100% real — sale de un balance de verdad, entra a un
   contrato de verdad, verificable en Snowtrace al toque.
3. **Transportista/oráculo confirma el tránsito** (`startTransit`): cambia el estado
   on-chain a "en tránsito" — otra transacción real.
4. **Confirmación de entrega (el "tap Tangem"):** acá es donde había un bug real que
   arreglamos hoy — el botón de "confirmar entrega" en la versión de escritorio
   **no estaba llamando al contrato en absoluto**, solo mostraba una animación de
   3 segundos como si hubiera funcionado. Ahora, al tocar el botón, **MetaMask pide
   firmar un mensaje** (esto reemplaza el tap físico de la tarjeta Tangem — en un
   celular Android con NFC real, la tarjeta firma el mismo mensaje; en notebook con
   MetaMask, la wallet firma en su lugar). Esa firma se manda al contrato, que la
   verifica matemáticamente y **libera el pago automáticamente** a la wallet del
   transportista. Ahí es donde efectivamente "el monto le llega al transportista" — es
   el contrato el que lo transfiere, no un paso manual.
5. **El transportista no necesita hacer nada para "recibir"** — el contrato le
   transfiere el USDC directo a su dirección en el mismo paso 4. Si en la demo alguien
   pregunta "¿y cómo el transportista ve la plata?", la respuesta es: abrí su wallet o
   Snowtrace y mostrá el balance actualizado en tiempo real.

## Dónde entra BS/Pollar (y dónde NO)

Pollar (el onramp de bolivianos a USDC) **no está conectado a esta transacción real**
en la demo — corre en una red distinta (Stellar) sin puente confirmado a Avalanche. En
el pitch, esto se cuenta como: *"así es como
en el mundo real el importador pagaría en bolivianos sin tocar cripto — hoy en la demo
mostramos el tramo on-chain con USDC de testnet, que es exactamente lo mismo que
recibiría el contrato si viniera de un onramp como Pollar."* Es honesto y sigue siendo
un buen argumento — no hace falta fingir que están conectados hoy.

## Qué hace falta para que esto funcione en la demo real

1. **Contrato desplegado en Fuji** (pendiente — lo corre Dax, necesita su private key).
2. **USDC de testnet en la wallet del importador** — conseguir con un faucet de USDC de
   Circle en Fuji (buscar "Circle faucet" o el faucet oficial de Avalanche que a veces
   incluye USDC de prueba). Sin esto, la demo no tiene con qué fondear la orden.
3. **AVAX de testnet para el gas** — ya tienen 2.49999 AVAX cargados en Core Wallet, así
   que para MetaMask conviene usar la misma wallet o transferir un poco a la que se use
   con MetaMask.
4. **MetaMask configurado con la red Avalanche Fuji** (chainId 43113, RPC
   `https://api.avax-test.network/ext/bc/C/rpc`) — si nunca la agregaron, Avalanche
   tiene un botón de "Add to MetaMask" en su Builder Hub.
5. **Ensayar el flujo completo al menos una vez de punta a punta** antes del día del
   pitch, para no descubrir un problema en vivo.

## El bug que se arregló

Antes de este fix, `settleWithTangemTap` (el paso 4) fallaba silenciosamente: si la
transacción real revertía en cadena, la app mostraba un mensaje de éxito con un hash
inventado en vez de un error. Ahora, si algo falla de verdad, la demo lo va a mostrar
como error — mejor descubrirlo hoy en el ensayo que en vivo mañana.

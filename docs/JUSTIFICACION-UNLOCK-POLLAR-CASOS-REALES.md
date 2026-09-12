# Por qué Unlock Protocol y Pollar — casos reales (para el pitch)

> Investigación cruzada (agy + cursor-agent, aunque cursor-agent no tuvo acceso a red
> en esta corrida) + verificación directa. Mismo criterio que el doc de Avalanche:
> cada dato con al menos 1 fuente primaria antes de entrar acá.

## Unlock Protocol — casos reales verificados

### 1. Forbes — membresía "Legacy Pass"
Forbes lanzó en 2024 su **Legacy Pass**, una membresía NFT (comunidad token-gated,
acceso a eventos exclusivos y al "Forbes Inner Circle"), en partnership con OKX
Wallet, con oferta total de 1,917 NFTs.

Fuentes: [Cointelegraph](https://cointelegraph.com/news/forbes-nft-gated-member-community-okx-wallet) ·
[The Crypto Times](https://www.cryptotimes.io/2024/08/29/forbes-and-okx-wallet-launch-exclusive-nft-membership/)

### 2. Guild.xyz — integración nativa para comunidades
Guild.xyz (orquestador de roles/gobernanza para Discord y Telegram) tiene **soporte
nativo** para llaves de Unlock Protocol: si una wallet tiene la llave válida, Guild la
deja pasar automáticamente a canales/roles gateados — sin que el bot tenga que auditar
nada manualmente.

Fuente: [Unlock Blog — Guild.xyz launch](https://unlock-protocol.com/blog/guildxyz-launch)

### 3. Eventos reales del ecosistema Ethereum
Unlock se usa para vender entradas NFT y hacer check-in criptográfico en eventos reales
de la comunidad: **DappCon, EthCC, ETHTaipei, ETHWarsaw**, entre otros — resuelve
reventa no autorizada con llaves intransferibles.

Fuente: [Unlock Guides — ticketing](https://unlock-protocol.com/guides/how-to-sell-nft-tickets-for-an-event/)

### Por qué esto aplica a certificar transportistas (no solo "es una NFT")

La clave del argumento no es "usamos NFTs", es **control de acceso con estado
temporal**, algo que un NFT genérico (ERC-721) no resuelve nativamente:

- **Vencimiento nativo (`expirationTimestamp`):** las certificaciones de un
  transportista (seguro de carga, licencia, revisión técnica) vencen solas — la llave
  expira on-chain sin que nadie gaste una transacción para revocarla.
- **Intransferibilidad:** un transportista verificado no puede vender ni transferir su
  credencial a un tercero no verificado.
- **Separación de responsabilidades:** el escrow no audita papeles — solo consulta
  `lock.getHasValidKey(carrier)`. La entidad certificadora administra el Lock aparte.

## Pollar — honestidad primero

A diferencia de Unlock, **no encontramos casos de producción con nombres de clientes
reales o métricas públicas** para Pollar — es una infraestructura joven (SDK, no una
marca con historial largo). Lo que sí está verificado:

- Es un **orquestador de pagos/rampas para LatAm** (`@pollar/core`, `@pollar/react`),
  con métodos locales reales: QR bancario en Bolivia, Pix en Brasil, transferencia
  bancaria en Argentina/México — no es solo "otro onramp cripto genérico".
- Corre sobre **Stellar** (con USDC nativo vía Circle CCTP también en Solana) — por eso
  se desacopló del escrow central en Avalanche, en vez de forzar un puente que no existe.
- El caso de uso que sí está documentado por ellos mismos es de **onboarding rápido
  para builders** (login social + wallet embebida + USDC ganando yield en Blend, todo
  dentro de la misma app, sin que el usuario vea una seed phrase) — la propuesta de
  valor real es "integralo en minutos", no "lo usan bancos".

**Para el pitch:** no digamos "Pollar es usado por X empresa real" porque no hay
evidencia pública de eso. El argumento honesto y todavía fuerte es: *"elegimos Pollar
porque resuelve el problema real de rampas locales en Bolivia (QR bancario en BOB) sin
que el usuario final necesite entender qué es una wallet — el mismo problema que
2 estudios de UX de blockchain en LatAm identifican como la barrera #1 de adopción."*
No hace falta un caso de cliente famoso para que el argumento tenga sentido técnico.

## Nota operativa: Pollar queda fuera del flujo on-chain de la demo

Pollar corre en Stellar, `TradeEscrow.sol` corre en Avalanche — no hay puente confirmado
entre ambos. En la demo en vivo, la parte de Pollar se muestra como **flujo separado** (cobro
real en su propia red, para cumplir el bounty), no como el dinero que efectivamente
entra al contrato de escrow.

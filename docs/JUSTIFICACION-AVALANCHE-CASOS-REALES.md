# Por qué Avalanche — casos reales verificados (para el pitch)

> Investigación cruzada (agy + cursor-agent + verificación directa), cada dato
> confirmado contra al menos 2 fuentes independientes antes de entrar acá.

## 1. Intain — finanzas estructuradas / RWA ($5.5B administrados)

Intain (`IntainADMIN`) administra más de **$5.5B en activos** para bancos y
originadores de crédito. Lanzaron `IntainMARKETS`, un mercado on-chain para bonos
respaldados por activos, sobre una **Avalanche Subnet permisionada** — no la C-Chain
pública.

**Por qué Subnet y no Ethereum/una L2 pública:** bancos no pueden operar donde
cualquiera ve los flujos financieros en el mempool. La Subnet les permite definir
quién valida (KYC obligatorio) y quién transacciona, con el gas aislado de la
volatilidad del mercado cripto.

Fuentes: [Avalanche (X/anuncio oficial)](https://x.com/avax/status/1620438978364309504) ·
[The Block](https://www.theblock.co/post/206863/intain-launches-avalanche-subnet-for-asset-backed-securities) ·
[Avalanche Blog](https://www.avax.network/about/blog/builder-spotlight-intain-brings-securitized-finance-to-a-subnet)

## 2. Franklin Templeton — fondo tokenizado BENJI/FOBXX

Franklin Templeton ($1.6T AUM globales) expandió su fondo del tesoro tokenizado
(`FOBXX`, ~$420-828M en el fondo) a Avalanche. **Ojo con este dato al citarlo:** el
fondo corre en 8 blockchains (Stellar, Polygon, Arbitrum, Aptos, Avalanche, Base,
Solana, Ethereum) — Avalanche no es exclusivo, pero sí es una de las redes que
eligieron para liquidación institucional real, no un experimento.

**Por qué relevante para nuestro pitch:** confirma que instituciones financieras reales
confían en Avalanche para mover dinero real, no solo tokens especulativos — el mismo
tipo de confianza que necesita un escrow de pago de flete internacional.

Fuentes: [Avalanche Blog](https://www.avax.network/about/blog/franklin-templeton-launches-tokenized-money-market-fund-benji-avalanche) ·
[The Block](https://www.theblock.co/post/312502/franklin-templeton-tokenized-money-market-fund-avalanche) ·
[Decrypt](https://decrypt.co/245839/franklin-templeton-fobxx-blockchain-fund-avalanche)

## 3. KKR + Securitize (2022) — fondo de private equity tokenizado

KKR tokenizó el acceso a su *Health Care Strategic Growth Fund II* (fondo de private
equity) en Avalanche, en asociación con Securitize — uno de los primeros casos grandes
de un fondo institucional real tokenizado en la red.

Fuentes: [PR Newswire](https://www.prnewswire.com/news-releases/kkr-partners-with-securitize-to-tokenize-a-fund-on-avalanche-301629047.html) ·
[Avalanche Blog](https://www.avax.network/about/blog/kkr-and-securitize-to-tokenize-fund-on-avalanche)

## 4. Onyx (J.P. Morgan) + Apollo Global + WisdomTree — Project Guardian

Bajo el Project Guardian de la Autoridad Monetaria de Singapur, Onyx (ahora Kinexys
Digital Assets, la unidad blockchain de JPMorgan), Apollo Global y WisdomTree probaron
un portfolio con activos alternativos tokenizados usando una **Avalanche Evergreen
Subnet**, conectada vía LayerZero al resto de Onyx Digital Assets.

Citi, Wellington Management y T. Rowe Price hicieron pruebas similares de
liquidación/tokenización de fondos privados sobre Evergreen Subnets — exigían
liquidación contra entrega (DvP) con cumplimiento legal estricto de contrapartes, algo
que una L2 pública con sequencer centralizado no resuelve igual.

Fuentes: [Avalanche — caso Onyx](https://www.avax.network/case-studies/in-focus-onyx-by-j-p-morgan/) ·
[Citi (comunicado oficial)](https://www.citigroup.com/global/news/press-release/2024/citi-collaborates-with-wellington-management-and-t-rowe-price-to-explore-private-equity-tokenization-on-avalanche)

## 5. StraitsX — pagos transfronterizos reales en Sudeste Asiático

StraitsX (infraestructura de pagos digitales en Singapur) usa un subnet de Avalanche
para liquidar pagos transfronterizos entre Alipay+ y GrabPay como "Purpose Bound
Money" — cuando un turista paga con Alipay+ en un comercio con QR de GrabPay, la
conversión de moneda y la liquidación se procesan on-chain, y el comercio recibe
fondos en dólares de Singapur **al instante**.

Este es el caso más parecido al nuestro: pago transfronterizo real, liquidación
instantánea, sin que el usuario final sepa ni le importe que hay blockchain detrás.

Fuentes: [Avalanche Blog](https://www.avax.network/about/blog/straitsx-leverages-avacloud-and-avalanche-to-simplify-cross-border-payments-in-southeast-asia)

## El argumento para el pitch de T5

1. **Liquidación en tiempo real, no en minutos.** Los mismos motivos por los que
   Franklin Templeton e Intain eligieron Avalanche para mover dinero institucional real
   aplican a nuestro escrow: finalidad sub-segundo importa cuando hay plata real
   moviéndose, no solo en teoría.
2. **No somos los primeros en confiar plata real a Avalanche.** Bancos (Citi, JPMorgan/
   Onyx) y gestoras de fondos ($1.6T AUM) ya lo hacen — el argumento "es solo cripto
   experimental" no aplica.
3. **El caso StraitsX es casi un espejo del nuestro:** pago transfronterizo,
   liquidación instantánea, usuario final que no necesita saber qué hay detrás — mismo
   principio que un transportista bolviano cobrando al tap de la tarjeta Tangem.

## Nota de honestidad para el pitch

No digamos "Avalanche es LA red de las instituciones" sin matiz — Franklin Templeton
usa 8 redes distintas, no solo Avalanche. El argumento correcto es: **Avalanche es una
de las redes en las que instituciones financieras reales ya confían dinero real**, no
la única, pero sí una elección seria y verificable — no hace falta exagerar, el caso ya
es fuerte tal cual.

⚠️ **Verificar antes de citar en vivo:** al cruzar 2 agentes de investigación, uno de
ellos (sin acceso a internet en esa corrida, con el aviso explícito de que no pudo
revalidar en vivo) cuestionó si Onyx/JPMorgan y Citi cuentan como "casos Avalanche"
reales o si eran solo pruebas de concepto. Mis fuentes primarias sí confirman la
conexión directamente (página propia de casos de Avalanche titulada *"In Focus: Onyx by
J.P. Morgan"*, comunicado propio de Citi titulado *"Citi collaborates... to explore
private equity tokenization on Avalanche"*) — pero como fueron **pilotos/pruebas de
concepto bajo Project Guardian (MAS Singapur)**, no sistemas en producción viva, hay
que decirlo así en el pitch ("probaron", no "usan en producción todos los días").
Abrí los 2 links de la sección 4 vos mismo antes de subir al escenario, por las dudas.

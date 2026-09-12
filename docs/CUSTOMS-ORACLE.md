# Customs oracle (MIC/DTA) — research and design

## Why this exists

`startTransit` needs to be confirmed by *something* when the carrier crosses the
Tambo Quemado border. The naive assumption — "call a government API to check the
manifest" — doesn't hold up. This doc records what was actually verified before
building the mock.

## What was verified

Bolivia's customs system (**SUMA**, Aduana Nacional de Bolivia) and Chile's (**SITRAD**,
Servicio Nacional de Aduanas) were checked for a public way to query MIC/DTA
(Manifiesto Internacional de Carga / Declaración de Tránsito Aduanero) status:

- **No public, unauthenticated REST/GraphQL API exists in either country.** Access is
  either an authenticated human portal (SUMA, with CAPTCHA) or operator-credentialed
  systems (SITRAD) for registered despachantes/transportistas.
- The real cross-border data exchange under the ATIT (Acuerdo de Alcance Parcial sobre
  Transporte Internacional Terrestre, ALADI) is **B2G/EDI**, not open data.
- The MIC/DTA itself is issued by the authorized transport company and validated by
  customs at both ends: Chungará (Chile, exit) and Tambo Quemado (Bolivia, entry) —
  each stamping their own system (SITRAD / SUMA) independently, no shared live feed.

Sources: [ALADI — ATIT](https://www.aladi.org), [Aduana Nacional de Bolivia](https://www.aduana.gob.bo),
[Servicio Nacional de Aduanas de Chile](https://www.aduana.cl).

## Design decision

Since there's no real API to integrate against during the buildathon, `TradeEscrow.sol`
models this as a **`customsOracle` role** — a designated address (separate from the
contract owner) authorized to call `startTransit`, standing in for what would, in
production, be a backend relay holding real despachante/B2G credentials.

For the demo, `contracts/script/MockCustomsRelay.s.sol` plays that relay's role: it
looks up the order's `cargoManifestHash` in `contracts/script/mock-manifests.json` (a
fixture pretending to be the customs lookup) and, if marked `"cleared"`, calls
`startTransit` as the `customsOracle` account.

**Honest framing for the pitch:** this is not "we integrated with Bolivian/Chilean
customs" — it's "customs has no public API to integrate with (verified), so we modeled
the trust boundary as a role a real authenticated relay would occupy, and the demo
proves the on-chain side of that handoff works."

## Next steps if this becomes real

- Replace `MockCustomsRelay.s.sol` with a backend service holding actual despachante
  credentials for SUMA/SITRAD, polling or receiving a webhook, then calling
  `startTransit` the same way the mock script does.
- The `customsOracle` address would then be that service's hot wallet, ideally behind a
  multisig or a rate-limited relayer, not a single EOA.

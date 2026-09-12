# RoutePay Protocol

Smart Trade & Logistics Escrow with Tangem NFC — freight payment custody for the
Arica–Tambo Quemado–Santa Cruz/Cochabamba corridor.

Built for **ETH Bolivia Buildathon 2026** (Cochabamba, 11–13 sep 2026).

**Live demo:** https://frontend-mu-bay-zvc6ih2zcs.vercel.app (Avalanche Fuji Testnet)

## What is this

Heavy-freight carriers get paid 30–60 days after delivery and face fake-payment scams;
importers pay 8–12% in bank fees and wait weeks for international transfers to clear.
`TradeEscrow.sol` custodies the freight payment in stablecoin and releases it instantly
when the destination warehouse taps a physical **Tangem NFC card** confirming delivery —
no bank, no intermediary, no waiting.

The protocol takes a 0.5% settlement fee on `settleWithTangemTap`, deducted automatically
on release.

## How it works

1. **Importer funds the order** — deposits USDC into `TradeEscrow`, gaslessly (see below).
2. **Carrier starts transit** — confirmed by the carrier or an authorized customs relay.
3. **Delivery tap releases payment** — the receiver's Tangem card signs an EIP-712
   message; the contract verifies it and pays the carrier instantly.
4. **Disputes** have a designated-arbiter path if the importer never confirms delivery.

Full sequence diagram and data-flow: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md),
[`docs/DIAGRAMA_FLUJO_DATOS.md`](docs/DIAGRAMA_FLUJO_DATOS.md).

## Stack

- **Contracts:** Solidity 0.8.24 + Foundry, deployed on **Avalanche Fuji Testnet**
- **Gasless:** ERC-2771 meta-transactions + ERC-2612 permit — the importer signs
  off-chain, a relayer pays gas, and the contract still resolves the real signer.
  See [`docs/GASLESS-RELAYER.md`](docs/GASLESS-RELAYER.md).
- **Customs confirmation:** a `customsOracle` role stands in for an authenticated
  MIC/DTA relay — Bolivia and Chile expose no public API for this, verified before
  building around it. See [`docs/CUSTOMS-ORACLE.md`](docs/CUSTOMS-ORACLE.md).
- **Frontend:** Next.js + viem, bilingual (EN default / ES toggle)
- **Hardware:** Tangem NFC card (EAL6+ secure chip, EIP-712 signatures) — falls back to
  a MetaMask signature on desktop, not a fake animation. See
  [`docs/FLUJO-REAL-DEMO.md`](docs/FLUJO-REAL-DEMO.md) for exactly what's real vs.
  narrative in the live demo.

## Why Avalanche

Sub-second finality matters when the pitch is "payment releases the instant the card
taps" — and we're not the first to trust real money to this network: Franklin
Templeton, KKR, and Onyx/JPMorgan have all run real asset settlement pilots on
Avalanche. Full research with sources: [`docs/JUSTIFICACION-AVALANCHE-CASOS-REALES.md`](docs/JUSTIFICACION-AVALANCHE-CASOS-REALES.md).

## Running locally

```bash
# Contracts
cd contracts
forge build
forge test
forge script script/Deploy.s.sol --rpc-url fuji --broadcast --verify

# Frontend
cd frontend
npm install
npm run dev
```

## Deployed contracts (Avalanche Fuji)

| Contract | Address |
|---|---|
| `TradeEscrow` | [`0xbA4164F1829b8E1eEf0F78b6AEe517D8fdaC34Ee`](https://testnet.snowtrace.io/address/0xbA4164F1829b8E1eEf0F78b6AEe517D8fdaC34Ee) |
| `ERC2771Forwarder` | _pending — update once confirmed_ |
| USDC (Circle, testnet) | `0x5425890298aed601595a70AB815c96711a31Bc65` |

## Tracks

- **Avalanche** — `TradeEscrow` deployed and running on Fuji Testnet (see live demo above).
- **Pollar** — a real payment flow in bolivianos, run as a **parallel integration**, not
  wired into the escrow transaction (Pollar runs on Stellar; the escrow runs on
  Avalanche — no confirmed bridge between them). See
  [`docs/JUSTIFICACION-UNLOCK-POLLAR-CASOS-REALES.md`](docs/JUSTIFICACION-UNLOCK-POLLAR-CASOS-REALES.md)
  for why, honestly.
- **Unlock Protocol** — planned for the week after the event (its own submission
  deadline, 18-sep, falls after the buildathon closes): a `Lock` NFT certifying
  verified carriers, the same access-with-expiration pattern used by Forbes' Legacy
  Pass and Guild.xyz. Not built yet — not claimed as live in the demo.

## Team

- **Dax** — smart contracts & backend
- **Victor** — frontend & web3
- **Ronald** — business & pitch
- **Ariane** — design & QA, backend contributor
- **Amira** — frontend

## Status

Contract fully implemented (createAndFundOrder, startTransit, settleWithTangemTap,
refundOnTimeout, openDispute/resolveDispute), covered by 21 Foundry tests. Frontend
live on Vercel. Open items: real testnet USDC/AVAX funding for the demo wallet, and
wiring the deployed contract addresses into the frontend's environment variables.

## License

MIT

---

Team planning, research, and meeting notes live in the private
[`cocha-blockchain`](https://github.com/Kenyi001/cocha-blockchain) repo. This repo is the
product code and its public-facing documentation only.

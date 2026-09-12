# RoutePay Protocol

Smart Trade & Logistics Escrow with Tangem NFC — freight payment custody for the
Arica–Tambo Quemado–Santa Cruz/Cochabamba corridor.

Built for **ETH Bolivia Buildathon 2026** (Cochabamba, 11–13 sep 2026).

## What is this

Heavy-freight carriers get paid weeks after delivery and face fake-payment scams;
importers pay 8–12% in bank fees and wait on slow international transfers.
`TradeEscrow.sol` custodies the freight payment in stablecoin and releases it instantly
when the destination warehouse taps a physical **Tangem NFC card** confirming delivery.

The protocol takes a 0.5–1% settlement fee on `settleWithTangemTap`.

## Stack

- **Contracts:** Solidity 0.8.24 + Foundry, deployed on **Avalanche Fuji Testnet**
- **Onramp:** Pollar (BOB → USDC)
- **Frontend:** Next.js + wagmi/viem
- **Hardware:** Tangem NFC card (EAL6+ secure chip, EIP-712 signatures)

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full flow and design notes.

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

## Deployed contract

`TradeEscrow.sol` on Avalanche Fuji: _not deployed yet_.

## Tracks

- **Avalanche** — contract deployed and verified on Fuji Testnet
- **Pollar** — BOB → USDC onramp integration
- Unlock Protocol integration planned post-event (its submission deadline is 18-sep,
  after the buildathon closes)

## Team

- **Dax** — smart contracts & backend
- **Victor** — frontend & web3
- **Ronald** — business & pitch
- **Ariane** — design & QA
- **Amira** — frontend

## Status

In active development for the buildathon (closes 13-sep-2026). Contract is currently a
stub with TODOs — see [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md#known-risks) for open
design gaps.

## License

MIT

---

Team planning, research, and meeting notes live in the private
[`cocha-blockchain`](https://github.com/Kenyi001/cocha-blockchain) repo. This repo is the
product code only.

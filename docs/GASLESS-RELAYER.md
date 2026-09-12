# Gasless flow (ERC-2771 + ERC-2612)

## Why

The importer and carrier are heavy-freight logistics people in Bolivia, not crypto
users — they shouldn't need to hold AVAX just to create an order. Per `SPEC.md`, the
flow is: importer signs off-chain, a relayer submits on-chain and pays gas.

## How it works

Two independent EIP-712 signatures from the importer's wallet, zero on-chain
transactions from the importer:

1. **ERC-2612 permit** on the stablecoin (`MockUSDC.sol`, or real USDC on mainnet):
   the importer signs a `Permit(owner, spender, value, nonce, deadline)` message
   granting `TradeEscrow` an allowance — no separate `approve()` transaction needed.
2. **ERC-2771 forward request**: the importer signs a
   `ForwardRequest(from, to, value, gas, nonce, deadline, data)` message wrapping the
   actual `createAndFundOrder(...)` call.

A relayer (anyone holding gas — for the demo, a hot wallet the team controls) then
submits both signatures on-chain in one bundle:

```solidity
usdc.permit(importer, address(tradeEscrow), amount, deadline, v, r, s);
forwarder.execute(forwardRequest);
```

`TradeEscrow` inherits OpenZeppelin's `ERC2771Context`, so inside `createAndFundOrder`,
`_msgSender()` resolves to the **real importer** (decoded from the forwarded calldata),
not the relayer that technically sent the transaction. The order is created with the
correct `importer`, and tokens are pulled from the importer's balance — the relayer
never touches the money, only pays gas.

See `test_GaslessOrderViaForwarderAndPermit` in
`contracts/test/TradeEscrow.t.sol` for a full worked example, and
`contracts/script/Deploy.s.sol`, which deploys an `ERC2771Forwarder` alongside
`TradeEscrow`.

## What's still a stub for the demo

- The **relayer itself** (the service that watches for signed requests from the
  frontend and submits them) is not built yet — this doc covers the on-chain half.
  For the buildathon demo, submitting both calls from a single backend script/wallet
  is enough; a production relayer would add replay protection at the queue level,
  gas price management, and probably batch multiple users' requests via
  `forwarder.executeBatch(...)`.
- No third-party paymaster (ZeroDev/Biconomy) is integrated — the team's own wallet
  acts as the relayer for the demo, which is honest to say in the pitch.

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @notice Freight payment escrow released by a Tangem NFC signature on delivery.
/// See 02-Arquitectura/SPEC.md in the cocha-blockchain planning repo for the full spec.
contract TradeEscrow is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    enum EscrowStatus {
        Created,
        Funded,
        InTransit,
        Delivered,
        Refunded,
        Disputed
    }

    struct EscrowOrder {
        uint256 orderId;
        address importer;
        address carrier;
        address token;
        uint256 amount;
        bytes32 cargoManifestHash;
        uint256 deadline;
        EscrowStatus status;
        uint256 createdAt;
    }

    bytes32 private constant SETTLE_TYPEHASH = keccak256("SettleWithTangemTap(uint256 orderId,uint256 chainId)");

    mapping(uint256 => EscrowOrder) public orders;
    uint256 public nextOrderId;

    event OrderFunded(uint256 indexed orderId, address indexed importer, address indexed carrier, uint256 amount);
    event OrderInTransit(uint256 indexed orderId);
    event OrderSettled(uint256 indexed orderId, address indexed carrier, uint256 amount);
    event OrderRefunded(uint256 indexed orderId, uint256 amount);

    constructor() Ownable(msg.sender) {}

    /// @dev TODO(Dax): safeTransferFrom + registrar orden en Funded. Ver SPEC.md 1.3.1.
    function createAndFundOrder(
        address carrier,
        address token,
        uint256 amount,
        bytes32 cargoManifestHash,
        uint256 durationSeconds
    ) external nonReentrant returns (uint256 orderId) {
        revert("TODO: not implemented");
    }

    /// @dev TODO(Dax): transición a InTransit. Ver SPEC.md 1.3.2.
    function startTransit(uint256 orderId) external {
        revert("TODO: not implemented");
    }

    /// @dev TODO(Dax): verificar firma EIP-712 de la tarjeta Tangem y liquidar al carrier.
    /// Ver SPEC.md 1.3.3 — función estrella de la hackathon.
    function settleWithTangemTap(uint256 orderId, bytes calldata signature) external nonReentrant {
        revert("TODO: not implemented");
    }

    /// @dev TODO(Dax): reembolso íntegro al importador si venció el deadline. Ver SPEC.md 1.3.4.
    function refundOnTimeout(uint256 orderId) external nonReentrant {
        revert("TODO: not implemented");
    }

    /// @dev TODO(Dax): hueco de diseño sin resolver (ver SPEC.md) — falta definir quién
    /// puede abrir una disputa y con qué autoridad se resuelve.
    function openDispute(uint256 orderId) external {
        revert("TODO: not implemented");
    }

    /// @dev TODO(Dax): ver nota de openDispute — falta el árbitro/autoridad de resolución.
    function resolveDispute(uint256 orderId, bool refundImporter) external onlyOwner {
        revert("TODO: not implemented");
    }
}

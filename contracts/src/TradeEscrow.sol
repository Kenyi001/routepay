// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC2771Context} from "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import {Context} from "@openzeppelin/contracts/utils/Context.sol";

/// @title RoutePay TradeEscrow
/// @notice Cross-border freight payment escrow secured by Tangem NFC cryptographic proof of physical delivery.
/// @dev Designed for Avalanche Fuji C-Chain with Pollar on-ramp and Tangem EIP-712 tap release.
/// ERC-2771 meta-tx support lets a relayer submit `createAndFundOrder` on the importer's
/// behalf (paying gas) while `_msgSender()` still resolves to the real importer — see
/// docs/GASLESS-RELAYER.md for the full flow with ERC-2612 permit.
contract TradeEscrow is ReentrancyGuard, Ownable, ERC2771Context {
    using SafeERC20 for IERC20;

    enum EscrowStatus {
        Created,        // 0: Order created
        Funded,         // 1: Escrow funded by importer
        InTransit,      // 2: Cargo dispatched from port/hub
        Delivered,      // 3: Physical delivery verified by Tangem tap; funds settled
        Refunded,       // 4: Delivery timeout expired; funds refunded to importer
        Disputed        // 5: Order under customs/arbitration dispute
    }

    struct EscrowOrder {
        uint256 orderId;
        address importer;           // Payer / cargo buyer (Tangem card owner)
        address carrier;            // Heavy freight logistics operator
        address token;              // Escrow stablecoin (e.g. USDC, USDT)
        uint256 amount;             // Total escrowed amount in token atomic units
        bytes32 cargoManifestHash;  // Hash of MIC/DTA international customs manifest
        uint256 deadline;           // Unix timestamp limit for delivery
        EscrowStatus status;        // Current lifecycle state
        uint256 createdAt;          // Timestamp when order was funded
    }

    bytes32 public constant SETTLE_TYPEHASH = keccak256("SettleWithTangemTap(uint256 orderId,uint256 chainId)");
    uint256 public constant BPS_DENOMINATOR = 10000;

    // Configurable protocol fee in basis points (50 bps = 0.50%)
    uint256 public feeBps = 50;
    address public treasury;

    /// @notice Address authorized to confirm customs transit on behalf of an authenticated
    /// MIC/DTA relay. Bolivia (SUMA) and Chile (SITRAD) expose no public, unauthenticated
    /// API for this — the real integration is B2G/EDI with despachante credentials, so this
    /// role stands in for that authenticated relay until one is wired up.
    address public customsOracle;

    mapping(uint256 => EscrowOrder) public orders;
    uint256 public nextOrderId;

    event OrderFunded(uint256 indexed orderId, address indexed importer, address indexed carrier, uint256 amount);
    event OrderInTransit(uint256 indexed orderId);
    event OrderSettled(uint256 indexed orderId, address indexed carrier, uint256 payout, uint256 fee);
    event OrderRefunded(uint256 indexed orderId, uint256 amount);
    event OrderDisputed(uint256 indexed orderId, address indexed initiatedBy);
    event DisputeResolved(uint256 indexed orderId, bool refundedImporter, uint256 amount);
    event FeeBpsUpdated(uint256 oldFeeBps, uint256 newFeeBps);
    event TreasuryUpdated(address oldTreasury, address newTreasury);
    event CustomsOracleUpdated(address oldOracle, address newOracle);

    error InvalidAddress();
    error InvalidAmount();
    error InvalidDuration();
    error InvalidStatus(EscrowStatus currentStatus, EscrowStatus expectedStatus);
    error Unauthorized();
    error DeadlineNotPassed(uint256 currentTimestamp, uint256 deadline);
    error InvalidSignature();
    error FeeTooHigh();

    constructor(address trustedForwarder) Ownable(msg.sender) ERC2771Context(trustedForwarder) {
        treasury = msg.sender;
        nextOrderId = 1;
    }

    /// @notice Creates and funds an escrow order in a single atomic transaction.
    /// @param carrier The address of the carrier who will receive freight payout.
    /// @param token The ERC-20 token address (e.g., USDC).
    /// @param amount Total freight amount to deposit into escrow.
    /// @param cargoManifestHash Keccak-256 hash of the customs clearance document (MIC/DTA).
    /// @param durationSeconds Number of seconds until the delivery window expires.
    /// @return orderId The newly assigned order ID.
    function createAndFundOrder(
        address carrier,
        address token,
        uint256 amount,
        bytes32 cargoManifestHash,
        uint256 durationSeconds
    ) external nonReentrant returns (uint256 orderId) {
        if (carrier == address(0) || token == address(0)) revert InvalidAddress();
        if (amount == 0) revert InvalidAmount();
        if (durationSeconds == 0) revert InvalidDuration();

        address importer = _msgSender();
        orderId = nextOrderId++;
        uint256 deadline = block.timestamp + durationSeconds;

        orders[orderId] = EscrowOrder({
            orderId: orderId,
            importer: importer,
            carrier: carrier,
            token: token,
            amount: amount,
            cargoManifestHash: cargoManifestHash,
            deadline: deadline,
            status: EscrowStatus.Funded,
            createdAt: block.timestamp
        });

        // `importer`, not the relayer forwarding this call, is who must hold the balance
        // and have granted allowance (via a prior or same-bundle ERC-2612 permit).
        IERC20(token).safeTransferFrom(importer, address(this), amount);

        emit OrderFunded(orderId, importer, carrier, amount);
    }

    /// @notice Carrier signals departure and cargo transit commencement.
    /// @param orderId The identifier of the order.
    function startTransit(uint256 orderId) external {
        EscrowOrder storage order = orders[orderId];
        if (order.status != EscrowStatus.Funded) {
            revert InvalidStatus(order.status, EscrowStatus.Funded);
        }
        address sender = _msgSender();
        bool isCustomsOracle = customsOracle != address(0) && sender == customsOracle;
        if (sender != order.carrier && sender != owner() && !isCustomsOracle) {
            revert Unauthorized();
        }

        order.status = EscrowStatus.InTransit;
        emit OrderInTransit(orderId);
    }

    /// @notice Verifies cryptographic signature from receiver's Tangem NFC card and releases payment.
    /// @dev Star function for ETH Bolivia Buildathon.
    /// @param orderId The identifier of the order.
    /// @param signature ECDSA signature generated by the receiver's Tangem NFC card chip.
    function settleWithTangemTap(uint256 orderId, bytes calldata signature) external nonReentrant {
        EscrowOrder storage order = orders[orderId];
        if (order.status != EscrowStatus.InTransit) {
            revert InvalidStatus(order.status, EscrowStatus.InTransit);
        }

        bytes32 digest = keccak256(abi.encode(SETTLE_TYPEHASH, orderId, block.chainid));
        bytes32 ethSignedDigest = MessageHashUtils.toEthSignedMessageHash(digest);

        address recoveredSigner;
        // Support both standard Ethereum signed message format and raw digest
        (recoveredSigner, , ) = ECDSA.tryRecover(ethSignedDigest, signature);
        if (recoveredSigner != order.importer) {
            (recoveredSigner, , ) = ECDSA.tryRecover(digest, signature);
        }

        if (recoveredSigner != order.importer) {
            revert InvalidSignature();
        }

        order.status = EscrowStatus.Delivered;

        uint256 fee = (order.amount * feeBps) / BPS_DENOMINATOR;
        uint256 payout = order.amount - fee;

        IERC20(order.token).safeTransfer(order.carrier, payout);
        if (fee > 0 && treasury != address(0)) {
            IERC20(order.token).safeTransfer(treasury, fee);
        }

        emit OrderSettled(orderId, order.carrier, payout, fee);
    }

    /// @notice Importer claims full refund if carrier fails to deliver before the deadline.
    /// @param orderId The identifier of the order.
    function refundOnTimeout(uint256 orderId) external nonReentrant {
        EscrowOrder storage order = orders[orderId];
        if (order.status != EscrowStatus.Funded && order.status != EscrowStatus.InTransit) {
            revert InvalidStatus(order.status, EscrowStatus.InTransit);
        }
        if (block.timestamp < order.deadline) {
            revert DeadlineNotPassed(block.timestamp, order.deadline);
        }
        address sender = _msgSender();
        if (sender != order.importer && sender != owner()) {
            revert Unauthorized();
        }

        order.status = EscrowStatus.Refunded;
        uint256 refundAmount = order.amount;

        IERC20(order.token).safeTransfer(order.importer, refundAmount);

        emit OrderRefunded(orderId, refundAmount);
    }

    /// @notice Opens a dispute for arbitration (e.g. customs retention at Tambo Quemado).
    /// @param orderId The identifier of the order.
    function openDispute(uint256 orderId) external {
        EscrowOrder storage order = orders[orderId];
        if (order.status != EscrowStatus.Funded && order.status != EscrowStatus.InTransit) {
            revert InvalidStatus(order.status, EscrowStatus.InTransit);
        }
        address sender = _msgSender();
        if (sender != order.importer && sender != order.carrier && sender != owner()) {
            revert Unauthorized();
        }

        order.status = EscrowStatus.Disputed;
        emit OrderDisputed(orderId, sender);
    }

    /// @notice Resolves an open dispute by the contract arbiter / owner.
    /// @param orderId The identifier of the order.
    /// @param refundImporter True to refund importer, false to pay out to carrier.
    function resolveDispute(uint256 orderId, bool refundImporter) external onlyOwner nonReentrant {
        EscrowOrder storage order = orders[orderId];
        if (order.status != EscrowStatus.Disputed) {
            revert InvalidStatus(order.status, EscrowStatus.Disputed);
        }

        uint256 amount = order.amount;
        if (refundImporter) {
            order.status = EscrowStatus.Refunded;
            IERC20(order.token).safeTransfer(order.importer, amount);
        } else {
            order.status = EscrowStatus.Delivered;
            uint256 fee = (amount * feeBps) / BPS_DENOMINATOR;
            uint256 payout = amount - fee;
            IERC20(order.token).safeTransfer(order.carrier, payout);
            if (fee > 0 && treasury != address(0)) {
                IERC20(order.token).safeTransfer(treasury, fee);
            }
        }

        emit DisputeResolved(orderId, refundImporter, amount);
    }

    /// @notice Updates the protocol fee basis points.
    /// @param newFeeBps New fee in basis points (max 500 = 5.00%).
    function setFeeBps(uint256 newFeeBps) external onlyOwner {
        if (newFeeBps > 500) revert FeeTooHigh();
        emit FeeBpsUpdated(feeBps, newFeeBps);
        feeBps = newFeeBps;
    }

    /// @notice Updates the protocol fee treasury recipient address.
    /// @param newTreasury New treasury address.
    function setTreasury(address newTreasury) external onlyOwner {
        if (newTreasury == address(0)) revert InvalidAddress();
        emit TreasuryUpdated(treasury, newTreasury);
        treasury = newTreasury;
    }

    /// @notice Updates the authorized MIC/DTA customs relay address.
    /// @dev See `customsOracle` docs — stands in for an authenticated despachante relay.
    /// @param newOracle New customs oracle address.
    function setCustomsOracle(address newOracle) external onlyOwner {
        if (newOracle == address(0)) revert InvalidAddress();
        emit CustomsOracleUpdated(customsOracle, newOracle);
        customsOracle = newOracle;
    }

    /// @notice Convenience view helper to query full order details.
    function getOrder(uint256 orderId) external view returns (EscrowOrder memory) {
        return orders[orderId];
    }

    function _msgSender() internal view override(Context, ERC2771Context) returns (address) {
        return ERC2771Context._msgSender();
    }

    function _msgData() internal view override(Context, ERC2771Context) returns (bytes calldata) {
        return ERC2771Context._msgData();
    }

    function _contextSuffixLength() internal view override(Context, ERC2771Context) returns (uint256) {
        return ERC2771Context._contextSuffixLength();
    }
}

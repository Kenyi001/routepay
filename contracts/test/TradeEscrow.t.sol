// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {TradeEscrow} from "../src/TradeEscrow.sol";
import {MockUSDC} from "./mocks/MockUSDC.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {ERC2771Forwarder} from "@openzeppelin/contracts/metatx/ERC2771Forwarder.sol";

contract TradeEscrowTest is Test {
    TradeEscrow internal tradeEscrow;
    MockUSDC internal usdc;
    ERC2771Forwarder internal forwarder;

    uint256 internal importerPrivateKey = 0xA11CE;
    address internal importer;
    address internal carrier = address(0xCA991E8);
    address internal treasury = address(0x78EA5);
    address internal attacker = address(0xBAD);
    address internal relayer = address(0x1E1A9);

    bytes32 internal manifestHash = keccak256("MIC/DTA-BO-CL-2026-00921");
    uint256 internal freightAmount = 2500 * 1e6; // $2,500 USDC
    uint256 internal duration = 7 days;

    bytes32 internal constant PERMIT_TYPEHASH =
        keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");
    bytes32 internal constant FORWARD_REQUEST_TYPEHASH = keccak256(
        "ForwardRequest(address from,address to,uint256 value,uint256 gas,uint256 nonce,uint48 deadline,bytes data)"
    );

    function setUp() public {
        importer = vm.addr(importerPrivateKey);

        forwarder = new ERC2771Forwarder("RoutePay Forwarder");
        tradeEscrow = new TradeEscrow(address(forwarder));
        tradeEscrow.setTreasury(treasury);

        usdc = new MockUSDC();
        usdc.mint(importer, 10_000 * 1e6);

        vm.prank(importer);
        usdc.approve(address(tradeEscrow), type(uint256).max);
    }

    function _domainSeparator(string memory name, string memory version, address verifyingContract)
        internal
        view
        returns (bytes32)
    {
        bytes32 typeHash =
            keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
        return keccak256(
            abi.encode(typeHash, keccak256(bytes(name)), keccak256(bytes(version)), block.chainid, verifyingContract)
        );
    }

    function test_FundOrder() public {
        vm.prank(importer);
        uint256 orderId = tradeEscrow.createAndFundOrder(
            carrier,
            address(usdc),
            freightAmount,
            manifestHash,
            duration
        );

        assertEq(orderId, 1);

        TradeEscrow.EscrowOrder memory order = tradeEscrow.getOrder(orderId);
        assertEq(order.importer, importer);
        assertEq(order.carrier, carrier);
        assertEq(order.token, address(usdc));
        assertEq(order.amount, freightAmount);
        assertEq(order.cargoManifestHash, manifestHash);
        assertEq(uint256(order.status), uint256(TradeEscrow.EscrowStatus.Funded));
        assertEq(usdc.balanceOf(address(tradeEscrow)), freightAmount);
    }

    function test_StartTransit() public {
        vm.prank(importer);
        uint256 orderId = tradeEscrow.createAndFundOrder(
            carrier,
            address(usdc),
            freightAmount,
            manifestHash,
            duration
        );

        // Carrier starts transit from Arica port
        vm.prank(carrier);
        tradeEscrow.startTransit(orderId);

        TradeEscrow.EscrowOrder memory order = tradeEscrow.getOrder(orderId);
        assertEq(uint256(order.status), uint256(TradeEscrow.EscrowStatus.InTransit));
    }

    function test_RevertIfUnauthorizedStartTransit() public {
        vm.prank(importer);
        uint256 orderId = tradeEscrow.createAndFundOrder(
            carrier,
            address(usdc),
            freightAmount,
            manifestHash,
            duration
        );

        // Random address cannot start transit
        vm.prank(attacker);
        vm.expectRevert(TradeEscrow.Unauthorized.selector);
        tradeEscrow.startTransit(orderId);
    }

    function test_SettleWithValidTangemSignature() public {
        vm.prank(importer);
        uint256 orderId = tradeEscrow.createAndFundOrder(
            carrier,
            address(usdc),
            freightAmount,
            manifestHash,
            duration
        );

        vm.prank(carrier);
        tradeEscrow.startTransit(orderId);

        // Importer's Tangem NFC card signs: keccak256(SETTLE_TYPEHASH, orderId, chainId)
        bytes32 digest = keccak256(abi.encode(tradeEscrow.SETTLE_TYPEHASH(), orderId, block.chainid));
        bytes32 ethSignedDigest = MessageHashUtils.toEthSignedMessageHash(digest);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(importerPrivateKey, ethSignedDigest);
        bytes memory signature = abi.encodePacked(r, s, v);

        uint256 carrierInitialBalance = usdc.balanceOf(carrier);
        uint256 treasuryInitialBalance = usdc.balanceOf(treasury);

        // Carrier submits Tangem NFC signature upon arrival at Santa Cruz warehouse
        vm.prank(carrier);
        tradeEscrow.settleWithTangemTap(orderId, signature);

        TradeEscrow.EscrowOrder memory order = tradeEscrow.getOrder(orderId);
        assertEq(uint256(order.status), uint256(TradeEscrow.EscrowStatus.Delivered));

        // 0.5% fee calculation
        uint256 expectedFee = (freightAmount * 50) / 10000; // $12.50 USDC
        uint256 expectedPayout = freightAmount - expectedFee; // $2,487.50 USDC

        assertEq(usdc.balanceOf(carrier) - carrierInitialBalance, expectedPayout);
        assertEq(usdc.balanceOf(treasury) - treasuryInitialBalance, expectedFee);
        assertEq(usdc.balanceOf(address(tradeEscrow)), 0);
    }

    function test_RevertIfSignatureInvalid() public {
        vm.prank(importer);
        uint256 orderId = tradeEscrow.createAndFundOrder(
            carrier,
            address(usdc),
            freightAmount,
            manifestHash,
            duration
        );

        vm.prank(carrier);
        tradeEscrow.startTransit(orderId);

        // Forged signature with unauthorized key
        uint256 attackerPrivateKey = 0x666;
        bytes32 digest = keccak256(abi.encode(tradeEscrow.SETTLE_TYPEHASH(), orderId, block.chainid));
        bytes32 ethSignedDigest = MessageHashUtils.toEthSignedMessageHash(digest);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(attackerPrivateKey, ethSignedDigest);
        bytes memory fakeSignature = abi.encodePacked(r, s, v);

        vm.prank(carrier);
        vm.expectRevert(TradeEscrow.InvalidSignature.selector);
        tradeEscrow.settleWithTangemTap(orderId, fakeSignature);
    }

    function test_RefundAfterDeadline() public {
        vm.prank(importer);
        uint256 orderId = tradeEscrow.createAndFundOrder(
            carrier,
            address(usdc),
            freightAmount,
            manifestHash,
            duration
        );

        // Fast-forward past deadline
        vm.warp(block.timestamp + duration + 1);

        uint256 importerBefore = usdc.balanceOf(importer);

        vm.prank(importer);
        tradeEscrow.refundOnTimeout(orderId);

        TradeEscrow.EscrowOrder memory order = tradeEscrow.getOrder(orderId);
        assertEq(uint256(order.status), uint256(TradeEscrow.EscrowStatus.Refunded));
        assertEq(usdc.balanceOf(importer) - importerBefore, freightAmount);
        assertEq(usdc.balanceOf(address(tradeEscrow)), 0);
    }

    function test_RevertIfRefundBeforeDeadline() public {
        vm.prank(importer);
        uint256 orderId = tradeEscrow.createAndFundOrder(
            carrier,
            address(usdc),
            freightAmount,
            manifestHash,
            duration
        );

        // Advance 1 day, deadline is 7 days
        vm.warp(block.timestamp + 1 days);

        vm.prank(importer);
        vm.expectRevert();
        tradeEscrow.refundOnTimeout(orderId);
    }

    function test_DisputeAndResolution() public {
        vm.prank(importer);
        uint256 orderId = tradeEscrow.createAndFundOrder(
            carrier,
            address(usdc),
            freightAmount,
            manifestHash,
            duration
        );

        vm.prank(carrier);
        tradeEscrow.startTransit(orderId);

        // Carrier flags dispute due to border detention at Tambo Quemado
        vm.prank(carrier);
        tradeEscrow.openDispute(orderId);

        TradeEscrow.EscrowOrder memory order = tradeEscrow.getOrder(orderId);
        assertEq(uint256(order.status), uint256(TradeEscrow.EscrowStatus.Disputed));

        // Contract owner arbitrates and refunds importer
        uint256 importerBefore = usdc.balanceOf(importer);
        tradeEscrow.resolveDispute(orderId, true);

        order = tradeEscrow.getOrder(orderId);
        assertEq(uint256(order.status), uint256(TradeEscrow.EscrowStatus.Refunded));
        assertEq(usdc.balanceOf(importer) - importerBefore, freightAmount);
    }

    function test_CustomsOracleCanStartTransit() public {
        address customsOracle = address(0x0BACD0);
        tradeEscrow.setCustomsOracle(customsOracle);

        vm.prank(importer);
        uint256 orderId = tradeEscrow.createAndFundOrder(
            carrier,
            address(usdc),
            freightAmount,
            manifestHash,
            duration
        );

        // The customs relay (MockCustomsRelay.s.sol in production) confirms transit
        // instead of the carrier self-reporting it. See docs/CUSTOMS-ORACLE.md.
        vm.prank(customsOracle);
        tradeEscrow.startTransit(orderId);

        TradeEscrow.EscrowOrder memory order = tradeEscrow.getOrder(orderId);
        assertEq(uint256(order.status), uint256(TradeEscrow.EscrowStatus.InTransit));
    }

    function test_GaslessOrderViaForwarderAndPermit() public {
        // 1. Importer signs an ERC-2612 permit off-chain (no gas spent) granting
        //    TradeEscrow allowance, instead of a separate on-chain `approve` tx.
        uint256 permitDeadline = block.timestamp + 1 hours;
        bytes32 permitStructHash = keccak256(
            abi.encode(
                PERMIT_TYPEHASH, importer, address(tradeEscrow), freightAmount, usdc.nonces(importer), permitDeadline
            )
        );
        bytes32 permitDigest = MessageHashUtils.toTypedDataHash(
            _domainSeparator("USD Coin", "1", address(usdc)), permitStructHash
        );
        (uint8 pv, bytes32 pr, bytes32 ps) = vm.sign(importerPrivateKey, permitDigest);

        // 2. Importer signs an ERC-2771 forward request for `createAndFundOrder`,
        //    again without spending any gas — the relayer submits both.
        bytes memory callData = abi.encodeCall(
            TradeEscrow.createAndFundOrder, (carrier, address(usdc), freightAmount, manifestHash, duration)
        );
        uint48 forwardDeadline = uint48(block.timestamp + 1 hours);
        bytes32 forwardStructHash = keccak256(
            abi.encode(
                FORWARD_REQUEST_TYPEHASH,
                importer,
                address(tradeEscrow),
                uint256(0), // value
                uint256(500_000), // gas
                forwarder.nonces(importer),
                forwardDeadline,
                keccak256(callData)
            )
        );
        bytes32 forwardDigest = MessageHashUtils.toTypedDataHash(
            _domainSeparator("RoutePay Forwarder", "1", address(forwarder)), forwardStructHash
        );
        (uint8 fv, bytes32 fr, bytes32 fs) = vm.sign(importerPrivateKey, forwardDigest);

        ERC2771Forwarder.ForwardRequestData memory request = ERC2771Forwarder.ForwardRequestData({
            from: importer,
            to: address(tradeEscrow),
            value: 0,
            gas: 500_000,
            deadline: forwardDeadline,
            data: callData,
            signature: abi.encodePacked(fr, fs, fv)
        });

        // 3. The relayer — not the importer — pays gas for both transactions.
        //    The importer's wallet never signs an on-chain tx nor holds native gas token.
        vm.startPrank(relayer);
        usdc.permit(importer, address(tradeEscrow), freightAmount, permitDeadline, pv, pr, ps);
        forwarder.execute(request);
        vm.stopPrank();

        TradeEscrow.EscrowOrder memory order = tradeEscrow.getOrder(1);
        assertEq(order.importer, importer, "order.importer must be the real signer, not the relayer");
        assertEq(order.carrier, carrier);
        assertEq(uint256(order.status), uint256(TradeEscrow.EscrowStatus.Funded));
        assertEq(usdc.balanceOf(address(tradeEscrow)), freightAmount);
        assertEq(usdc.balanceOf(importer), 10_000 * 1e6 - freightAmount);
    }

    function test_RevertIfUnsetCustomsOracleTriesStartTransit() public {
        vm.prank(importer);
        uint256 orderId = tradeEscrow.createAndFundOrder(
            carrier,
            address(usdc),
            freightAmount,
            manifestHash,
            duration
        );

        // customsOracle defaults to address(0) — no one should be authorized as it
        vm.prank(address(0));
        vm.expectRevert(TradeEscrow.Unauthorized.selector);
        tradeEscrow.startTransit(orderId);
    }

    function test_RevertIfDoubleSettle() public {
        vm.prank(importer);
        uint256 orderId = tradeEscrow.createAndFundOrder(
            carrier, address(usdc), freightAmount, manifestHash, duration
        );

        vm.prank(carrier);
        tradeEscrow.startTransit(orderId);

        bytes32 digest = keccak256(abi.encode(tradeEscrow.SETTLE_TYPEHASH(), orderId, block.chainid));
        bytes32 ethSignedDigest = MessageHashUtils.toEthSignedMessageHash(digest);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(importerPrivateKey, ethSignedDigest);
        bytes memory signature = abi.encodePacked(r, s, v);

        vm.prank(carrier);
        tradeEscrow.settleWithTangemTap(orderId, signature);

        // Second attempt to settle the same order must revert — order is Delivered now,
        // not InTransit, so a stolen/replayed signature can't drain the contract twice.
        vm.prank(carrier);
        vm.expectRevert(
            abi.encodeWithSelector(
                TradeEscrow.InvalidStatus.selector, TradeEscrow.EscrowStatus.Delivered, TradeEscrow.EscrowStatus.InTransit
            )
        );
        tradeEscrow.settleWithTangemTap(orderId, signature);
    }

    function test_RevertIfDoubleRefund() public {
        vm.prank(importer);
        uint256 orderId = tradeEscrow.createAndFundOrder(
            carrier, address(usdc), freightAmount, manifestHash, duration
        );

        vm.warp(block.timestamp + duration + 1);

        vm.prank(importer);
        tradeEscrow.refundOnTimeout(orderId);

        // Second refund attempt on an already-refunded order must revert, with the
        // correct current status reported (see InvalidStatusForOperation, not a false
        // "expected InTransit" claim).
        vm.prank(importer);
        vm.expectRevert(
            abi.encodeWithSelector(TradeEscrow.InvalidStatusForOperation.selector, TradeEscrow.EscrowStatus.Refunded)
        );
        tradeEscrow.refundOnTimeout(orderId);
    }

    function test_RevertIfUnauthorizedOpenDispute() public {
        vm.prank(importer);
        uint256 orderId = tradeEscrow.createAndFundOrder(
            carrier, address(usdc), freightAmount, manifestHash, duration
        );

        vm.prank(attacker);
        vm.expectRevert(TradeEscrow.Unauthorized.selector);
        tradeEscrow.openDispute(orderId);
    }

    function test_DisputeResolvedInFavorOfCarrier() public {
        vm.prank(importer);
        uint256 orderId = tradeEscrow.createAndFundOrder(
            carrier, address(usdc), freightAmount, manifestHash, duration
        );

        vm.prank(carrier);
        tradeEscrow.startTransit(orderId);

        vm.prank(importer);
        tradeEscrow.openDispute(orderId);

        uint256 carrierBefore = usdc.balanceOf(carrier);
        uint256 treasuryBefore = usdc.balanceOf(treasury);

        // Arbiter rules in favor of the carrier this time (refundImporter = false)
        tradeEscrow.resolveDispute(orderId, false);

        TradeEscrow.EscrowOrder memory order = tradeEscrow.getOrder(orderId);
        assertEq(uint256(order.status), uint256(TradeEscrow.EscrowStatus.Delivered));

        uint256 expectedFee = (freightAmount * 50) / 10000;
        assertEq(usdc.balanceOf(carrier) - carrierBefore, freightAmount - expectedFee);
        assertEq(usdc.balanceOf(treasury) - treasuryBefore, expectedFee);
    }

    function test_RevertIfCreateOrderWithZeroAddress() public {
        vm.startPrank(importer);
        vm.expectRevert(TradeEscrow.InvalidAddress.selector);
        tradeEscrow.createAndFundOrder(address(0), address(usdc), freightAmount, manifestHash, duration);

        vm.expectRevert(TradeEscrow.InvalidAddress.selector);
        tradeEscrow.createAndFundOrder(carrier, address(0), freightAmount, manifestHash, duration);
        vm.stopPrank();
    }

    function test_RevertIfCreateOrderWithZeroAmountOrDuration() public {
        vm.startPrank(importer);
        vm.expectRevert(TradeEscrow.InvalidAmount.selector);
        tradeEscrow.createAndFundOrder(carrier, address(usdc), 0, manifestHash, duration);

        vm.expectRevert(TradeEscrow.InvalidDuration.selector);
        tradeEscrow.createAndFundOrder(carrier, address(usdc), freightAmount, manifestHash, 0);
        vm.stopPrank();
    }

    function test_RevertIfFeeBpsTooHigh() public {
        vm.expectRevert(TradeEscrow.FeeTooHigh.selector);
        tradeEscrow.setFeeBps(501);
    }

    function test_RevertIfNonOwnerSetsTreasury() public {
        vm.prank(attacker);
        vm.expectRevert();
        tradeEscrow.setTreasury(attacker);
    }
}

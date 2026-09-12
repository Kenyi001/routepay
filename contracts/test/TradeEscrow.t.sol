// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {TradeEscrow} from "../src/TradeEscrow.sol";
import {MockUSDC} from "./mocks/MockUSDC.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract TradeEscrowTest is Test {
    TradeEscrow internal tradeEscrow;
    MockUSDC internal usdc;

    uint256 internal importerPrivateKey = 0xA11CE;
    address internal importer;
    address internal carrier = address(0xCA991E8);
    address internal treasury = address(0x78EA5);
    address internal attacker = address(0xBAD);

    bytes32 internal manifestHash = keccak256("MIC/DTA-BO-CL-2026-00921");
    uint256 internal freightAmount = 2500 * 1e6; // $2,500 USDC
    uint256 internal duration = 7 days;

    function setUp() public {
        importer = vm.addr(importerPrivateKey);

        tradeEscrow = new TradeEscrow();
        tradeEscrow.setTreasury(treasury);

        usdc = new MockUSDC();
        usdc.mint(importer, 10_000 * 1e6);

        vm.prank(importer);
        usdc.approve(address(tradeEscrow), type(uint256).max);
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
}

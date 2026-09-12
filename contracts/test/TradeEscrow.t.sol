// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {TradeEscrow} from "../src/TradeEscrow.sol";

/// @notice Skeleton test suite — 6 cases from 02-Arquitectura/TAREAS-Y-ROLES.md.
/// TODO(Dax): implement once TradeEscrow's TODO functions are filled in.
contract TradeEscrowTest is Test {
    TradeEscrow internal tradeEscrow;

    function setUp() public {
        tradeEscrow = new TradeEscrow();
    }

    function test_FundOrder() public {
        // TODO: depósito correcto y emisión de evento OrderFunded.
    }

    function test_StartTransit() public {
        // TODO: transición de estado a InTransit.
    }

    function test_SettleWithValidTangemSignature() public {
        // TODO: verificación EIP-712 y transferencia inmediata de fondos al carrier.
    }

    function test_RevertIfSignatureInvalid() public {
        // TODO: rechazo inmediato con firma falsa.
    }

    function test_RefundAfterDeadline() public {
        // TODO: reembolso íntegro al importador si venció el deadline.
    }

    function test_RevertIfRefundBeforeDeadline() public {
        // TODO: bloqueo de reembolso si el plazo sigue vigente.
    }
}

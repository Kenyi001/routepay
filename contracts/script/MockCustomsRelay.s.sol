// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {TradeEscrow} from "../src/TradeEscrow.sol";

/// @notice Simulates an authenticated MIC/DTA customs relay confirming a cargo's transit.
/// @dev Bolivia (SUMA) and Chile (SITRAD) expose no public, unauthenticated API for this —
/// see docs/CUSTOMS-ORACLE.md for the research behind this design. In production, this
/// script's role would be played by a backend service holding real despachante/B2G
/// credentials, listening for a customs clearance event and calling `startTransit` the
/// same way this script does. For the demo, it looks up the order's manifest hash against
/// `mock-manifests.json` and, if marked "cleared", confirms transit on-chain.
///
/// Usage: forge script script/MockCustomsRelay.s.sol --sig "run(uint256)" <orderId> \
///   --rpc-url fuji --broadcast
contract MockCustomsRelayScript is Script {
    function run(uint256 orderId) external {
        address tradeEscrowAddress = vm.envAddress("TRADE_ESCROW_ADDRESS");
        uint256 oracleKey = vm.envUint("CUSTOMS_ORACLE_PRIVATE_KEY");

        TradeEscrow tradeEscrow = TradeEscrow(tradeEscrowAddress);
        TradeEscrow.EscrowOrder memory order = tradeEscrow.getOrder(orderId);

        string memory json = vm.readFile("script/mock-manifests.json");
        bool cleared = false;

        // Scan entries until the JSON path stops resolving (no fixed-size array assumed).
        for (uint256 i = 0; i < 100; i++) {
            string memory hashPath = string.concat("$.manifests[", vm.toString(i), "].cargoManifestHash");
            try vm.parseJsonBytes32(json, hashPath) returns (bytes32 candidateHash) {
                if (candidateHash == order.cargoManifestHash) {
                    string memory statusPath = string.concat("$.manifests[", vm.toString(i), "].status");
                    string memory status = vm.parseJsonString(json, statusPath);
                    cleared = keccak256(bytes(status)) == keccak256(bytes("cleared"));
                    break;
                }
            } catch {
                break; // reached the end of the manifests array
            }
        }

        if (!cleared) {
            console.log("Manifest not found or not cleared for order:", orderId);
            revert("Customs clearance not confirmed");
        }

        vm.startBroadcast(oracleKey);
        tradeEscrow.startTransit(orderId);
        vm.stopBroadcast();

        console.log("Customs clearance confirmed, transit started for order:", orderId);
    }
}

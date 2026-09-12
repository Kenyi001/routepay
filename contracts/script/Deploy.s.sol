// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {TradeEscrow} from "../src/TradeEscrow.sol";

/// @notice Deploys TradeEscrow to Avalanche Fuji Testnet.
/// Usage: forge script script/Deploy.s.sol --rpc-url fuji --broadcast --verify
contract DeployScript is Script {
    function run() external returns (TradeEscrow tradeEscrow) {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerKey);
        tradeEscrow = new TradeEscrow();
        vm.stopBroadcast();
    }
}

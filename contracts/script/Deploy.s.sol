// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {ERC2771Forwarder} from "@openzeppelin/contracts/metatx/ERC2771Forwarder.sol";
import {TradeEscrow} from "../src/TradeEscrow.sol";

/// @notice Deploys the ERC-2771 forwarder and TradeEscrow to Avalanche Fuji Testnet.
/// Usage: forge script script/Deploy.s.sol --rpc-url fuji --broadcast --verify
contract DeployScript is Script {
    function run() external returns (ERC2771Forwarder forwarder, TradeEscrow tradeEscrow) {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerKey);
        forwarder = new ERC2771Forwarder("RoutePay Forwarder");
        tradeEscrow = new TradeEscrow(address(forwarder));
        vm.stopBroadcast();

        console.log("ERC2771Forwarder deployed at:", address(forwarder));
        console.log("TradeEscrow deployed at:", address(tradeEscrow));
    }
}

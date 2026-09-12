// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/// @notice Mock USDC with ERC-2612 permit support, so the importer can approve
/// TradeEscrow with a signature instead of a separate gas-paying `approve` tx.
/// See docs/GASLESS-RELAYER.md for how this fits into the gasless flow.
contract MockUSDC is ERC20, ERC20Permit {
    constructor() ERC20("USD Coin", "USDC") ERC20Permit("USD Coin") {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

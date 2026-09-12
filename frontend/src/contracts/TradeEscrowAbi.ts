export const TRADE_ESCROW_ABI = [
    {
        "type":  "constructor",
        "inputs":  [
                       {
                           "name":  "trustedForwarder",
                           "type":  "address",
                           "internalType":  "address"
                       }
                   ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "BPS_DENOMINATOR",
        "inputs":  [

                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "uint256",
                            "internalType":  "uint256"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "SETTLE_TYPEHASH",
        "inputs":  [

                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "bytes32",
                            "internalType":  "bytes32"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "createAndFundOrder",
        "inputs":  [
                       {
                           "name":  "carrier",
                           "type":  "address",
                           "internalType":  "address"
                       },
                       {
                           "name":  "token",
                           "type":  "address",
                           "internalType":  "address"
                       },
                       {
                           "name":  "amount",
                           "type":  "uint256",
                           "internalType":  "uint256"
                       },
                       {
                           "name":  "cargoManifestHash",
                           "type":  "bytes32",
                           "internalType":  "bytes32"
                       },
                       {
                           "name":  "durationSeconds",
                           "type":  "uint256",
                           "internalType":  "uint256"
                       }
                   ],
        "outputs":  [
                        {
                            "name":  "orderId",
                            "type":  "uint256",
                            "internalType":  "uint256"
                        }
                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "customsOracle",
        "inputs":  [

                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "address",
                            "internalType":  "address"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "feeBps",
        "inputs":  [

                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "uint256",
                            "internalType":  "uint256"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "getOrder",
        "inputs":  [
                       {
                           "name":  "orderId",
                           "type":  "uint256",
                           "internalType":  "uint256"
                       }
                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "tuple",
                            "internalType":  "struct TradeEscrow.EscrowOrder",
                            "components":  [
                                               {
                                                   "name":  "orderId",
                                                   "type":  "uint256",
                                                   "internalType":  "uint256"
                                               },
                                               {
                                                   "name":  "importer",
                                                   "type":  "address",
                                                   "internalType":  "address"
                                               },
                                               {
                                                   "name":  "carrier",
                                                   "type":  "address",
                                                   "internalType":  "address"
                                               },
                                               {
                                                   "name":  "token",
                                                   "type":  "address",
                                                   "internalType":  "address"
                                               },
                                               {
                                                   "name":  "amount",
                                                   "type":  "uint256",
                                                   "internalType":  "uint256"
                                               },
                                               {
                                                   "name":  "cargoManifestHash",
                                                   "type":  "bytes32",
                                                   "internalType":  "bytes32"
                                               },
                                               {
                                                   "name":  "deadline",
                                                   "type":  "uint256",
                                                   "internalType":  "uint256"
                                               },
                                               {
                                                   "name":  "status",
                                                   "type":  "uint8",
                                                   "internalType":  "enum TradeEscrow.EscrowStatus"
                                               },
                                               {
                                                   "name":  "createdAt",
                                                   "type":  "uint256",
                                                   "internalType":  "uint256"
                                               }
                                           ]
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "isTrustedForwarder",
        "inputs":  [
                       {
                           "name":  "forwarder",
                           "type":  "address",
                           "internalType":  "address"
                       }
                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "bool",
                            "internalType":  "bool"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "nextOrderId",
        "inputs":  [

                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "uint256",
                            "internalType":  "uint256"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "openDispute",
        "inputs":  [
                       {
                           "name":  "orderId",
                           "type":  "uint256",
                           "internalType":  "uint256"
                       }
                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "orders",
        "inputs":  [
                       {
                           "name":  "",
                           "type":  "uint256",
                           "internalType":  "uint256"
                       }
                   ],
        "outputs":  [
                        {
                            "name":  "orderId",
                            "type":  "uint256",
                            "internalType":  "uint256"
                        },
                        {
                            "name":  "importer",
                            "type":  "address",
                            "internalType":  "address"
                        },
                        {
                            "name":  "carrier",
                            "type":  "address",
                            "internalType":  "address"
                        },
                        {
                            "name":  "token",
                            "type":  "address",
                            "internalType":  "address"
                        },
                        {
                            "name":  "amount",
                            "type":  "uint256",
                            "internalType":  "uint256"
                        },
                        {
                            "name":  "cargoManifestHash",
                            "type":  "bytes32",
                            "internalType":  "bytes32"
                        },
                        {
                            "name":  "deadline",
                            "type":  "uint256",
                            "internalType":  "uint256"
                        },
                        {
                            "name":  "status",
                            "type":  "uint8",
                            "internalType":  "enum TradeEscrow.EscrowStatus"
                        },
                        {
                            "name":  "createdAt",
                            "type":  "uint256",
                            "internalType":  "uint256"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "owner",
        "inputs":  [

                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "address",
                            "internalType":  "address"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "refundOnTimeout",
        "inputs":  [
                       {
                           "name":  "orderId",
                           "type":  "uint256",
                           "internalType":  "uint256"
                       }
                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "renounceOwnership",
        "inputs":  [

                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "resolveDispute",
        "inputs":  [
                       {
                           "name":  "orderId",
                           "type":  "uint256",
                           "internalType":  "uint256"
                       },
                       {
                           "name":  "refundImporter",
                           "type":  "bool",
                           "internalType":  "bool"
                       }
                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "setCustomsOracle",
        "inputs":  [
                       {
                           "name":  "newOracle",
                           "type":  "address",
                           "internalType":  "address"
                       }
                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "setFeeBps",
        "inputs":  [
                       {
                           "name":  "newFeeBps",
                           "type":  "uint256",
                           "internalType":  "uint256"
                       }
                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "setTreasury",
        "inputs":  [
                       {
                           "name":  "newTreasury",
                           "type":  "address",
                           "internalType":  "address"
                       }
                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "settleWithTangemTap",
        "inputs":  [
                       {
                           "name":  "orderId",
                           "type":  "uint256",
                           "internalType":  "uint256"
                       },
                       {
                           "name":  "signature",
                           "type":  "bytes",
                           "internalType":  "bytes"
                       }
                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "startTransit",
        "inputs":  [
                       {
                           "name":  "orderId",
                           "type":  "uint256",
                           "internalType":  "uint256"
                       }
                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "transferOwnership",
        "inputs":  [
                       {
                           "name":  "newOwner",
                           "type":  "address",
                           "internalType":  "address"
                       }
                   ],
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable"
    },
    {
        "type":  "function",
        "name":  "treasury",
        "inputs":  [

                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "address",
                            "internalType":  "address"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "function",
        "name":  "trustedForwarder",
        "inputs":  [

                   ],
        "outputs":  [
                        {
                            "name":  "",
                            "type":  "address",
                            "internalType":  "address"
                        }
                    ],
        "stateMutability":  "view"
    },
    {
        "type":  "event",
        "name":  "CustomsOracleUpdated",
        "inputs":  [
                       {
                           "name":  "oldOracle",
                           "type":  "address",
                           "indexed":  false,
                           "internalType":  "address"
                       },
                       {
                           "name":  "newOracle",
                           "type":  "address",
                           "indexed":  false,
                           "internalType":  "address"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "DisputeResolved",
        "inputs":  [
                       {
                           "name":  "orderId",
                           "type":  "uint256",
                           "indexed":  true,
                           "internalType":  "uint256"
                       },
                       {
                           "name":  "refundedImporter",
                           "type":  "bool",
                           "indexed":  false,
                           "internalType":  "bool"
                       },
                       {
                           "name":  "amount",
                           "type":  "uint256",
                           "indexed":  false,
                           "internalType":  "uint256"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "FeeBpsUpdated",
        "inputs":  [
                       {
                           "name":  "oldFeeBps",
                           "type":  "uint256",
                           "indexed":  false,
                           "internalType":  "uint256"
                       },
                       {
                           "name":  "newFeeBps",
                           "type":  "uint256",
                           "indexed":  false,
                           "internalType":  "uint256"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "OrderDisputed",
        "inputs":  [
                       {
                           "name":  "orderId",
                           "type":  "uint256",
                           "indexed":  true,
                           "internalType":  "uint256"
                       },
                       {
                           "name":  "initiatedBy",
                           "type":  "address",
                           "indexed":  true,
                           "internalType":  "address"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "OrderFunded",
        "inputs":  [
                       {
                           "name":  "orderId",
                           "type":  "uint256",
                           "indexed":  true,
                           "internalType":  "uint256"
                       },
                       {
                           "name":  "importer",
                           "type":  "address",
                           "indexed":  true,
                           "internalType":  "address"
                       },
                       {
                           "name":  "carrier",
                           "type":  "address",
                           "indexed":  true,
                           "internalType":  "address"
                       },
                       {
                           "name":  "amount",
                           "type":  "uint256",
                           "indexed":  false,
                           "internalType":  "uint256"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "OrderInTransit",
        "inputs":  [
                       {
                           "name":  "orderId",
                           "type":  "uint256",
                           "indexed":  true,
                           "internalType":  "uint256"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "OrderRefunded",
        "inputs":  [
                       {
                           "name":  "orderId",
                           "type":  "uint256",
                           "indexed":  true,
                           "internalType":  "uint256"
                       },
                       {
                           "name":  "amount",
                           "type":  "uint256",
                           "indexed":  false,
                           "internalType":  "uint256"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "OrderSettled",
        "inputs":  [
                       {
                           "name":  "orderId",
                           "type":  "uint256",
                           "indexed":  true,
                           "internalType":  "uint256"
                       },
                       {
                           "name":  "carrier",
                           "type":  "address",
                           "indexed":  true,
                           "internalType":  "address"
                       },
                       {
                           "name":  "payout",
                           "type":  "uint256",
                           "indexed":  false,
                           "internalType":  "uint256"
                       },
                       {
                           "name":  "fee",
                           "type":  "uint256",
                           "indexed":  false,
                           "internalType":  "uint256"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "OwnershipTransferred",
        "inputs":  [
                       {
                           "name":  "previousOwner",
                           "type":  "address",
                           "indexed":  true,
                           "internalType":  "address"
                       },
                       {
                           "name":  "newOwner",
                           "type":  "address",
                           "indexed":  true,
                           "internalType":  "address"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "event",
        "name":  "TreasuryUpdated",
        "inputs":  [
                       {
                           "name":  "oldTreasury",
                           "type":  "address",
                           "indexed":  false,
                           "internalType":  "address"
                       },
                       {
                           "name":  "newTreasury",
                           "type":  "address",
                           "indexed":  false,
                           "internalType":  "address"
                       }
                   ],
        "anonymous":  false
    },
    {
        "type":  "error",
        "name":  "DeadlineNotPassed",
        "inputs":  [
                       {
                           "name":  "currentTimestamp",
                           "type":  "uint256",
                           "internalType":  "uint256"
                       },
                       {
                           "name":  "deadline",
                           "type":  "uint256",
                           "internalType":  "uint256"
                       }
                   ]
    },
    {
        "type":  "error",
        "name":  "FeeTooHigh",
        "inputs":  [

                   ]
    },
    {
        "type":  "error",
        "name":  "InvalidAddress",
        "inputs":  [

                   ]
    },
    {
        "type":  "error",
        "name":  "InvalidAmount",
        "inputs":  [

                   ]
    },
    {
        "type":  "error",
        "name":  "InvalidDuration",
        "inputs":  [

                   ]
    },
    {
        "type":  "error",
        "name":  "InvalidSignature",
        "inputs":  [

                   ]
    },
    {
        "type":  "error",
        "name":  "InvalidStatus",
        "inputs":  [
                       {
                           "name":  "currentStatus",
                           "type":  "uint8",
                           "internalType":  "enum TradeEscrow.EscrowStatus"
                       },
                       {
                           "name":  "expectedStatus",
                           "type":  "uint8",
                           "internalType":  "enum TradeEscrow.EscrowStatus"
                       }
                   ]
    },
    {
        "type":  "error",
        "name":  "OwnableInvalidOwner",
        "inputs":  [
                       {
                           "name":  "owner",
                           "type":  "address",
                           "internalType":  "address"
                       }
                   ]
    },
    {
        "type":  "error",
        "name":  "OwnableUnauthorizedAccount",
        "inputs":  [
                       {
                           "name":  "account",
                           "type":  "address",
                           "internalType":  "address"
                       }
                   ]
    },
    {
        "type":  "error",
        "name":  "ReentrancyGuardReentrantCall",
        "inputs":  [

                   ]
    },
    {
        "type":  "error",
        "name":  "SafeERC20FailedOperation",
        "inputs":  [
                       {
                           "name":  "token",
                           "type":  "address",
                           "internalType":  "address"
                       }
                   ]
    },
    {
        "type":  "error",
        "name":  "Unauthorized",
        "inputs":  [

                   ]
    },
    {
        "type": "function",
        "name": "refundOnTimeout",
        "inputs": [
            {
                "name": "orderId",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    }
] as const;

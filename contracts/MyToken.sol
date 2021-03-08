// solidity version and license
// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

// my contract
contract MyToken {
    // attributes
    uint256 public totalSupply;

    // constructor
    constructor(uint256 _initialSupply) public {
        totalSupply = _initialSupply;
    }
}

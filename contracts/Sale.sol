// solidity version and license
// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

// importing my token to the sale contract
import "./MyToken.sol";

// my contract
contract Sale {
    // attibutes
    address payable private admin; // admin (private)
    MyToken public tokenContract; // token contract
    uint256 public tokenPrice; // token price
    uint256 public tokensSold; // number of tokens sold

    // sell event
    event Sell(address _buyer, uint256 _amount);

    // constructor
    constructor(MyToken _tokenContract, uint256 _tokenPrice) public {
        // assign an admin to the contract deployer
        admin = msg.sender;
        // interacting with token contract
        tokenContract = _tokenContract;
        // setting token price in WEI
        tokenPrice = _tokenPrice;
    }

    // multiply function to insure safety when buying tokens
    function multiply(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require(y == 0 || (z = x * y) / y == x);
    }

    // buy tokens (payable allows us to send ether via transaction using this function)
    function buyTokens(uint256 _numberOfTokens) public payable {
        // require that the value of tokens being bought equals the token price
        require(msg.value == multiply(_numberOfTokens, tokenPrice));
        // require that there is enough tokens in the contract
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
        // require that a transfer is successful
        require(tokenContract.transfer(msg.sender, _numberOfTokens));
        // keep track of number of tokens sold
        tokensSold += _numberOfTokens;
        // trigger sell event
        emit Sell(msg.sender, _numberOfTokens);
    }

    // ending the token sale
    function endSale() public {
        // require that only an admin can use this function
        require(msg.sender == admin);
        // transfer remaining tokens to the admin
        require(
            tokenContract.transfer(
                admin,
                tokenContract.balanceOf(address(this))
            )
        );
        // destroy the contract
        selfdestruct(admin);
    }
}

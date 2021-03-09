// solidity version and license
// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

// my contract
contract MyToken {
    // attributes
    string public name = "MyToken"; // name of the token
    string public symbol = "Symbol"; // symbol of the token
    string public standard = "MyToken v1.0"; // standard of the token
    uint256 public totalSupply; // total supply of coins
    event Transfer(address indexed _from, address indexed _to, uint256 _value); // transfer event
    mapping(address => uint256) public balanceOf; // map where the key is (address) and the value is the balance (uint256)

    // constructor
    constructor(uint256 _initialSupply) public {
        // set the balance of the admin to the initial supply
        balanceOf[msg.sender] = _initialSupply;
        // set the initial supply
        totalSupply = _initialSupply;
    }

    // transfer function must follow the ERC20 standard
    function transfer(address _to, uint256 _value)
        public
        returns (bool success)
    {
        // handle balance not enough for the tansfer
        require(balanceOf[msg.sender] >= _value); // if this passes the function continue else it throws an error
        // transfer the balance
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        // transfer event
        emit Transfer(msg.sender, _to, _value);
        // return the boolean value
        return true;
    }
}

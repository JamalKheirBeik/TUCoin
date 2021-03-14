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

    // transfer event
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    // approve event
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    mapping(address => uint256) public balanceOf; // map where the key is (address) and the value is the balance (uint256)
    mapping(address => mapping(address => uint256)) public allowance; // map to keep track of all the approvals made by users

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

    /*
        delegated transfer => {
            1. approve function
            2. transfer from function
            3. allowance
            4. approval event
        }
    */
    // lets a specific account spend tokens from our behalf
    function approve(address _spender, uint256 _value)
        public
        returns (bool success)
    {
        // handle the allowance
        allowance[msg.sender][_spender] = _value;
        // handle the approval event
        emit Approval(msg.sender, _spender, _value);
        // returns true if all the above passes
        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        // check for requirements (_from has enough tokens) , (allowance is big enough)
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);
        // change the balance
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        // update the allowance
        allowance[_from][msg.sender] -= _value;
        // call the transfer event
        emit Transfer(_from, _to, _value);
        // returns true if prev statements passes
        return true;
    }
}

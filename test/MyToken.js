var MyToken = artifacts.require("./MyToken.sol");

contract("MyToken", (accounts) => {
  var tokenInstance;
  // testing the token name
  it("initializes the contract with the correct values", () => {
    return MyToken.deployed()
      .then((instance) => {
        tokenInstance = instance;
        return tokenInstance.name();
      })
      .then((name) => {
        assert.equal(name, "MyToken", "has the correct name");
        return tokenInstance.symbol();
      })
      .then((symbol) => {
        assert.equal(symbol, "Symbol", "has the connect symbol");
        return tokenInstance.standard();
      })
      .then((standard) => {
        assert.equal(standard, "MyToken v1.0", "has the correct standard");
      });
  });
  // testing the total supply and the admin balance
  it("allocates the total supply upon deployment", () => {
    return MyToken.deployed()
      .then((instance) => {
        tokenInstance = instance;
        return tokenInstance.totalSupply();
      })
      .then((totalSupply) => {
        assert.equal(
          totalSupply.toNumber(),
          1000000,
          "sets total supply to 1 million"
        );
        return tokenInstance.balanceOf(accounts[0]);
      })
      .then((adminBalance) => {
        assert.equal(
          adminBalance.toNumber(),
          1000000,
          "allocates the initial supply to admin account"
        );
      });
  });
  // testing the transfer ownership
  it("transfer token ownership", () => {
    return MyToken.deployed()
      .then((instance) => {
        tokenInstance = instance;
        // test if the tokens transfered are larger than the sender's balance
        return tokenInstance.transfer.call(accounts[1], 99999999999999999);
      })
      .then(assert.fail)
      .catch((error) => {
        assert(error.message, "error message must contain revert");
        // fake transaction to determinate if the real one would be successful or not
        return tokenInstance.transfer
          .call(accounts[1], 250000, {
            from: accounts[0],
          })
          .then((success) => {
            // check if the transfer was successful (success) value is passed from the prev fake transaction
            assert.equal(success, true, "it returns true");
            return tokenInstance.transfer(accounts[1], 250000, {
              from: accounts[0],
            });
          })
          .then((receipt) => {
            // check for the event
            assert.equal(receipt.logs.length, 1, "triggers one event");
            // check if the event have all the arguements we expect (from, to, value)
            assert.equal(
              receipt.logs[0].event,
              "Transfer",
              'should be the "Transfer" event'
            );
            assert.equal(
              receipt.logs[0].args._from,
              accounts[0],
              "logs the account the tokens are transferred from"
            );
            assert.equal(
              receipt.logs[0].args._to,
              accounts[1],
              "logs the account the tokens are transferred to"
            );
            assert.equal(
              receipt.logs[0].args._value,
              250000,
              "logs the transfer amount"
            );
            return tokenInstance.balanceOf(accounts[1]);
          })
          .then((balance) => {
            assert.equal(
              balance.toNumber(),
              250000,
              "adds the amount to the receiving account"
            );
            return tokenInstance.balanceOf(accounts[0]);
          })
          .then((balance) => {
            assert.equal(
              balance.toNumber(),
              750000,
              "deducts the amount from the sending account"
            );
          });
      });
  });
});

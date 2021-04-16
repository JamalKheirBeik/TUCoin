const Token = artifacts.require("./Token.sol");

contract("Token", async (accounts) => {
  let tokenInstance;
  // testing the token information
  it("initializes the contract with the correct values", async () => {
    let tokenInstance = await Token.deployed();
    // testing the name
    let name = await tokenInstance.name();
    assert.equal(name, "TU Coin", "has the correct name");
    // testing the symbol
    let symbol = await tokenInstance.symbol();
    assert.equal(symbol, "TUC", "has the correct symbol");
    // testing the standard
    let standard = await tokenInstance.standard();
    assert.equal(standard, "TU Coin v1.0", "has the correct standard");
  });
  // testing the total supply and the admin balance
  it("allocates the total supply upon deployment", async () => {
    let tokenInstance = await Token.deployed();
    // test total supply
    let totalSupply = await tokenInstance.totalSupply();
    assert.equal(
      totalSupply.toNumber(),
      1000000,
      "sets total supply to 1 million"
    );
    // test admin balance
    let adminBalance = await tokenInstance.balanceOf(accounts[0]);
    assert.equal(
      adminBalance.toNumber(),
      1000000,
      "sets admin balance to 1 million"
    );
  });
  // testing the transfer ownership
  it("transfer token ownership", async () => {
    let tokenInstance = await Token.deployed();
    // test if the tokens transfered are larger than the sender's balance
    try {
      await tokenInstance.transfer.call(accounts[1], 9999999999);
      assert.fail("fake transaction should've thrown an error");
    } catch (error) {
      assert(
        error.message.includes("revert"),
        "error message must contain revert"
      );
    }
    // test if the fake transfer will be successful
    let success = await tokenInstance.transfer.call(accounts[1], 250000, {
      from: accounts[0],
    });
    assert.equal(success, true, "it returns true");
    // test the receipt of the actual transfer
    let receipt = await tokenInstance.transfer(accounts[1], 250000, {
      from: accounts[0],
    });
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
    // test the added balance
    let addedBalance = await tokenInstance.balanceOf(accounts[1]);
    assert.equal(
      addedBalance.toNumber(),
      250000,
      "adds the amount to the receiving account"
    );
    // test the deducted balance
    let deductedBalance = await tokenInstance.balanceOf(accounts[0]);
    assert.equal(
      deductedBalance.toNumber(),
      750000,
      "deducts the amount from the sending account"
    );
  });
  // testing the delegated transfer approval
  it("approves tokens for delegated transfer", async () => {
    let tokenInstance = await Token.deployed();
    // test the success of the transfer
    let success = await tokenInstance.approve.call(accounts[1], 100);
    assert.equal(success, true, "it returns true");
    let receipt = await tokenInstance.approve(accounts[1], 100, {
      from: accounts[0],
    });
    // check for the event
    assert.equal(receipt.logs.length, 1, "triggers one event");
    // check if the event have all the arguements we expect (from, to, value)
    assert.equal(
      receipt.logs[0].event,
      "Approval",
      'should be the "Approval" event'
    );
    assert.equal(
      receipt.logs[0].args._owner,
      accounts[0],
      "logs the account the tokens are authorized by"
    );
    assert.equal(
      receipt.logs[0].args._spender,
      accounts[1],
      "logs the account the tokens are authorized to"
    );
    assert.equal(receipt.logs[0].args._value, 100, "logs the transfer amount");
    // check the allowance
    let allowance = await tokenInstance.allowance(accounts[0], accounts[1]);
    assert.equal(
      allowance.toNumber(),
      100,
      "stores the allowance for delegated transfer"
    );
  });
  // handling the delegated transfer
  it("handles the delegated transfer", async () => {
    let tokenInstance = await Token.deployed();
    // accounts
    let fromAccount = accounts[2];
    let toAccount = accounts[3];
    let spendingAccount = accounts[4];
    // transfer some tokens to the from account
    await tokenInstance.transfer(fromAccount, 100, {
      from: accounts[0],
    });
    // approve spending accounts to spend 10 tokens from (fromAccount)
    await tokenInstance.approve(spendingAccount, 10, {
      from: fromAccount,
    });
    // try transfering something larger than senders balance
    try {
      await tokenInstance.transferFrom(fromAccount, toAccount, 9999, {
        from: spendingAccount,
      });
      assert.fail("fake transaction should've thrown an error");
    } catch (error) {
      assert(
        error.message.includes("revert"),
        "cannot transfer value larger than the balance"
      );
    }
    // try transfering something larger than the approved amount
    try {
      await tokenInstance.transferFrom(fromAccount, toAccount, 20, {
        from: spendingAccount,
      });
      assert.fail("should throw an error");
    } catch (error) {
      assert(
        error.message.includes("revert"),
        "cannot transfer value larger than the approved amount"
      );
    }
    // test the returned value (succeed or not)
    let success = await tokenInstance.transferFrom.call(
      fromAccount,
      toAccount,
      10,
      {
        from: spendingAccount,
      }
    );
    assert.equal(success, true);
    // test the transfer event
    let receipt = await tokenInstance.transferFrom(fromAccount, toAccount, 10, {
      from: spendingAccount,
    });
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
      fromAccount,
      "logs the account the tokens are transfered from"
    );
    assert.equal(
      receipt.logs[0].args._to,
      toAccount,
      "logs the account the tokens are transfered to"
    );
    assert.equal(receipt.logs[0].args._value, 10, "logs the transfer amount");
    // test changing the balance of sending account
    let fromBalance = await tokenInstance.balanceOf(fromAccount);
    assert.equal(
      fromBalance.toNumber(),
      90,
      "deducts the amount from the sending account"
    );
    // test changing the balance of receiving account
    let toBalance = await tokenInstance.balanceOf(toAccount);
    assert.equal(
      toBalance.toNumber(),
      10,
      "adds the amount to the receiving account"
    );
    // test the allowance
    let allowance = await tokenInstance.allowance(fromAccount, spendingAccount);
    assert.equal(
      allowance.toNumber(),
      0,
      "deducts the amount from the allowance"
    );
  });
});

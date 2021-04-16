const Sale = artifacts.require("./Sale");
const Token = artifacts.require("./Token");

contract("Sale", async (accounts) => {
  let saleInstance;
  let tokenInstance;
  let admin = accounts[0];
  let buyer = accounts[1];
  let tokenPrice = 1000000000000000; // token price in WEI (this value equals 0.001 ETHER)
  let tokensAvailable = 750000; // 75% of the total supply
  // testing the values of the contract
  it("initializes the contract with the correct values", async () => {
    saleInstance = await Sale.deployed();
    // check if we have an address (address is not equal to 0x0)
    let address = saleInstance.address;
    assert.notEqual(address, 0x0, "has contract address");
    // check the token contract address
    let tokenAddress = await saleInstance.tokenContract();
    assert.notEqual(tokenAddress, 0x0, "has token contract address");
    // testing the token price
    let price = await saleInstance.tokenPrice();
    assert.equal(price, tokenPrice, "token price is correct");
  });
  // testing buying tokens
  it("facilitates token buying", async () => {
    // grab token instance
    tokenInstance = await Token.deployed();
    // grab sale instance
    saleInstance = await Sale.deployed();
    // provision 75% of tokens to the token sale contract
    let provisionReceipt = await tokenInstance.transfer(
      saleInstance.address,
      tokensAvailable,
      { from: admin }
    );
    // check buying tokens
    let numberOfTokens = 10;
    let value = numberOfTokens * tokenPrice; // the value of tokens in WEI
    let receipt = await saleInstance.buyTokens(numberOfTokens, {
      from: buyer,
      value: value,
    });
    // check the sell event
    assert.equal(receipt.logs.length, 1, "triggers one event");
    assert.equal(receipt.logs[0].event, "Sell", "should be the 'Sell' event");
    assert.equal(
      receipt.logs[0].args._buyer,
      buyer,
      "logs the account that purchased the tokens"
    );
    assert.equal(
      receipt.logs[0].args._amount,
      numberOfTokens,
      "logs the number of tokens purchased"
    );
    // check for the number of tokens sold
    let amount = await saleInstance.tokensSold();
    assert.equal(
      amount.toNumber(),
      numberOfTokens,
      "increments the number of tokens sold"
    );
    // check if the buyer balance is correct after the successful transfer
    let buyerBalance = await tokenInstance.balanceOf(buyer);
    assert.equal(buyerBalance.toNumber(), numberOfTokens);
    // check if the token sale balance is correct after the successful transfer
    let SaleBalance = await tokenInstance.balanceOf(saleInstance.address);
    assert.equal(SaleBalance.toNumber(), tokensAvailable - numberOfTokens);
    // try to buy tokens different from the ether value
    try {
      await saleInstance.buyTokens(numberOfTokens, { from: buyer, value: 1 });
      assert.fail(
        "should throw an error because user trying to underpay for the tokens"
      );
    } catch (error) {
      assert(
        error.message.includes("revert"),
        "msg.value must equal number of tokens in wei"
      );
    }
    // try purchase tokens more than the available in the contract
    try {
      await saleInstance.buyTokens(800000, { from: buyer, value: 1 });
      assert.fail(
        "should throw an error because user trying to buy tokens more than the available"
      );
    } catch (error) {
      assert(
        error.message.includes("revert"),
        "cannot purchase more tokens than the available"
      );
    }
  });
  // testing ending the token sale
  it("ends token sale", async () => {
    // instances
    let tokenInstance = await Token.deployed();
    let saleInstance = await Sale.deployed();
    // try to end the token sale from a non admin account
    try {
      await saleInstance.endSale({ from: buyer });
      assert.fail("should throw an error due to ending sale by non admin");
    } catch (error) {
      assert(error.message.includes("revert"), "must be an admin to end sale");
    }
    // try to end sale by admin
    let endReceipt = await saleInstance.endSale({ from: admin });
    let unsoldBalance = await tokenInstance.balanceOf(admin);
    assert.equal(
      unsoldBalance.toNumber(),
      999990,
      "returns all unsold tokens to the admin"
    );
    // testing destroying the contract by checking one of the state variable (should be reset to default)
    // Check that the contract has no balance
    let endBalance = await web3.eth.getBalance(saleInstance.address);
    assert.equal(endBalance, 0, "contract has no balance");
  });
});

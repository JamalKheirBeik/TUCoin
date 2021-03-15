const MyToken = artifacts.require("MyToken");
const Sale = artifacts.require("Sale");

module.exports = async (deployer) => {
  // variables
  let totalSupply = 1000000;
  let tokenPrice = 1000000000000000;
  // deployments
  await deployer.deploy(MyToken, totalSupply);
  await deployer.deploy(Sale, MyToken.address, tokenPrice);
};

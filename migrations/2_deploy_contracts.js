const Token = artifacts.require("Token");
const Sale = artifacts.require("Sale");

module.exports = async (deployer) => {
  // variables
  let totalSupply = 1000000;
  let tokenPrice = 1000000000000000;
  // deployments
  await deployer.deploy(Token, totalSupply);
  await deployer.deploy(Sale, Token.address, tokenPrice);
};

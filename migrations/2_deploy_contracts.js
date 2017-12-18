var TokenizedTicket = artifacts.require("./TokenizedTicket.sol");


module.exports = function(deployer) {
  deployer.deploy(TokenizedTicket);
};

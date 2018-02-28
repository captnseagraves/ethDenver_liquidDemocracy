var liquidDemocracy = artifacts.require("./LiquidDemocracyPoll.sol");
// var LDPollInterface = artifacts.require("./LDPollInterface.sol");


module.exports = function(deployer) {
  deployer.deploy(liquidDemocracy);
  // deployer.deploy(LDPollInterface);
};

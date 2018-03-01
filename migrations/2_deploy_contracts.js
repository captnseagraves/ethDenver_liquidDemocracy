var LiquidDemocracyPoll = artifacts.require("./LiquidDemocracyPoll.sol");
var LiquidDemocracyForum = artifacts.require("./LiquidDemocracyForum.sol");


module.exports = function(deployer) {
  deployer.deploy(LiquidDemocracyPoll);
  deployer.deploy(LiquidDemocracyForum);
};

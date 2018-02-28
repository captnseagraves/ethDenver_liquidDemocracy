var liquidDemocracy = artifacts.require("./LiquidDemocracyPoll.sol");


module.exports = function(deployer) {
  deployer.deploy(liquidDemocracy);
};

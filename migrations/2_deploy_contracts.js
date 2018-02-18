var liquidDemocracy = artifacts.require("./iterative_liquidDemocracy.sol");


module.exports = function(deployer) {
  deployer.deploy(liquidDemocracy);
};

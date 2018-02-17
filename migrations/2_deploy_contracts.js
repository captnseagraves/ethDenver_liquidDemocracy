var liquidDemocracy = artifacts.require("./liquidDemocracy.sol");


module.exports = function(deployer) {
  deployer.deploy(liquidDemocracy);
};

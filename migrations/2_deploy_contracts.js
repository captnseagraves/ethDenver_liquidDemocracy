const Web3 = require("web3");

var LiquidDemocracyPoll = artifacts.require("./LiquidDemocracyPoll.sol");
var LiquidDemocracyForum = artifacts.require("./LiquidDemocracyForum.sol");

const EMPTY_BYTES32_HASH = "0x" + web3._extend.utils.padRight("0", 64)




module.exports = function(deployer) {
  deployer.deploy(LiquidDemocracyForum, 8, EMPTY_BYTES32_HASH, 2, 1);
};

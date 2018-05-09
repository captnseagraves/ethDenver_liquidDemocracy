var LiquidDemocracyPoll = artifacts.require("./LiquidDemocracyPoll.sol");
var LiquidDemocracyForum = artifacts.require("./LiquidDemocracyForum.sol");

const Web3 = require("web3");


const EMPTY_BYTES32_HASH = "0x" + web3._extend.utils.padRight("0", 64)
  const EIGHT_OPTION_VOTE_ARRAY = '0xff80000000000000000000000000000000000000000000000000000000000000'


module.exports = function(deployer) {
  deployer.deploy(LiquidDemocracyForum, EIGHT_OPTION_VOTE_ARRAY, EMPTY_BYTES32_HASH, 5, 30);
};

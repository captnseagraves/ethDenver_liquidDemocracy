// import BigNumber from "bignumber.js";
const BigNumber = require("bignumber.js");

const chai = require("chai");
const ChaiAsPromised = require("chai-as-promised");
const ChaiBigNumber = require("chai-bignumber");
const Web3 = require("web3");
const ABIDecoder = require("abi-decoder");
const timestamp = require("unix-timestamp");



const LiquidDemocracy = artifacts.require("./liquidDemocracy.sol");

const INVALID_OPCODE = "invalid opcode";
const REVERT_ERROR = "revert";

const EMPTY_BYTES32_HASH = "0x" + web3._extend.utils.padRight("0", 64)

const expect = chai.expect;
chai.config.includeStack = true;
chai.use(ChaiBigNumber());
chai.use(ChaiAsPromised);
chai.should();

BigNumber.config({  EXPONENTIAL_AT: 1000  });

// const LogApproval = require("./utils/logs").LogApproval;

// Import truffle contract instance
const liquidDemocracyContract = artifacts.require("liquidDemocracy");

// Initialize ABI Decoder for deciphering log receipts
ABIDecoder.addABI(liquidDemocracyContract.abi);

contract("Liquid Democracy Proposal", (ACCOUNTS) => {
    let liquidProposal;

    const NFT_NAME = "Example NFT";
    const NFT_SYMBOL = "ENT";

    const PROPOSAL_OWNER = ACCOUNTS[0];
    const VOTER_1 = ACCOUNTS[1];
    const VOTER_2 = ACCOUNTS[2];
    const VOTER_3 = ACCOUNTS[3];

    const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

    const TX_DEFAULTS = { from: PROPOSAL_OWNER, gas: 4000000 };

    const deployProposal = async () => {

        const instance =
            await liquidDemocracyContract.new(
                timestamp.fromDate(new Date(2018, 02, 17, 17, 00, 00)), timestamp.fromDate(new Date(2018, 02, 17, 18, 00, 00)), timestamp.fromDate(new Date(2018, 02, 17, 19, 00, 00)),
                50, EMPTY_BYTES32_HASH, TX_DEFAULTS);

        // The generated contract typings we use ingest raw Web3 contract instances,
        // so we create a Web3 contract instance from the Truffle contract instance

        const web3ContractInstance =
            web3.eth.contract(instance.abi).at(instance.address);

        liquidProposal = new LiquidDemocracy(
            web3ContractInstance, TX_DEFAULTS);


    };


    before(deployProposal);

    describe("liquid Democracy Proposal", () => {
        it("should deploy contract", async () => {
          console.log('now', timestamp.now());
          console.log('5:00', timestamp.fromDate(new Date(2018, 02, 17, 17, 00, 00)));

          console.log(await liquidProposal.delegatePeriodEnd.call())


        });
    });




});

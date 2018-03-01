// import BigNumber from "bignumber.js";
const BigNumber = require("bignumber.js");

const chai = require("chai");
const ChaiAsPromised = require("chai-as-promised");
const ChaiBigNumber = require("chai-bignumber");
const Web3 = require("web3");
const ABIDecoder = require("abi-decoder");
const timestamp = require("unix-timestamp");



const LiquidDemocracyPoll = artifacts.require("./LiquidDemocracyPoll.sol");
const LiquidDemocracyForum = artifacts.require("./LiquidDemocracyForum.sol");


const INVALID_OPCODE = "invalid opcode";
const REVERT_ERROR = "revert";

const EMPTY_BYTES32_HASH = "0x" + web3._extend.utils.padRight("0", 64)
const ONES_BYTES32_HASH = "0x" + web3._extend.utils.padRight("1", 64)


const expect = chai.expect;
chai.config.includeStack = true;
chai.use(ChaiBigNumber());
chai.use(ChaiAsPromised);
chai.should();

BigNumber.config({  EXPONENTIAL_AT: 1000  });


// const LogApproval = require("./utils/logs").LogApproval;

// Import truffle contract instance
const liquidDemocracyPollContract = artifacts.require("LiquidDemocracyPoll");
const liquidDemocracyForumContract = artifacts.require("LiquidDemocracyForum");


// Initialize ABI Decoder for deciphering log receipts
ABIDecoder.addABI(liquidDemocracyForumContract.abi);

contract("Liquid Democracy Forum", (ACCOUNTS) => {
    let liquidForum;

    const PROPOSAL_OWNER = ACCOUNTS[0];
    const VOTER_1 = ACCOUNTS[1];
    const VOTER_2 = ACCOUNTS[2];
    const VOTER_3 = ACCOUNTS[3];
    const VOTER_4 = ACCOUNTS[4];
    const VOTER_5 = ACCOUNTS[5];
    const VOTER_6 = ACCOUNTS[6];
    const VOTER_7 = ACCOUNTS[7];
    const VOTER_8 = ACCOUNTS[8];
    const VOTER_9 = ACCOUNTS[9];

    // MUST ADJUST TIME TO SUIT TESTS. OTHERWISE TESTS WILL FAIL.

    const DELEGATE_PERIOD = timestamp.fromDate(new Date('2018-03-01T10:24:00'));
    const VOTE_PERIOD = timestamp.fromDate(new Date('2018-03-01T11:24:00'))

    const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
    const EIGHT_OPTION_VOTE_ARRAY = '0xff80000000000000000000000000000000000000000000000000000000000000'
    const NINE_OPTION_VOTE_ARRAY = '0xffc0000000000000000000000000000000000000000000000000000000000000'


    const TX_DEFAULTS = { from: PROPOSAL_OWNER, gas: 4000000 };

    const deployForum = async () => {

        const instance =
            await liquidDemocracyForumContract.new( EIGHT_OPTION_VOTE_ARRAY, EMPTY_BYTES32_HASH, 5, TX_DEFAULTS);

        const web3ContractInstance =
            web3.eth.contract(instance.abi).at(instance.address);

        liquidForum = new LiquidDemocracyForum(
            web3ContractInstance, TX_DEFAULTS);


    };


    before(deployForum);

    describe("Create Forum", () => {


      it("should return correct delegationDepth", async () => {

        await expect( liquidForum.delegationDepth.call()).to.eventually.bignumber.equal(5);

      });

      it("should return correct topicMetaData", async () => {

        await expect( liquidForum.topicMetaData.call()).to.eventually.equal(EMPTY_BYTES32_HASH);

        });

      it("should return correct validtopicArray", async () => {

        await expect( liquidForum.validTopicArray.call()).to.eventually.equal(EIGHT_OPTION_VOTE_ARRAY);

        });
    });

    describe("#createNewTopic()", () => {


      it("should return new topic values and metadata", async () => {

        await liquidForum.createNewTopic.sendTransaction(NINE_OPTION_VOTE_ARRAY, ONES_BYTES32_HASH, TX_DEFAULTS)

        await expect( liquidForum.validTopicArray.call()).to.eventually.equal(NINE_OPTION_VOTE_ARRAY);

        await expect( liquidForum.topicMetaData.call()).to.eventually.equal(ONES_BYTES32_HASH);

      });

    });

    describe("#createPoll()", () => {


      it("should log new poll", async () => {

      let txHash = await liquidForum.createPoll.sendTransaction(DELEGATE_PERIOD, VOTE_PERIOD, 75, 51, EMPTY_BYTES32_HASH, EIGHT_OPTION_VOTE_ARRAY, 3, TX_DEFAULTS)

      console.log(txHash);

      //
      //         const logExpected = LogTicketApproved(mintableNft.address, 0);
      //
      //         expect(ticketApprovedLog).to.deep.equal(logExpected);

        await web3.eth.getTransactionReceipt(txHash, (err, result) => {
          const [newPollLog] = ABIDecoder.decodeLogs(result.logs);

            console.log(newPollLog);

            })

      });

    });

});

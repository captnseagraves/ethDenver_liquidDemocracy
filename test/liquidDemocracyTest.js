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


const LogNewPoll = require("./utils/logs").LogNewPoll;

// Import truffle contract instance
const liquidDemocracyPollContract = artifacts.require("LiquidDemocracyPoll");
const liquidDemocracyForumContract = artifacts.require("LiquidDemocracyForum");


// Initialize ABI Decoder for deciphering log receipts
ABIDecoder.addABI(liquidDemocracyForumContract.abi);

contract("Liquid Democracy Forum", (ACCOUNTS) => {
    let liquidForum;
    let liquidPoll;

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

    const DELEGATE_PERIOD = timestamp.fromDate(new Date('2018-03-03T10:24:00'));
    const VOTE_PERIOD = timestamp.fromDate(new Date('2018-03-03T11:24:00'))

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

            // console.log('instance', instance);
            // console.log('liquidForum', liquidForum);
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

        await web3.eth.getTransactionReceipt(txHash, async (err, result) => {
          const [newPollLog] = ABIDecoder.decodeLogs(result.logs);

          let newPollAddress = await liquidForum.pollList.call(0);

          const logExpected =
                      LogNewPoll(newPollAddress, liquidForum.address, 0, 'newPoll');

                  expect(newPollLog).to.deep.equal(logExpected);
           });

      let liquidPollAddress = await liquidForum.pollList.call(0);

      const contractInstance = await web3.eth.contract(LiquidDemocracyPoll.abi).at(liquidPollAddress);

      liquidPoll = await new LiquidDemocracyPoll(
               contractInstance, TX_DEFAULTS);
      });

  });

  describe("LiquidDemocracyPoll Tests", () => {

    it("should return correct delegationPeriodEnd", async () => {

    await expect( liquidPoll.delegatePeriodEnd.call()).to.eventually.bignumber.equal(DELEGATE_PERIOD);

    });


    it("should return correct votePeriodEnd", async () => {

    await expect( liquidPoll.votePeriodEnd.call()).to.eventually.bignumber.equal(VOTE_PERIOD);

    });

    it("should return correct delegationDepth", async () => {

    await expect( liquidPoll.delegationDepth.call()).to.eventually.bignumber.equal(5);

    });

    it("should return correct pctQuorum", async () => {

      await expect( liquidPoll.pctQuorum.call()).to.eventually.bignumber.equal(75);

    });

    it("should return correct pctThreshold", async () => {

      await expect( liquidPoll.pctThreshold.call()).to.eventually.bignumber.equal(51);

    });

    it("should return correct proposalMetaData", async () => {

      await expect( liquidPoll.proposalMetaData.call()).to.eventually.equal(EMPTY_BYTES32_HASH);

    });

    it("should return correct validVoteArray", async () => {

      await expect( liquidPoll.validVoteArray.call()).to.eventually.equal(EIGHT_OPTION_VOTE_ARRAY);

    });
  });

  describe("#registerVoter()", () => {
    it("should register new user", async () => {

      await liquidPoll.registerVoter.sendTransaction(VOTER_1, TX_DEFAULTS)

      await expect( liquidPoll._isRegisteredVoter.call(VOTER_1)).to.eventually.equal(true);

      await liquidPoll.registerVoter.sendTransaction(VOTER_2, TX_DEFAULTS)
      await liquidPoll.registerVoter.sendTransaction(VOTER_4, TX_DEFAULTS)
      await liquidPoll.registerVoter.sendTransaction(VOTER_5, TX_DEFAULTS)
      await liquidPoll.registerVoter.sendTransaction(VOTER_6, TX_DEFAULTS)
      await liquidPoll.registerVoter.sendTransaction(VOTER_7, TX_DEFAULTS)
      await liquidPoll.registerVoter.sendTransaction(VOTER_8, TX_DEFAULTS)
      await liquidPoll.registerVoter.sendTransaction(VOTER_9, TX_DEFAULTS)


    });

    it("should fail when registering a second time", async () => {

      await expect(liquidPoll.registerVoter.sendTransaction(VOTER_1, TX_DEFAULTS)).to.eventually.be.rejectedWith(REVERT_ERROR);

    });

  });

  describe("#becomeDelegate()", () => {
    it("should allow registered user to be a delegate", async () => {

      await liquidPoll.becomeDelegate.sendTransaction(VOTER_1, TX_DEFAULTS)

      await expect( liquidPoll._isValidDelegate.call(VOTER_1)).to.eventually.equal(true);

      await liquidPoll.becomeDelegate.sendTransaction(VOTER_7, TX_DEFAULTS)
      await liquidPoll.becomeDelegate.sendTransaction(VOTER_8, TX_DEFAULTS)
      await liquidPoll.becomeDelegate.sendTransaction(VOTER_9, TX_DEFAULTS)

    });

    it("should fail when unregistered user tries to become delegate", async () => {

      await expect(liquidPoll.becomeDelegate.sendTransaction(VOTER_3, TX_DEFAULTS)).to.eventually.be.rejectedWith(REVERT_ERROR);

    });
  });

  //
  //
  // Need to set up test for delegation and voting periods. I know they work properly, but need explicit test.
  //
  //

  describe("#vote()", () => {
    it("should allow user to vote", async () => {

      await liquidPoll.vote.sendTransaction(VOTER_1, 1, TX_DEFAULTS)

      await expect( liquidPoll.readVote.call(VOTER_1, 0)).to.eventually.bignumber.equal(1);

      await liquidPoll.vote.sendTransaction(VOTER_2, 2, TX_DEFAULTS)
      await liquidPoll.vote.sendTransaction(VOTER_4, 4, TX_DEFAULTS)
      await liquidPoll.vote.sendTransaction(VOTER_5, 5, TX_DEFAULTS)
      await liquidPoll.vote.sendTransaction(VOTER_6, 6, TX_DEFAULTS)
      await expect( liquidPoll.readVote.call(VOTER_6, 0)).to.eventually.bignumber.equal(6);

      await liquidPoll.vote.sendTransaction(VOTER_7, 7, TX_DEFAULTS)
      await liquidPoll.vote.sendTransaction(VOTER_8, 8, TX_DEFAULTS)
      await liquidPoll.vote.sendTransaction(VOTER_9, 3, TX_DEFAULTS)

    });

    it("should fail when unregistered user tries to vote", async () => {

      await expect(liquidPoll.vote.sendTransaction(VOTER_3, 3, TX_DEFAULTS)).to.eventually.be.rejectedWith(REVERT_ERROR);

    });

  });




  describe("#delegateVote()", () => {
    it("should allow user to delegate their vote", async () => {

      await liquidPoll.registerVoter.sendTransaction(VOTER_3, TX_DEFAULTS)

      await liquidPoll.delegateVote.sendTransaction(VOTER_3, VOTER_7, TX_DEFAULTS)
      await liquidPoll.withdrawDirectVote.sendTransaction(VOTER_5, TX_DEFAULTS)
      await liquidPoll.delegateVote.sendTransaction(VOTER_5, VOTER_9, TX_DEFAULTS)
      await liquidPoll.withdrawDirectVote.sendTransaction(VOTER_6, TX_DEFAULTS)
      await liquidPoll.delegateVote.sendTransaction(VOTER_6, VOTER_7, TX_DEFAULTS)
      await liquidPoll.withdrawDirectVote.sendTransaction(VOTER_7, TX_DEFAULTS)
      await liquidPoll.delegateVote.sendTransaction(VOTER_7, VOTER_9, TX_DEFAULTS)
      await liquidPoll.withdrawDirectVote.sendTransaction(VOTER_9, TX_DEFAULTS)
      await liquidPoll.delegateVote.sendTransaction(VOTER_9, VOTER_8, TX_DEFAULTS)

      await expect( liquidPoll.readVote.call(VOTER_3, 0)).to.eventually.bignumber.equal(8);
      await expect( liquidPoll.readVote.call(VOTER_5, 0)).to.eventually.bignumber.equal(8);
      await expect( liquidPoll.readVote.call(VOTER_6, 0)).to.eventually.bignumber.equal(8);
      await expect( liquidPoll.readVote.call(VOTER_7, 0)).to.eventually.bignumber.equal(8);
      await expect( liquidPoll.readVote.call(VOTER_9, 0)).to.eventually.bignumber.equal(8);

      await expect( liquidPoll.readDelegate.call(VOTER_3)).to.eventually.bignumber.equal(VOTER_7);
      await expect( liquidPoll.readDelegate.call(VOTER_5)).to.eventually.bignumber.equal(VOTER_9);
      await expect( liquidPoll.readDelegate.call(VOTER_6)).to.eventually.bignumber.equal(VOTER_7);
      await expect( liquidPoll.readDelegate.call(VOTER_7)).to.eventually.bignumber.equal(VOTER_9);
      await expect( liquidPoll.readDelegate.call(VOTER_9)).to.eventually.bignumber.equal(VOTER_8);

      await expect( liquidPoll.readEndVoter.call(VOTER_3, 0)).to.eventually.bignumber.equal(VOTER_8);
      await expect( liquidPoll.readEndVoter.call(VOTER_5, 0)).to.eventually.bignumber.equal(VOTER_8);
      await expect( liquidPoll.readEndVoter.call(VOTER_6, 0)).to.eventually.bignumber.equal(VOTER_8);
      await expect( liquidPoll.readEndVoter.call(VOTER_7, 0)).to.eventually.bignumber.equal(VOTER_8);
      await expect( liquidPoll.readEndVoter.call(VOTER_9, 0)).to.eventually.bignumber.equal(VOTER_8);

    });
  });

  describe("#revokeDelegation()", () => {
    it("should allow user to revoke their delegation", async () => {

      await liquidPoll.revokeDelegation.sendTransaction(VOTER_3, TX_DEFAULTS)

      await expect( liquidPoll.readVote.call(VOTER_3, 0)).to.eventually.bignumber.equal(0);

      await expect( liquidPoll.readEndVoter.call(VOTER_3, 0)).to.eventually.bignumber.equal(VOTER_3);

    });

  });

  describe("#tally()", () => {
    it("should correctly tally votes from poll", async () => {

      let result = await liquidPoll.tally.call()

        await expect(result[0][0].toNumber()).to.equal(1);
        await expect(result[0][1].toNumber()).to.equal(1);
        await expect(result[0][2].toNumber()).to.equal(1);
        await expect(result[0][4].toNumber()).to.equal(1);
        await expect(result[0][8].toNumber()).to.equal(5);

        await expect(result[1].toNumber()).to.equal(8);
        await expect(result[2].toNumber()).to.equal(1);

    });
  });

  describe("#finalDecision()", () => {
    it("should correctly show final decision of poll", async () => {

      let result = await liquidPoll.finalDecision.call()

        await expect(result[0].toNumber()).to.equal(8);
        await expect(result[1].toNumber()).to.equal(5);

    });
  });

  describe("#registerVoter_Forum()", () => {
    it("should register new user in forum", async () => {

      await liquidForum.registerVoter_Forum.sendTransaction(VOTER_1, TX_DEFAULTS)

      await expect( liquidForum._isRegisteredVoter.call(VOTER_1)).to.eventually.equal(true);

      await liquidForum.registerVoter_Forum.sendTransaction(VOTER_2, TX_DEFAULTS)
      await liquidForum.registerVoter_Forum.sendTransaction(VOTER_4, TX_DEFAULTS)
      await liquidForum.registerVoter_Forum.sendTransaction(VOTER_5, TX_DEFAULTS)
      await liquidForum.registerVoter_Forum.sendTransaction(VOTER_6, TX_DEFAULTS)
      await liquidForum.registerVoter_Forum.sendTransaction(VOTER_7, TX_DEFAULTS)
      await liquidForum.registerVoter_Forum.sendTransaction(VOTER_8, TX_DEFAULTS)
      await liquidForum.registerVoter_Forum.sendTransaction(VOTER_9, TX_DEFAULTS)


    });

    it("should fail when registering a second time", async () => {

      await expect(liquidForum.registerVoter_Forum.sendTransaction(VOTER_1, TX_DEFAULTS)).to.eventually.be.rejectedWith(REVERT_ERROR);

    });

  });

  describe("#becomeDelegateForTopic()", () => {
    it("should allow registered user to become a delegate for a particular topic", async () => {

        await liquidForum.becomeDelegateForTopic.sendTransaction(VOTER_1, 1, TX_DEFAULTS)
        await expect( liquidForum._isValidDelegateForTopic.call(VOTER_1, 1)).to.eventually.equal(true);

        await liquidForum.becomeDelegateForTopic.sendTransaction(VOTER_7, 7, TX_DEFAULTS)
        await expect( liquidForum._isValidDelegateForTopic.call(VOTER_7, 7)).to.eventually.equal(true);

        await liquidForum.becomeDelegateForTopic.sendTransaction(VOTER_8, 8, TX_DEFAULTS)
        await expect( liquidForum._isValidDelegateForTopic.call(VOTER_8, 8)).to.eventually.equal(true);

        await liquidForum.becomeDelegateForTopic.sendTransaction(VOTER_9, 3, TX_DEFAULTS)
        await expect( liquidForum._isValidDelegateForTopic.call(VOTER_9, 3)).to.eventually.equal(true);
      });

    it("should fail when unregistered user tries to become delegate", async () => {

      await expect(liquidForum.becomeDelegateForTopic.sendTransaction(VOTER_3, 3, TX_DEFAULTS)).to.eventually.be.rejectedWith(REVERT_ERROR);

    });
  });

  describe("#withdrawAsDelegateForTopic()", () => {
    it("should allow registered user to become a delegate for a particular topic", async () => {

        await liquidForum.withdrawAsDelegateForTopic.sendTransaction(VOTER_9, 3, TX_DEFAULTS)
        await expect( liquidForum._isValidDelegateForTopic.call(VOTER_9, 3)).to.eventually.equal(false);
      });

    it("should fail when unregistered user tries to become delegate", async () => {

      await expect(liquidForum.withdrawAsDelegateForTopic.sendTransaction(VOTER_3, 3, TX_DEFAULTS)).to.eventually.be.rejectedWith(REVERT_ERROR);

    });
  });

  describe("#delegateVote_Forum()", () => {
    it("should allow user to delegate their vote for a topic", async () => {

      await liquidForum.registerVoter_Forum.sendTransaction(VOTER_3, TX_DEFAULTS)

      await liquidForum.delegateVote_Forum.sendTransaction(VOTER_3, 1, VOTER_1, TX_DEFAULTS)
      await liquidForum.delegateVote_Forum.sendTransaction(VOTER_5, 7, VOTER_7, TX_DEFAULTS)
      await liquidForum.delegateVote_Forum.sendTransaction(VOTER_6, 7, VOTER_7, TX_DEFAULTS)
      await liquidForum.delegateVote_Forum.sendTransaction(VOTER_7, 8, VOTER_8, TX_DEFAULTS)
      // await liquidForum.withdrawDirectVote.sendTransaction(VOTER_9, TX_DEFAULTS)
      await liquidForum.delegateVote_Forum.sendTransaction(VOTER_9, 8, VOTER_8, TX_DEFAULTS)

      await expect( liquidForum.readDelegate_Forum.call(VOTER_3, 1)).to.eventually.bignumber.equal(VOTER_1);
      await expect( liquidForum.readDelegate_Forum.call(VOTER_5, 7)).to.eventually.bignumber.equal(VOTER_7);
      await expect( liquidForum.readDelegate_Forum.call(VOTER_6, 7)).to.eventually.bignumber.equal(VOTER_7);
      await expect( liquidForum.readDelegate_Forum.call(VOTER_7, 8)).to.eventually.bignumber.equal(VOTER_8);
      await expect( liquidForum.readDelegate_Forum.call(VOTER_9, 8)).to.eventually.bignumber.equal(VOTER_8);

    });
  });

});

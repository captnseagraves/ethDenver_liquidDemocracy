// import BigNumber from "bignumber.js";
const BigNumber = require("bignumber.js");

const chai = require("chai");
const ChaiAsPromised = require("chai-as-promised");
const ChaiBigNumber = require("chai-bignumber");
const Web3 = require("web3");
const ABIDecoder = require("abi-decoder");
const timestamp = require("unix-timestamp");
const timekeeper = require('timekeeper');


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
    let dei;

    const OWNER = ACCOUNTS[0];
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

    // const DELEGATE_PERIOD = timestamp.fromDate(new Date('2018-03-03T10:24:00'));

    timestamp.round = true;

    let time = timestamp.now()

        timekeeper.freeze(time);

        // console.log('time1', Date.now());


    const DELEGATE_PERIOD = timestamp.add(time, "1d");

    // const VOTE_PERIOD = timestamp.fromDate(new Date('2018-03-03T11:24:00'))
    const VOTE_PERIOD = timestamp.add(time, "2d");

    const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
    const EIGHT_OPTION_VOTE_ARRAY = '0xff80000000000000000000000000000000000000000000000000000000000000'
    const NINE_OPTION_VOTE_ARRAY = '0xffc0000000000000000000000000000000000000000000000000000000000000'


    const TX_DEFAULTS = { from: OWNER, gas: 4000000 };

    const deployForum = async () => {

        const instance =
            await liquidDemocracyForumContract.new( EIGHT_OPTION_VOTE_ARRAY, EMPTY_BYTES32_HASH, 5, -1, { from: OWNER, gas: 4000000 });

        const web3ContractInstance =
            web3.eth.contract(instance.abi).at(instance.address);

        liquidForum = new LiquidDemocracyForum(
            web3ContractInstance, { from: OWNER, gas: 4000000 });

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


      it("should return correct delegationExpiration", async () => {

        dei = await liquidForum.delegationExpiration.call();
        let expectedDEI = timestamp.add(time, "-1d")

        // console.log("ExpectedDEI", expectedDEI)
        // console.log("Returned DEI", dei.toNumber());

        expect(dei.toNumber()).to.be.within(expectedDEI - 2, expectedDEI + 2)
      });
    });

    describe("#resetDelegationExpirationInterval()", () => {

      it("should return delegationExpirationInterval greater than previous DEI", async () => {

        let newTime = timestamp.add(time, "+30d")

        timekeeper.freeze(newTime);
        // console.log('time2', Date.now());

        await liquidForum.resetDelegationExpirationInterval.sendTransaction(30, { from: OWNER, gas: 4000000 })

        let newDei = await liquidForum.delegationExpiration.call();

        // console.log("newTime", newTime);
        // console.log('newDei', newDei.toNumber());

        expect(newDei.toNumber()).to.be.within(newTime - 2, newTime + 2);

        timekeeper.freeze(time);
        // console.log('time3', Date.now());

      });

    });

    describe("#createNewTopic()", () => {


      it("should return new topic values and metadata", async () => {

        await liquidForum.createNewTopic.sendTransaction(NINE_OPTION_VOTE_ARRAY, ONES_BYTES32_HASH, { from: OWNER, gas: 4000000 })

        await expect( liquidForum.validTopicArray.call()).to.eventually.equal(NINE_OPTION_VOTE_ARRAY);

        await expect( liquidForum.topicMetaData.call()).to.eventually.equal(ONES_BYTES32_HASH);

      });

    });

    describe("#createPoll()", () => {


      it("should log new poll", async () => {

      let txHash = await liquidForum.createPoll.sendTransaction(DELEGATE_PERIOD, VOTE_PERIOD, 75, 51, EMPTY_BYTES32_HASH, EIGHT_OPTION_VOTE_ARRAY, 3, { from: OWNER, gas: 4000000 })

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
               contractInstance, { from: OWNER, gas: 4000000 });
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

      await liquidPoll.registerVoter.sendTransaction({ from: VOTER_1, gas: 4000000 })

      await expect( liquidPoll._isRegisteredVoter.call(VOTER_1)).to.eventually.equal(true);

      await liquidPoll.registerVoter.sendTransaction({ from: VOTER_2, gas: 4000000 })
      await liquidPoll.registerVoter.sendTransaction({ from: VOTER_4, gas: 4000000 })
      await liquidPoll.registerVoter.sendTransaction({ from: VOTER_5, gas: 4000000 })
      await liquidPoll.registerVoter.sendTransaction({ from: VOTER_6, gas: 4000000 })
      await liquidPoll.registerVoter.sendTransaction({ from: VOTER_7, gas: 4000000 })
      await liquidPoll.registerVoter.sendTransaction({ from: VOTER_8, gas: 4000000 })
      await liquidPoll.registerVoter.sendTransaction({ from: VOTER_9, gas: 4000000 })


    });

    it("should fail when registering a second time", async () => {

      await expect(liquidPoll.registerVoter.sendTransaction({ from: VOTER_1, gas: 4000000 })).to.eventually.be.rejectedWith(REVERT_ERROR);

    });

  // test for registering after voting period has ended

  });

  describe("#becomeDelegate()", () => {
    it("should allow registered user to be a delegate", async () => {

      await liquidPoll.becomeDelegate.sendTransaction({ from: VOTER_1, gas: 4000000 })

      await expect( liquidPoll._isValidDelegate.call(VOTER_1)).to.eventually.equal(true);

      await liquidPoll.becomeDelegate.sendTransaction({ from: VOTER_7, gas: 4000000 })
      await liquidPoll.becomeDelegate.sendTransaction({ from: VOTER_8, gas: 4000000 })
      await liquidPoll.becomeDelegate.sendTransaction({ from: VOTER_9, gas: 4000000 })

    });

    it("should fail when unregistered user tries to become delegate", async () => {

      await expect(liquidPoll.becomeDelegate.sendTransaction({ from: VOTER_3, gas: 4000000 })).to.eventually.be.rejectedWith(REVERT_ERROR);

    });

    // test for becoming delegate after delegate period has ended

  });

  describe("#vote()", () => {
    it("should allow user to vote", async () => {

      await liquidPoll.vote.sendTransaction(1, { from: VOTER_1, gas: 4000000 })

      await expect( liquidPoll.readVote.call(VOTER_1, 0)).to.eventually.bignumber.equal(1);

      await liquidPoll.vote.sendTransaction(2, { from: VOTER_2, gas: 4000000 })
      await liquidPoll.vote.sendTransaction(4, { from: VOTER_4, gas: 4000000 })
      await liquidPoll.vote.sendTransaction(5, { from: VOTER_5, gas: 4000000 })
      await liquidPoll.vote.sendTransaction(6, { from: VOTER_6, gas: 4000000 })
      await expect( liquidPoll.readVote.call(VOTER_6, 0)).to.eventually.bignumber.equal(6);

      await liquidPoll.vote.sendTransaction(7, { from: VOTER_7, gas: 4000000 })
      await liquidPoll.vote.sendTransaction(8, { from: VOTER_8, gas: 4000000 })
      await liquidPoll.vote.sendTransaction(3, { from: VOTER_9, gas: 4000000 })

    });

    it("should fail when unregistered user tries to vote", async () => {

      await expect(liquidPoll.vote.sendTransaction(3, { from: VOTER_3, gas: 4000000 })).to.eventually.be.rejectedWith(REVERT_ERROR);

    });

    // test for voting after voting period has ended


  });

  describe("#delegateVote()", () => {
    it("should allow user to delegate their vote", async () => {

      await liquidPoll.registerVoter.sendTransaction({ from: VOTER_3, gas: 4000000 })

      await liquidPoll.delegateVote.sendTransaction(VOTER_7, { from: VOTER_3, gas: 4000000 })
      await liquidPoll.withdrawDirectVote.sendTransaction({ from: VOTER_5, gas: 4000000 })
      await liquidPoll.delegateVote.sendTransaction(VOTER_9, { from: VOTER_5, gas: 4000000 })
      await liquidPoll.withdrawDirectVote.sendTransaction({ from: VOTER_6, gas: 4000000 })
      await liquidPoll.delegateVote.sendTransaction(VOTER_7, { from: VOTER_6, gas: 4000000 })
      await liquidPoll.withdrawDirectVote.sendTransaction({ from: VOTER_7, gas: 4000000 })
      await liquidPoll.delegateVote.sendTransaction(VOTER_9, { from: VOTER_7, gas: 4000000 })
      await liquidPoll.withdrawDirectVote.sendTransaction({ from: VOTER_9, gas: 4000000 })
      await liquidPoll.delegateVote.sendTransaction(VOTER_8, { from: VOTER_9, gas: 4000000 })

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

    // test for delegating vote after voting period has ended

  });

  describe("#revokeDelegationForPoll()", () => {
    it("should allow user to revoke their delegation", async () => {

      await liquidPoll.revokeDelegationForPoll.sendTransaction({ from: VOTER_3, gas: 4000000 })

      await expect( liquidPoll.readVote.call(VOTER_3, 0)).to.eventually.bignumber.equal(0);

      await expect( liquidPoll.readEndVoter.call(VOTER_3, 0)).to.eventually.bignumber.equal(VOTER_3);

    });

    // test for revoking delegation after voting period has ended


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

      await liquidForum.registerVoter_Forum.sendTransaction({ from: VOTER_1, gas: 4000000 })

      await expect( liquidForum._isRegisteredVoter.call(VOTER_1)).to.eventually.equal(true);

      await liquidForum.registerVoter_Forum.sendTransaction({ from: VOTER_2, gas: 4000000 })
      await liquidForum.registerVoter_Forum.sendTransaction({ from: VOTER_4, gas: 4000000 })
      await liquidForum.registerVoter_Forum.sendTransaction({ from: VOTER_5, gas: 4000000 })
      await liquidForum.registerVoter_Forum.sendTransaction({ from: VOTER_6, gas: 4000000 })
      await liquidForum.registerVoter_Forum.sendTransaction({ from: VOTER_7, gas: 4000000 })
      await liquidForum.registerVoter_Forum.sendTransaction({ from: VOTER_8, gas: 4000000 })
      await liquidForum.registerVoter_Forum.sendTransaction({ from: VOTER_9, gas: 4000000 })


    });

    it("should fail when registering a second time", async () => {

      await expect(liquidForum.registerVoter_Forum.sendTransaction({ from: VOTER_1, gas: 4000000 })).to.eventually.be.rejectedWith(REVERT_ERROR);

    });

  });

  describe("#becomeDelegateForTopic()", () => {
    it("should allow registered user to become a delegate for a particular topic", async () => {

        await liquidForum.becomeDelegateForTopic.sendTransaction(1, { from: VOTER_1, gas: 4000000 })
        await expect( liquidForum._isValidDelegateForTopic.call(VOTER_1, 1)).to.eventually.equal(true);

        await liquidForum.becomeDelegateForTopic.sendTransaction(7, { from: VOTER_7, gas: 4000000 })
        await expect( liquidForum._isValidDelegateForTopic.call(VOTER_7, 7)).to.eventually.equal(true);

        await liquidForum.becomeDelegateForTopic.sendTransaction(8, { from: VOTER_8, gas: 4000000 })
        await expect( liquidForum._isValidDelegateForTopic.call(VOTER_8, 8)).to.eventually.equal(true);

        await liquidForum.becomeDelegateForTopic.sendTransaction(3, { from: VOTER_9, gas: 4000000 })
        await expect( liquidForum._isValidDelegateForTopic.call(VOTER_9, 3)).to.eventually.equal(true);
        await liquidForum.becomeDelegateForTopic.sendTransaction(8, { from: VOTER_9, gas: 4000000 })

        await liquidForum.becomeDelegateForTopic.sendTransaction(1, { from: VOTER_2, gas: 4000000 })
        await liquidForum.becomeDelegateForTopic.sendTransaction(1, { from: VOTER_4, gas: 4000000 })
        await liquidForum.becomeDelegateForTopic.sendTransaction(1, { from: VOTER_7, gas: 4000000 })
        await liquidForum.becomeDelegateForTopic.sendTransaction(2, { from: VOTER_2, gas: 4000000 })
        await liquidForum.becomeDelegateForTopic.sendTransaction(2, { from: VOTER_6, gas: 4000000 })


      });

    it("should fail when unregistered user tries to become delegate", async () => {

      await expect(liquidForum.becomeDelegateForTopic.sendTransaction(3, { from: VOTER_3, gas: 4000000 })).to.eventually.be.rejectedWith(REVERT_ERROR);

    });

    // test delegation read correctly from different delegationExpiratoinIntervals

  });

  describe("#delegateVoteForTopic()", () => {
    it("should allow user to delegate their vote for a topic", async () => {

      await liquidForum.registerVoter_Forum.sendTransaction({ from: VOTER_3, gas: 4000000 })

      await liquidForum.delegateVoteForTopic.sendTransaction(1, VOTER_1, { from: VOTER_3, gas: 4000000 })
      await liquidForum.delegateVoteForTopic.sendTransaction(7, VOTER_7, { from: VOTER_5, gas: 4000000 })
      await liquidForum.delegateVoteForTopic.sendTransaction(7, VOTER_7, { from: VOTER_6, gas: 4000000 })
      await liquidForum.delegateVoteForTopic.sendTransaction(8, VOTER_9, { from: VOTER_7, gas: 4000000 })
      await liquidForum.delegateVoteForTopic.sendTransaction(8, VOTER_8, { from: VOTER_9, gas: 4000000 })



      await expect( liquidForum.readDelegateForTopic.call(VOTER_3, 1)).to.eventually.bignumber.equal(VOTER_1);
      await expect( liquidForum.readDelegateForTopic.call(VOTER_5, 7)).to.eventually.bignumber.equal(VOTER_7);
      await expect( liquidForum.readDelegateForTopic.call(VOTER_6, 7)).to.eventually.bignumber.equal(VOTER_7);
      await expect( liquidForum.readDelegateForTopic.call(VOTER_7, 8)).to.eventually.bignumber.equal(VOTER_9);

      await expect( liquidForum.readEndDelegateForTopic.call(VOTER_7, 8, 0)).to.eventually.bignumber.equal(VOTER_8);

      await expect( liquidForum.readDelegateForTopic.call(VOTER_9, 8)).to.eventually.bignumber.equal(VOTER_8);

      await liquidForum.delegateVoteForTopic.sendTransaction(1, VOTER_2, { from: VOTER_1, gas: 4000000 })
      await liquidForum.delegateVoteForTopic.sendTransaction(1, VOTER_4, { from: VOTER_2, gas: 4000000 })
      await liquidForum.delegateVoteForTopic.sendTransaction(1, VOTER_4, { from: VOTER_5, gas: 4000000 })
      await liquidForum.delegateVoteForTopic.sendTransaction(1, VOTER_4, { from: VOTER_6, gas: 4000000 })
      await liquidForum.delegateVoteForTopic.sendTransaction(1, VOTER_7, { from: VOTER_8, gas: 4000000 })
      await liquidForum.delegateVoteForTopic.sendTransaction(1, VOTER_7, { from: VOTER_9, gas: 4000000 })
      await liquidForum.delegateVoteForTopic.sendTransaction(2, VOTER_2, { from: VOTER_1, gas: 4000000 })
      await liquidForum.delegateVoteForTopic.sendTransaction(2, VOTER_2, { from: VOTER_4, gas: 4000000 })
      await liquidForum.delegateVoteForTopic.sendTransaction(2, VOTER_2, { from: VOTER_5, gas: 4000000 })
      await liquidForum.delegateVoteForTopic.sendTransaction(2, VOTER_6, { from: VOTER_7, gas: 4000000 })
      await liquidForum.delegateVoteForTopic.sendTransaction(2, VOTER_6, { from: VOTER_8, gas: 4000000 })
      await liquidForum.delegateVoteForTopic.sendTransaction(2, VOTER_6, { from: VOTER_9, gas: 4000000 })

    });

    it("should fail when user tries to ciricular delegate on topic", async () => {

      await expect(liquidForum.delegateVoteForTopic.sendTransaction(1, VOTER_8, { from: VOTER_7, gas: 4000000 })).to.eventually.be.rejectedWith(REVERT_ERROR);

    });
  });

  describe("#revokeDelegationForTopic()", () => {
    it("should allow user to revoke their delegation", async () => {

        await liquidForum.revokeDelegationForTopic.sendTransaction(7, { from: VOTER_5, gas: 4000000 })
        await expect( liquidForum.readDelegateForTopic.call(VOTER_5, 7)).to.eventually.bignumber.equal(0x0);
      });


      // test delegation read correctly from different delegationExpiratoinIntervals



    // it("should fail when unregistered user tries to become delegate", async () => {
    //
    //   await expect(liquidForum.revokeDelegationForTopic.sendTransaction(VOTER_3, 3, { from: VOTER_, gas: 4000000 })).to.eventually.be.rejectedWith(REVERT_ERROR);
    //
    // });

  });

  // test for registering after voting period has ended
  // test for becoming delegate after delegate period has ended
  // test for voting after voting period has ended
  // test for delegating vote after voting period has ended
  // test for revoking delegation after voting period has ended
  // test delegation read correctly from different delegationExpiratoinIntervals
  // test tally works correctly reading from topic delegation, poll delegation, and direct voting.
  // test for unregistered user revoking delegation

  describe("#createPoll() 2nd Instance", () => {

    it("should log new poll", async () => {

      const DELEGATE_PERIOD = timestamp.add(time, "-1h");
      const VOTE_PERIOD = timestamp.add(time, "+1h");

    let txHash = await liquidForum.createPoll.sendTransaction(DELEGATE_PERIOD, VOTE_PERIOD, 75, 51, EMPTY_BYTES32_HASH, EIGHT_OPTION_VOTE_ARRAY, 1, { from: OWNER, gas: 4000000 })

      await web3.eth.getTransactionReceipt(txHash, async (err, result) => {
        const [newPollLog] = ABIDecoder.decodeLogs(result.logs);

        let newPollAddress = await liquidForum.pollList.call(1);

        const logExpected =
                    LogNewPoll(newPollAddress, liquidForum.address, 1, 'newPoll');

                expect(newPollLog).to.deep.equal(logExpected);
         });

    let liquidPollAddress = await liquidForum.pollList.call(1);

    const contractInstance = await web3.eth.contract(LiquidDemocracyPoll.abi).at(liquidPollAddress);

    liquidPoll = await new LiquidDemocracyPoll(
             contractInstance, { from: OWNER, gas: 4000000 });
    });

  });

  describe("#registerVoter()", () => {
    it("should register new user when delegation period has closed, but vote period open", async () => {

      await liquidPoll.registerVoter.sendTransaction({ from: VOTER_1, gas: 4000000 })

      await expect( liquidPoll._isRegisteredVoter.call(VOTER_1)).to.eventually.equal(true);

      await liquidPoll.registerVoter.sendTransaction({ from: VOTER_2, gas: 4000000 })
      await liquidPoll.registerVoter.sendTransaction({ from: VOTER_4, gas: 4000000 })
      await liquidPoll.registerVoter.sendTransaction({ from: VOTER_5, gas: 4000000 })
      await liquidPoll.registerVoter.sendTransaction({ from: VOTER_6, gas: 4000000 })
      await liquidPoll.registerVoter.sendTransaction({ from: VOTER_7, gas: 4000000 })
      await liquidPoll.registerVoter.sendTransaction({ from: VOTER_8, gas: 4000000 })
      await liquidPoll.registerVoter.sendTransaction({ from: VOTER_9, gas: 4000000 })


    });
  });

  describe("#becomeDelegate()", () => {

    it("should fail when registered user tries to become delegate after delegation period has closed", async () => {

      await expect(liquidPoll.becomeDelegate.sendTransaction({ from: VOTER_1, gas: 4000000 })).to.eventually.be.rejectedWith(REVERT_ERROR);

    });
  });

  describe("#vote()", () => {
    it("should allow user to vote when delegation period has closed, but vote period open", async () => {

      await liquidPoll.vote.sendTransaction(1, { from: VOTER_1, gas: 4000000 })
      await liquidPoll.vote.sendTransaction(4, { from: VOTER_4, gas: 4000000 })
      await liquidPoll.vote.sendTransaction(7, { from: VOTER_7, gas: 4000000 })


    });


  });

  describe("#delegateVote()", () => {
    it("should fail to allow user to delegate their vote after delegation has closed", async () => {

      await expect(liquidPoll.delegateVote.sendTransaction(VOTER_9, { from: VOTER_5, gas: 4000000 })).to.eventually.be.rejectedWith(REVERT_ERROR);

    });
  });


    describe("#revokeDelegation() in poll", () => {
      it("should allow user to revoke their delegation after delegation period has passed, but vote period open", async () => {

        await liquidPoll.revokeDelegationForPoll.sendTransaction({ from: VOTER_2, gas: 4000000 })

      });

      it("should still return vote and endVoter of forum Delegate", async () => {

        await expect( liquidPoll.readVote.call(VOTER_2, 0)).to.eventually.bignumber.equal(4);

        await expect( liquidPoll.readEndVoter.call(VOTER_2, 0)).to.eventually.bignumber.equal(VOTER_4);

      });
    });

      // test for revoking delegation after voting period has ended

      describe("#tally()", () => {
        it("should correctly tally votes from poll", async () => {

          let result = await liquidPoll.tally.call()

            await expect(result[0][0].toNumber()).to.equal(0);
            await expect(result[0][1].toNumber()).to.equal(1);
            await expect(result[0][4].toNumber()).to.equal(4);
            await expect(result[0][7].toNumber()).to.equal(3);

            await expect(result[1].toNumber()).to.equal(8);
            await expect(result[2].toNumber()).to.equal(0);

        });
      });

      describe("#finalDecision()", () => {
        it("should correctly show final decision of poll", async () => {

          let result = await liquidPoll.finalDecision.call()

            await expect(result[0].toNumber()).to.equal(0);
            await expect(result[1].toNumber()).to.equal(0);

        });
      });

  // refactor to have each function call be from wallet owner instead of proposal owner, and test security.


  describe("#createPoll() 3rd Instance", () => {

    it("should log new poll", async () => {

      const DELEGATE_PERIOD = timestamp.add(time, "-2h");
      const VOTE_PERIOD = timestamp.add(time, "-1h");

    let txHash = await liquidForum.createPoll.sendTransaction(DELEGATE_PERIOD, VOTE_PERIOD, 75, 51, EMPTY_BYTES32_HASH, EIGHT_OPTION_VOTE_ARRAY, 1, { from: OWNER, gas: 4000000 })

      await web3.eth.getTransactionReceipt(txHash, async (err, result) => {
        const [newPollLog] = ABIDecoder.decodeLogs(result.logs);

        let newPollAddress = await liquidForum.pollList.call(2);

        const logExpected =
                    LogNewPoll(newPollAddress, liquidForum.address, 2, 'newPoll');

                expect(newPollLog).to.deep.equal(logExpected);
         });

    let liquidPollAddress = await liquidForum.pollList.call(2);

    const contractInstance = await web3.eth.contract(LiquidDemocracyPoll.abi).at(liquidPollAddress);

    liquidPoll = await new LiquidDemocracyPoll(
             contractInstance, { from: OWNER, gas: 4000000 });
    });

  });

  describe("#registerVoter()", () => {
    it("should fail to register voter after vote period has closed", async () => {

      await expect(liquidPoll.registerVoter.sendTransaction({ from: VOTER_1, gas: 4000000 })).to.eventually.be.rejectedWith(REVERT_ERROR);

    });
  });

  describe("#becomeDelegate()", () => {

    it("should fail when user tries to become delegate after vote period has closed", async () => {

      await expect(liquidPoll.becomeDelegate.sendTransaction({ from: VOTER_1, gas: 4000000 })).to.eventually.be.rejectedWith(REVERT_ERROR);

    });
  });

  describe("#vote()", () => {
    it("should fail to allow user to vote when vote period has closed", async () => {

      await expect(liquidPoll.vote.sendTransaction(1, { from: VOTER_1, gas: 4000000 })).to.eventually.be.rejectedWith(REVERT_ERROR);

    });


  });

  describe("#delegateVote()", () => {
    it("should fail to allow user to delegate their vote after vote period has closed", async () => {

      await expect(liquidPoll.delegateVote.sendTransaction(VOTER_9, { from: VOTER_5, gas: 4000000 })).to.eventually.be.rejectedWith(REVERT_ERROR);

    });
  });


    describe("#revokeDelegation() in poll", () => {
      it("should allow user to revoke their delegation after delegation period has passed, but vote period open", async () => {

          await expect(liquidPoll.revokeDelegationForPoll.sendTransaction({ from: VOTER_2, gas: 4000000 })).to.eventually.be.rejectedWith(REVERT_ERROR);

      });

      it("should still return vote and endVoter of forum Delegate", async () => {

        await expect( liquidPoll.readVote.call(VOTER_2, 0)).to.eventually.bignumber.equal(0);

        await expect( liquidPoll.readEndVoter.call(VOTER_2, 0)).to.eventually.bignumber.equal(VOTER_4);

      });
    });

      // test for revoking delegation after voting period has ended

      describe("#tally()", () => {
        it("should correctly tally votes from poll", async () => {

          let result = await liquidPoll.tally.call()

            await expect(result[0][0].toNumber()).to.equal(0);
            await expect(result[0][1].toNumber()).to.equal(0);
            await expect(result[0][4].toNumber()).to.equal(0);
            await expect(result[0][7].toNumber()).to.equal(0);

            await expect(result[1].toNumber()).to.equal(0);
            await expect(result[2].toNumber()).to.equal(0);

        });
      });

      describe("#finalDecision()", () => {
        it("should correctly show final decision of poll", async () => {

          let result = await liquidPoll.finalDecision.call()

            await expect(result[0].toNumber()).to.equal(0);
            await expect(result[1].toNumber()).to.equal(0);

        });
      });

  // refactor to have each function call be from wallet owner instead of proposal owner, and test security.
});

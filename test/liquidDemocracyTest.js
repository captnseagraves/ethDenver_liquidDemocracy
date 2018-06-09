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

    timestamp.round = true;

    let time = timestamp.now()

        timekeeper.freeze(time);

        // console.log('time1', Date.now());

    const DELEGATE_PERIOD = timestamp.add(time, "1d");

    const VOTE_PERIOD = timestamp.add(time, "2d");

    const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

    const TX_DEFAULTS = { from: OWNER, gas: 4000000 };

    const deployForum = async () => {

        const instance =
            await liquidDemocracyForumContract.new( 8, EMPTY_BYTES32_HASH, 2, -1, { from: OWNER, gas: 40000000 });

        const web3ContractInstance =
            web3.eth.contract(instance.abi).at(instance.address);

        liquidForum = new LiquidDemocracyForum(
            web3ContractInstance, { from: OWNER, gas: 40000000 });

    };


    before(deployForum);

    describe("Create Forum", () => {


      it("should return correct delegationDepth", async () => {

        await expect( liquidForum.delegationDepth.call()).to.eventually.bignumber.equal(2);

      });

      it("should return correct topicMetaData", async () => {

        await expect( liquidForum.topicMetaData.call()).to.eventually.equal(EMPTY_BYTES32_HASH);

      });

      it("should return correct validtopicArray", async () => {

        await expect( liquidForum.validTopicOptions.call()).to.eventually.bignumber.equal(8);

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

    describe("#registerVoter()", () => {
      it("should register new user in forum", async () => {

        await liquidForum.registerVoter.sendTransaction({ from: VOTER_1, gas: 4000000 })

        await expect( liquidForum.verifyVoter.call(VOTER_1)).to.eventually.equal(true);

        await liquidForum.registerVoter.sendTransaction({ from: VOTER_2, gas: 4000000 })
        await liquidForum.registerVoter.sendTransaction({ from: VOTER_4, gas: 4000000 })
        await liquidForum.registerVoter.sendTransaction({ from: VOTER_5, gas: 4000000 })
        await liquidForum.registerVoter.sendTransaction({ from: VOTER_6, gas: 4000000 })
        await liquidForum.registerVoter.sendTransaction({ from: VOTER_7, gas: 4000000 })
        await liquidForum.registerVoter.sendTransaction({ from: VOTER_8, gas: 4000000 })
        await liquidForum.registerVoter.sendTransaction({ from: VOTER_9, gas: 4000000 })


      });

      it("should fail when registering a second time", async () => {

        await expect(liquidForum.registerVoter.sendTransaction({ from: VOTER_1, gas: 4000000 })).to.eventually.be.rejectedWith(REVERT_ERROR);

      });
    });

    describe("#createNewTopic()", () => {


      it("should return new topic values and metadata", async () => {

        await liquidForum.createNewTopic.sendTransaction(9, ONES_BYTES32_HASH, { from: OWNER, gas: 4000000 })

        await expect( liquidForum.validTopicOptions.call()).to.eventually.bignumber.equal(9);

        await expect( liquidForum.topicMetaData.call()).to.eventually.equal(ONES_BYTES32_HASH);

      });

    });

    describe("#createPoll()", () => {


      it("should log new poll", async () => {

      let txHash = await liquidForum.createPoll.sendTransaction(DELEGATE_PERIOD, VOTE_PERIOD, 75, 51, EMPTY_BYTES32_HASH, 8, 3, { from: OWNER, gas: 40000000 })

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
               contractInstance, { from: OWNER, gas: 40000000 });
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

    await expect( liquidPoll.delegationDepth.call()).to.eventually.bignumber.equal(2);

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

    it("should return correct validVoteOptions", async () => {

      await expect( liquidPoll.validVoteOptions.call()).to.eventually.bignumber.equal(8);

    });
  });
  //
  // describe("#registerVoter()", () => {
  //   it("should register new user", async () => {
  //
  //     await liquidPoll.registerVoter.sendTransaction({ from: VOTER_1, gas: 4000000 })
  //
  //     await expect( liquidPoll._isRegisteredVoter.call(VOTER_1)).to.eventually.equal(true);
  //
  //     await liquidPoll.registerVoter.sendTransaction({ from: VOTER_2, gas: 4000000 })
  //     await liquidPoll.registerVoter.sendTransaction({ from: VOTER_4, gas: 4000000 })
  //     await liquidPoll.registerVoter.sendTransaction({ from: VOTER_5, gas: 4000000 })
  //     await liquidPoll.registerVoter.sendTransaction({ from: VOTER_6, gas: 4000000 })
  //     await liquidPoll.registerVoter.sendTransaction({ from: VOTER_7, gas: 4000000 })
  //     await liquidPoll.registerVoter.sendTransaction({ from: VOTER_8, gas: 4000000 })
  //     await liquidPoll.registerVoter.sendTransaction({ from: VOTER_9, gas: 4000000 })
  //
  //
  //   });
  //
  //   it("should fail when registering a second time", async () => {
  //
  //     await expect(liquidPoll.registerVoter.sendTransaction({ from: VOTER_1, gas: 4000000 })).to.eventually.be.rejectedWith(REVERT_ERROR);
  //
  //   });
  // });

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
  });

  describe("#vote()", () => {
    it("should allow user to vote", async () => {

      await liquidPoll.vote.sendTransaction(1, { from: VOTER_1, gas: 4000000 })

      let voter_1_vote = await liquidPoll.readVoteAndEndVoter.call(VOTER_1, 0)

      await expect(voter_1_vote[0].toNumber()).to.equal(1);
      await expect(voter_1_vote[1]).to.equal(VOTER_1);


      await liquidPoll.vote.sendTransaction(2, { from: VOTER_2, gas: 4000000 })
      await liquidPoll.vote.sendTransaction(4, { from: VOTER_4, gas: 4000000 })
      await liquidPoll.vote.sendTransaction(5, { from: VOTER_5, gas: 4000000 })
      await liquidPoll.vote.sendTransaction(6, { from: VOTER_6, gas: 4000000 })

      let voter_6_vote = await liquidPoll.readVoteAndEndVoter.call(VOTER_6, 0)

      await expect(voter_6_vote[0].toNumber()).to.equal(6);
      await expect(voter_6_vote[1]).to.equal(VOTER_6);

      await liquidPoll.vote.sendTransaction(7, { from: VOTER_7, gas: 4000000 })
      await liquidPoll.vote.sendTransaction(8, { from: VOTER_8, gas: 4000000 })
      await liquidPoll.vote.sendTransaction(3, { from: VOTER_9, gas: 4000000 })

    });

    it("should fail when unregistered user tries to vote", async () => {

      await expect(liquidPoll.vote.sendTransaction(3, { from: VOTER_3, gas: 4000000 })).to.eventually.be.rejectedWith(REVERT_ERROR);

    });
  });

  describe("#delegateVote()", () => {
    it("should allow user to delegate their vote", async () => {

      // await liquidPoll.registerVoter.sendTransaction({ from: VOTER_3, gas: 4000000 })

      // await liquidPoll.delegateVote.sendTransaction(VOTER_7, { from: VOTER_3, gas: 4000000 })
      await liquidPoll.withdrawDirectVote.sendTransaction({ from: VOTER_5, gas: 4000000 })
      await liquidPoll.delegateVote.sendTransaction(VOTER_9, { from: VOTER_5, gas: 4000000 })
      await liquidPoll.withdrawDirectVote.sendTransaction({ from: VOTER_6, gas: 4000000 })
      await liquidPoll.delegateVote.sendTransaction(VOTER_7, { from: VOTER_6, gas: 4000000 })
      await liquidPoll.withdrawDirectVote.sendTransaction({ from: VOTER_7, gas: 4000000 })
      await liquidPoll.delegateVote.sendTransaction(VOTER_9, { from: VOTER_7, gas: 4000000 })
      await liquidPoll.withdrawDirectVote.sendTransaction({ from: VOTER_9, gas: 4000000 })
      await liquidPoll.delegateVote.sendTransaction(VOTER_8, { from: VOTER_9, gas: 4000000 })

      await liquidPoll.withdrawDirectVote.sendTransaction({ from: VOTER_2, gas: 4000000 })
      await liquidPoll.delegateVote.sendTransaction(VOTER_1, { from: VOTER_2, gas: 4000000 })

      // let voter_3_vote = await liquidPoll.readVoteAndEndVoter.call(VOTER_3, 0)

      // await expect(voter_3_vote[0].toNumber()).to.equal(8);
      // await expect(voter_3_vote[1]).to.equal(VOTER_8);

      let voter_5_vote = await liquidPoll.readVoteAndEndVoter.call(VOTER_5, 0)

      await expect(voter_5_vote[0].toNumber()).to.equal(8);
      await expect(voter_5_vote[1]).to.equal(VOTER_8);
      let voter_6_vote = await liquidPoll.readVoteAndEndVoter.call(VOTER_6, 0)

      await expect(voter_6_vote[0].toNumber()).to.equal(8);
      await expect(voter_6_vote[1]).to.equal(VOTER_8);

      let voter_7_vote = await liquidPoll.readVoteAndEndVoter.call(VOTER_7, 0)

      await expect(voter_7_vote[0].toNumber()).to.equal(8);
      await expect(voter_7_vote[1]).to.equal(VOTER_8);

      let voter_9_vote = await liquidPoll.readVoteAndEndVoter.call(VOTER_9, 0)

      await expect(voter_9_vote[0].toNumber()).to.equal(8);
      await expect(voter_9_vote[1]).to.equal(VOTER_8);

      // await expect( liquidPoll.readDelegate.call(VOTER_3)).to.eventually.bignumber.equal(VOTER_7);
      await expect( liquidPoll.readDelegate.call(VOTER_5)).to.eventually.bignumber.equal(VOTER_9);
      await expect( liquidPoll.readDelegate.call(VOTER_6)).to.eventually.bignumber.equal(VOTER_7);
      await expect( liquidPoll.readDelegate.call(VOTER_7)).to.eventually.bignumber.equal(VOTER_9);
      await expect( liquidPoll.readDelegate.call(VOTER_9)).to.eventually.bignumber.equal(VOTER_8);

    });
  });

  describe("#revokeDelegationForPoll()", () => {
    it("should allow user to revoke their delegation", async () => {

      await liquidPoll.revokeDelegationForPoll.sendTransaction({ from: VOTER_2, gas: 4000000 })

      let voter_3_vote = await liquidPoll.readVoteAndEndVoter.call(VOTER_2, 0)

      await expect(voter_3_vote[0].toNumber()).to.equal(0);
      await expect(voter_3_vote[1]).to.equal(VOTER_2);

    });
  });

  describe("#tally()", () => {
    it("should correctly tally votes from poll", async () => {

      let result = await liquidForum.tally.call(liquidPoll.address)

        await expect(result[0][0].toNumber()).to.equal(1);
        await expect(result[0][1].toNumber()).to.equal(1);
        // await expect(result[0][2].toNumber()).to.equal(1);
        await expect(result[0][4].toNumber()).to.equal(1);
        await expect(result[0][8].toNumber()).to.equal(5);

        await expect(result[1].toNumber()).to.equal(7);
        await expect(result[2].toNumber()).to.equal(1);

    });
  });

  describe("#finalDecision()", () => {
    it("should correctly show final decision of poll", async () => {

      let result = await liquidForum.finalDecision.call(liquidPoll.address)

        await expect(result[0].toNumber()).to.equal(8);
        await expect(result[1].toNumber()).to.equal(5);

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
  });

  describe("#delegateVoteForTopic()", () => {
    it("should allow user to delegate their vote for a topic", async () => {

      // await liquidForum.registerVoter.sendTransaction({ from: VOTER_3, gas: 4000000 })

      // await liquidForum.delegateVoteForTopic.sendTransaction(1, VOTER_1, { from: VOTER_3, gas: 4000000 })
      await liquidForum.delegateVoteForTopic.sendTransaction(7, VOTER_7, { from: VOTER_5, gas: 4000000 })
      await liquidForum.delegateVoteForTopic.sendTransaction(7, VOTER_7, { from: VOTER_6, gas: 4000000 })
      await liquidForum.delegateVoteForTopic.sendTransaction(8, VOTER_9, { from: VOTER_7, gas: 4000000 })
      await liquidForum.delegateVoteForTopic.sendTransaction(8, VOTER_8, { from: VOTER_9, gas: 4000000 })



      // await expect( liquidForum.readDelegateForTopic.call(VOTER_3, 1)).to.eventually.bignumber.equal(VOTER_1);
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
  });


  describe("#createPoll() 2nd Instance", () => {

    it("should log new poll", async () => {

      const DELEGATE_PERIOD = timestamp.add(time, "-1h");
      const VOTE_PERIOD = timestamp.add(time, "+1h");

    let txHash = await liquidForum.createPoll.sendTransaction(DELEGATE_PERIOD, VOTE_PERIOD, 75, 51, EMPTY_BYTES32_HASH, 8, 1, { from: OWNER, gas: 4000000 })

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

  // describe("#registerVoter()", () => {
  //   it("should register new user when delegation period has closed, but vote period open", async () => {
  //
  //     await liquidPoll.registerVoter.sendTransaction({ from: VOTER_1, gas: 4000000 })
  //
  //     await expect( liquidPoll._isRegisteredVoter.call(VOTER_1)).to.eventually.equal(true);
  //
  //     await liquidPoll.registerVoter.sendTransaction({ from: VOTER_2, gas: 4000000 })
  //     await liquidPoll.registerVoter.sendTransaction({ from: VOTER_4, gas: 4000000 })
  //     await liquidPoll.registerVoter.sendTransaction({ from: VOTER_5, gas: 4000000 })
  //     await liquidPoll.registerVoter.sendTransaction({ from: VOTER_6, gas: 4000000 })
  //     await liquidPoll.registerVoter.sendTransaction({ from: VOTER_7, gas: 4000000 })
  //     await liquidPoll.registerVoter.sendTransaction({ from: VOTER_8, gas: 4000000 })
  //     await liquidPoll.registerVoter.sendTransaction({ from: VOTER_9, gas: 4000000 })
  //
  //
  //   });
  // });

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

        let voter_3_vote = await liquidPoll.readVoteAndEndVoter.call(VOTER_2, 0)

        await expect(voter_3_vote[0].toNumber()).to.equal(4);
        await expect(voter_3_vote[1]).to.equal(VOTER_4);

      });
    });

      describe("#tally()", () => {
        it("should correctly tally votes from poll", async () => {

          let result = await liquidForum.tally.call(liquidPoll.address)

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

          let result = await liquidForum.finalDecision.call(liquidPoll.address)

            await expect(result[0].toNumber()).to.equal(0);
            await expect(result[1].toNumber()).to.equal(0);

        });
      });

  describe("#createPoll() 3rd Instance", () => {

    it("should log new poll", async () => {

      const DELEGATE_PERIOD = timestamp.add(time, "-2h");
      const VOTE_PERIOD = timestamp.add(time, "-1h");

    let txHash = await liquidForum.createPoll.sendTransaction(DELEGATE_PERIOD, VOTE_PERIOD, 75, 51, EMPTY_BYTES32_HASH, 8, 1, { from: OWNER, gas: 4000000 })

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

  // describe("#registerVoter()", () => {
  //   it("should fail to register voter after vote period has closed", async () => {
  //
  //     await expect(liquidPoll.registerVoter.sendTransaction({ from: VOTER_1, gas: 4000000 })).to.eventually.be.rejectedWith(REVERT_ERROR);
  //
  //   });
  // });

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
      it("should fail to allow user to revoke their delegation after delegation period hashas closed", async () => {

          await expect(liquidPoll.revokeDelegationForPoll.sendTransaction({ from: VOTER_2, gas: 4000000 })).to.eventually.be.rejectedWith(REVERT_ERROR);

      });

      it("should still return vote and endVoter of forum Delegate", async () => {

        let voter_3_vote = await liquidPoll.readVoteAndEndVoter.call(VOTER_2, 0)

        await expect(voter_3_vote[0].toNumber()).to.equal(0);
        await expect(voter_3_vote[1]).to.equal(VOTER_4);

      });
    });

      describe("#tally()", () => {
        it("should correctly tally votes from poll", async () => {

          let result = await liquidForum.tally.call(liquidPoll.address)

            await expect(result[0][0].toNumber()).to.equal(8);
            await expect(result[0][1].toNumber()).to.equal(0);
            await expect(result[0][4].toNumber()).to.equal(0);
            await expect(result[0][7].toNumber()).to.equal(0);

            await expect(result[1].toNumber()).to.equal(0);
            await expect(result[2].toNumber()).to.equal(8);

        });
      });

      describe("#finalDecision()", () => {
        it("should correctly show final decision of poll", async () => {

          let result = await liquidForum.finalDecision.call(liquidPoll.address)

            await expect(result[0].toNumber()).to.equal(0);
            await expect(result[1].toNumber()).to.equal(0);

        });
      });

  // refactor to have each function call be from wallet owner instead of proposal owner,

  //  and test security.

  /*Could there be circular delegation if poll and forum delegations are separate?
                  Must test*/
});

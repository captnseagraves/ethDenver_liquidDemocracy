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

    const DELEGATE_PERIOD = timestamp.fromDate(new Date('2018-02-27T10:24:00'));
    const VOTE_PERIOD = timestamp.fromDate(new Date('2018-02-27T11:24:00'))

    const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
    const EIGHT_OPTION_VOTE_ARRAY = '0xff80000000000000000000000000000000000000000000000000000000000000'

    const TX_DEFAULTS = { from: PROPOSAL_OWNER, gas: 4000000 };

    const deployProposal = async () => {

        const instance =
            await liquidDemocracyContract.new( DELEGATE_PERIOD, VOTE_PERIOD, 5, 75, 51, EMPTY_BYTES32_HASH, EIGHT_OPTION_VOTE_ARRAY, TX_DEFAULTS);

        const web3ContractInstance =
            web3.eth.contract(instance.abi).at(instance.address);

        liquidProposal = new LiquidDemocracy(
            web3ContractInstance, TX_DEFAULTS);


    };


    before(deployProposal);

    describe("Create Proposal", () => {
      // these tests are returning weird numbers..... Having real issues with period timing

        it("should return correct delegationPeriodEnd", async () => {

        await expect( liquidProposal.delegatePeriodEnd.call()).to.eventually.bignumber.equal(DELEGATE_PERIOD);

        });


        it("should return correct votePeriodEnd", async () => {

        await expect( liquidProposal.votePeriodEnd.call()).to.eventually.bignumber.equal(VOTE_PERIOD);

        });

        it("should return correct delegationDepth", async () => {

        await expect( liquidProposal.delegationDepth.call()).to.eventually.bignumber.equal(5);

        });

        it("should return correct pctQuorum", async () => {

          await expect( liquidProposal.pctQuorum.call()).to.eventually.bignumber.equal(75);

        });

        it("should return correct pctThreshold", async () => {

          await expect( liquidProposal.pctThreshold.call()).to.eventually.bignumber.equal(51);

        });

        it("should return correct proposalMetaData", async () => {

          await expect( liquidProposal.proposalMetaData.call()).to.eventually.equal(EMPTY_BYTES32_HASH);

        });

        it("should return correct validVoteArray", async () => {

          await expect( liquidProposal.validVoteArray.call()).to.eventually.equal(EIGHT_OPTION_VOTE_ARRAY);

        });
    });

    describe("#registerVoter()", () => {
        it("should register new user", async () => {

          await liquidProposal.registerVoter.sendTransaction(VOTER_1, TX_DEFAULTS)

          await expect( liquidProposal._isRegisteredVoter.call(VOTER_1)).to.eventually.equal(true);

          await liquidProposal.registerVoter.sendTransaction(VOTER_2, TX_DEFAULTS)
          await liquidProposal.registerVoter.sendTransaction(VOTER_4, TX_DEFAULTS)
          await liquidProposal.registerVoter.sendTransaction(VOTER_5, TX_DEFAULTS)
          await liquidProposal.registerVoter.sendTransaction(VOTER_6, TX_DEFAULTS)
          await liquidProposal.registerVoter.sendTransaction(VOTER_7, TX_DEFAULTS)
          await liquidProposal.registerVoter.sendTransaction(VOTER_8, TX_DEFAULTS)
          await liquidProposal.registerVoter.sendTransaction(VOTER_9, TX_DEFAULTS)


        });

        it("should fail when registering a second time", async () => {

          await expect(liquidProposal.registerVoter.sendTransaction(VOTER_1, TX_DEFAULTS)).to.eventually.be.rejectedWith(REVERT_ERROR);

        });

    });

    describe("#becomeDelegate()", () => {
        it("should allow registered user to be a delegate", async () => {

          await liquidProposal.becomeDelegate.sendTransaction(VOTER_1, TX_DEFAULTS)

          await expect( liquidProposal._isValidDelegate.call(VOTER_1)).to.eventually.equal(true);

          await liquidProposal.becomeDelegate.sendTransaction(VOTER_7, TX_DEFAULTS)
          await liquidProposal.becomeDelegate.sendTransaction(VOTER_8, TX_DEFAULTS)
          await liquidProposal.becomeDelegate.sendTransaction(VOTER_9, TX_DEFAULTS)

        });

        it("should fail when unregistered user tries to become delegate", async () => {

          await expect(liquidProposal.becomeDelegate.sendTransaction(VOTER_3, TX_DEFAULTS)).to.eventually.be.rejectedWith(REVERT_ERROR);

        });
    });

    describe("#vote()", () => {
        it("should allow user to vote", async () => {

          await liquidProposal.vote.sendTransaction(VOTER_1, 1, TX_DEFAULTS)

          await expect( liquidProposal.readVote.call(VOTER_1, 0)).to.eventually.bignumber.equal(1);

          await liquidProposal.vote.sendTransaction(VOTER_2, 2, TX_DEFAULTS)
          await liquidProposal.vote.sendTransaction(VOTER_4, 4, TX_DEFAULTS)
          await liquidProposal.vote.sendTransaction(VOTER_5, 5, TX_DEFAULTS)
          await liquidProposal.vote.sendTransaction(VOTER_6, 6, TX_DEFAULTS)
          await expect( liquidProposal.readVote.call(VOTER_6, 0)).to.eventually.bignumber.equal(6);

          await liquidProposal.vote.sendTransaction(VOTER_7, 7, TX_DEFAULTS)
          await liquidProposal.vote.sendTransaction(VOTER_8, 8, TX_DEFAULTS)
          await liquidProposal.vote.sendTransaction(VOTER_9, 7, TX_DEFAULTS)

        });

        it("should fail when unregistered user tries to vote", async () => {

          await expect(liquidProposal.vote.sendTransaction(VOTER_3, 3, TX_DEFAULTS)).to.eventually.be.rejectedWith(REVERT_ERROR);

        });

    });




    describe("#delegateVote()", () => {
        it("should allow user to delegate their vote", async () => {

          await liquidProposal.registerVoter.sendTransaction(VOTER_3, TX_DEFAULTS)

          await liquidProposal.delegateVote.sendTransaction(VOTER_3, VOTER_7, TX_DEFAULTS)
          await liquidProposal.delegateVote.sendTransaction(VOTER_6, VOTER_7, TX_DEFAULTS)
          await liquidProposal.delegateVote.sendTransaction(VOTER_7, VOTER_9, TX_DEFAULTS)
          await liquidProposal.delegateVote.sendTransaction(VOTER_9, VOTER_8, TX_DEFAULTS)

          await expect( liquidProposal.readVote.call(VOTER_3, 0)).to.eventually.bignumber.equal(8);
          await expect( liquidProposal.readVote.call(VOTER_6, 0)).to.eventually.bignumber.equal(8);
          await expect( liquidProposal.readVote.call(VOTER_7, 0)).to.eventually.bignumber.equal(8);
          await expect( liquidProposal.readVote.call(VOTER_9, 0)).to.eventually.bignumber.equal(8);

          await expect( liquidProposal.readDelegate.call(VOTER_3)).to.eventually.bignumber.equal(VOTER_7);
          await expect( liquidProposal.readDelegate.call(VOTER_6)).to.eventually.bignumber.equal(VOTER_7);
          await expect( liquidProposal.readDelegate.call(VOTER_7)).to.eventually.bignumber.equal(VOTER_9);
          await expect( liquidProposal.readDelegate.call(VOTER_9)).to.eventually.bignumber.equal(VOTER_8);

          await expect( liquidProposal.readEndVoter.call(VOTER_3, 0)).to.eventually.bignumber.equal(VOTER_8);
          await expect( liquidProposal.readEndVoter.call(VOTER_6, 0)).to.eventually.bignumber.equal(VOTER_8);
          await expect( liquidProposal.readEndVoter.call(VOTER_7, 0)).to.eventually.bignumber.equal(VOTER_8);
          await expect( liquidProposal.readEndVoter.call(VOTER_9, 0)).to.eventually.bignumber.equal(VOTER_8);

        });
    });

    describe("#revokeDelegation()", () => {
        it("should allow user to revoke their delegation", async () => {

          await liquidProposal.revokeDelegation.sendTransaction(VOTER_3, TX_DEFAULTS)

          await expect( liquidProposal.readVote.call(VOTER_3, 0)).to.eventually.bignumber.equal(0);

          await expect( liquidProposal.readEndVoter.call(VOTER_3, 0)).to.eventually.bignumber.equal(VOTER_3);

        });

    });

    describe("#tally()", () => {
        it("should allow user to delegate their vote", async () => {

          let result = await liquidProposal.tally.call()

            await expect(result[0][0].toNumber()).to.equal(1);
            await expect(result[0][1].toNumber()).to.equal(1);
            await expect(result[0][2].toNumber()).to.equal(1);
            await expect(result[0][4].toNumber()).to.equal(1);
            await expect(result[0][5].toNumber()).to.equal(1);
            await expect(result[0][8].toNumber()).to.equal(4);

            await expect(result[1].toNumber()).to.equal(8);
            await expect(result[2].toNumber()).to.equal(1);

        });
    });

});

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

    const DELEGATE_PERIOD = timestamp.fromDate(new Date('2018-02-18T10:24:00'));
    const VOTE_PERIOD = timestamp.fromDate(new Date('2018-02-18T11:24:00'))
    // const COUNT_PERIOD = timestamp.fromDate(new Date(2018, 01, 17, 19, 00, 00));x  x

    const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

    const TX_DEFAULTS = { from: PROPOSAL_OWNER, gas: 4000000 };

    const deployProposal = async () => {

        const instance =
            await liquidDemocracyContract.new( DELEGATE_PERIOD, VOTE_PERIOD, 51, EMPTY_BYTES32_HASH, TX_DEFAULTS);

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

        it("should return correct pctQuorum", async () => {

          console.log(await liquidProposal.pctQuorum.call());

          await expect( liquidProposal.pctQuorum.call()).to.eventually.bignumber.equal(51);

        });

        it("should return correct proposalMetaData", async () => {

          await expect( liquidProposal.proposalMetaData.call()).to.eventually.equal(EMPTY_BYTES32_HASH);

        });
    });

    describe("#registerVoter()", () => {
        it("should register new user", async () => {

          await liquidProposal.registerVoter.sendTransaction(VOTER_1, TX_DEFAULTS)

          await expect( liquidProposal._isRegisteredVoter.call(VOTER_1)).to.eventually.equal(true);

          await liquidProposal.registerVoter.sendTransaction(VOTER_3, TX_DEFAULTS)
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

    describe("#allowDelegation()", () => {
        it("should allow registered user to be a delegate", async () => {

          await liquidProposal.allowDelegation.sendTransaction(VOTER_1, TX_DEFAULTS)

          await expect( liquidProposal._isValidDelegate.call(VOTER_1)).to.eventually.equal(true);

          await liquidProposal.allowDelegation.sendTransaction(VOTER_7, TX_DEFAULTS)
          await liquidProposal.allowDelegation.sendTransaction(VOTER_8, TX_DEFAULTS)
          await liquidProposal.allowDelegation.sendTransaction(VOTER_9, TX_DEFAULTS)

        });

        it("should fail when unregistered user tries to become delegate", async () => {

          await expect(liquidProposal.allowDelegation.sendTransaction(VOTER_2, TX_DEFAULTS)).to.eventually.be.rejectedWith(REVERT_ERROR);

        });
    });

    describe("#voteYea()", () => {
        it("should allow user to vote yea", async () => {

          // the votePeriodOpen modifier is broken :(

          await liquidProposal.voteYea.sendTransaction(VOTER_1, TX_DEFAULTS)

          await expect( liquidProposal.readVote.call(VOTER_1)).to.eventually.bignumber.equal(1);

          await liquidProposal.voteYea.sendTransaction(VOTER_5, TX_DEFAULTS)
          await liquidProposal.voteYea.sendTransaction(VOTER_8, TX_DEFAULTS)

        });

    });

    describe("#voteNay()", () => {
        it("should allow user to vote nay", async () => {

          // the votePeriodOpen modifier is broken :(

          await liquidProposal.registerVoter.sendTransaction(VOTER_2, TX_DEFAULTS)

          await liquidProposal.voteNay.sendTransaction(VOTER_2, TX_DEFAULTS)

          await liquidProposal.voteNay.sendTransaction(VOTER_4, TX_DEFAULTS)

          await expect( liquidProposal.readVote.call(VOTER_2)).to.eventually.bignumber.equal(2);

          await expect( liquidProposal.readVote.call(VOTER_4)).to.eventually.bignumber.equal(2);


        });

    });


    // readVote returns 0 and readEndVoter returns 0x000... , recursion is having problems, so cannot test delegateVote()
    describe("#delegateVote()", () => {
        it("should allow user to delegate their vote", async () => {


          await liquidProposal.delegateVote.sendTransaction(VOTER_3, VOTER_7, TX_DEFAULTS)
          await liquidProposal.delegateVote.sendTransaction(VOTER_6, VOTER_7, TX_DEFAULTS)
          await liquidProposal.delegateVote.sendTransaction(VOTER_7, VOTER_9, TX_DEFAULTS)
          await liquidProposal.delegateVote.sendTransaction(VOTER_9, VOTER_8, TX_DEFAULTS)

          console.log('delegate',  await liquidProposal.readDelegate.call(VOTER_3));

          console.log( await liquidProposal.readVote.call(VOTER_3));
          console.log( await liquidProposal.readEndVoter.call(VOTER_3));

          await expect( liquidProposal.readVote.call(VOTER_1)).to.eventually.bignumber.equal(1);
          await expect( liquidProposal.readVote.call(VOTER_5)).to.eventually.bignumber.equal(1);
          await expect( liquidProposal.readVote.call(VOTER_8)).to.eventually.bignumber.equal(1);
          await expect( liquidProposal.readVote.call(VOTER_3)).to.eventually.bignumber.equal(1);
          await expect( liquidProposal.readVote.call(VOTER_6)).to.eventually.bignumber.equal(1);

          await expect( liquidProposal.readVote.call(VOTER_7)).to.eventually.bignumber.equal(1);
          await expect( liquidProposal.readVote.call(VOTER_9)).to.eventually.bignumber.equal(1);

          await expect( liquidProposal.readEndVoter.call(VOTER_3)).to.eventually.bignumber.equal(VOTER_8);

        });

    });

    describe("#revokeDelegation()", () => {
        it("should allow user to revoke their delegation", async () => {

          await liquidProposal.revokeDelegation.sendTransaction(VOTER_3, TX_DEFAULTS)

            console.log( await liquidProposal.readVote.call(VOTER_3));
            console.log( await liquidProposal.readEndVoter.call(VOTER_3));

          await expect( liquidProposal.readVote.call(VOTER_3)).to.eventually.bignumber.equal(0);

          await expect( liquidProposal.readEndVoter.call(VOTER_3)).to.eventually.bignumber.equal(VOTER_3);

        });

    });

    // there are still some bugs in the math for tally i think, but it's mostly there. Also having the bignumber issue that doesnt seem to have a clear solution.
    describe("#decision()", () => {
        it("should allow user to delegate their vote", async () => {

          let result = await liquidProposal.tally.call()

          console.log(result);

            await expect(result[0].toNumber()).to.equal(6);
            await expect(result[1].toNumber()).to.equal(2);
            await expect(result[2].toNumber()).to.equal(8);
            await expect(result[3].toNumber()).to.equal(1);
            await expect(result[4].toNumber()).to.equal(51);
            await expect(result[5].toNumber()).to.equal(1);


        });

    });



});

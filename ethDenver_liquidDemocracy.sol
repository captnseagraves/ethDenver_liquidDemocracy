pragma solidity ^0.4.17;

import "zeppelin-solidity/contracts/math/SafeMath.sol";


contract liquidDemocracy {
  using SafeMath for uint;

  /* times written as seconds since unix epoch*/
  /*end of delegate period*/
  uint public delegatePeriodEnd;
  /*end of vote period*/
  uint public votePeriodEnd;
  /*percentage needed to acheive successful vote*/
  uint public pctQuorum;
  /*limits number of delegates removed from original user*/
  uint public delegationDepth;
  /*tracks recursion against delegationDepth*/
  uint public recursionCount;
  /*possible IPFS hash of proposal metadata*/
  bytes32 public proposalMetaData;


  /*redundant voter registers solve for different major issues when each is used individually*/

  /*tracks user registration and single signup*/
  mapping (address => bool) internal registeredVotersMap;

  /*allows contract to iterate over voters to tally votes and follow delegation chains*/
  address[] internal registeredVotersArray;

  /*0 equals no vote, 1 equals yea, 2 equals nay, 3 equals delegated vote*/
  mapping (address => uint) internal userVotes;

  /*points to voter delegate*/
  mapping (address => address) internal userToDelegate;

  /* mapping of valid delegates */
  mapping (address => bool) internal willingToBeDelegate;


  /*verifies delegate period open*/
  modifier delegatePeriodOpen(){
    require(block.timestamp < delegatePeriodEnd);
    _;
  }

  /*verifies vote period open*/
  modifier votePeriodOpen(){
    require(block.timestamp < votePeriodEnd);
    _;
  }

  /*would clean and reduce modifiers and helper functions for production*/
  /*verifies voter is registered*/
    modifier isRegisteredVoter(address _userAddress) {
        require(_isRegisteredVoter(_userAddress) == true);
      _;
    }
    /*verifies delegate is valid*/
    modifier isValidDelegate(address _userAddress) {
      require(_isValidDelegate(_userAddress) == true);
      _;
    }
    /*verifies if vote is delegated*/
    modifier isVoteDelegated(address _userAddress) {
      require(_isVoteDelegated(_userAddress) == false);
      _;
    }

  function liquidDemocracy(
    uint _delegatePeriodEnd,
    uint _votePeriodEnd,
    uint _delegationDepth,
    uint _pctQuorum,
    bytes32 _proposalMetaData
    ) public {
      delegatePeriodEnd = _delegatePeriodEnd;
      votePeriodEnd = _votePeriodEnd;
      delegationDepth = _delegationDepth;
      pctQuorum = _pctQuorum;
      proposalMetaData = _proposalMetaData;
      recursionCount = 0;
  }

  /*allows voter to register for proposal*/
  function registerVoter(address _userAddress)
  external
  {

    require(registeredVotersMap[_userAddress] == false);

    registeredVotersArray.push(_userAddress);
    registeredVotersMap[_userAddress] = true;

  }

  /*allows user to offer themselves as a delegate*/
  function becomeDelegate(address _userAddress)
  external
  isRegisteredVoter(_userAddress)
  {
    willingToBeDelegate[_userAddress] = true;
  }

  /*Refine vote function to take vote as an input. could make into single function.*/

  /*allows user to vote yea*/
  function voteYea(address _userAddress)
  external
  isRegisteredVoter(_userAddress)
  votePeriodOpen()
  isVoteDelegated(_userAddress)
  {

    userVotes[_userAddress] = 1;

  }

  /*allows user to vote nay*/
  function voteNay(address _userAddress)
  external
  isRegisteredVoter(_userAddress)
  votePeriodOpen()
  isVoteDelegated(_userAddress)
  {

    userVotes[_userAddress] = 2;

  }

  /*need to verify chain depth and check circular delegation*/

  /* allows user to delegate their vote to another user who is a valid delegeate*/
  function delegateVote(address _userAddress, address _delegateAddress)
  external
  isRegisteredVoter(_userAddress)
  isValidDelegate(_delegateAddress)
  delegatePeriodOpen()
  {

    userVotes[_userAddress] = 3;
    userToDelegate[_userAddress] = _delegateAddress;

  }

  /*allows user to read their vote or their delegate's vote*/
  function readVote(address _userAddress)
  public
  returns (uint _userVote)
  {
    require(recursionCount <= delegationDepth);

    if (userVotes[_userAddress] != 3) {
      return (userVotes[_userAddress]);
    } else {
      recursionCount.add(1);
       return readVote(userToDelegate[_userAddress]);
    }
  }

  /*allows user to read user they delegated their vote to*/
  function readDelegate(address _userAddress)
  external
  returns (address _delegateAddress)
  {
    return userToDelegate[_userAddress];
  }

  /*allows user to read end of delegate chain and see delegate that ultimately cast their vote*/
  function readEndVoter(address _userAddress)
  view
  public
  returns (address _endVoterAddress)
  {
    require(recursionCount <= delegationDepth);

    if (userVotes[_userAddress] != 3) {
      return (_userAddress);
    } else {
      recursionCount.add(1);
       return readEndVoter(userToDelegate[_userAddress]);
    }
  }

  /*allows user to revoke their delegation if they disagree with delegates vote*/
  function revokeDelegation(address _userAddress)
  public
  isRegisteredVoter(_userAddress)
  votePeriodOpen()
  {

    userVotes[_userAddress] = 0;
    userToDelegate[_userAddress] = 0;

  }

  /*allows user tally votes at */
  function tally()
  external
  returns (uint _yeas, uint _nays, uint _totalVotes, uint _emptyVotes, uint _pctQuorum, uint _decision)
  {
    uint decision;
    uint emptyVotes = 0;
    uint countedYeas = 0;
    uint countedNays = 0;
    uint totalVotes = 0;

    for (uint i = 0; i < registeredVotersArray.length; i++){

      if(readVote(registeredVotersArray[i]) == 1) {
        countedYeas++;
      } else if(readVote(registeredVotersArray[i]) == 2) {
        countedNays++;
      } else if(readVote(registeredVotersArray[i]) == 0) {
        emptyVotes++;
      }
    }

    totalVotes = countedYeas.add(countedNays);

    if (countedYeas >= (totalVotes * pctQuorum).div(100)){
      decision = 1;
    } else {
      decision = 2;

    }

    return (countedYeas, countedNays, totalVotes, emptyVotes, pctQuorum, decision);
  }

  /*these addtional functions allow me to test contract. would remove bottom two for production and implement in modifier*/

  function _isVoteDelegated(address _userAddress)
  view
   internal
   returns (bool _voteStatus){
    if (userVotes[_userAddress] == 3) {
      return true;
    } else {
      return false;
    }
  }

  function _isRegisteredVoter(address _userAddress)
  view
   public
   returns (bool _voterRegistration){
    if (registeredVotersMap[_userAddress] == true) {
      return true;
    } else {
      return false;
    }
  }

  function _isValidDelegate(address _userAddress)
  view
   public
   returns (bool _delegateStatus){
    if (willingToBeDelegate[_userAddress] == true) {
      return true;
    } else {
      return false;
    }
  }

  function () external payable {
    revert();
  }

}

pragma solidity ^0.4.17;

import "./LDPollInterface.sol";
import "./LDForumInterface.sol";


contract LiquidDemocracyPoll is LDPollInterface {
  /*contract LiquidDemocracyPoll {*/


  /* times written as seconds since unix epoch*/
  /*end of delegate period*/
  uint public delegatePeriodEnd;
  /*end of vote period*/
  uint public votePeriodEnd;
  /*percentage of registered voters rsponding needed to acheive valid poll*/
  uint public pctQuorum;
  /*percentage of votes toward a particular option needed to acheive successful option*/
  uint public pctThreshold;
  /*limits number of delegates removed from original user*/
  uint public delegationDepth;
  /*possible IPFS hash of proposal metadata*/
  bytes32 public proposalMetaData;
  /*256 bit array that holds the validity of each possible vote option. Options are referenced and defined in poll metadata. */
  bytes32 public validVoteArray;

  uint public pollId;
  address public forumAddress;
  uint public topic;


/*want to think about not having users stand up as delegates, but allow anyone to delegate to anyone*/


  /*redundant voter registers solve for different major issues when each is used individually*/

  /*tracks user registration and single signup*/
  mapping (address => bool) internal registeredVotersMap;

  /*allows contract to iterate over voters to tally votes and follow delegation chains*/
  address[] internal registeredVotersArray;

  /*0 equals no vote, other values will equate to those set in vote initialization*/
  mapping (address => uint) public userVotes;

  /*points to voter delegate*/
  mapping (address => address) public userToDelegate;

  /* mapping of valid delegates */
  mapping (address => bool) public willingToBeDelegate;


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
    /*verifies if vote is delegated*/
    modifier isValidVoteOption(uint _vote) {
      require(_isValidVoteOption(_vote) == true);
      _;
    }
    modifier isValidChainDepthAndNonCircular(address _userAddress) {
      bool bValid;
      (bValid,,) =_isValidChainDepthAndNonCircular(_userAddress, 0);
      require(bValid);
      _;
    }
    modifier isVoterDelegateAndDelegatePeriodOpen(address _userAddress) {
      if (willingToBeDelegate[_userAddress] == true) {
        require(block.timestamp < delegatePeriodEnd);
      }
      _;
    }

  function LiquidDemocracyPoll(
    uint _delegatePeriodEnd,
    uint _votePeriodEnd,
    uint _delegationDepth,
    uint _pctQuorum,
    uint _pctThreshold,
    bytes32 _proposalMetaData,
    bytes32 _validVoteArray,
    uint _pollId,
    address _forumAddress,
    uint _topic
    ) public {
      delegatePeriodEnd = _delegatePeriodEnd;
      votePeriodEnd = _votePeriodEnd;
      delegationDepth = _delegationDepth;
      pctQuorum = _pctQuorum;
      pctThreshold = _pctThreshold;
      proposalMetaData = _proposalMetaData;
      validVoteArray = _validVoteArray;
      pollId = _pollId;
      forumAddress = _forumAddress;
      topic = _topic;
  }

  /*allows voter to register for poll*/
  function registerVoter(address _userAddress)
  external
  votePeriodOpen()
  {

    require(registeredVotersMap[_userAddress] == false);

    registeredVotersArray.push(_userAddress);
    registeredVotersMap[_userAddress] = true;

  }

  /*allows user to offer themselves as a delegate*/
  function becomeDelegate(address _userAddress)
  external
  isRegisteredVoter(_userAddress)
  delegatePeriodOpen()
  {
    willingToBeDelegate[_userAddress] = true;
  }

  /*Instead of using bytes32 as 256 bit array, could potentially use enums... not sure pros/cons of each*/
  /*allows user to vote a value
  todo: rewrite tests for voting*/
  function vote(address _userAddress, uint _value)
  external
  isRegisteredVoter(_userAddress)
  /*isVoteDelegated(_userAddress)*/
  isVoterDelegateAndDelegatePeriodOpen(_userAddress)
  isValidVoteOption(_value)
  votePeriodOpen()
  {
    userVotes[_userAddress] = _value;
  }

  /*need to verify chain depth and check circular delegation*/

  /* allows user to delegate their vote to another user who is a valid delegeate*/
  function delegateVote(address _userAddress, address _delegateAddress)
  external
  isRegisteredVoter(_userAddress)
  isValidDelegate(_delegateAddress)
  isValidChainDepthAndNonCircular(_userAddress)
  delegatePeriodOpen()
  {
    userToDelegate[_userAddress] = _delegateAddress;
  }

  /*can refactor these functions to be one
  or just refactor to have each do something different, not DRY currently



  create function to change address of forum contract, allows upgrades
  */

  /*allows user to read their vote or their delegate's vote
  returns users vote*/
  function readVote(address _userAddress, uint _recursionCount)
  public
  view
  returns (uint)
  {

    if (userVotes[_userAddress] != 0) {
      return userVotes[_userAddress];
    }

    if (_recursionCount > delegationDepth){
        return 0;
    }

    address forumDelegate = LDForumInterface(forumAddress).readEndDelegateForTopic(_userAddress, topic, 0);

    if (userToDelegate[_userAddress] != 0x0) {
      return readVote(userToDelegate[_userAddress], _recursionCount + 1);
    } else if (forumDelegate != 0x0) {
      return readVote(forumDelegate, _recursionCount + 1);
    } else {
      return 0;
    }
  }

  function readEndVoter(address _userAddress, uint _recursionCount)
  public
  view
  returns (address)
  {

    if (userToDelegate[_userAddress] == 0x0) {
      return _userAddress;
    }

    if (_recursionCount > delegationDepth){
     return 0x0;
    }

    address forumDelegate = LDForumInterface(forumAddress).readEndDelegateForTopic(_userAddress, topic, 0);

    if (userToDelegate[_userAddress] != 0x0) {
      return readEndVoter(userToDelegate[_userAddress], _recursionCount + 1);
    } else if (forumDelegate != 0x0) {
      return readEndVoter(forumDelegate, _recursionCount + 1);
    } else {
      return _userAddress;
    }
  }


  /*allows user to read user they delegated their vote to*/
  function readDelegate(address _userAddress)
  external
  view
  returns (address _delegateAddress)
  {
    address forumDelegate = LDForumInterface(forumAddress).readDelegateForTopic(_userAddress, topic);

    if (userToDelegate[_userAddress] != 0x0) {
      return userToDelegate[_userAddress];
    } else if (forumAddress != 0x0) {
      return forumDelegate;
    } else {
      return 0x0;
    }

  }

  /*allows user to revoke their delegation if they disagree with delegates vote*/
  function revokeDelegation(address _userAddress)
  public
  isRegisteredVoter(_userAddress)
  votePeriodOpen()
  {
    userToDelegate[_userAddress] = 0x0;
  }

  /**/
  /**/
  /*Need to implement onlyVoter function!!!!!!!!!!

    must implement controls so that only the msg.sender can can their own data, no other actor should be able to change data.
  /
  /**/
  /**/

  function withdrawDirectVote(address _userAddress)
  public
  isRegisteredVoter(_userAddress)
  votePeriodOpen()
  {
    userVotes[_userAddress] = 0;
  }


/*figure out how to handle ties
  return array of winners, if array is length 1, easy solution.
  if tied, auto-generate run-off poll
*/

  //todo: how to handle final decision and runoff conditions
  /*if we can make this a view function, that would be ideal*/
  function finalDecision()
  public
  view
  returns (uint _finalDecision, uint _finalDecisionTally)
  {

    uint totalVotes;
    uint emptyVotes;
    /*rename to rsults or similar vs. votes*/
    uint[256] memory _votes;

    (_votes, totalVotes, emptyVotes) = tally();


    if ((totalVotes * 100) / (registeredVotersArray.length) < pctQuorum) {
      _finalDecision = 0;
      _finalDecisionTally = 0;
    } else {

      uint highestVoteHold = 0;
      uint highestVoteValueHold = 0;

        for (uint i = 0; i < _votes.length; i++) {
          if (_votes[i] > highestVoteValueHold) {
            highestVoteValueHold = _votes[i];
            highestVoteHold = i;
          }
        }

        if (((highestVoteValueHold * 100) / totalVotes) > pctThreshold) {
          _finalDecision = highestVoteHold;
          _finalDecisionTally = highestVoteValueHold;
          return;
        } else {
          _finalDecision = 0;
          _finalDecisionTally = 0;
          return;
        }
    }
  }

/* recording votes/delegatoins as they happen vs. tallyin at the end, may be more expensive  upfront, but allows outcome to be actionable on chain, because end tally function doesnt run out of gas. */

/*could have gas conscious tally function that run multiple times.*/


  /*allows user tally votes at */
  function tally()
  public
  view
  returns (uint[256] _votes, uint _totalVotes, uint _emptyVotes)
  {

    /*could point to registered voters in forum, instead of poll*/

    //todo: how to handle vote validation and initialization
    for (uint i = 0; i < registeredVotersArray.length; i++){
      uint vote = readVote(registeredVotersArray[i], 0);
      _votes[vote]++;

      if(vote > 0){
          _totalVotes++;
      } else {
          _emptyVotes++;
      }
    }
    return (_votes, _totalVotes, _emptyVotes);
  }


/*Could refactor to just use uints. why the complicated bit math?*/

 function _isValidVoteOption(uint _vote) public view returns(bool){
      byte MyByte = validVoteArray[_vote / 8];
      uint MyPosition = 7 - (_vote % 8);

     return  2**MyPosition == uint8(MyByte & byte(2**MyPosition));
 }

 /**/
 /**/
 /*Could there be circular delegation if poll and forum delegations are separate?
                 Must Check*/

        /*Also may have issues with UX and having to revoke both Poll and Topic delegates in order to place direct vote. Could direct vote be default? Must refactor.*/
 /**/
 /**/

 function _isValidChainDepthAndNonCircular(address _userAddress, uint _recursionCount) public view returns(bool _valid, bool _vDepth, bool _vCircle){

   if(_recursionCount > delegationDepth){
     _vDepth = true;
     _valid = false;
     return;
   }

      address forumDelegate = LDForumInterface(forumAddress).readDelegateForTopic(_userAddress, topic);

   if (userToDelegate[_userAddress] != 0x0 || forumDelegate != 0x0) {
     if (userToDelegate[_userAddress] == _userAddress || forumDelegate == _userAddress) {
       _valid = false;
       _vCircle = true;
       return;
     }
     return _isValidChainDepthAndNonCircular(userToDelegate[_userAddress], _recursionCount + 1);
   } else {
     _valid = true;
     return;
   }
 }

  /*these addtional functions allow me to test contract. would remove bottom two for production and implement in modifier*/

  function _isVoteDelegated(address _userAddress)
  view
   internal
   returns (bool _voteStatus){

     address forumDelegate = LDForumInterface(forumAddress).readDelegateForTopic(_userAddress, topic);

    if (userToDelegate[_userAddress] != 0x0 || forumDelegate != 0x0) {
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

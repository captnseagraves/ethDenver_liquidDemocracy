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
  uint public validVoteOptions;

  uint public pollId;
  address public forumAddress;
  uint public topic;


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
    modifier isRegisteredVoter() {
        require(_isRegisteredVoter(msg.sender) == true);
      _;
    }
    /*verifies delegate is valid*/
    modifier isValidDelegate(address _delegateAddress) {
      require(_isValidDelegate(_delegateAddress) == true);
      _;
    }
    /*verifies if vote is delegated*/
    modifier isVoteDelegated() {
      require(_isVoteDelegated(msg.sender) == false);
      _;
    }
    /*verifies if vote is delegated*/
    modifier isValidVoteOption(uint _vote) {
      require(_vote <= validVoteOptions);
      _;
    }
    modifier isValidChainDepthAndNonCircular() {
      bool bValid;
      (bValid,,) =_isValidChainDepthAndNonCircular(msg.sender, 0);
      require(bValid);
      _;
    }
    modifier isVoterDelegateAndDelegatePeriodOpen() {
      if (willingToBeDelegate[msg.sender] == true) {
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
    uint _validVoteOptions,
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
      validVoteOptions = _validVoteOptions;
      pollId = _pollId;
      forumAddress = _forumAddress;
      topic = _topic;
  }

  /*allows voter to register for poll*/
  function registerVoter()
  external
  votePeriodOpen
  {

    require(registeredVotersMap[msg.sender] == false);

    registeredVotersArray.push(msg.sender);
    registeredVotersMap[msg.sender] = true;

  }

  /*allows user to offer themselves as a delegate*/
  function becomeDelegate()
  external
  isRegisteredVoter
  delegatePeriodOpen
  {
    willingToBeDelegate[msg.sender] = true;
  }

  /*allows user to vote a value*/
  function vote(uint _value)
  external
  isRegisteredVoter
  isVoterDelegateAndDelegatePeriodOpen
  isValidVoteOption(_value)
  votePeriodOpen
  {
    userVotes[msg.sender] = _value;
  }

  /* allows user to delegate their vote to another user who is a valid delegeate*/
  function delegateVote(address _delegateAddress)
  external
  isRegisteredVoter
  isValidDelegate(_delegateAddress)
  isValidChainDepthAndNonCircular
  delegatePeriodOpen
  {
    userToDelegate[msg.sender] = _delegateAddress;
  }


  /*allows user to read their vote or their delegate's vote
  returns users vote*/
  function readVoteAndEndVoter(address _userAddress, uint _recursionCount)
  public
  view
  returns (uint _voteValue, address _endVoterAddress)
  {

    if (userVotes[_userAddress] != 0) {
      _voteValue = userVotes[_userAddress];
      _endVoterAddress = _userAddress;
      return;
    }

    if (_recursionCount > delegationDepth){
      _voteValue = 0;
      _endVoterAddress = _userAddress;
      return;
    }

    address forumDelegate = LDForumInterface(forumAddress).readEndDelegateForTopic(_userAddress, topic, 0);

    if (userToDelegate[_userAddress] != 0x0) {
      return readVoteAndEndVoter(userToDelegate[_userAddress], _recursionCount + 1);
    } else if (forumDelegate != 0x0) {
      return readVoteAndEndVoter(forumDelegate, _recursionCount + 1);
    } else {
      _voteValue = 0;
      _endVoterAddress = _userAddress;
      return;
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
  function revokeDelegationForPoll()
  public
  isRegisteredVoter
  votePeriodOpen
  {
    userToDelegate[msg.sender] = 0x0;
  }



  function withdrawDirectVote()
  public
  isRegisteredVoter
  votePeriodOpen
  {
    userVotes[msg.sender] = 0;
  }


  /*if we can make this a view function, that would be ideal*/
  function finalDecision()
  public
  view
  returns (uint _finalDecision, uint _finalDecisionTally)
  {

    uint totalVotes;
    uint emptyVotes;
    uint[256] memory _tallyResults;

    (_tallyResults, totalVotes, emptyVotes) = tally();


    if (registeredVotersArray.length == 0 || (totalVotes * 100) / (registeredVotersArray.length) < pctQuorum) {
      _finalDecision = 0;
      _finalDecisionTally = 0;
      return;
    } else {

      uint highestVoteHold = 0;
      uint highestVoteValueHold = 0;

        for (uint i = 0; i < _tallyResults.length; i++) {
          if (_tallyResults[i] > highestVoteValueHold) {
            highestVoteValueHold = _tallyResults[i];
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

  /*allows user tally votes at */
  function tally()
  public
  view
  returns (uint[256] _votes, uint _totalVotes, uint _emptyVotes)
  {

    //todo: how to handle vote validation and initialization
    for (uint i = 0; i < registeredVotersArray.length; i++){
      uint vote;
    (vote,)  = readVoteAndEndVoter(registeredVotersArray[i], 0);
      _votes[vote]++;

      if(vote > 0){
          _totalVotes++;
      } else {
          _emptyVotes++;
      }
    }
    return (_votes, _totalVotes, _emptyVotes);
  }


function changeForumAddress(address _newForumAddress)
  public

{
  forumAddress = _newForumAddress;
  /*event*/
}

 function _isValidChainDepthAndNonCircular(address _userAddress, uint _recursionCount)
  public
  view
  returns(bool _valid, bool _vDepth, bool _vCircle)
 {

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
   returns (bool _voteStatus)
  {

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
   returns (bool _voterRegistration)
  {
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

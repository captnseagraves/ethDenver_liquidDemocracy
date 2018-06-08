pragma solidity ^0.4.23;

import "./LiquidDemocracyPoll.sol";
import "./LDForumInterface.sol";
import "./Ownable.sol";


contract LiquidDemocracyForum is LDForumInterface, Ownable {

uint public validTopicOptions;
bytes32 public topicMetaData;
/*limits number of delegates removed from original user*/
uint public delegationDepth;
uint public pollId;
uint public delegationExpiration;

mapping(uint => LiquidDemocracyPoll) public pollList;

mapping (address => bool) internal registeredVotersMap;

address[] internal registeredVotersArray;



/* This mapping contains a user's topic delegation per epiration interval
 expirationInterval -> userAddress -> topic -> delegateAddress */
mapping (uint => mapping (address => mapping (uint => address))) public delegatesForUser;

/* This mapping contains a user's willingness to be a delegate per epiration interval
expirationInterval -> userAddress -> topic -> bool */
mapping (uint => mapping (address => mapping (uint => bool))) public willingtoBeTopicDelegate;

modifier isDelegationExpirationIntervalOpen() {
  require(block.timestamp < delegationExpiration, "Delegation Expiration Interval Closed");
  _;
}

/*would clean and reduce modifiers and helper functions for production*/
/*verifies voter is registered*/
  modifier isRegisteredVoter() {
      require(verifyVoter(msg.sender) == true, "Voter is not registered");
    _;
  }
  /*verifies delegate is valid*/
  modifier isValidDelegateForTopic(address _delegateAddress, uint _topic) {
    require(_isValidDelegateForTopic(_delegateAddress, _topic) == true, "Delegate is not a vaild delegate for this topic");
    _;
  }
  /*verifies if vote is delegated*/
  modifier isValidTopicOption(uint _topic) {
    require(_topic <= validTopicOptions, "Topic is not a valid topic");
    _;
  }
  modifier isValidChainDepthAndNonCircular(uint _topic) {
    bool bValid;
    (bValid,,) =_isValidChainDepthAndNonCircular(msg.sender, _topic, 0);
    require(bValid, "Chain depth is too deep or delegations are circular");
    _;
  }

  event newPoll(address _newPollAddress, uint _pollId);
  event delegationExpirationIntervalReset(uint _delegationExpiration);
  event newTopicCreated(uint _numberOfValidTopicOptions, bytes32 _newTopicMetaData);
  event voterRegistered(address _newVoterAddress);
  event newTopicDelegate(address _newDelegate, uint _topic);
  event voteDelegatedByTopic(address _voter, uint _topic, address _delegateAddress);
  event topicDelegationRevoked(address _voter, uint _topic);





constructor (uint _validTopicOptions, bytes32 _topicMetaData, uint _delegationDepth, uint _delegationExpirationInDays) public {
  validTopicOptions = _validTopicOptions;
  topicMetaData = _topicMetaData;
  delegationDepth = _delegationDepth;
  delegationExpiration = block.timestamp + (_delegationExpirationInDays * 1 days);
  pollId = 0;
/*Ideally will have multiple stewards for a forum*/
  owner = msg.sender;
}

function resetDelegationExpirationInterval(uint _numberOfDays)
/*anyone can call this function, time lock is sufficient and desireable*/
 external
{
  require(block.timestamp > delegationExpiration, "Delegation Expiration Interval is still open");
  delegationExpiration = block.timestamp + (_numberOfDays * 1 days);

  emit delegationExpirationIntervalReset(delegationExpiration);
}

function createNewTopic(uint _numberOfValidTopicOptions, bytes32 _newTopicMetaData)
external
/*Ideally will have multiple stewards for a forum to allow many users to create topics/polls*/
onlyOwner
{

  validTopicOptions = _numberOfValidTopicOptions;
  topicMetaData = _newTopicMetaData;

  emit newTopicCreated(_numberOfValidTopicOptions, _newTopicMetaData);
}

function createPoll(
  uint _delegatePeriodEnd,
  uint _votePeriodEnd,
  uint _pctQuorum,
  uint _pctThreshold,
  bytes32 _proposalMetaData,
  uint _validVoteOptions,
  uint _topic
  )
  external
  isValidTopicOption(_topic)
  /*Ideally will have multiple stewards for a forum to allow many users to create topics/polls*/
  onlyOwner
  returns (address)
{

  LiquidDemocracyPoll current = new LiquidDemocracyPoll(
    _delegatePeriodEnd,
    _votePeriodEnd,
    delegationDepth,
    _pctQuorum,
    _pctThreshold,
    _proposalMetaData,
    _validVoteOptions,
    pollId,
    this,
    _topic
      );

  pollList[pollId] = current;

  emit newPoll(current, pollId);

  pollId++;

}

function registerVoter()
external
{

  require(registeredVotersMap[msg.sender] == false, "Voter already registered");

  registeredVotersArray.push(msg.sender);
  registeredVotersMap[msg.sender] = true;

  emit voterRegistered(msg.sender);
}

  /*allows user to offer themselves as a delegate*/
function becomeDelegateForTopic(uint _topic)
external
isRegisteredVoter
isValidTopicOption(_topic)
isDelegationExpirationIntervalOpen
{
  willingtoBeTopicDelegate[delegationExpiration][msg.sender][_topic] = true;

  emit newTopicDelegate(msg.sender, _topic);
}

function delegateVoteForTopic(uint _topic, address _delegateAddress)
external
isRegisteredVoter
isValidDelegateForTopic(_delegateAddress, _topic)
isValidTopicOption(_topic)
isValidChainDepthAndNonCircular(_topic)
isDelegationExpirationIntervalOpen
{

  delegatesForUser[delegationExpiration][msg.sender][_topic] = _delegateAddress;

  emit voteDelegatedByTopic(msg.sender, _topic, _delegateAddress);
}


function revokeDelegationForTopic(uint _topic)
external
isRegisteredVoter
isValidTopicOption(_topic)
isDelegationExpirationIntervalOpen
{

  delegatesForUser[delegationExpiration][msg.sender][_topic] = 0x0;

  emit topicDelegationRevoked(msg.sender, _topic);
}

function readDelegateForTopic(address _userAddress, uint _topic)
external
view
isDelegationExpirationIntervalOpen
returns (address _delegateAddress)
{
  return delegatesForUser[delegationExpiration][_userAddress][_topic];
}

function readEndDelegateForTopic(address _userAddress, uint _topic, uint _recursionCount)
public
view
isDelegationExpirationIntervalOpen
returns (address _endDelegateAddress)
{

  if (_recursionCount > delegationDepth){
   return 0x0;
  }

  if (delegatesForUser[delegationExpiration][_userAddress][_topic] == 0x0) {
    return _userAddress;
  } else {
    return readEndDelegateForTopic(delegatesForUser[delegationExpiration][_userAddress][_topic], _topic, _recursionCount + 1);
  }
}

/* if we can make this a view function, that would be ideal*/
function finalDecision(address _pollAddress)
external
view
returns (uint _finalDecision, uint _finalDecisionTally)
{

  uint totalVotes;
  uint emptyVotes;
  uint[256] memory _tallyResults;

  (_tallyResults, totalVotes, emptyVotes) = tally(_pollAddress);

uint _pctQuorum = LDPollInterface(_pollAddress).readPctQuorum();
uint _pctThreshold = LDPollInterface(_pollAddress).readPctThreshold();

  if (registeredVotersArray.length == 0 || (totalVotes * 100) / (registeredVotersArray.length) < _pctQuorum) {
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

      if (((highestVoteValueHold * 100) / totalVotes) > _pctThreshold) {
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
function tally(address _pollAddress)
public
view
returns (uint[256] _votes, uint _totalVotes, uint _emptyVotes)
{

  /* address forumDelegate = LDForumInterface(forumAddress).readEndDelegateForTopic(_userAddress, topic, 0); */


  //todo: how to handle vote validation and initialization
  for (uint i = 0; i < registeredVotersArray.length; i++){
    uint vote;
  (vote,)  = LDPollInterface(_pollAddress).readVoteAndEndVoter(registeredVotersArray[i], 0);
    _votes[vote]++;

    if(vote > 0){
        _totalVotes++;
    } else {
        _emptyVotes++;
    }
  }
  return (_votes, _totalVotes, _emptyVotes);
}


function _isValidChainDepthAndNonCircular(address _userAddress, uint _topic, uint _recursionCount)
public
view
isDelegationExpirationIntervalOpen
returns(bool _valid, bool _vDepth, bool _vCircle){

  if(_recursionCount > delegationDepth){
    _vDepth = true;
    _valid = false;
    return;
  }

  if (delegatesForUser[delegationExpiration][_userAddress][_topic] != 0x0) {
    if (delegatesForUser[delegationExpiration][_userAddress][_topic] == _userAddress) {
      _valid = false;
      _vCircle = true;
      return;
    }
    return _isValidChainDepthAndNonCircular(delegatesForUser[delegationExpiration][_userAddress][_topic], _topic, _recursionCount + 1);
  } else {
    _valid = true;
    return;
  }
}


 function verifyVoter(address _userAddress)
 view
  public
  returns (bool _voterRegistration){
   if (registeredVotersMap[_userAddress] == true) {
     return true;
   } else {
     return false;
   }
 }

 function _isValidDelegateForTopic(address _userAddress, uint _topic)
 view
  public
  isDelegationExpirationIntervalOpen
  returns (bool _delegateStatus){
   if (willingtoBeTopicDelegate[delegationExpiration][_userAddress][_topic] == true) {
     return true;
   } else {
     return false;
   }
 }

 function () external payable {
   revert();
 }


}

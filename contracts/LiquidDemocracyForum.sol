pragma solidity ^0.4.17;

import "./LiquidDemocracyPoll.sol";
import "./LDForumInterface.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";


contract LiquidDemocracyForum is LDForumInterface, Ownable {
  /*contract LiquidDemocracyForum {*/

/*
create topics that hold many polls
generate polls with designated topic
allow delegation at the topic level
allow different delegations to different topics
implement delegation expiration period
*/


/*modularity could be very cool and allow many different kinds of voting and many different features.*/



bytes32 public validTopicArray;
bytes32 public topicMetaData;
/*limits number of delegates removed from original user*/
uint public delegationDepth;
uint public pollId;
uint public delegationExpiration;

mapping(uint => LiquidDemocracyPoll) public pollList;

mapping (address => bool) internal registeredVotersMap;

address[] internal registeredVotersArray;

/*
  expiration contract possible to simplfy mappings
  delegates could be own contract as well
  OOP approach with contracts as objects
  - could also name something less gnarly and have comment explaining structure
*/

mapping (uint => mapping (address => mapping (uint => address))) public expirationToUserToTopicToDelegateAddress;

mapping (uint => mapping (address => mapping (uint => bool))) public expirationToWillingToBeDelegateToTopicToBool;

modifier isDelegationExpirationIntervalOpen() {
  require(block.timestamp < delegationExpiration);
  _;
}

/*would clean and reduce modifiers and helper functions for production*/
/*verifies voter is registered*/
  modifier isRegisteredVoter() {
      require(_isRegisteredVoter(msg.sender) == true);
    _;
  }
  /*verifies delegate is valid*/
  modifier isValidDelegateForTopic(address _delegateAddress, uint _topic) {
    require(_isValidDelegateForTopic(_delegateAddress, _topic) == true);
    _;
  }
  /*verifies if vote is delegated*/
  modifier isValidTopicOption(uint _topic) {
    require(_isValidTopicOption(_topic) == true);
    _;
  }
  modifier isValidChainDepthAndNonCircular(uint _topic) {
    bool bValid;
    (bValid,,) =_isValidChainDepthAndNonCircular(msg.sender, _topic, 0);
    require(bValid);
    _;
  }

  event newPoll(address _newPollAddress, uint _pollId);

function LiquidDemocracyForum(bytes32 _validTopicArray, bytes32 _topicMetaData, uint _delegationDepth, uint _delegationExpirationInDays) public {
  validTopicArray = _validTopicArray;
  topicMetaData = _topicMetaData;
  delegationDepth = _delegationDepth;
  delegationExpiration = block.timestamp + (_delegationExpirationInDays * 1 days);
  pollId = 0;
/*Ideally will have multiple stewards for a forum*/
  owner = msg.sender;
}

function resetDelegationExpirationInterval(uint _numberOfDays)
/*anyone can call this function, time lock is sufficient and desireable*/
 public
{
  require(block.timestamp > delegationExpiration);
  delegationExpiration = block.timestamp + (_numberOfDays * 1 days);
}

function createNewTopic(bytes32 _newValidTopicArray, bytes32 _newTopicMetaData)
public
/*Ideally will have multiple stewards for a forum to allow many users to create topics/polls*/
onlyOwner
{

  validTopicArray = _newValidTopicArray;
  topicMetaData = _newTopicMetaData;

}

function createPoll(
  uint _delegatePeriodEnd,
  uint _votePeriodEnd,
  uint _pctQuorum,
  uint _pctThreshold,
  bytes32 _proposalMetaData,
  bytes32 _validVoteArray,
  uint _topic
  )
  public
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
    _validVoteArray,
    pollId,
    this,
    _topic
      );

  pollList[pollId] = current;

  newPoll(current, pollId);

  pollId++;

}

function registerVoter_Forum()
external
{

  require(registeredVotersMap[msg.sender] == false);

  registeredVotersArray.push(msg.sender);
  registeredVotersMap[msg.sender] = true;

}

/*delegate stand up could be simple flag which allows any user to delegate for any topic/poll*/

  /*allows user to offer themselves as a delegate*/
function becomeDelegateForTopic(uint _topic)
external
isRegisteredVoter
isValidTopicOption(_topic)
isDelegationExpirationIntervalOpen
{
  expirationToWillingToBeDelegateToTopicToBool[delegationExpiration][msg.sender][_topic] = true;
}

/*Allows user to withdraw as a delegate in all future polls. All polls where they are currently a delegate they will remain a delegate until the poll closes*/

/*withdraw becomes deprecated with delegationExpirationInterval*/

/*function withdrawAsDelegateForTopic(address _userAddress, uint _topic)
external
isRegisteredVoter(_userAddress)
isValidDelegateForTopic(_userAddress, _topic)
{
  expirationToWillingToBeDelegateToTopicToBool[delegationExpiration][_userAddress][_topic] = false;
}*/

function delegateVoteForTopic(uint _topic, address _delegateAddress)
external
isRegisteredVoter
isValidDelegateForTopic(_delegateAddress, _topic)
isValidTopicOption(_topic)
isValidChainDepthAndNonCircular(_topic)
isDelegationExpirationIntervalOpen
{

/*possible mapping name, delegatesForUser, have comment explaing structure*/
  expirationToUserToTopicToDelegateAddress[delegationExpiration][msg.sender][_topic] = _delegateAddress;

}


function revokeDelegationForTopic(uint _topic)
public
isRegisteredVoter
isValidTopicOption(_topic)
isDelegationExpirationIntervalOpen
{

  expirationToUserToTopicToDelegateAddress[delegationExpiration][msg.sender][_topic] = 0x0;

}

function readDelegateForTopic(address _userAddress, uint _topic)
public
view
isDelegationExpirationIntervalOpen
returns (address _delegateAddress)
{
  return expirationToUserToTopicToDelegateAddress[delegationExpiration][_userAddress][_topic];
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

  if (expirationToUserToTopicToDelegateAddress[delegationExpiration][_userAddress][_topic] == 0x0) {
    return _userAddress;
  } else {
    return readEndDelegateForTopic(expirationToUserToTopicToDelegateAddress[delegationExpiration][_userAddress][_topic], _topic, _recursionCount + 1);
  }
}

function _isValidTopicOption(uint _topic) public view returns(bool){
     byte MyByte = validTopicArray[_topic / 8];
     uint MyPosition = 7 - (_topic % 8);

    return  2**MyPosition == uint8(MyByte & byte(2**MyPosition));
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

  if (expirationToUserToTopicToDelegateAddress[delegationExpiration][_userAddress][_topic] != 0x0) {
    if (expirationToUserToTopicToDelegateAddress[delegationExpiration][_userAddress][_topic] == _userAddress) {
      _valid = false;
      _vCircle = true;
      return;
    }
    return _isValidChainDepthAndNonCircular(expirationToUserToTopicToDelegateAddress[delegationExpiration][_userAddress][_topic], _topic, _recursionCount + 1);
  } else {
    _valid = true;
    return;
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

 function _isValidDelegateForTopic(address _userAddress, uint _topic)
 view
  public
  isDelegationExpirationIntervalOpen
  returns (bool _delegateStatus){
   if (expirationToWillingToBeDelegateToTopicToBool[delegationExpiration][_userAddress][_topic] == true) {
     return true;
   } else {
     return false;
   }
 }

 function () external payable {
   revert();
 }


}

pragma solidity ^0.4.17;

import "./LiquidDemocracyPoll.sol";
import "./LDForumInterface.sol";

contract LiquidDemocracyForum is LDForumInterface {
  /*contract LiquidDemocracyForum {*/

/*
create topics that hold many polls
generate polls with designated topic
allow delegation at the topic level
allow different delegations to different topics
implement delegation expiration period
*/

bytes32 public validTopicArray;
bytes32 public topicMetaData;
/*limits number of delegates removed from original user*/
uint public delegationDepth;
uint public pollId;

mapping(uint => LiquidDemocracyPoll) public pollList;

mapping (address => bool) internal registeredVotersMap;

address[] internal registeredVotersArray;

/*mapping (address => topicToDelegate) public userToTopicDelegation;*/

mapping (address => mapping (uint => address)) public userToTopicToDelegateAddress;


/*mapping (uint => userDelegation) public topicToDelegate;*/

/*mapping (address => userDelegation) public userToDelegate;*/

mapping (address => mapping (uint => bool)) public willingToBeDelegateToTopicToBool;

/*struct pollInfo {
  address pollAddress;
  uint topic;
}*/

/*struct userDelegation {
  address delegateAddress;
  uint delegationExpiration;
}*/

/*struct userDelegation {
  address delegateAddress;
  uint delegationExpiration;
  uint[] topicsDelegated;
}*/

/*would clean and reduce modifiers and helper functions for production*/
/*verifies voter is registered*/
  modifier isRegisteredVoter(address _userAddress) {
      require(_isRegisteredVoter(_userAddress) == true);
    _;
  }
  /*verifies delegate is valid*/
  modifier isValidDelegateForTopic(address _userAddress, uint _topic) {
    require(_isValidDelegateForTopic(_userAddress, _topic) == true);
    _;
  }
  /*verifies if vote is delegated*/
  modifier isValidTopicOption(uint _topic) {
    require(_isValidTopicOption(_topic) == true);
    _;
  }
  modifier isValidChainDepthAndNonCircular(address _userAddress, uint _topic) {
    bool bValid;
    (bValid,,) =_isValidChainDepthAndNonCircular(_userAddress, _topic, 0);
    require(bValid);
    _;
  }


function LiquidDemocracyForum(bytes32 _validTopicArray, bytes32 _topicMetaData, uint _delegationDepth) public {
  validTopicArray = _validTopicArray;
  topicMetaData = _topicMetaData;
  delegationDepth = _delegationDepth;
  pollId = 0;
}

function createNewTopic(bytes32 _newValidTopicArray, bytes32 _newTopicMetaData)
public
{

  validTopicArray = _newValidTopicArray;
  topicMetaData = _newTopicMetaData;

}

/*import './Child.sol';

mapping(bytes32 => Child) childList;

function spawnChild(bytes32 childId) {
    Child current = new Child();
    childList[childId] = current;
}

function callChildFunction(bytes32 childId) {
    childList[childId].theChildfunction();
}
*/

event newPoll(address _newPollAddress, uint _pollId);

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

function registerVoter(address _userAddress)
external
{

  require(registeredVotersMap[_userAddress] == false);

  registeredVotersArray.push(_userAddress);
  registeredVotersMap[_userAddress] = true;

}

  /*allows user to offer themselves as a delegate*/
function becomeDelegateForTopic(address _userAddress, uint _topic)
external
isRegisteredVoter(_userAddress)
isValidTopicOption(_topic)
{
  willingToBeDelegateToTopicToBool[_userAddress][_topic] = true;

}

/*Allows user to withdraw as a delegate in all future polls. All polls where they are currently a delegate they will remain a delegate until the poll closes*/
function withdrawAsDelegateForTopic(address _userAddress, uint _topic)
external
isRegisteredVoter(_userAddress)
isValidDelegateForTopic(_userAddress, _topic)
{
  willingToBeDelegateToTopicToBool[_userAddress][_topic] = false;
}

function delegateVote(address _userAddress,uint _topic, address _delegateAddress)
external
isRegisteredVoter(_userAddress)
isValidDelegateForTopic(_delegateAddress, _topic)
isValidTopicOption(_topic)
isValidChainDepthAndNonCircular(_userAddress, _topic)
{

  userToTopicToDelegateAddress[_userAddress][_topic] = _delegateAddress;

}

/*function fReviewDelegatedVotes() public {

}*/

function revokeDelegation(address _userAddress, uint _topic)
public
isRegisteredVoter(_userAddress)
isValidTopicOption(_topic)
{

  userToTopicToDelegateAddress[_userAddress][_topic] = 0x0;

}

function readDelegate(address _userAddress, uint _topic)
public
view
returns (address _delegateAddress)
{
  return userToTopicToDelegateAddress[_userAddress][_topic];
}

function _isValidTopicOption(uint _topic) public view returns(bool){
     byte MyByte = validTopicArray[_topic / 8];
     uint MyPosition = 7 - (_topic % 8);

    return  2**MyPosition == uint8(MyByte & byte(2**MyPosition));
}

function _isValidChainDepthAndNonCircular(address _userAddress, uint _topic, uint _recursionCount) public view returns(bool _valid, bool _vDepth, bool _vCircle){

  if(_recursionCount > delegationDepth){
    _vDepth = true;
    _valid = false;
    return;
  }

  if (userToTopicToDelegateAddress[_userAddress][_topic] != 0x0) {
    if (userToTopicToDelegateAddress[_userAddress][_topic] == _userAddress) {
      _valid = false;
      _vCircle = true;
      return;
    }
    return _isValidChainDepthAndNonCircular(userToTopicToDelegateAddress[_userAddress][_topic], _topic, _recursionCount + 1);
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
  returns (bool _delegateStatus){
   if (willingToBeDelegateToTopicToBool[_userAddress][_topic] == true) {
     return true;
   } else {
     return false;
   }
 }

 function () external payable {
   revert();
 }


}

pragma solidity ^0.4.17;

import "./LiquidDemocracyPoll.sol";

contract LiquidDemocracyForum {

/*
create topics that hold many polls
generate polls with designated topic
allow delegation at the topic level
allow different delegations to different topics
implement delegation expiration period
*/

bytes32 public validTopicArray;
bytes32 public topicMetaData;
uint public pollId;

mapping (address => bool) internal registeredVotersMap;

address[] internal registeredVotersArray;

mapping (address => topicToDelegate) public userToTopicDelegation;

mapping (uint => userDelegation) public topicToDelegate;

/*mapping (address => userDelegation) public userToDelegate;*/

mapping (address => uint) public willingToBeDelegateToTopic;

struct pollInfo {
  address pollAddress;
  uint topic;
}

struct userDelegation {
  address delegateAddress;
  uint delegationExpiration;
}

/*struct userDelegation {
  address delegateAddress;
  uint delegationExpiration;
  uint[] topicsDelegated;
}*/

function LiquidDemocracyForum(bytes32 _validTopicArray) public {
  validTopicArray = _validTopicArray;
  pollId = 0;
}

function createNewTopic(bytes32 _newValidTopicArray) public {
  validTopicArray = _newValidTopicArray;
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

function createPoll() public {

}

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

function withdrawAsDelegate() public {

}

function delegateVote() public {

}

function revokeDelegation() public {

}

}

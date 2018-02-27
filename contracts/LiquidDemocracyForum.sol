pragma solidity ^0.4.18;

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

mapping (address => userDelegation) public userToDelegate;

mapping (address => bool) public willingToBeDelegate;

struct pollInfo {
  address pollAddress;
  uint topic;
}

struct userDelegation {
  address delegateAddress;
  uint delegationExpiration;
}

function LiquidDemocracyForum(bytes32 _validTopicArray) {
  validTopicArray = _validTopicArray;
  pollId = 0;
}

function createTopic() {

}

function createPoll() {

}

function registerUser() {

}

function becomeDelegate() {

}

function withdrawAsDelegate() {

}

function delegateVote() {

}

function revokeDelegation() {

}

}

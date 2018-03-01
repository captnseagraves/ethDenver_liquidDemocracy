pragma solidity ^0.4.17;


contract LDForumInterface {

function createNewTopic(bytes32 _newValidTopicArray, bytes32 _newTopicMetaData) public;
function createPoll( uint _delegatePeriodEnd,  uint _votePeriodEnd,  uint _delegationDepth, uint _pctQuorum, uint _pctThreshold, bytes32 _proposalMetaData, bytes32 _validVoteArray) public;
function registerVoter(address _userAddress) external;
function becomeDelegateForTopic(address _userAddress, uint _topic) external;
function withdrawAsDelegateForTopic(address _userAddress, uint _topic) external;
function delegateVote(address _userAddress,uint _topic, address _delegateAddress)external;
function revokeDelegation(address _userAddress, uint _topic) public;

}

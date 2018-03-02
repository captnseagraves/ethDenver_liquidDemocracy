pragma solidity ^0.4.17;


interface LDForumInterface {


function createNewTopic(bytes32 _newValidTopicArray, bytes32 _newTopicMetaData) public;
function createPoll( uint _delegatePeriodEnd, uint _votePeriodEnd, uint _pctQuorum, uint _pctThreshold, bytes32 _proposalMetaData, bytes32 _validVoteArray, uint _topic) public returns (address);

function registerVoter_Forum(address _userAddress) external;

function becomeDelegateForTopic(address _userAddress, uint _topic) external;

function withdrawAsDelegateForTopic(address _userAddress, uint _topic) external;

function delegateVote_Forum(address _userAddress,uint _topic, address _delegateAddress) external;

function revokeDelegation_Forum(address _userAddress, uint _topic) public;

function readDelegate_Forum(address _userAddress, uint _topic) public view returns (address _delegateAddress);


}

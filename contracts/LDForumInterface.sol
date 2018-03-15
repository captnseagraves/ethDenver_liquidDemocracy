pragma solidity ^0.4.17;


interface LDForumInterface {

  function resetDelegationExpirationInterval(uint _numberOfDays) public;
  function createNewTopic(bytes32 _newValidTopicArray, bytes32 _newTopicMetaData) public;
  function createPoll( uint _delegatePeriodEnd, uint _votePeriodEnd, uint _pctQuorum, uint _pctThreshold, bytes32 _proposalMetaData, bytes32 _validVoteArray, uint _topic) public returns (address);
  function registerVoter_Forum() external;
  function becomeDelegateForTopic(uint _topic) external;
  /*function withdrawAsDelegateForTopic(address _userAddress, uint _topic) external;*/
  function delegateVoteForTopic(uint _topic, address _delegateAddress) external;
  function revokeDelegationForTopic(uint _topic) public;
  function readDelegateForTopic(address _userAddress, uint _topic) public view returns (address _delegateAddress);
  function readEndDelegateForTopic(address _userAddress, uint _topic, uint _recursionCount) public view returns (address _endDelegateAddress);
}

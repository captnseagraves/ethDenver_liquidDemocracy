pragma solidity ^0.4.23;


interface LDForumInterface {

  function resetDelegationExpirationInterval(uint _numberOfDays) external;
  function createNewTopic(uint _numberOfValidTopicOptions, bytes32 _newTopicMetaData) external;
  function createPoll( uint _delegatePeriodEnd, uint _votePeriodEnd, uint _pctQuorum, uint _pctThreshold, bytes32 _proposalMetaData, uint _validVoteOptions, uint _topic) external returns (address);
  function registerVoter() external;
  function becomeDelegateForTopic(uint _topic) external;
  function delegateVoteForTopic(uint _topic, address _delegateAddress) external;
  function revokeDelegationForTopic(uint _topic) external;
  function readDelegateForTopic(address _userAddress, uint _topic) external view returns (address _delegateAddress);
  function readEndDelegateForTopic(address _userAddress, uint _topic, uint _recursionCount) external view returns (address _endDelegateAddress);
  function finalDecision(address _pollAddress) external view returns (uint _finalDecision, uint _finalDecisionTally);
  function tally(address _pollAddress) external view returns (uint[256] _votes, uint _totalVotes, uint _emptyVotes);
  function verifyVoter(address _userAddress) view external returns (bool _voterRegistration);
}

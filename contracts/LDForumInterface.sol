pragma solidity ^0.4.17;


interface LDForumInterface {

  function resetDelegationExpirationInterval(uint _numberOfDays) public;
  function createNewTopic(uint _numberOfValidTopicOptions, bytes32 _newTopicMetaData) public;
  function createPoll( uint _delegatePeriodEnd, uint _votePeriodEnd, uint _pctQuorum, uint _pctThreshold, bytes32 _proposalMetaData, uint _validVoteOptions, uint _topic) public returns (address);
  function registerVoter_Forum() external;
  function becomeDelegateForTopic(uint _topic) external;
  /*function withdrawAsDelegateForTopic(address _userAddress, uint _topic) external;*/
  function delegateVoteForTopic(uint _topic, address _delegateAddress) external;
  function revokeDelegationForTopic(uint _topic) public;
  function readDelegateForTopic(address _userAddress, uint _topic) public view returns (address _delegateAddress);
  function readEndDelegateForTopic(address _userAddress, uint _topic, uint _recursionCount) public view returns (address _endDelegateAddress);
  /* function finalDecision() public view returns (uint _finalDecision, uint _finalDecisionTally); */
  function tally(address _pollAddress) public view returns (uint[256] _votes, uint _totalVotes, uint _emptyVotes);
  function verifyVoter(address _userAddress) view public returns (bool _voterRegistration);
}

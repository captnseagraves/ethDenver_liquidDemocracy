pragma solidity ^0.4.17;


interface LDPollInterface {

  function registerVoter() external;
  function becomeDelegate() external;
  function vote(uint _value) external;
  function delegateVote(address _delegateAddress) external;
  function readVote(address _userAddress, uint _recursionCount) public view returns (uint);
  function readEndVoter(address _userAddress, uint _recursionCount) public view returns (address);
  function readDelegate(address _userAddress) external view returns (address _delegateAddress);
  function revokeDelegationForPoll() public;
  function withdrawDirectVote() public;
  function finalDecision() public view returns (uint _finalDecision, uint _finalDecisionTally);
  function tally() public view returns (uint[256] _votes, uint _totalVotes, uint _emptyVotes);

}

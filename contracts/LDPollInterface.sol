pragma solidity ^0.4.23;


interface LDPollInterface {

  function becomeDelegate() external;
  function vote(uint _value) external;
  function delegateVote(address _delegateAddress) external;
  function readVoteAndEndVoter(address _userAddress, uint _recursionCount) public view returns (uint _voteValue, address _endVoterAddress);
  function readPctQuorum() external view returns (uint);
  function readPctThreshold() external view returns (uint);
  function readDelegate(address _userAddress) external view returns (address _delegateAddress);
  function revokeDelegationForPoll() external;
  function withdrawDirectVote() external;

}

pragma solidity ^0.4.17;


interface LDPollInterface {

  function becomeDelegate() external;
  function vote(uint _value) external;
  function delegateVote(address _delegateAddress) external;
  function readVoteAndEndVoter(address _userAddress, uint _recursionCount) public view returns (uint _voteValue, address _endVoterAddress);
  /*function readEndVoter(address _userAddress, uint _recursionCount) public view returns (address);*/
  function readDelegate(address _userAddress) external view returns (address _delegateAddress);
  function revokeDelegationForPoll() public;
  function withdrawDirectVote() public;

}

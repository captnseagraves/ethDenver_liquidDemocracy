pragma solidity ^0.4.17;

import "zeppelin-solidity/contracts/math/SafeMath.sol";


contract liquidTest {
  using SafeMath for uint;


  /*needs to:
   register user/generate vote
   count yea
   count nay
   count total votes
   allow user to vote yea
   allow user to vote nay
   allow user to delegate vote
   allow user to recall delegation
   translate delegates vote into user's vote
   read delegated vote
   3 periods in vote schedule
    - discussion period
    - delegation period
    - vote period


   pct for quorum
   fallback that reverts if any ether is sent to contract
   Ownable
   SafeMath

  */


  /* written as seconds since unix epoch*/
  uint public delegatePeriodEnd;
  /* written as seconds since unix epoch*/
  uint public votePeriodEnd;
  uint public countPeriodEnd;
  uint public pctQuorum;
  bytes32 public proposalMetaData;


/*need to account for circlular delgeation*/
/*if delgegate delegates needs to pass on votes
  if delegate delegates and then revokes need to track votes between parties.
*/

  /*tracks user registration and single signup*/
  address[] internal registeredVoters;

  /*0 equals no vote, 1 equals yea, 2 equals nay, 3 equals delegated vote*/
  mapping (address => uint) internal userVotes;

  /*points to voter delegate*/
  mapping (address => address) internal userToDelegate;

  /*counts number of votes delegate manages*/
  mapping (address => uint) internal delegateeToVotesManaged;

  mapping (address => bool) internal willingToBeDelegate;


/*verifies delegate period open*/
  modifier delegatePeriodOpen(){
    require(block.timestamp < delegatePeriodEnd);
    _;
  }

/*verifies vote period open*/
  modifier votePeriodOpen(){
    require(block.timestamp < votePeriodEnd);
    _;
  }

  /*verifies count period open*/
    modifier countPeriodOpen(){
      require(block.timestamp < countPeriodEnd);
      _;
    }

  modifier isRegisteredVoter(address _userAddress) {
    require(registeredVoters[_userAddress] == true);
    _;
  }

  modifier isValidDelegate(address _userAddress) {
    require(willingToBeDelegate[_userAddress] == true);
    _;
  }

/*still need to figure this out*/
  modifier isVoteDelegated(address _userAddress) {
    require(_isVoteDelegated(_userAddress) == false);
    _;
  }

  function liquidTest(
    uint _delegatePeriodEnd,
    uint _votePeriodEnd,
    uint _countPeriodEnd,
    uint _pctQuorum,
    bytes32 _proposalMetaData
    ) internal {
      delegatePeriodEnd = _delegatePeriodEnd;
      votePeriodEnd = _votePeriodEnd;
      countPeriodEnd = _countPeriodEnd;
      pctQuorum = _pctQuorum;
      proposalMetaData = _proposalMetaData;
      countedYeas = 0;
      countedNays = 0;
  }

  function registerVoter(address _userAddress)
  external
  {
    require(registeredVoters[_userAddress] == false);

    registeredVoters[_userAddress] = true;

  }

  function allowDelegation(address _userAddress)
  external
  isRegisteredVoter(_userAddress)
  {
    willingToBeDelegate[_userAddress] = true;
  }

  function voteYea(address _userAddress)
  external
  isRegisteredVoter(_userAddress)
  votePeriodOpen()
  isVoteDelegated(_userAddress)
  {

    userVotes[_userAddress] = 1;

  }

  function voteNay(address _userAddress)
  external
  isRegisteredVoter(_userAddress)
  votePeriodOpen()
  isVoteDelegated(_userAddress)
  {

    userVotes[_userAddress] = 2;

  }

  function delegateVote(address _userAddress, address _delegateAddress)
  external
  isRegisteredVoter(_userAddress)
  isValidDelegate(_delegateAddress)
  delegatePeriodOpen()
  {

    userToDelegate[_userAddress] == _delegateAddress;
    userVotes[_userAddress] == 3;

    uint prevDelegateCount = delegateeToVotesManaged[_delegateAddress];

    delegateeToVotesManaged[_delegateAddress] = prevDelegateCount.add(1);

  }

  function readVote(address _userAddress)
  public
  returns (uint _userVote, address _endVoterAddress)
  {

    if (userVotes[_userAddress] != 3) {
      return (userVotes[_userAddress], _userAddress);
    } else if (userVotes[userToDelegate[_userAddress]] == 3) {
       readVote(userToDelegate[_userAddress]);
    }
  }

  function revokeDelegation(address _userAddress, address _delegateAddress)
  public
  isRegisteredVoter(_userAddress)
  votePeriodOpen()
  {

    userVotes[_userAddress] = 0;
    /*userToDelegate[_userAddress] = 0;*/

    uint prevDelegateCount = delegateeToVotesManaged[_delegateAddress];

    delegateeToVotesManaged[_delegateAddress] = prevDelegateCount.sub(1);

  }

  /*may not need this with the iterative process*/

  /*function countDelegateVotes(address _userAddress)
    external
    isValidDelegate(_userAddress)
    countPeriodOpen()
  {
    if (userVotes[_userAddress] == 1) {
      countedYeas.add(delegateeToVotesManaged[_userAddress]);
    } else if (userVotes[_userAddress] == 2) {
        countedNays.add(delegateeToVotesManaged[_userAddress]);
    }

    delegateeToVotesManaged[_userAddress] = 0;
  }*/

  function decision()
  view
  external
  returns (uint _yeas, uint _nays, uint _emptyVotes, uint _pctQuorum, uint _theDecision)
  {

    uint emptyVotes = 0;
    uint countedYeas = 0;
    uint countedNays = 0;
    uint totalVotes = countYeas.add(countedNays);

    for(i = 0; i < registeredVoters.length; i++){

      if(readVote(registeredVoters[i]) == 0){
        emptyVotes.add(1);
      }
      if(readVote(registeredVoters[i]) == 1){
        countedYeas.add(1);
      } else if(readVote(registeredVoters[i]) == 2{
        countedNays.add(1);
      }


    }

    /*uint _decision;
    uint _totalVotes = countedYeas.add(countedNays);
    uint _pctYeas = _totalVotes.div(countedYeas);
    uint _pctNays = _totalVotes.div(countedNays);

    if (_pctYeas > _pctQuorum) {
      _decision = 1;
    } else if (_pctNays > _pctQuorum) {
      _decision = 2;
    } else if (_pctYeas == _pctNays) {
      _decision = 3;
    }*/
    return (countedYeas, countedNays, pctQuorum, _decision);
  }

  function _isVoteDelegated(address _userAddress)
  view
   internal
   returns (bool _voteStatus){
    if (userVotes[_userAddress] == 3) {
      return true;
    } else {
      return false;
    }
  }

  function () external payable {
    revert();
  }

}

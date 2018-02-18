pragma solidity ^0.4.17;

import "zeppelin-solidity/contracts/math/SafeMath.sol";


contract liquidTest {
  using SafeMath for uint;

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
  mapping (address => bool) internal registeredVotersMap;

  /*allows contract to iterate over voters to tally votes and follow delegation chains*/
  address[] internal registeredVotersArray;

  /*0 equals no vote, 1 equals yea, 2 equals nay, 3 equals delegated vote*/
  mapping (address => uint) internal userVotes;

  /*points to voter delegate*/
  mapping (address => address) internal userToDelegate;

  /*counts number of votes delegate manages*/
  /*mapping (address => uint) internal delegateeToVotesManaged;*/

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
        require(_isRegisteredVoter(_userAddress) == true);
      _;
    }

    modifier isValidDelegate(address _userAddress) {
      require(_isValidDelegate(_userAddress) == true);
      _;
    }

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
  }

  function registerVoter(address _userAddress)
  external
  {

    require(registeredVotersMap[_userAddress] == false);

    registeredVotersArray.push(_userAddress);
    registeredVotersMap[_userAddress] = true;


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

    /*may not need this vote count*/

    /*uint prevDelegateCount = delegateeToVotesManaged[_delegateAddress];

    delegateeToVotesManaged[_delegateAddress] = prevDelegateCount.add(1);*/

  }

  function readVote(address _userAddress)
  view
  public
  returns (uint _userVote)
  {
    if (userVotes[_userAddress] != 3) {
      return (userVotes[_userAddress]);
    } else if (userVotes[userToDelegate[_userAddress]] == 3) {
       readVote(userToDelegate[_userAddress]);
    }
  }

  function readEndVoter(address _userAddress)
  view
  public
  returns (address _endVoterAddress)
  {

    if (userVotes[_userAddress] != 3) {
      return (_userAddress);
    } else if (userVotes[userToDelegate[_userAddress]] == 3) {
       readVote(userToDelegate[_userAddress]);
    }
  }

  function revokeDelegation(address _userAddress)
  public
  isRegisteredVoter(_userAddress)
  votePeriodOpen()
  {

    userVotes[_userAddress] = 0;
    userToDelegate[_userAddress] = 0;

    /*may not need this count mechanism*/

    /*uint prevDelegateCount = delegateeToVotesManaged[_delegateAddress];

    delegateeToVotesManaged[_delegateAddress] = prevDelegateCount.sub(1);*/

  }


  function decision()
  view
  external
  returns (uint _yeas, uint _nays, uint _totalVotes, uint _emptyVotes, uint _pctQuorum, uint _decision)
  {

    uint decision;
    uint emptyVotes = 0;
    uint countedYeas = 0;
    uint countedNays = 0;
    uint totalVotes = countedYeas.add(countedNays);

    for (uint i = 0; i < registeredVotersArray.length; i++){

      if(readVote(registeredVotersArray[i]) == 0){
        emptyVotes.add(1);
      } else if(readVote(registeredVotersArray[i]) == 1) {
        countedYeas.add(1);
      } else if(readVote(registeredVotersArray[i]) == 2) {
        countedNays.add(1);
      }
    }

    if (countedYeas > totalVotes.div(pctQuorum)){
      decision = 1;
    } else {
      decision = 2;
    }


    return (countedYeas, countedNays, totalVotes, emptyVotes, pctQuorum, decision);
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

  function _isRegisteredVoter(address _userAddress)
  view
   public
   returns (bool _voterRegistration){
    if (registeredVotersMap[_userAddress] == true) {
      return true;
    } else {
      return false;
    }
  }

  function _isValidDelegate(address _userAddress)
  view
   public
   returns (bool _delegateStatus){
    if (willingToBeDelegate[_userAddress] == true) {
      return true;
    } else {
      return false;
    }
  }

  function () external payable {
    revert();
  }

}

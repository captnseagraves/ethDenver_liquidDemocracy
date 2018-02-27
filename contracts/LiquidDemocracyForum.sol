pragma solidity ^0.4.17;

import "./LiquidDemocracyPoll.sol";

contract LiquidDemocracyForum {

/*
create topics that hold many polls
generate polls with designated topic
allow delegation at the topic level
allow different delegations to different topics
implement delegation expiration period
*/

bytes32 public validTopicArray;
bytes32 public topicMetaData;
/*limits number of delegates removed from original user*/
uint public delegationDepth;
uint public pollId;

/*why store this as bytes32 vs address*/
mapping(bytes32 => LiquidDemocracyPoll) pollList;

mapping (address => bool) internal f_registeredVotersMap;

address[] internal f_registeredVotersArray;

mapping (address => f_topicToDelegate) public f_userToTopicDelegation;

mapping (uint => userDelegation) public f_topicToDelegate;

/*mapping (address => userDelegation) public userToDelegate;*/

mapping (address => uint) public f_willingToBeDelegateToTopic;

struct pollInfo {
  address pollAddress;
  uint topic;
}

struct userDelegation {
  address delegateAddress;
  uint delegationExpiration;
}

/*struct userDelegation {
  address delegateAddress;
  uint delegationExpiration;
  uint[] topicsDelegated;
}*/

/*would clean and reduce modifiers and helper functions for production*/
/*verifies voter is registered*/
  modifier f_isRegisteredVoter(address _userAddress) {
      require(_f_isRegisteredVoter(_userAddress));
    _;
  }
  /*verifies delegate is valid*/
  modifier f_isValidDelegate(address _userAddress) {
    require(_f_isValidDelegate(_userAddress));
    _;
  }
  /*verifies if vote is delegated*/
  modifier f_isValidTopicOption(uint _topic) {
    require(_f_isValidTopicOption(_topic));
    _;
  }
  modifier f_isValidChainDepthAndNonCircular(address _userAddress) {
    bool bValid;
    (bValid,,) =_f_isValidChainDepthAndNonCircular(_userAddress, 0);
    require(bValid);
    _;
  }


function LiquidDemocracyForum(bytes32 _validTopicArray, bytes32 _topicMetaData, uint _delegationDepth) public {
  validTopicArray = _validTopicArray;
  topicMetaData = _topicMetaData;
  delegationDepth = _delegationDepth;
  pollId = 0;
}

function f_createNewTopic(bytes32 _newValidTopicArray, bytes32 _newTopicMetaData)
public
{

  validTopicArray = _newValidTopicArray;
  topicMetaData = _newTopicMetaData;

}

/*import './Child.sol';

mapping(bytes32 => Child) childList;

function spawnChild(bytes32 childId) {
    Child current = new Child();
    childList[childId] = current;
}

function callChildFunction(bytes32 childId) {
    childList[childId].theChildfunction();
}
*/

function f_createPoll(
  uint _delegatePeriodEnd,
  uint _votePeriodEnd,
  uint _delegationDepth,
  uint _pctQuorum,
  uint _pctThreshold,
  bytes32 _proposalMetaData,
  bytes32 _validVoteArray
  )
  public
{

  LiquidDemocracyPoll current = new LiquidDemocracyPoll(
      uint _delegatePeriodEnd,
      uint _votePeriodEnd,
      uint _delegationDepth,
      uint _pctQuorum,
      uint _pctThreshold,
      bytes32 _proposalMetaData,
      bytes32 _validVoteArray
      );
  pollList[pollId] = current;
  pollId++;

}

function f_registerVoter(address _userAddress)
external
{

  require(fRegisteredVotersMap[_userAddress] == false);

  fRegisteredVotersArray.push(_userAddress);
  fRegisteredVotersMap[_userAddress] = true;

}

  /*allows user to offer themselves as a delegate*/
function f_becomeDelegate(address _userAddress)
external
f_isRegisteredVoter(_userAddress)
{
  fWillingToBeDelegate[_userAddress] = true;
}

/*Allows user to withdraw as a delegate in all future polls. All polls where they are currently a delegate they will remain a delegate until the poll closes*/
function f_withdrawAsDelegate() public {

}

function f_delegateVote(address _userAddress, address _delegateAddress)
external
f_isRegisteredVoter(_userAddress)
f_isValidDelegate(_delegateAddress)
f_isValidChainDepthAndNonCircular(_userAddress)
{

  userToDelegate[_userAddress] = _delegateAddress;

}

/*function fReviewDelegatedVotes() public {

}*/

function f_revokeDelegation(address _userAddress)
public
f_isRegisteredVoter(_userAddress)
{

  userVotes[_userAddress] = 0;
  userToDelegate[_userAddress] = 0;

}

function _f_isValidTopicOption(uint _topic) public view returns(bool){
     byte MyByte = validTopicArray[_topic / 8];
     uint MyPosition = 7 - (_vote % 8);

    return  2**MyPosition == uint8(MyByte & byte(2**MyPosition));
}

function _f_isValidChainDepthAndNonCircular(address _userAddress, uint _recursionCount) public view returns(bool _valid, bool _vDepth, bool _vCircle){

  if(_recursionCount > delegationDepth){
    _vDepth = true;
    _valid = false;
    return;
  }

  if (userToDelegate[_userAddress] != 0x0) {
    if (userToDelegate[_userAddress] == _userAddress) {
      _valid = false;
      _vCircle = true;
      return;
    }
    return _f_isValidChainDepthAndNonCircular(userToDelegate[_userAddress], _recursionCount + 1);
  } else {
    _valid = true;
    return;
  }
}

 /*these addtional functions allow me to test contract. would remove bottom two for production and implement in modifier*/



 function _f_isRegisteredVoter(address _userAddress)
 view
  public
  returns (bool _voterRegistration){
   if (f_registeredVotersMap[_userAddress] == true) {
     return true;
   } else {
     return false;
   }
 }

 function _f_isValidDelegate(address _userAddress)
 view
  public
  returns (bool _delegateStatus){
   if (f_willingToBeDelegate[_userAddress] == true) {
     return true;
   } else {
     return false;
   }
 }

 function () external payable {
   revert();
 }


}

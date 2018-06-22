pragma solidity ^0.4.23;

import "./LDPollInterface.sol";
import "./LDForumInterface.sol";


contract LiquidDemocracyPoll is LDPollInterface {
    /*contract LiquidDemocracyPoll {*/


    /* times written as seconds since unix epoch*/
    /*end of delegate period*/
    uint public delegatePeriodEnd;
    /*end of vote period*/
    uint public votePeriodEnd;
    /*percentage of registered voters rsponding needed to acheive valid poll*/
    uint public pctQuorum;
    /*percentage of votes toward a particular option needed to acheive successful option*/
    uint public pctThreshold;
    /*limits number of delegates removed from original user*/
    uint public delegationDepth;
    /*possible IPFS hash of proposal metadata*/
    bytes32 public proposalMetaData;
    /*256 bit array that holds the validity of each possible vote option. Options are referenced and defined in poll metadata. */
    uint public validVoteOptions;

    uint public pollId;
    address public forumAddress;
    uint public topic;


    /*redundant voter registers solve for different major issues when each is used individually*/


    /*0 equals no vote, other values will equate to those set in vote initialization*/
    mapping (address => uint) public userVotes;

    /*points to voter delegate*/
    mapping (address => address) public userToDelegate;

    /* mapping of valid delegates */
    mapping (address => bool) public willingToBeDelegate;


    /*verifies delegate period open*/
    modifier delegatePeriodOpen(){
        require(block.timestamp < delegatePeriodEnd, "Delegate Period Closed");
        _;
    }

    /*verifies vote period open*/
    modifier votePeriodOpen(){
        require(block.timestamp < votePeriodEnd, "Vote Period Closed");
        _;
    }

  /*would clean and reduce modifiers and helper functions for production*/
  /*verifies voter is registered*/
    modifier isRegisteredVoter() {
        require(_isRegisteredVoter(msg.sender) == true, "Voter is not registered");
        _;
    }

    /*verifies delegate is valid*/
    modifier isValidDelegate(address _delegateAddress) {
        require(_isValidDelegate(_delegateAddress) == true, "Delegate is not a valid delegate for this poll");
        _;
    }

    /*verifies if vote is delegated*/
    modifier isValidVoteOption(uint _vote) {
        require(_vote <= validVoteOptions, "Invalid vote option");
        _;
    }

    modifier isValidChainDepthAndNonCircular() {
        bool bValid;

        (bValid,,) = _isValidChainDepthAndNonCircular(msg.sender, 0);
        require(bValid, "Chain depth is too deep or delegations are circular");
        _;
    }

    modifier isVoterDelegateAndDelegatePeriodOpen() {
        if (willingToBeDelegate[msg.sender] == true) {
            require(block.timestamp < delegatePeriodEnd, "Delegate Period Closed");
        }
        _;
    }

    event newPollDelegate(address _newDelegate);
    event directVote(address _voter, uint _value);
    event voteDelegated(address _voter, address _delegateAddress);
    event delegationRevoked(address _voter);
    event voteWithdrawn(address _voter);
    event forumAddressChanged(address _newForumAddress);


    constructor (
        uint _delegatePeriodEnd,
        uint _votePeriodEnd,
        uint _delegationDepth,
        uint _pctQuorum,
        uint _pctThreshold,
        bytes32 _proposalMetaData,
        uint _validVoteOptions,
        uint _pollId,
        address _forumAddress,
        uint _topic
        ) public {

        delegatePeriodEnd = _delegatePeriodEnd;
        votePeriodEnd = _votePeriodEnd;
        delegationDepth = _delegationDepth;
        pctQuorum = _pctQuorum;
        pctThreshold = _pctThreshold;
        proposalMetaData = _proposalMetaData;
        validVoteOptions = _validVoteOptions;
        pollId = _pollId;
        forumAddress = _forumAddress;
        topic = _topic;

    }


    /*allows user to offer themselves as a delegate*/
    function becomeDelegate()
    external
    isRegisteredVoter
    delegatePeriodOpen
    {
        willingToBeDelegate[msg.sender] = true;

        emit newPollDelegate(msg.sender);
    }

    /*allows user to vote a value*/
    function vote(uint _value)
    external
    isRegisteredVoter
    isVoterDelegateAndDelegatePeriodOpen
    isValidVoteOption(_value)
    votePeriodOpen
    {
        userVotes[msg.sender] = _value;

        /* Ideally a vote would be anonymous */
        emit directVote(msg.sender, _value);
    }

    /* allows user to delegate their vote to another user who is a valid delegeate*/
    function delegateVote(address _delegateAddress)
    external
    isRegisteredVoter
    isValidDelegate(_delegateAddress)
    isValidChainDepthAndNonCircular
    delegatePeriodOpen
    {
        userToDelegate[msg.sender] = _delegateAddress;

        emit voteDelegated(msg.sender, _delegateAddress);
    }


    /*allows user to read their vote or their delegate's vote
    returns users vote*/
    function readVoteAndEndVoter(address _userAddress, uint _recursionCount)
    public
    view
    returns (uint _voteValue, address _endVoterAddress)
    {

        if (userVotes[_userAddress] != 0) {
            _voteValue = userVotes[_userAddress];
            _endVoterAddress = _userAddress;
            return;
        }

        if (_recursionCount > delegationDepth){
            _voteValue = 0;
            _endVoterAddress = _userAddress;
            return;
        }

        address forumDelegate = LDForumInterface(forumAddress).readEndDelegateForTopic(_userAddress, topic, 0);

        if (userToDelegate[_userAddress] != 0x0) {
            return readVoteAndEndVoter(userToDelegate[_userAddress], _recursionCount + 1);
        } else if (forumDelegate != 0x0) {
            return readVoteAndEndVoter(forumDelegate, _recursionCount + 1);
        } else {
            _voteValue = 0;
            _endVoterAddress = _userAddress;
            return;
        }
    }


    /*allows user to read user they delegated their vote to*/
    function readDelegate(address _userAddress)
    external
    view
    returns (address _delegateAddress)
    {
        address forumDelegate = LDForumInterface(forumAddress).readDelegateForTopic(_userAddress, topic);

        if (userToDelegate[_userAddress] != 0x0) {
            return userToDelegate[_userAddress];
        } else if (forumAddress != 0x0) {
            return forumDelegate;
        } else {
            return 0x0;
        }

    }

    /*allows user to revoke their delegation if they disagree with delegates vote*/
    function revokeDelegationForPoll()
    external
    isRegisteredVoter
    votePeriodOpen
    {
        userToDelegate[msg.sender] = 0x0;

        emit delegationRevoked(msg.sender);
    }



    function withdrawDirectVote()
    external
    isRegisteredVoter
    votePeriodOpen
    {
        userVotes[msg.sender] = 0;

        emit voteWithdrawn(msg.sender);
    }

    function readPctQuorum()
      external
      view
      returns (uint)
    {
        return pctQuorum;
    }

    function readPctThreshold()
      external
      view
      returns (uint)
    {
        return pctThreshold;
    }

    /* this needs access controls */
    function changeForumAddress(address _newForumAddress)
    external
    {
        forumAddress = _newForumAddress;

        emit forumAddressChanged(_newForumAddress);
    }

    function _isValidChainDepthAndNonCircular(address _userAddress, uint _recursionCount)
      public
      view
      returns(bool _valid, bool _vDepth, bool _vCircle)
    {

        if (_recursionCount > delegationDepth){
            _vDepth = true;
            _valid = false;
            return;
        }

        address forumDelegate = LDForumInterface(forumAddress).readDelegateForTopic(_userAddress, topic);

        if (userToDelegate[_userAddress] != 0x0 || forumDelegate != 0x0) {
            if (userToDelegate[_userAddress] == _userAddress || forumDelegate == _userAddress) {
                _valid = false;
                _vCircle = true;
                return;
            }
            return _isValidChainDepthAndNonCircular(userToDelegate[_userAddress], _recursionCount + 1);
        } else {
            _valid = true;
            return;
        }
    }

    /*these addtional functions allow me to test contract. would remove bottom two for production and implement in modifier*/


    function _isRegisteredVoter(address _userAddress)
        view
        public
        returns (bool _voterRegistration)
    {
        if (LDForumInterface(forumAddress).verifyVoter(_userAddress) == true) {
            return true;
        } else {
            return false;
        }
    }

    function _isValidDelegate(address _userAddress)
    view
    public
    returns (bool _delegateStatus)
    {
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

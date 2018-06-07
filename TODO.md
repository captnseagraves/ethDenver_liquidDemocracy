
ToDo List:
-------------------------------------------------------------------------------------------
Testing:

- test vote and non-vote functions with delegation expiration
  -- test delegation read correctly from different delegationExpirationIntervals

- test tally works correctly reading from topic delegation, poll delegation, and direct
     voting.
  -- need to test topic delegations with first poll


- test delegation read correctly from different delegationExpirationIntervals
  -- may not be possible because of protocol time
    -- look into OpenZeppelin test helpers

- test no user can manipulate another voter's vote, delegations, or privileged  
   functionality

- test circular delegations for poll and forum

- test delegation depth for poll and forum

- test for events beyond new poll
-------------------------------------------------------------------------------------------
Refactor/Additions:

- implement require error statements a la solidity 0.4.23

- ensure user cant revoke delegation after vote has passed, or find way to write outcome
   of poll to ensure correct outcome documented

- figure out how to handle ties
  -- return array of winners, if array is length 1, easy solution.
    -- cant return variable length array (may be doable with solidity 0.4.23)
  -- if tied, auto-generate run-off poll
    -- Could do once contracts can call functions/pay gas. Ethical question for DAOs to execute automatically. Don't want AI's to take over.
    -- Could run result via Trubit and have human execute outcome.

- implement safeMath

- add events

- Want to think about not having users stand up as delegates, but allow anyone to delegate
  to anyone
  -- delegate stand up could be simple flag which allows any user to delegate for any topic/poll
  -- might require heavy refactor and cause problems with revoking delegations

- Comment all tests and functionality

-------------------------------------------------------------------------------------------
  Harder stuff:

- Modularize contracts
  -- expiration contract possible to simplify mappings
    delegates could be own contract as well

- Add token weighted functionality

- figure out how to take action based on outcome of poll
  -- likely some sort of trueBit off chain computation while keeping tally()/finalDecision() view function
  -- or make tally()/finalDecision() gas conscious and stop/start until computation
     finished and result executed.

- implement ACL
  -- Ideally will have multiple stewards for a forum to allow many users to create    
     topics/polls

- figure out how to call resetDelegationExpirationInterval() automatically




modifier isVoteDelegated() {
  require(_isVoteDelegated(msg.sender) == false, );
  _;
}



  function _isVoteDelegated(address _userAddress)
   view
   internal
   returns (bool _voteStatus)
  {

     address forumDelegate = LDForumInterface(forumAddress).readDelegateForTopic(_userAddress, topic);

    if (userToDelegate[_userAddress] != 0x0 || forumDelegate != 0x0) {
      return true;
    } else {
      return false;
    }
  }

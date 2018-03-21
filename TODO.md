
ToDo List:

- test vote and non-vote functions with delegation expiration
  -- test delegation read correctly from different delegationExpirationIntervals

- test tally works correctly reading from topic delegation, poll delegation, and direct
     voting.
  -- need to test topic delegations with first poll


- test delegation read correctly from different delegationExpirationIntervals
  -- may not be possible because of protocol time

- test no user can manipulate another voter's vote, delegations, or privileged  
   functionality

- test circular delegations for poll and forum

- test delegation depth for poll and forum

- ensure user cant revoke delegation after vote has passed, or find way to write outcome
   of poll to ensure correct outcome documented

- figure out how to handle ties
  -- return array of winners, if array is length 1, easy solution.
  -- if tied, auto-generate run-off poll

- figure out how to take action based on outcome of poll
  -- likely some sort of trueBit off chain computation while keeping tally()/finalDecision() view function
  -- or make tally()/finalDecision() gas conscious and stop/start until computation
     finished and result executed.

- figure out how to call resetDelegationExpirationInterval() automatically

- refactor to use registered voters in forum / examine pros and cons of doing so

- add events

- add error handling a la midnight

- Want to think about not having users stand up as delegates, but allow anyone to delegate
  to anyone
  -- delegate stand up could be simple flag which allows any user to delegate for any topic/poll
  -- might require heavy refactor and cause problems with revoking delegations

- Modularize contracts
  -- expiration contract possible to simplify mappings
    delegates could be own contract as well
    OOP approach with contracts as objects

- Add token weighted functionality

- implement ACL
  -- Ideally will have multiple stewards for a forum to allow many users to create    
     topics/polls

- Comment all tests and functionality

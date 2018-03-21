
ToDo List:

- test vote and non-vote functions with delegation expiration
  -- test delegation read correctly from different delegationExpiratoinIntervals

- test tally works correctly reading from topic delegation, poll delegation, and direct voting.
  -- need to test topic delegations with first poll

- ensure user cant revoke delegation after vote has passed, or find way to write outcome of poll to ensure correct outcome documented

- test delegation read correctly from different delegationExpiratoinIntervals
  -- may not be possible because of protocol time

- test no user can manipulate another voter's vote, delegations, or privileged funcitonality

- test circular delegations for poll and forum

- test delegation depth for poll and forum



- Comment all tests and functionality

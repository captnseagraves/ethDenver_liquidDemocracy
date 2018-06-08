# ethDenver_liquidDemocracy

*** Contracts have not been assessed or optimized for gas ***

To Run:
Truffle v4.1.8 (core: 4.1.8)
Solidity v0.4.23 (solc-js)w
- npm i
- To avoid gas issues: ganache-cli -s 1 -i 50 -l 100000000
- truffle compile
- truffle migrate
- truffle test

To test test-coverage run solidity-coverage: ./node_modules/.bin/solidity-coverage

Funtionality and intended use
- A user can create a forum to hold the decision making activities of a community.

- In the forum users can:
  -- register for as a voter/member of the forum
  -- create polls
  -- propose topics in which to categorize polls
  -- stand up as a delegate for one or many topics
  -- delegate other users to carry the weight of their vote for a   
      given topic.
  -- revoke any given delegation at the topic level
  -- set a delegation expiration interval to record forum level delegation epochs. This expiration interval promotes engagement and consistent re-evaluation of delegates. The interval could be days or years.
  -- tally the current vote for a given poll
  -- read the final decision for a given poll.

- Polls are the main activity of the forum. Polls consist of two phases. The first, called the delegation period, a user can vote directly for an option, delegate their vote for this poll, or delegate their at the topic level. In second phase, called the vote period, a user can vote directly or read the vote of their delegate, at which point they can choose to allow the delegation to remain or revoke their delegation and place their vote directly. Individual votes will always be counted before delegations. Poll delegation will always be counted before topic delegations.

- In polls users can:
  -- set the parameters of the poll (delegation period end, vote period end, percentage needed for quorum, percentage of registered needed for vote to be valid, the allowable delegation chain depth, the specifics of the vote, the number of valid options, and the topic of the poll)
  -- stand up as a delegate at the poll level
  -- cast a vote
  -- delegate their vote at the poll level
  -- read their vote and the end user who cast the weight of their
     vote (would be self if no delegation)
  -- read who their delegate is
  revoke their delegation at the poll level
  -- withdraw their direct vote
  -- read percentage needed for quorum
  -- read percentage needed for a valid vote

See TODO.md for necessary further work

Glossary:

*** All options assume 0 index is used for a null vote ***

pctQuorum: Percentage of registered voters who have responded in order to consider the poll valid.

threshold: Percentage of votes needed toward a particular option to make that option successful.

Absolute Threshold (potential feature): ex. 51% of 100 voters, or 100% of 51 voters

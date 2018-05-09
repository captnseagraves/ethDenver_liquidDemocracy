# ethDenver_liquidDemocracy

*** Contracts have not been assessed or optimized for gas ***

To run without gas issues I've been using: ganache-cli -s 1 -i 50 -l 100000000

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



Glossary:

Common Vote Option/Topic Option Values Are:
*** All options assume 0 index is used for a null vote ***
*** See pattern below to extrapolate correct hex value for n options ***
Zero Options = 0x8000000000000000000000000000000000000000000000000000000000000000 (Null Vote)
One option = 0xc000000000000000000000000000000000000000000000000000000000000000
Two options = 0xe000000000000000000000000000000000000000000000000000000000000000 (Binary Vote)
Three options = 0xf000000000000000000000000000000000000000000000000000000000000000
Four options = 0xf800000000000000000000000000000000000000000000000000000000000000
Five options = 0xfc00000000000000000000000000000000000000000000000000000000000000
Six options = 0xfe00000000000000000000000000000000000000000000000000000000000000
Seven options = 0xff00000000000000000000000000000000000000000000000000000000000000
Eight options = 0xff80000000000000000000000000000000000000000000000000000000000000
Sixteen options = 0xffff000000000000000000000000000000000000000000000000000000000000
81 options = 0xffffffffffffffffffffc0000000000000000000000000000000000000000000
255 options = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff

pctQuorum: Percentage of registered voters who have responded in order to consider the poll valid.

threshold: Percentage of votes needed toward a particular option to make that option successful.

Absolute Threshold (potential feature): ex. 51% of 100 voters, or 100% of 51 voters

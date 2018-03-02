# ethDenver_liquidDemocracy


All voters are required to register for each poll. This ensures that each user is allocated only one vote.

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

// import {string, number} from "../../../types/solidity";
const _ = require("lodash");
const ABIDecoder = require("abi-decoder");
const BigNumber = require("bignumber.js");
const Web3 = require("web3");




function LogNewPoll(
    pollAddress,
    forumAddress,
    pollId,
    name
){
    return { name: name,
      events:
       [ { name: '_newPollAddress',
           type: 'address',
           value: pollAddress },
         { name: '_pollId', type: 'uint256', value: String(pollId) } ],
      address: forumAddress }
}

//
// function LogApproval(
//     contract,
//     owner,
//     approved,
//     tokenId,
// ) {
//     return {
//         name: "Approval",
//         events: [
//           { name: "_owner",
//             type: "address",
//             value: owner },
//           { name: "_approved",
//             type: 'address',
//             value: approved },
//           { name: '_tokenId',
//             type: 'uint256',
//             value: String(tokenId) }
//           ],
//         address: contract
//     };
// }
//
// function LogTicketMinted(
//   contract,
//   owner,
//   ticketId,
//   valuePaid,
//   metaDataHash
// ){
//  return { name: 'primaryTicketMinted',
//     events: [
//        { name: '_owner',
//          type: 'address',
//          value: owner },
//        { name: '_ticketId', type: 'uint256', value: String(ticketId) },
//        { name: '_valuePaid', type: 'uint256', value: String(valuePaid) },
//        { name: '_metaDataHash',
//          type: 'bytes32',
//          value: metaDataHash },
//      ],
//     address: contract
//   };
// }
//
// function LogSecondaryTicketPurchased(
//   contract,
//   owner,
//   ticketId,
//   valuePaid,
//   metaDataHash
// ){
//  return { name: 'secondaryTicketPurchased',
//     events: [
//        { name: '_owner',
//          type: 'address',
//          value: owner },
//        { name: '_ticketId', type: 'uint256', value: String(ticketId) },
//        { name: '_valuePaid', type: 'uint256', value: String(valuePaid) },
//        { name: '_metaDataHash',
//          type: 'bytes32',
//          value: metaDataHash }
//        ],
//     address: contract
//   };
// }
//
// function LogNewEventCreated(
//   contract,
//   owner,
//   secondaryMarket,
//   secondaryMarketSoldOut,
//   secondaryPriceCap,
//   percentageReclaim,
//   metaDataHash,
//   totalPossibleTickets
// ){
//  return { name: 'newEventCreated',
//    events:
//     [ { name: '_owner',
//         type: 'address',
//         value: owner },
//       { name: '_secondaryMarket', type: 'bool', value: secondaryMarket },
//       { name: '_secondaryMarketSoldOut', type: 'bool', value: secondaryMarketSoldOut },
//       { name: '_secondaryPriceCap', type: 'uint256', value: String(secondaryPriceCap) },
//       { name: '_percentageReclaim', type: 'uint256', value: String(percentageReclaim) },
//       { name: '_eventIPFSMetadata',
//         type: 'bytes32',
//         value: metaDataHash },
//       { name: '_totalPossibleTickets', type: 'uint256', value: String(totalPossibleTickets) } ],
//    address: contract }
// }
//
// function LogTicketApproved(
//   contract,
//   ticketId,
//   ticketPrice
// ){
//  return { name: 'ticketApprovedForSecondary',
//     events: [
//         { name: '_ticketId', type: 'uint256', value: String(ticketId) },
//         { name: '_ticketPrice', type: 'uint256', value: String(ticketPrice) } ],
//     address: contract
//   };
// }
//
// function LogTicketRemoved(
//   contract,
//   ticketId
// ){
//  return { name: 'ticketRemovedFromSecondary',
//     events: [
//         { name: '_ticketId', type: 'uint256', value: String(ticketId) }
//       ],
//     address: contract
//   };
// }



module.exports = {
  LogNewPoll
  // LogTransfer,
  // LogApproval,
  // LogTicketMinted,
  // LogTicketApproved,
  // LogTicketRemoved,
  // LogSecondaryTicketPurchased,
  // LogNewEventCreated
}

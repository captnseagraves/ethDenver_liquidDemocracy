pragma solidity ^0.4.15;

contract GeneralSeating {

  /*Map of general seating owners*/
  mapping(address => uint) generalSeatingOwners;

  uint public ticketPrice;


  function GeneralSeating(uint _ticketQuota, uint _ticketPrice) public {

    ticketPrice = _ticketPrice;

    generalSeatingOwners[msg.sender] = _ticketQuota;

  }


  event seeNumberOfTicketsOwned(address ownerAddress, uint8 ticketBalance);
  event seePrice(bytes16 seatNumber, uint seatPrice);

}

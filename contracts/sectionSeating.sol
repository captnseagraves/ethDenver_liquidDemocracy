pragma solidity ^0.4.15;

contract SectionSeating {

  /*Map of section seating owners*/
  /*mapping(address => uint) sectionSeatingOwners;*/

  /*Mapping for each Section? Doesn't allow reusable contracts....*/
  /*mapping(address => uint) section100Owners;
  mapping(address => uint) section200Owners;*/

  /*mapping for pricing in each section*/
  mapping(bytes16 => uint) sectionPricing;

  uint public counter;
  uint public numberOfSections;

  uint public ticketPrice;

  /*
  Name of each section
  Price of each Section
  Number of tickets for each section
  Number of sections
  */

  /*Hash the name of each section and have a mapping of the name to different data points*/

   /*Post data to IPFS. This hashes eventID, section, price, and balance, and maps it to owner address
    Have counter for tickets.
    each event has its own contract.
    Store event data in centralized database to solve for speed of search and redemption.
    */

  function fiveSections(uint _numberOfSections, bytes16[] _nameOfEachSection, uint _priceOfEachSection, uint numberOfTicketsPerSection) public {



  }


  function SectionSeating(uint _ticketQuota, uint _ticketPrice ) public {

    ticketPrice = _ticketPrice;

    /*generalSeatingOwners[msg.sender] = _ticketQuota;*/

  }


  event seeNumberOfTicketsOwned(address ownerAddress, bytes16 section, uint8 ticketBalance);
  event seePrice(bytes16 seatNumber, uint seatPrice);

}


/*could build in one contract or could deploy multiple general seating contracts*/

/*/perhaps we could have pricing for up to 5 different sections. Beyond that the user needs to use the individual Seating Pricing.*/

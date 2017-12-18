pragma solidity ^0.4.15;

contract TokenizedTicket {

  /* Map of seat to owner*/
  mapping (bytes16 => address) individualAllSeats;
  /*Map of seat to price*/
  mapping (bytes16 => uint) individualSeatPrices;
  /*counter for individual seat recursion*/
  uint individualCount = 0;


  function individualSeatsAndPrices(uint[] _priceData, bytes16[] _seatData) public {

      if (individualCount < _priceData.length) {

          /*Assign event creator as ticket owner*/
          individualAllSeats[_seatData[individualCount]] = msg.sender;
          seeOwner(_seatData[individualCount], msg.sender);

          /*Assign price to each ticket*/
          individualSeatPrices[_seatData[individualCount]] = _priceData[individualCount];
          seePrice(_seatData[individualCount], _priceData[individualCount]);

          /*increase individualCount and repeat process until all data is loaded*/
          individualCount++;
         individualSeatsAndPrices(_priceData, _seatData);
      }
  }


  event seeOwner(bytes16 seatNumber, address ownerAddress);
  event seePrice(bytes16 seatNumber, uint seatPrice);

}

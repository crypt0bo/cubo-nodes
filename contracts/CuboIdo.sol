// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./Cubo.sol";
import "./Dai.sol";

contract CuboIdo {
  Cubo public cuboAddress;
  Dai public daiAddress;
  address private owner;
  uint public pricePerCuboPercent;

  constructor(Cubo _cuboAddress, Dai _daiAddress, uint _pricePerCubo) {
    owner = msg.sender;
    cuboAddress = _cuboAddress;
    daiAddress = _daiAddress;
    pricePerCuboPercent = _pricePerCubo;
  }

  function sellCuboToken(address _buyer, uint _cuboAmount) public {
    require(msg.sender == _buyer, 'You must be the buyer to run this.');
    require(_cuboAmount >= 1 * 10 ** 18, 'You must purchase at least 1 CUBO token.');

    uint daiAmount = (_cuboAmount * pricePerCuboPercent) / 100;

    daiAddress.transferFrom(_buyer, address(this), daiAmount);
    cuboAddress.transfer(_buyer, _cuboAmount);
  }

  // TODO: Script to update price
  function updatePrice(uint _price) public {
    require(msg.sender == owner, 'You must be the owner to run this.');
    pricePerCuboPercent = _price;
  }

  // TODO: Script to withdraw CUBO form IDO
  function withdrawCuboFromIdo(address _to, uint _cuboAmount) public {
    require(msg.sender == owner, 'You must be the owner to run this.');
    cuboAddress.transfer(_to, _cuboAmount);
  }

  // TODO: Script to withdraw DAI form IDO
  function withdrawDaiFromIdo(address _to, uint _daiAmount) public {
    require(msg.sender == owner, 'You must be the owner to run this.');
    daiAddress.transfer(_to, _daiAmount);
  }
}

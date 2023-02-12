//SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "./Trigonometry.sol";
import "./Utilities.sol";
import "hardhat/console.sol";

contract Renderer {
  uint256 constant SIZE = 500;
  uint256 constant RADIUS = 200;
  uint256 constant PRECISION_DEGREE = 7;
  uint256 constant PRECISION = 10**PRECISION_DEGREE;

  struct BlackHole {
    uint256 tokenId;
    uint256 level;
  }

  function getPixels(uint256 _size) public pure returns (uint256[] memory) {
    uint256[] memory pixels = new uint256[](_size * _size);
    uint256 index = 0;
    for (uint256 i = 0; i < _size; i++) {
      for (uint256 j = 0; j < _size; j++) {
        pixels[index] = i * _size + j;
        index++;
      }
    }
    return pixels;
  }

  function getBlackHoleSVG(BlackHole memory _blackHole) public pure returns (string memory) {
    string memory svg = string.concat(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ',
      utils.uint2str(SIZE),
      " ",
      utils.uint2str(SIZE),
      '" width="',
      utils.uint2str(SIZE),
      '" height="',
      utils.uint2str(SIZE),
      '">',
      '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="20" font-family="monospace">',
      "Black Hole Level: ",
      utils.uint2str(_blackHole.level),
      "</text>",
      "</svg>"
    );

    return svg;
  }

  function render(BlackHole memory blackHole) public pure returns (string memory) {
    string memory svg = getBlackHoleSVG(blackHole);
    return svg;
  }

  function renderSample() public pure returns (string memory) {
    BlackHole memory blackHole = BlackHole(1, 1);
    return render(blackHole);
  }
}

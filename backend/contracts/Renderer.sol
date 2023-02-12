//SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "./Trigonometry.sol";
import "./Utilities.sol";
import "hardhat/console.sol";

contract Renderer {
  uint256 constant PIXEL_SIZE = 20;
  uint256 constant PIXELS_PER_SIDE = 24;
  uint256 constant CANVAS_SIZE = PIXELS_PER_SIDE * PIXEL_SIZE;

  string[] backgroundColors;
  string[] perimiterColors;
  string[] blackHoleColors;

  constructor() {
    backgroundColors = new string[](13);
    backgroundColors[0] = "#140E0E";
    backgroundColors[1] = "#160F0D";
    backgroundColors[2] = "#17120E";
    backgroundColors[3] = "#181214";
    backgroundColors[4] = "#18130F";
    backgroundColors[5] = "#181310";
    backgroundColors[6] = "#181410";
    backgroundColors[7] = "#1A1210";
    backgroundColors[8] = "#1A1511";
    backgroundColors[9] = "#1B1310";
    backgroundColors[10] = "#1B1517";
    backgroundColors[11] = "#282221";
    backgroundColors[12] = "#504940";

    perimiterColors = new string[](4);
    perimiterColors[0] = "#852C27";
    perimiterColors[1] = "#741D27";
    perimiterColors[2] = "#8F5359";
    perimiterColors[3] = "#D1652C";

    blackHoleColors = new string[](5);
    blackHoleColors[0] = "black";
    blackHoleColors[1] = "#361902";
    blackHoleColors[2] = "#FFD088";
    blackHoleColors[3] = "#BD460A";
    blackHoleColors[4] = "#390706";
  }

  struct BlackHole {
    uint256 tokenId;
    uint256 level;
  }

  function getPixelSVG(
    uint256 tokenId,
    uint256 pixelClass,
    uint256 x,
    uint256 y
  ) public view returns (string memory) {
    string memory fillColor = "";
    uint256 randomIndex = utils.randomRange(tokenId, "randomIndex", 0, 200);

    if (pixelClass == 0) {
      // Background + small chance of dim star
      fillColor = randomIndex <= 2 ? "#504940" : backgroundColors[(randomIndex - 2) % backgroundColors.length];
    } else if (pixelClass >= 1 && pixelClass <= 6) {
      // Black hole
      fillColor = blackHoleColors[pixelClass - 1];
    } else if (pixelClass == 7) {
      // Perimiter
      if (randomIndex < perimiterColors.length) {
        fillColor = perimiterColors[randomIndex];
      } else {
        fillColor = backgroundColors[randomIndex % backgroundColors.length];
      }
    }

    return
      string.concat(
        '<rect x="',
        utils.uint2str(x * PIXEL_SIZE),
        '" y="',
        utils.uint2str(y * PIXEL_SIZE),
        '" width="',
        utils.uint2str(PIXEL_SIZE),
        '" height="',
        utils.uint2str(PIXEL_SIZE),
        '" fill="',
        fillColor,
        '"/>'
      );
  }

  function getQuarterCanvas(BlackHole memory _blackHole, uint256 _size) public view returns (string memory) {
    string memory pixelsSVG = "";
    for (uint256 i = 0; i < PIXELS_PER_SIDE / 2; i++) {
      for (uint256 j = 0; j < PIXELS_PER_SIDE / 2; j++) {
        int256 x = int256(j) - int256(PIXELS_PER_SIDE) / 2;
        int256 y = int256(i) - int256(PIXELS_PER_SIDE) / 2;
        uint256 distance = utils.sqrt(uint256(x * x) + uint256(y * y));
        if (distance <= _size / 2) {
          pixelsSVG = string.concat(pixelsSVG, getPixelSVG(_blackHole.tokenId, 1, j, i));
        } else if (distance <= _size / 2 + 1) {
          pixelsSVG = string.concat(pixelsSVG, getPixelSVG(_blackHole.tokenId, 2, j, i));
        } else if (distance <= _size / 2 + 2) {
          pixelsSVG = string.concat(pixelsSVG, getPixelSVG(_blackHole.tokenId, 3, j, i));
        } else if (distance <= _size / 2 + 3) {
          pixelsSVG = string.concat(pixelsSVG, getPixelSVG(_blackHole.tokenId, 4, j, i));
        } else if (distance <= _size / 2 + 4) {
          pixelsSVG = string.concat(pixelsSVG, getPixelSVG(_blackHole.tokenId, 5, j, i));
        } else if (distance <= _size / 2 + 6) {
          pixelsSVG = string.concat(pixelsSVG, getPixelSVG(_blackHole.tokenId, 7, j, i));
        } else {
          // TODO: Never called
          pixelsSVG = string.concat(pixelsSVG, getPixelSVG(_blackHole.tokenId, 0, j, i));
        }
      }
    }
    return pixelsSVG;
  }

  function getBlackHoleSVG(BlackHole memory _blackHole) public view returns (string memory) {
    uint256 radius = utils.randomRange(_blackHole.tokenId, "radius", 5, 10);

    string memory quarterCanvas = getQuarterCanvas(_blackHole, radius);

    string memory svg = string.concat(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ',
      utils.uint2str(CANVAS_SIZE),
      " ",
      utils.uint2str(CANVAS_SIZE),
      '" width="',
      utils.uint2str(CANVAS_SIZE),
      '" height="',
      utils.uint2str(CANVAS_SIZE),
      '">'
    );

    string memory g = string.concat('<g id="base">', quarterCanvas, "</g>");

    svg = string.concat(svg, g);
    svg = string.concat(
      svg,
      '<use href="#base" transform="scale(-1,1),translate(-',
      utils.uint2str(CANVAS_SIZE),
      ',0)" />'
    );
    svg = string.concat(
      svg,
      '<use href="#base" transform="scale(1,-1),translate(0,-',
      utils.uint2str(CANVAS_SIZE),
      ')" />'
    );
    svg = string.concat(
      svg,
      '<use href="#base" transform="scale(-1,-1),translate(-',
      utils.uint2str(CANVAS_SIZE),
      ",-",
      utils.uint2str(CANVAS_SIZE),
      ')" />'
    );

    svg = string.concat(svg, "</svg>");

    return svg;
  }

  function render(BlackHole memory blackHole) public view returns (string memory) {
    string memory svg = getBlackHoleSVG(blackHole);
    return svg;
  }

  function renderSample() public view returns (string memory) {
    BlackHole memory blackHole = BlackHole(1, 1);
    return render(blackHole);
  }
}

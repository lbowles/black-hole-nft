//SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "./Utilities.sol";
import "./interfaces/BlackHole.sol";
import "hardhat/console.sol";

contract Renderer {
  // TODO: Store constants as strings too
  uint256 public constant PIXELS_PER_SIDE = 28;
  uint256 constant PIXEL_SIZE = 10;
  uint256 constant CANVAS_SIZE = PIXELS_PER_SIDE * PIXEL_SIZE;

  string constant SPECIAL_STRING =
    '<g id="special"><path fill="#182463" d="M120 0h10v10h-10V0Z"/><path fill="#BAAEF9" d="M110 0h10v10h-10z"/><path fill="#182463" d="M130 10h10v10h-10V10Z"/><path fill="#182462" d="M90 10H0v10h90V10Z"/><path fill="#E3C8FF" d="M140 20H0v10h140z"/><path fill="#182462" d="M40 40H0v10h40V40Z"/><path fill="#BAAEF9" d="M70 30H0v10h70zm40-20h20v10h-20z"/><path fill="#E2C7FF" d="M90 20h20V10H90v10Z"/><path fill="#182462" d="M130 30H70v10h60V30Z"/></g>';

  uint256[3][] COLOR_SCHEMES;

  constructor() {
    // Initialize color schemes
    // TODO: This accounts for 30% of deployment gas
    COLOR_SCHEMES.push([35, 90, 80]);
    COLOR_SCHEMES.push([15, 90, 55]);
    COLOR_SCHEMES.push([0, 90, 20]);
    COLOR_SCHEMES.push([45, 90, 80]);
    COLOR_SCHEMES.push([25, 90, 55]);
    COLOR_SCHEMES.push([5, 90, 20]);
    COLOR_SCHEMES.push([55, 90, 80]);
    COLOR_SCHEMES.push([35, 90, 55]);
    COLOR_SCHEMES.push([15, 90, 20]);
    COLOR_SCHEMES.push([270, 90, 80]);
    COLOR_SCHEMES.push([250, 90, 55]);
    COLOR_SCHEMES.push([230, 90, 20]);
    COLOR_SCHEMES.push([269, 100, 89]);
    COLOR_SCHEMES.push([250, 86, 83]);
    COLOR_SCHEMES.push([230, 61, 24]);
  }

  function getPixelSVG(
    uint256 pixelClass,
    uint8 x,
    uint8 y,
    uint8 level
  ) public view returns (string memory) {
    uint256[3] memory colorScheme = COLOR_SCHEMES[level * 3 + pixelClass - 1];
    string memory fillColor = pixelClass == 0 ? "black" : utils.getHslString(colorScheme);

    return
      string(
        abi.encodePacked(
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
        )
      );
  }

  struct QuarterCanvasVariables {
    uint256 renderEndIndex;
    uint256 renderStartIndex;
  }

  function getQuarterCanvas(BlackHole memory _blackHole) public view returns (string memory) {
    QuarterCanvasVariables memory vars;

    string memory edgeSVG = "";
    vars.renderEndIndex = PIXELS_PER_SIDE / 2;
    vars.renderStartIndex = vars.renderEndIndex - _blackHole.size - 5;
    for (uint256 i = vars.renderStartIndex; i <= vars.renderEndIndex; i++) {
      for (uint256 j = vars.renderStartIndex; j <= vars.renderEndIndex; j++) {
        int256 x = int256(j) - int256(PIXELS_PER_SIDE) / 2;
        int256 y = int256(i) - int256(PIXELS_PER_SIDE) / 2;
        uint256 distance = uint256(utils.sqrt(uint256(x * x) + uint256(y * y)));

        int256 classIndex = int256(distance) - int256(_blackHole.size);

        if (distance > _blackHole.size && distance <= _blackHole.size + 3) {
          edgeSVG = string.concat(
            edgeSVG,
            getPixelSVG(uint256(classIndex), uint8(j), uint8(i), uint8(_blackHole.level))
          );
        }
      }
    }

    return edgeSVG;
  }

  // Solidity: // TODO: REVERT here
  function getAnimatedStars(BlackHole memory _blackHole) public pure returns (string memory) {
    string memory svg = "";

    for (uint256 i = 0; i < 10; i++) {
      // x is a random number from -PIXELS_PER_SIDE to 2*PIXELS_PER_SIDE
      uint256 x = utils.randomRange(
        _blackHole.tokenId,
        string.concat("animatedStarX", utils.uint2str(i)),
        0,
        PIXELS_PER_SIDE * 3
      );

      uint256 radius = _blackHole.size + 6;
      int256 discriminant = int256(radius) *
        int256(radius) -
        (int256(x) - int256(PIXELS_PER_SIDE) / 2) *
        (int256(x) - int256(PIXELS_PER_SIDE) / 2);
      uint256 minY = 0;
      uint256 maxY = PIXELS_PER_SIDE * 2;
      if (discriminant > 0) {
        // Bottom edge to bottom canvas
        minY = utils.sqrt(uint256(discriminant)) + PIXELS_PER_SIDE / 2;
        maxY = PIXELS_PER_SIDE * 2;

        // Top canvas to top edge
        if (utils.randomRange(_blackHole.tokenId, string.concat("animatedStarY", utils.uint2str(i)), 0, 2) == 1) {
          maxY = PIXELS_PER_SIDE - minY;
          minY = 0;
        }

        // TODO: Randomly add perimiter glow
      }

      // Select a random value between minY and maxY
      x = x * PIXEL_SIZE;
      uint256 y = utils.randomRange(_blackHole.tokenId, string.concat("animatedStarY", utils.uint2str(i)), minY, maxY) *
        PIXEL_SIZE;

      uint256 fillLightness = utils.randomRange(
        _blackHole.tokenId,
        string.concat("fillLightness", utils.uint2str(i)),
        15,
        200
      );
      string memory fillColor = utils.getHslString([0, 0, fillLightness]);

      uint256 animateDuration = 2;
      uint256 animationOffset = utils.randomRange(
        _blackHole.tokenId,
        string.concat("animationOffset", utils.uint2str(i)),
        0,
        2
      );

      string memory animationCommon = string.concat(
        'dur="',
        utils.uint2str(animateDuration),
        's" repeatCount="indefinite" begin="',
        utils.uint2str(animationOffset),
        's" calcMode="spline" keyTimes="0;1" keySplines="0.4,0,0.2,1"'
      );

      string memory transformAnimation = string.concat(
        '<animate attributeName="x" from="',
        utils.uint2str(x),
        '" to="',
        utils.uint2str((PIXELS_PER_SIDE * PIXEL_SIZE) / 2),
        '" values="',
        utils.uint2str(x),
        ";",
        utils.uint2str((PIXELS_PER_SIDE * PIXEL_SIZE) / 2),
        '" ',
        animationCommon,
        "/>"
      );

      transformAnimation = string.concat(
        transformAnimation,
        '<animate attributeName="y" from="',
        utils.uint2str(y),
        '" to="',
        utils.uint2str((PIXELS_PER_SIDE * PIXEL_SIZE) / 2),
        '" values="',
        utils.uint2str(y),
        ";",
        utils.uint2str((PIXELS_PER_SIDE * PIXEL_SIZE) / 2),
        '" ',
        animationCommon,
        "/>"
      );

      transformAnimation = string.concat(
        transformAnimation,
        '<animate attributeName="fill-opacity" from="1" to="0" values="1;0" ',
        animationCommon,
        "/>"
      );

      string memory pixel = string.concat(
        '<rect x="',
        utils.uint2str(x),
        '" y="',
        utils.uint2str(y),
        '" width="',
        utils.uint2str(PIXEL_SIZE),
        '" height="',
        utils.uint2str(PIXEL_SIZE),
        '" fill="',
        fillColor,
        '">',
        transformAnimation,
        "</rect>"
      );

      svg = string.concat(svg, pixel);
    }
    return svg;
  }

  function getStaticBackground(BlackHole memory _blackHole) public pure returns (string memory) {
    string memory svg = "";
    for (uint256 i = 0; i < 30; i++) {
      uint256 x = utils.randomRange(
        _blackHole.tokenId,
        string.concat("staticX", utils.uint2str(i)),
        0,
        PIXELS_PER_SIDE
      ) * PIXEL_SIZE;
      uint256 y = utils.randomRange(
        _blackHole.tokenId,
        string.concat("staticY", utils.uint2str(i)),
        0,
        PIXELS_PER_SIDE
      ) * PIXEL_SIZE;

      uint256 fillLightness = utils.randomRange(
        _blackHole.tokenId,
        string.concat("fillLightness", utils.uint2str(i)),
        5,
        12
      );
      string memory fillColor = utils.getHslString([0, 0, fillLightness]);

      string memory pixel = string.concat(
        '<rect x="',
        utils.uint2str(x),
        '" y="',
        utils.uint2str(y),
        '" width="',
        utils.uint2str(PIXEL_SIZE),
        '" height="',
        utils.uint2str(PIXEL_SIZE),
        '" fill="',
        fillColor,
        '"/>'
      );

      svg = string.concat(svg, pixel);
    }
    return svg;
  }

  function getBlackHoleSVG(BlackHole memory _blackHole) public view returns (string memory) {
    string memory edgeSvg = getQuarterCanvas(_blackHole);

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

    // -- defs

    // Edge def
    string memory g = string.concat('<g id="edge">', edgeSvg, "</g>");

    svg = string.concat(svg, "<defs>", '<g id="full">', g);
    svg = string.concat(
      svg,
      '<use href="#edge" transform="scale(-1,1),translate(-',
      utils.uint2str(CANVAS_SIZE),
      ',0)" />'
    );
    svg = string.concat(
      svg,
      '<use href="#edge" transform="scale(1,-1),translate(0,-',
      utils.uint2str(CANVAS_SIZE),
      ')" />'
    );
    svg = string.concat(
      svg,
      '<use href="#edge" transform="scale(-1,-1),translate(-',
      utils.uint2str(CANVAS_SIZE),
      ",-",
      utils.uint2str(CANVAS_SIZE),
      ')" /></g>'
    );

    // Special string def
    if (_blackHole.level == 4) svg = string.concat(svg, SPECIAL_STRING);

    // -- end defs
    svg = string.concat(svg, "</defs>");

    // Black background
    svg = string.concat(
      svg,
      '<rect x="0" y="0" width="',
      utils.uint2str(CANVAS_SIZE),
      '" height="',
      utils.uint2str(CANVAS_SIZE),
      '" fill="black"/>'
    );

    // Static background
    svg = string.concat(svg, '<g id="background">', getStaticBackground(_blackHole), "</g>");

    // Black background part of black hole
    uint256 backgroundOffset = CANVAS_SIZE / 2 - _blackHole.size * PIXEL_SIZE;
    uint256 backgroundSize = 2 * _blackHole.size * PIXEL_SIZE;
    svg = string.concat(
      svg,
      '<rect fill="black" x="',
      utils.uint2str(backgroundOffset),
      '" y="',
      utils.uint2str(backgroundOffset),
      '" width="',
      utils.uint2str(backgroundSize),
      '"  height="',
      utils.uint2str(backgroundSize),
      '" />'
    );

    // Edge part
    svg = string.concat(svg, '<use href="#full" />');

    // Animated stars
    // svg += getAnimatedStars(holeSize, level)
    svg = string.concat(svg, getAnimatedStars(_blackHole));

    // Special string
    if (_blackHole.level == 4) {
      svg = string.concat(
        svg,
        '<use href="#special" transform="translate(',
        utils.uint2str(CANVAS_SIZE / 2 - PIXEL_SIZE),
        ",",
        utils.uint2str(CANVAS_SIZE / 2),
        ')" />',
        '<use href="#special" transform="scale(-1,1),translate(-',
        utils.uint2str(CANVAS_SIZE / 2 + PIXEL_SIZE),
        ",",
        utils.uint2str(CANVAS_SIZE / 2),
        ')" />'
      );
    }

    svg = string.concat(svg, "</svg>");

    return svg;
  }

  function render(BlackHole memory blackHole) public view returns (string memory) {
    string memory svg = getBlackHoleSVG(blackHole);
    return svg;
  }

  function renderSample(uint256 tokenId, uint256 level) public view returns (string memory) {
    uint256 size = PIXELS_PER_SIDE / 2 - (10 - level); // 5
    BlackHole memory blackHole = BlackHole(tokenId, level, size, 1, "Micro");
    return render(blackHole);
  }
}

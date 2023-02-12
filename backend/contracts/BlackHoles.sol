// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "erc721a/contracts/ERC721A.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "./Utilities.sol";
import "./Renderer.sol";
import "svgnft/contracts/Base64.sol";

contract BlackHoles is ERC721A, Ownable {
  uint256 public price;
  uint256 public maxSupply;
  uint256 public constant maxMintPerWallet = 20;

  Renderer public renderer;

  /**
   * @dev Constructs a new instance of the contract.
   * @param _name Name of the ERC721 token.
   * @param _symbol Symbol of the ERC721 token.
   * @param _price Price of each token in wei.
   * @param _maxSupply Maximum supply of tokens.
   * @param _renderer Address of the Renderer contract.
   */
  constructor(
    string memory _name,
    string memory _symbol,
    uint256 _price,
    uint256 _maxSupply,
    address _renderer
  ) ERC721A(_name, _symbol) {
    price = _price;
    maxSupply = _maxSupply;
    renderer = Renderer(_renderer);
  }

  /**
   * @notice Sets the price of each token in wei.
   * @param _price Price of each token in wei.
   */
  function setPrice(uint256 _price) external onlyOwner {
    price = _price;
  }

  /**
   * @notice Returns the token URI for a given token ID.
   * @param _tokenId ID of the token to get the URI for.
   * @return Token URI.
   */
  function tokenURI(uint256 _tokenId) public view virtual override returns (string memory) {
    if (!_exists(_tokenId)) revert URIQueryForNonexistentToken();

    string memory name = string(abi.encodePacked("BlackHole #", utils.uint2str(_tokenId)));
    string memory description = "Fully on-chain, procedurally generated, animated black holes.";
    Renderer.BlackHole memory blackHole = renderer.kaleidoscopeForTokenId(_tokenId);
    blackHole.hasHalo = _tokenId <= 50;

    Renderer.ColorPalette memory palette = renderer.colorPaletteForKaleidescope(blackHole);
    string memory svg = renderer.getKaleidoscopeSVG(blackHole, palette);

    // string memory attributes = string.concat(
    //   '"attributes": [',
    //   '{"trait_type": "Mirrors", "value": ',
    //   utils.uint2str(blackHole.repetitions),
    //   "},",
    //   '{"trait_type": "Outside Artifacts", "value": ',
    //   utils.uint2str(blackHole.numOutsideArtifacts),
    //   "},",
    //   '{"trait_type": "Inside Artifacts", "value": ',
    //   utils.uint2str(blackHole.numInsideArtifacts),
    //   "},",
    //   '{"trait_type": "Gradient", "value": "',
    //   blackHole.hasGradient ? "Yes" : "No",
    //   '"},',
    //   '{"trait_type": "Primary Color", "value": "',
    //   utils.getHueName(palette.primaryHue),
    //   '"}'
    // );
    // attributes = string.concat(attributes, "]");

    string memory json = string(
      abi.encodePacked(
        '{"name":"',
        name,
        '","description":"',
        description,
        '",',
        '"attributes": []' // attributes
        ', "image": "data:image/svg+xml;base64,',
        Base64.encode(bytes(svg)),
        '"}'
      )
    );
    return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json))));
  }

  /**
   * @notice Mints new tokens for the caller.
   * @param _quantity Quantity of tokens to mint.
   */
  function mint(uint256 _quantity) external payable {
    require(msg.value >= price * _quantity, "Insufficient fee");
    require(totalSupply() + _quantity <= maxSupply, "Exceeds max supply");
    require(_numberMinted(msg.sender) + _quantity <= 20, "Exceeds max quantity");
    _mint(msg.sender, _quantity);

    // Refund any extra ETH sent
    if (msg.value > price * _quantity) {
      (bool status, ) = payable(msg.sender).call{value: msg.value - price * _quantity}("");
      require(status, "Refund failed");
    }
  }

  /**
   * @notice  Airdrops tokens to a list of recipients. Only callable by the contract owner.
   * @param _recipients List of recipients to receive the airdrop.
   * @param _quantity Quantity of tokens to airdrop to each recipient.
   */
  function airdrop(address[] memory _recipients, uint256 _quantity) external payable onlyOwner {
    require(totalSupply() + _quantity * _recipients.length <= maxSupply, "Exceeds max supply");
    for (uint256 i = 0; i < _recipients.length; i++) {
      _mint(_recipients[i], _quantity);
    }
  }

  /**
   * @notice Withdraws the contract's balance. Only callable by the contract owner.
   */
  function withdraw() external onlyOwner {
    require(payable(msg.sender).send(address(this).balance));
  }

  function mintQuotaRemaining(address _wallet) external view returns (uint256) {
    return maxMintPerWallet - _numberMinted(_wallet);
  }

  function _startTokenId() internal view virtual override returns (uint256) {
    return 1;
  }
}

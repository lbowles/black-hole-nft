// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "erc721a/contracts/ERC721A.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "./Utilities.sol";
import "./Renderer.sol";
import "./interfaces/BlackHole.sol";
import "svgnft/contracts/Base64.sol";

contract BlackHoles is ERC721A, Ownable {
  uint256 public price;
  uint256 public maxSupply;
  uint256 public constant maxMintPerWallet = 20;

  mapping(uint256 => uint256) public massesConsumed;

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

    uint256 mass = massesConsumed[_tokenId] + 1;
    uint256 level = 0;
    // TODO: Refactor this into upgradeable contract, dependent on total supply
    if (mass < 4) {
      level = 0;
    } else if (mass < 8) {
      level = 1;
    } else if (mass < 16) {
      level = 2;
    } else if (mass < 32) {
      level = 3;
    } else {
      level = 4;
    }

    BlackHole memory blackHole = blackHoleForTokenId(_tokenId);

    string memory svg = renderer.getBlackHoleSVG(blackHole);

    string memory attributes = string.concat(
      "[",
      '{"trait_type": "Level", "value": ',
      utils.uint2str(blackHole.level),
      "},",
      '{"trait_type": "Size", "value": ',
      utils.uint2str(blackHole.size),
      "},",
      '{"trait_type": "Name", "value": "',
      blackHole.name,
      '"},',
      '{"trait_type": "Mass", "value": ',
      utils.uint2str(blackHole.mass),
      "}]"
    );

    string memory json = string(
      abi.encodePacked(
        '{"name":"',
        name,
        '","description":"',
        description,
        '",',
        '"attributes": ',
        attributes, // attributes
        ', "image": "data:image/svg+xml;base64,',
        Base64.encode(bytes(svg)),
        '"}'
      )
    );
    return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json))));
  }

  function blackHoleForTokenId(uint256 _tokenId) public view returns (BlackHole memory) {
    uint256 mass = massesConsumed[_tokenId] + 1;
    uint256 level = 0;
    // TODO: Refactor this into upgradeable contract, dependent on total supply
    if (mass < 4) {
      level = 0;
    } else if (mass < 8) {
      level = 1;
    } else if (mass < 16) {
      level = 2;
    } else if (mass < 32) {
      level = 3;
    } else {
      level = 4;
    }

    string memory name = nameForBlackHoleLevel(level);

    return
      BlackHole({
        tokenId: _tokenId,
        level: level,
        size: renderer.PIXELS_PER_SIDE() / 2 - (10 - level),
        mass: mass,
        name: name
      });
  }

  function nameForBlackHoleLevel(uint256 _level) public pure returns (string memory) {
    if (_level == 0) {
      return "Micro";
    } else if (_level == 1) {
      return "Stellar";
    } else if (_level == 2) {
      return "Intermediate";
    } else if (_level == 3) {
      return "Supermassive";
    } else if (_level == 4) {
      return "Primordial";
    } else {
      return "Unknown";
    }
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
  function airdrop(address[] calldata _recipients, uint256 _quantity) external payable onlyOwner {
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

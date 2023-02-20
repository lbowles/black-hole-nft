// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "erc721a/contracts/ERC721A.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "./Utilities.sol";
import "./Renderer.sol";
import "./interfaces/BlackHole.sol";
import "svgnft/contracts/Base64.sol";
import "./interfaces/IERC4906.sol";

contract BlackHoles is ERC721A, Ownable, IERC4906 {
  event TimedSaleStarted();

  uint256 public immutable TIMED_SALE_THRESHOLD = 1000;
  uint256 public immutable MAX_LEVEL = 4;
  uint256 public immutable MAX_SUPPLY_OF_INTERSTELLAR = 42;

  uint256 public price;
  uint256 public timedSalePrice;
  uint256 public timedSaleEndTimestamp;
  uint256 public timedSaleDuration = 24 hours;
  uint256 public mergingDelay = 5 days;

  mapping(uint256 => uint256) public massesConsumed;

  Renderer public renderer;

  enum MintState {
    OPEN,
    TIMED_SALE,
    CLOSED
  }

  /**
   * @dev Constructs a new instance of the contract.
   * @param _name Name of the ERC721 token.
   * @param _symbol Symbol of the ERC721 token.
   * @param _price Price of each token in wei.
   * @param _renderer Address of the Renderer contract.
   */
  constructor(
    string memory _name,
    string memory _symbol,
    uint256 _price,
    uint256 _timedSalePrice,
    address _renderer
  ) ERC721A(_name, _symbol) {
    price = _price;
    timedSalePrice = _timedSalePrice;
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
   * @notice Sets the price of a token during the timed sale.
   * @param _timedSalePrice Price of each token in wei.
   */
  function setTimedSalePrice(uint256 _timedSalePrice) external onlyOwner {
    timedSalePrice = _timedSalePrice;
  }

  /**
   * @notice Sets the timed sale duration.
   * @param _timedSaleDuration Duration of the timed sale in seconds.
   */
  function setTimedSaleDuration(uint256 _timedSaleDuration) external onlyOwner {
    timedSaleDuration = _timedSaleDuration;
  }

  /**
   * @notice Sets the merging delay.
   * @param _mergingDelay Delay in seconds before a token can be merged after the timed sale.
   */
  function setMergingDelay(uint256 _mergingDelay) external onlyOwner {
    mergingDelay = _mergingDelay;
  }

  /**
   * @notice Gets the current price of a token.
   */
  function getPrice() public view returns (uint256) {
    if (getMintState() == MintState.TIMED_SALE) {
      return timedSalePrice;
    } else {
      return price;
    }
  }

  /**
   * @notice Returns the token URI for a given token ID.
   * @param _tokenId ID of the token to get the URI for.
   * @return Token URI.
   */
  function tokenURI(uint256 _tokenId) public view virtual override(ERC721A, IERC721A) returns (string memory) {
    if (!_exists(_tokenId)) revert URIQueryForNonexistentToken();

    string memory name = string(abi.encodePacked("BlackHole #", utils.uint2str(_tokenId)));
    string memory description = "Fully on-chain, procedurally generated, animated black holes.";

    BlackHole memory blackHole = blackHoleForTokenId(_tokenId);

    string memory svg = renderer.getBlackHoleSVG(blackHole);

    string memory attributes = string.concat(
      "[",
      '{"trait_type": "Level", "value": ',
      utils.uint2str(blackHole.level),
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

  /**
   * @notice Get the structured representation of a token by its ID.
   * @param _tokenId ID of the token.
   * @return BlackHole Structured representation of the token.
   */
  function blackHoleForTokenId(uint256 _tokenId) public view returns (BlackHole memory) {
    uint256 mass = massForTokenId(_tokenId);
    uint256 level = levelForMass(mass);
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

  function levelForMass(uint256 _mass) public view returns (uint256) {
    uint256 baseUpgradeMass = getBaseUpgradeMass();

    if (_mass < baseUpgradeMass) {
      return 0;
    } else if (_mass < baseUpgradeMass * 2) {
      return 1;
    } else if (_mass < baseUpgradeMass * 4) {
      return 2;
    } else if (_mass < baseUpgradeMass * 8) {
      return 3;
    } else {
      return 4;
    }
  }

  function getBaseUpgradeMass() public view returns (uint256) {
    return _totalMinted() / MAX_SUPPLY_OF_INTERSTELLAR / 2**(MAX_LEVEL + 1);
  }

  function massForTokenId(uint256 _tokenId) public view returns (uint256) {
    return massesConsumed[_tokenId] + 1;
  }

  /**
   * @notice Returns the name of a black hole level.
   * @param _level Level of the black hole.
   * @return name of the black hole level.
   */
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
   * @notice Mints new tokens for the caller. If the caller
   * mints tokens across the TIMED_SALE_THRESHOLD, it will
   * mint as many as it can with the given amount of ETH.
   * @param _quantity Quantity of tokens to mint.
   */
  function mint(uint256 _quantity) external payable {
    uint256 currentPrice = getPrice();
    uint256 supplyBeforeMint = _totalMinted();
    MintState mintState = getMintState();
    require(mintState != MintState.CLOSED, "Mint is closed");

    uint256 supplyAfterMint = supplyBeforeMint + _quantity;
    uint256 cost = currentPrice * _quantity;

    // Handle case where the mint crosses the timed sale threshold
    if (mintState == MintState.OPEN && supplyAfterMint >= TIMED_SALE_THRESHOLD) {
      uint256 quantityAtNewPrice = supplyAfterMint - TIMED_SALE_THRESHOLD;

      // Cost for tokens at old price
      uint256 quantityAtOldPrice = _quantity - quantityAtNewPrice;
      cost = quantityAtOldPrice * currentPrice;

      // Number of tokens that can be minted with the difference
      quantityAtNewPrice = (msg.value - cost) / timedSalePrice;

      // Add cost of tokens at new price
      cost += quantityAtNewPrice * timedSalePrice;

      // Update quantity to mint
      _quantity = quantityAtOldPrice + quantityAtNewPrice;

      // Start timed sale
      timedSaleEndTimestamp = block.timestamp + 24 hours;
      emit TimedSaleStarted();
    }

    require(msg.value >= cost, "Insufficient fee");

    _mint(msg.sender, _quantity);

    // Refund any extra ETH sent
    if (msg.value > cost) {
      (bool status, ) = payable(msg.sender).call{value: msg.value - cost}("");
      require(status, "Refund failed");
    }
  }

  /**
   * @notice  Airdrops tokens to a list of recipients. Only callable by the contract owner.
   * @param _recipients List of recipients to receive the airdrop.
   * @param _quantity Quantity of tokens to airdrop to each recipient.
   */
  function airdrop(address[] calldata _recipients, uint256 _quantity) external payable onlyOwner {
    require(getMintState() != MintState.CLOSED, "Exceeds max supply");
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

  /**
   * @notice Returns the current mint state.
   */
  function getMintState() public view returns (MintState) {
    uint256 supply = _totalMinted();
    if (supply < TIMED_SALE_THRESHOLD) {
      return MintState.OPEN;
    } else if (block.timestamp < timedSaleEndTimestamp) {
      return MintState.TIMED_SALE;
    } else {
      return MintState.CLOSED;
    }
  }

  /**
   * @notice Returns whether merging is enabled or not.
   */
  function isMergingEnabled() public view returns (bool) {
    return getMintState() == MintState.CLOSED && block.timestamp > timedSaleEndTimestamp + mergingDelay;
  }

  /**
   * @notice Merges a list of tokens into a single token.
   * @param tokens List of tokens to merge. The first token in the list is the target.
   */
  function merge(uint256[] memory tokens) public {
    // Burn all tokens except the first one, aka the target
    // The mass of all other tokens get added to the target
    require(isMergingEnabled(), "Merging not enabled");
    require(tokens.length > 1, "Must merge at least 2 tokens");

    uint256 targetId = tokens[0];

    require(ownerOf(tokens[0]) == msg.sender, "Must own all tokens (target)");

    uint256 sum;
    for (uint256 i = 1; i < tokens.length; i++) {
      require(ownerOf(tokens[i]) == msg.sender, "Must own all tokens (burn)");
      sum = sum + massForTokenId(tokens[i]);
      _burn(tokens[i]);
    }

    massesConsumed[targetId] += sum;

    emit MetadataUpdate(targetId);
  }

  function totalMinted() external view returns (uint256) {
    return _totalMinted();
  }

  function totalBurned() external view returns (uint256) {
    return _totalBurned();
  }

  function _startTokenId() internal view virtual override returns (uint256) {
    return 1;
  }
}

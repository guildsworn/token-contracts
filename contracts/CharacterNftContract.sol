// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./interfaces/ICharacterNftContract.sol";
import "./interfaces/IGuild.sol";

contract CharacterNftContract is ERC721, ERC721Enumerable, ERC721Royalty, ERC721URIStorage,	AccessControlEnumerable														
{
	using Counters for Counters.Counter;

	bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
	bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

	Counters.Counter private _tokenIdCounter;

	address private _vaultAddress;
	uint96 private _royaltyNumerator; // 0-10000, 1000 = 10%
	string private _baseUri;
	bool private _initialised;

	mapping(address => bool) private _whitelistedGuilds;
	mapping(uint => bytes32) private _characterClass;
	mapping(bytes32 => bool) private _nonTransferable;
	mapping(uint => address) private _characterLockedAt;

	constructor() ERC721("EldfallCharacterNft", "ECN") {
		_grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
		_baseUri = "https://www.eldfall.com/characterMetadata/";
	}

	// **************************************************
	// *************** DEFAULT_ADMIN REGION *************
	// **************************************************
	function init(
		address defaultAdminAddress_,
		address moderatorAddress_,
		address vaultAddress_,
		address[] memory minterAddressArray_,
		uint96 royaltyNumerator_
	) public onlyRole(DEFAULT_ADMIN_ROLE) {
		require(!_initialised, "Contract is already initialised!");

		_grantRole(DEFAULT_ADMIN_ROLE, defaultAdminAddress_);
		_grantRole(MODERATOR_ROLE, moderatorAddress_);
		for (uint i = 0; i < minterAddressArray_.length; i++) {
			_grantRole(MINTER_ROLE, minterAddressArray_[i]);
		}

		_vaultAddress = vaultAddress_;
		_royaltyNumerator = royaltyNumerator_;

		_initialised = true;
		_revokeRole(DEFAULT_ADMIN_ROLE, _msgSender());
	}

	function salvageTokensFromContract(
		address tokenAddress_,
		address to_,
		uint amount_
	) public onlyRole(DEFAULT_ADMIN_ROLE) {
		bytes memory callPayload = abi.encodePacked(
			bytes4(keccak256(bytes("transfer(address,uint256)"))),
			abi.encode(to_, amount_)
		);
		(bool success, ) = address(tokenAddress_).call(callPayload);
		require(success, "Call failed!");
		emit TokensSalvaged(tokenAddress_, to_, amount_);
	}

	// **************************************************
	// ****************** MINTER REGION *****************
	// **************************************************
	function safeMint(
		address to_,
		bytes32 classHash_
	) public onlyRole(MINTER_ROLE) returns (uint256) {
		uint256 tokenId = _tokenIdCounter.current();
		_tokenIdCounter.increment();
		_safeMint(to_, tokenId);
		_characterClass[tokenId] = classHash_;
		_setTokenRoyalty(tokenId, _vaultAddress, _royaltyNumerator);
		emit CharacterCreated(tokenId, classHash_);
		return tokenId;
	}

	// **************************************************
	// ***************** MODERATOR REGION ***************
	// **************************************************
	function setTokenURI(
		uint256 tokenId_,
		string memory tokenUri_
	) public onlyRole(MODERATOR_ROLE) {
		_setTokenURI(tokenId_, tokenUri_);
	}

	function setBaseURI(
		string memory baseUri_
	) public onlyRole(MODERATOR_ROLE) {
		emit BaseUriChanged(_baseUri, baseUri_);
		_baseUri = baseUri_;
	}

	function setVaultAddress(
		address vaultAddress_
	) public onlyRole(MODERATOR_ROLE) {
		require(_vaultAddress != vaultAddress_, "Value is already set!");
		emit VaultAddressChanged(_vaultAddress, vaultAddress_);
		_vaultAddress = vaultAddress_;
	}

	function setRoyaltyNumerator(
		uint96 royaltyNumerator_
	) public onlyRole(MODERATOR_ROLE) {
		require(
			_royaltyNumerator != royaltyNumerator_,
			"Value is already set!"
		);
		emit RoyaltyNumeratorChanged(_royaltyNumerator, royaltyNumerator_);
		_royaltyNumerator = royaltyNumerator_;
	}

	function setNotTransferable(
		bytes32 classHash,
		bool nonTransferable_
	) public onlyRole(MODERATOR_ROLE) {
		require(
			_nonTransferable[classHash] != nonTransferable_,
			"Value is already set!"
		);
		emit CharacterNotTransferableChanged(
			classHash,
			_nonTransferable[classHash],
			nonTransferable_
		);
		_nonTransferable[classHash] = nonTransferable_;
	}

	function setWhitelistGuild(address guildAddress_, bool isWhitelisted_) public onlyRole(MODERATOR_ROLE) {
		require(_whitelistedGuilds[guildAddress_] != isWhitelisted_, "Value is already set!");
		emit WhitelistGuildChanged(guildAddress_, _whitelistedGuilds[guildAddress_], isWhitelisted_);
		_whitelistedGuilds[guildAddress_] = isWhitelisted_;
	}

	function externalUnlockCharacter(address userAddress_, uint slotId_, uint characterId_, address guildAddress_, bytes memory extraData_) public onlyRole(MODERATOR_ROLE) {
		IGuild(guildAddress_).unlockCharacter(_msgSender(), slotId_, characterId_, extraData_);
		_characterLockedAt[characterId_] = address(0);
        emit CharacterUnlocked(userAddress_, slotId_, characterId_, guildAddress_);
	}

	// **************************************************
	// ****************** PUBLIC REGION *****************
	// **************************************************
	function lockCharacter(uint slotId_, uint characterId_, address guildAddress_, bytes memory extraData_) public virtual {
		require(_msgSender() == ownerOf(characterId_), "You are not the owner!");
		require(_whitelistedGuilds[guildAddress_], "Guild is not whitelisted!");
		require(!isCharacterLocked(characterId_), "Character is already locked!");
		
		IGuild(guildAddress_).lockCharacter(_msgSender(), slotId_, characterId_, extraData_);
        _characterLockedAt[characterId_] = guildAddress_;
		emit CharacterLocked(_msgSender(), slotId_, characterId_, guildAddress_);
	}

	function unlockCharacter(uint slotId_, uint characterId_, address guildAddress_, bytes memory extraData_) public virtual {
		require(_msgSender() == ownerOf(characterId_), "You are not the owner!");
        require(_whitelistedGuilds[guildAddress_], "Guild is not whitelisted!");
		require(_characterLockedAt[characterId_] == guildAddress_, "Character is not locked in guild!");
		
        IGuild(guildAddress_).unlockCharacter(_msgSender(), slotId_, characterId_, extraData_);
		_characterLockedAt[characterId_] = address(0);
        emit CharacterUnlocked(_msgSender(), slotId_, characterId_, guildAddress_);
	}
	
	function burn(uint256 characterId_) public {
		if (!isCharacterLocked(characterId_)) {
            require(_msgSender() == ownerOf(characterId_), "You are not the owner!");
        } else {
            require(_msgSender() == _characterLockedAt[characterId_], "You are not the owner!");
        }
		_characterLockedAt[characterId_] = address(0);
		_burn(characterId_);
	}

	function tokenURI(
		uint256 tokenId
	) public view override(ERC721, ERC721URIStorage) returns (string memory) {
		return super.tokenURI(tokenId);
	}

	function supportsInterface(
		bytes4 interfaceId
	)
		public
		view
		override(
			ERC721,
			ERC721Royalty,
			ERC721Enumerable,
			AccessControlEnumerable
		)
		returns (bool)
	{
		return
			interfaceId == type(ICharacterNftContract).interfaceId ||
			super.supportsInterface(interfaceId);
	}

	// **************************************************
	// ************** PUBLIC GETTERS REGION *************
	// **************************************************
	function getVaultAddress() public view returns (address) {
		return _vaultAddress;
	}

	function getRoyaltyNumerator() public view returns (uint96) {
		return _royaltyNumerator;
	}

	function getCharactersClass(uint tokenId_) public view returns (bytes32) {
		return _characterClass[tokenId_];
	}

	function isTransferable(bytes32 classHash) public view returns (bool) {
		return !_nonTransferable[classHash];
	}

	function isGuildWhitelisted(address guildAddress_) public view returns (bool) {
		return _whitelistedGuilds[guildAddress_];
	}

	function getCharacterLockedAt(uint tokenId_) public view returns (address) {
		return _characterLockedAt[tokenId_];
	}

	function isCharacterLocked(uint tokenId_) public view returns (bool) {
		return _characterLockedAt[tokenId_] != address(0);
	}

	function isInitialised() public view returns (bool) {
		return _initialised;
	}

	function owner() public view virtual returns (address) {
        return getRoleMember(MODERATOR_ROLE, 0);
    }

	function getBaseURI() public view returns (string memory) {
		return _baseURI();
	}

	function ownerOf(uint256 tokenId) public view override returns (address) {
		return super.ownerOf(tokenId);
	}

	// **************************************************
	// ********** OVERRIDES INTERNAL REGION *************
	// **************************************************
	function _baseURI() internal view override returns (string memory) {
		return _baseUri;
	}

	function _beforeTokenTransfer(
		address from,
		address to,
		uint256 firstTokenId,
        uint256 batchSize
	) internal override(ERC721, ERC721Enumerable) {
		require(!isCharacterLocked(firstTokenId), "Token is locked!");
		if (from != address(0) && to != address(0) && from != to) {
			require(
				isTransferable(getCharactersClass(firstTokenId)),
				"Token class is not transferable!"
			);
		}
		super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
	}

	function _burn(
		uint256 tokenId
	) internal override(ERC721, ERC721URIStorage, ERC721Royalty) {
		super._burn(tokenId);
	}

	// **************************************************
	// ****************** EVENTS REGION *****************
	// **************************************************
	event BaseUriChanged(string oldValue, string newValue);
	event CharacterCreated(uint indexed tokenId, bytes32 characterClass);
	event CharacterLocked(address indexed userAddress, uint slotId, uint indexed characterId, address indexed lockedAt);
	event CharacterUnlocked(address indexed userAddress, uint slotId, uint indexed characterId, address indexed unlockedAt);
	event CharacterNotTransferableChanged(
		bytes32 classHash,
		bool oldValue,
		bool newValue
	);
	event WhitelistGuildChanged(address indexed guildAddress, bool oldValue, bool newValue);
	event VaultAddressChanged(address oldValue, address newValue);
	event RoyaltyNumeratorChanged(uint96 oldValue, uint96 newValue);
	event TokensSalvaged(
		address indexed tokenAddress,
		address indexed userAddress,
		uint amount
	);
}

//SPDX-License-Identifier: Unlicense 
pragma solidity ^0.8.4;
interface ICharacterNftContract {
  struct CharacterNftResult {
		uint256 id;
		string uri;
		bytes32 class;
		address lockedAt;
		bool isTransferable;
	}

  function MINTER_ROLE (  ) external view returns ( bytes32 );
  function MODERATOR_ROLE (  ) external view returns ( bytes32 );
  function burn ( uint256 characterId_ ) external;
  function externalUnlockCharacter ( address userAddress_, uint256 slotId_, uint256 characterId_, address guildAddress_, bytes memory extraData_ ) external;
  function getBaseURI (  ) external view returns ( string memory );
  function getCharacterLockedAt ( uint256 tokenId_ ) external view returns ( address );
  function getCharactersClass ( uint256 tokenId_ ) external view returns ( bytes32 );
  function getRoyaltyNumerator (  ) external view returns ( uint96 );
  function getVaultAddress (  ) external view returns ( address );
  function init ( address defaultAdminAddress_, address moderatorAddress_, address vaultAddress_, address[] memory minterAddressArray_, uint96 royaltyNumerator_ ) external;
  function isCharacterLocked ( uint256 tokenId_ ) external view returns ( bool );
  function isGuildWhitelisted ( address guildAddress_ ) external view returns ( bool );
  function isInitialised (  ) external view returns ( bool );
  function isTransferable ( bytes32 classHash_ ) external view returns ( bool );
  function lockCharacter ( uint256 slotId_, uint256 characterId_, address guildAddress_, bytes memory extraData_ ) external;
  function owner (  ) external view returns ( address );
  function safeMint ( address to_, bytes32 classHash_ ) external returns ( uint256 );
  function salvageTokensFromContract ( address tokenAddress_, address to_, uint256 amount_ ) external;
  function setBaseURI ( string memory baseUri_ ) external;
  function setNotTransferable ( bytes32 classHash_, bool nonTransferable_) external;
  function setRoyaltyNumerator ( uint96 royaltyNumerator_ ) external;
  function setTokenURI ( uint256 tokenId_, string memory tokenUri_ ) external;
  function setVaultAddress ( address vaultAddress_ ) external;
  function setWhitelistGuild ( address guildAddress_, bool isWhitelisted_ ) external;
  function unlockCharacter ( uint256 slotId_, uint256 characterId_, address guildAddress_, bytes memory extraData_ ) external;
  function getCharacter(uint256 tokenId_) external view returns (CharacterNftResult memory);
  function getCharactersByAccount(uint256 page_, uint256 pageSize_, address account_) external view returns (CharacterNftResult[] memory);
}

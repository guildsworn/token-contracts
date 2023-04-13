//SPDX-License-Identifier: Unlicense 
pragma solidity ^0.8.4;
interface IEldfallTokenContract {
  function MINTER_ROLE (  ) external view returns ( bytes32 );
  function init ( address defaultAdminAddress_, address[] memory minterAddressArray_ ) external;
  function isInitialised (  ) external view returns ( bool );
  function safeMint ( address to_, uint256 amount_ ) external;
  function salvageTokensFromContract ( address tokenAddress_, address to_, uint256 amount_ ) external;
  function burn(uint256 amount_) external;
  function burnFrom(address account_, uint256 amount_) external;
}

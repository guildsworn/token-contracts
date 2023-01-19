// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

contract EldfallTokenContract is ERC20, ERC20Burnable, AccessControlEnumerable {
	bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

	bool private _initialised;

	constructor() ERC20("EldfallToken", "ELD") {
		_grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
	}

	// **************************************************
	// *************** DEFAULT_ADMIN REGION *************
	// **************************************************
	function init(
		address defaultAdminAddress_,
		address[] memory minterAddressArray_
	) public onlyRole(DEFAULT_ADMIN_ROLE) {
		require(!_initialised, "Contract is already initialised!");

		_grantRole(DEFAULT_ADMIN_ROLE, defaultAdminAddress_);

		for (uint i = 0; i < minterAddressArray_.length; i++) {
			_grantRole(MINTER_ROLE, minterAddressArray_[i]);
		}

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
		uint256 amount_
	) public onlyRole(MINTER_ROLE) {
		_mint(to_, amount_);
		emit TokensMinted(_msgSender(), to_, amount_);
	}

	// **************************************************
	// ************** PUBLIC GETTERS REGION *************
	// **************************************************
	function isInitialised() public view returns (bool) {
		return _initialised;
	}

	// **************************************************
	// ****************** EVENTS REGION *****************
	// **************************************************
	event TokensMinted(address indexed from, address indexed to, uint amount);
	event TokensSalvaged(
		address indexed tokenAddress,
		address indexed userAddress,
		uint amount
	);
}

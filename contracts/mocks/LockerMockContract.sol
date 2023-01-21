
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../interfaces/IGuild.sol";

contract LockerMockContract is IGuild 
{

    constructor() {
	}

    function lockCharacter(address userAddress_, uint slotId_, uint nftId_, bytes memory extraData_ ) public {

    }

    function unlockCharacter(address userAddress_, uint slotId_, uint characterId, bytes memory extraData_) public {

    }
}



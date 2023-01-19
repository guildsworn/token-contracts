// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IGuild {
    function lockCharacter(address userAddress_, uint slotId_, uint nftId_, bytes memory extraData_ ) external;
    function unlockCharacter(address userAddress_, uint slotId_, uint characterId, bytes memory extraData_) external;
}
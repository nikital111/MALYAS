// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../utils/Ownable.sol";
import "../MALYAS.sol";
import "../otherContracts/TestToken.sol";

contract Airdrop is Ownable {
    // Раздаваемый токен
    MALYAS private _givenToken;
    // Удерживаемый токен
    TestToken private _heldToken;

    // Задает значения {_givenToken}, {_heldToken}.
    constructor(MALYAS givenToken_, TestToken heldToken_) {
        _givenToken = givenToken_;
        _heldToken = heldToken_;
    }

    // Событие при раздаче
    event DistributedAirdrop(
        address indexed givenToken,
        uint256 receiversCount,
        uint256 timestamp,
        uint256 amount
    );

    // Раздать токены холдерам
    function distributeAirdrop(address[] memory receivers) external onlyOwner {
        uint256 balance = _givenToken.balanceOf(address(this));
        uint256 reward = balance / receivers.length;

        for (uint256 i = 0; i < receivers.length; i++) {
            if (_heldToken.balanceOf(receivers[i]) > 0) {
                require(_givenToken.transfer(receivers[i], reward));
            }
        }

        emit DistributedAirdrop(
            address(_givenToken),
            receivers.length,
            block.timestamp,
            balance
        );
    }
}

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

    // Забрал ли адрес аирдроп
    mapping(address => bool) claimed;

    // Задает значения {_givenToken}, {_heldToken}.
    constructor(MALYAS givenToken_, TestToken heldToken_) {
        _givenToken = givenToken_;
        _heldToken = heldToken_;
    }

    // Событие при раздаче
    event DistributedAirdrop(uint256 receiversCount, uint256 timestamp);

    // Событие при клейме
    event ClaimAirdrop(address beneficiary, uint256 amount, uint256 timestamp);

    // Раздать токены холдерам
    function distributeAirdrop(
        address[] calldata receivers,
        uint256[] calldata amounts
    ) external onlyOwner {
        require(receivers.length == amounts.length);

        for (uint256 i = 0; i < receivers.length; i++) {
            if (_heldToken.balanceOf(receivers[i]) > 0) {
                require(_givenToken.transfer(receivers[i], amounts[i]));
            }
        }

        emit DistributedAirdrop(receivers.length, block.timestamp);
    }

    // Забрать аирдроп
    function claimAirdrop() external {
        require(!claimed[msg.sender], "claimed");
        uint256 balanceUser = _heldToken.balanceOf(msg.sender);
        require(balanceUser > 0, "no holden token");

        _givenToken.transfer(msg.sender, balanceUser);

        claimed[msg.sender] = true;

        emit ClaimAirdrop(msg.sender, balanceUser, block.timestamp);
    }
}
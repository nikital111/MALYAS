// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../utils/Ownable.sol";
import "../MALYAS.sol";
import "../otherContracts/TestToken.sol";

contract Airdrop is Ownable {
    MALYAS private _givenToken;
    TestToken private _holdenToken;

    constructor(MALYAS givenToken_, TestToken holdenToken_) {
        _givenToken = givenToken_;
        _holdenToken = holdenToken_;
    }

    event DistributedAirdrop(address indexed givenToken, uint receiversCount, uint timestamp, uint amount);

    function distributeAirdrop(address[] memory receivers) external onlyOwner {
        // uint coefficient = balance / allHolderTokens;
        // uint reward = _holdenToken.balanceOf(receivers[i]) * coefficient;
        uint256 balance = _givenToken.balanceOf(address(this));
        uint256 reward = balance / receivers.length;

        for (uint256 i = 0; i < receivers.length; i++) {
            if (_holdenToken.balanceOf(receivers[i]) > 0) {
                require(_givenToken.transfer(receivers[i], reward));
            }
        }

        emit DistributedAirdrop(address(_givenToken), receivers.length, block.timestamp, balance);
    }
}

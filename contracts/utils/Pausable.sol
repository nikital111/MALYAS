// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Ownable.sol";

contract Pausable is Ownable {
    bool paused;

    function pause(bool _pause) public onlyOwner {
        paused = _pause;
    }
}

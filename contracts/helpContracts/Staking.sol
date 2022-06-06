// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../utils/Ownable.sol";
import "../MALYAS.sol";

contract Staking is Ownable {
    MALYAS private _token;
    // lock tokens and staking
    uint256 _stakingPeriod;
    // % in year
    uint256 _rewardInYear;
    // time vesting
    uint256 _vesting;
    // time one unlock
    uint256 _oneVesting;
    bool status = true;

    constructor(
        MALYAS token_,
        uint256 stakingPeriod_,
        uint256 rewardInYear_,
        uint256 vesting_,
        uint256 oneVesting_
    ) {
        _token = token_;
        _stakingPeriod = stakingPeriod_;
        _rewardInYear = rewardInYear_;
        _vesting = vesting_;
        _oneVesting = oneVesting_;
    }

    struct Bid {
        uint256 amount;
        uint256 start;
        uint256 end;
        uint256 reward;
    }

    mapping(address => Bid) bids;

    event DoBid(address indexed bidder, uint256 amount, uint256 timestamp);
    event RemoveBid(address indexed bidder, uint256 amount, uint256 timestamp);
    event ClaimReward(
        address indexed bidder,
        uint256 amount,
        uint256 timestamp
    );

    function doBid(uint256 _amount) public {
        require(_amount > 0, "incorrect amount");
        require(
            bids[msg.sender].amount == 0 && bids[msg.sender].reward == 0,
            "bid exist"
        );
        require(status, "staking is closed");

        _token.transferFrom(msg.sender, address(this), _amount);

        uint256 reward = getReward(_amount);

        Bid memory curBid = Bid(
            _amount,
            block.timestamp,
            block.timestamp + _stakingPeriod,
            reward
        );

        bids[msg.sender] = curBid;

        emit DoBid(msg.sender, _amount, block.timestamp);
    }

    function removeBid() public {
        require(
            block.timestamp >= bids[msg.sender].end,
            "tokens are still frozen"
        );
        require(bids[msg.sender].amount > 0, "bid does not exist");

        uint256 _amount = bids[msg.sender].amount;

        _token.transfer(msg.sender, bids[msg.sender].amount);

        if (bids[msg.sender].reward == 0) {
            delete bids[msg.sender];
        } else {
            bids[msg.sender].amount = 0;
        }

        emit RemoveBid(msg.sender, _amount, block.timestamp);
    }

    function claimReward() external {
        uint256 _amount = getAvailableTokens(msg.sender);
        require(bids[msg.sender].reward > 0, "no award");
        require(_amount > 0, "tokens are still frozen");

        _token.transfer(msg.sender, _amount);

        if (
            bids[msg.sender].reward - _amount == 0 &&
            bids[msg.sender].amount == 0
        ) {
            delete bids[msg.sender];
        } else {
            bids[msg.sender].reward -= _amount;
        }

        emit ClaimReward(msg.sender, _amount, block.timestamp);
    }

    function getInfoBid(address bidder) public view returns (Bid memory) {
        return bids[bidder];
    }

    function getReward(uint256 _amount) public view returns (uint256) {
        uint256 reward = ((_amount *
            ((_rewardInYear *
                10**18 *
                ((_stakingPeriod * 10**18) / 31557600000)) / 10**18)) /
            10**18) / 100;

        return reward;
    }

    function getAvailableTokens(address bidder) public view returns (uint256) {
        uint256 startVesting = bids[bidder].start + _stakingPeriod;
        uint256 vestingTimes = (block.timestamp - startVesting) / _oneVesting;
        uint256 oneVestinPart = _vesting / _oneVesting;
        uint256 onePart = bids[bidder].reward / oneVestinPart;
        if (vestingTimes >= oneVestinPart) {
            return bids[bidder].reward;
        } else {
            return onePart * vestingTimes;
        }
    }

    function changeStatus(bool _status) external onlyOwner {
        status = _status;
    }
}

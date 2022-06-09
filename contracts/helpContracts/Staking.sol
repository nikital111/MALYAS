// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../utils/Ownable.sol";
import "../MALYAS.sol";

contract Staking is Ownable {
    MALYAS private _token;
    // Период стейкинга
    uint256 _stakingPeriod;
    // % в год
    uint256 _rewardInYear;
    // Период всего вестинга
    uint256 _vesting;
    // Период одной части вестинга
    uint256 _oneVesting;
    // Статус стейкинга
    bool status = true;

    // Задает значения {_token}, {_stakingPeriod}, {_rewardInYear}, {_vesting}, {_oneVesting}.
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

    /*
    Структура ставки {
        сумма стейкинга, 
        начало стейкинга, 
        конец стейкинга, 
        общая награда, 
        оставшаяся награда, 
        периодов уже выплачено
        }
    */
    struct Bid {
        uint256 amount;
        uint256 start;
        uint256 end;
        uint256 reward;
        uint256 rewardLeft;
        uint256 alreadyVested;
    }

    // Маппинг всех ставок по адрессам
    mapping(address => Bid) bids;

    // События
    event DoBid(address indexed bidder, uint256 amount, uint256 timestamp);
    event RemoveBid(address indexed bidder, uint256 amount, uint256 timestamp);
    event ClaimReward(
        address indexed bidder,
        uint256 amount,
        uint256 timestamp
    );

    /*
     * Застейкать определенное количество токенов
     * Только одна ставка от одного адресса
     * Может быть приостановлено владельцем
     * Пользователь должен заранее сделать approve токенов контракту
     */
    function doBid(uint256 _amount) public {
        require(_amount > 0, "incorrect amount");
        require(
            bids[msg.sender].amount == 0 && bids[msg.sender].rewardLeft == 0,
            "bid exist"
        );
        require(status, "staking is closed");

        _token.transferFrom(msg.sender, address(this), _amount);

        uint256 reward = getReward(_amount);

        Bid memory curBid = Bid(
            _amount,
            block.timestamp,
            block.timestamp + _stakingPeriod,
            reward,
            reward,
            0
        );

        bids[msg.sender] = curBid;

        emit DoBid(msg.sender, _amount, block.timestamp);
    }

    /*
     * Забрать свои токены обратно
     * Только по окончанию стейкинга
     */
    function removeBid() public {
        require(
            block.timestamp >= bids[msg.sender].end,
            "tokens are still frozen"
        );
        require(bids[msg.sender].amount > 0, "bid does not exist");

        uint256 _amount = bids[msg.sender].amount;

        _token.transfer(msg.sender, bids[msg.sender].amount);

        if (bids[msg.sender].rewardLeft == 0) {
            delete bids[msg.sender];
        } else {
            bids[msg.sender].amount = 0;
        }

        emit RemoveBid(msg.sender, _amount, block.timestamp);
    }

    /*
     * Получить награду
     * Награды выдаються линейно за один период стейкинга
     * Можно забрать награду сразу за несколько периодов или всю награду
     */
    function claimReward() external {
        uint256[2] memory info = getAvailableTokens(msg.sender);
        uint256 _amount = info[0];
        uint256 _vested = info[1];
        require(bids[msg.sender].rewardLeft > 0, "no award");
        require(_amount > 0, "tokens are still frozen");

        _token.transfer(msg.sender, _amount);

        if (
            bids[msg.sender].rewardLeft - _amount == 0 &&
            bids[msg.sender].amount == 0
        ) {
            delete bids[msg.sender];
        } else {
            bids[msg.sender].rewardLeft -= _amount;
            bids[msg.sender].alreadyVested += _vested;
        }

        emit ClaimReward(msg.sender, _amount, block.timestamp);
    }

    // Информация по определенной ставке
    function getInfoBid(address bidder) public view returns (Bid memory) {
        return bids[bidder];
    }

    // Рассчитать всю награду за стейкинг
    function getReward(uint256 _amount) public view returns (uint256) {
        uint256 reward = ((_amount *
            ((_rewardInYear *
                10**18 *
                ((_stakingPeriod * 10**18) / 31557600000)) / 10**18)) /
            10**18) / 100;

        return reward;
    }

    // Узнать текущую награду
    function getAvailableTokens(address bidder)
        public
        view
        returns (uint256[2] memory)
    {
        uint256 startVesting = bids[bidder].start + _stakingPeriod;
        uint256 vestingTimes = ((block.timestamp - startVesting) /
            _oneVesting) - bids[bidder].alreadyVested;
        uint256 oneVestingPart = _vesting / _oneVesting;
        uint256 onePart = bids[bidder].reward / oneVestingPart;
        if (vestingTimes >= oneVestingPart) {
            return [bids[bidder].reward, vestingTimes];
        } else {
            return [onePart * vestingTimes, vestingTimes];
        }
    }

    /*
     * Приостановить или продолжить стейкинг
     * Награды и токены можно забирать, если стейкинг приостановлен
     */
    function changeStatus(bool _status) external onlyOwner {
        status = _status;
    }
}

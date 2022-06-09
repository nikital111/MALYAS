// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../utils/Ownable.sol";
import "../MALYAS.sol";

contract TeamTokens is Ownable {
    MALYAS private _token;
    // Период заморозки токенов
    uint256 public _cliff;
    // Адрес на который будут выведены токены
    address public _beneficiary;

    // Задает значения {_token}, {_cliff}, {_beneficiary}.
    constructor(
        MALYAS token_,
        uint256 cliff_,
        address beneficiary_
    ) {
        require(cliff_ > block.timestamp, "cliff incorrect");
        require(beneficiary_ != address(0), "beneficiary incorrect");
        _token = token_;
        _cliff = cliff_;
        _beneficiary = beneficiary_;
    }

    // Событие при выводе токенов
    event WithdrawnTokens(
        address beneficiary,
        uint256 amount,
        uint256 timestamp
    );

    // Вывод токенов
    function withdrawTokens(uint256 _amount) external onlyOwner {
        require(block.timestamp >= _cliff, "tokens are still frozen");
        _token.transfer(_beneficiary, _amount);

        emit WithdrawnTokens(_beneficiary, _amount, block.timestamp);
    }
}

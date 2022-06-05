//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "../utils/SafeMath.sol";

contract TestToken {
    using SafeMath for uint256;

    string public constant name = "TestToken";
    string public constant symbol = "TT";
    uint8 public constant decimals = 18;
    address private owner;
    uint256 public totalSupply;

    modifier onlyOwner() {
        require(owner == msg.sender, "You are not an owner!");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    mapping(address => uint256) balances;

    mapping(address => mapping(address => uint256)) allowed;

    event Transfer(address indexed _from, address indexed _to, uint256 value);
    event Approval(address indexed _from, address indexed _to, uint256 value);

    function mint(address _to, uint256 _value) public onlyOwner {
        require(_value > 0);
        balances[_to] = balances[_to].add(_value);
        totalSupply = totalSupply.add(_value);
        emit Transfer(address(0), _to, _value);
    }

    function balanceOf(address _owner) public view returns (uint256) {
        return balances[_owner];
    }

    function allowance(address _owner, address _spender)
        public
        view
        returns (uint256)
    {
        return allowed[_owner][_spender];
    }

    function transfer(address _to, uint256 _value) public returns (bool) {
        require(balances[msg.sender] >= _value && _to != address(0));
        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool) {
        require(
            balances[_from] >= _value &&
                allowed[_from][msg.sender] >= _value &&
                _to != address(0)
        );
        balances[_from] = balances[_from].sub(_value);
        balances[_to] = balances[_to].add(_value);
        allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
        emit Transfer(_from, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool) {
        allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }
}

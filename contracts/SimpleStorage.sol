// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleStorage {
    uint256 private storedData;

    event DataStored(uint256 newValue);

    function store(uint256 x) public {
        storedData = x;
        emit DataStored(x);
    }

    function retrieve() public view returns (uint256) {
        return storedData;
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract FlipCoin {
    event FlipResult(bool result);

    function flip() public returns (bool) {
        // pseudo-random (not safe for real gambling)
        bool result = (block.timestamp % 2 == 0);
        emit FlipResult(result);
        return result;
    }
}

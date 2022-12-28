// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestCBANK is ERC20 {
    uint256 private constant _initialSupply = 10_000_000_000e18;

    constructor() ERC20("CRYPTO BANK", "CBANK") {
        _mint(_msgSender(), _initialSupply);
    }
}

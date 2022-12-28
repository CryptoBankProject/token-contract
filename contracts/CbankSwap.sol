// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IERC20 {
    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function transfer(address to, uint256 amount) external returns (bool);

    function allowance(address owner, address spender) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }
}

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _transferOwnership(_msgSender());
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

contract CbankSwap is Ownable {
    IERC20 public legacyCBANK; // 0x52f4c436c9aab5b5d0dd31fb3fb8f253fd6cb285
    IERC20 public newCBANK; // 0xf2Eb788Cfc3386A6511b7D1973E3Fe6f87f89117

    constructor(address _legacyCBANK, address _newCBANK) {
        legacyCBANK = IERC20(_legacyCBANK);
        newCBANK = IERC20(_newCBANK);
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    function swap() external {
        address msgSender = _msgSender();
        address contractAddress = address(this);
        uint256 legacyBalance = legacyCBANK.balanceOf(msgSender);
        uint256 swapBalance = legacyBalance; /// adjust for totalSupply difference, in this case 1:1

        require(legacyBalance > 0, "Insufficient oCBANK");
        require(legacyCBANK.allowance(msgSender, contractAddress) >= legacyBalance, "Allowance too low");
        require(swapBalance <= newCBANK.balanceOf(contractAddress), "Insufficient new CBANK");

        legacyCBANK.transferFrom(msgSender, contractAddress, legacyBalance);
        newCBANK.transfer(msgSender, swapBalance);
    }

    function withdraw() external onlyOwner {
        newCBANK.transfer(owner(), newCBANK.balanceOf(address(this)));
    }

    function withdrawLegacy() external onlyOwner {
        legacyCBANK.transfer(owner(), legacyCBANK.balanceOf(address(this)));
    }

    /**
     * @dev Recover ERC20 coin in contract address.
     * @param tokenAddress The token contract address
     * @param tokenAmount Number of tokens to be sent
     */
    function recoverERC20(address tokenAddress, uint256 tokenAmount) public onlyOwner {
        IERC20(tokenAddress).transfer(owner(), tokenAmount);
    }
}

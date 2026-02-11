// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IRWAToken {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function mint(address to, uint256 amount, string memory proofHash) external;
    function whitelistInvestor(address investor, string memory investorId) external;
    function blacklistInvestor(address investor, string memory reason) external;
    function isCompliant(address investor) external view returns (bool);
}

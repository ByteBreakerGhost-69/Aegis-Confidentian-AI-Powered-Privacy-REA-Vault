// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @title RWAToken
 * @dev Token yang di-backup oleh aset nyata dengan verifikasi Chainlink Proof of Reserve (PoR).
 */
contract RWAToken is ERC20, Ownable {
    
    // Interface untuk Chainlink Proof of Reserve Feed
    AggregatorV3Interface internal reserveFeed;

    event MintRequested(uint256 amount);

    constructor(
        string memory name, 
        string memory symbol, 
        address _reserveFeed // Alamat Feed PoR dari Chainlink
    ) ERC20(name, symbol) Ownable(msg.sender) {
        reserveFeed = AggregatorV3Interface(_reserveFeed);
    }

    /**
     * @dev Fungsi untuk mencetak token RWA.
     * Hanya bisa dilakukan jika jumlah yang beredar tidak melebihi cadangan asli di dunia nyata.
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(getLatestReserve() >= (totalSupply() + amount), "RWA: Insufficient Physical Reserve");
        
        _mint(to, amount);
    }

    /**
     * @dev Mengambil data cadangan terbaru dari Chainlink Proof of Reserve.
     */
    function getLatestReserve() public view returns (uint256) {
        (
            /* uint80 roundID */,
            int answer,
            /* uint startedAt */,
            /* uint updatedAt */,
            /* uint80 answeredInRound */
        ) = reserveFeed.latestRoundData();
        
        // Memastikan data valid
        require(answer > 0, "RWA: Invalid Reserve Data");
        return uint256(answer);
    }

    /**
     * @dev Update alamat PoR Feed jika diperlukan (misal pindah ke feed yang lebih akurat).
     */
    function updateReserveFeed(address _newFeed) external onlyOwner {
        reserveFeed = AggregatorV3Interface(_newFeed);
    }
}


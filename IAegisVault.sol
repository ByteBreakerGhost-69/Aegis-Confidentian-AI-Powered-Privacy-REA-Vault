// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IAegisVault {
    struct AIInsight {
        uint256 timestamp;
        string recommendation;
        uint256 confidence;
        RiskLevel riskLevel;
    }
    
    enum RiskLevel { LOW, MEDIUM, HIGH }
    
    function deposit(address rwaToken, uint256 amount) external returns (uint256);
    function withdraw(address rwaToken, uint256 shareAmount) external returns (uint256);
    function requestAIInsight() external returns (bytes32);
    function getAssetValueInUSD(uint256 ethAmount) external view returns (uint256);
    function userInsights(address) external view returns (AIInsight memory);
    function emergencyPause(string memory reason) external;
    function resume() external;
}

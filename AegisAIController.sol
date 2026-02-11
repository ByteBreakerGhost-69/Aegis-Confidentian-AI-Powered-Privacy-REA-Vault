// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol";
import "./interfaces/IAegisVault.sol";
import "./libraries/AegisAccessControl.sol";

/**
 * @title AegisAIController - AI Decision Automation
 * @dev Uses Chainlink Automation for periodic AI analysis
 */
contract AegisAIController is AutomationCompatibleInterface {
    IAegisVault public vault;
    
    // Automation settings
    uint256 public lastAnalysisTime;
    uint256 public analysisInterval = 1 days; // Daily analysis
    uint256 public minTVLToAnalyze = 10 ether; // Minimum TVL to trigger
    
    // AI Model versions
    struct AIModel {
        string version;
        uint256 accuracy;
        bool active;
    }
    
    AIModel[] public aiModels;
    uint256 public activeModelId;
    
    event AnalysisTriggered(uint256 timestamp, uint256 tvl);
    ModelUpdated(uint256 modelId, string version);
    
    constructor(address vaultAddress) {
        vault = IAegisVault(vaultAddress);
        
        // Initialize with default model
        aiModels.push(AIModel({
            version: "v1.0",
            accuracy: 85,
            active: true
        }));
        activeModelId = 0;
    }
    
    /**
     * @dev Chainlink Automation checkUpkeep function
     */
    function checkUpkeep(bytes calldata /* checkData */) 
        external 
        view 
        override 
        returns (bool upkeepNeeded, bytes memory performData) 
    {
        uint256 currentTVL = vault.totalAssets();
        
        upkeepNeeded = 
            block.timestamp >= lastAnalysisTime + analysisInterval &&
            currentTVL >= minTVLToAnalyze &&
            AegisAccessControl.isAutomationActive();
        
        performData = abi.encode(currentTVL, block.timestamp);
    }
    
    /**
     * @dev Chainlink Automation performUpkeep function
     */
    function performUpkeep(bytes calldata performData) external override {
        (uint256 currentTVL, uint256 analysisTime) = 
            abi.decode(performData, (uint256, uint256));
        
        require(
            block.timestamp >= lastAnalysisTime + analysisInterval,
            "Not enough time passed"
        );
        require(currentTVL >= minTVLToAnalyze, "TVL too low");
        require(AegisAccessControl.isAutomationActive(), "Automation inactive");
        
        // Update analysis time
        lastAnalysisTime = block.timestamp;
        
        // In production, would trigger AI analysis here
        // For demo, emit event
        emit AnalysisTriggered(block.timestamp, currentTVL);
    }
    
    /**
     * @dev Add new AI model
     */
    function addAIModel(string memory version, uint256 accuracy) 
        external 
        onlyAdmin 
    {
        // Deactivate old models
        for (uint i = 0; i < aiModels.length; i++) {
            aiModels[i].active = false;
        }
        
        aiModels.push(AIModel({
            version: version,
            accuracy: accuracy,
            active: true
        }));
        
        activeModelId = aiModels.length - 1;
        
        emit ModelUpdated(activeModelId, version);
    }
    
    /**
     * @dev Update analysis interval
     */
    function setAnalysisInterval(uint256 interval) external onlyAdmin {
        require(interval >= 1 hours, "Interval too short");
        require(interval <= 7 days, "Interval too long");
        analysisInterval = interval;
    }
    
    /**
     * @dev Get active model info
     */
    function getActiveModel() external view returns (AIModel memory) {
        return aiModels[activeModelId];
    }
    
    modifier onlyAdmin() {
        require(AegisAccessControl.isAdmin(msg.sender), "Not admin");
        _;
    }
}

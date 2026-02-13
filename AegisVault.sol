// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import "./libraries/PriceConverter.sol";
import "./libraries/AegisAccessControl.sol";
import "./interfaces/IAegisVault.sol";
import "./interfaces/IRWAToken.sol";

/**
 * @title AegisVault - AI-Powered Privacy RWA Vault
 * @dev Integrates Chainlink Data Feeds for pricing
 * @dev AI Insights via separate FunctionsClient contract
 */
contract AegisVault is ConfirmedOwner, IAegisVault {
    using PriceConverter for uint256;
    
    // ========== STATE VARIABLES ==========
    
    // Chainlink Data Feed
    AggregatorV3Interface public priceFeed;
    
    // Vault State
    uint256 public totalAssets;
    uint256 public totalShares;
    mapping(address => uint256) public shares;
    
    // AI Insights - received from FunctionsClient
    struct AIInsight {
        uint256 timestamp;
        string recommendation;
        uint256 confidence;
        RiskLevel riskLevel;
    }
    
    enum RiskLevel { LOW, MEDIUM, HIGH }
    mapping(address => AIInsight) public userInsights;
    
    // Subscription management
    mapping(address => bool) public hasActiveSubscription;
    
    // FunctionsClient reference
    address public functionsClient;
    
    // Access Control
    AegisAccessControl public accessControl;
    
    // ========== EVENTS ==========
    
    event Deposit(address indexed user, uint256 assets, uint256 shares);
    event Withdraw(address indexed user, uint256 assets, uint256 shares);
    event AIReceived(address indexed user, string recommendation, uint256 confidence);
    event EmergencyPaused(address indexed admin, string reason);
    event FunctionsClientUpdated(address indexed newClient);
    event SubscriptionGranted(address indexed user);
    event SubscriptionRevoked(address indexed user);
    
    // ========== MODIFIERS ==========
    
    modifier onlyWhenNotPaused() {
        require(!accessControl.isPaused(), "Vault is paused");
        _;
    }
    
    modifier onlyWithSubscription() {
        require(hasActiveSubscription[msg.sender], "No active subscription");
        _;
    }
    
    modifier onlyFunctionsClient() {
        require(msg.sender == functionsClient, "Only FunctionsClient");
        _;
    }
    
    // ========== CONSTRUCTOR ==========
    
    constructor(
        address _priceFeed,
        address _accessControl
    ) ConfirmedOwner(msg.sender) {
        require(_priceFeed != address(0), "Invalid price feed");
        require(_accessControl != address(0), "Invalid access control");
        
        priceFeed = AggregatorV3Interface(_priceFeed);
        accessControl = AegisAccessControl(_accessControl);
    }
    
    // ========== VAULT CORE FUNCTIONS ==========
    
    /**
     * @dev Deposit assets into vault, receive shares
     */
    function deposit(address rwaToken, uint256 amount) 
        external 
        override
        onlyWhenNotPaused 
        onlyWithSubscription 
        returns (uint256) 
    {
        require(amount > 0, "Amount must be > 0");
        require(rwaToken != address(0), "Invalid token address");
        
        // Transfer RWA tokens to vault
        require(
            IRWAToken(rwaToken).transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        
        // 1:1 share ratio for demo
        uint256 shareAmount = amount;
        
        // Update state
        shares[msg.sender] += shareAmount;
        totalShares += shareAmount;
        totalAssets += amount;
        
        emit Deposit(msg.sender, amount, shareAmount);
        return shareAmount;
    }
    
    /**
     * @dev Withdraw assets from vault
     */
    function withdraw(address rwaToken, uint256 shareAmount) 
        external 
        override
        onlyWhenNotPaused 
        returns (uint256) 
    {
        require(shareAmount > 0, "Shares must be > 0");
        require(shares[msg.sender] >= shareAmount, "Insufficient shares");
        require(rwaToken != address(0), "Invalid token address");
        
        uint256 assetAmount = shareAmount; // 1:1 for demo
        
        // Update state
        shares[msg.sender] -= shareAmount;
        totalShares -= shareAmount;
        totalAssets -= assetAmount;
        
        // Transfer tokens back
        require(
            IRWAToken(rwaToken).transfer(msg.sender, assetAmount),
            "Transfer failed"
        );
        
        emit Withdraw(msg.sender, assetAmount, shareAmount);
        return assetAmount;
    }
    
    // ========== AI INSIGHTS (CALLED BY FUNCTIONS CLIENT) ==========
    
    /**
     * @dev Store AI insight from Chainlink Functions
     * @notice Only callable by registered FunctionsClient
     */
    function storeAIInsight(
        address user,
        string calldata recommendation,
        uint256 confidence
    ) external override onlyFunctionsClient {
        require(user != address(0), "Invalid user");
        require(bytes(recommendation).length > 0, "Empty recommendation");
        require(confidence <= 100, "Invalid confidence");
        
        userInsights[user] = AIInsight({
            timestamp: block.timestamp,
            recommendation: recommendation,
            confidence: confidence,
            riskLevel: _calculateRiskLevel(confidence)
        });
        
        emit AIReceived(user, recommendation, confidence);
    }
    
    // ========== CHAINLINK DATA FEEDS ==========
    
    /**
     * @dev Get asset value in USD with full validation
     */
    function getAssetValueInUSD(uint256 ethAmount) 
        public 
        view 
        override
        returns (uint256) 
    {
        require(address(priceFeed) != address(0), "Price feed not set");
        
        (
            uint80 roundId,
            int256 price,
            ,
            uint256 updatedAt,
            uint80 answeredInRound
        ) = priceFeed.latestRoundData();
    
        require(price > 0, "Invalid price");
        require(updatedAt >= block.timestamp - 2 hours, "Stale price");
        require(answeredInRound >= roundId, "Round incomplete");
        require(roundId > 0, "No rounds completed");
        
        return (ethAmount * uint256(price)) / 1e18;
    }
    
    // ========== SUBSCRIPTION MANAGEMENT ==========
    
    /**
     * @dev Grant subscription to user (admin only)
     */
    function grantSubscription(address user) external onlyOwner {
        require(user != address(0), "Invalid user");
        hasActiveSubscription[user] = true;
        emit SubscriptionGranted(user);
    }
    
    /**
     * @dev Revoke subscription from user (admin only)
     */
    function revokeSubscription(address user) external onlyOwner {
        require(hasActiveSubscription[user], "No active subscription");
        hasActiveSubscription[user] = false;
        emit SubscriptionRevoked(user);
    }
    
    /**
     * @dev Check if user has active subscription
     */
    function checkSubscription(address user) external view returns (bool) {
        return hasActiveSubscription[user];
    }
    
    // ========== FUNCTIONS CLIENT MANAGEMENT ==========
    
    /**
     * @dev Set FunctionsClient contract address
     */
    function setFunctionsClient(address _functionsClient) external onlyOwner {
        require(_functionsClient != address(0), "Invalid address");
        functionsClient = _functionsClient;
        emit FunctionsClientUpdated(_functionsClient);
    }
    
    // ========== EMERGENCY CONTROLS ==========
    
    /**
     * @dev Emergency pause (admin only)
     */
    function emergencyPause(string calldata reason) external onlyOwner {
        accessControl.pause();
        emit EmergencyPaused(msg.sender, reason);
    }
    
    /**
     * @dev Resume operations (admin only)
     */
    function resume() external onlyOwner {
        accessControl.unpause();
    }
    
    // ========== INTERNAL FUNCTIONS ==========
    
    /**
     * @dev Calculate risk level based on confidence score
     */
    function _calculateRiskLevel(uint256 confidence) 
        internal 
        pure 
        returns (RiskLevel) 
    {
        if (confidence >= 80) return RiskLevel.LOW;
        if (confidence >= 50) return RiskLevel.MEDIUM;
        return RiskLevel.HIGH;
    }
    
    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @dev Get user's current insight
     */
    function getUserInsight(address user) 
        external 
        view 
        returns (AIInsight memory) 
    {
        return userInsights[user];
    }
    
    /**
     * @dev Get vault statistics
     */
    function getVaultStats() external view returns (
        uint256 _totalAssets,
        uint256 _totalShares,
        uint256 _userCount
    ) {
        return (totalAssets, totalShares, 0); // userCount optional
    }
}

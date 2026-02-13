// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IRWAToken
 * @dev Interface for Real World Asset Token with compliance and Chainlink integration
 */
interface IRWAToken {
    // ========== ENUMS ==========
    
    /**
     * @dev Compliance status for investors
     */
    enum ComplianceStatus {
        PENDING,    // Menunggu verifikasi
        APPROVED,   // KYC/AML approved
        REJECTED,   // Ditolak
        BLACKLISTED // Diblacklist
    }
    
    // ========== STRUCTS ==========
    
    /**
     * @dev Investor information
     */
    struct InvestorInfo {
        string investorId;        // KYC/AML reference ID
        ComplianceStatus status;  // Compliance status
        uint256 verifiedAt;       // Timestamp verifikasi
        string countryCode;       // Country of residence (ISO 3166-1 alpha-2)
    }
    
    /**
     * @dev Asset backing information
     */
    struct AssetBacking {
        uint256 amount;          // Amount of tokens backed
        string proofHash;       // IPFS hash of proof document
        uint256 timestamp;      // When backing was recorded
        string valuer;          // Independent valuer/inspector
    }
    
    // ========== CORE FUNCTIONS ==========
    
    /**
     * @dev Mint new RWA tokens with proof of asset backing
     * @param to Recipient address
     * @param amount Amount to mint
     * @param proofHash IPFS hash of real-world asset proof document
     */
    function mint(address to, uint256 amount, string memory proofHash) external;
    
    /**
     * @dev Burn RWA tokens when asset is sold/derecognized
     * @param amount Amount to burn
     * @param reason Reason for burning
     */
    function burn(uint256 amount, string memory reason) external;
    
    // ========== COMPLIANCE FUNCTIONS ==========
    
    /**
     * @dev Whitelist investor after KYC/AML approval
     * @param investor Address of investor
     * @param investorId KYC/AML reference ID
     * @param countryCode Country code (ISO 3166-1 alpha-2)
     */
    function whitelistInvestor(
        address investor, 
        string memory investorId,
        string memory countryCode
    ) external;
    
    /**
     * @dev Blacklist investor for compliance/sanctions reasons
     * @param investor Address of investor
     * @param reason Reason for blacklisting
     */
    function blacklistInvestor(address investor, string memory reason) external;
    
    /**
     * @dev Update investor compliance status
     * @param investor Address of investor
     * @param status New compliance status
     */
    function updateComplianceStatus(address investor, ComplianceStatus status) external;
    
    /**
     * @dev Check if investor is compliant (whitelisted and not blacklisted)
     * @param investor Address of investor
     * @return bool True if compliant
     */
    function isCompliant(address investor) external view returns (bool);
    
    /**
     * @dev Get detailed investor information
     * @param investor Address of investor
     * @return InvestorInfo struct
     */
    function getInvestorInfo(address investor) external view returns (InvestorInfo memory);
    
    // ========== ASSET BACKING FUNCTIONS ==========
    
    /**
     * @dev Record asset backing proof
     * @param amount Amount of tokens backed
     * @param proofHash IPFS hash of proof document
     * @param valuer Name/ID of independent valuer
     */
    function recordAssetBacking(
        uint256 amount,
        string memory proofHash,
        string memory valuer
    ) external;
    
    /**
     * @dev Get asset backing history
     * @param index Index in history array
     * @return AssetBacking struct
     */
    function getAssetBacking(uint256 index) external view returns (AssetBacking memory);
    
    /**
     * @dev Get total backed amount
     * @return uint256 Total assets backing tokens
     */
    function totalBackedAssets() external view returns (uint256);
    
    // ========== CHAINLINK INTEGRATION ==========
    
    /**
     * @dev Set Chainlink verifier oracle for automatic compliance
     * @param oracle Address of Chainlink oracle
     */
    function setVerifierOracle(address oracle) external;
    
    /**
     * @dev Get verifier oracle address
     */
    function verifierOracle() external view returns (address);
    
    // ========== ERC20 STANDARD FUNCTIONS ==========
    
    /**
     * @dev Transfer tokens with compliance check
     */
    function transfer(address to, uint256 amount) external returns (bool);
    
    /**
     * @dev Transfer tokens from address with compliance check
     */
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    
    /**
     * @dev Approve spender to withdraw tokens
     */
    function approve(address spender, uint256 amount) external returns (bool);
    
    /**
     * @dev Get allowance
     */
    function allowance(address owner, address spender) external view returns (uint256);
    
    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @dev Get token name
     */
    function name() external view returns (string memory);
    
    /**
     * @dev Get token symbol
     */
    function symbol() external view returns (string memory);
    
    /**
     * @dev Get token decimals
     */
    function decimals() external view returns (uint8);
    
    /**
     * @dev Get max supply cap
     */
    function maxSupply() external view returns (uint256);
    
    /**
     * @dev Get current total supply
     */
    function totalSupply() external view returns (uint256);
    
    /**
     * @dev Get token balance of address
     */
    function balanceOf(address account) external view returns (uint256);
    
    /**
     * @dev Get total number of whitelisted investors
     */
    function whitelistedInvestorCount() external view returns (uint256);
    
    /**
     * @dev Get paginated list of whitelisted investors
     * @param offset Starting index
     * @param limit Number of items to return
     */
    function getWhitelistedInvestors(uint256 offset, uint256 limit) 
        external 
        view 
        returns (address[] memory);
    
    // ========== EVENTS ==========
    
    /**
     * @dev Emitted when tokens are minted with asset backing
     */
    event AssetBacked(uint256 amount, string proofHash, string valuer);
    
    /**
     * @dev Emitted when tokens are burned
     */
    event AssetBurned(uint256 amount, string reason);
    
    /**
     * @dev Emitted when investor is whitelisted
     */
    event Whitelisted(
        address indexed investor, 
        string investorId, 
        string countryCode,
        uint256 timestamp
    );
    
    /**
     * @dev Emitted when investor is blacklisted
     */
    event Blacklisted(
        address indexed investor, 
        string reason,
        uint256 timestamp
    );
    
    /**
     * @dev Emitted when compliance status is updated
     */
    event ComplianceStatusUpdated(
        address indexed investor,
        ComplianceStatus status,
        uint256 timestamp
    );
    
    /**
     * @dev Emitted when verifier oracle is updated
     */
    event VerifierOracleUpdated(
        address indexed oldOracle,
        address indexed newOracle,
        uint256 timestamp
    );
    
    /**
     * @dev Emitted when transfer fails compliance check
     */
    event ComplianceCheckFailed(
        address indexed from,
        address indexed to,
        uint256 amount,
        string reason
    );
}

// frontend/src/constants/abi.js

// ========== CONTRACT ADDRESSES ==========
export const CONTRACT_ADDRESSES = {
  // Sepolia Testnet
  11155111: {
    vault: '0x...', // Ganti dengan address vault setelah deploy
    aiController: '0x...', // Ganti dengan address AI controller setelah deploy
    accessControl: '0x...', // Ganti dengan address access control
    rwaToken: '0x...' // Ganti dengan address RWA token
  },
  // Mumbai Testnet
  80001: {
    vault: '0x...',
    aiController: '0x...',
    accessControl: '0x...',
    rwaToken: '0x...'
  }
};

// ========== VAULT ABI ==========
export const VAULT_ABI = [
  // Core Functions
  "function deposit(address rwaToken, uint256 amount) external returns (uint256)",
  "function withdraw(address rwaToken, uint256 shareAmount) external returns (uint256)",
  
  // AI Functions
  "function storeAIInsight(address user, string calldata recommendation, uint256 confidence) external",
  "function userInsights(address user) external view returns (uint256 timestamp, string recommendation, uint256 confidence, uint8 riskLevel)",
  
  // View Functions
  "function totalAssets() external view returns (uint256)",
  "function totalShares() external view returns (uint256)",
  "function shares(address user) external view returns (uint256)",
  "function getAssetValueInUSD(uint256 ethAmount) external view returns (uint256)",
  "function hasActiveSubscription(address user) external view returns (bool)",
  "function functionsClient() external view returns (address)",
  
  // Events
  "event Deposit(address indexed user, uint256 assets, uint256 shares)",
  "event Withdraw(address indexed user, uint256 assets, uint256 shares)",
  "event AIReceived(address indexed user, string recommendation, uint256 confidence)"
];

// ========== AI CONTROLLER ABI ==========
export const AI_CONTROLLER_ABI = [
  // AI Functions
  "function requestAIAnalysis(address user, string calldata assetType, string calldata riskProfile) external returns (bytes32)",
  "function getRequestStatus(bytes32 requestId) external view returns (address user, uint256 timestamp, bool exists)",
  
  // Model Management
  "function getActiveModel() external view returns (string version, string provider, uint256 accuracy, bool active)",
  "function switchProvider(string calldata provider) external",
  "function addAIModel(string memory version, string memory provider, uint256 accuracy, string memory sourceCode, string memory apiEndpoint) external",
  
  // Events
  "event AIRequested(address indexed user, bytes32 indexed requestId)",
  "event AIResponseReceived(address indexed user, string recommendation, uint256 confidence)",
  "event AIRequestFailed(bytes32 indexed requestId, string error)",
  "event ModelUpdated(uint256 modelId, string version, string provider)"
];

// ========== RWA TOKEN ABI ==========
export const RWA_TOKEN_ABI = [
  "function mint(address to, uint256 amount, string memory proofHash) external",
  "function whitelistInvestor(address investor, string memory investorId, string memory countryCode) external",
  "function blacklistInvestor(address investor, string memory reason) external",
  "function isCompliant(address investor) external view returns (bool)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  
  // ERC20
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)",
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  
  // Events
  "event AssetBacked(uint256 amount, string proofHash)",
  "event Whitelisted(address indexed investor, string investorId)"
];

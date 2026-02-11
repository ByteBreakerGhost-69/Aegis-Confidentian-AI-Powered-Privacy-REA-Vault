
# Aeges-Confidentian-AI-Powered-Privacy-REA-Vault

## 📁 Project Structure

```text
contracts/
├── AegisVault.sol              # Main vault contract
├── RWAToken.sol                # RWA tokenization
├── AegisAIController.sol       # AI controller logic
├── libraries/
│   ├── AegisMath.sol           # Tambahkan untuk calculations
│   ├── PriceConverter.sol      # Untuk Chainlink Data Feeds
│   └── AccessControl.sol       # Role-based permissions
└── interfaces/                 # **REKOMENDASI: Tambahkan folder ini**
    ├── IAegisVault.sol
    ├── IChainlink.sol
    └── IAegisAI.sol
scripts/
├── deploy_vault.js
├── request_ai_insight.js
├── setup_ccip.js
├── **setup_functions.js**      # **REKOMENDASI: Tambahkan**
├── **fund_subscription.js**    # Untuk Chainlink Functions subscription
└── **simulate_ai_request.js**  # Testing AI integration
functions/
├── ai_market_analyst.js        # AI analysis logic
├── secrets-config.js           # API keys management
├── **test-local.js**           # Local testing sebelum deploy
├── **package.json**            # Dependencies khusus Functions
└── **encryption-utils.js**     # Untuk privacy features
frontend/
├── components/
│   ├── VaultDashboard.jsx
│   ├── AIInsightsPanel.jsx
│   └── **ChainlinkStatus.jsx** # **REKOMENDASI: Tambahkan**
├── hooks/
│   ├── useAegisVault.js
│   ├── useChainlinkData.js     # **REKOMENDASI: Tambahkan**
│   └── **useAIInsights.js**    # Untuk AI predictions
└── **constants/**
    └── **chainlinkConfig.js**  # Contract addresses, ABIs
test/
├── AegisVault.test.js
├── AegisAI.test.js
├── **integration/**
│   ├── chainlink_functions.test.js
│   └── end_to_end.test.js
└── **fixtures/**
    └── sample_realestate_data.js
├── docs/
│   ├── architecture.md
│   └── chainlink_integration.md
├── .env.example
├── hardhat.config.js
└── README.md                



# Aegis-Confidentian-AI-Powered-Privacy-REA-Vault

## 📁 Project Structure

```text
Aegis-Confidential-AI-Powered-Privacy-REA-Vault/
│
├── contracts/
│   ├── AegisVault.sol
│   ├── RWAToken.sol
│   ├── AegisAIController.sol
│   ├── libraries/
│   │   ├── PriceConverter.sol
│   │   └── AegisAccessControl.sol
│   └── interfaces/
│       ├── IAegisVault.sol
│       ├── IChainlinkFunctions.sol
│       └── IRWAToken.sol
│
├── scripts/
│   ├── deploy_vault.js
│   ├── request_ai_insight.js
│   ├── setup_ccip.js
│   ├── setup_functions.js
│   ├── fund_subscription.js
│   └── check_insight.js
│
├── functions/
│   ├── ai_market_analyst.js
│   ├── secrets-config.js
│   ├── test-local.js
│   └── encryption-utils.js
│
├── test/
│   ├── AegisVault.test.js
│   ├── AegisAI.test.js
│   ├── RWAToken.test.js
│   ├── integration/
│   │   ├── chainlink_functions.test.js
│   │   ├── chainlink_datafeeds.test.js
│   │   └── e2e_hackathon.test.js
│   └── fixtures/
│       └── chainlink_mocks.js
│
├── docs/
│   ├── architecture.md
│   └── chainlink_integration.md
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── manifest.json
│   │
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.js
│   │   ├── index.css
│   │
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── WalletConnector.jsx
│   │   │   │
│   │   │   ├── Vault/
│   │   │   │   ├── VaultDashboard.jsx
│   │   │   │   ├── DepositForm.jsx
│   │   │   │   ├── WithdrawForm.jsx
│   │   │   │   └── VaultStats.jsx
│   │   │   │
│   │   │   ├── AI/
│   │   │   │   ├── AIInsightsPanel.jsx
│   │   │   │   ├── AIRequestForm.jsx
│   │   │   │   ├── AIResultCard.jsx
│   │   │   │   └── ModelSwitcher.jsx
│   │   │   │
│   │   │   └── Chainlink/
│   │   │       ├── ChainlinkStatus.jsx
│   │   │       ├── PriceFeedDisplay.jsx
│   │   │       └── SubscriptionStatus.jsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useWeb3.js
│   │   │   ├── useAegisVault.js
│   │   │   ├── useAIInsights.js
│   │   │   └── useChainlinkData.js
│   │   │
│   │   ├── contexts/
│   │   │   └── Web3Context.jsx
│   │   │
│   │   ├── constants/
│   │   │   ├── addresses.js
│   │   │   ├── abi.js
│   │   │   └── chainlinkConfig.js
│   │   │
│   │   ├── utils/
│   │   │   ├── formatters.js
│   │   │   ├── validators.js
│   │   │   └── errors.js
│   │   │
│   │   └── styles/
│   │       └── tailwind.css
│   │
│   ├── package.json
│   ├── tailwind.config.js
│   └── README.md
│
├── hardhat.config.js
├── .env.example
├── package.json        ← (root hardhat)
├── README.md

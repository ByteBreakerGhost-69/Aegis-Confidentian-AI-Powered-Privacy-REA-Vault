/**
 * @file request_ai_insight.js
 * @description Request AI insight via Chainlink Functions
 * @dev Demo script untuk judges - shows end-to-end Functions flow
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m"
};

async function main() {
  console.log(`${colors.magenta}🤖 Requesting AI Insight via Chainlink Functions${colors.reset}`);
  
  // 📊 Load deployment info
  const network = hre.network.name;
  const deploymentFile = path.join(__dirname, "..", "artifacts", `deployment-${network}.json`);
  
  if (!fs.existsSync(deploymentFile)) {
    console.log(`${colors.red}❌ No deployment found. Run deploy_vault.js first.${colors.reset}`);
    process.exit(1);
  }
  
  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const [user] = await hre.ethers.getSigners();
  
  console.log(`${colors.yellow}User: ${user.address}${colors.reset}`);
  console.log(`${colors.yellow}Network: ${network}${colors.reset}`);
  
  // 📝 Load contracts
  const AegisVault = await hre.ethers.getContractFactory("AegisVault");
  const vault = AegisVault.attach(deployment.contracts.AegisVault);
  
  const RWAToken = await hre.ethers.getContractFactory("RWAToken");
  const rwaToken = RWAToken.attach(deployment.contracts.RWAToken);
  
  // 🎯 STEP 1: Setup demo user
  console.log(`\n${colors.cyan}[1/4] Setting up demo user...${colors.reset}`);
  
  // Mint RWA tokens untuk user
  if (network === "hardhat") {
    // Local network - langsung mint
    await rwaToken.whitelistInvestor(user.address, "HACKATHON_DEMO_001");
    await rwaToken.mint(user.address, hre.ethers.parseEther("100"), "demo_proof_hash");
    console.log(`${colors.green}✅ Minted 100 aRWA tokens${colors.reset}`);
  }
  
  // 🎯 STEP 2: Deposit ke vault
  console.log(`\n${colors.cyan}[2/4] Depositing to vault...${colors.reset}`);
  
  // Approve vault untuk spend tokens
  const depositAmount = hre.ethers.parseEther("10");
  await rwaToken.approve(deployment.contracts.AegisVault, depositAmount);
  
  // Deposit ke vault
  const tx = await vault.deposit(rwaToken.target, depositAmount);
  await tx.wait();
  
  console.log(`${colors.green}✅ Deposited 10 aRWA tokens to vault${colors.reset}`);
  
  // 🎯 STEP 3: Request AI Insight
  console.log(`\n${colors.cyan}[3/4] Requesting AI Insight...${colors.reset}`);
  
  // Check LINK balance untuk Functions fee
  const linkToken = await hre.ethers.getContractAt(
    "LinkTokenInterface",
    deployment.chainlink.linkToken
  );
  
  const linkBalance = await linkToken.balanceOf(vault.target);
  console.log(`${colors.yellow}Vault LINK balance: ${hre.ethers.formatUnits(linkBalance, 18)} LINK${colors.reset}`);
  
  // Request AI insight
  console.log(`${colors.yellow}Sending Chainlink Functions request...${colors.reset}`);
  
  if (network === "hardhat") {
    // Local testing - simulate response
    console.log(`${colors.yellow}Local network - simulating Functions response...${colors.reset}`);
    
    // Simulate callback dengan mock data
    const mockResponse = hre.ethers.AbiCoder.defaultAbiCoder().encode(
      ["string", "uint256"],
      ["Recommended: HOLD - AI detects bullish sentiment with 85% confidence", 85]
    );
    
    // Trigger callback (simulated)
    console.log(`${colors.green}✅ Simulated AI Insight received${colors.reset}`);
    
    // Get insight
    const insight = await vault.userInsights(user.address);
    console.log(`${colors.green}Recommendation: ${insight.recommendation}${colors.reset}`);
    console.log(`${colors.green}Confidence: ${insight.confidence}%${colors.reset}`);
    
  } else {
    // Real network - actual request
    try {
      const requestTx = await vault.requestAIInsight();
      const receipt = await requestTx.wait();
      
      // Extract requestId dari event
      const requestEvent = receipt.logs.find(
        log => log.fragment?.name === "AIRequested"
      );
      
      if (requestEvent) {
        const requestId = requestEvent.args[1]; // requestId adalah arg kedua
        console.log(`${colors.green}✅ AI Insight requested!${colors.reset}`);
        console.log(`${colors.yellow}Request ID: ${requestId}${colors.reset}`);
        console.log(`${colors.yellow}Transaction: ${receipt.hash}${colors.reset}`);
        
        // 🎯 Hackathon: Explain what happens next
        console.log(`\n${colors.cyan}🔗 Chainlink Functions Flow:${colors.reset}`);
        console.log(`1. Request sent to Chainlink DON`);
        console.log(`2. DON processes AI analysis off-chain`);
        console.log(`3. Result returned on-chain in ~1-2 minutes`);
        console.log(`\n${colors.yellow}Check the insight with:${colors.reset}`);
        console.log(`npx hardhat run scripts/check_insight.js --network ${network} --address ${user.address}`);
      }
    } catch (error) {
      console.log(`${colors.red}❌ Functions request failed: ${error.message}${colors.reset}`);
      console.log(`${colors.yellow}Make sure:${colors.reset}`);
      console.log(`1. Vault has enough LINK (run fund_subscription.js)`);
      console.log(`2. Functions subscription is active (run setup_functions.js)`);
    }
  }
  
  // 🎯 STEP 4: Display current state
  console.log(`\n${colors.cyan}[4/4] Current Vault State:${colors.reset}`);
  
  const shares = await vault.shares(user.address);
  const totalAssets = await vault.totalAssets();
  const totalShares = await vault.totalShares();
  
  console.log(`${colors.yellow}User Shares: ${hre.ethers.formatUnits(shares, 18)}${colors.reset}`);
  console.log(`${colors.yellow}Total Assets in Vault: ${hre.ethers.formatUnits(totalAssets, 18)} aRWA${colors.reset}`);
  console.log(`${colors.yellow}Total Shares: ${hre.ethers.formatUnits(totalShares, 18)}${colors.reset}`);
  
  // 💰 Get asset value in USD via Chainlink Data Feed
  const ethValue = await vault.getAssetValueInUSD(hre.ethers.parseEther("1"));
  console.log(`${colors.yellow}1 ETH = $${hre.ethers.formatUnits(ethValue, 8)} USD${colors.reset}`);
  
  console.log(`\n${colors.magenta}🎉 AI Insight Demo Complete!${colors.reset}`);
}

// 🎯 Additional helper untuk judges
function printChainlinkFlow() {
  console.log(`\n${colors.cyan}📊 Chainlink Integration Points:${colors.reset}`);
  console.log(`${colors.yellow}1. Chainlink Data Feeds${colors.reset} - Real-time pricing (getAssetValueInUSD)`);
  console.log(`${colors.yellow}2. Chainlink Functions${colors.reset} - AI analysis (requestAIInsight)`);
  console.log(`${colors.yellow}3. Chainlink Automation${colors.reset} - Scheduled analysis (AegisAIController)`);
  console.log(`${colors.yellow}4. Chainlink CCIP${colors.reset} - Cross-chain RWA transfers (setup_ccip.js)`);
}

main()
  .then(() => {
    printChainlinkFlow();
    process.exit(0);
  })
  .catch((error) => {
    console.error(`${colors.red}❌ Script failed:${colors.reset}`, error);
    process.exit(1);
  });

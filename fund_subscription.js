/**
 * @file fund_subscription.js
 * @description Fund Chainlink subscription with LINK tokens
 * @dev Essential for hackathon demo - shows real token flow
 */

const hre = require("hardhat");
const { ethers } = hre;
const fs = require("fs");
const path = require("path");

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m"
};

async function main() {
  console.log(`${colors.cyan}💰 Funding Chainlink Subscription${colors.reset}`);
  
  const [deployer] = await ethers.getSigners();
  const network = hre.network.name;
  
  console.log(`${colors.yellow}Network: ${network}${colors.reset}`);
  console.log(`${colors.yellow}Deployer: ${deployer.address}${colors.reset}`);
  
  // 📝 Load deployment info
  const deploymentFile = path.join(__dirname, "..", "artifacts", `deployment-${network}.json`);
  if (!fs.existsSync(deploymentFile)) {
    console.log(`${colors.red}❌ No deployment found. Run deploy_vault.js first.${colors.reset}`);
    process.exit(1);
  }
  
  const deployment = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  
  // 📝 STEP 1: Check LINK balance
  console.log(`\n${colors.cyan}[1/3] Checking LINK Balance...${colors.reset}`);
  
  const linkTokenAddress = deployment.chainlink.linkToken;
  const linkToken = await ethers.getContractAt(
    "LinkTokenInterface",
    linkTokenAddress,
    deployer
  );
  
  const linkBalance = await linkToken.balanceOf(deployer.address);
  console.log(`${colors.yellow}Your LINK Balance: ${ethers.formatUnits(linkBalance, 18)} LINK${colors.reset}`);
  
  // 📝 STEP 2: Fund Vault dengan LINK
  console.log(`\n${colors.cyan}[2/3] Funding AegisVault with LINK...${colors.reset}`);
  
  const vaultAddress = deployment.contracts.AegisVault;
  const amountToFund = ethers.parseUnits("1", 18); // 1 LINK
  
  if (linkBalance < amountToFund) {
    console.log(`${colors.red}❌ Insufficient LINK balance${colors.reset}`);
    console.log(`${colors.yellow}Get testnet LINK from:${colors.reset}`);
    console.log(`Sepolia: https://faucets.chain.link/sepolia`);
    console.log(`Mumbai: https://faucets.chain.link/mumbai`);
    console.log(`\n${colors.yellow}Then run this script again.${colors.reset}`);
    process.exit(1);
  }
  
  // Transfer LINK ke vault
  console.log(`${colors.yellow}Transferring 1 LINK to vault...${colors.reset}`);
  
  const transferTx = await linkToken.transfer(vaultAddress, amountToFund);
  await transferTx.wait();
  
  console.log(`${colors.green}✅ Transferred 1 LINK to vault${colors.reset}`);
  console.log(`${colors.yellow}Transaction: ${transferTx.hash}${colors.reset}`);
  
  // 📝 STEP 3: Verify funding
  console.log(`\n${colors.cyan}[3/3] Verifying Funding...${colors.reset}`);
  
  const vaultLinkBalance = await linkToken.balanceOf(vaultAddress);
  console.log(`${colors.yellow}Vault LINK Balance: ${ethers.formatUnits(vaultLinkBalance, 18)} LINK${colors.reset}`);
  
  // 🎯 Calculate how many AI requests bisa dibuat
  const functionsFee = deployment.chainlink.fee;
  const possibleRequests = vaultLinkBalance / functionsFee;
  
  console.log(`\n${colors.green}📊 Funding Summary:${colors.reset}`);
  console.log(`${colors.yellow}Vault Address: ${vaultAddress}${colors.reset}`);
  console.log(`${colors.yellow}LINK Balance: ${ethers.formatUnits(vaultLinkBalance, 18)} LINK${colors.reset}`);
  console.log(`${colors.yellow}Fee per AI Request: ${ethers.formatUnits(functionsFee, 18)} LINK${colors.reset}`);
  console.log(`${colors.yellow}Possible AI Requests: ~${Math.floor(Number(possibleRequests))}${colors.reset}`);
  
  // 💾 Save funding info
  const fundingInfo = {
    network: network,
    timestamp: new Date().toISOString(),
    fundedBy: deployer.address,
    vault: vaultAddress,
    amount: ethers.formatUnits(amountToFund, 18),
    transaction: transferTx.hash,
    vaultBalance: ethers.formatUnits(vaultLinkBalance, 18),
    feePerRequest: ethers.formatUnits(functionsFee, 18)
  };
  
  const fundingFile = path.join(__dirname, "..", "artifacts", `funding-${network}.json`);
  fs.writeFileSync(fundingFile, JSON.stringify(fundingInfo, null, 2));
  
  console.log(`\n${colors.green}✅ Funding complete!${colors.reset}`);
  console.log(`${colors.cyan}🎯 Now you can:${colors.reset}`);
  console.log(`1. Run: npx hardhat run scripts/request_ai_insight.js --network ${network}`);
  console.log(`2. Test AI insights with real Chainlink Functions`);
  console.log(`\n${colors.yellow}Note: Each AI request costs ${ethers.formatUnits(functionsFee, 18)} LINK${colors.reset}`);
}

// 🎯 Tambahan: Link faucet helper
async function checkFaucetLinks() {
  const faucets = {
    sepolia: "https://faucets.chain.link/sepolia",
    polygonMumbai: "https://faucets.chain.link/mumbai",
    avalancheFuji: "https://faucets.chain.link/fuji"
  };
  
  return faucets[hre.network.name];
}

main()
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error(`${colors.red}❌ Funding failed:${colors.reset}`, error.message);
    
    // Suggest faucet jika error karena balance
    if (error.message.includes("insufficient balance") || error.message.includes("balance")) {
      const faucetLink = await checkFaucetLinks();
      if (faucetLink) {
        console.log(`\n${colors.yellow}💡 Try getting testnet LINK from: ${faucetLink}${colors.reset}`);
      }
    }
    
    process.exit(1);
  });

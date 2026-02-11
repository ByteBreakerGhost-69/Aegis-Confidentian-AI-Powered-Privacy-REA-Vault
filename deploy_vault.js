/**
 * @file deploy_vault.js
 * @description Main deployment script untuk Aegis Vault
 * @dev Hackathon-optimized dengan step-by-step logging
 */

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// 🎯 Hackathon: Warna untuk better logging
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m"
};

async function main() {
  console.log(`${colors.cyan}🚀 Starting Aegis Vault Deployment${colors.reset}`);
  console.log(`${colors.yellow}Network: ${hre.network.name}${colors.reset}`);
  
  // 📊 Log network info untuk judges
  const [deployer] = await hre.ethers.getSigners();
  console.log(`${colors.yellow}Deployer: ${deployer.address}${colors.reset}`);
  console.log(`${colors.yellow}Balance: ${hre.ethers.formatEther(await deployer.provider.getBalance(deployer.address))} ETH${colors.reset}`);

  // 📝 STEP 1: Deploy RWAToken
  console.log(`\n${colors.cyan}[1/4] Deploying RWAToken...${colors.reset}`);
  const RWAToken = await hre.ethers.getContractFactory("RWAToken");
  const rwaToken = await RWAToken.deploy(
    "Aegis RWA Token",      // name
    "aRWA",                 // symbol
    hre.ethers.parseEther("1000000"), // maxSupply: 1M tokens
    deployer.address        // admin
  );
  
  await rwaToken.waitForDeployment();
  const rwaTokenAddress = await rwaToken.getAddress();
  console.log(`${colors.green}✅ RWAToken deployed to: ${rwaTokenAddress}${colors.reset}`);

  // 📝 STEP 2: Setup Chainlink Addresses (network-specific)
  console.log(`\n${colors.cyan}[2/4] Setting up Chainlink addresses...${colors.reset}`);
  
  const chainlinkConfig = getChainlinkConfig(hre.network.name);
  console.log(`${colors.yellow}Using Chainlink config for: ${hre.network.name}${colors.reset}`);
  
  // 📝 STEP 3: Deploy AegisVault
  console.log(`\n${colors.cyan}[3/4] Deploying AegisVault...${colors.reset}`);
  const AegisVault = await hre.ethers.getContractFactory("AegisVault");
  const aegisVault = await AegisVault.deploy(
    chainlinkConfig.priceFeed,     // ETH/USD Price Feed
    chainlinkConfig.linkToken,     // LINK token address
    chainlinkConfig.oracle,        // Functions oracle
    chainlinkConfig.jobId,         // Job ID untuk AI analysis
    chainlinkConfig.fee            // Fee in LINK
  );
  
  await aegisVault.waitForDeployment();
  const aegisVaultAddress = await aegisVault.getAddress();
  console.log(`${colors.green}✅ AegisVault deployed to: ${aegisVaultAddress}${colors.reset}`);

  // 📝 STEP 4: Deploy AegisAIController
  console.log(`\n${colors.cyan}[4/4] Deploying AegisAIController...${colors.reset}`);
  const AegisAIController = await hre.ethers.getContractFactory("AegisAIController");
  const aiController = await AegisAIController.deploy(aegisVaultAddress);
  
  await aiController.waitForDeployment();
  const aiControllerAddress = await aiController.getAddress();
  console.log(`${colors.green}✅ AegisAIController deployed to: ${aiControllerAddress}${colors.reset}`);

  // 💾 Save deployment info untuk frontend & testing
  console.log(`\n${colors.cyan}💾 Saving deployment artifacts...${colors.reset}`);
  saveDeploymentInfo({
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    contracts: {
      RWAToken: rwaTokenAddress,
      AegisVault: aegisVaultAddress,
      AegisAIController: aiControllerAddress
    },
    chainlink: chainlinkConfig
  });

  // 🎯 Hackathon: Verify contracts (optional tapi impressive)
  if (hre.network.name !== "hardhat") {
    console.log(`\n${colors.cyan}🔍 Verifying contracts on Etherscan...${colors.reset}`);
    await verifyContract(rwaTokenAddress, [
      "Aegis RWA Token",
      "aRWA",
      hre.ethers.parseEther("1000000"),
      deployer.address
    ]);
    
    await verifyContract(aegisVaultAddress, [
      chainlinkConfig.priceFeed,
      chainlinkConfig.linkToken,
      chainlinkConfig.oracle,
      chainlinkConfig.jobId,
      chainlinkConfig.fee
    ]);
    
    await verifyContract(aiControllerAddress, [aegisVaultAddress]);
  }

  console.log(`\n${colors.green}🎉 Deployment Complete!${colors.reset}`);
  console.log(`${colors.cyan}================================${colors.reset}`);
  console.log(`${colors.yellow}Contract Addresses:${colors.reset}`);
  console.log(`RWAToken: ${rwaTokenAddress}`);
  console.log(`AegisVault: ${aegisVaultAddress}`);
  console.log(`AegisAIController: ${aiControllerAddress}`);
  console.log(`${colors.cyan}================================${colors.reset}`);
  
  // 📋 Next steps untuk judges
  console.log(`\n${colors.cyan}📋 Next Steps:${colors.reset}`);
  console.log(`1. Run: npx hardhat run scripts/fund_subscription.js --network ${hre.network.name}`);
  console.log(`2. Run: npx hardhat run scripts/setup_functions.js --network ${hre.network.name}`);
  console.log(`3. Test: npx hardhat test test/AegisVault.test.js`);
}

// 🎯 Network-specific Chainlink configurations
function getChainlinkConfig(networkName) {
  const configs = {
    sepolia: {
      priceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306", // ETH/USD
      linkToken: "0x779877A7B0D9E8603169DdbD7836e478b4624789",
      oracle: "0x6090149792dAAeE9D1D568c9f9a6F6B46AA29eFD", // Functions oracle
      jobId: "0x3666376662346164636563373438643561613634636530633830613065313233", // Encrypted jobId
      fee: hre.ethers.parseUnits("0.1", 18) // 0.1 LINK
    },
    polygonMumbai: {
      priceFeed: "0x0715A7794a1dc8e42615F059dD6e406A6594651A", // MATIC/USD
      linkToken: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
      oracle: "0xeA6721aC65BCeD841B8ec3fc5fEdeA6141a0aDE4",
      jobId: "0x7d80a6386ef543a3abb52817f6707e3b",
      fee: hre.ethers.parseUnits("0.1", 18)
    },
    // 🎯 Default untuk local testing
    hardhat: {
      priceFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419", // Mainnet ETH/USD mock
      linkToken: "0x514910771AF9Ca656af840dff83E8264EcF986CA", // Mainnet LINK mock
      oracle: "0x0000000000000000000000000000000000000000",
      jobId: "0x" + "00".repeat(32),
      fee: hre.ethers.parseUnits("0.1", 18)
    }
  };
  
  return configs[networkName] || configs.sepolia;
}

// 💾 Save deployment info ke file
function saveDeploymentInfo(info) {
  const artifactsDir = path.join(__dirname, "..", "artifacts");
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }
  
  const filePath = path.join(artifactsDir, `deployment-${info.network}.json`);
  fs.writeFileSync(filePath, JSON.stringify(info, null, 2));
  console.log(`${colors.green}✅ Deployment info saved to: ${filePath}${colors.reset}`);
}

// 🔍 Contract verification helper
async function verifyContract(address, args) {
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: args,
    });
    console.log(`${colors.green}✅ Verified: ${address}${colors.reset}`);
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log(`${colors.yellow}⚠️ Already verified: ${address}${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ Verification failed: ${error.message}${colors.reset}`);
    }
  }
}

// 🎯 Error handling untuk hackathon demo
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(`${colors.red}❌ Deployment failed:${colors.reset}`, error);
    process.exit(1);
  });

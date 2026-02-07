const hre = require("hardhat");

async function main() {
  console.log("--- Memulai Deployment Aegis Confidential ---");

  // 1. Deploy Token Aset Dasar (Misal: Mock USDC)
  const MockUSDC = await hre.ethers.getContractFactory("MockERC20"); // Buat kontrak sederhana untuk testing
  const usdc = await MockUSDC.deploy("Mock USDC", "mUSDC");
  await usdc.waitForDeployment();
  console.log("Mock USDC deployed to:", await usdc.getAddress());

  // 2. Deploy AegisVault
  const AegisVault = await hre.ethers.getContractFactory("AegisVault");
  const vault = await AegisVault.deploy(
    await usdc.getAddress(),
    "Aegis Vault Share",
    "aeUSDC"
  );
  await vault.waitForDeployment();
  console.log("AegisVault deployed to:", await vault.getAddress());

  // 3. Deploy AegisAIController
  const routerAddress = "0x..."; // Alamat Router Chainlink Functions (sesuai network)
  const AegisAIController = await hre.ethers.getContractFactory("AegisAIController");
  const controller = await AegisAIController.deploy(
    await vault.getAddress(),
    routerAddress
  );
  await controller.waitForDeployment();
  console.log("AegisAIController deployed to:", await controller.getAddress());

  // 4. Hubungkan Vault dengan Controller (Izin Akses)
  await vault.setAIController(await controller.getAddress());
  console.log("AegisVault sekarang dikendalikan oleh AegisAIController.");

  console.log("--- Deployment Selesai! ---");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
              

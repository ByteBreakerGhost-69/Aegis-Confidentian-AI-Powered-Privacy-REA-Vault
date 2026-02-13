// scripts/fund_subscription.js
const hre = require("hardhat");

// KONFIGURASI - GAMPANG DIEDIT!
const AMOUNT_TO_FUND = "5"; // 5 LINK (cukup untuk 100+ request demo)
const SUBSCRIPTION_ID = 1234; // 🔴 GANTI DENGAN SUBSCRIPTION ID KAMU!

async function main() {
    console.log("💰 Mulai funding Chainlink Functions subscription...");
    console.log("==============================================");
    
    // ========== 1. AMBIL KONFIGURASI ==========
    const network = hre.network.name;
    console.log(`📡 Network: ${network}`);
    
    // Address penting (ganti sesuai network)
    const config = {
        sepolia: {
            linkToken: "0x779877A7B0D9E8603169DdbD7836e478b4624789", // LINK on Sepolia
            functionsRouter: "0xb83E47C2bC239B3bf370bc41e1459A34b41238D0" // Functions Router Sepolia
        },
        mumbai: {
            linkToken: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB", // LINK on Mumbai
            functionsRouter: "0x6E2dc0F9DB014aE19888F539E59285D2Ea04244C" // Functions Router Mumbai
        }
    };
    
    const currentConfig = config[network];
    if (!currentConfig) {
        console.error(`❌ Network ${network} tidak didukung!`);
        console.log("   Pakai: sepolia atau mumbai");
        return;
    }
    
    // ========== 2. KONEK KE CONTRACT ==========
    console.log("\n1️⃣ Menghubungkan ke contract...");
    
    const linkToken = await hre.ethers.getContractAt(
        "IERC20",
        currentConfig.linkToken
    );
    
    const functionsRouter = await hre.ethers.getContractAt(
        "FunctionsRouter",
        currentConfig.functionsRouter
    );
    
    console.log(`   ✅ LINK Token: ${currentConfig.linkToken}`);
    console.log(`   ✅ Functions Router: ${currentConfig.functionsRouter}`);
    
    // ========== 3. CEK SALDO SUBSCRIPTION ==========
    console.log("\n2️⃣ Cek saldo subscription...");
    
    let subInfo;
    try {
        subInfo = await functionsRouter.getSubscription(SUBSCRIPTION_ID);
        console.log(`   📋 Subscription ID: ${SUBSCRIPTION_ID}`);
        console.log(`   💰 Saldo saat ini: ${hre.ethers.formatEther(subInfo.balance)} LINK`);
        console.log(`   👤 Owner: ${subInfo.owner}`);
    } catch (error) {
        console.error(`❌ Subscription ${SUBSCRIPTION_ID} tidak ditemukan!`);
        console.log("   Jalankan dulu: npx hardhat run scripts/setup_functions.js");
        return;
    }
    
    // ========== 4. KONFIRMASI KE USER ==========
    console.log("\n3️⃣ Persiapan funding...");
    console.log(`   💎 Amount: ${AMOUNT_TO_FUND} LINK`);
    console.log(`   💰 Saldo sekarang: ${hre.ethers.formatEther(subInfo.balance)} LINK`);
    console.log(`   💰 Saldo nanti: ${hre.ethers.formatEther(subInfo.balance + hre.ethers.parseEther(AMOUNT_TO_FUND))} LINK`);
    
    console.log("\n🟡 Tekan CTRL+C untuk batal, atau");
    console.log("   Tunggu 5 detik untuk melanjutkan...");
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // ========== 5. APPROVE LINK TOKEN ==========
    console.log("\n4️⃣ Approve LINK token...");
    
    const amountWei = hre.ethers.parseEther(AMOUNT_TO_FUND);
    
    const approveTx = await linkToken.approve(
        currentConfig.functionsRouter,
        amountWei
    );
    await approveTx.wait();
    
    console.log(`   ✅ Approve sukses! Tx: ${approveTx.hash}`);
    
    // ========== 6. FUND SUBSCRIPTION ==========
    console.log("\n5️⃣ Funding subscription...");
    
    // GANTI DENGAN:
    const fundTx = await linkToken.transferAndCall(
        functionsRouter.address,
        amountWei,
        hre.ethers.defaultAbiCoder.encode(["uint64"], [SUBSCRIPTION_ID])
    );
    
    await fundTx.wait();
    
    // ========== 7. CEK SALDO BARU ==========
    console.log("\n6️⃣ Verifikasi saldo baru...");
    
    subInfo = await functionsRouter.getSubscription(SUBSCRIPTION_ID);
    
    console.log("\n🎉 FUNDING BERHASIL!");
    console.log("==============================================");
    console.log(`📋 Subscription ID: ${SUBSCRIPTION_ID}`);
    console.log(`💰 Saldo baru: ${hre.ethers.formatEther(subInfo.balance)} LINK`);
    console.log(`📊 Total terfund: ${AMOUNT_TO_FUND} LINK`);
    console.log(`🔗 Tx Hash: ${fundTx.hash}`);
    console.log("==============================================");
    
    console.log("\n✅ Siap request AI ke OpenAI!");
    console.log("   Jalankan: npx hardhat run scripts/request_ai_insight.js");
}

main().catch((error) => {
    console.error("\n❌ ERROR:");
    console.error(error);
    process.exitCode = 1;
});

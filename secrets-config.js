const fs = require("fs");
const path = require("path");

// Konfigurasi untuk enkripsi data rahasia (Secrets)
const secretsConfig = {
  // 1. Masukkan API Key asli di sini (Jangan di-commit ke GitHub!)
  // Untuk hackathon, kita ambil dari environment variable (.env)
  apiKey: process.env.MARKET_DATA_API_KEY,
  
  // 2. Tentukan node mana yang diizinkan melihat data ini (DON ID)
  // Contoh: 'fun-arbitrum-sepolia-1'
  donId: "fun-arbitrum-sepolia-1",
  
  // 3. Slot ID (Chainlink menyediakan slot untuk menyimpan secrets secara on-chain)
  slotId: 0,
  
  // 4. Waktu kadaluarsa secrets (misal: 1 jam)
  expiration: Math.floor(Date.now() / 1000) + 3600,
};

module.exports = secretsConfig;

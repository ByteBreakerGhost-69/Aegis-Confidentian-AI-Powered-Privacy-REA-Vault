/**
 * @file encryption-utils.js
 * @description Encryption utilities untuk privacy vault
 * @dev Zero-knowledge inspired encryption for sensitive data
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Secrets Manager untuk handle encryption
 */
class SecretsManager {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.encoding = 'base64';
  }
  
  /**
   * Encrypt sensitive data
   */
  async encrypt(text, publicKey) {
    try {
      // Generate random key untuk symmetric encryption
      const key = crypto.randomBytes(32);
      const iv = crypto.randomBytes(16);
      
      // Encrypt dengan AES-GCM
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      let encrypted = cipher.update(text, 'utf8', this.encoding);
      encrypted += cipher.final(this.encoding);
      
      const authTag = cipher.getAuthTag();
      
      // Encrypt the key dengan RSA public key
      const encryptedKey = crypto.publicEncrypt(
        {
          key: publicKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256'
        },
        key
      );
      
      return {
        encrypted,
        iv: iv.toString(this.encoding),
        encryptedKey: encryptedKey.toString(this.encoding),
        authTag: authTag.toString(this.encoding),
        algorithm: this.algorithm,
        timestamp: Date.now()
      };
      
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }
  
  /**
   * Decrypt data (would be done off-chain dengan private key)
   */
  async decrypt(encryptedData, privateKey) {
    try {
      // Decrypt the symmetric key
      const key = crypto.privateDecrypt(
        {
          key: privateKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256'
        },
        Buffer.from(encryptedData.encryptedKey, this.encoding)
      );
      
      // Decrypt the data
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        key,
        Buffer.from(encryptedData.iv, this.encoding)
      );
      
      decipher.setAuthTag(Buffer.from(encryptedData.authTag, this.encoding));
      
      let decrypted = decipher.update(encryptedData.encrypted, this.encoding, 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
      
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }
  
  /**
   * Hash data (one-way untuk privacy)
   */
  hashData(data, salt = '') {
    const hash = crypto.createHash('sha256');
    hash.update(data + salt);
    return hash.digest('hex');
  }
  
  /**
   * Create zero-knowledge proof (simplified untuk demo)
   */
  createZKProof(statement, witness) {
    // 🎯 Simplified ZK proof untuk hackathon demo
    // In production, use libraries like snarkjs or circom
    
    return {
      statement: this.hashData(statement),
      commitment: this.hashData(witness + Date.now().toString()),
      timestamp: Date.now(),
      proofType: 'simulated-zk-snark'
    };
  }
  
  /**
   * Verify ZK proof
   */
  verifyZKProof(proof, publicStatement) {
    // Simplified verification
    const expectedHash = this.hashData(publicStatement);
    return proof.statement === expectedHash;
  }
}

/**
 * Create simulated Chainlink request untuk testing
 */
function simulateChainlinkRequest(userData) {
  return {
    data: Buffer.from(JSON.stringify(userData)),
    args: ['recommendation,confidence,riskLevel'],
    secrets: {},
    donHostedSecretsVersion: 0
  };
}

/**
 * Generate mock market analysis untuk demo
 */
function createGptMarketAnalysis() {
  const recommendations = [
    "BUY - AI detects undervalued conditions with strong fundamentals",
    "HOLD - Market conditions stable, maintain current position",
    "SELL - Technical indicators show overbought conditions",
    "HOLD - AI recommends patience during volatile period",
    "BUY - Positive momentum detected, good entry point"
  ];
  
  const riskLevels = ['LOW', 'MEDIUM', 'HIGH'];
  
  return {
    action: Math.random() > 0.5 ? 'BUY' : 'HOLD',
    confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
    reasoning: recommendations[Math.floor(Math.random() * recommendations.length)],
    risk: riskLevels[Math.floor(Math.random() * riskLevels.length)],
    isAIGenerated: Math.random() > 0.3 // 70% chance AI-generated
  };
}

/**
 * Calculate risk score berdasarkan multiple factors
 */
function calculateRiskScore(factors) {
  const weights = {
    volatility: 0.3,
    liquidity: 0.2,
    correlation: 0.2,
    marketCap: 0.15,
    age: 0.15
  };
  
  let score = 0;
  for (const [factor, weight] of Object.entries(weights)) {
    score += (factors[factor] || 0.5) * weight;
  }
  
  // Normalize to 0-100
  return Math.min(100, Math.max(0, score * 100));
}

/**
 * Format data untuk on-chain storage
 */
function formatForBlockchain(data, maxSize = 1024) {
  const formatted = {
    // Truncate strings jika terlalu panjang
    recommendation: data.recommendation.substring(0, 200),
    confidence: Math.round(data.confidence),
    riskLevel: data.riskLevel,
    timestamp: Math.floor(Date.now() / 1000) // Unix timestamp
  };
  
  const jsonString = JSON.stringify(formatted);
  
  if (Buffer.from(jsonString).length > maxSize) {
    // Compress jika terlalu besar
    formatted.recommendation = formatted.recommendation.substring(0, 100);
  }
  
  return formatted;
}

// Export utilities
module.exports = {
  SecretsManager,
  simulateChainlinkRequest,
  createGptMarketAnalysis,
  calculateRiskScore,
  formatForBlockchain
};

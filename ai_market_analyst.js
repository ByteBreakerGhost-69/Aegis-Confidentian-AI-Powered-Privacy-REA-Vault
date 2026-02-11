/**
 * @file ai_market_analyst.js
 * @description Chainlink Functions - AI Market Analyst
 * @dev Executed off-chain by Chainlink DON, returns on-chain
 * @notice NEVER store secrets in this file directly!
 */

const { SecretsManager, createGptMarketAnalysis } = require('./encryption-utils');
const secrets = require('./secrets-config');

/**
 * @notice Entry point for Chainlink Functions
 * @param {Buffer} request.data - User data from on-chain request
 * @param {Array<string>} request.args - Additional parameters
 * @returns {Promise<Buffer>} Encoded AI analysis result
 */
async function analyzeMarketData(request) {
  console.log('🤖 Aegis AI Market Analyst - Processing Request');
  
  try {
    // 🎯 STEP 1: Decode and validate request data
    const userData = await decodeRequestData(request);
    console.log('📊 User Data:', JSON.stringify(userData, null, 2));
    
    // 🎯 STEP 2: Fetch market data (privacy-preserving)
    const marketData = await fetchMarketData(userData);
    
    // 🎯 STEP 3: AI Analysis (OpenAI GPT or alternative)
    const aiAnalysis = await performAIAnalysis(userData, marketData);
    
    // 🎯 STEP 4: Generate investment recommendation
    const recommendation = generateRecommendation(aiAnalysis);
    
    // 🎯 STEP 5: Encrypt sensitive data (optional for privacy vault)
    const encryptedResult = await encryptSensitiveData(recommendation, userData);
    
    // 🎯 STEP 6: Return result untuk on-chain storage
    return encodeResultForBlockchain(encryptedResult);
    
  } catch (error) {
    console.error('❌ AI Analysis Error:', error);
    // 🚨 Fallback: Return safe recommendation
    return encodeFallbackResult();
  }
}

// ========== HELPER FUNCTIONS ==========

/**
 * Decode request data dari on-chain
 */
async function decodeRequestData(request) {
  // Data format: {"user":"0x...","balance":"100","timestamp":"1234567890"}
  const dataString = Buffer.from(request.data).toString('utf8');
  
  try {
    const parsedData = JSON.parse(dataString);
    
    // Basic validation
    if (!parsedData.user || !parsedData.balance) {
      throw new Error('Invalid user data format');
    }
    
    return {
      userAddress: parsedData.user,
      tokenBalance: parseFloat(parsedData.balance),
      timestamp: parseInt(parsedData.timestamp) || Date.now(),
      riskProfile: parsedData.riskProfile || 'MODERATE' // LOW, MODERATE, HIGH
    };
    
  } catch (error) {
    console.warn('⚠️ Using default user data due to parse error');
    return {
      userAddress: '0xUNKNOWN',
      tokenBalance: 100,
      timestamp: Date.now(),
      riskProfile: 'MODERATE'
    };
  }
}

/**
 * Fetch market data dari berbagai sources
 */
async function fetchMarketData(userData) {
  console.log('📡 Fetching market data...');
  
  const marketData = {
    timestamp: Date.now(),
    sources: []
  };
  
  try {
    // 📊 Source 1: CoinGecko (crypto prices)
    if (secrets.COINGECKO_API_KEY) {
      const cryptoData = await fetchCryptoPrices();
      marketData.crypto = cryptoData;
      marketData.sources.push('CoinGecko');
    }
    
    // 📊 Source 2: Traditional market data (simulated)
    const traditionalData = await fetchTraditionalMarkets();
    marketData.traditional = traditionalData;
    marketData.sources.push('MarketSim');
    
    // 📊 Source 3: On-chain data (via RPC)
    const chainData = await fetchOnChainData(userData.userAddress);
    marketData.onChain = chainData;
    marketData.sources.push('Blockchain');
    
    // 📊 Source 4: Fear & Greed Index
    marketData.sentiment = await fetchMarketSentiment();
    
    console.log(`✅ Fetched data from ${marketData.sources.length} sources`);
    return marketData;
    
  } catch (error) {
    console.warn('⚠️ Some market data sources failed:', error.message);
    // Return minimal data untuk continue analysis
    return {
      ...marketData,
      crypto: { bitcoin: { price: 42000, change_24h: 2.5 } },
      traditional: { sp500: 4700, vix: 15 },
      onChain: { gasPrice: '30 gwei', activeAddresses: 500000 },
      sentiment: { fearGreedIndex: 60, label: 'Greed' }
    };
  }
}

/**
 * Perform AI analysis menggunakan GPT atau model lain
 */
async function performAIAnalysis(userData, marketData) {
  console.log('🧠 Performing AI analysis...');
  
  // 🎯 Option 1: OpenAI GPT (jika ada API key)
  if (secrets.OPENAI_API_KEY && secrets.OPENAI_API_KEY !== 'your_openai_key_here') {
    try {
      return await analyzeWithOpenAI(userData, marketData);
    } catch (error) {
      console.warn('⚠️ OpenAI analysis failed, falling back to rule-based');
    }
  }
  
  // 🎯 Option 2: Rule-based analysis (fallback untuk hackathon demo)
  return performRuleBasedAnalysis(userData, marketData);
}

/**
 * Analyze dengan OpenAI GPT
 */
async function analyzeWithOpenAI(userData, marketData) {
  const { Configuration, OpenAIApi } = require('openai');
  
  const configuration = new Configuration({
    apiKey: secrets.OPENAI_API_KEY,
  });
  
  const openai = new OpenAIApi(configuration);
  
  // Prompt engineering untuk investment analysis
  const prompt = `
    As an AI investment analyst for a privacy-focused RWA vault, analyze this data:
    
    USER PROFILE:
    - Address: ${userData.userAddress}
    - Token Balance: ${userData.tokenBalance} aRWA
    - Risk Profile: ${userData.riskProfile}
    
    MARKET DATA:
    - Bitcoin Price: $${marketData.crypto?.bitcoin?.price || 'N/A'}
    - 24h Change: ${marketData.crypto?.bitcoin?.change_24h || 'N/A'}%
    - S&P 500: ${marketData.traditional?.sp500 || 'N/A'}
    - Fear & Greed Index: ${marketData.sentiment?.fearGreedIndex || 'N/A'} (${marketData.sentiment?.label || 'N/A'})
    - Gas Price: ${marketData.onChain?.gasPrice || 'N/A'}
    
    Provide a concise investment recommendation with:
    1. Action (HOLD/BUY/SELL)
    2. Confidence score (0-100)
    3. Brief reasoning
    4. Risk assessment (LOW/MEDIUM/HIGH)
    
    Format as JSON: {"action": "...", "confidence": 85, "reasoning": "...", "risk": "..."}
  `;
  
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 300
  });
  
  const analysisText = response.data.choices[0].message.content;
  console.log('🤖 GPT Analysis:', analysisText);
  
  // Extract JSON dari response
  try {
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.warn('Failed to parse GPT response as JSON');
  }
  
  // Fallback parsing
  return {
    action: extractAction(analysisText),
    confidence: extractConfidence(analysisText),
    reasoning: analysisText.substring(0, 200),
    risk: extractRiskLevel(analysisText)
  };
}

/**
 * Rule-based analysis fallback
 */
function performRuleBasedAnalysis(userData, marketData) {
  console.log('📊 Using rule-based analysis...');
  
  const bitcoinPrice = marketData.crypto?.bitcoin?.price || 40000;
  const sp500 = marketData.traditional?.sp500 || 4500;
  const fearGreed = marketData.sentiment?.fearGreedIndex || 50;
  
  // Simple rule-based logic
  let action, confidence, reasoning, risk;
  
  if (bitcoinPrice > 45000 && fearGreed > 70) {
    action = 'SELL';
    confidence = 75;
    reasoning = 'Market showing extreme greed, Bitcoin at high price levels';
    risk = 'HIGH';
  } else if (bitcoinPrice < 35000 && fearGreed < 30) {
    action = 'BUY';
    confidence = 80;
    reasoning = 'Market fear high, Bitcoin at attractive price levels';
    risk = 'LOW';
  } else {
    action = 'HOLD';
    confidence = 65;
    reasoning = 'Market conditions neutral, maintain current position';
    risk = 'MEDIUM';
  }
  
  // Adjust berdasarkan user risk profile
  if (userData.riskProfile === 'LOW' && risk === 'HIGH') {
    action = 'HOLD';
    confidence = 70;
    reasoning += ' Adjusted for low risk tolerance';
  }
  
  if (userData.riskProfile === 'HIGH' && risk === 'LOW') {
    confidence += 10; // High risk users can be more confident
  }
  
  return { action, confidence, reasoning, risk };
}

/**
 * Generate final recommendation
 */
function generateRecommendation(aiAnalysis) {
  console.log('🎯 Generating recommendation...');
  
  // Map AI analysis ke format yang di-expect on-chain
  const recommendationMap = {
    'BUY': 'BUY - AI recommends accumulating position',
    'SELL': 'SELL - AI recommends reducing exposure',
    'HOLD': 'HOLD - AI recommends maintaining position'
  };
  
  return {
    recommendation: recommendationMap[aiAnalysis.action] || 'HOLD - No clear signal',
    confidence: Math.min(Math.max(aiAnalysis.confidence, 0), 100),
    reasoning: aiAnalysis.reasoning || 'Market analysis completed',
    riskLevel: mapRiskLevel(aiAnalysis.risk),
    timestamp: Date.now(),
    isAIGenerated: !!secrets.OPENAI_API_KEY
  };
}

/**
 * Encrypt sensitive data untuk privacy vault
 */
async function encryptSensitiveData(recommendation, userData) {
  // 🛡️ Privacy feature: Encrypt sensitive parts
  if (secrets.ENCRYPTION_PUBLIC_KEY) {
    try {
      const encryptionManager = new SecretsManager();
      const encryptedBalance = await encryptionManager.encrypt(
        userData.tokenBalance.toString(),
        secrets.ENCRYPTION_PUBLIC_KEY
      );
      
      return {
        ...recommendation,
        encryptedUserData: {
          balance: encryptedBalance,
          addressHash: hashAddress(userData.userAddress)
        }
      };
    } catch (error) {
      console.warn('⚠️ Encryption failed:', error.message);
    }
  }
  
  return recommendation;
}

/**
 * Encode result untuk blockchain
 */
function encodeResultForBlockchain(result) {
  // Format: [recommendation, confidence]
  const encoded = Buffer.from(
    JSON.stringify({
      recommendation: result.recommendation,
      confidence: result.confidence,
      // 🔒 Only include non-sensitive data on-chain
      riskLevel: result.riskLevel,
      timestamp: result.timestamp
    })
  );
  
  console.log('✅ Result encoded for blockchain');
  console.log('📦 Output size:', encoded.length, 'bytes');
  
  return encoded;
}

/**
 * Fallback result jika semua gagal
 */
function encodeFallbackResult() {
  const fallback = {
    recommendation: 'HOLD - AI analysis unavailable, using conservative strategy',
    confidence: 50,
    riskLevel: 'MEDIUM'
  };
  
  return Buffer.from(JSON.stringify(fallback));
}

// ========== UTILITY FUNCTIONS ==========

async function fetchCryptoPrices() {
  // Using CoinGecko API
  const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24h_change=true';
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'x-cg-demo-api-key': secrets.COINGECKO_API_KEY || ''
    }
  });
  
  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status}`);
  }
  
  return await response.json();
}

async function fetchTraditionalMarkets() {
  // Simulated - in production, use Alpha Vantage or similar
  return {
    sp500: 4700 + (Math.random() * 100 - 50), // Simulated
    nasdaq: 16500 + (Math.random() * 200 - 100),
    vix: 15 + (Math.random() * 5 - 2.5)
  };
}

async function fetchOnChainData(address) {
  // Simulated on-chain data
  return {
    gasPrice: `${20 + Math.floor(Math.random() * 20)} gwei`,
    activeAddresses: 500000 + Math.floor(Math.random() * 100000),
    lastBlockTime: '12 seconds'
  };
}

async function fetchMarketSentiment() {
  // Alternative.me Fear & Greed Index
  const url = 'https://api.alternative.me/fng/?limit=1';
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    return {
      fearGreedIndex: parseInt(data.data[0].value),
      label: data.data[0].value_classification
    };
  } catch (error) {
    return {
      fearGreedIndex: 50 + Math.floor(Math.random() * 40 - 20),
      label: 'Neutral'
    };
  }
}

function extractAction(text) {
  if (text.includes('BUY') || text.includes('buy')) return 'BUY';
  if (text.includes('SELL') || text.includes('sell')) return 'SELL';
  return 'HOLD';
}

function extractConfidence(text) {
  const match = text.match(/\b(\d{1,3})\b.*confidence/i);
  return match ? parseInt(match[1]) : 50;
}

function extractRiskLevel(text) {
  if (text.includes('LOW') || text.includes('low')) return 'LOW';
  if (text.includes('HIGH') || text.includes('high')) return 'HIGH';
  return 'MEDIUM';
}

function mapRiskLevel(risk) {
  const map = { 'LOW': 0, 'MEDIUM': 1, 'HIGH': 2 };
  return map[risk] !== undefined ? map[risk] : 1;
}

function hashAddress(address) {
  // Simple hash untuk privacy
  return require('crypto').createHash('sha256').update(address).digest('hex').substring(0, 16);
}

// 🎯 Export untuk Chainlink Functions
module.exports = analyzeMarketData;

/**
 * @file useAIInsights.js
 * @description Custom hook untuk manage AI insights
 * @dev Fetches, stores, dan manages AI insights dari blockchain
 */

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { vaultABI } from '../constants/abis';
import { CONTRACT_ADDRESSES } from '../constants/chainlinkConfig';

// Mock data untuk demo sebelum contract integration
const MOCK_INSIGHTS = [
  {
    recommendation: 'BUY - AI detects undervalued conditions with strong fundamentals',
    confidence: 85,
    riskLevel: 0, // LOW
    timestamp: Math.floor(Date.now() / 1000) - 3600,
    isAIGenerated: true
  },
  {
    recommendation: 'HOLD - Market conditions stable, maintain current position',
    confidence: 72,
    riskLevel: 1, // MEDIUM
    timestamp: Math.floor(Date.now() / 1000) - 7200,
    isAIGenerated: true
  },
  {
    recommendation: 'SELL - Technical indicators show overbought conditions',
    confidence: 68,
    riskLevel: 2, // HIGH
    timestamp: Math.floor(Date.now() / 1000) - 10800,
    isAIGenerated: false
  }
];

export const useAIInsights = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [provider, setProvider] = useState(null);
  const [userAddress, setUserAddress] = useState('');

  // Initialize provider
  useEffect(() => {
    if (window.ethereum) {
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(newProvider);
      
      // Get user address
      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            setUserAddress(accounts[0]);
          }
        });
      
      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        setUserAddress(accounts.length > 0 ? accounts[0] : '');
      });
    }
  }, []);

  // Fetch insights dari blockchain
  const fetchInsights = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!provider || !userAddress) {
        // Use mock data untuk demo
        await new Promise(resolve => setTimeout(resolve, 1000));
        setInsights(MOCK_INSIGHTS);
        setLoading(false);
        return;
      }

      // Get contract instance
      const vaultContract = new ethers.Contract(
        CONTRACT_ADDRESSES.AegisVault,
        vaultABI,
        provider
      );

      // Get user's AI insight dari contract
      const insightData = await vaultContract.userInsights(userAddress);
      
      if (insightData.timestamp > 0) {
        const insight = {
          recommendation: insightData.recommendation,
          confidence: Number(insightData.confidence),
          riskLevel: Number(insightData.riskLevel),
          timestamp: Number(insightData.timestamp),
          isAIGenerated: true
        };
        
        setInsights([insight]);
      } else {
        // No insights found, use mock data
        setInsights(MOCK_INSIGHTS);
      }

    } catch (err) {
      console.error('Error fetching insights:', err);
      setError(`Failed to fetch AI insights: ${err.message}`);
      
      // Fallback to mock data
      setInsights(MOCK_INSIGHTS);
    } finally {
      setLoading(false);
    }
  }, [provider, userAddress]);

  // Add new insight (simulated untuk demo)
  const addInsight = useCallback(async (insightData) => {
    try {
      const newInsight = {
        ...insightData,
        timestamp: Math.floor(Date.now() / 1000),
        isAIGenerated: true
      };

      setInsights(prev => [newInsight, ...prev]);
      
      return { success: true, insight: newInsight };
    } catch (err) {
      console.error('Error adding insight:', err);
      throw err;
    }
  }, []);

  // Clear all insights
  const clearInsights = useCallback(() => {
    setInsights([]);
  }, []);

  // Simulate AI analysis
  const simulateAnalysis = useCallback(async () => {
    setLoading(true);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate random insight
      const actions = ['BUY', 'SELL', 'HOLD'];
      const reasons = [
        'AI detects bullish market sentiment',
        'Technical analysis shows strength',
        'Fundamental analysis positive',
        'Market conditions favorable',
        'Risk-reward ratio attractive'
      ];
      
      const randomInsight = {
        recommendation: `${actions[Math.floor(Math.random() * actions.length)]} - ${reasons[Math.floor(Math.random() * reasons.length)]}`,
        confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
        riskLevel: Math.floor(Math.random() * 3), // 0-2
        timestamp: Math.floor(Date.now() / 1000),
        isAIGenerated: true
      };
      
      await addInsight(randomInsight);
      
      return { 
        success: true, 
        message: 'AI analysis complete', 
        insight: randomInsight 
      };
    } catch (err) {
      setError(`Simulation failed: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addInsight]);

  // Get insight statistics
  const getInsightStats = useCallback(() => {
    if (insights.length === 0) {
      return {
        total: 0,
        averageConfidence: 0,
        buyRecommendations: 0,
        sellRecommendations: 0,
        holdRecommendations: 0,
        lastUpdated: null
      };
    }

    const buys = insights.filter(i => i.recommendation.includes('BUY')).length;
    const sells = insights.filter(i => i.recommendation.includes('SELL')).length;
    const holds = insights.filter(i => i.recommendation.includes('HOLD')).length;
    
    const totalConfidence = insights.reduce((sum, i) => sum + i.confidence, 0);
    const averageConfidence = totalConfidence / insights.length;

    const lastUpdated = Math.max(...insights.map(i => i.timestamp));

    return {
      total: insights.length,
      averageConfidence: Math.round(averageConfidence),
      buyRecommendations: buys,
      sellRecommendations: sells,
      holdRecommendations: holds,
      lastUpdated: new Date(lastUpdated * 1000).toLocaleString()
    };
  }, [insights]);

  // Filter insights by criteria
  const filterInsights = useCallback((criteria) => {
    return insights.filter(insight => {
      if (criteria.minConfidence && insight.confidence < criteria.minConfidence) {
        return false;
      }
      if (criteria.maxRisk && insight.riskLevel > criteria.maxRisk) {
        return false;
      }
      if (criteria.action) {
        if (criteria.action === 'buy' && !insight.recommendation.includes('BUY')) {
          return false;
        }
        if (criteria.action === 'sell' && !insight.recommendation.includes('SELL')) {
          return false;
        }
        if (criteria.action === 'hold' && !insight.recommendation.includes('HOLD')) {
          return false;
        }
      }
      if (criteria.timeframe) {
        const hoursAgo = (Date.now() / 1000 - insight.timestamp) / 3600;
        if (criteria.timeframe === 'day' && hoursAgo > 24) return false;
        if (criteria.timeframe === 'week' && hoursAgo > 168) return false;
        if (criteria.timeframe === 'month' && hoursAgo > 720) return false;
      }
      return true;
    });
  }, [insights]);

  // Auto-refresh insights setiap 60 detik
  useEffect(() => {
    if (userAddress) {
      fetchInsights();
      
      const interval = setInterval(() => {
        fetchInsights();
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [userAddress, fetchInsights]);

  return {
    // State
    insights,
    loading,
    error,
    userAddress,

    // Actions
    fetchInsights,
    addInsight,
    clearInsights,
    simulateAnalysis,

    // Stats & filters
    getInsightStats,
    filterInsights,

    // Helpers
    hasInsights: insights.length > 0,
    latestInsight: insights.length > 0 ? insights[0] : null
  };
};

/**
 * @file VaultDashboard.jsx
 * @description Main dashboard untuk Aegis Vault
 * @dev Hackathon-optimized dengan real-time Chainlink data
 */

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAegisVault } from '../hooks/useAegisVault';
import { useChainlinkData } from '../hooks/useChainlinkData';
import AIInsightsPanel from './AIInsightsPanel';
import ChainlinkStatus from './ChainlinkStatus';
import './VaultDashboard.css';

const VaultDashboard = () => {
  const [userAddress, setUserAddress] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Custom hooks untuk blockchain interaction
  const {
    connectWallet,
    disconnectWallet,
    isConnected,
    walletAddress,
    userBalance,
    vaultTVL,
    userShares,
    deposit,
    withdraw,
    requestAIInsight,
    isRequestPending
  } = useAegisVault();

  const {
    ethPrice,
    linkPrice,
    gasPrice,
    functionsStatus,
    ccipStatus
  } = useChainlinkData();

  // Auto-connect wallet jika ada cached connection
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setUserAddress(accounts[0].address);
          connectWallet();
        }
      }
    };
    checkConnection();
  }, []);

  // Handle deposit
  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      alert('Please enter a valid deposit amount');
      return;
    }

    setIsLoading(true);
    try {
      const amount = ethers.parseEther(depositAmount);
      await deposit(amount);
      setDepositAmount('');
      alert('Deposit successful! AI analysis triggered.');
    } catch (error) {
      console.error('Deposit error:', error);
      alert(`Deposit failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle withdraw
  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert('Please enter a valid withdraw amount');
      return;
    }

    setIsLoading(true);
    try {
      const amount = ethers.parseEther(withdrawAmount);
      await withdraw(amount);
      setWithdrawAmount('');
      alert('Withdraw successful!');
    } catch (error) {
      console.error('Withdraw error:', error);
      alert(`Withdraw failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Request AI insight
  const handleRequestAI = async () => {
    if (!isConnected) {
      alert('Please connect wallet first');
      return;
    }

    if (isRequestPending) {
      alert('AI request already pending. Please wait...');
      return;
    }

    try {
      await requestAIInsight();
      alert('AI Insight requested! Check back in 1-2 minutes.');
    } catch (error) {
      console.error('AI request error:', error);
      alert(`AI request failed: ${error.message}`);
    }
  };

  // Format ether values
  const formatEther = (value) => {
    if (!value) return '0.00';
    return parseFloat(ethers.formatEther(value)).toFixed(4);
  };

  return (
    <div className="vault-dashboard">
      {/* 🎯 Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="title">🛡️ Aegis Confidential Vault</h1>
          <p className="subtitle">AI-Powered Privacy RWA Vault powered by Chainlink</p>
        </div>
        
        <div className="header-right">
          {isConnected ? (
            <div className="wallet-info">
              <span className="wallet-address">
                {walletAddress?.substring(0, 6)}...{walletAddress?.substring(38)}
              </span>
              <button 
                className="btn btn-disconnect"
                onClick={disconnectWallet}
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              className="btn btn-connect"
              onClick={connectWallet}
            >
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      {/* 🎯 Navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={`tab ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          🤖 AI Insights
        </button>
        <button 
          className={`tab ${activeTab === 'chainlink' ? 'active' : ''}`}
          onClick={() => setActiveTab('chainlink')}
        >
          🔗 Chainlink Status
        </button>
      </div>

      {/* 🎯 Main Content */}
      <div className="dashboard-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-grid">
            {/* 📈 Left Column - Statistics */}
            <div className="stats-panel">
              <h2 className="panel-title">Vault Statistics</h2>
              
              <div className="stat-cards">
                <div className="stat-card">
                  <div className="stat-label">Total Value Locked</div>
                  <div className="stat-value">${formatEther(vaultTVL)}</div>
                  <div className="stat-subtitle">aRWA Tokens</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-label">Your Balance</div>
                  <div className="stat-value">{formatEther(userBalance)} aRWA</div>
                  <div className="stat-subtitle">≈ ${(parseFloat(formatEther(userBalance)) * 1.2).toFixed(2)}</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-label">Your Shares</div>
                  <div className="stat-value">{formatEther(userShares)}</div>
                  <div className="stat-subtitle">Vault Participation</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-label">APY (Estimated)</div>
                  <div className="stat-value">8.5%</div>
                  <div className="stat-subtitle">AI-Optimized Returns</div>
                </div>
              </div>

              {/* 🔗 Chainlink Quick Status */}
              <div className="chainlink-quick-status">
                <h3 className="section-title">🔗 Chainlink Services</h3>
                <div className="service-status">
                  <span className="status-indicator active"></span>
                  <span>Data Feeds: ${ethPrice} ETH/USD</span>
                </div>
                <div className="service-status">
                  <span className={`status-indicator ${functionsStatus === 'active' ? 'active' : 'inactive'}`}></span>
                  <span>Functions: {functionsStatus}</span>
                </div>
                <div className="service-status">
                  <span className={`status-indicator ${ccipStatus === 'active' ? 'active' : 'inactive'}`}></span>
                  <span>CCIP: {ccipStatus}</span>
                </div>
              </div>
            </div>

            {/* ⚡ Right Column - Actions */}
            <div className="actions-panel">
              <h2 className="panel-title">Vault Actions</h2>
              
              {/* Deposit Section */}
              <div className="action-section">
                <h3 className="action-title">💰 Deposit</h3>
                <div className="input-group">
                  <input
                    type="number"
                    placeholder="Amount in aRWA"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="input-field"
                  />
                  <button 
                    className="btn btn-primary"
                    onClick={handleDeposit}
                    disabled={isLoading || !isConnected}
                  >
                    {isLoading ? 'Processing...' : 'Deposit'}
                  </button>
                </div>
                <p className="action-note">
                  Deposit triggers AI analysis via Chainlink Functions
                </p>
              </div>

              {/* Withdraw Section */}
              <div className="action-section">
                <h3 className="action-title">💸 Withdraw</h3>
                <div className="input-group">
                  <input
                    type="number"
                    placeholder="Amount in aRWA"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="input-field"
                  />
                  <button 
                    className="btn btn-secondary"
                    onClick={handleWithdraw}
                    disabled={isLoading || !isConnected}
                  >
                    {isLoading ? 'Processing...' : 'Withdraw'}
                  </button>
                </div>
                <p className="action-note">
                  Withdrawals processed instantly from vault
                </p>
              </div>

              {/* AI Insights Section */}
              <div className="action-section">
                <h3 className="action-title">🤖 Request AI Insight</h3>
                <div className="ai-action">
                  <button 
                    className="btn btn-ai"
                    onClick={handleRequestAI}
                    disabled={!isConnected || isRequestPending}
                  >
                    {isRequestPending ? (
                      <>
                        <span className="spinner"></span>
                        Processing AI Request...
                      </>
                    ) : (
                      'Get AI Investment Advice'
                    )}
                  </button>
                  
                  <div className="ai-cost">
                    <span className="cost-label">Cost:</span>
                    <span className="cost-value">0.1 LINK</span>
                    <span className="cost-note">via Chainlink Functions</span>
                  </div>
                </div>
                
                <div className="ai-features">
                  <div className="feature">
                    <span className="feature-icon">🔍</span>
                    <span>Market Analysis</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">📊</span>
                    <span>Risk Assessment</span>
                  </div>
                  <div className="feature">
                    <span className="feature-icon">🎯</span>
                    <span>Personalized Advice</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="quick-stats">
                <div className="quick-stat">
                  <div className="quick-stat-label">Gas Price</div>
                  <div className="quick-stat-value">{gasPrice}</div>
                </div>
                <div className="quick-stat">
                  <div className="quick-stat-label">LINK Price</div>
                  <div className="quick-stat-value">${linkPrice}</div>
                </div>
                <div className="quick-stat">
                  <div className="quick-stat-label">Network</div>
                  <div className="quick-stat-value">Sepolia</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <AIInsightsPanel />
        )}

        {activeTab === 'chainlink' && (
          <ChainlinkStatus />
        )}
      </div>

      {/* 🎯 Footer */}
      <footer className="dashboard-footer">
        <div className="footer-left">
          <span className="footer-text">Powered by Chainlink</span>
          <div className="chainlink-badges">
            <span className="badge">Functions</span>
            <span className="badge">Data Feeds</span>
            <span className="badge">Automation</span>
            <span className="badge">CCIP</span>
          </div>
        </div>
        <div className="footer-right">
          <span className="version">v1.0.0 • Hackathon Edition</span>
        </div>
      </footer>
    </div>
  );
};

export default VaultDashboard;

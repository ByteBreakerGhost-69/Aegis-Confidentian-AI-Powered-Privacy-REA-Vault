/**
 * @file useAegisVault.js
 * @description Custom hook untuk Aegis Vault interaction
 * @dev Handles wallet connection, deposits, withdrawals, AI requests
 */

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { vaultABI, rwaTokenABI } from '../constants/abis';
import { CONTRACT_ADDRESSES } from '../constants/chainlinkConfig';

export const useAegisVault = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [userBalance, setUserBalance] = useState('0');
  const [vaultTVL, setVaultTVL] = useState('0');
  const [userShares, setUserShares] = useState('0');
  const [isRequestPending, setIsRequestPending] = useState(false);
  const [error, setError] = useState(null);

  // Initialize provider
  useEffect(() => {
    if (window.ethereum) {
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(newProvider);
    } else {
      setError('Please install MetaMask or another Web3 wallet');
    }
  }, []);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    try {
      if (!window.ethereum) {
        throw new Error('No Ethereum wallet found');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        const newProvider = new ethers.BrowserProvider(window.ethereum);
        const newSigner = await newProvider.getSigner();
        
        setProvider(newProvider);
        setSigner(newSigner);
        setWalletAddress(accounts[0]);
        setIsConnected(true);
        setError(null);

        // Load user data
        await loadUserData(newSigner, accounts[0]);
        
        // Listen for account changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
      }
    } catch (err) {
      setError(`Failed to connect wallet: ${err.message}`);
      console.error('Wallet connection error:', err);
    }
  }, []);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setIsConnected(false);
    setWalletAddress('');
    setUserBalance('0');
    setVaultTVL('0');
    setUserShares('0');
    setSigner(null);
    
    // Remove event listeners
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }
  }, []);

  // Handle account changes
  const handleAccountsChanged = useCallback(async (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setWalletAddress(accounts[0]);
      if (signer) {
        await loadUserData(signer, accounts[0]);
      }
    }
  }, [signer, disconnectWallet]);

  // Handle chain changes
  const handleChainChanged = useCallback(() => {
    window.location.reload();
  }, []);

  // Load user data
  const loadUserData = useCallback(async (userSigner, address) => {
    try {
      if (!userSigner || !address) return;

      // Get contract instances
      const vaultContract = new ethers.Contract(
        CONTRACT_ADDRESSES.AegisVault,
        vaultABI,
        userSigner
      );

      const tokenContract = new ethers.Contract(
        CONTRACT_ADDRESSES.RWAToken,
        rwaTokenABI,
        userSigner
      );

      // Fetch data in parallel
      const [balance, tvl, shares, pending] = await Promise.all([
        tokenContract.balanceOf(address),
        vaultContract.totalAssets(),
        vaultContract.shares(address),
        vaultContract.pendingAIRequests(address)
      ]);

      setUserBalance(balance);
      setVaultTVL(tvl);
      setUserShares(shares);
      setIsRequestPending(pending);

    } catch (err) {
      console.error('Error loading user data:', err);
      setError(`Failed to load data: ${err.message}`);
    }
  }, []);

  // Deposit function
  const deposit = useCallback(async (amount) => {
    if (!signer || !isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const vaultContract = new ethers.Contract(
        CONTRACT_ADDRESSES.AegisVault,
        vaultABI,
        signer
      );

      const tokenContract = new ethers.Contract(
        CONTRACT_ADDRESSES.RWAToken,
        rwaTokenABI,
        signer
      );

      // Approve vault to spend tokens
      const approveTx = await tokenContract.approve(
        CONTRACT_ADDRESSES.AegisVault,
        amount
      );
      await approveTx.wait();

      // Deposit to vault
      const depositTx = await vaultContract.deposit(
        CONTRACT_ADDRESSES.RWAToken,
        amount
      );
      await depositTx.wait();

      // Refresh user data
      await loadUserData(signer, walletAddress);

      return depositTx.hash;
    } catch (err) {
      console.error('Deposit error:', err);
      throw new Error(`Deposit failed: ${err.message}`);
    }
  }, [signer, isConnected, walletAddress, loadUserData]);

  // Withdraw function
  const withdraw = useCallback(async (amount) => {
    if (!signer || !isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const vaultContract = new ethers.Contract(
        CONTRACT_ADDRESSES.AegisVault,
        vaultABI,
        signer
      );

      const withdrawTx = await vaultContract.withdraw(
        CONTRACT_ADDRESSES.RWAToken,
        amount
      );
      await withdrawTx.wait();

      // Refresh user data
      await loadUserData(signer, walletAddress);

      return withdrawTx.hash;
    } catch (err) {
      console.error('Withdraw error:', err);
      throw new Error(`Withdraw failed: ${err.message}`);
    }
  }, [signer, isConnected, walletAddress, loadUserData]);

  // Request AI insight
  const requestAIInsight = useCallback(async () => {
    if (!signer || !isConnected) {
      throw new Error('Wallet not connected');
    }

    if (isRequestPending) {
      throw new Error('AI request already pending');
    }

    try {
      const vaultContract = new ethers.Contract(
        CONTRACT_ADDRESSES.AegisVault,
        vaultABI,
        signer
      );

      setIsRequestPending(true);
      const requestTx = await vaultContract.requestAIInsight();
      await requestTx.wait();

      // Update pending status
      setIsRequestPending(false);

      return requestTx.hash;
    } catch (err) {
      setIsRequestPending(false);
      console.error('AI request error:', err);
      throw new Error(`AI request failed: ${err.message}`);
    }
  }, [signer, isConnected, isRequestPending]);

  // Refresh data
  const refreshData = useCallback(async () => {
    if (signer && walletAddress) {
      await loadUserData(signer, walletAddress);
    }
  }, [signer, walletAddress, loadUserData]);

  // Auto-refresh setiap 30 detik
  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(() => {
        refreshData();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isConnected, refreshData]);

  return {
    // State
    provider,
    signer,
    isConnected,
    walletAddress,
    userBalance,
    vaultTVL,
    userShares,
    isRequestPending,
    error,

    // Actions
    connectWallet,
    disconnectWallet,
    deposit,
    withdraw,
    requestAIInsight,
    refreshData,

    // Helpers
    formatEther: (value) => ethers.formatEther(value || '0')
  };
};

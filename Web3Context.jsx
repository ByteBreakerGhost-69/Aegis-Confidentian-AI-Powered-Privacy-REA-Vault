// frontend/src/contexts/Web3Context.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-hot-toast';

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ========== CONNECT WALLET ==========
  const connectWallet = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!window.ethereum) {
        throw new Error('Please install MetaMask');
      }

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const network = await provider.getNetwork();
      
      // Check if on correct network (Sepolia)
      if (network.chainId !== 11155111) {
        toast.error('Please switch to Sepolia testnet');
        await switchNetwork(11155111);
      }

      setProvider(provider);
      setSigner(signer);
      setAccount(accounts[0]);
      setChainId(network.chainId);

      toast.success('Wallet connected!');

    } catch (err) {
      console.error('Connection error:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ========== SWITCH NETWORK ==========
  const switchNetwork = async (targetChainId) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (switchError) {
      // If network not added, add it
      if (switchError.code === 4902) {
        await addNetwork(targetChainId);
      }
    }
  };

  // ========== ADD NETWORK ==========
  const addNetwork = async (chainId) => {
    const networks = {
      11155111: {
        chainId: '0xaa36a7',
        chainName: 'Sepolia Testnet',
        nativeCurrency: {
          name: 'SepoliaETH',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: ['https://sepolia.infura.io/v3/'],
        blockExplorerUrls: ['https://sepolia.etherscan.io'],
      },
      80001: {
        chainId: '0x13881',
        chainName: 'Mumbai Testnet',
        nativeCurrency: {
          name: 'MATIC',
          symbol: 'MATIC',
          decimals: 18,
        },
        rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
        blockExplorerUrls: ['https://mumbai.polygonscan.com'],
      },
    };

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [networks[chainId]],
    });
  };

  // ========== DISCONNECT WALLET ==========
  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    toast.success('Wallet disconnected');
  };

  // ========== AUTO-CONNECT ON LOAD ==========
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          disconnectWallet();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  // ========== FORMAT ADDRESS ==========
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // ========== GET EXPLORER URL ==========
  const getExplorerUrl = (txHash) => {
    const explorers = {
      11155111: 'https://sepolia.etherscan.io/tx/',
      80001: 'https://mumbai.polygonscan.com/tx/',
    };
    return `${explorers[chainId] || ''}${txHash}`;
  };

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        account,
        chainId,
        loading,
        error,
        connectWallet,
        disconnectWallet,
        formatAddress,
        getExplorerUrl,
        isConnected: !!account,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

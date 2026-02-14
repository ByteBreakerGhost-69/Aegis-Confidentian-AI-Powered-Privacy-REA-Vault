// frontend/src/components/Vault/VaultDashboard.jsx
import React, { useState } from 'react';
import { useAegisVault } from '../../hooks/useAegisVault';
import DepositForm from './DepositForm';
import WithdrawForm from './WithdrawForm';
import VaultStats from './VaultStats';

const VaultDashboard = () => {
  const [activeTab, setActiveTab] = useState('deposit');
  const { stats, loading, deposit, withdraw } = useAegisVault();

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span>🏦</span>
          RWA Vault
        </h2>
        <p className="text-white/80 text-sm mt-1">
          Deposit Real World Assets and earn AI-powered insights
        </p>
      </div>

      {/* Stats */}
      <div className="p-6">
        <VaultStats stats={stats} />

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('deposit')}
            className={`py-2 px-4 font-medium transition-all relative ${
              activeTab === 'deposit'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Deposit
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`py-2 px-4 font-medium transition-all relative ${
              activeTab === 'withdraw'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Withdraw
          </button>
        </div>

        {/* Active Tab Content */}
        {activeTab === 'deposit' ? (
          <DepositForm onSubmit={deposit} loading={loading} />
        ) : (
          <WithdrawForm 
            onSubmit={withdraw} 
            loading={loading} 
            maxShares={stats.userShares}
          />
        )}

        {/* Subscription Status */}
        {!stats.hasSubscription && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700 flex items-center gap-2">
              <span>⚠️</span>
              No active subscription. Please contact admin to enable AI features.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VaultDashboard;

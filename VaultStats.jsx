// frontend/src/components/Vault/VaultStats.jsx
import React from 'react';

const VaultStats = ({ stats }) => {
  const {
    totalAssets = '0',
    totalShares = '0',
    userShares = '0',
    userValueUSD = '0',
    hasSubscription = false
  } = stats;

  const formatNumber = (num) => {
    const n = parseFloat(num);
    if (n >= 1000000) return (n / 1000000).toFixed(2) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(2) + 'K';
    return n.toFixed(2);
  };

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {/* Total Assets */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600 mb-1">Total Assets</p>
        <p className="text-2xl font-bold text-gray-800">
          {formatNumber(totalAssets)}
        </p>
        <p className="text-xs text-gray-500">RWA tokens</p>
      </div>

      {/* Total Shares */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600 mb-1">Total Shares</p>
        <p className="text-2xl font-bold text-gray-800">
          {formatNumber(totalShares)}
        </p>
        <p className="text-xs text-gray-500">Vault shares</p>
      </div>

      {/* User Shares */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600 mb-1">Your Shares</p>
        <p className="text-2xl font-bold text-gray-800">
          {formatNumber(userShares)}
        </p>
        <p className="text-xs text-gray-500">{userValueUSD} USD</p>
      </div>

      {/* Status */}
      <div className={`bg-gradient-to-br p-4 rounded-lg ${
        hasSubscription 
          ? 'from-green-50 to-emerald-50' 
          : 'from-yellow-50 to-amber-50'
      }`}>
        <p className="text-sm text-gray-600 mb-1">Subscription</p>
        <p className="text-xl font-bold text-gray-800 flex items-center gap-2">
          {hasSubscription ? (
            <>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Active
            </>
          ) : (
            <>
              <span className="w-2 h-2 bg-yellow-500 rounded-full" />
              Inactive
            </>
          )}
        </p>
        <p className="text-xs text-gray-500">AI access</p>
      </div>
    </div>
  );
};

export default VaultStats;

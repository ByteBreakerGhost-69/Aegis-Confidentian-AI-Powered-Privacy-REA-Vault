// frontend/src/components/AI/AIRequestForm.jsx
import React, { useState } from 'react';

const AIRequestForm = ({ onSubmit, loading, pendingRequest }) => {
  const [assetType, setAssetType] = useState('Real Estate');
  const [riskProfile, setRiskProfile] = useState('Moderate');

  const assetTypes = [
    'Real Estate',
    'Stocks',
    'Commodities',
    'Bonds',
    'Crypto',
    'Private Equity'
  ];

  const riskProfiles = [
    { value: 'Conservative', color: 'green' },
    { value: 'Moderate', color: 'yellow' },
    { value: 'Aggressive', color: 'red' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(assetType, riskProfile);
  };

  if (pendingRequest) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4" />
        <p className="text-gray-700 font-medium">AI Analysis in Progress...</p>
        <p className="text-sm text-gray-500 mt-2">
          Request ID: {pendingRequest.requestId.slice(0, 10)}...
        </p>
        <p className="text-xs text-gray-400 mt-4">
          Chainlink Functions are calling OpenAI GPT-4
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Asset Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Asset Type
        </label>
        <select
          value={assetType}
          onChange={(e) => setAssetType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          disabled={loading}
        >
          {assetTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Risk Profile */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Risk Profile
        </label>
        <div className="grid grid-cols-3 gap-2">
          {riskProfiles.map(({ value, color }) => (
            <button
              key={value}
              type="button"
              onClick={() => setRiskProfile(value)}
              disabled={loading}
              className={`py-2 px-3 rounded-lg border transition ${
                riskProfile === value
                  ? `bg-${color}-100 border-${color}-500 text-${color}-700`
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Calling OpenAI...
          </span>
        ) : (
          '🚀 Request AI Analysis'
        )}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Powered by Chainlink Functions + OpenAI GPT-4
      </p>
    </form>
  );
};

export default AIRequestForm;

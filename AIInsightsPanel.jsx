// frontend/components/AIInsightsPanel.jsx
import React, { useState } from 'react';
import { useAIInsights } from '../hooks/useAIInsights';

export const AIInsightsPanel = ({ controllerAddress, vaultAddress }) => {
  const {
    insight,
    loading,
    error,
    aiModel,
    requestAIAnalysis,
    switchProvider,
    getRecommendationColor,
    getRiskLevelColor,
    isConnected
  } = useAIInsights(controllerAddress, vaultAddress);
  
  const [assetType, setAssetType] = useState('Real Estate');
  const [riskProfile, setRiskProfile] = useState('Moderate');
  const [showConfidence, setShowConfidence] = useState(true);
  
  // ========== HANDLE REQUEST ==========
  const handleRequestAnalysis = async () => {
    const result = await requestAIAnalysis(assetType, riskProfile);
    
    if (result.success) {
      // Show success message
      console.log('Analysis requested!');
    }
  };
  
  // ========== RENDER AI INSIGHT ==========
  const renderInsight = () => {
    if (!insight) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">🤖 No AI insight yet</p>
          <p className="text-sm mt-2">Request analysis to get GPT-4 recommendations</p>
        </div>
      );
    }
    
    const recommendationColor = getRecommendationColor(insight.recommendation);
    const riskColor = getRiskLevelColor(insight.riskLevel);
    
    return (
      <div className="space-y-4">
        {/* Recommendation Card */}
        <div className={`p-4 rounded-lg ${recommendationColor}`}>
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">Recommendation</span>
            <span className="text-2xl font-black">{insight.recommendation}</span>
          </div>
        </div>
        
        {/* Confidence Meter */}
        {showConfidence && (
          <div className="p-4 bg-white rounded-lg border">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Confidence</span>
              <span className="text-sm font-bold">{insight.confidence}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${insight.confidence}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Risk Level */}
        <div className="p-4 bg-white rounded-lg border">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Risk Level</span>
            <span className={`text-sm font-bold ${riskColor}`}>
              {insight.riskLevel}
            </span>
          </div>
        </div>
        
        {/* Timestamp */}
        <div className="text-xs text-gray-500 text-right">
          Generated: {insight.timestamp.toLocaleString()}
        </div>
      </div>
    );
  };
  
  // ========== RENDER AI MODEL INFO ==========
  const renderModelInfo = () => {
    if (!aiModel.version) return null;
    
    return (
      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">AI Model:</span>
          <span className="font-mono font-medium">{aiModel.version}</span>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-gray-600">Provider:</span>
          <span className="font-medium">
            {aiModel.provider === 'openai' ? '🤖 OpenAI' : '✨ Google Gemini'}
          </span>
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-gray-600">Accuracy:</span>
          <span className="font-medium">{aiModel.accuracy}%</span>
        </div>
      </div>
    );
  };
  
  // ========== RENDER PROVIDER SWITCHER ==========
  const renderProviderSwitcher = () => {
    return (
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => switchProvider('openai')}
          disabled={loading || aiModel.provider === 'openai'}
          className={`flex-1 px-3 py-2 text-xs rounded-lg transition ${
            aiModel.provider === 'openai'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🤖 OpenAI
        </button>
        <button
          onClick={() => switchProvider('google')}
          disabled={loading || aiModel.provider === 'google'}
          className={`flex-1 px-3 py-2 text-xs rounded-lg transition ${
            aiModel.provider === 'google'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          ✨ Gemini (Gratis)
        </button>
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          🤖 AI Investment Advisor
        </h2>
        {aiModel.provider && (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {aiModel.provider === 'openai' ? 'GPT-4' : 'Gemini Pro'}
          </span>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">⚠️ {error}</p>
        </div>
      )}
      
      {/* Input Form */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Asset Type
          </label>
          <select
            value={assetType}
            onChange={(e) => setAssetType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            <option>Real Estate</option>
            <option>Stocks</option>
            <option>Commodities</option>
            <option>Bonds</option>
            <option>Crypto</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Risk Profile
          </label>
          <select
            value={riskProfile}
            onChange={(e) => setRiskProfile(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={loading}
          >
            <option>Conservative</option>
            <option>Moderate</option>
            <option>Aggressive</option>
          </select>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="showConfidence"
            checked={showConfidence}
            onChange={(e) => setShowConfidence(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="showConfidence" className="ml-2 text-sm text-gray-600">
            Show confidence score
          </label>
        </div>
        
        <button
          onClick={handleRequestAnalysis}
          disabled={loading || !isConnected}
          className={`w-full py-3 px-4 rounded-lg text-white font-medium transition ${
            loading || !isConnected
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Calling OpenAI GPT-4...
            </span>
          ) : (
            '🚀 Request AI Analysis'
          )}
        </button>
      </div>
      
      {/* AI Insight Display */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          📊 Latest Insight
        </h3>
        {renderInsight()}
      </div>
      
      {/* AI Model Info & Provider Switcher */}
      <div className="border-t mt-6 pt-4">
        {renderModelInfo()}
        {renderProviderSwitcher()}
      </div>
      
      {/* Connection Status */}
      {!isConnected && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-700">
            🔌 Connect wallet to request AI analysis
          </p>
        </div>
      )}
    </div>
  );
};

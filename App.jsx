// frontend/src/App.jsx
import React from 'react';
import { Web3Provider } from './contexts/Web3Context';
import Navbar from './components/Layout/Navbar';
import VaultDashboard from './components/Vault/VaultDashboard';
import AIInsightsPanel from './components/AI/AIInsightsPanel';
import ChainlinkStatus from './components/Chainlink/ChainlinkStatus';
import Footer from './components/Layout/Footer';

function App() {
  return (
    <Web3Provider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              Aegis <span className="text-blue-600">Confidential</span>
            </h1>
            <p className="text-xl text-gray-600">
              AI-Powered Privacy REA Vault with Chainlink Functions + OpenAI GPT-4
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                🤖 OpenAI GPT-4
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                ⛓️ Chainlink Functions
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                🔐 Privacy RWA
              </span>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Vault */}
            <div className="lg:col-span-2 space-y-8">
              <VaultDashboard />
              <ChainlinkStatus />
            </div>

            {/* Right Column - AI */}
            <div className="space-y-8">
              <AIInsightsPanel />
            </div>
          </div>

          {/* Footer Stats */}
          <div className="mt-12">
            <Footer />
          </div>
        </main>
      </div>
    </Web3Provider>
  );
}

export default App;

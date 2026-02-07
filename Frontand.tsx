// frontend/components/VaultAdvanced.tsx
import { Card, Progress, Tabs, Badge } from "@/components/ui";

export default function AegisTerminal() {
  return (
    <div className="grid grid-cols-12 gap-4 bg-black p-8 min-h-screen text-slate-100 font-sans">
      
      {/* Kolom Kiri: Portofolio & RWA Status */}
      <div className="col-span-8 space-y-4">
        <header className="flex justify-between items-center bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter">AEGIS TERMINAL</h1>
            <p className="text-slate-400">Institutional AI-Managed Vault</p>
          </div>
          <Badge variant="outline" className="text-emerald-400 border-emerald-400 animate-pulse">
             ● CONFIDENTIAL MODE ACTIVE
          </Badge>
        </header>

        <Card className="bg-slate-900 border-slate-800 p-6">
          <h3 className="mb-4 text-slate-400">Portfolio Performance</h3>
          <div className="h-[300px] w-full bg-slate-950 rounded-lg flex items-center justify-center">
            {/* Di sini pasang Chart.js atau Recharts */}
            <p className="text-slate-600">[ Real-time RWA Price Chart ]</p>
          </div>
        </Card>
      </div>

      {/* Kolom Kanan: AI Agent Control & Privacy Logs */}
      <div className="col-span-4 space-y-4">
        <div className="bg-slate-900 border border-emerald-500/20 p-6 rounded-2xl">
          <h3 className="text-emerald-500 font-bold mb-4 flex items-center gap-2">
            <BotIcon size={20} /> AI AGENT INSIGHTS
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-black rounded border border-slate-800 font-mono text-xs">
              <p className="text-emerald-400">{">"} ANALYZING RWA_RESERVES...</p>
              <p className="text-white">{">"} SIGNAL: ACCUMULATE_GOLD_TOKEN</p>
              <p className="text-slate-500">{">"} CONFIDENCE: 94.2%</p>
            </div>
            <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold transition-all">
              Execute AI Strategy
            </button>
          </div>
        </div>

        <div className="bg-black border border-slate-800 p-4 rounded-2xl h-[200px] overflow-hidden">
          <h4 className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Privacy Encryption Logs</h4>
          <div className="text-[10px] font-mono text-slate-400 space-y-1">
            <p>[14:02:01] Initializing Confidential HTTP...</p>
            <p>[14:02:02] Fetching Secrets via Threshold Encryption...</p>
            <p className="text-blue-400">[14:02:03] DON Public Key Handshake: SUCCESS</p>
            <p className="text-emerald-400">[14:02:04] Data Fetched: Payload Encrypted</p>
          </div>
        </div>
      </div>
    </div>
  );
}



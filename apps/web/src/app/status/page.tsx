'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Provider {
  id: string;
  name: string;
  status: string;
  latency: string;
  models: string[];
  freeTier: string;
  configured: boolean;
}

export default function StatusPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState('');

  const checkHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setProviders(data.providers);
      setLastCheck(data.timestamp);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const statusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-500';
      case 'rate-limited': return 'bg-yellow-500';
      case 'error': case 'timeout': return 'bg-red-500';
      default: return 'bg-slate-600';
    }
  };

  const statusText = (status: string) => {
    switch (status) {
      case 'operational': return 'Operational';
      case 'rate-limited': return 'Rate Limited';
      case 'error': return 'Error';
      case 'timeout': return 'Timeout';
      default: return 'Not Configured';
    }
  };

  const operational = providers.filter(p => p.status === 'operational').length;

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="text-slate-400 hover:text-white mb-8 inline-block">← Home</Link>

        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-2">📡 Provider Health</h1>
          <p className="text-xl text-slate-400">Real-time status of all AI providers</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-green-400">{operational}</div>
            <div className="text-sm text-slate-400">Operational</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-blue-400">{providers.length}</div>
            <div className="text-sm text-slate-400">Total Providers</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-purple-400">Live</div>
            <div className="text-sm text-slate-400">Auto-refresh 30s</div>
          </div>
        </div>

        <div className="space-y-4">
          {loading && providers.length === 0 ? (
            <div className="text-center py-12 text-slate-400">Checking provider health...</div>
          ) : (
            providers.map((p) => (
              <div key={p.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${statusColor(p.status)} animate-pulse`} />
                    <h3 className="text-lg font-semibold">{p.name}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-400">Latency: <span className="font-mono text-white">{p.latency}</span></span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(p.status)} text-white`}>
                      {statusText(p.status)}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Models: </span>
                    <span className="font-mono">{p.models.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Free tier: </span>
                    <span>{p.freeTier}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {lastCheck && (
          <p className="text-center text-sm text-slate-500 mt-8">
            Last checked: {new Date(lastCheck).toLocaleTimeString()}
          </p>
        )}

        <div className="text-center mt-8">
          <button
            onClick={checkHealth}
            disabled={loading}
            className="px-6 py-3 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 disabled:opacity-50"
          >
            {loading ? 'Checking...' : '🔄 Refresh Now'}
          </button>
        </div>
      </div>
    </main>
  );
}

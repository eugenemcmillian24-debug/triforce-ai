'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface BuildRecord {
  id: string;
  type: string;
  prompt: string;
  status: string;
  timestamp: string;
  providers: string[];
  result?: any;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<BuildRecord[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('triforce-history');
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('triforce-history');
    setHistory([]);
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case 'app': return '🚀';
      case 'workflow': return '⚡';
      case 'repair': return '🔧';
      default: return '📦';
    }
  };

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="text-slate-400 hover:text-white mb-8 inline-block">← Home</Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-bold mb-2">📜 Build History</h1>
            <p className="text-xl text-slate-400">Your recent builds and repairs</p>
          </div>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="px-4 py-2 bg-red-900/30 border border-red-500 rounded-lg text-sm hover:bg-red-900/50"
            >
              🗑️ Clear All
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-xl text-slate-400 mb-6">No builds yet</p>
            <div className="flex gap-4 justify-center">
              <Link href="/builder/app" className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-500">🚀 Build an App</Link>
              <Link href="/builder/repair" className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-500">🔧 Repair a Repo</Link>
              <Link href="/templates" className="px-6 py-3 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700">📚 Templates</Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((record) => (
              <div key={record.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{typeIcon(record.type)}</span>
                    <div>
                      <h3 className="font-semibold capitalize">{record.type} Build</h3>
                      <p className="text-xs text-slate-400">{new Date(record.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    record.status === 'completed' ? 'bg-green-600' : 'bg-yellow-600'
                  }`}>
                    {record.status}
                  </span>
                </div>
                <p className="text-sm text-slate-300 mb-3 line-clamp-2">{record.prompt}</p>
                <div className="flex flex-wrap gap-2">
                  {record.providers.map(p => (
                    <span key={p} className="text-xs px-2 py-1 bg-slate-900 rounded text-slate-400">{p}</span>
                  ))}
                </div>
                {record.result?.downloadUrl && (
                  <a
                    href={record.result.downloadUrl}
                    className="block mt-3 text-sm text-purple-400 hover:text-purple-300"
                  >
                    ⬇️ Download build files
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

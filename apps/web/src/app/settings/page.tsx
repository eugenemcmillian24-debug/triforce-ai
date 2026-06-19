'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Settings {
  defaultProvider: string;
  agiMode: boolean;
  autoFallback: boolean;
  maxTokens: number;
  temperature: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    defaultProvider: 'groq',
    agiMode: false,
    autoFallback: true,
    maxTokens: 4096,
    temperature: 0.7,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('triforce-settings');
    if (stored) {
      setSettings(JSON.parse(stored));
    }
  }, []);

  const save = () => {
    localStorage.setItem('triforce-settings', JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const providers = [
    { id: 'groq', name: 'Groq (Fastest)' },
    { id: 'mistral', name: 'Mistral (Balanced)' },
    { id: 'github', name: 'GitHub Models (GPT-4o)' },
  ];

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-slate-400 hover:text-white mb-8 inline-block">← Home</Link>

        <h1 className="text-5xl font-bold mb-2">⚙️ Settings</h1>
        <p className="text-xl text-slate-400 mb-8">Configure your build preferences</p>

        <div className="space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Default Provider</h3>
            <select
              value={settings.defaultProvider}
              onChange={(e) => setSettings({ ...settings, defaultProvider: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
            >
              {providers.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">AGI Mode</h3>
                <p className="text-sm text-slate-400">Use multi-model chains for complex tasks</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, agiMode: !settings.agiMode })}
                className={`w-14 h-7 rounded-full transition-colors ${settings.agiMode ? 'bg-purple-600' : 'bg-slate-600'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform mx-1 ${settings.agiMode ? 'translate-x-7' : ''}`} />
              </button>
            </div>
            {settings.agiMode && (
              <div className="mt-4 p-3 bg-purple-900/30 border border-purple-500 rounded-lg text-sm">
                ⚡ AGI mode enabled. Complex prompts will use multi-model pipelines (~5 min, higher token usage).
              </div>
            )}
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Auto Fallback</h3>
                <p className="text-sm text-slate-400">Switch providers on rate limits automatically</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, autoFallback: !settings.autoFallback })}
                className={`w-14 h-7 rounded-full transition-colors ${settings.autoFallback ? 'bg-green-600' : 'bg-slate-600'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform mx-1 ${settings.autoFallback ? 'translate-x-7' : ''}`} />
              </button>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Generation Parameters</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Max Tokens: <span className="font-mono text-purple-400">{settings.maxTokens}</span></label>
                <input
                  type="range"
                  min="1024"
                  max="8192"
                  step="512"
                  value={settings.maxTokens}
                  onChange={(e) => setSettings({ ...settings, maxTokens: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Temperature: <span className="font-mono text-purple-400">{settings.temperature}</span></label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => setSettings({ ...settings, temperature: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <button
            onClick={save}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:opacity-90"
          >
            {saved ? '✅ Saved!' : '💾 Save Settings'}
          </button>
        </div>
      </div>
    </main>
  );
}

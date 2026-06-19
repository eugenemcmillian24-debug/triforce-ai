'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AppBuilderPage() {
  const [prompt, setPrompt] = useState('');
  const [framework, setFramework] = useState('nextjs');
  const [building, setBuilding] = useState(false);
  const [buildResult, setBuildResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBuild = async () => {
    if (!prompt.trim() || prompt.length < 10) {
      setError('Please enter at least 10 characters');
      return;
    }

    setBuilding(true);
    setError(null);
    setBuildResult(null);

    try {
      const response = await fetch('/api/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          builderType: 'app',
          framework,
          features: [],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Build failed');
      }

      setBuildResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setBuilding(false);
    }
  };

  const frameworks = [
    { id: 'nextjs', name: 'Next.js 15', icon: '▲' },
    { id: 'react', name: 'React + Vite', icon: '⚡' },
    { id: 'vue', name: 'Vue 3', icon: '💚' },
    { id: 'svelte', name: 'SvelteKit', icon: '🔥' },
  ];

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <Link href="/builder" className="text-slate-400 hover:text-white mb-8 inline-block">
          ← Back to Builders
        </Link>

        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-2">🚀 Full Stack App Builder</h1>
          <p className="text-xl text-slate-400">Generate complete applications from natural language</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Describe your application</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-48 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none text-white"
                placeholder="Build a project management tool with real-time collaboration, Kanban boards, and team analytics..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Framework</label>
              <div className="grid grid-cols-2 gap-2">
                {frameworks.map((fw) => (
                  <button
                    key={fw.id}
                    onClick={() => setFramework(fw.id)}
                    className={`px-4 py-3 rounded-lg border transition-all ${
                      framework === fw.id
                        ? 'border-purple-500 bg-purple-900/30'
                        : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <span className="mr-2">{fw.icon}</span>
                    {fw.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleBuild}
              disabled={building || prompt.length < 10}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {building ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Building...
                </span>
              ) : (
                '🚀 Build Application'
              )}
            </button>

            {error && <div className="p-4 bg-red-900/30 border border-red-500 rounded-lg">{error}</div>}
          </div>

          <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">🔧 Build Pipeline</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-purple-400 font-mono">1.</span>
                  <div>
                    <p className="font-medium">Requirements Analysis</p>
                    <p className="text-slate-400">Parse and structure your requirements</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-purple-400 font-mono">2.</span>
                  <div>
                    <p className="font-medium">Architecture Design</p>
                    <p className="text-slate-400">Design system architecture and data models</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-purple-400 font-mono">3.</span>
                  <div>
                    <p className="font-medium">Code Generation</p>
                    <p className="text-slate-400">Generate complete frontend and backend code</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-purple-400 font-mono">4.</span>
                  <div>
                    <p className="font-medium">Review &amp; Refine</p>
                    <p className="text-slate-400">AI-powered code review and optimization</p>
                  </div>
                </div>
              </div>
            </div>

            {buildResult && (
              <div className="bg-slate-800 border border-green-500 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">✅</span>
                  <h3 className="text-lg font-semibold">Build Complete</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="text-slate-400">Build ID:</span> {buildResult.buildId}</p>
                  <p><span className="text-slate-400">Status:</span> {buildResult.status}</p>
                  {buildResult.stats && (
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="bg-slate-900 rounded p-2">
                        <div className="text-xs text-slate-400">Tokens</div>
                        <div className="font-mono">{buildResult.stats.totalTokens}</div>
                      </div>
                      <div className="bg-slate-900 rounded p-2">
                        <div className="text-xs text-slate-400">Duration</div>
                        <div className="font-mono">{buildResult.stats.duration}</div>
                      </div>
                    </div>
                  )}
                  {Array.isArray(buildResult.stages) && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <p className="text-slate-400 mb-2">Pipeline Stages:</p>
                      {buildResult.stages.map((step: any, i: number) => (
                        <div key={step.name || i} className="flex items-center gap-2 py-1">
                          <span className="text-yellow-400">⏳</span>
                          <span className="font-medium">{step.name}</span>
                          <span className="text-slate-500 text-xs">— {step.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {buildResult.downloadUrl && (
                    <a
                      href={buildResult.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-lg text-center font-semibold mt-4"
                    >
                      Download Build →
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

interface StageResult {
  name: string;
  status: string;
  provider: string;
  preview: string;
  full: string;
}

export default function AppBuilderPage() {
  const [prompt, setPrompt] = useState('');
  const [framework, setFramework] = useState('nextjs');
  const [building, setBuilding] = useState(false);
  const [buildResult, setBuildResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [stages, setStages] = useState<StageResult[]>([]);
  const [streamingText, setStreamingText] = useState('');
  const [automated, setAutomated] = useState(true);
  const [agiMode, setAgiMode] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const streamRef = useRef<ReadableStreamDefaultReader | null>(null);

  const handleBuild = async () => {
    if (!prompt.trim() || prompt.length < 10) {
      setError('Please enter at least 10 characters');
      return;
    }

    setBuilding(true);
    setError(null);
    setStages([]);
    setStreamingText('');
    setBuildResult(null);
    setDownloadReady(false);

    try {
      const response = await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          builderType: 'app',
          framework,
          agiMode,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Stream failed to start');
      }

      const reader = response.body.getReader();
      streamRef.current = reader;
      const decoder = new TextDecoder();
      let buffer = '';
      const collectedStages: StageResult[] = [];
      let currentStageText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const event of events) {
          const eventLine = event.match(/^event: (.+)$/m);
          const dataLine = event.match(/^data: (.+)$/m);
          if (!eventLine || !dataLine) continue;

          const eventType = eventLine[1];
          let data: any;
          try { data = JSON.parse(dataLine[1] || ""); } catch { continue; }

          if (eventType === 'start') {
            setStreamingText(`Starting ${data.totalStages} stage${data.totalStages > 1 ? 's' : ''}${data.agiMode ? ' (AGI mode)' : ''}...\n\n`);
          } else if (eventType === 'stage') {
            currentStageText = '';
            setStreamingText((prev) => prev + `\n━━━ ${data.name} [${data.provider}/${data.model}] ━━━\n`);
            if (automated) {
              collectedStages.push({ name: data.name, status: 'running', provider: data.provider, preview: '', full: '' });
              setStages([...collectedStages]);
            }
          } else if (eventType === 'token') {
            currentStageText += data.text;
            setStreamingText((prev) => prev + data.text);
            if (automated) {
              const stageIdx = data.stage;
              if (collectedStages[stageIdx]) {
                collectedStages[stageIdx].full = currentStageText;
                collectedStages[stageIdx].preview = currentStageText.slice(0, 200);
                setStages([...collectedStages]);
              }
            }
          } else if (eventType === 'stageComplete') {
            setStreamingText((prev) => prev + '\n');
          } else if (eventType === 'complete') {
            setStreamingText((prev) => prev + '\n\n✅ Build complete!\n');
            setDownloadReady(true);
          } else if (eventType === 'error') {
            setStreamingText((prev) => prev + `\n⚠️ Stage ${data.stage}: ${data.message}\n`);
          }
        }
      }

      // Fetch the final structured result for download
      const finalRes = await fetch('/api/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, framework, features: [] }),
      });
      const finalData = await finalRes.json();
      if (finalData.success) {
        setBuildResult(finalData);
        setDownloadReady(true);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setBuilding(false);
    }
  };

  const handleDownload = () => {
    if (!buildResult) return;
    const content = stages.map((s) => `# ${s.name}\n\n${s.full}`).join('\n\n---\n\n');
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${buildResult.buildId || 'triforce-build'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadFiles = async () => {
    try {
      const res = await fetch(`/api/download?prompt=${encodeURIComponent(prompt)}&framework=${framework}`);
      if (!res.ok) {
        setError('Download failed');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `triforce-app-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Download failed');
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

            {/* Automated Options */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold">⚙️ Automation Options</h3>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={automated}
                  onChange={(e) => setAutomated(e.target.checked)}
                  className="w-5 h-5 accent-purple-500"
                />
                <div>
                  <span className="text-sm font-medium">Automated Pipeline</span>
                  <p className="text-xs text-slate-400">Auto-run all stages sequentially with real AI streaming</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agiMode}
                  onChange={(e) => setAgiMode(e.target.checked)}
                  className="w-5 h-5 accent-purple-500"
                />
                <div>
                  <span className="text-sm font-medium">AGI Mode (5-stage multi-model chain)</span>
                  <p className="text-xs text-slate-400">Research → Architecture → Code → Review → Polish</p>
                </div>
              </label>
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

            {error && (
              <div className="p-4 bg-red-900/30 border border-red-500 rounded-lg">{error}</div>
            )}

            {downloadReady && (
              <div className="flex gap-2">
                <button
                  onClick={handleDownload}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-semibold"
                >
                  📄 Download Build Report
                </button>
                <button
                  onClick={handleDownloadFiles}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold"
                >
                  📦 Download Project Files
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">🔧 Build Pipeline</h3>
              <div className="space-y-3 text-sm">
                {stages.length === 0 ? (
                  <>
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
                    {agiMode && (
                      <>
                        <div className="flex items-start gap-3">
                          <span className="text-purple-400 font-mono">4.</span>
                          <div>
                            <p className="font-medium">AI Review</p>
                            <p className="text-slate-400">Multi-model code review</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-purple-400 font-mono">5.</span>
                          <div>
                            <p className="font-medium">Polish & Finalize</p>
                            <p className="text-slate-400">Refinement pass</p>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  stages.map((s, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-green-400">✅</span>
                      <div className="flex-1">
                        <p className="font-medium">{s.name} <span className="text-xs text-slate-500">({s.provider})</span></p>
                        <p className="text-xs text-slate-400 mt-1">{s.preview}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {streamingText && (
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                <h3 className="text-sm font-semibold mb-2 text-slate-400">📡 Live AI Output</h3>
                <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono">{streamingText}</pre>
              </div>
            )}

            {buildResult && (
              <div className="bg-slate-800 border border-green-500 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">✅</span>
                  <h3 className="text-lg font-semibold">Build Complete</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="text-slate-400">Build ID:</span> {buildResult.buildId}</p>
                  <p><span className="text-slate-400">Stages:</span> {buildResult.stages?.length || stages.length}</p>
                  <p><span className="text-slate-400">Providers:</span> {buildResult.stats?.providers?.join(', ') || 'groq, mistral, github'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

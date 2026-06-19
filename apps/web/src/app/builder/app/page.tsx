'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';

interface BuildStage {
  name: string;
  status: 'pending' | 'streaming' | 'completed';
  output: string;
  provider?: string;
}

interface BuildFile {
  path: string;
  content: string;
}

const AGI_TRIGGERS = [
  'agentic', 'multi-step', 'research', 'plan and execute', 'self-healing',
  'autonomous', 'feedback loop', 'reflect', 'reason', 'chain of thought',
  'workflow', 'pipeline', 'orchestrat',
];

export default function AppBuilderPage() {
  const [prompt, setPrompt] = useState('');
  const [framework, setFramework] = useState('nextjs');
  const [building, setBuilding] = useState(false);
  const [agiMode, setAgiMode] = useState(false);
  const [agiWarning, setAgiWarning] = useState(false);
  const [stages, setStages] = useState<BuildStage[]>([]);
  const [files, setFiles] = useState<BuildFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [downloadReady, setDownloadReady] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const streamRef = useRef(false);

  const checkAGI = (text: string) => {
    const lower = text.toLowerCase();
    return AGI_TRIGGERS.some(t => lower.includes(t)) || text.length > 500;
  };

  const handlePromptChange = (val: string) => {
    setPrompt(val);
    if (checkAGI(val) && !agiMode) {
      setAgiWarning(true);
    }
  };

  const saveToHistory = (id: string, result: any) => {
    try {
      const history = JSON.parse(localStorage.getItem('triforce-history') || '[]');
      history.unshift({
        id,
        type: 'app',
        prompt: prompt.slice(0, 100),
        framework,
        timestamp: new Date().toISOString(),
        status: 'completed',
        fileCount: result.files?.length || 0,
      });
      localStorage.setItem('triforce-history', JSON.stringify(history.slice(0, 50)));
    } catch {}
  };

  const handleBuild = useCallback(async () => {
    if (!prompt.trim() || prompt.length < 10) {
      setError('Please enter at least 10 characters');
      return;
    }

    setBuilding(true);
    setError(null);
    setStages([]);
    setFiles([]);
    setDownloadReady(false);
    setShareUrl(null);
    streamRef.current = true;

    const allStages = agiMode
      ? ['Requirements', 'Architecture', 'Code Generation', 'Review', 'Refinement']
      : ['Requirements', 'Architecture', 'Code Generation'];

    setStages(allStages.map(name => ({ name, status: 'pending', output: '' })));

    try {
      const response = await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, framework, agiMode }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (reader) {
        while (streamRef.current) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6).trim();
              if (jsonStr === '[DONE]') {
                streamRef.current = false;
                break;
              }
              try {
                const evt = JSON.parse(jsonStr);
                if (evt.type === 'stage_start') {
                  setStages(prev => prev.map(s => s.name === evt.stage ? { ...s, status: 'streaming' } : s));
                } else if (evt.type === 'stage_chunk') {
                  setStages(prev => prev.map(s => s.name === evt.stage ? { ...s, output: s.output + evt.chunk } : s));
                } else if (evt.type === 'stage_done') {
                  setStages(prev => prev.map(s => s.name === evt.stage ? { ...s, status: 'completed', provider: evt.provider } : s));
                } else if (evt.type === 'complete') {
                  setBuilding(false);
                  streamRef.current = false;
                } else if (evt.type === 'error') {
                  setError(evt.message);
                  setBuilding(false);
                  streamRef.current = false;
                }
              } catch {}
            }
          }
        }
      }

      setStages(prev => prev.map(s => ({ ...s, status: 'completed' })));
      setBuilding(false);

      const dlResponse = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, framework }),
      });

      if (dlResponse.ok) {
        const dlData = await dlResponse.json();
        setFiles(dlData.files || []);
        setDownloadReady(true);
        setShareUrl(dlData.shareUrl || null);
        saveToHistory(dlData.buildId, dlData);
      }
    } catch (err: any) {
      setError(err.message || 'Build failed');
      setBuilding(false);
      streamRef.current = false;
    }
  }, [prompt, framework, agiMode]);

  const downloadFile = (file: BuildFile) => {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.path.split('/').pop() || 'file.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    files.forEach((f, i) => setTimeout(() => downloadFile(f), i * 200));
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
        <Link href="/builder" className="text-slate-400 hover:text-white mb-8 inline-block">← Back to Builders</Link>

        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-5xl font-bold mb-2">🚀 Full Stack App Builder</h1>
            <p className="text-xl text-slate-400">Generate complete applications with live streaming</p>
          </div>
          <Link href="/templates" className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:border-purple-500 text-sm">
            📋 Templates
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Describe your application</label>
              <textarea
                value={prompt}
                onChange={(e) => handlePromptChange(e.target.value)}
                className="w-full h-48 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none text-white"
                placeholder="Build a project management tool with real-time collaboration, Kanban boards, and team analytics..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Framework</label>
              <div className="grid grid-cols-2 gap-2">
                {frameworks.map((fw) => (
                  <button key={fw.id} onClick={() => setFramework(fw.id)}
                    className={`px-4 py-3 rounded-lg border transition-all ${framework === fw.id ? 'border-purple-500 bg-purple-900/30' : 'border-slate-700 bg-slate-800 hover:border-slate-600'}`}>
                    <span className="mr-2">{fw.icon}</span>{fw.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Feature 6: AGI Mode Toggle */}
            <div className={`p-4 rounded-lg border ${agiMode ? 'border-yellow-500 bg-yellow-900/20' : 'border-slate-700 bg-slate-800/50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold">🧠 AGI Mode</span>
                  <p className="text-xs text-slate-400 mt-1">Multi-model chain with research + refinement (~5 min)</p>
                </div>
                <button onClick={() => setAgiMode(!agiMode)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${agiMode ? 'bg-yellow-500' : 'bg-slate-600'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${agiMode ? 'translate-x-6' : ''}`} />
                </button>
              </div>
            </div>

            {agiWarning && !agiMode && (
              <div className="p-3 bg-yellow-900/30 border border-yellow-500 rounded-lg text-sm">
                ⚠️ AGI patterns detected in your prompt. Enable AGI Mode for best results.
              </div>
            )}

            <button onClick={handleBuild} disabled={building || prompt.length < 10}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
              {building ? '⏳ Building with AI...' : '🚀 Build Application'}
            </button>

            {error && <div className="p-4 bg-red-900/30 border border-red-500 rounded-lg">{error}</div>}
          </div>

          <div className="space-y-6">
            {/* Feature 3: Live Streaming Stages */}
            {stages.length > 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">🔧 Build Pipeline {agiMode && <span className="text-yellow-400 text-sm">(AGI)</span>}</h3>
                <div className="space-y-3">
                  {stages.map((stage) => (
                    <div key={stage.name}>
                      <div className="flex items-center gap-2 text-sm">
                        {stage.status === 'completed' ? '✅' : stage.status === 'streaming' ? (
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        ) : '⏳'}
                        <span className="font-medium">{stage.name}</span>
                        {stage.provider && <span className="text-xs text-slate-500">via {stage.provider}</span>}
                      </div>
                      {stage.output && (
                        <pre className="mt-1 ml-6 text-xs text-slate-400 max-h-24 overflow-auto whitespace-pre-wrap">{stage.output.slice(-300)}</pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feature 2: Code Download */}
            {downloadReady && files.length > 0 && (
              <div className="bg-slate-800 border border-green-500 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">✅ Build Complete — {files.length} files</h3>
                  <button onClick={downloadAll} className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-semibold">
                    💾 Download All
                  </button>
                </div>
                <div className="space-y-1 max-h-64 overflow-auto">
                  {files.map((f) => (
                    <div key={f.path} className="flex items-center justify-between p-2 bg-slate-900 rounded text-sm">
                      <span className="font-mono text-slate-300">{f.path}</span>
                      <button onClick={() => downloadFile(f)} className="text-purple-400 hover:text-purple-300 text-xs">↓</button>
                    </div>
                  ))}
                </div>
                {shareUrl && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <p className="text-xs text-slate-400 mb-1">Share link:</p>
                    <a href={shareUrl} className="text-purple-400 text-sm hover:underline">{shareUrl}</a>
                  </div>
                )}
              </div>
            )}

            {stages.length === 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">🔧 Pipeline Preview</h3>
                <div className="space-y-3 text-sm text-slate-400">
                  <p>1. Requirements Analysis — Parse your description</p>
                  <p>2. Architecture Design — Design system structure</p>
                  <p>3. Code Generation — Generate complete source files</p>
                  {agiMode && <p className="text-yellow-400">4. Review — AI code review</p>}
                  {agiMode && <p className="text-yellow-400">5. Refinement — Apply improvements</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

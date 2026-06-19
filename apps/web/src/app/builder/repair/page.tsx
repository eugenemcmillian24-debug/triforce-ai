'use client';

import { useState } from 'react';
import Link from 'next/link';

interface RepairResult {
  reportId: string;
  repoName: string;
  stages: {
    structure: { summary: string; full: string; provider: string };
    assessment: { summary: string; full: string; provider: string };
    security: { summary: string; full: string; provider: string };
  };
  priorityFixes: string;
  summary: string;
}

export default function RepairBuilderPage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<RepairResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'structure' | 'assessment' | 'security' | 'fixes'>('structure');
  const [creatingPR, setCreatingPR] = useState(false);
  const [prResult, setPrResult] = useState<{ prUrl?: string; error?: string } | null>(null);

  const handleAnalyze = async () => {
    if (!repoUrl) { setError('Repository URL is required'); return; }
    const githubPattern = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+/;
    if (!githubPattern.test(repoUrl)) { setError('Please enter a valid GitHub repository URL'); return; }

    setAnalyzing(true);
    setError(null);
    setResult(null);
    setPrResult(null);

    try {
      const response = await fetch('/api/repair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl, description }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Analysis failed');
      setResult(data);

      try {
        const history = JSON.parse(localStorage.getItem('triforce-history') || '[]');
        history.unshift({ id: data.reportId, type: 'repair', repo: data.repoName, timestamp: new Date().toISOString(), status: 'completed' });
        localStorage.setItem('triforce-history', JSON.stringify(history.slice(0, 50)));
      } catch {}
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setAnalyzing(false);
    }
  };

  // Feature 5: GitHub PR Creation
  const handleCreatePR = async () => {
    if (!result) return;
    setCreatingPR(true);
    setPrResult(null);
    try {
      const response = await fetch('/api/create-pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl, description, analysis: result.priorityFixes }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'PR creation failed');
      setPrResult({ prUrl: data.prUrl });
    } catch (err: any) {
      setPrResult({ error: err.message });
    } finally {
      setCreatingPR(false);
    }
  };

  const tabs = [
    { id: 'structure' as const, label: 'Structure', icon: '🏗️' },
    { id: 'assessment' as const, label: 'Assessment', icon: '🔍' },
    { id: 'security' as const, label: 'Security', icon: '🔒' },
    { id: 'fixes' as const, label: 'Fixes', icon: '🔧' },
  ];

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <Link href="/builder" className="text-slate-400 hover:text-white mb-8 inline-block">← Back to Builders</Link>

        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-2">🔧 Repo Repair Builder</h1>
          <p className="text-xl text-slate-400">AI-powered analysis with PR creation</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">GitHub Repository URL</label>
              <input type="text" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="https://github.com/username/repository" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">What needs fixing?</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                className="w-full h-32 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none text-white"
                placeholder="Describe bugs, issues, or improvements..." />
            </div>
            <button onClick={handleAnalyze} disabled={analyzing || !repoUrl}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50">
              {analyzing ? (<span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Analyzing...
              </span>) : '🔍 Analyze Repository'}
            </button>
            {error && <div className="p-4 bg-red-900/30 border border-red-500 rounded-lg">{error}</div>}
          </div>

          <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">🔍 Analysis Pipeline</h3>
              <div className="space-y-3 text-sm">
                {[['Repository Ingestion', 'Clone and parse codebase'],['Static Analysis', 'Lint, type check, patterns'],['AI Deep Scan', 'Semantic bug detection'],['Security Audit', 'Vulnerability scanning'],['Patch Generation', 'Create fix proposals']].map(([title, desc], i) => (
                  <div key={title} className="flex items-start gap-3">
                    <span className="text-blue-400 font-mono">{i + 1}.</span>
                    <div><p className="font-medium">{title}</p><p className="text-slate-400">{desc}</p></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature 5: PR Creation Button */}
            {result && (
              <div className="bg-slate-800 border border-purple-500 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3">📦 Create Pull Request</h3>
                <p className="text-sm text-slate-400 mb-4">Generate a PR with the suggested fixes applied to your repository.</p>
                <button onClick={handleCreatePR} disabled={creatingPR}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold disabled:opacity-50">
                  {creatingPR ? 'Creating PR...' : '🔀 Create Fix PR on GitHub'}
                </button>
                {prResult?.prUrl && (
                  <a href={prResult.prUrl} target="_blank" rel="noopener noreferrer"
                    className="block mt-3 text-center py-3 bg-green-600 rounded-lg font-semibold">
                    ✅ View Pull Request →
                  </a>
                )}
                {prResult?.error && (
                  <div className="mt-3 p-3 bg-red-900/30 border border-red-500 rounded text-sm">{prResult.error}</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Feature 8: Results with tabs + diff-style display */}
        {result && (
          <div className="mt-8 bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">✅</span>
              <h2 className="text-2xl font-bold">Analysis Complete — {result.repoName}</h2>
            </div>

            <div className="flex gap-2 mb-6 border-b border-slate-700 pb-2">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-slate-900 text-white border-t border-l border-r border-slate-700' : 'text-slate-400 hover:text-white'}`}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'fixes' ? (
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-slate-300 font-mono">{result.priorityFixes}</pre>
              </div>
            ) : (
              <div>
                <p className="text-sm text-slate-400 mb-3">via {result.stages[activeTab]?.provider}</p>
                <pre className="whitespace-pre-wrap text-sm text-slate-300 font-mono max-h-96 overflow-auto">{result.stages[activeTab]?.full}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

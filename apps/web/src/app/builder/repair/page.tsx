'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RepairBuilderPage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [autoFix, setAutoFix] = useState(false);
  const [automated, setAutomated] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [creatingPR, setCreatingPR] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [prResult, setPrResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [stageProgress, setStageProgress] = useState<string>('');

  const handleAnalyze = async () => {
    if (!repoUrl) { setError('Repository URL is required'); return; }
    if (!/^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+/.test(repoUrl)) {
      setError('Please enter a valid GitHub repository URL'); return;
    }
    setAnalyzing(true); setError(null); setResult(null); setPrResult(null);

    try {
      const stages = ['Fetching repository structure...', 'Analyzing architecture...', 'Deep code review...', 'Security audit...', 'Generating fixes...'];
      const interval = setInterval(() => {
        setStageProgress(stages[Math.min(stages.indexOf(stageProgress) + 1, stages.length - 1)] || stages[0]! || "");
      }, 2500);
      setStageProgress(stages[0]!);

      const response = await fetch('/api/repair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl, description, token: githubToken || undefined, autoFix }),
      });
      clearInterval(interval);
      setStageProgress('');

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Analysis failed');
      setResult(data);

      if (autoFix && githubToken) { await handleCreatePR(data); }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCreatePR = async (_analysis: any) => {
    setCreatingPR(true);
    try {
      const response = await fetch('/api/create-pr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl, description, token: githubToken }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'PR creation failed');
      setPrResult(data);
    } catch (err: any) {
      setError(`Auto-fix failed: ${err.message}`);
    } finally {
      setCreatingPR(false);
    }
  };

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <Link href="/builder" className="text-slate-400 hover:text-white mb-8 inline-block">← Back to Builders</Link>

        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-2">🔧 Repo Repair Builder</h1>
          <p className="text-xl text-slate-400">AI-powered code analysis with automated fixes</p>
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
              <label className="block text-sm font-semibold mb-2">What needs fixing? (optional)</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                className="w-full h-28 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none text-white"
                placeholder="Describe bugs, issues, or improvements you want..." />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">GitHub Token (for private repos & auto-fix)</label>
              <input type="password" value={githubToken} onChange={(e) => setGithubToken(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white font-mono text-sm"
                placeholder="ghp_... (optional, stored only in your browser session)" />
              <p className="mt-1 text-xs text-slate-500">Required for auto-fix PR creation. Token is sent only to the API for this request.</p>
            </div>

            <div className="space-y-3 bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={automated} onChange={(e) => setAutomated(e.target.checked)} className="w-5 h-5 rounded accent-blue-500" />
                <div>
                  <span className="font-medium">Automated Pipeline</span>
                  <p className="text-xs text-slate-400">Run all 5 analysis stages automatically in sequence</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={autoFix} onChange={(e) => setAutoFix(e.target.checked)} className="w-5 h-5 rounded accent-green-500" />
                <div>
                  <span className="font-medium text-green-400">Auto-Fix & Create PR</span>
                  <p className="text-xs text-slate-400">Automatically generate fixes and open a pull request (requires GitHub token)</p>
                </div>
              </label>
            </div>

            <button onClick={handleAnalyze} disabled={analyzing || !repoUrl}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
              {analyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {stageProgress || 'Analyzing...'}
                </span>
              ) : autoFix ? '🔧 Analyze & Auto-Fix' : '🔍 Analyze Repository'}
            </button>

            {error && <div className="p-4 bg-red-900/30 border border-red-500 rounded-lg text-sm">{error}</div>}
          </div>

          <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">🔍 Analysis Pipeline</h3>
              <div className="space-y-3 text-sm">
                {[['Repository Ingestion', 'Clone & parse real codebase via GitHub API'], ['Static Analysis', 'File tree, languages, structure detection'], ['AI Deep Scan', 'Semantic bug detection with Groq/Mistral'], ['Security Audit', 'OWASP vulnerability scanning with GPT-4o'], ['Fix Generation', 'Actionable patches with code examples']].map(([title, desc], i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-blue-400 font-mono">{i + 1}.</span>
                    <div>
                      <p className="font-medium">{title}</p>
                      <p className="text-slate-400">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {result && (
              <div className="bg-slate-800 border border-green-500 rounded-lg p-6 max-h-[500px] overflow-y-auto">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">✅</span>
                  <h3 className="text-lg font-semibold">Analysis Complete</h3>
                </div>
                {result.repoInfo && (
                  <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                    <div className="bg-slate-900 rounded p-2"><div className="text-lg font-bold">{result.repoInfo.language || 'N/A'}</div><div className="text-xs text-slate-400">Language</div></div>
                    <div className="bg-slate-900 rounded p-2"><div className="text-lg font-bold">{result.repoInfo.fileCount}</div><div className="text-xs text-slate-400">Files</div></div>
                    <div className="bg-slate-900 rounded p-2"><div className="text-lg font-bold">{result.repoInfo.languages?.length || 0}</div><div className="text-xs text-slate-400">Langs</div></div>
                  </div>
                )}
                {result.stages?.structure?.full && (
                  <details className="mb-3" open>
                    <summary className="cursor-pointer font-medium text-blue-400">📋 Structure Analysis</summary>
                    <pre className="mt-2 text-xs text-slate-300 whitespace-pre-wrap bg-slate-900 p-3 rounded">{result.stages.structure.full}</pre>
                  </details>
                )}
                {result.stages?.assessment?.full && (
                  <details className="mb-3">
                    <summary className="cursor-pointer font-medium text-purple-400">🔬 Deep Assessment</summary>
                    <pre className="mt-2 text-xs text-slate-300 whitespace-pre-wrap bg-slate-900 p-3 rounded">{result.stages.assessment.full}</pre>
                  </details>
                )}
                {result.stages?.security?.full && (
                  <details className="mb-3">
                    <summary className="cursor-pointer font-medium text-red-400">🔒 Security Audit</summary>
                    <pre className="mt-2 text-xs text-slate-300 whitespace-pre-wrap bg-slate-900 p-3 rounded">{result.stages.security.full}</pre>
                  </details>
                )}
                {result.priorityFixes && (
                  <details className="mb-3">
                    <summary className="cursor-pointer font-medium text-green-400">🎯 Priority Fixes</summary>
                    <pre className="mt-2 text-xs text-slate-300 whitespace-pre-wrap bg-slate-900 p-3 rounded">{result.priorityFixes}</pre>
                  </details>
                )}
                {result.summary && (
                  <div className="mt-4 p-3 bg-slate-900 rounded border border-slate-700">
                    <p className="text-xs text-slate-400 mb-1">Summary:</p>
                    <p className="text-sm">{result.summary}</p>
                  </div>
                )}
              </div>
            )}

            {creatingPR && (
              <div className="bg-slate-800 border border-yellow-500 rounded-lg p-6">
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-yellow-400" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  <span>Creating pull request with AI-generated fixes...</span>
                </div>
              </div>
            )}

            {prResult && (
              <div className="bg-slate-800 border border-green-500 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3"><span className="text-2xl">🎉</span><h3 className="text-lg font-semibold">Pull Request Created</h3></div>
                <div className="space-y-2 text-sm">
                  <p><span className="text-slate-400">PR:</span> <a href={prResult.prUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{prResult.prUrl}</a></p>
                  <p><span className="text-slate-400">Branch:</span> <code className="bg-slate-900 px-1 rounded">{prResult.branch}</code></p>
                  <p><span className="text-slate-400">Files changed:</span> {prResult.filesChanged}</p>
                </div>
                <a href={prResult.prUrl} target="_blank" rel="noopener noreferrer" className="block w-full py-3 bg-green-600 hover:bg-green-500 rounded-lg text-center font-semibold mt-4">View Pull Request →</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

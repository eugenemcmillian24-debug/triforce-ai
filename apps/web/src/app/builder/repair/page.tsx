'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RepairBuilderPage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!repoUrl) {
      setError('Repository URL is required');
      return;
    }

    const githubPattern = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w-]+/;
    if (!githubPattern.test(repoUrl)) {
      setError('Please enter a valid GitHub repository URL');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/repair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setAnalysisResult(data.analysis);
      
      // Poll for updates
      pollForResults(data.analysisId);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setAnalyzing(false);
    }
  };

  const pollForResults = async (analysisId: string) => {
    // Poll every 2 seconds for updates
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/repair?id=${analysisId}`);
        const data = await response.json();
        
        if (data.status === 'completed') {
          clearInterval(interval);
          setAnalysisResult(data);
          setAnalyzing(false);
        }
      } catch (error) {
        clearInterval(interval);
        setAnalyzing(false);
      }
    }, 2000);

    // Stop after 30 seconds
    setTimeout(() => {
      clearInterval(interval);
      setAnalyzing(false);
    }, 30000);
  };

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <Link href="/builder" className="text-slate-400 hover:text-white mb-8 inline-block">
          ← Back to Builders
        </Link>

        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-2">🔧 Repo Repair Builder</h1>
          <p className="text-xl text-slate-400">
            AI-powered code analysis and automated repair
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">
                GitHub Repository URL
              </label>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="https://github.com/username/repository"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                What needs fixing?
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-32 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none text-white"
                placeholder="Describe bugs, issues, or improvements you want..."
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={analyzing || !repoUrl}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analyzing...
                </span>
              ) : (
                '🔍 Analyze Repository'
              )}
            </button>

            {error && (
              <div className="p-4 bg-red-900/30 border border-red-500 rounded-lg">
                {error}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">🔍 Analysis Pipeline</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-blue-400 font-mono">1.</span>
                  <div>
                    <p className="font-medium">Repository Ingestion</p>
                    <p className="text-slate-400">Clone and parse codebase</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-400 font-mono">2.</span>
                  <div>
                    <p className="font-medium">Static Analysis</p>
                    <p className="text-slate-400">Lint, type check, pattern detection</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-400 font-mono">3.</span>
                  <div>
                    <p className="font-medium">AI Deep Scan</p>
                    <p className="text-slate-400">Semantic bug detection</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-400 font-mono">4.</span>
                  <div>
                    <p className="font-medium">Security Audit</p>
                    <p className="text-slate-400">Vulnerability scanning</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-400 font-mono">5.</span>
                  <div>
                    <p className="font-medium">Patch Generation</p>
                    <p className="text-slate-400">Create fix proposals</p>
                  </div>
                </div>
              </div>
            </div>

            {analysisResult && (
              <div className="bg-slate-800 border border-green-500 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">✅</span>
                  <h3 className="text-lg font-semibold">Analysis Complete</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-slate-900 rounded-lg p-3">
                      <div className="text-2xl font-bold text-red-400">{analysisResult.results?.totalIssues || 0}</div>
                      <div className="text-xs text-slate-400">Total Issues</div>
                    </div>
                    <div className="bg-slate-900 rounded-lg p-3">
                      <div className="text-2xl font-bold text-yellow-400">{analysisResult.results?.criticalIssues || 0}</div>
                      <div className="text-xs text-slate-400">Critical</div>
                    </div>
                    <div className="bg-slate-900 rounded-lg p-3">
                      <div className="text-2xl font-bold text-blue-400">{analysisResult.results?.warnings || 0}</div>
                      <div className="text-xs text-slate-400">Warnings</div>
                    </div>
                  </div>

                  {analysisResult.results?.prUrl && (
                    <a
                      href={analysisResult.results.prUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-lg text-center font-semibold mt-4"
                    >
                      View Pull Request →
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

'use client';

import { useState } from 'react';
import Link from 'next/link';

interface AnalysisResult {
  reportId: string;
  repoUrl: string;
  repoName: string;
  branch: string;
  timestamp: string;
  status: string;
  stages: {
    structure: { status: string; provider: string; model: string; summary: string; full: string };
    assessment: { status: string; provider: string; model: string; summary: string; full: string };
    security: { status: string; provider: string; model: string; summary: string; full: string };
  };
  priorityFixes: string;
  summary: string;
  metadata: { providersUsed: string[]; totalStages: number; fallbackEnabled: boolean };
}

export default function RepairBuilderPage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeStage, setActiveStage] = useState<'structure' | 'assessment' | 'security' | 'fixes' | 'summary'>('structure');

  const handleAnalyze = async () => {
    if (!repoUrl) {
      setError('Repository URL is required');
      return;
    }

    const githubPattern = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+/;
    if (!githubPattern.test(repoUrl)) {
      setError('Please enter a valid GitHub repository URL');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/repair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl, description }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResult(data as AnalysisResult);
      setActiveStage('structure');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setAnalyzing(false);
    }
  };

  const stageTabs = [
    { id: 'structure' as const, label: 'Structure', icon: '🏗️' },
    { id: 'assessment' as const, label: 'Assessment', icon: '🔬' },
    { id: 'security' as const, label: 'Security', icon: '🔒' },
    { id: 'fixes' as const, label: 'Priority Fixes', icon: '🎯' },
    { id: 'summary' as const, label: 'Summary', icon: '📋' },
  ];

  const getActiveContent = () => {
    if (!result) return '';
    switch (activeStage) {
      case 'structure': return result.stages.structure.full;
      case 'assessment': return result.stages.assessment.full;
      case 'security': return result.stages.security.full;
      case 'fixes': return result.priorityFixes;
      case 'summary': return result.summary;
    }
  };

  const getActiveProvider = () => {
    if (!result) return '';
    switch (activeStage) {
      case 'structure': return result.stages.structure.provider;
      case 'assessment': return result.stages.assessment.provider;
      case 'security': return result.stages.security.provider;
      default: return 'multi';
    }
  };

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <Link href="/builder" className="text-slate-400 hover:text-white mb-8 inline-block">
          ← Back to Builders
        </Link>

        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-2">🔧 Repo Repair Builder</h1>
          <p className="text-xl text-slate-400">AI-powered code analysis and automated repair</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">GitHub Repository URL</label>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="https://github.com/username/repository"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">What needs fixing?</label>
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
              <div className="p-4 bg-red-900/30 border border-red-500 rounded-lg">{error}</div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">🔍 Analysis Pipeline</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-blue-400 font-mono">1.</span>
                  <div>
                    <p className="font-medium">Structure Analysis</p>
                    <p className="text-slate-400">Repo overview, tech stack, architecture</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-400 font-mono">2.</span>
                  <div>
                    <p className="font-medium">Deep Assessment</p>
                    <p className="text-slate-400">Code quality, bugs, performance</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-400 font-mono">3.</span>
                  <div>
                    <p className="font-medium">Security Audit</p>
                    <p className="text-slate-400">OWASP Top 10, dependency risks</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-400 font-mono">4.</span>
                  <div>
                    <p className="font-medium">Priority Fixes</p>
                    <p className="text-slate-400">Actionable fixes with code examples</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-400 font-mono">5.</span>
                  <div>
                    <p className="font-medium">Summary</p>
                    <p className="text-slate-400">Concise diagnostic overview</p>
                  </div>
                </div>
              </div>
            </div>

            {result && (
              <div className="bg-slate-800 border border-green-500 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">✅</span>
                  <h3 className="text-lg font-semibold">Analysis Complete</h3>
                </div>
                <div className="space-y-1 text-sm">
                  <p><span className="text-slate-400">Repository:</span> {result.repoName}</p>
                  <p><span className="text-slate-400">Branch:</span> {result.branch}</p>
                  <p><span className="text-slate-400">Providers:</span> {result.metadata.providersUsed.join(', ')}</p>
                  <p><span className="text-slate-400">Report ID:</span> <span className="font-mono text-xs">{result.reportId}</span></p>
                </div>
              </div>
            )}
          </div>
        </div>

        {result && (
          <div className="mt-8 bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex flex-wrap gap-2 mb-4 border-b border-slate-700 pb-4">
              {stageTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveStage(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeStage === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <span className="mr-1">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
              <span>
                Provider: <span className="font-mono text-blue-400">{getActiveProvider()}</span>
              </span>
              <span>Stage {stageTabs.findIndex(t => t.id === activeStage) + 1} of {stageTabs.length}</span>
            </div>

            <pre className="whitespace-pre-wrap text-sm text-slate-200 max-h-[600px] overflow-y-auto font-mono leading-relaxed">
              {getActiveContent() || 'No content available'}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}

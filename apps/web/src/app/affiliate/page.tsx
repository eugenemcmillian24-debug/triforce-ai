'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ReferralStats {
  code: string;
  link: string;
  clicks: number;
  signups: number;
  conversions: number;
  earnings: number;
  clicksLast30: Array<{ date: string; count: number }>;
}

export default function AffiliatePage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateLink = async () => {
    setLoading(true);
    const res = await fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', githubUsername: username, email }),
    });
    const data = await res.json();
    if (data.success) {
      setStats({
        code: data.account.referralCode,
        link: data.referralLink,
        clicks: 0,
        signups: 0,
        conversions: 0,
        earnings: 0,
        clicksLast30: [],
      });
    }
    setLoading(false);
  };

  const copyLink = () => {
    if (stats) {
      navigator.clipboard.writeText(stats.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-slate-400 hover:text-white mb-8 inline-block">← Back home</Link>

        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-2">💰 Affiliate Program</h1>
          <p className="text-xl text-slate-400">Earn 30% recurring commission on every Pro subscriber you refer</p>
        </div>

        {!stats ? (
          <div className="max-w-md mx-auto p-8 bg-slate-900/60 border border-slate-700 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Get your referral link</h2>
            <div className="space-y-3">
              <input value={username} onChange={e => setUsername(e.target.value)} className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700" placeholder="GitHub username" />
              <input value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700" placeholder="Email" />
              <button onClick={generateLink} disabled={loading || !username || !email} className="w-full px-4 py-3 rounded bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90 disabled:opacity-50">
                {loading ? 'Generating...' : 'Get My Referral Link'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Referral Link */}
            <div className="p-6 bg-slate-900/60 border border-slate-700 rounded-xl">
              <h2 className="text-xl font-semibold mb-4">Your Referral Link</h2>
              <div className="flex gap-2">
                <input readOnly value={stats.link} className="flex-1 px-3 py-2 rounded bg-slate-800 border border-slate-700 font-mono text-sm" />
                <button onClick={copyLink} className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-500">
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <p className="mt-2 text-sm text-slate-400">Code: <span className="font-mono text-purple-400">{stats.code}</span></p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Link Clicks" value={stats.clicks} icon="👆" />
              <StatCard label="Signups" value={stats.signups} icon="👥" />
              <StatCard label="Conversions" value={stats.conversions} icon="✅" />
              <StatCard label="Earnings" value={`$${stats.earnings.toFixed(2)}`} icon="💰" />
            </div>

            {/* How it works */}
            <div className="p-6 bg-slate-900/60 border border-slate-700 rounded-xl">
              <h2 className="text-xl font-semibold mb-4">How it works</h2>
              <ol className="space-y-3 text-slate-300">
                <li><span className="text-purple-400 font-mono">1.</span> Share your referral link anywhere</li>
                <li><span className="text-purple-400 font-mono">2.</span> When someone signs up, they get 5 bonus builds</li>
                <li><span className="text-purple-400 font-mono">3.</span> When they upgrade to Pro ($19/mo), you earn $5.70/mo</li>
                <li><span className="text-purple-400 font-mono">4.</span> Payouts via Stripe Connect on the 1st of each month</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="p-4 bg-slate-900/60 border border-slate-700 rounded-xl">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}

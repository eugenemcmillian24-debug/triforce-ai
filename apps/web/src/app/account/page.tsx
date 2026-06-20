'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface UserAccount {
  id: string;
  plan: string;
  buildsUsed: number;
  buildsLimit: number;
  referralCode: string;
  joinedAt: string;
}

export default function AccountPage() {
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Load account from localStorage (demo) — in production this would fetch from KV
    try {
      const stored = localStorage.getItem('triforce_account');
      if (stored) {
        setAccount(JSON.parse(stored));
      } else {
        // Create demo account
        const demo: UserAccount = {
          id: 'demo_user',
          plan: 'free',
          buildsUsed: parseInt(localStorage.getItem('triforce_build_count') || '0'),
          buildsLimit: 10,
          referralCode: 'TRI' + Math.random().toString(36).slice(2, 8).toUpperCase(),
          joinedAt: new Date().toISOString(),
        };
        localStorage.setItem('triforce_account', JSON.stringify(demo));
        setAccount(demo);
      }
    } catch {}
    setLoading(false);
  }, []);

  const copyReferral = () => {
    if (account) {
      const link = `https://triforce-ai.pages.dev/?ref=${account.referralCode}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>;
  if (!account) return <div className="min-h-screen flex items-center justify-center text-slate-400">No account found</div>;

  const usagePercent = (account.buildsUsed / account.buildsLimit) * 100;

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-slate-400 hover:text-white mb-8 inline-block">← Back home</Link>

        <h1 className="text-5xl font-bold mb-2">👤 My Account</h1>

        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          {/* Plan Card */}
          <div className="p-6 bg-slate-900/60 border border-slate-700 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Current Plan</h2>
              <span className={`px-3 py-1 rounded-full text-sm ${account.plan === 'pro' ? 'bg-purple-600' : 'bg-slate-700'}`}>
                {account.plan === 'pro' ? '⭐ Pro' : 'Free'}
              </span>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">Builds used</span>
                <span>{account.buildsUsed} / {account.buildsLimit}</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600" style={{ width: `${usagePercent}%` }} />
              </div>
            </div>
            {account.plan === 'free' && (
              <Link href="/pricing" className="block w-full py-3 mt-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-center font-semibold hover:opacity-90">
                ⬆️ Upgrade to Pro — $19/mo
              </Link>
            )}
          </div>

          {/* Referral Card */}
          <div className="p-6 bg-slate-900/60 border border-slate-700 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">💰 Earn with referrals</h2>
            <p className="text-sm text-slate-400 mb-3">Share your link, earn 30% on every Pro subscriber</p>
            <div className="flex gap-2 mb-3">
              <input readOnly value={`https://triforce-ai.pages.dev/?ref=${account.referralCode}`} className="flex-1 px-3 py-2 rounded bg-slate-800 border border-slate-700 text-xs font-mono" />
              <button onClick={copyReferral} className="px-3 py-2 rounded bg-purple-600 hover:bg-purple-500 text-sm">
                {copied ? '✓' : 'Copy'}
              </button>
            </div>
            <Link href="/affiliate" className="text-sm text-purple-400 hover:underline">View dashboard →</Link>
          </div>

          {/* Account Info */}
          <div className="p-6 bg-slate-900/60 border border-slate-700 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Account Details</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-slate-400">User ID</dt><dd className="font-mono">{account.id}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">Referral code</dt><dd className="font-mono text-purple-400">{account.referralCode}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">Member since</dt><dd>{new Date(account.joinedAt).toLocaleDateString()}</dd></div>
            </dl>
          </div>

          {/* Quick Actions */}
          <div className="p-6 bg-slate-900/60 border border-slate-700 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link href="/history" className="block px-4 py-2 bg-slate-800 rounded hover:bg-slate-700">📊 View build history</Link>
              <Link href="/templates" className="block px-4 py-2 bg-slate-800 rounded hover:bg-slate-700">📋 Browse templates</Link>
              <Link href="/status" className="block px-4 py-2 bg-slate-800 rounded hover:bg-slate-700">🩺 Provider health</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

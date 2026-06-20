'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PricePlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year' | 'one_time';
  features: string[];
}

export default function PricingPage() {
  const [plans, setPlans] = useState<PricePlan[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [email, setEmail] = useState('');
  const [githubUsername, setGithubUsername] = useState('');

  useEffect(() => {
    fetch('/api/billing/checkout')
      .then(r => r.json())
      .then(data => setPlans(data.prices || []))
      .finally(() => setLoading(false));
  }, []);

  const checkout = async (priceId: string) => {
    
    const res = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId,
        email,
        userId: githubUsername || undefined,
        successUrl: `${window.location.origin}/pricing?success=1`,
        cancelUrl: `${window.location.origin}/pricing?canceled=1`,
      }),
    });
    const data = await res.json();
    if (data.checkoutUrl) window.location.href = data.checkoutUrl;
    else alert(data.message || data.error || 'Checkout unavailable');
  };

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-slate-400 hover:text-white mb-8 inline-block">← Back home</Link>
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-4">Pricing</h1>
          <p className="text-xl text-slate-400">Turn TriForce AI into a product people can buy.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 grid md:grid-cols-3 gap-4">
            {loading ? <div className="text-slate-400">Loading plans...</div> : plans.map(plan => (
              <button key={plan.id} onClick={() => checkout(plan.id)} className="text-left p-5 rounded-xl border border-slate-700 bg-slate-900/60 hover:border-purple-500 transition">
                <div className="text-sm text-slate-400 mb-1">{plan.name}</div>
                <div className="text-3xl font-bold mb-2">${plan.price.toFixed(0)}{plan.interval === 'month' ? '/mo' : plan.interval === 'year' ? '/yr' : ''}</div>
                <ul className="text-sm text-slate-300 space-y-1">
                  {plan.features.slice(0, 4).map(f => <li key={f}>• {f}</li>)}
                </ul>
              </button>
            ))}
          </div>

          <aside className="p-5 rounded-xl border border-slate-700 bg-slate-900/60">
            <h2 className="text-xl font-semibold mb-4">Create your account</h2>
            <div className="space-y-3">
              <input value={githubUsername} onChange={e => setGithubUsername(e.target.value)} className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700" placeholder="GitHub username" />
              <input value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700" placeholder="Email" />
              <button className="w-full px-4 py-2 rounded bg-purple-600 hover:bg-purple-500" onClick={async () => {
                const res = await fetch('/api/user', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'create', githubUsername, email }),
                });
                const data = await res.json();
                alert(data.referralLink ? `Referral link: ${data.referralLink}` : data.error || 'Created');
              }}>Create Account</button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="text-center mb-12">
        <div className="text-6xl mb-4">△</div>
        <h1 className="text-5xl font-bold mb-4 triforce-gradient">
          TriForce AI
        </h1>
        <p className="text-xl text-slate-400">
          Three AI builders • Free providers • Zero cost
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl w-full">
        <Link href="/builder/app" className="group p-6 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-purple-500 transition">
          <div className="text-3xl mb-3">🚀</div>
          <h2 className="text-xl font-semibold mb-2">App Builder</h2>
          <p className="text-sm text-slate-400">Generate complete web apps from natural language</p>
        </Link>

        <Link href="/builder/workflow" className="group p-6 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-orange-500 transition">
          <div className="text-3xl mb-3">⚡</div>
          <h2 className="text-xl font-semibold mb-2">Workflow Builder</h2>
          <p className="text-sm text-slate-400">Visual AI pipeline designer with AGI detection</p>
        </Link>

        <Link href="/builder/repair" className="group p-6 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-green-500 transition">
          <div className="text-3xl mb-3">🔧</div>
          <h2 className="text-xl font-semibold mb-2">Repo Repair</h2>
          <p className="text-sm text-slate-400">Self-healing code with AI-powered fixes</p>
        </Link>
      </div>

      {/* Secondary links */}
      <div className="flex flex-wrap justify-center gap-3 mt-8 text-sm">
        <Link href="/templates" className="px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-slate-600">📋 Templates</Link>
        <Link href="/history" className="px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-slate-600">📊 History</Link>
        <Link href="/status" className="px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-slate-600">🩺 Status</Link>
        <Link href="/pricing" className="px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-slate-600">💰 Pricing</Link>
        <Link href="/affiliate" className="px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-slate-600">🤝 Affiliate</Link>
        <Link href="/account" className="px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-slate-600">👤 Account</Link>
      </div>

      <div className="mt-12 flex flex-wrap justify-center gap-3 text-sm text-slate-500">
        <span>Powered by:</span>
        {['Groq', 'Mistral', 'GitHub Models', 'DeepSeek', 'Gemini'].map((p) => (
          <span key={p} className="px-2 py-1 bg-slate-900 rounded">{p}</span>
        ))}
      </div>
    </main>
  );
}

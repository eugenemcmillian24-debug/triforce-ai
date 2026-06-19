import Link from 'next/link';

export default function HomePage() {
  const builders = [
    { href: '/builder/app', icon: '🚀', title: 'App Builder', desc: 'Generate complete web apps from natural language', color: 'hover:border-purple-500' },
    { href: '/builder/workflow', icon: '⚡', title: 'Workflow Builder', desc: 'Visual AI pipeline designer with export', color: 'hover:border-orange-500' },
    { href: '/builder/repair', icon: '🔧', title: 'Repo Repair', desc: 'Self-healing code with PR creation', color: 'hover:border-green-500' },
  ];

  const tools = [
    { href: '/status', icon: '📊', title: 'Provider Status', desc: 'Live AI provider health' },
    { href: '/history', icon: '📜', title: 'Build History', desc: 'Your past builds' },
    { href: '/templates', icon: '📚', title: 'Templates', desc: 'Starter project library' },
    { href: '/settings', icon: '⚙️', title: 'Settings', desc: 'Configure providers' },
  ];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="text-center mb-12">
        <div className="text-6xl mb-4">△</div>
        <h1 className="text-5xl font-bold mb-4 triforce-gradient">TriForce AI</h1>
        <p className="text-xl text-slate-400">Three AI builders • Free providers • Zero cost</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl w-full mb-8">
        {builders.map(b => (
          <Link key={b.href} href={b.href} className={`group p-6 bg-slate-900/50 border border-slate-800 rounded-xl ${b.color} transition`}>
            <div className="text-3xl mb-3">{b.icon}</div>
            <h2 className="text-xl font-semibold mb-2">{b.title}</h2>
            <p className="text-sm text-slate-400">{b.desc}</p>
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-4 gap-4 max-w-5xl w-full">
        {tools.map(t => (
          <Link key={t.href} href={t.href} className="group p-4 bg-slate-900/30 border border-slate-800 rounded-lg hover:border-slate-600 transition text-center">
            <div className="text-2xl mb-2">{t.icon}</div>
            <h3 className="text-sm font-semibold mb-1">{t.title}</h3>
            <p className="text-xs text-slate-500">{t.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap justify-center gap-3 text-sm text-slate-500">
        <span>Powered by:</span>
        {['Groq', 'Mistral', 'GitHub Models'].map(p => (
          <span key={p} className="px-2 py-1 bg-slate-900 rounded">{p}</span>
        ))}
      </div>
    </main>
  );
}

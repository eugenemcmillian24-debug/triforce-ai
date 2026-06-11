import Link from 'next/link';

export default function BuilderPage() {
  const builders = [
    {
      id: 'app',
      title: '🚀 Full Stack App Builder',
      description: 'Generate complete web applications, APIs, and backends from natural language descriptions',
      href: '/builder/app',
    },
    {
      id: 'workflow',
      title: '⚡ Workflow Builder',
      description: 'Visual drag-and-drop builder for AI pipelines with multi-provider orchestration',
      href: '/builder/workflow',
    },
    {
      id: 'repair',
      title: '🔧 Repo Repair Builder',
      description: 'Self-healing repository diagnosis and automated repair pipeline',
      href: '/builder/repair',
    },
  ];

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-slate-400 hover:text-white mb-4 inline-block">
            ← Back
          </Link>
          <h1 className="text-4xl font-bold mt-4">Choose Your Builder</h1>
          <p className="text-slate-400 mt-2">
            Each builder is optimized for different tasks. All run on free-tier infrastructure.
          </p>
        </div>

        <div className="space-y-4">
          {builders.map((builder) => (
            <Link
              key={builder.id}
              href={builder.href}
              className="block p-6 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-purple-500 transition group"
            >
              <h2 className="text-2xl font-semibold mb-2 group-hover:text-purple-400 transition">
                {builder.title}
              </h2>
              <p className="text-slate-400">{builder.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Template {
  id: string;
  name: string;
  icon: string;
  description: string;
  prompt: string;
  framework: string;
  category: string;
}

const TEMPLATES: Template[] = [
  {
    id: 'saas',
    name: 'SaaS Starter',
    icon: '🏢',
    description: 'Multi-tenant SaaS with auth, dashboard, and billing',
    prompt: 'Build a multi-tenant SaaS platform with user authentication, a dashboard with analytics, subscription billing via Stripe, team management, and role-based access control.',
    framework: 'nextjs',
    category: 'Web App',
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce Store',
    icon: '🛒',
    description: 'Product catalog, cart, and checkout flow',
    prompt: 'Build an e-commerce store with product catalog, shopping cart, Stripe checkout, order tracking, and an admin panel for inventory management.',
    framework: 'nextjs',
    category: 'Web App',
  },
  {
    id: 'social',
    name: 'Social Feed',
    icon: '📱',
    description: 'Real-time social media feed with posts and comments',
    prompt: 'Build a social media app with real-time feed, post creation with image uploads, comments, likes, user profiles, and follow system.',
    framework: 'react',
    category: 'Web App',
  },
  {
    id: 'chatbot',
    name: 'AI Chatbot',
    icon: '🤖',
    description: 'Chat interface with streaming AI responses',
    prompt: 'Build an AI chatbot interface with streaming responses, conversation history, multiple model selection, and markdown rendering.',
    framework: 'nextjs',
    category: 'AI',
  },
  {
    id: 'kanban',
    name: 'Kanban Board',
    icon: '📋',
    description: 'Drag-and-drop project management board',
    prompt: 'Build a Kanban board app with drag-and-drop columns, task cards, labels, due dates, and real-time collaboration.',
    framework: 'react',
    category: 'Productivity',
  },
  {
    id: 'blog',
    name: 'Blog / CMS',
    icon: '✍️',
    description: 'Markdown blog with admin editor',
    prompt: 'Build a blog platform with markdown posts, categories, tags, search, an admin editor with live preview, and RSS feed.',
    framework: 'nextjs',
    category: 'Content',
  },
  {
    id: 'dashboard',
    name: 'Analytics Dashboard',
    icon: '📊',
    description: 'Data visualization with charts and filters',
    prompt: 'Build an analytics dashboard with interactive charts, date range filters, KPI cards, data tables with sorting, and CSV export.',
    framework: 'vue',
    category: 'Data',
  },
  {
    id: 'landing',
    name: 'Landing Page',
    icon: '🚀',
    description: 'High-converting marketing landing page',
    prompt: 'Build a high-converting SaaS landing page with hero section, feature cards, pricing tiers, testimonials, FAQ accordion, and email capture form.',
    framework: 'svelte',
    category: 'Marketing',
  },
  {
    id: 'api',
    name: 'REST API Server',
    icon: '🔌',
    description: 'CRUD API with auth and documentation',
    prompt: 'Build a REST API server with CRUD endpoints, JWT authentication, rate limiting, input validation, Swagger documentation, and database migrations.',
    framework: 'nextjs',
    category: 'Backend',
  },
  {
    id: 'realtime',
    name: 'Real-time Chat',
    icon: '💬',
    description: 'WebSocket chat with rooms and presence',
    prompt: 'Build a real-time chat application with WebSocket support, multiple rooms, online presence indicators, message history, and typing indicators.',
    framework: 'nextjs',
    category: 'Realtime',
  },
  {
    id: 'portfolio',
    name: 'Portfolio Site',
    icon: '🎨',
    description: 'Developer portfolio with projects showcase',
    prompt: 'Build a developer portfolio website with project showcase, skills section, contact form, dark mode toggle, and smooth animations.',
    framework: 'svelte',
    category: 'Personal',
  },
  {
    id: 'automation',
    name: 'Workflow Automation',
    icon: '⚡',
    description: 'No-code automation builder with triggers',
    prompt: 'Build a no-code automation platform with trigger configuration, action chains, scheduling, conditional logic, and execution logs.',
    framework: 'nextjs',
    category: 'Automation',
  },
];

export default function TemplatesPage() {
  const router = useRouter();
  const [filter, setFilter] = useState('All');

  const categories = ['All', ...Array.from(new Set(TEMPLATES.map(t => t.category)))];
  const filtered = filter === 'All' ? TEMPLATES : TEMPLATES.filter(t => t.category === filter);

  const useTemplate = (template: Template) => {
    localStorage.setItem('triforce-template', JSON.stringify(template));
    router.push(`/builder/app?template=${template.id}`);
  };

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-slate-400 hover:text-white mb-8 inline-block">← Home</Link>

        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-2">📚 Template Library</h1>
          <p className="text-xl text-slate-400">Start from a pre-built template</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(template => (
            <div
              key={template.id}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-purple-500 transition group"
            >
              <div className="text-4xl mb-3">{template.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
              <p className="text-sm text-slate-400 mb-4">{template.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-1 bg-slate-900 rounded text-slate-400">
                  {template.framework} · {template.category}
                </span>
                <button
                  onClick={() => useTemplate(template)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium"
                >
                  Use →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

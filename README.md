# TriForce AI Platform

> Three AI builders sharing one universal free-tier pipeline

## Quick Start

```bash
# Install dependencies
bun install

# Start development server
cd apps/web && bun dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
triforce-ai/
├── apps/
│   └── web/          # Next.js 15 app
│       ├── src/app/
│       │   ├── builder/app/      # App Builder
│       │   ├── builder/workflow/ # Workflow Builder
│       │   └── builder/repair/   # Repo Repair Builder
│       └── package.json
├── packages/
│   ├── ai-core/      # AI provider abstraction
│   │   └── src/
│   │       ├── types.ts          # Type definitions
│   │       ├── rate-limiter.ts   # Rate limit tracking
│   │       ├── agi-detector.ts   # AGI detection
│   │       ├── fallback.ts       # Fallback cascade
│   │       ├── router.ts         # Provider routing
│   │       └── providers/        # 15 provider configs
│   └── shared-ui/     # Shared React components
└── package.json      # Monorepo root
```

## Features

- **Full Stack App Builder**: Generate complete web applications
- **AGI Workflow Builder**: Visual drag-and-drop AI pipelines
- **Repo Repair Builder**: AI-powered code review and repair

## AI Providers (15 Free Tiers)

Groq, OpenRouter, Mistral, HuggingFace, GitHub Models, Google Gemini, Cerebras,
NVIDIA NIM, Cohere, Together, DeepSeek, Zhipu, AiML, Cloudflare AI, SambaNova

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Bun

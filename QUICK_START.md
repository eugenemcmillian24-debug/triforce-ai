# TriForce AI — 5-Minute Setup Guide

## ⚡ Quick Start

```bash
# 1. Clone and setup
cd /home/workspace/triforce-ai
bun install

# 2. Configure environment
cp .env.template apps/web/.env.local
nano apps/web/.env.local  # Add your API keys

# 3. Start developing
cd apps/web
bun dev
```

Visit: **http://localhost:3000**

---

## 🔑 Required API Keys (FREE)

### Minimum Setup (Test Mode)
You only need **1 API key** to test the platform:

| Provider | Free Tier | Time to Get | Link |
|----------|-----------|-------------|------|
| **Groq** | 500K tokens/week | 2 min | [Get Key](https://console.groq.com/keys) |

### Recommended Setup (Full Features)
Add these 3 providers for best performance:

1. **Groq** — Fast code generation
   - Free: 500K tokens/week
   - Get: https://console.groq.com/keys
   - Add to `.env.local`: `GROQ_API_KEY=gsk_...`

2. **Google Gemini** — Deep research (1M context!)
   - Free: ~1M tokens/day
   - Get: https://aistudio.google.com/apikey
   - Add to `.env.local`: `GOOGLE_API_KEY=AIza_...`

3. **Cerebras** — Fast reasoning
   - Free: 1M tokens/week
   - Get: https://cloud.cerebras.ai
   - Add to `.env.local`: `CEREBRAS_API_KEY=csk_...`

---

## 📁 Project Structure

```
triforce-ai/
├── apps/web/              ← Next.js web app
│   ├── src/app/           ← Pages & API routes
│   ├── .env.local        ← Your API keys (create this)
│   └── package.json
├── packages/ai-core/     ← AI provider abstraction
├── .env.template         ← Copy this to start
└── setup.sh              ← Automated setup script
```

---

## 🚀 What You Can Build

### 1. App Builder (`/builder/app`)
Generate complete applications:
- Next.js 15 apps
- React + Vite projects
- APIs with authentication
- Full-stack features

**Example Prompt:**
```
Build a SaaS dashboard with:
- User authentication
- Analytics charts
- Stripe payments
- Email notifications
```

### 2. Workflow Builder (`/builder/workflow`)
Drag-and-drop AI pipelines:
- Multi-step AI workflows
- Provider chaining
- AGI detection
- Real-time execution

### 3. Repo Repair (`/builder/repair`)
Automated code fixes:
- Git repository analysis
- Security vulnerability detection
- Dependency updates
- Code refactoring

---

## 🧪 Testing Features

### Test App Builder
```bash
curl -X POST http://localhost:3000/api/build \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Build a simple todo app with Next.js",
    "framework": "nextjs",
    "features": ["auth", "database"]
  }'
```

### Test Workflow Builder
```bash
curl -X POST http://localhost:3000/api/workflow \
  -H "Content-Type: application/json" \
  -d '{
    "nodes": [
      {"type": "prompt", "data": "Summarize this"},
      {"type": "ai", "provider": "groq"},
      {"type": "output"}
    ]
  }'
```

### Test Repo Repair
```bash
curl -X POST http://localhost:3000/api/repair \
  -H "Content-Type: application/json" \
  -d '{
    "repoUrl": "https://github.com/user/repo",
    "description": "Fix security vulnerabilities"
  }'
```

---

## 🎯 Next Steps

1. **Add API Keys** → Edit `apps/web/.env.local`
2. **Test Builders** → Visit each builder page
3. **Add More Providers** → See `.env.template` for all options
4. **Deploy** → See `DEPLOYMENT_CHECKLIST.md`

---

## 🐛 Troubleshooting

### "API key not found"
```bash
# Check your .env.local file
cat apps/web/.env.local | grep API_KEY
```

### "Build failed"
```bash
# Clear cache and rebuild
cd apps/web
rm -rf .next node_modules
bun install
bun run build
```

### "Port 3000 in use"
```bash
# Use a different port
bun dev --port 3001
```

---

## 📚 Full Documentation

- `FINAL_DELIVERY.md` — Complete feature list
- `DEPLOYMENT_CHECKLIST.md` — Production deployment
- `ARCHITECTURE_DIAGRAM.md` — System architecture
- `.env.template` — All environment variables

---

**Need help?** Check the docs or open an issue on GitHub.

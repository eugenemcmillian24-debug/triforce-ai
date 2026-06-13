# Cloudflare Pages Deployment - TriForce AI

## 🚀 Quick Deploy (5 minutes)

### Step 1: Create Cloudflare Pages Project

1. Go to: https://dash.cloudflare.com/?to=/:account/pages
2. Click **"Create a project"**
3. Select **"Connect to Git"**
4. Choose **GitHub** and authenticate
5. Select repository: **eugenemcmillian24-debug/triforce-ai**
6. Configure build settings:
   - **Project name**: `triforce-ai`
   - **Production branch**: `main`
   - **Framework preset**: `Next.js (Static HTML Export)`
   - **Build command**: `cd apps/web && bun install && bun run build`
   - **Build output directory**: `apps/web/.next`

### Step 2: Add Environment Variables

In Cloudflare Pages Settings → Environment variables, add:

#### Required (Minimum):
```bash
GROQ_API_KEY=your_groq_key_here
GOOGLE_API_KEY=your_google_key_here
CEREBRAS_API_KEY=your_cerebras_key_here
```

#### Recommended:
```bash
OPENROUTER_API_KEY=your_openrouter_key_here
DEEPSEEK_API_KEY=your_deepseek_key_here
MISTRAL_API_KEY=your_mistral_key_here
HUGGINGFACE_API_KEY=your_huggingface_key_here
NVIDIA_API_KEY=your_nvidia_key_here
GITHUB_TOKEN=your_github_token_here
```

### Step 3: Deploy

Click **"Save and Deploy"**

Cloudflare will:
1. Clone your repo
2. Install dependencies
3. Build the Next.js app
4. Deploy to: **https://triforce-ai.pages.dev**

---

## 📋 Alternative: Manual Deployment

If you prefer to deploy from the command line:

### Prerequisites:
1. API token with correct permissions:
   - Account → Cloudflare Pages → Edit
   - User → User Details → Read
   - Zone → DNS → Edit (if using custom domain)

2. Get your API token from:
   https://dash.cloudflare.com/profile/api-tokens

### Deploy Command:
```bash
# Install Wrangler
npm install -g wrangler

# Login (interactive)
wrangler login

# Or use API token
export CLOUDFLARE_API_TOKEN=your_token_here

# Build
cd apps/web
bun run build

# Deploy
cd ../..
wrangler pages deploy apps/web/.next --project-name=triforce-ai
```

---

## 🌐 Custom Domain Setup

### Step 1: Add Custom Domain
1. Go to your Pages project → Custom domains
2. Click **"Set up a custom domain"**
3. Enter: `triforce-ai.yourdomain.com`

### Step 2: Update DNS
Cloudflare will provide DNS instructions:
- Type: `CNAME`
- Name: `triforce-ai`
- Value: `triforce-ai.pages.dev`

---

## ⚡ Performance Optimizations

Cloudflare automatically provides:
- ✅ Global CDN (300+ locations)
- ✅ Automatic HTTPS
- ✅ DDoS protection
- ✅ Auto-minification
- ✅ Brotli compression
- ✅ HTTP/3 support

---

## 📊 Monitoring

View analytics at:
https://dash.cloudflare.com/[account-id]/pages/view/triforce-ai

Metrics include:
- Requests per minute
- Bandwidth usage
- Error rates
- Build history

---

## 🔧 Troubleshooting

### Build Fails
```bash
# Check build locally
cd apps/web
bun run build

# Common issues:
# - Missing env vars → Add to Cloudflare
# - Dependency issues → Check package.json
# - Next.js config → Check next.config.mjs
```

### Environment Variables Not Working
- Ensure they're added to **Production** AND **Preview** environments
- Restart deployment after adding variables

### 404 on Routes
- Next.js App Router requires special Cloudflare config
- May need to add `_routes.json` for SPA routing

---

## ✅ Success Checklist

After deployment, verify:
- [ ] Homepage loads: https://triforce-ai.pages.dev
- [ ] App Builder works: /builder/app
- [ ] Workflow Builder loads: /builder/workflow
- [ ] Repo Repair loads: /builder/repair
- [ ] Environment variables set (check console for errors)
- [ ] All API routes respond correctly
- [ ] Custom domain (if configured) works

---

## 🎉 You're Live!

**Your TriForce AI Platform is now running on Cloudflare's global network!**

URL: https://triforce-ai.pages.dev

# TriForce AI Deployment Options

## ✅ Current Status

**GitHub Repository**: https://github.com/eugenemcmillian24-debug/triforce-ai

**Environment Variables Verified** ✅
- GROQ_API_KEY
- GOOGLE_API_KEY
- CEREBRAS_API_KEY
- OPENROUTER_API_KEY
- DEEPSEEK_API_KEY
- MISTRAL_API_KEY
- HUGGINGFACE_API_KEY
- NVIDIA_API_KEY
- GITHUB_TOKEN
- CLOUDFLARE_ACCOUNT_ID
- CLOUDFLARE_API_TOKEN

---

## 🚀 Option 1: Cloudflare Pages (RECOMMENDED)

### Quick Deploy Steps:

1. **Go to Cloudflare Dashboard**
   - URL: https://dash.cloudflare.com
   - Account: `Eugenemcmillian24@gmail.com's Account`
   - Account ID: `74cf267b12528e23cdd86015c26b1c7a`

2. **Create Pages Project**
   - Navigate to: Workers & Pages → Create application → Pages → Connect to Git
   - Select repository: `eugenemcmillian24-debug/triforce-ai`
   - Framework preset: `Next.js (Static HTML Export)`

3. **Configure Build Settings**
   ```
   Build command: cd apps/web && bun install && bun run build
   Build output directory: apps/web/.next
   Root directory: /
   ```

4. **Add Environment Variables**
   - In Pages project → Settings → Environment variables
   - Add all API keys from your Zo secrets

5. **Deploy**
   - Click "Save and Deploy"
   - URL will be: `https://triforce-ai.pages.dev`

---

## 🚀 Option 2: Vercel (EASIEST)

### Deploy in 1 Click:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
cd /home/workspace/triforce-ai/apps/web
vercel --prod
```

### Or connect via GitHub:
1. Go to: https://vercel.com/new
2. Import repository: `eugenemcmillian24-debug/triforce-ai`
3. Framework: Next.js
4. Deploy!

**Estimated time**: 2 minutes
**URL**: `https://triforce-ai.vercel.app`

---

## 🚀 Option 3: Netlify

### Deploy Steps:

1. Go to: https://app.netlify.com/start
2. Connect GitHub repository
3. Configure:
   ```
   Build command: cd apps/web && bun install && bun run build
   Publish directory: apps/web/.next
   ```
4. Add environment variables
5. Deploy

**URL**: `https://triforce-ai.netlify.app`

---

## 🎯 RECOMMENDATION

**Use Cloudflare Pages** because:
- ✅ Already have Cloudflare account
- ✅ Free tier includes unlimited bandwidth
- ✅ Fast global CDN
- ✅ Easy environment variable management
- ✅ Automatic deployments on git push

---

## 📝 Post-Deployment Checklist

After deploying, verify:

1. **Homepage loads**: `https://your-domain.com`
2. **App Builder works**: Navigate to `/builder/app`
3. **API routes respond**: Test `/api/build` endpoint
4. **Environment variables**: Check console for API key errors
5. **Add custom domain** (optional)

---

## 🔧 Troubleshooting

### Build fails?
- Ensure all environment variables are set
- Check build logs for specific errors
- Verify Node.js version compatibility

### API routes not working?
- Cloudflare Pages requires Functions for dynamic routes
- Consider using Cloudflare Workers for API endpoints
- Or use Vercel/Netlify for easier API support

### Environment variables missing?
- Add in Cloudflare: Pages → Settings → Environment variables
- Or use `.env.local` file (not recommended for production)

# Cloudflare API Token Permissions Guide

## ❌ Current Status
Your token lacks the required permissions for deployment.

## ✅ Required Permissions for Cloudflare Pages Deployment

### Option 1: Create a New API Token (Recommended)

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click **"Create Token"**
3. Use the **"Edit Cloudflare Workers"** template (recommended)
4. Or create custom token with these permissions:

```
Account Settings:
  ✅ Cloudflare Pages: Edit
  ✅ Workers Scripts: Edit
  ✅ Workers KV Storage: Edit
  ✅ D1: Edit
  
Zone Settings:
  ✅ Zone: Read
  ✅ DNS: Edit (if using custom domain)

Account Resources:
  ✅ Include: All accounts (or select specific account)

Zone Resources:
  ✅ Include: All zones (or select specific zone)
```

### Option 2: Use Global API Key (Not Recommended)

If you prefer, you can use your Global API Key instead:

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Find **"Global API Key"** section
3. Click **"View"** and copy

⚠️ **Warning**: Global API Key has full access to all Cloudflare services.

## 🔧 After Creating the Token

Save it to your Zo secrets:

1. Go to: [Settings > Advanced](/?t=settings&s=advanced)
2. Add new secret:
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: `your_new_token_here`

## 📋 Permission Checklist

Run this to verify your token permissions:

```bash
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "result": {
    "id": "...",
    "status": "active"
  }
}
```

## 🚀 Alternative: Direct Dashboard Deployment

If you prefer not to deal with API tokens, you can deploy directly from the Cloudflare dashboard:

### Step-by-Step Dashboard Deployment

1. **Go to Cloudflare Pages**
   - Visit: https://dash.cloudflare.com
   - Navigate to: Workers & Pages > Create application > Pages

2. **Connect GitHub Repository**
   - Click **"Connect to Git"**
   - Select **"GitHub"**
   - Authorize Cloudflare to access your GitHub
   - Select repository: `eugenemcmillian24-debug/triforce-ai`

3. **Configure Build Settings**
   - Project name: `triforce-ai`
   - Production branch: `main`
   - Build command: `cd apps/web && bun install && bun run build`
   - Build output directory: `apps/web/.next`
   - Root directory: `/`

4. **Add Environment Variables**
   Click **"Add variable"** for each:
   ```
   GROQ_API_KEY = your_groq_key
   GOOGLE_API_KEY = your_google_key
   CEREBRAS_API_KEY = your_cerebras_key
   OPENROUTER_API_KEY = your_openrouter_key
   DEEPSEEK_API_KEY = your_deepseek_key
   MISTRAL_API_KEY = your_mistral_key
   HUGGINGFACE_API_KEY = your_huggingface_key
   NVIDIA_API_KEY = your_nvidia_key
   GITHUB_TOKEN = your_github_token
   ```

5. **Deploy**
   - Click **"Save and Deploy"**
   - Wait 2-3 minutes for build to complete
   - Your site will be live at: `https://triforce-ai.pages.dev`

## 📊 Quick Comparison

| Method | Difficulty | Security | Features |
|--------|-----------|----------|----------|
| API Token | Medium | ✅ High | Full CLI control |
| Dashboard | Easy | ✅ Good | Visual interface |
| Global Key | Easy | ❌ Low | Full access (risky) |

## 🎯 Recommendation

**Use the Dashboard method** - it's the easiest and most reliable for first deployment. You can set up CLI/API automation later once everything is working.

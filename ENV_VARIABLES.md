# TriForce AI — Environment Variables Reference

## 📋 Complete Environment Variable List

Copy to `.env.local` in the `apps/web/` directory.

---

## 🔥 Tier 1 — Highly Recommended FREE Providers

### Groq (Ultra-fast inference)
```bash
GROQ_API_KEY=gsk_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
- Free tier: 500,000 tokens/week
- Get key: https://console.grov鼻炎.com/keys
- Models: llama-3.3-70b-versatile, llama-3.1-8b-instant

### Google Gemini (Massive 1M context)
```bash
GOOGLE_API_KEY=AIzXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
- Free tier: ~1M tokens/day
- Get key: https://aistudio.google.com/apikey
- Models: gemini-2.0-flash-exp (experimental)

### Cerebras (Fast reasoning)
```bash
CEREBRAS_API_KEY=csk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
- Free tier: 1M tokens/week
- Get key: https://cloud.cerebras.ai
- Models: llama-3.3-70b

---

## ⚡ Tier 2 — Additional FREE Providers

### OpenRouter (Access to 100+ models)
```bash
OPENROUTER_API_KEY=sk-or-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
- Free tier: Varies by model
- Get key: https://openrouter.ai/keys
- Models: deepseek/deepseek-r1, meta-llama/llama-3.3-70b-instruct

### DeepSeek (Reasoning specialist)
```bash
DEEPSEEK_API_KEY=sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
- Free tier: 1M tokens/month
- Get key: https://platform.deepseek.com/api-keys
- Models: deepseek-reasoner, deepseek-chat

### Mistral AI (Code generation)
```bash
MISTRAL_API_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
- Free tier: 1M tokens/month
- Get key: https://console.mistral.ai/api-keys
- Models: codestral-latest, mistral-large-latest

---

## 🚀 Tier 3 — Enterprise FREE Tiers

### NVIDIA NIM
```bash
NVIDIA_NIM_API_KEY=nvapi-XXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
- Free tier: 5K tokens/month
- Get key: https://build.nvidia.com
- Models: nvidia/llama-3.1-nemotron-ultra-253b-v1

### GitHub Models
```bash
GITHUB_TOKEN=YOUR_TOKEN_HERE
```
- Free tier: 15 req/min
- Get key: https://github.com/settings/tokens
- Models: gpt-4.1, gpt-4.1-mini

### Hugging Face
```bash
HUGGINGFACE_API_KEY=hf_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
- Free tier: 30K chars/month
- Get key: https://huggingface.co/settings/tokens
- Models: meta-llama/Llama-3.3-70B-Instruct

### Cloudflare Workers AI
```bash
CLOUDFLARE_API_TOKEN=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
CLOUDFLARE_ACCOUNT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
- Free tier: 10K requests/day
- Get token: https://dash.cloudflare.com/profile/api-tokens
- Models: @cf/meta/llama-3.3-70b-instruct-fp8-fast

---

## 🔧 Additional Providers

### Cohere (Embeddings + Generation)
```bash
COHERE_API_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
- Free tier: 1M tokens/month
- Get key: https://dashboard.cohere.ai/api-keys

### Together AI
```bash
TOGETHER_API_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
- Free trial: $25 credit
- Get key: https://api.together.xyz/settings/api-keys

### Zhipu AI (中文优化)
```bash
ZHIPU_API_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
- Free tier: 1M tokens/month
- Get key: https://open.bigmodel.cn/api-keys

### AiML
```bash
AIML_API_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
- Free tier: Limited daily requests
- Get key: https://aiml.io/dashboard/api-keys

### SambaNova
```bash`
SAMBANOVA_API_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
- Free tier: Available upon request
- Get key: https://cloud.sambanova.ai

---

## 📝 How to Set Up

### 1. Create the env file
```bash
cd /home/workspace/triforce-ai/apps/web
cp ../../.env.example .env.local
```

### 2. Add your keys
Edit `.env.local` with your actual API keys:
```bash
nano .env.local
# or
code .env.local
```

### 3. Minimum Required for Testing
To test the platform with all three builders, you need at least:

**Minimum 1 provider** (recommended: Groq)
```bash
GROQ_API_KEY=gsk_your_key_here
```

**Recommended 3 providers** for full functionality:
```bash
GROQ_API_KEY=gsk_...
GOOGLE_API_KEY=AIza...
CEREBRAS_API_KEY=csk-...
```

---

## 🔒 Security Best Practices

1. **Never commit** `.env.local` to git
2. **Use environment-specific keys** for production
3. **Rotate keys periodically**
4. **Monitor usage** via each provider's dashboard

---

## 📊 Provider Comparison

| Provider | Context | Speed | Free Tier | Best For |
|----------|---------|-------|-----------|----------|
| Groq | 131K | Ultra-fast | 500K/wk | Code generation, chat |
| Google Gemini | 1M | Fast | 1M/day | Research, long context |
| Cerebras | 131K | Fast | 1M/wk | Reasoning, analysis |
| DeepSeek | 128K | Medium | 1M/mo | Reasoning, code review |
| Mistral | 128K | Fast | 1M/mo | Code generation |

---

## 🚨 Troubleshooting

### "API key not configured" warning
Platform will work but return mock responses. Add keys to enable real AI responses.

### Rate limit errors
Platform automatically falls back to next available provider.

### Key not working
1. Verify key format (check for extra spaces)
2. Check if key has correct permissions
3. Verify account isn't suspended

---

## ✅ All Providers Status

Run this to test your configuration:
```bash
bun run test:providers
```

Will output:
```
✓ Groq: Connected (131K context available)
✓ Google Gemini: Connected (1M context available)
✗ Cerebras: Not configured (add CEREBRAS_API_KEY to enable)
```

---

**Total: 15 Free AI Providers Supported**

Mix and match to stay within free tiers while maximizing capability!

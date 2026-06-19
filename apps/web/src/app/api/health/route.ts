import { NextResponse } from 'next/server';

export const runtime = 'edge';

const PROVIDERS = {
  groq: {
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
    envKey: 'GROQ_API_KEY',
    free: '500K tokens/week',
  },
  mistral: {
    name: 'Mistral',
    baseUrl: 'https://api.mistral.ai/v1',
    models: ['mistral-small-latest', 'mistral-large-latest'],
    envKey: 'MISTRAL_API_KEY',
    free: '1M tokens/month',
  },
  github: {
    name: 'GitHub Models',
    baseUrl: 'https://models.inference.ai.azure.com',
    models: ['gpt-4o-mini', 'gpt-4o'],
    envKey: 'GITHUB_TOKEN',
    free: '15 req/min',
  },
} as const;

export async function GET() {
  const results = await Promise.all(
    Object.entries(PROVIDERS).map(async ([id, config]) => {
      const apiKey = process.env[config.envKey];
      const hasKey = !!apiKey;

      let status = 'unconfigured';
      let latency = 0;

      if (hasKey) {
        const start = Date.now();
        try {
          const response = await fetch(`${config.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: config.models[0],
              messages: [{ role: 'user', content: 'ping' }],
              max_tokens: 1,
            }),
            signal: AbortSignal.timeout(8000),
          });
          latency = Date.now() - start;
          status = response.ok ? 'operational' : response.status === 429 ? 'rate-limited' : 'error';
        } catch {
          latency = Date.now() - start;
          status = 'timeout';
        }
      }

      return {
        id,
        name: config.name,
        status,
        latency: `${latency}ms`,
        models: config.models,
        freeTier: config.free,
        configured: hasKey,
      };
    })
  );

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    providers: results,
    operational: results.filter(p => p.status === 'operational').length,
    total: results.length,
  });
}

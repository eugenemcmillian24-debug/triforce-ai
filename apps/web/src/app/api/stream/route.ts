import { NextRequest } from 'next/server';

export const runtime = 'edge';

const PROVIDERS = {
  groq: {
    baseUrl: 'https://api.groq.com/openai/v1',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
    envKey: 'GROQ_API_KEY',
  },
  mistral: {
    baseUrl: 'https://api.mistral.ai/v1',
    models: ['mistral-small-latest', 'mistral-large-latest'],
    envKey: 'MISTRAL_API_KEY',
  },
  github: {
    baseUrl: 'https://models.inference.ai.azure.com',
    models: ['gpt-4o-mini', 'gpt-4o'],
    envKey: 'GITHUB_TOKEN',
  },
} as const;

type ProviderId = keyof typeof PROVIDERS;

interface StreamBody {
  prompt: string;
  builderType: string;
  agiMode?: boolean;
  framework?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: StreamBody = await request.json();
    const { prompt, agiMode = false, framework = 'nextjs' } = body;

    if (!prompt || prompt.length < 10) {
      return new Response(JSON.stringify({ error: 'Prompt too short' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const stages = agiMode
      ? [
          { name: '🔍 Research', provider: 'mistral' as ProviderId, model: 'mistral-large-latest', system: 'You are a research analyst.' },
          { name: '🏗️ Architecture', provider: 'groq' as ProviderId, model: 'llama-3.3-70b-versatile', system: 'You are a system architect.' },
          { name: '💻 Code Generation', provider: 'groq' as ProviderId, model: 'llama-3.1-8b-instant', system: 'You are a senior developer.' },
          { name: '🔬 Review', provider: 'github' as ProviderId, model: 'gpt-4o', system: 'You are a code reviewer.' },
          { name: '✨ Polish', provider: 'mistral' as ProviderId, model: 'mistral-small-latest', system: 'You refine and finalize.' },
        ]
      : [
          { name: '🏗️ Architecture', provider: 'groq' as ProviderId, model: 'llama-3.3-70b-versatile', system: 'You are a system architect.' },
          { name: '💻 Code Generation', provider: 'groq' as ProviderId, model: 'llama-3.1-8b-instant', system: 'You are a senior developer.' },
        ];

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: any) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        };

        send('start', { totalStages: stages.length, agiMode });

        let accumulated = '';

        for (let i = 0; i < stages.length; i++) {
          const stage = stages[i]!;
          send('stage', { index: i, name: stage.name, provider: stage.provider, model: stage.model });

          const config = PROVIDERS[stage.provider];
          const apiKey = process.env[config.envKey];

          if (!apiKey) {
            send('error', { stage: i, message: `${stage.provider} API key not configured` });
            continue;
          }

          try {
            const response = await fetch(`${config.baseUrl}/chat/completions`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: stage.model,
                messages: [
                  { role: 'system', content: stage.system },
                  {
                    role: 'user',
                    content:
                      i === 0
                        ? `App: ${prompt}\nFramework: ${framework}\nProvide architecture and file structure.`
                        : `Based on: ${accumulated.slice(0, 1000)}\n\nGenerate production code for: ${prompt}\nFramework: ${framework}`,
                  },
                ],
                temperature: 0.7,
                max_tokens: 4096,
                stream: true,
              }),
            });

            if (!response.ok || !response.body) {
              send('error', { stage: i, message: `${stage.provider} returned ${response.status}` });
              continue;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let stageOutput = '';

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const text = decoder.decode(value);
              const lines = text.split('\n').filter(l => l.startsWith('data: '));

              for (const line of lines) {
                const json = line.slice(6).trim();
                if (json === '[DONE]') continue;
                try {
                  const parsed = JSON.parse(json);
                  const delta = parsed.choices?.[0]?.delta?.content || '';
                  if (delta) {
                    stageOutput += delta;
                    send('token', { stage: i, text: delta });
                  }
                } catch {
                  // skip malformed chunks
                }
              }
            }

            accumulated += `\n\n--- ${stage.name} ---\n${stageOutput}`;
            send('stageComplete', { index: i, name: stage.name, outputLength: stageOutput.length });
          } catch (err) {
            send('error', { stage: i, message: err instanceof Error ? err.message : 'Stage failed' });
          }
        }

        send('complete', { totalStages: stages.length, agiMode });
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Stream failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

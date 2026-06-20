import { NextRequest, NextResponse } from 'next/server';

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

async function callProvider(prompt: string, systemPrompt: string, preferred?: ProviderId): Promise<string> {
  const chain: ProviderId[] = preferred
    ? [preferred, ...(Object.keys(PROVIDERS) as ProviderId[]).filter(p => p !== preferred)]
    : Object.keys(PROVIDERS) as ProviderId[];

  for (const providerId of chain) {
    const config = PROVIDERS[providerId];
    const apiKey = process.env[config.envKey];
    if (!apiKey) continue;

    try {
      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.models[0],
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          temperature: 0.5,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) continue;
      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } catch {
      continue;
    }
  }
  throw new Error('All providers failed');
}

async function generateProjectFiles(prompt: string, framework: string): Promise<Array<{ path: string; content: string }>> {
  const fileGenPrompt = `Generate a complete, production-ready ${framework} project for this app:

${prompt}

Output ONLY valid JSON with this structure (no markdown, no explanation):
{
  "files": [
    {"path": "package.json", "content": "..."},
    {"path": "src/index.ts", "content": "..."}
  ]
}

Include: package.json, main entry files, at least 3 source files, a README.md.
Make the code complete and runnable.`;

  const codeJson = await callProvider(
    fileGenPrompt,
    'You output ONLY valid JSON. No markdown fences, no explanations.',
    'groq'
  );

  let files: Array<{ path: string; content: string }> = [];
  try {
    const cleaned = codeJson.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);
    files = parsed.files || parsed || [];
  } catch {
    files = [
      { path: 'README.md', content: `# Generated App\n\n${prompt}\n\n## AI Output\n\n${codeJson}` },
      { path: 'prompt.txt', content: prompt },
    ];
  }

  if (!Array.isArray(files)) files = [{ path: 'output.txt', content: String(files) }];
  return files;
}

// POST — returns file manifest as JSON (for the download button)
export async function POST(request: NextRequest) {
  try {
    const { prompt, framework = 'nextjs' } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt required' }, { status: 400 });
    }

    const files = await generateProjectFiles(prompt, framework);

    return NextResponse.json({
      success: true,
      files,
      fileCount: files.length,
      totalSize: files.reduce((sum, f) => sum + f.content.length, 0),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Download generation failed' },
      { status: 500 }
    );
  }
}

// GET — generates files and returns them as a downloadable .txt bundle
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const prompt = searchParams.get('prompt');
    const framework = searchParams.get('framework') || 'nextjs';

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt query parameter required' }, { status: 400 });
    }

    const files = await generateProjectFiles(prompt, framework);

    // Build a real, downloadable text bundle (file separators)
    const bundle = files
      .map((f) => `=== FILE: ${f.path} ===\n${f.content}\n`)
      .join('\n');

    return new Response(bundle, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="triforce-build-${Date.now()}.txt"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Download generation failed' },
      { status: 500 }
    );
  }
}

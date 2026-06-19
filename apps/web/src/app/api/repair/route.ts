import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Only working providers (verified 2026-06-19)
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

// Provider preference order for each stage (with fallback)
const PROVIDER_CHAIN: ProviderId[] = ['groq', 'mistral', 'github'];

async function callProvider(
  prompt: string,
  systemPrompt?: string,
  preferredProvider?: ProviderId
): Promise<{ content: string; provider: ProviderId; model: string }> {
  const chain: ProviderId[] = preferredProvider
    ? [preferredProvider, ...PROVIDER_CHAIN.filter(p => p !== preferredProvider)]
    : PROVIDER_CHAIN;

  const messages: Array<{ role: string; content: string }> = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  let lastError: Error | null = null;

  for (const providerId of chain) {
    const config = PROVIDERS[providerId];
    const apiKey = process.env[config.envKey];

    if (!apiKey) {
      continue;
    }

    const model = config.models[0];

    try {
      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        lastError = new Error(`${providerId} API error: ${response.status} ${errText.slice(0, 200)}`);
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        lastError = new Error(`${providerId} returned empty content`);
        continue;
      }

      return { content, provider: providerId, model };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      continue;
    }
  }

  throw lastError ?? new Error('All providers failed (no API keys configured)');
}

export async function POST(request: NextRequest) {
  try {
    const { repoUrl, description, branch = 'main' } = await request.json();

    if (!repoUrl) {
      return NextResponse.json({ error: 'Repository URL required' }, { status: 400 });
    }

    const reportId = `repair-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const repoName = repoUrl.split('/').slice(-2).join('/');

    const providersUsed: ProviderId[] = [];
    const trackProvider = (p: ProviderId) => {
      if (!providersUsed.includes(p)) providersUsed.push(p);
    };

    // Stage 1: Structure Analysis (prefer Groq — fast)
    const structurePrompt = `Analyze the repository: ${repoUrl}
Description: ${description || 'General health check'}
Branch: ${branch}

Provide:
1. Repository structure overview
2. Main technologies detected
3. Architecture patterns identified
4. Initial health assessment`;

    const stage1 = await callProvider(
      structurePrompt,
      'You are a code architect analyzing repository structure.',
      'groq'
    );
    trackProvider(stage1.provider);
    const structureAnalysis = stage1.content;

    // Stage 2: Deep Assessment (prefer Mistral — strong reasoning)
    const deepPrompt = `Based on repository: ${repoName}

Previous analysis:
${structureAnalysis}

Provide a detailed code review covering:
1. Code quality issues (5-10 specific issues)
2. Potential bugs or logic errors
3. Performance concerns
4. Best practice violations
5. Recommendations for improvement`;

    const stage2 = await callProvider(
      deepPrompt,
      'You are a senior developer conducting a thorough code review.',
      'mistral'
    );
    trackProvider(stage2.provider);
    const deepAnalysis = stage2.content;

    // Stage 3: Security Scan (prefer GitHub Models — gpt-4o-mini)
    const securityPrompt = `Repository: ${repoName}

Known issues: ${deepAnalysis}

Perform a security audit identifying:
1. Potential vulnerabilities (OWASP Top 10)
2. Dependency risks
3. Authentication/authorization issues
4. Data exposure risks
5. Recommended fixes`;

    const stage3 = await callProvider(
      securityPrompt,
      'You are a security expert identifying vulnerabilities.',
      'github'
    );
    trackProvider(stage3.provider);
    const securityAnalysis = stage3.content;

    // Stage 4: Priority Fixes (prefer Groq for speed)
    const priorityPrompt = `Based on the following analyses, provide 5 specific, actionable fixes with code examples:

Structure: ${structureAnalysis.slice(0, 500)}
Deep Analysis: ${deepAnalysis.slice(0, 500)}
Security: ${securityAnalysis.slice(0, 500)}

Format each fix as:
## Fix #N: [Title]
**Priority**: Critical|High|Medium
**Issue**: [Description]
**Solution**: [Code example or detailed steps]`;

    const stage4 = await callProvider(
      priorityPrompt,
      'You are a senior developer providing specific, actionable code fixes.',
      'groq'
    );
    trackProvider(stage4.provider);
    const priorityFixes = stage4.content;

    // Stage 5: Summary (prefer Groq instant — fastest)
    const summaryPrompt = `Summarize this repository diagnostic in 2-3 sentences:\n\n${priorityFixes}`;

    const stage5 = await callProvider(summaryPrompt, undefined, 'groq');
    trackProvider(stage5.provider);
    const summary = stage5.content;

    return NextResponse.json({
      reportId,
      repoUrl,
      repoName,
      branch,
      timestamp: new Date().toISOString(),
      status: 'completed',
      stages: {
        structure: {
          status: 'completed',
          provider: stage1.provider,
          model: stage1.model,
          summary: structureAnalysis.slice(0, 200) + '...',
          full: structureAnalysis,
        },
        assessment: {
          status: 'completed',
          provider: stage2.provider,
          model: stage2.model,
          summary: deepAnalysis.slice(0, 200) + '...',
          full: deepAnalysis,
        },
        security: {
          status: 'completed',
          provider: stage3.provider,
          model: stage3.model,
          summary: securityAnalysis.slice(0, 200) + '...',
          full: securityAnalysis,
        },
      },
      priorityFixes,
      summary,
      metadata: {
        providersUsed,
        totalStages: 5,
        fallbackEnabled: true,
      },
    });
  } catch (error) {
    console.error('Repair error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Repair failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reportId = searchParams.get('id');

  if (!reportId) {
    return NextResponse.json({ error: 'Report ID required' }, { status: 400 });
  }

  return NextResponse.json({
    reportId,
    status: 'completed',
    message: 'Report storage not implemented in demo. Check response from POST for full diagnostic.',
  });
}

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// AI provider configurations
const PROVIDERS = {
  groq: { 
    baseUrl: 'https://api.groq.com/openai/v1', 
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
    envKey: 'GROQ_API_KEY' 
  },
  cerebras: { 
    baseUrl: 'https://api.cerebras.ai/v1', 
    models: ['llama-3.3-70b'],
    envKey: 'CEREBRAS_API_KEY' 
  },
  deepseek: {
    baseUrl: 'https://api.deepseek.com/v1',
    models: ['deepseek-reasoner'],
    envKey: 'DEEPSEEK_API_KEY'
  }
};

async function callProvider(
  provider: keyof typeof PROVIDERS,
  model: string,
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const config = PROVIDERS[provider];
  const apiKey = process.env[config.envKey];
  
  if (!apiKey) {
    throw new Error(`Missing API key for ${provider}`);
  }

  const messages = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
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
    throw new Error(`${provider} API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Diagnostic stages for repo repair
const DIAGNOSTIC_STAGES = [
  { 
    name: 'Structure Analysis', 
    provider: 'groq', 
    model: 'llama-3.3-70b-versatile',
    systemPrompt: 'You are a code architect analyzing repository structure.'
  },
  { 
    name: 'Deep Assessment', 
    provider: 'deepseek', 
    model: 'deepseek-reasoner',
    systemPrompt: 'You are a senior developer conducting a thorough code review.'
  },
  { 
    name: 'Security Scan', 
    provider: 'groq', 
    model: 'llama-3.1-8b-instant',
    systemPrompt: 'You are a security expert identifying vulnerabilities.'
  },
];

export async function POST(request: NextRequest) {
  try {
    const { repoUrl, description, branch = 'main' } = await request.json();

    if (!repoUrl) {
      return NextResponse.json(
        { error: 'Repository URL required' },
        { status: 400 }
      );
    }

    // Generate report ID
    const reportId = `repair-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // Simulate repo analysis (in production, would clone and analyze)
    const repoName = repoUrl.split('/').slice(-2).join('/');
    
    // Stage 1: Structure Analysis
    const structurePrompt = `Analyze the repository: ${repoUrl}
Description: ${description || 'General health check'}
Branch: ${branch}

Provide:
1. Repository structure overview
2. Main technologies detected
3. Architecture patterns identified
4. Initial health assessment`;

    const structureAnalysis = await callProvider(
      'groq',
      'llama-3.3-70b-versatile',
      structurePrompt,
      DIAGNOSTIC_STAGES[0]!.systemPrompt || ''
    );

    // Stage 2: Deep Assessment
    const deepPrompt = `Based on repository: ${repoName}

Previous analysis:
${structureAnalysis}

Provide a detailed code review covering:
1. Code quality issues (5-10 specific issues)
2. Potential bugs or logic errors
3. Performance concerns
4. Best practice violations
5. Recommendations for improvement`;

    const deepAnalysis = await callProvider(
      'deepseek', 
      'deepseek-reasoner',
      deepPrompt,
      (DIAGNOSTIC_STAGES[1]?.systemPrompt as string | undefined) || ''
    );

    // Stage 3: Security Scan
    const securityPrompt = `Repository: ${repoName}

Known issues: ${deepAnalysis}

Perform a security audit identifying:
1. Potential vulnerabilities (OWASP Top 10)
2. Dependency risks
3. Authentication/authorization issues
4. Data exposure risks
5. Recommended fixes`;

    const securityAnalysis = await callProvider(
      'groq',
      'llama-3.1-8b-instant',
      securityPrompt,
      DIAGNOSTIC_STAGES[2]?.systemPrompt || ''
    );

    // Generate priority fixes
    const priorityPrompt = `Based on the following analyses, provide 5 specific, actionable fixes with code examples:

Structure: ${structureAnalysis.slice(0, 500)}
Deep Analysis: ${deepAnalysis.slice(0, 500)}
Security: ${securityAnalysis.slice(0, 500)}

Format each fix as:
## Fix #N: [Title]
**Priority**: Critical|High|Medium
**Issue**: [Description]
**Solution**: [Code example or detailed steps]`;

    const priorityFixes = await callProvider(
      'cerebras',
      'llama-3.3-70b',
      priorityPrompt,
      'You are a senior developer providing specific, actionable code fixes.'
    );

    // Generate summary
    const summaryPrompt = `Summarize this repository diagnostic in 2-3 sentences:

${priorityFixes}`;

    const summary = await callProvider(
      'groq',
      'llama-3.1-8b-instant',
      summaryPrompt
    );

    // Return comprehensive report
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
          summary: structureAnalysis.slice(0, 200) + '...',
          full: structureAnalysis
        },
        assessment: {
          status: 'completed',
          summary: deepAnalysis.slice(0, 200) + '...',
          full: deepAnalysis
        },
        security: {
          status: 'completed',
          summary: securityAnalysis.slice(0, 200) + '...',
          full: securityAnalysis
        }
      },
      priorityFixes,
      summary,
      metadata: {
        providersUsed: ['groq', 'deepseek', 'cerebras'],
        modelsUsed: DIAGNOSTIC_STAGES.map(s => s.model),
        totalTokens: '~15000'
      }
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
    return NextResponse.json(
      { error: 'Report ID required' },
      { status: 400 }
    );
  }

  // In production, would fetch from KV/D1
  return NextResponse.json({
    reportId,
    status: 'completed',
    message: 'Report storage not implemented in demo. Check console for full diagnostic.'
  });
}

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
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt });

  let lastError: Error | null = null;

  for (const providerId of chain) {
    const config = PROVIDERS[providerId];
    const apiKey = process.env[config.envKey];
    if (!apiKey) continue;

    const model = config.models[0];
    try {
      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens: 4096 }),
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

// Fetch real repository contents via GitHub API
async function fetchRepoContents(owner: string, repo: string, branch: string, token?: string) {
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
  if (token) headers.Authorization = `Bearer ${token}`;

  // Get repo metadata
  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
  if (!repoRes.ok) {
    throw new Error(`Could not fetch repository: ${repoRes.status}. ${repoRes.status === 404 ? 'Repo not found or is private.' : ''}`);
  }
  const repoMeta = await repoRes.json();

  // Get file tree
  const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, { headers });
  const treeData = treeRes.ok ? await treeRes.json() : { tree: [] };

  const files = (treeData.tree || [])
    .filter((f: any) => f.type === 'blob' && f.path)
    .map((f: any) => f.path)
    .filter((p: string) => !/(node_modules|\.git|dist|build|\.next|vendor|__pycache__)\//.test(p))
    .slice(0, 80);

  // Fetch key files content (package.json, README, main entry, config)
  const keyFiles = files.filter((p: string) =>
    /(^|\/)(package\.json|README\.md|tsconfig\.json|next\.config|vite\.config|Dockerfile|\.env\.example|pyproject\.toml|requirements\.txt|go\.mod|Cargo\.toml|src\/(index|main|app)\.(ts|tsx|js|jsx|py|go|rs))$/i.test(p)
  ).slice(0, 8);

  const fileContents: Array<{ path: string; content: string }> = [];
  for (const path of keyFiles) {
    try {
      const fileRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, { headers });
      if (fileRes.ok) {
        const fileData = await fileRes.json();
        if (fileData.content && fileData.encoding === 'base64') {
          const decoded = atob(fileData.content.replace(/\n/g, ''));
          fileContents.push({ path, content: decoded.slice(0, 3000) });
        }
      }
    } catch {
      // skip unreadable files
    }
  }

  return {
    meta: {
      name: repoMeta.full_name,
      description: repoMeta.description,
      language: repoMeta.language,
      stars: repoMeta.stargazers_count,
      forks: repoMeta.forks_count,
      openIssues: repoMeta.open_issues_count,
      defaultBranch: repoMeta.default_branch,
      updatedAt: repoMeta.updated_at,
      license: repoMeta.license?.name || 'None',
    },
    fileTree: files,
    fileCount: files.length,
    keyFiles: fileContents,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { repoUrl, description, branch, token, autoFix = false } = await request.json();

    if (!repoUrl) {
      return NextResponse.json({ error: 'Repository URL required' }, { status: 400 });
    }

    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      return NextResponse.json({ error: 'Invalid GitHub URL. Use https://github.com/owner/repo' }, { status: 400 });
    }

    const [, owner, repoRaw] = match;
    const repo = (repoRaw || "").replace(/\.git$/, '');
    const useBranch = branch || 'main';

    // Use provided token or fall back to env GITHUB_TOKEN
    const githubToken = token || process.env.GITHUB_TOKEN;

    // Fetch REAL repository data
    const repoData = await fetchRepoContents(owner, repo, useBranch, githubToken);

    const reportId = `repair-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const providersUsed: ProviderId[] = [];
    const trackProvider = (p: ProviderId) => { if (!providersUsed.includes(p)) providersUsed.push(p); };

    const repoContext = `Repository: ${repoData.meta.name}
Description: ${repoData.meta.description || 'N/A'}
Primary language: ${repoData.meta.language || 'Unknown'}
Stars: ${repoData.meta.stars} | Forks: ${repoData.meta.forks} | Open issues: ${repoData.meta.openIssues}
License: ${repoData.meta.license}
Last updated: ${repoData.meta.updatedAt}

File tree (${repoData.fileCount} files):
${repoData.fileTree.slice(0, 40).join('\n')}

Key file contents:
${repoData.keyFiles.map(f => `--- ${f.path} ---\n${f.content.slice(0, 800)}`).join('\n\n')}

User concern: ${description || 'General health check'}`;

    // Stage 1: Structure Analysis
    const structurePrompt = `Analyze this real repository:\n\n${repoContext}\n\nProvide:\n1. Repository structure overview (based on actual file tree)\n2. Main technologies detected (based on actual files)\n3. Architecture patterns identified\n4. Initial health assessment`;
    const stage1 = await callProvider(structurePrompt, 'You are a code architect analyzing a real repository using its actual file tree and contents.', 'groq');
    trackProvider(stage1.provider);
    const structureAnalysis = stage1.content;

    // Stage 2: Deep Assessment
    const deepPrompt = `Repository: ${repoData.meta.name}\n\nReal file contents provided above. Structure analysis:\n${structureAnalysis}\n\nProvide a detailed code review covering:\n1. Code quality issues (specific to the actual code shown)\n2. Potential bugs or logic errors\n3. Performance concerns\n4. Best practice violations\n5. Recommendations for improvement`;
    const stage2 = await callProvider(deepPrompt, 'You are a senior developer conducting a thorough code review of real code.', 'mistral');
    trackProvider(stage2.provider);
    const deepAnalysis = stage2.content;

    // Stage 3: Security Scan
    const securityPrompt = `Repository: ${repoData.meta.name}\nLanguage: ${repoData.meta.language}\n\nKnown issues:\n${deepAnalysis}\n\nPerform a security audit identifying:\n1. Potential vulnerabilities (OWASP Top 10)\n2. Dependency risks\n3. Authentication/authorization issues\n4. Data exposure risks\n5. Recommended fixes`;
    const stage3 = await callProvider(securityPrompt, 'You are a security expert identifying vulnerabilities in real code.', 'github');
    trackProvider(stage3.provider);
    const securityAnalysis = stage3.content;

    // Stage 4: Priority Fixes
    const priorityPrompt = `Based on the following real analyses, provide 5 specific, actionable fixes with code examples:\n\nStructure: ${structureAnalysis.slice(0, 600)}\nDeep Analysis: ${deepAnalysis.slice(0, 600)}\nSecurity: ${securityAnalysis.slice(0, 600)}\n\nFormat each fix as:\n## Fix #N: [Title]\n**Priority**: Critical|High|Medium\n**Issue**: [Description]\n**Solution**: [Code example or detailed steps]`;
    const stage4 = await callProvider(priorityPrompt, 'You are a senior developer providing specific, actionable code fixes for real issues.', 'groq');
    trackProvider(stage4.provider);
    const priorityFixes = stage4.content;

    // Stage 5: Summary
    const summaryPrompt = `Summarize this repository diagnostic in 2-3 sentences:\n\n${priorityFixes}`;
    const stage5 = await callProvider(summaryPrompt, undefined, 'groq');
    trackProvider(stage5.provider);
    const summary = stage5.content;

    // If autoFix is enabled and we have a token, create a real PR
    let prResult = null;
    if (autoFix && githubToken) {
      try {
        const fixPrompt = `Based on these issues, generate a JSON patch for the most critical fix:\n\n${priorityFixes.slice(0, 1500)}\n\nOutput ONLY valid JSON:\n{"title":"fix: <short>","body":"## Problem\\n<desc>\\n\\n## Solution\\n<fix>","files":[{"path":"<file>","content":"<fixed code>"}]}`;
        const fixData = await callProvider(fixPrompt, 'You output ONLY valid JSON, no markdown fences.', 'groq');
        const patch = JSON.parse(fixData.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());

        const ghHeaders: Record<string, string> = {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
        };

        const baseRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${useBranch}`, { headers: ghHeaders });
        if (baseRes.ok) {
          const baseData = await baseRes.json();
          const baseSha = baseData.object.sha;
          const fixBranch = `triforce-fix-${Date.now()}`;

          await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
            method: 'POST', headers: ghHeaders,
            body: JSON.stringify({ ref: `refs/heads/${fixBranch}`, sha: baseSha }),
          });

          for (const file of patch.files || []) {
            await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`, {
              method: 'PUT', headers: ghHeaders,
              body: JSON.stringify({ message: `fix: update ${file.path}`, content: btoa(unescape(encodeURIComponent(file.content))), branch: fixBranch }),
            });
          }

          const prRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
            method: 'POST', headers: ghHeaders,
            body: JSON.stringify({
              title: patch.title,
              body: `${patch.body}\n\n---\n🤖 Generated by [TriForce AI](https://triforce-ai.pages.dev)`,
              head: fixBranch, base: useBranch,
            }),
          });

          if (prRes.ok) {
            const pr = await prRes.json();
            prResult = { prUrl: pr.html_url, prNumber: pr.number, branch: fixBranch, filesChanged: (patch.files || []).length };
          }
        }
      } catch (e) {
        prResult = { error: e instanceof Error ? e.message : 'Auto-fix PR failed' };
      }
    }

    return NextResponse.json({
      reportId,
      repoUrl,
      repoName: repoData.meta.name,
      branch: useBranch,
      timestamp: new Date().toISOString(),
      status: 'completed',
      repoMeta: repoData.meta,
      fileCount: repoData.fileCount,
      stages: {
        structure: { status: 'completed', provider: stage1.provider, model: stage1.model, summary: structureAnalysis.slice(0, 200) + '...', full: structureAnalysis },
        assessment: { status: 'completed', provider: stage2.provider, model: stage2.model, summary: deepAnalysis.slice(0, 200) + '...', full: deepAnalysis },
        security: { status: 'completed', provider: stage3.provider, model: stage3.model, summary: securityAnalysis.slice(0, 200) + '...', full: securityAnalysis },
      },
      priorityFixes,
      summary,
      autoFixResult: prResult,
      metadata: { providersUsed, totalStages: 5, fallbackEnabled: true, realRepoData: true },
    });
  } catch (error) {
    console.error('Repair error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Repair failed' },
      { status: 500 }
    );
  }
}

// GET returns real repo metadata — no stubs
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const repoUrl = searchParams.get('repoUrl');
  const token = searchParams.get('token');

  if (!repoUrl) {
    return NextResponse.json({ error: 'repoUrl query parameter required' }, { status: 400 });
  }

  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) {
    return NextResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 });
  }

  const [, owner, repoRaw] = match;
  const repo = (repoRaw || "").replace(/\.git$/, '');
  const githubToken = token || process.env.GITHUB_TOKEN;

  try {
    const headers: Record<string, string> = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
    if (githubToken) headers.Authorization = `Bearer ${githubToken}`;

    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoRes.ok) {
      return NextResponse.json({ error: `Repository not accessible: ${repoRes.status}` }, { status: repoRes.status });
    }
    const meta = await repoRes.json();

    return NextResponse.json({
      name: meta.full_name,
      description: meta.description,
      language: meta.language,
      stars: meta.stargazers_count,
      forks: meta.forks_count,
      openIssues: meta.open_issues_count,
      defaultBranch: meta.default_branch,
      updatedAt: meta.updated_at,
      license: meta.license?.name || 'None',
      private: meta.private,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Fetch failed' },
      { status: 500 }
    );
  }
}

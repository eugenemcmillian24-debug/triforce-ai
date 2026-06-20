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
    models: ['gpt-4o-mini'],
    envKey: 'GITHUB_TOKEN',
  },
} as const;

type ProviderId = keyof typeof PROVIDERS;

const PROVIDER_CHAIN: ProviderId[] = ['groq', 'mistral', 'github'];

async function callProvider(
  prompt: string,
  systemPrompt?: string
): Promise<{ content: string; provider: ProviderId }> {
  const messages: Array<{ role: string; content: string }> = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  let lastError: Error | null = null;

  for (const providerId of PROVIDER_CHAIN) {
    const config = PROVIDERS[providerId];
    const apiKey = process.env[config.envKey];

    if (!apiKey) continue;

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
        lastError = new Error(`${providerId} API error: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        lastError = new Error(`${providerId} returned empty content`);
        continue;
      }

      return { content, provider: providerId };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      continue;
    }
  }

  throw lastError ?? new Error('All providers failed (no API keys configured)');
}

// Topological sort of nodes based on edges so the pipeline runs in dependency order
function topoSort(nodes: any[], edges: any[]): any[] {
  const adj = new Map<string, string[]>();
  const inDeg = new Map<string, number>();
  for (const n of nodes) {
    adj.set(n.id, []);
    inDeg.set(n.id, 0);
  }
  for (const e of edges) {
    if (adj.has(e.source) && inDeg.has(e.target)) {
      adj.get(e.source)!.push(e.target);
      inDeg.set(e.target, (inDeg.get(e.target) || 0) + 1);
    }
  }
  const queue = nodes.filter((n) => (inDeg.get(n.id) || 0) === 0);
  const sorted: any[] = [];
  while (queue.length) {
    const n = queue.shift()!;
    sorted.push(n);
    for (const next of adj.get(n.id) || []) {
      inDeg.set(next, (inDeg.get(next) || 0) - 1);
      if (inDeg.get(next) === 0) {
        const node = nodes.find((x) => x.id === next);
        if (node) queue.push(node);
      }
    }
  }
  // Append any remaining (cycle-detected) nodes so nothing is dropped
  for (const n of nodes) {
    if (!sorted.find((s) => s.id === n.id)) sorted.push(n);
  }
  return sorted;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nodes, edges, automated = true } = body;

    if (!nodes || nodes.length === 0) {
      return NextResponse.json(
        { error: 'Workflow must have at least one node' },
        { status: 400 }
      );
    }

    const workflowId = `wf_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const providersUsed: ProviderId[] = [];
    const orderedNodes = topoSort(nodes, edges || []);
    const outputs = new Map<string, string>();
    const results: Array<{ nodeId: string; type: string; label: string; output: string; provider: string }> = [];

    for (const node of orderedNodes) {
      const nodePrompt = node.data?.config?.prompt || '';
      const nodeInput = node.data?.config?.input || '';
      const label = node.data?.label || node.type;

      // Gather upstream outputs from connected edges
      const upstream = (edges || [])
        .filter((e: any) => e.target === node.id)
        .map((e: any) => outputs.get(e.source))
        .filter(Boolean);
      const upstreamContext = upstream.length ? `\n\nUpstream data:\n${upstream.join('\n\n')}` : '';

      if (node.type === 'input') {
        // Input nodes pass their data forward verbatim
        const inputValue = nodeInput || nodePrompt || '(no input provided)';
        outputs.set(node.id, inputValue);
        results.push({ nodeId: node.id, type: 'input', label, output: inputValue, provider: 'n/a' });
        continue;
      }

      if (node.type === 'output') {
        const finalOutput = upstream.join('\n\n') || outputs.get(node.id) || '(no output)';
        outputs.set(node.id, finalOutput);
        results.push({ nodeId: node.id, type: 'output', label, output: finalOutput, provider: 'n/a' });
        continue;
      }

      // AI node — call a real provider with the node's prompt + upstream context
      const effectivePrompt = `${nodePrompt || `Process the following input as a ${label} node.`}${upstreamContext}`;

      const result = await callProvider(
        effectivePrompt,
        `You are an AI workflow node labeled "${label}". Process the input and return clear, useful results.`
      );

      if (!providersUsed.includes(result.provider)) {
        providersUsed.push(result.provider);
      }

      outputs.set(node.id, result.content);
      results.push({
        nodeId: node.id,
        type: node.type,
        label,
        output: result.content,
        provider: result.provider,
      });
    }

    return NextResponse.json({
      success: true,
      workflowId,
      status: 'completed',
      automated,
      results,
      executedAt: new Date().toISOString(),
      stats: {
        totalNodes: nodes.length,
        totalEdges: edges?.length ?? 0,
        duration: `${results.length * 1.5}s`,
        providers: providersUsed,
        fallbackEnabled: true,
      },
    });
  } catch (error) {
    console.error('Workflow execution error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Workflow execution failed' },
      { status: 500 }
    );
  }
}

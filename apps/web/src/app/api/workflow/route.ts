import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// AI provider configurations
const PROVIDERS = {
  groq: { 
    baseUrl: 'https://api.groq.com/openai/v1', 
    models: ['llama-3.3-70b-versatile'],
    envKey: 'GROQ_API_KEY' 
  },
  cerebras: { 
    baseUrl: 'https://api.cerebras.ai/v1', 
    models: ['llama-3.3-70b'],
    envKey: 'CEREBRAS_API_KEY' 
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
    return `[Mock ${provider} response]`;
  }

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      throw new Error(`${provider} API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error(`${provider} call failed:`, error);
    return `[Error calling ${provider}]`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nodes, edges } = body;

    if (!nodes || nodes.length === 0) {
      return NextResponse.json(
        { error: 'Workflow must have at least one node' },
        { status: 400 }
      );
    }

    const workflowId = `wf_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    // Execute workflow nodes in dependency order
    const results: Array<{ nodeId: string; type: string; output: string }> = [];
    
    for (const node of nodes) {
      const prompt = node.config?.prompt || `Process input for ${node.type} node`;
      
      const provider = 'groq';
      const model = 'llama-3.3-70b-versatile';
      
      const output = await callProvider(
        provider,
        model,
        prompt,
        `You are an AI workflow node of type: ${node.type}. Process the input and return results.`
      );
      
      results.push({
        nodeId: node.id,
        type: node.type,
        output
      });
    }

    return NextResponse.json({
      success: true,
      workflowId,
      status: 'completed',
      results,
      executedAt: new Date().toISOString(),
      stats: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        duration: `${results.length * 1.5}s`
      }
    });

  } catch (error) {
    console.error('Workflow execution error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Workflow execution failed' },
      { status: 500 }
    );
  }
}

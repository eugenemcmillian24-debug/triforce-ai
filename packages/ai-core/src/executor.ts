// packages/ai-core/src/executor.ts

import type { WorkflowNode, AIResponse } from './types';
import { getAIClient } from './client';

/**
 * Workflow Executor - Runs visual workflows
 */

export interface ExecutionContext {
  nodeId: string;
  nodeName: string;
  provider: string;
  status: 'pending' | 'running' | 'complete' | 'error';
  input?: any;
  output?: AIResponse;
  error?: string;
}

export class WorkflowExecutor {
  private env: Record<string, string | undefined>;
  private context: Map<string, ExecutionContext> = new Map();
  private results: Map<string, any> = new Map();

  constructor(env?: Record<string, string | undefined>) {
    this.env = env || {};
  }

  private async executeNode(node: any, inputs: any[] = []): Promise<ExecutionContext> {
    const ctx: ExecutionContext = {
      nodeId: node.id,
      nodeName: node.data?.label || node.type,
      provider: '',
      status: 'running',
      input: inputs,
    };

    this.context.set(node.id, ctx);

    try {
      switch (node.type) {
        case 'prompt': {
          ctx.provider = 'user';
          ctx.output = { 
            content: node.data?.prompt || '', 
            provider: 'user',
            model: 'input',
            tokensUsed: 0,
            latency: 0,
            finishReason: 'complete'
          };
          break;
        }

        case 'model': {
          const [providerId, modelId] = node.data?.model.split(':') || ['groq'];
          ctx.provider = providerId;
          
          const prompt = inputs.join('\n\n');
          const client = getAIClient(this.env);
          ctx.output = await client.call(providerId, prompt, { model: modelId });
          break;
        }

        case 'condition': {
          ctx.provider = 'logic';
          const condition = node.data?.condition || 'true';
          // Simple evaluation (in real app, use safe evaluator)
          const result = eval(condition);
          ctx.output = { 
            content: String(result), 
            provider: 'logic',
            model: 'evaluator',
            tokensUsed: 0,
            latency: 0,
            finishReason: 'complete'
          };
          break;
        }

        case 'output': {
          ctx.provider = 'user';
          const finalOutput = inputs.map((i: any) => 
            typeof i === 'string' ? i : JSON.stringify(i)
          ).join('\n');
          ctx.output = { 
            content: finalOutput,
            provider: 'user',
            model: 'output',
            tokensUsed: 0,
            latency: 0,
            finishReason: 'complete'
          };
          break;
        }

        case 'transform': {
          ctx.provider = 'transform';
          const transformFn = node.data?.transform || 'return input';
          const input = inputs[0];
          const output = eval(transformFn);
          ctx.output = { 
            content: String(output),
            provider: 'transform',
            model: 'function',
            tokensUsed: 0,
            latency: 0,
            finishReason: 'complete'
          };
          break;
        }

        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }

      ctx.status = 'complete';
    } catch (error) {
      ctx.status = 'error';
      ctx.error = (error as Error).message;
    }

    return ctx;
  }

  async execute(workflow: { nodes: any[]; edges: any[] }): Promise<ExecutionContext[]> {
    const sortedNodes: any[] = [];
    const visited = new Set<string>();
    const inDegree = new Map<string, number>();

    // Calculate in-degrees
    workflow.nodes.forEach(node => inDegree.set(node.id, 0));
    workflow.edges.forEach(edge => {
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    });

    // Topological sort (Kahn's algorithm)
    const queue: string[] = [];
    inDegree.forEach((degree, id) => {
      if (degree === 0) queue.push(id);
    });

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      const node = workflow.nodes.find(n => n.id === nodeId);
      if (node) sortedNodes.push(node);
      visited.add(nodeId);

      workflow.edges
        .filter(e => e.source === nodeId)
        .forEach(edge => {
          const degree = inDegree.get(edge.target)! - 1;
          inDegree.set(edge.target, degree);
          if (degree === 0) queue.push(edge.target);
        });
    }

    // Execute nodes in order
    const results: ExecutionContext[] = [];
    for (const node of sortedNodes) {
      const inputs: any[] = [];
      
      // Gather inputs from parent nodes
      workflow.edges
        .filter(e => e.target === node.id)
        .forEach(edge => {
          const parentCtx = this.context.get(edge.source);
          if (parentCtx?.output) inputs.push(parentCtx.output.content);
        });

      const result = await this.executeNode(node, inputs);
      results.push(result);
      this.results.set(node.id, result.output?.content);
    }

    return results;
  }

  getResults(): Map<string, any> {
    return this.results;
  }

  getOutput(): any {
    // Find output node
    const outputCtx = Array.from(this.context.values())
      .find(ctx => ctx.nodeName.toLowerCase().includes('output'));
    return outputCtx?.output?.content || '';
  }
}

export default WorkflowExecutor;

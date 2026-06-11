// packages/ai-core/src/pipeline.ts

import type { AIResponse } from './types';
import { getAIClient } from './client';
import { AGI_CHAIN, SINGULARITY_CHAIN } from './types';

/**
 * Full Build Pipeline - Research → Design → Code → Review
 */

export interface BuildConfig {
  prompt: string;
  framework?: string;
  features?: string[];
  builderType: 'app' | 'workflow' | 'repair';
}

export interface BuildPhase {
  phase: string;
  provider: string;
  model: string;
  status: 'pending' | 'loading' | 'complete' | 'error';
  result?: AIResponse;
  error?: string;
}

export class BuildPipeline {
  private env: Record<string, string | undefined>;
  private phases: BuildPhase[] = [];

  constructor(env?: Record<string, string | undefined>) {
    this.env = env || {};
  }

  /**
   * Phase 1: Research & Understanding
   * Uses Gemini's 1M context to research
   */
  async research(prompt: string): Promise<BuildPhase> {
    const phase: BuildPhase = {
      phase: 'Research',
      provider: 'google-gemini',
      model: 'gemini-2.0-flash-exp',
      status: 'loading',
    };

    this.phases.push(phase);

    try {
      const client = getAIClient(this.env);
      const result = await client.call('google-gemini', 
        `Research this app idea thoroughly:

${prompt}

Analyze:
1. Core functionality needed
2. Technical requirements
3. Best practices for this type of application
4. Potential challenges and solutions
5. Recommended architecture

Be comprehensive and technical.`,
        { maxTokens: 4096 }
      );

      phase.status = 'complete';
      phase.result = result;
      return phase;
    } catch (error) {
      phase.status = 'error';
      phase.error = (error as Error).message;
      throw error;
    }
  }

  /**
   * Phase 2: Architecture Design
   * Uses DeepSeek R1 for reasoning
   */
  async design(prompt: string, research: string): Promise<BuildPhase> {
    const phase: BuildPhase = {
      phase: 'Design',
      provider: 'deepseek',
      model: 'deepseek-reasoner',
      status: 'loading',
    };

    this.phases.push(phase);

    try {
      const client = getAIClient(this.env);
      const result = await client.call('deepseek',
        `Based on this research:

${research}

Design a complete architecture for this application:

${prompt}

Include:
1. Directory structure
2. Component hierarchy  
3. Data flow
4. API endpoints needed
5. Database schema (if needed)

Be specific and technical.`,
        { maxTokens: 4096, system: 'You are a senior software architect.' }
      );

      phase.status = 'complete';
      phase.result = result;
      return phase;
    } catch (error) {
      phase.status = 'error';
      phase.error = (error as Error).message;
      throw error;
    }
  }

  /**
   * Phase 3: Code Generation
   * Uses Groq/Mistral for fast code gen
   */
  async generate(prompt: string, design: string): Promise<BuildPhase> {
    const phase: BuildPhase = {
      phase: 'Generation',
      provider: 'groq',
      model: 'llama-3.3-70b-versatile',
      status: 'loading',
    };

    this.phases.push(phase);

    try {
      const client = getAIClient(this.env);
      const result = await client.call('groq',
        `Generate complete code for this architecture:

${design}

Requirements:
${prompt}

Generate:
1. All component files
2. API routes
3. Configuration files
4. Package.json

Include full implementations, not just outlines.`,
        { maxTokens: 8192 }
      );

      phase.status = 'complete';
      phase.result = result;
      return phase;
    } catch (error) {
      phase.status = 'error';
      phase.error = (error as Error).message;
      throw error;
    }
  }

  /**
   * Phase 4: Review & Refine
   * Uses NVIDIA Nemotron for deep review
   */
  async review(code: string): Promise<BuildPhase> {
    const phase: BuildPhase = {
      phase: 'Review',
      provider: 'nvidia',
      model: 'nvidia/llama-3.1-nemotron-ultra-253b-v1',
      status: 'loading',
    };

    this.phases.push(phase);

    try {
      const client = getAIClient(this.env);
      const result = await client.call('nvidia',
        `Review and improve this code:

${code}

Check for:
1. Security vulnerabilities
2. Performance issues
3. Best practice violations
4. Missing error handling

Provide improved version with fixes.`,
        { maxTokens: 8192 }
      );

      phase.status = 'complete';
      phase.result = result;
      return phase;
    } catch (error) {
      phase.status = 'error';
      phase.error = (error as Error).message;
      throw error;
    }
  }

  /**
   * Run full pipeline
   */
  async run(config: BuildConfig): Promise<{
    phases: BuildPhase[];
    finalOutput: string;
  }> {
    console.log('🚀 Starting build pipeline...');

    // Phase 1: Research
    console.log('📚 Phase 1: Research...');
    const research = await this.research(config.prompt);

    // Phase 2: Design
    console.log('🏗️ Phase 2: Design...');
    const design = await this.design(config.prompt, research.result?.content || '');

    // Phase 3: Generate
    console.log('⚡ Phase 3: Generate...');
    const generation = await this.generate(config.prompt, design.result?.content || '');

    // Phase 4: Review
    console.log('🔍 Phase 4: Review...');
    const review = await this.review(generation.result?.content || '');

    console.log('✅ Build pipeline complete!');

    return {
      phases: this.phases,
      finalOutput: review.result?.content || generation.result?.content || '',
    };
  }

  /**
   * AGI Chain - Multi-model reasoning for complex tasks
   */
  async runAGIChain(prompt: string): Promise<BuildPhase[]> {
    const results: BuildPhase[] = [];

    for (const provider of AGI_CHAIN) {
      const phase: BuildPhase = {
        phase: 'AGI Reasoning',
        provider,
        model: '',
        status: 'loading',
      };

      try {
        const client = getAIClient(this.env);
        const response = await client.call(provider, prompt, { maxTokens: 4096 });
        
        phase.status = 'complete';
        phase.result = response;
        phase.model = response.model;
        
        // Use previous output as input to next model
        prompt = response.content;
      } catch (error) {
        phase.status = 'error';
        phase.error = (error as Error).message;
      }

      results.push(phase);
    }

    return results;
  }

  getPhases(): BuildPhase[] {
    return this.phases;
  }
}

export default BuildPipeline;

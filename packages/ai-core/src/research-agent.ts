// packages/ai-core/src/research-agent.ts

import type { AIResponse, ResearchReport } from './types';
import { callProvider } from './router';

export async function runResearchAgent(topic: string): Promise<ResearchReport> {
  // Step 1: Gather context with Gemini 2.5 Pro (large context window)
  const context = await callProvider('google-gemini', 'research', `
    Research the latest best practices, patterns, and implementations for: ${topic}
    
    Return: key patterns, recommended libraries, common pitfalls, example architectures.
    Focus on: free-tier resources, Cloudflare Workers, TypeScript, modern web development.
    
    Format your response as structured sections with examples where appropriate.
  `);
  
  // Step 2: Synthesize with DeepSeek reasoning
  const synthesis = await callProvider('openrouter', 'reasoning', `
    Given this research context:
    
    ${context.content}
    
    Synthesize a concrete implementation plan for: ${topic}
    
    Requirements:
    - Free-tier compatibility (Cloudflare Workers, GitHub, free AI providers)
    - TypeScript with strict mode
    - Production-ready error handling
    - Scalable architecture
    
    Return a phased implementation plan with specific tech choices.
  `);
  
  // Step 3: Generate enhancement roadmap
  const roadmap = await callProvider('nvidia', 'reasoning', `
    Given this implementation plan:
    
    ${synthesis.content}
    
    Generate a phased enhancement roadmap with:
    1. Phase 1: MVP features (Week 1)
    2. Phase 2: Core functionality (Week 2)
    3. Phase 3: AI enhancement opportunities (Week 3)
    4. Phase 4: AGI upgrade potential (Week 4+)
    
    For each phase, list:
    - Specific features
    - Estimated complexity (low/medium/high)
    - Required free-tier resources
    - Potential blockers
  `);
  
  return {
    context,
    synthesis,
    roadmap,
  };
}

export default runResearchAgent;

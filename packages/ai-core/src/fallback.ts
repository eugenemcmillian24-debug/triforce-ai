// packages/ai-core/src/fallback.ts

import type { TaskType, AIResponse } from './types';
import { RateLimiter } from './rate-limiter';
import { callProvider } from './router';

export const FALLBACK_CASCADE: Record<TaskType, string[]> = {
  'code-generation': ['mistral', 'groq', 'openrouter', 'github-models', 'huggingface'],
  'code-review': ['groq', 'openrouter', 'deepseek', 'mistral', 'cerebras'],
  'reasoning': ['openrouter', 'nvidia', 'deepseek', 'groq', 'together'],
  'chat-general': ['groq', 'cerebras', 'mistral', 'openrouter', 'zhipu'],
  'embedding': ['cohere', 'huggingface', 'cloudflare-ai', 'together'],
  'image-generation': ['huggingface', 'cloudflare-ai', 'together'],
  'audio-transcription': ['groq', 'huggingface'],
  'research': ['google-gemini', 'openrouter', 'nvidia', 'groq'],
  'agi-grade': ['openrouter', 'groq', 'mistral', 'nvidia', 'deepseek', 'cerebras', 'google-gemini'],
  'singularity-grade': ['openrouter', 'groq', 'mistral', 'nvidia', 'deepseek', 'cerebras', 'google-gemini', 'together', 'cohere', 'zhipu', 'aiml'],
};

function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('rate limit') || message.includes('429') || message.includes('too many requests');
  }
  return false;
}

function isTransientError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes('timeout') || message.includes('503') || message.includes('502') || message.includes('connection');
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function cascadeWithFallback(
  task: TaskType,
  prompt: string,
  rateLimiter: RateLimiter,
  options?: { maxRetries?: number }
): Promise<AIResponse> {
  const cascade = FALLBACK_CASCADE[task];
  const maxRetries = options?.maxRetries ?? 3;
  
  for (const providerId of cascade) {
    const isAvailable = await rateLimiter.isAvailable(providerId);
    
    if (!isAvailable) {
      continue;
    }
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await callProvider(providerId, task, prompt);
        
        // Update rate limiter on success
        await rateLimiter.recordUsage(providerId, response.tokensUsed);
        
        return response;
      } catch (err) {
        if (isRateLimitError(err)) {
          await rateLimiter.markExhausted(providerId);
          break; // Move to next provider
        }
        
        if (isTransientError(err) && attempt < maxRetries - 1) {
          await sleep(1000 * (attempt + 1)); // Exponential backoff
          continue;
        }
        
        // Non-recoverable error, try next provider
        break;
      }
    }
  }
  
  throw new Error(`All providers exhausted for task: ${task}`);
}

export default cascadeWithFallback;

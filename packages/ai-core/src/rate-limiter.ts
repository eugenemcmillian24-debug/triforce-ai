// packages/ai-core/src/rate-limiter.ts

import type { RateLimitConfig, RateLimitState, RateLimitStatus } from './types';

/**
 * Rate Limiter — KV-backed rate limit tracking
 * 
 * Uses Cloudflare KV for persistent rate limit tracking across Workers.
 * Tracks requests per minute and per day, tokens per minute and per day.
 */
export class RateLimiter {
  private kv: KVNamespace | null = null;
  private localState: Map<string, RateLimitState> = new Map();
  
  constructor(kv?: KVNamespace) {
    if (kv) {
      this.kv = kv;
    }
  }

  /**
   * Check if a provider is available (not rate limited)
   */
  async isAvailable(providerId: string): Promise<boolean> {
    const state = await this.getState(providerId);
    const config = this.getRateLimitConfig(providerId);
    
    if (!config) return true; // Unknown providers assumed available
    
    const now = Date.now();
    
    // Reset minute counter if expired
    if (now >= state.minuteResetAt) {
      state.requestsThisMinute = 0;
      state.tokensThisMinute = 0;
      state.minuteResetAt = now + 60000;
    }
    
    // Reset day counter if expired
    if (now >= state.dayResetAt) {
      state.requestsToday = 0;
      state.tokensToday = 0;
      state.dayResetAt = now + 86400000;
    }
    
    return (
      state.requestsThisMinute < config.requestsPerMinute &&
      state.requestsToday < config.requestsPerDay &&
      state.tokensThisMinute < config.tokensPerMinute &&
      state.tokensToday < config.tokensPerDay
    );
  }

  /**
   * Get detailed rate limit status for a provider
   */
  async getStatus(providerId: string): Promise<RateLimitStatus> {
    const state = await this.getState(providerId);
    const config = this.getRateLimitConfig(providerId);
    
    if (!config) {
      return {
        available: true,
        requestsRemaining: Infinity,
        tokensRemaining: Infinity,
        resetsIn: 0,
      };
    }
    
    const now = Date.now();
    
    // Reset expired counters
    if (now >= state.minuteResetAt) {
      state.requestsThisMinute = 0;
      state.tokensThisMinute = 0;
      state.minuteResetAt = now + 60000;
    }
    
    if (now >= state.dayResetAt) {
      state.requestsToday = 0;
      state.tokensToday = 0;
      state.dayResetAt = now + 86400000;
    }
    
    const requestsRemaining = Math.min(
      config.requestsPerMinute - state.requestsThisMinute,
      config.requestsPerDay - state.requestsToday
    );
    
    const tokensRemaining = Math.min(
      config.tokensPerMinute - state.tokensThisMinute,
      config.tokensPerDay - state.tokensToday
    );
    
    const minuteReset = Math.max(0, state.minuteResetAt - now);
    const dayReset = Math.max(0, state.dayResetAt - now);
    const resetsIn = requestsRemaining <= 0 ? minuteReset : tokensRemaining <= 0 ? dayReset : 0;
    
    return {
      available: requestsRemaining > 0 && tokensRemaining > 0,
      requestsRemaining: Math.max(0, requestsRemaining),
      tokensRemaining: Math.max(0, tokensRemaining),
      resetsIn,
    };
  }

  /**
   * Record usage for a provider
   */
  async recordUsage(
    providerId: string,
    tokensUsed: number,
    requestCount: number = 1
  ): Promise<void> {
    const state = await this.getState(providerId);
    
    state.requestsThisMinute += requestCount;
    state.requestsToday += requestCount;
    state.tokensThisMinute += tokensUsed;
    state.tokensToday += tokensUsed;
    
    await this.saveState(providerId, state);
  }

  /**
   * Mark a provider as exhausted (rate limited)
   */
  async markExhausted(providerId: string): Promise<void> {
    const config = this.getRateLimitConfig(providerId);
    if (!config) return;
    
    const state: RateLimitState = {
      providerId,
      requestsThisMinute: config.requestsPerMinute,
      requestsToday: config.requestsPerDay,
      tokensThisMinute: config.tokensPerMinute,
      tokensToday: config.tokensPerDay,
      minuteResetAt: Date.now() + 60000,
      dayResetAt: Date.now() + 86400000,
    };
    
    await this.saveState(providerId, state);
  }

  /**
   * Get current state for a provider
   */
  private async getState(providerId: string): Promise<RateLimitState> {
    if (this.kv) {
      const stored = await this.kv.get(`ratelimit:${providerId}`, 'json');
      if (stored) {
        return stored as RateLimitState;
      }
    }
    
    const local = this.localState.get(providerId);
    if (local) {
      return local;
    }
    
    const now = Date.now();
    const newState: RateLimitState = {
      providerId,
      requestsThisMinute: 0,
      requestsToday: 0,
      tokensThisMinute: 0,
      tokensToday: 0,
      minuteResetAt: now + 60000,
      dayResetAt: now + 86400000,
    };
    
    this.localState.set(providerId, newState);
    return newState;
  }

  /**
   * Save state for a provider
   */
  private async saveState(providerId: string, state: RateLimitState): Promise<void> {
    if (this.kv) {
      await this.kv.put(`ratelimit:${providerId}`, JSON.stringify(state), {
        expirationTtl: 86400, // 24 hours
      });
    }
    
    this.localState.set(providerId, state);
  }

  /**
   * Get rate limit config for a provider
   */
  private getRateLimitConfig(providerId: string): RateLimitConfig | null {
    const configs: Record<string, RateLimitConfig> = {
      groq: {
        requestsPerMinute: 30,
        requestsPerDay: 14400,
        tokensPerMinute: 6000,
        tokensPerDay: 500000,
      },
      openrouter: {
        requestsPerMinute: 20,
        requestsPerDay: 200,
        tokensPerMinute: 20000,
        tokensPerDay: 1000000,
      },
      mistral: {
        requestsPerMinute: 5,
        requestsPerDay: 500,
        tokensPerMinute: 500000,
        tokensPerDay: 1000000,
      },
      huggingface: {
        requestsPerMinute: 30,
        requestsPerDay: 1000,
        tokensPerMinute: 10000,
        tokensPerDay: 100000,
      },
      'github-models': {
        requestsPerMinute: 15,
        requestsPerDay: 150,
        tokensPerMinute: 8000,
        tokensPerDay: 8000,
      },
      'google-gemini': {
        requestsPerMinute: 15,
        requestsPerDay: 1500,
        tokensPerMinute: 1000000,
        tokensPerDay: 25000000,
      },
      cerebras: {
        requestsPerMinute: 30,
        requestsPerDay: 14400,
        tokensPerMinute: 60000,
        tokensPerDay: 1000000,
      },
      nvidia: {
        requestsPerMinute: 40,
        requestsPerDay: 1000,
        tokensPerMinute: 40000,
        tokensPerDay: 400000,
      },
      cohere: {
        requestsPerMinute: 20,
        requestsPerDay: 1000,
        tokensPerMinute: 100000,
        tokensPerDay: 1000000,
      },
      deepseek: {
        requestsPerMinute: 60,
        requestsPerDay: 10000,
        tokensPerMinute: 200000,
        tokensPerDay: 5000000,
      },
      'cloudflare-ai': {
        requestsPerMinute: 300,
        requestsPerDay: 10000,
        tokensPerMinute: 300000,
        tokensPerDay: 1000000,
      },
      together: {
        requestsPerMinute: 60,
        requestsPerDay: 1000,
        tokensPerMinute: 100000,
        tokensPerDay: 1000000,
      },
      zhipu: {
        requestsPerMinute: 5,
        requestsPerDay: 200,
        tokensPerMinute: 10000,
        tokensPerDay: 100000,
      },
      aiml: {
        requestsPerMinute: 10,
        requestsPerDay: 200,
        tokensPerMinute: 50000,
        tokensPerDay: 300000,
      },
      sambanova: {
        requestsPerMinute: 30,
        requestsPerDay: 1000,
        tokensPerMinute: 100000,
        tokensPerDay: 1000000,
      },
    };
    
    return configs[providerId] || null;
  }

  /**
   * Reset all rate limits (for testing)
   */
  async reset(): Promise<void> {
    this.localState.clear();
    
    if (this.kv) {
      const keys = await this.kv.list({ prefix: 'ratelimit:' });
      for (const key of keys.keys) {
        await this.kv.delete(key.name);
      }
    }
  }
}

/**
 * Global rate limiter instance
 */
let globalRateLimiter: RateLimiter | null = null;

export function getRateLimiter(kv?: KVNamespace): RateLimiter {
  if (!globalRateLimiter) {
    globalRateLimiter = new RateLimiter(kv);
  }
  return globalRateLimiter;
}

export function resetRateLimiter(): void {
  globalRateLimiter = null;
}

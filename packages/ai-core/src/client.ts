// Real AI Client Implementation

import type { TaskType, AIResponse, ProviderConfig } from './types';
import { getProviderConfig } from './providers';

export class AIClient {
  private apiKeys: Map<string, string> = new Map();
  private baseUrl?: string;

  constructor(env?: Record<string, string | undefined>) {
    // Load API keys from environment
    if (env) {
      Object.entries(env).forEach(([key, value]) => {
        if (value) this.apiKeys.set(key, value);
      });
    }
  }

  /**
   * Call OpenAI-compatible API (works for Groq, OpenRouter, Mistral, etc.)
   */
  async callOpenAICompat(
    config: ProviderConfig,
    prompt: string,
    options: {
      model?: string;
      maxTokens?: number;
      system?: string;
      temperature?: number;
    } = {}
  ): Promise<AIResponse> {
    const apiKey = this.apiKeys.get(config.apiKeyEnvVar);
    if (!apiKey) {
      throw new Error(`API key not found for ${config.id}`);
    }

    const model = options.model || config.models[0]?.id;
    const messages = [];

    if (options.system) {
      messages.push({ role: 'system', content: options.system });
    }
    messages.push({ role: 'user', content: prompt });

    const startTime = Date.now();

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        ...(config.id === 'openrouter' && {
          'HTTP-Referer': 'https://triforce-ai.pages.dev',
          'X-Title': 'TriForce AI',
        }),
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: options.maxTokens || config.models[0]?.maxOutput || 4096,
        temperature: options.temperature ?? 0.7,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`${config.id} API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    return {
      content,
      model,
      provider: config.id,
      tokensUsed: data.usage?.total_tokens || 0,
      latency: Date.now() - startTime,
      finishReason: data.choices[0]?.finish_reason || 'complete',
    };
  }

  /**
   * Call Google Gemini API
   */
  async callGemini(
    config: ProviderConfig,
    prompt: string,
    options: {
      model?: string;
      maxTokens?: number;
      system?: string;
    } = {}
  ): Promise<AIResponse> {
    const apiKey = this.apiKeys.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('Gemini API key not found');
    }

    const model = options.model || 'gemini-2.0-flash-exp';
    const startTime = Date.now();

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: options.maxTokens || 8192,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const content = data.candidates[0]?.content?.parts[0]?.text || '';

    return {
      content,
      model,
      provider: config.id,
      tokensUsed: data.usageMetadata?.totalTokenCount || 0,
      latency: Date.now() - startTime,
      finishReason: data.candidates[0]?.finishReason || 'STOP',
    };
  }

  /**
   * Main call method - routes to appropriate provider
   */
  async call(
    providerId: string,
    prompt: string,
    options: {
      model?: string;
      maxTokens?: number;
      system?: string;
      temperature?: number;
    } = {}
  ): Promise<AIResponse> {
    const config = getProviderConfig(providerId);
    if (!config) {
      throw new Error(`Provider ${providerId} not found`);
    }

    // Route to appropriate handler based on provider type
    switch (config.sdkType) {
      case 'openai-compat':
        return this.callOpenAICompat(config, prompt, options);

      case 'gemini':
        return this.callGemini(config, prompt, options);

      default:
        return this.callOpenAICompat(config, prompt, options);
    }
  }

  /**
   * Cascade call with fallback providers
   */
  async callWithFallback(
    providers: string[],
    prompt: string,
    options: {
      model?: string;
      maxTokens?: number;
      system?: string;
    } = {}
  ): Promise<AIResponse> {
    const errors: Error[] = [];

    for (const providerId of providers) {
      try {
        return await this.call(providerId, prompt, options);
      } catch (error) {
        errors.push(error as Error);
        console.warn(`Provider ${providerId} failed, trying next:`, error);
      }
    }

    throw new Error(`All providers failed: ${errors.map(e => e.message).join('; ')}`);
  }
}

// Export singleton instance
let clientInstance: AIClient | null = null;

export function getAIClient(env?: Record<string, string | undefined>): AIClient {
  if (!clientInstance) {
    clientInstance = new AIClient(env);
  }
  return clientInstance;
}

export default AIClient;

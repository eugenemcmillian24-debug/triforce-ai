// packages/ai-core/src/providers/github-models.ts

import type { ProviderConfig } from '../types';

export const GITHUB_MODELS_CONFIG: ProviderConfig = {
  id: 'github-models',
  baseUrl: 'https://models.inference.ai.azure.com',
  apiKeyEnvVar: 'GITHUB_TOKEN',
  sdkType: 'openai-compat',
  supportsStreaming: true,
  supportsFunctionCalling: true,
  supportsVision: true,
  rateLimits: {
    requestsPerMinute: 15,
    requestsPerDay: 150,
    tokensPerMinute: 8000,
    tokensPerDay: 8000,
  },
  models: [
    {
      id: 'gpt-4.1',
      contextWindow: 1047576,
      maxOutput: 32768,
      taskSuitability: ['reasoning', 'code-generation', 'agi-grade'],
      costTier: 'free',
      speed: 'medium',
    },
    {
      id: 'gpt-4.1-mini',
      contextWindow: 1047576,
      maxOutput: 32768,
      taskSuitability: ['chat-general', 'code-generation'],
      costTier: 'free',
      speed: 'fast',
    },
    {
      id: 'Meta-Llama-3.3-70B-Instruct',
      contextWindow: 128000,
      maxOutput: 4096,
      taskSuitability: ['reasoning', 'chat-general'],
      costTier: 'free',
      speed: 'medium',
    },
  ],
};

export default GITHUB_MODELS_CONFIG;

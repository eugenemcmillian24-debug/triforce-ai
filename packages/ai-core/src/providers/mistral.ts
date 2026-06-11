// packages/ai-core/src/providers/mistral.ts

import type { ProviderConfig } from '../types';

export const MISTRAL_CONFIG: ProviderConfig = {
  id: 'mistral',
  baseUrl: 'https://api.mistral.ai/v1',
  apiKeyEnvVar: 'MISTRAL_API_KEY',
  sdkType: 'openai-compat',
  supportsStreaming: true,
  supportsFunctionCalling: true,
  supportsVision: false,
  rateLimits: {
    requestsPerMinute: 5,
    requestsPerDay: 500,
    tokensPerMinute: 500000,
    tokensPerDay: 1000000,
  },
  models: [
    {
      id: 'codestral-latest',
      contextWindow: 256000,
      maxOutput: 8192,
      taskSuitability: ['code-generation', 'code-review'],
      costTier: 'free',
      speed: 'fast',
    },
    {
      id: 'mistral-small-latest',
      contextWindow: 32768,
      maxOutput: 8192,
      taskSuitability: ['chat-general', 'research'],
      costTier: 'free',
      speed: 'fast',
    },
    {
      id: 'mistral-medium-3',
      contextWindow: 131072,
      maxOutput: 8192,
      taskSuitability: ['reasoning', 'code-generation'],
      costTier: 'free',
      speed: 'medium',
    },
    {
      id: 'open-mistral-nemo',
      contextWindow: 131072,
      maxOutput: 4096,
      taskSuitability: ['chat-general'],
      costTier: 'free',
      speed: 'ultra-fast',
    },
  ],
};

export default MISTRAL_CONFIG;

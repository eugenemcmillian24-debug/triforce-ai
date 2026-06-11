// packages/ai-core/src/providers/cohere.ts

import type { ProviderConfig } from '../types';

export const COHERE_CONFIG: ProviderConfig = {
  id: 'cohere',
  baseUrl: 'https://api.cohere.com/v2',
  apiKeyEnvVar: 'COHERE_API_KEY',
  sdkType: 'custom',
  supportsStreaming: true,
  supportsFunctionCalling: true,
  supportsVision: false,
  rateLimits: {
    requestsPerMinute: 20,
    requestsPerDay: 1000,
    tokensPerMinute: 100000,
    tokensPerDay: 1000000,
  },
  models: [
    {
      id: 'command-r-plus-08-2024',
      contextWindow: 128000,
      maxOutput: 4096,
      taskSuitability: ['reasoning', 'research', 'chat-general'],
      costTier: 'free',
      speed: 'medium',
    },
    {
      id: 'embed-english-v3.0',
      contextWindow: 512,
      maxOutput: 0,
      taskSuitability: ['embedding'],
      costTier: 'free',
      speed: 'ultra-fast',
    },
    {
      id: 'embed-multilingual-v3.0',
      contextWindow: 512,
      maxOutput: 0,
      taskSuitability: ['embedding'],
      costTier: 'free',
      speed: 'ultra-fast',
    },
  ],
};

export default COHERE_CONFIG;

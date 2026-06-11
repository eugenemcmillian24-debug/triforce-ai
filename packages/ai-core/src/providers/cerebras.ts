// packages/ai-core/src/providers/cerebras.ts

import type { ProviderConfig } from '../types';

export const CEREBRAS_CONFIG: ProviderConfig = {
  id: 'cerebras',
  baseUrl: 'https://api.cerebras.ai/v1',
  apiKeyEnvVar: 'CEREBRAS_API_KEY',
  sdkType: 'openai-compat',
  supportsStreaming: true,
  supportsFunctionCalling: true,
  supportsVision: false,
  rateLimits: {
    requestsPerMinute: 30,
    requestsPerDay: 14400,
    tokensPerMinute: 60000,
    tokensPerDay: 1000000,
  },
  models: [
    {
      id: 'llama-3.3-70b',
      contextWindow: 128000,
      maxOutput: 8192,
      taskSuitability: ['chat-general', 'code-generation', 'reasoning'],
      costTier: 'free',
      speed: 'ultra-fast',
    },
    {
      id: 'llama-4-scout-17b-16e-instruct',
      contextWindow: 131072,
      maxOutput: 8192,
      taskSuitability: ['code-generation', 'chat-general'],
      costTier: 'free',
      speed: 'ultra-fast',
    },
  ],
};

export default CEREBRAS_CONFIG;

// packages/ai-core/src/providers/deepseek.ts

import type { ProviderConfig } from '../types';

export const DEEPSEEK_CONFIG: ProviderConfig = {
  id: 'deepseek',
  baseUrl: 'https://api.deepseek.com/v1',
  apiKeyEnvVar: 'DEEPSEEK_API_KEY',
  sdkType: 'openai-compat',
  supportsStreaming: true,
  supportsFunctionCalling: true,
  supportsVision: false,
  rateLimits: {
    requestsPerMinute: 60,
    requestsPerDay: 10000,
    tokensPerMinute: 200000,
    tokensPerDay: 5000000,
  },
  models: [
    {
      id: 'deepseek-chat',
      contextWindow: 65536,
      maxOutput: 8192,
      taskSuitability: ['chat-general', 'code-generation', 'code-review'],
      costTier: 'free',
      speed: 'fast',
    },
    {
      id: 'deepseek-reasoner',
      contextWindow: 65536,
      maxOutput: 8192,
      taskSuitability: ['reasoning', 'agi-grade'],
      costTier: 'free',
      speed: 'medium',
    },
    {
      id: 'deepseek-coder',
      contextWindow: 65536,
      maxOutput: 4096,
      taskSuitability: ['code-generation', 'code-review'],
      costTier: 'free',
      speed: 'fast',
    },
  ],
};

export default DEEPSEEK_CONFIG;

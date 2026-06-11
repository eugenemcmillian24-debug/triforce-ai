// packages/ai-core/src/providers/sambanova.ts

import type { ProviderConfig } from '../types';

export const SAMBANOVA_CONFIG: ProviderConfig = {
  id: 'sambanova',
  baseUrl: 'https://api.sambanova.ai/v1',
  apiKeyEnvVar: 'SAMBANOVA_API_KEY',
  sdkType: 'openai-compat',
  supportsStreaming: true,
  supportsFunctionCalling: true,
  supportsVision: false,
  rateLimits: {
    requestsPerMinute: 30,
    requestsPerDay: 1000,
    tokensPerMinute: 100000,
    tokensPerDay: 1000000,
  },
  models: [
    {
      id: 'Meta-Llama-3.3-70B-Instruct',
      contextWindow: 131072,
      maxOutput: 4096,
      taskSuitability: ['chat-general', 'code-generation'],
      costTier: 'free',
      speed: 'ultra-fast',
    },
    {
      id: 'DeepSeek-R1-Distill-Llama-70B',
      contextWindow: 32768,
      maxOutput: 4096,
      taskSuitability: ['reasoning', 'code-review'],
      costTier: 'free',
      speed: 'fast',
    },
    {
      id: 'QwQ-32B',
      contextWindow: 32768,
      maxOutput: 4096,
      taskSuitability: ['reasoning', 'agi-grade'],
      costTier: 'free',
      speed: 'medium',
    },
  ],
};

export default SAMBANOVA_CONFIG;

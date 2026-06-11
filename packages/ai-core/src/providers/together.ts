// packages/ai-core/src/providers/together.ts

import type { ProviderConfig } from '../types';

export const TOGETHER_CONFIG: ProviderConfig = {
  id: 'together',
  baseUrl: 'https://api.together.xyz/v1',
  apiKeyEnvVar: 'TOGETHER_AI_API_KEY',
  sdkType: 'openai-compat',
  supportsStreaming: true,
  supportsFunctionCalling: true,
  supportsVision: false,
  rateLimits: {
    requestsPerMinute: 60,
    requestsPerDay: 1000,
    tokensPerMinute: 100000,
    tokensPerDay: 1000000,
  },
  models: [
    {
      id: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
      contextWindow: 131072,
      maxOutput: 8192,
      taskSuitability: ['chat-general', 'code-generation'],
      costTier: 'free',
      speed: 'fast',
    },
    {
      id: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free',
      contextWindow: 65536,
      maxOutput: 4096,
      taskSuitability: ['reasoning', 'code-review'],
      costTier: 'free',
      speed: 'medium',
    },
  ],
};

export default TOGETHER_CONFIG;

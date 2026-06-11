// packages/ai-core/src/providers/zhipu.ts

import type { ProviderConfig } from '../types';

export const ZHIPU_CONFIG: ProviderConfig = {
  id: 'zhipu',
  baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
  apiKeyEnvVar: 'ZHIPU_API_KEY',
  sdkType: 'openai-compat',
  supportsStreaming: true,
  supportsFunctionCalling: true,
  supportsVision: true,
  rateLimits: {
    requestsPerMinute: 5,
    requestsPerDay: 200,
    tokensPerMinute: 10000,
    tokensPerDay: 100000,
  },
  models: [
    {
      id: 'glm-4-flash',
      contextWindow: 128000,
      maxOutput: 4096,
      taskSuitability: ['chat-general', 'reasoning'],
      costTier: 'free',
      speed: 'fast',
    },
    {
      id: 'glm-4v-flash',
      contextWindow: 8192,
      maxOutput: 1024,
      taskSuitability: ['chat-general'],
      costTier: 'free',
      speed: 'fast',
    },
  ],
};

export default ZHIPU_CONFIG;

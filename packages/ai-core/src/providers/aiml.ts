// packages/ai-core/src/providers/aiml.ts

import type { ProviderConfig } from '../types';

export const AIML_CONFIG: ProviderConfig = {
  id: 'aiml',
  baseUrl: 'https://api.aimlapi.com/v2',
  apiKeyEnvVar: 'AIML_API_KEY',
  sdkType: 'openai-compat',
  supportsStreaming: true,
  supportsFunctionCalling: true,
  supportsVision: true,
  rateLimits: {
    requestsPerMinute: 10,
    requestsPerDay: 200,
    tokensPerMinute: 50000,
    tokensPerDay: 300000,
  },
  models: [
    {
      id: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
      contextWindow: 131072,
      maxOutput: 8192,
      taskSuitability: ['chat-general', 'code-generation'],
      costTier: 'free',
      speed: 'fast',
    },
    {
      id: 'deepseek/deepseek-r1',
      contextWindow: 65536,
      maxOutput: 8192,
      taskSuitability: ['reasoning', 'agi-grade'],
      costTier: 'free',
      speed: 'medium',
    },
  ],
];

export default AIML_CONFIG;

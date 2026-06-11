// packages/ai-core/src/providers/openrouter.ts

import type { ProviderConfig } from '../types';

export const OPENROUTER_CONFIG: ProviderConfig = {
  id: 'openrouter',
  baseUrl: 'https://openrouter.ai/api/v1',
  apiKeyEnvVar: 'OPENROUTER_API_KEY',
  sdkType: 'openai-compat',
  supportsStreaming: true,
  supportsFunctionCalling: true,
  supportsVision: true,
  rateLimits: {
    requestsPerMinute: 20,
    requestsPerDay: 200,
    tokensPerMinute: 20000,
    tokensPerDay: 1000000,
  },
  models: [
    {
      id: 'deepseek/deepseek-v4-flash:free',
      contextWindow: 163840,
      maxOutput: 8192,
      taskSuitability: ['reasoning', 'code-review', 'code-generation'],
      costTier: 'free',
      speed: 'medium',
    },
    {
      id: 'deepseek/deepseek-r1:free',
      contextWindow: 163840,
      maxOutput: 8000,
      taskSuitability: ['reasoning', 'agi-grade'],
      costTier: 'free',
      speed: 'slow',
    },
    {
      id: 'meta-llama/llama-3.3-70b-instruct:free',
      contextWindow: 131072,
      maxOutput: 4096,
      taskSuitability: ['chat-general', 'code-generation'],
      costTier: 'free',
      speed: 'medium',
    },
    {
      id: 'qwen/qwen3-coder:free',
      contextWindow: 131072,
      maxOutput: 8192,
      taskSuitability: ['code-generation', 'code-review'],
      costTier: 'free',
      speed: 'medium',
    },
    {
      id: 'openai/gpt-oss-120b:free',
      contextWindow: 128000,
      maxOutput: 4096,
      taskSuitability: ['reasoning', 'chat-general'],
      costTier: 'free',
      speed: 'medium',
    },
    {
      id: 'nvidia/nemotron-super-49b-v1:free',
      contextWindow: 131072,
      maxOutput: 4096,
      taskSuitability: ['reasoning', 'agi-grade'],
      costTier: 'free',
      speed: 'medium',
    },
    {
      id: 'google/gemma-3-27b-it:free',
      contextWindow: 131072,
      maxOutput: 8192,
      taskSuitability: ['chat-general', 'code-generation'],
      costTier: 'free',
      speed: 'fast',
    },
  ],
};

export default OPENROUTER_CONFIG;

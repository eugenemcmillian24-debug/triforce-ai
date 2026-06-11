// packages/ai-core/src/providers/nvidia.ts

import type { ProviderConfig } from '../types';

export const NVIDIA_CONFIG: ProviderConfig = {
  id: 'nvidia',
  baseUrl: 'https://integrate.api.nvidia.com/v1',
  apiKeyEnvVar: 'NVIDIA_NIM_API_KEY',
  sdkType: 'openai-compat',
  supportsStreaming: true,
  supportsFunctionCalling: false,
  supportsVision: true,
  rateLimits: {
    requestsPerMinute: 40,
    requestsPerDay: 1000,
    tokensPerMinute: 40000,
    tokensPerDay: 400000,
  },
  models: [
    {
      id: 'nvidia/llama-3.1-nemotron-ultra-253b-v1',
      contextWindow: 131072,
      maxOutput: 8192,
      taskSuitability: ['reasoning', 'agi-grade', 'singularity-grade'],
      costTier: 'free',
      speed: 'slow',
    },
    {
      id: 'deepseek-ai/deepseek-r1',
      contextWindow: 163840,
      maxOutput: 4096,
      taskSuitability: ['reasoning', 'agi-grade'],
      costTier: 'free',
      speed: 'medium',
    },
    {
      id: 'meta/llama-3.3-70b-instruct',
      contextWindow: 131072,
      maxOutput: 4096,
      taskSuitability: ['chat-general', 'code-generation'],
      costTier: 'free',
      speed: 'fast',
    },
  ],
};

export default NVIDIA_CONFIG;

// packages/ai-core/src/providers/cloudflare-ai.ts

import type { ProviderConfig } from '../types';

export const CLOUDFLARE_AI_CONFIG: ProviderConfig = {
  id: 'cloudflare-ai',
  baseUrl: 'https://api.cloudflare.com/client/v4/accounts/{CLOUDFLARE_ACCOUNT_ID}/ai/run',
  apiKeyEnvVar: 'CLOUDFLARE_API_TOKEN',
  sdkType: 'custom',
  supportsStreaming: true,
  supportsFunctionCalling: false,
  supportsVision: true,
  rateLimits: {
    requestsPerMinute: 300,
    requestsPerDay: 10000,
    tokensPerMinute: 300000,
    tokensPerDay: 1000000,
  },
  models: [
    {
      id: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
      contextWindow: 131072,
      maxOutput: 8192,
      taskSuitability: ['chat-general', 'code-generation'],
      costTier: 'free',
      speed: 'ultra-fast',
    },
    {
      id: '@cf/black-forest-labs/flux-1-schnell',
      contextWindow: 0,
      maxOutput: 0,
      taskSuitability: ['image-generation'],
      costTier: 'free',
      speed: 'fast',
    },
    {
      id: '@cf/baai/bge-large-en-v1.5',
      contextWindow: 512,
      maxOutput: 0,
      taskSuitability: ['embedding'],
      costTier: 'free',
      speed: 'ultra-fast',
    },
  ],
};

export default CLOUDFLARE_AI_CONFIG;

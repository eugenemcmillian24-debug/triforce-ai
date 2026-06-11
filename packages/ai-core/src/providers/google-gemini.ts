// packages/ai-core/src/providers/google-gemini.ts

import type { ProviderConfig } from '../types';

export const GOOGLE_GEMINI_CONFIG: ProviderConfig = {
  id: 'google-gemini',
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
  apiKeyEnvVar: 'GOOGLE_GEMINI_API_KEY',
  sdkType: 'custom',
  supportsStreaming: true,
  supportsFunctionCalling: true,
  supportsVision: true,
  rateLimits: {
    requestsPerMinute: 15,
    requestsPerDay: 1500,
    tokensPerMinute: 1000000,
    tokensPerDay: 25000000,
  },
  models: [
    {
      id: 'gemini-2.5-flash-preview-05-20',
      contextWindow: 1048576,
      maxOutput: 65536,
      taskSuitability: ['research', 'reasoning', 'agi-grade', 'code-generation'],
      costTier: 'free',
      speed: 'fast',
    },
    {
      id: 'gemini-2.0-flash',
      contextWindow: 1048576,
      maxOutput: 8192,
      taskSuitability: ['chat-general', 'research', 'code-generation'],
      costTier: 'free',
      speed: 'ultra-fast',
    },
    {
      id: 'gemini-embedding-exp',
      contextWindow: 8192,
      maxOutput: 0,
      taskSuitability: ['embedding'],
      costTier: 'free',
      speed: 'fast',
    },
  ],
};

export default GOOGLE_GEMINI_CONFIG;

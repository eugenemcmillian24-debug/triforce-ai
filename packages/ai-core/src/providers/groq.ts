// packages/ai-core/src/providers/groq.ts

import type { ProviderConfig } from '../types';

export const GROQ_CONFIG: ProviderConfig = {
  id: 'groq',
  baseUrl: 'https://api.groq.com/openai/v1',
  apiKeyEnvVar: 'GROQ_API_KEY',
  sdkType: 'openai-compat',
  supportsStreaming: true,
  supportsFunctionCalling: true,
  supportsVision: false,
  rateLimits: {
    requestsPerMinute: 30,
    requestsPerDay: 14400,
    tokensPerMinute: 6000,
    tokensPerDay: 500000,
  },
  models: [
    {
      id: 'llama-4-scout-17b-16e-instruct',
      contextWindow: 131072,
      maxOutput: 8192,
      taskSuitability: ['code-generation', 'chat-general'],
      costTier: 'free',
      speed: 'ultra-fast',
    },
    {
      id: 'llama-3.3-70b-versatile',
      contextWindow: 128000,
      maxOutput: 32768,
      taskSuitability: ['reasoning', 'chat-general', 'code-review'],
      costTier: 'free',
      speed: 'fast',
    },
    {
      id: 'llama-3.1-8b-instant',
      contextWindow: 131072,
      maxOutput: 8192,
      taskSuitability: ['chat-general'],
      costTier: 'free',
      speed: 'ultra-fast',
    },
    {
      id: 'whisper-large-v3-turbo',
      contextWindow: 0,
      maxOutput: 0,
      taskSuitability: ['audio-transcription'],
      costTier: 'free',
      speed: 'fast',
    },
    {
      id: 'gemma2-9b-it',
      contextWindow: 8192,
      maxOutput: 8192,
      taskSuitability: ['chat-general'],
      costTier: 'free',
      speed: 'ultra-fast',
    },
  ],
};

export default GROQ_CONFIG;

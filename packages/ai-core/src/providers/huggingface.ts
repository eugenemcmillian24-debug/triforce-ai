// packages/ai-core/src/providers/huggingface.ts

import type { ProviderConfig } from '../types';

export const HUGGINGFACE_CONFIG: ProviderConfig = {
  id: 'huggingface',
  baseUrl: 'https://api-inference.huggingface.co/models',
  apiKeyEnvVar: 'HUGGINGFACE_API_KEY',
  sdkType: 'custom',
  supportsStreaming: true,
  supportsFunctionCalling: false,
  supportsVision: true,
  rateLimits: {
    requestsPerMinute: 30,
    requestsPerDay: 1000,
    tokensPerMinute: 10000,
    tokensPerDay: 100000,
  },
  models: [
    {
      id: 'meta-llama/Llama-3.1-8B-Instruct',
      contextWindow: 131072,
      maxOutput: 4096,
      taskSuitability: ['chat-general'],
      costTier: 'free',
      speed: 'medium',
    },
    {
      id: 'black-forest-labs/FLUX.1-schnell',
      contextWindow: 0,
      maxOutput: 0,
      taskSuitability: ['image-generation'],
      costTier: 'free',
      speed: 'medium',
    },
    {
      id: 'sentence-transformers/all-MiniLM-L6-v2',
      contextWindow: 512,
      maxOutput: 0,
      taskSuitability: ['embedding'],
      costTier: 'free',
      speed: 'ultra-fast',
    },
    {
      id: 'openai/whisper-large-v3',
      contextWindow: 0,
      maxOutput: 0,
      taskSuitability: ['audio-transcription'],
      costTier: 'free',
      speed: 'medium',
    },
  ],
};

export default HUGGINGFACE_CONFIG;

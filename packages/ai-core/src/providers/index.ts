import { GROQ_CONFIG } from './groq';
import { OPENROUTER_CONFIG } from './openrouter';
import { MISTRAL_CONFIG } from './mistral';
import { HUGGINGFACE_CONFIG } from './huggingface';
import { GITHUB_MODELS_CONFIG } from './github-models';
import { GOOGLE_GEMINI_CONFIG } from './google-gemini';
import { CEREBRAS_CONFIG } from './cerebras';
import { NVIDIA_CONFIG } from './nvidia';
import { COHERE_CONFIG } from './cohere';
import { DEEPSEEK_CONFIG } from './deepseek';
import { CLOUDFLARE_AI_CONFIG } from './cloudflare-ai';
import { TOGETHER_CONFIG } from './together';
import { ZHIPU_CONFIG } from './zhipu';
import { AIML_CONFIG } from './aiml';
import { SAMBANOVA_CONFIG } from './sambanova';
import type { ProviderConfig } from '../types';

export const ALL_PROVIDERS: ProviderConfig[] = [
  GROQ_CONFIG,
  OPENROUTER_CONFIG,
  MISTRAL_CONFIG,
  HUGGINGFACE_CONFIG,
  GITHUB_MODELS_CONFIG,
  GOOGLE_GEMINI_CONFIG,
  CEREBRAS_CONFIG,
  NVIDIA_CONFIG,
  COHERE_CONFIG,
  DEEPSEEK_CONFIG,
  CLOUDFLARE_AI_CONFIG,
  TOGETHER_CONFIG,
  ZHIPU_CONFIG,
  AIML_CONFIG,
  SAMBANOVA_CONFIG,
];

export function getProviderConfig(providerId: string): ProviderConfig | undefined {
  return ALL_PROVIDERS.find((provider) => provider.id === providerId);
}

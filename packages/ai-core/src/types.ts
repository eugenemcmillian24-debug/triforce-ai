// packages/ai-core/src/types.ts

export type TaskType =
  | 'code-generation'
  | 'code-review'
  | 'reasoning'
  | 'chat-general'
  | 'embedding'
  | 'image-generation'
  | 'audio-transcription'
  | 'research'
  | 'agi-grade'
  | 'singularity-grade';

export interface ModelConfig {
  id: string;
  contextWindow: number;
  maxOutput: number;
  taskSuitability: TaskType[];
  costTier: 'free' | 'credits';
  speed: 'ultra-fast' | 'fast' | 'medium' | 'slow';
}

export interface ProviderConfig {
  id: string;
  baseUrl: string;
  apiKeyEnvVar: string;
  sdkType: 'openai-compat' | 'custom' | 'ollama-compat';
  models: ModelConfig[];
  rateLimits: RateLimitConfig;
  supportsStreaming: boolean;
  supportsFunctionCalling: boolean;
  supportsVision: boolean;
}

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerDay: number;
  tokensPerMinute: number;
  tokensPerDay: number;
}

export interface AIResponse {
  content: string;
  provider: string;
  modelId: string;
  tokensUsed: number;
  latencyMs: number;
  agiMode: boolean;
}

export interface RateLimitState {
  providerId: string;
  requestsThisMinute: number;
  requestsToday: number;
  tokensThisMinute: number;
  tokensToday: number;
  minuteResetAt: number;
  dayResetAt: number;
}

export interface AGIDetectionInput {
  prompt: string;
  workflowNodes?: unknown[];
  hasFeedbackLoop?: boolean;
  hasResearchPhase?: boolean;
  hasMultipleCapabilities?: boolean;
}

export interface AGIDetectionResult {
  isAGI: boolean;
  isSingularity: boolean;
  confidence: number;
  triggers: string[];
  recommendedChain: string[];
  estimatedTokens: number;
  researchRequired: boolean;
}

export interface ResearchReport {
  context: AIResponse;
  synthesis: AIResponse;
  roadmap: AIResponse;
}

export const AGI_TRIGGER_KEYWORDS = [
  'autonomous',
  'agent',
  'self-improving',
  'recursive',
  'agi',
  'singularity',
  'general intelligence',
  'self-correcting',
  'meta-learning',
  'self-aware',
  'emergent',
  'orchestrator',
  'multi-agent',
  'planner',
  'reasoner',
  'reflection loop',
];

export const SINGULARITY_TRIGGER_KEYWORDS = [
  'singularity',
  'self-replicating',
  'recursive self-improvement',
  'maximize intelligence',
  'unbounded',
  'infinite loop',
  'bootstrapping',
];

export const AGI_CHAIN = ['google-gemini', 'openrouter', 'groq', 'mistral', 'nvidia'];
export const SINGULARITY_CHAIN = ['google-gemini', 'openrouter', 'nvidia', 'groq', 'mistral', 'cerebras', 'deepseek', 'together'];

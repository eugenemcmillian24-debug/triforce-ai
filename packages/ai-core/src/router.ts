import type { TaskType, AIResponse, ProviderConfig } from './types';
import { getProviderConfig } from './providers';
import { RateLimiter } from './rate-limiter';
import { cascadeWithFallback } from './fallback';
import { detectAGI } from './agi-detector';

let rateLimiter: RateLimiter | null = null;

export function initializeRouter(kv?: KVNamespace): void {
  rateLimiter = new RateLimiter(kv);
}

function getApiKey(envVar: string): string {
  const apiKey = process.env[envVar];
  if (!apiKey) {
    throw new Error(`Missing API key: ${envVar}`);
  }
  return apiKey;
}

async function callOpenAICompat(
  config: ProviderConfig,
  modelId: string,
  prompt: string
): Promise<AIResponse> {
  const apiKey = getApiKey(config.apiKeyEnvVar);
  const startTime = Date.now();

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: 'user', content: prompt }],
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Provider ${config.id} error: ${response.status} ${await response.text()}`);
  }

  const data = await response.json() as any;
  const content = data.choices?.[0]?.message?.content ?? '';
  const tokensUsed = data.usage?.total_tokens ?? 0;

  return {
    content,
    provider: config.id,
    modelId,
    tokensUsed,
    latencyMs: Date.now() - startTime,
    agiMode: false,
  };
}

export async function callProvider(providerId: string, task: TaskType, prompt: string): Promise<AIResponse> {
  const config = getProviderConfig(providerId);
  if (!config) throw new Error(`Unknown provider: ${providerId}`);

  const suitableModels = config.models.filter((model) => model.taskSuitability.includes(task));
  if (!suitableModels.length) throw new Error(`No suitable model found for ${providerId} and task ${task}`);

  const model = suitableModels[0];
  return callOpenAICompat(config, model.id, prompt);
}

export async function routeToProvider(
  task: TaskType,
  prompt: string,
  options?: { forceProvider?: string; agiMode?: boolean }
): Promise<AIResponse> {
  if (!rateLimiter) rateLimiter = new RateLimiter();

  if (options?.agiMode) {
    const detection = detectAGI({ prompt });
    if (detection.isAGI) {
      return executeAGIChain(prompt, detection.recommendedChain);
    }
  }

  if (options?.forceProvider) {
    return callProvider(options.forceProvider, task, prompt);
  }

  return cascadeWithFallback(task, prompt, rateLimiter);
}

async function executeAGIChain(prompt: string, chain: string[]): Promise<AIResponse> {
  let currentPrompt = prompt;
  const responses: AIResponse[] = [];

  for (const providerId of chain) {
    const response = await callProvider(providerId, 'agi-grade', currentPrompt);
    responses.push(response);
    currentPrompt = response.content;
  }

  const finalResponse = responses[responses.length - 1];
  return {
    ...finalResponse,
    agiMode: true,
    tokensUsed: responses.reduce((sum, response) => sum + response.tokensUsed, 0),
    latencyMs: responses.reduce((sum, response) => sum + response.latencyMs, 0),
  };
}

export default routeToProvider;

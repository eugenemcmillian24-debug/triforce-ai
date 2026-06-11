import type { AGIDetectionInput, AGIDetectionResult } from './types';
import { AGI_TRIGGER_KEYWORDS, SINGULARITY_TRIGGER_KEYWORDS, AGI_CHAIN, SINGULARITY_CHAIN } from './types';

export function detectAGI(input: AGIDetectionInput): AGIDetectionResult {
  const text = input.prompt.toLowerCase();
  const triggers: string[] = [];

  for (const keyword of AGI_TRIGGER_KEYWORDS) {
    if (text.includes(keyword)) triggers.push(keyword);
  }

  const isSingularity = SINGULARITY_TRIGGER_KEYWORDS.some((k) => text.includes(k));
  const isAGI = isSingularity || triggers.length > 0 || !!input.hasFeedbackLoop || !!input.hasResearchPhase || !!input.hasMultipleCapabilities;

  return {
    isAGI,
    isSingularity,
    confidence: isSingularity ? 0.99 : isAGI ? 0.82 : 0.15,
    triggers,
    recommendedChain: isSingularity ? SINGULARITY_CHAIN : AGI_CHAIN,
    estimatedTokens: isSingularity ? 300000 : isAGI ? 100000 : 15000,
    researchRequired: !!input.hasResearchPhase,
  };
}

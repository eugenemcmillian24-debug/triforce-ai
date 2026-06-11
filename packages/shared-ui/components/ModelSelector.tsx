import React, { useMemo } from 'react';
import type { ProviderConfig, TaskType } from '@triforce-ai/core';

interface ModelSelectorProps {
  taskType: TaskType;
  providers: ProviderConfig[];
  onSelect: (providerId: string, modelId: string) => void;
  selectedProvider?: string;
  selectedModel?: string;
}

export function ModelSelector({
  taskType,
  providers,
  onSelect,
  selectedProvider,
  selectedModel,
}: ModelSelectorProps) {
  const options = useMemo(
    () =>
      providers.flatMap((provider) =>
        provider.models
          .filter((model) => model.taskSuitability.includes(taskType))
          .map((model) => ({ provider, model }))
      ),
    [providers, taskType]
  );

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {options.map(({ provider, model }) => {
        const active = provider.id === selectedProvider && model.id === selectedModel;
        return (
          <button
            key={`${provider.id}:${model.id}`}
            onClick={() => onSelect(provider.id, model.id)}
            className={`rounded-xl border p-4 text-left transition ${
              active ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'
            }`}
          >
            <div className="text-sm font-semibold text-white">{provider.id}</div>
            <div className="text-xs text-slate-300">{model.id}</div>
            <div className="mt-2 text-[11px] text-slate-400">{model.speed} · {model.costTier}</div>
          </button>
        );
      })}
    </div>
  );
}

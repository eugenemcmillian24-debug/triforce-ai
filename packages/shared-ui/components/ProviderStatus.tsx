import React from 'react';
import type { ProviderConfig } from '@triforce-ai/core';

interface ProviderStatusProps {
  providers: ProviderConfig[];
}

export function ProviderStatus({ providers }: ProviderStatusProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {providers.map((provider) => (
        <div key={provider.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">{provider.id}</div>
              <div className="text-xs text-slate-400">{provider.sdkType}</div>
            </div>
            <div className="text-xs rounded-full bg-emerald-500/15 px-2 py-1 text-emerald-300">available</div>
          </div>
        </div>
      ))}
    </div>
  );
}

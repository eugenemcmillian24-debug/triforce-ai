import React from 'react';

interface AGIBadgeProps {
  isAGI: boolean;
  isSingularity?: boolean;
  confidence: number;
  triggers: string[];
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function AGIBadge({
  isAGI,
  isSingularity = false,
  confidence,
  triggers,
  onConfirm,
  onCancel,
}: AGIBadgeProps) {
  if (!isAGI) return null;

  return (
    <div className="rounded-xl border border-amber-500/50 bg-amber-500/10 p-4 text-amber-100">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold uppercase tracking-wide">
            {isSingularity ? 'Singularity mode detected' : 'AGI mode detected'}
          </div>
          <div className="text-xs text-amber-200/80">Confidence: {Math.round(confidence * 100)}%</div>
        </div>
        <div className="text-xs rounded-full bg-amber-500/20 px-3 py-1">{triggers.length} triggers</div>
      </div>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-amber-50/90">
        {triggers.map((trigger) => (
          <li key={trigger}>{trigger}</li>
        ))}
      </ul>
      <div className="flex gap-2">
        {onCancel && (
          <button onClick={onCancel} className="rounded-lg border border-amber-500/40 px-4 py-2 text-sm">
            Cancel
          </button>
        )}
        {onConfirm && (
          <button onClick={onConfirm} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950">
            Proceed
          </button>
        )}
      </div>
    </div>
  );
}

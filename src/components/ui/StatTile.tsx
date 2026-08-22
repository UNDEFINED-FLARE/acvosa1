import type { ReactNode } from 'react';

interface StatTileProps {
  label: string;
  value: ReactNode;
  sub?: string;
  icon?: ReactNode;
  className?: string;
}

export function StatTile({ label, value, sub, icon, className = '' }: StatTileProps) {
  return (
    <div className={`bg-ink-white border border-ink-light-grey rounded-2xl p-5 shadow-soft transition-all duration-300 hover:shadow-card hover:border-ink-grey ${className}`}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-ink-dark-grey/60 uppercase tracking-wider">{label}</span>
        {icon && <span className="text-ink-dark-grey/40">{icon}</span>}
      </div>
      <div className="mt-3">
        <p className="text-2xl sm:text-3xl font-bold text-ink-charcoal tracking-tight tabular-nums">{value}</p>
        {sub && <p className="text-xs text-ink-dark-grey/60 mt-1 tracking-tight">{sub}</p>}
      </div>
    </div>
  );
}

interface LargeStatProps {
  label: string;
  value: ReactNode;
  className?: string;
}

export function LargeStat({ label, value, className = '' }: LargeStatProps) {
  return (
    <div className={`text-center sm:text-left ${className}`}>
      <p className="text-4xl sm:text-5xl font-bold text-ink-charcoal tracking-tight tabular-nums">{value}</p>
      <p className="text-sm text-ink-dark-grey/70 mt-1.5 tracking-tight">{label}</p>
    </div>
  );
}

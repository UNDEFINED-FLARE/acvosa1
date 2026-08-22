import type { ReactNode } from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({ title, subtitle, action, className = '' }: SectionHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        <h2 className="text-lg sm:text-xl font-semibold text-ink-charcoal tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-ink-dark-grey/70 mt-0.5 tracking-tight">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function PageHeader({ title, subtitle, className = '' }: PageHeaderProps) {
  return (
    <div className={className}>
      <h1 className="text-2xl sm:text-3xl font-bold text-ink-charcoal tracking-tight leading-tight">{title}</h1>
      {subtitle && <p className="text-sm sm:text-base text-ink-dark-grey/70 mt-1.5 tracking-tight">{subtitle}</p>}
    </div>
  );
}

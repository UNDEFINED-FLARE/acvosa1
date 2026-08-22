import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {icon && <div className="w-14 h-14 rounded-2xl bg-ink-light-grey flex items-center justify-center text-ink-dark-grey/40 mb-4">{icon}</div>}
      <h3 className="text-base font-semibold text-ink-charcoal tracking-tight">{title}</h3>
      {description && <p className="text-sm text-ink-dark-grey/60 mt-1.5 max-w-xs">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

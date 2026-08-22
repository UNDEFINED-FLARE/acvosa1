interface ProgressProps {
  value: number;
  max: number;
  className?: string;
  tone?: 'dark' | 'light';
}

export function Progress({ value, max, className = '', tone = 'dark' }: ProgressProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className={`h-2 w-full rounded-full bg-ink-light-grey overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-700 ease-smooth ${
          tone === 'dark' ? 'bg-ink-black' : 'bg-ink-dark-grey'
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

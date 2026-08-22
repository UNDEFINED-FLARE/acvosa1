import type { ReactNode } from 'react';

type Tone = 'default' | 'dark' | 'light' | 'outline' | 'solid';

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  dot?: boolean;
}

const toneClasses: Record<Tone, string> = {
  default: 'bg-ink-light-grey text-ink-dark-grey border-ink-light-grey',
  dark: 'bg-ink-charcoal text-ink-white border-ink-charcoal',
  light: 'bg-ink-off-white text-ink-dark-grey border-ink-light-grey',
  outline: 'bg-transparent text-ink-dark-grey border-ink-grey',
  solid: 'bg-ink-black text-ink-white border-ink-black',
};

export function Badge({ children, tone = 'default', className = '', dot }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-2xs font-medium rounded-full border tracking-tight ${toneClasses[tone]} ${className}`}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}

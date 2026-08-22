import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-ink-black text-ink-white hover:bg-ink-charcoal active:bg-ink-black shadow-soft',
  secondary:
    'bg-ink-light-grey text-ink-charcoal hover:bg-ink-grey hover:text-ink-black border border-ink-grey',
  ghost: 'bg-transparent text-ink-dark-grey hover:bg-ink-light-grey hover:text-ink-black',
  outline:
    'bg-transparent text-ink-charcoal border border-ink-grey hover:border-ink-dark-grey hover:bg-ink-off-white',
  danger:
    'bg-transparent text-ink-charcoal border border-ink-grey hover:border-ink-black hover:bg-ink-black hover:text-ink-white',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-4 text-[13px] rounded-xl',
  md: 'h-11 px-5 text-sm rounded-xl',
  lg: 'h-13 px-7 text-[15px] rounded-2xl py-3.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium tracking-tight transition-all duration-200 ease-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-dark-grey/30 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-off-white disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}

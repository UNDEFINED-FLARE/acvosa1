interface AvatarProps {
  initials: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

export function Avatar({ initials, size = 'md', className = '' }: AvatarProps) {
  return (
    <div
      className={`${sizes[size]} ${className} shrink-0 rounded-full bg-ink-charcoal text-ink-white flex items-center justify-center font-semibold tracking-tight select-none`}
    >
      {initials}
    </div>
  );
}

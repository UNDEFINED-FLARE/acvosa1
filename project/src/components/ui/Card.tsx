import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padded?: boolean;
}

export function Card({ children, hover, padded = true, className = '', ...rest }: CardProps) {
  return (
    <div
      className={`bg-ink-white border border-ink-light-grey rounded-2xl shadow-soft transition-all duration-300 ease-smooth ${
        hover ? 'hover:shadow-card hover:-translate-y-0.5 hover:border-ink-grey cursor-pointer' : ''
      } ${padded ? 'p-5' : ''} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

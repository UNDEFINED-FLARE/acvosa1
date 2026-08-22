import type { ReactNode } from 'react';

export function SkeletonCard({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-ink-light-grey ${className}`} />;
}

export function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-ink-light-grey ${className}`} />;
}

export function PageSkeleton() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto">
      <SkeletonLine className="h-8 w-48 mb-2" />
      <SkeletonLine className="h-4 w-72 mb-8" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} className="h-28" />
        ))}
      </div>
      <SkeletonCard className="h-64 mb-6" />
      <div className="grid sm:grid-cols-2 gap-4">
        <SkeletonCard className="h-48" />
        <SkeletonCard className="h-48" />
      </div>
    </div>
  );
}

export function Spinner({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <div
      className={`animate-spin-slow rounded-full border-2 border-ink-light-grey border-t-ink-charcoal ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export function FullPageLoader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-ink-off-white">
      <Spinner size={36} />
      <p className="text-sm text-ink-dark-grey/60 tracking-tight">{label}</p>
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  children?: ReactNode;
}

export function ErrorState({ title = 'Something went wrong', message, onRetry, children }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-14 h-14 rounded-2xl bg-ink-light-grey flex items-center justify-center mb-4">
        <span className="text-ink-dark-grey/40 text-xl">!</span>
      </div>
      <h3 className="text-base font-semibold text-ink-charcoal tracking-tight">{title}</h3>
      {message && <p className="text-sm text-ink-dark-grey/60 mt-1.5 max-w-xs tracking-tight">{message}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 px-5 h-10 rounded-xl bg-ink-black text-ink-white text-sm font-medium tracking-tight hover:bg-ink-charcoal transition-colors"
        >
          Try again
        </button>
      )}
      {children}
    </div>
  );
}

export function DemoModeBanner() {
  return (
    <div className="bg-ink-charcoal text-ink-white text-center py-1.5 text-2xs font-medium tracking-tight">
      Demo Mode — Data is not being saved to Firebase. Configure .env to enable persistence.
    </div>
  );
}

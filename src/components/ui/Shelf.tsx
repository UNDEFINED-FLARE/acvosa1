import { useRef, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ShelfProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Shelf({ title, subtitle, action, children, className = '' }: ShelfProps) {
  const rail = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: -1 | 1) => {
    const el = rail.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.max(el.clientWidth * 0.8, 260), behavior: 'smooth' });
  };

  return (
    <section className={className}>
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-semibold text-ink-charcoal tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-ink-dark-grey/70 mt-0.5 tracking-tight">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {action}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => scrollBy(-1)}
              aria-label={`Scroll ${title} left`}
              className="w-8 h-8 rounded-full border border-ink-light-grey bg-ink-white text-ink-dark-grey hover:border-ink-grey hover:text-ink-charcoal transition-colors flex items-center justify-center"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scrollBy(1)}
              aria-label={`Scroll ${title} right`}
              className="w-8 h-8 rounded-full border border-ink-light-grey bg-ink-white text-ink-dark-grey hover:border-ink-grey hover:text-ink-charcoal transition-colors flex items-center justify-center"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={rail}
        className="mt-4 flex gap-4 overflow-x-auto scrollbar-thin snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {children}
      </div>
    </section>
  );
}

export function ShelfItem({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`snap-start shrink-0 w-[min(20rem,80vw)] ${className}`}>
      {children}
    </div>
  );
}

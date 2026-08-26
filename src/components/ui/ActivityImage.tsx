import type { LucideIcon } from 'lucide-react';
import { CalendarDays, Users, Clock, MapPin } from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  entrepreneurship: Users,
  leadership: Users,
  community: MapPin,
  academic: CalendarDays,
  volunteer: Users,
  social: Users,
  digital: CalendarDays,
  research: CalendarDays,
};

export function ActivityImage({ seed, url, className = '' }: { seed: string; url?: string | null; className?: string }) {
  const Icon = ICONS[seed] ?? CalendarDays;

  if (url) {
    return (
      <div className={`relative overflow-hidden bg-ink-light-grey ${className}`}>
        <img src={url} alt="" className="absolute inset-0 w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-ink-light-grey to-ink-off-white flex items-center justify-center ${className}`}
    >
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 30% 20%, #111 0%, transparent 55%)' }} />
      <Icon size={40} strokeWidth={1.2} className="text-ink-dark-grey/40" />
    </div>
  );
}

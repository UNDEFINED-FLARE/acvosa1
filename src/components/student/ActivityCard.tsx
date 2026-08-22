import type { Activity } from '@/types';
import { useApp } from '@/context/AppContext';
import { useNav } from '@/context/NavContext';
import { ActivityImage } from '@/components/ui/ActivityImage';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { formatDate, formatDateRange } from '@/utils/format';
import { Calendar, Clock, MapPin, Users, Check } from 'lucide-react';

interface ActivityCardProps {
  activity: Activity;
  compact?: boolean;
}

export function ActivityCard({ activity, compact }: ActivityCardProps) {
  const { isReserved, reservePlace } = useApp();
  const { navigate } = useNav();
  const reserved = isReserved(activity.id);
  const remaining = activity.capacity - activity.reserved;
  const full = remaining <= 0;
  const { day, month } = formatDateRange(activity.date);

  const open = () => navigate('activity-detail', { id: activity.id });

  if (compact) {
    return (
      <div
        onClick={open}
        className="group bg-ink-white border border-ink-light-grey rounded-2xl p-4 shadow-soft hover:shadow-card hover:border-ink-grey transition-all duration-300 cursor-pointer flex gap-4"
      >
        <div className="shrink-0 w-14 text-center">
          <p className="text-2xs uppercase text-ink-dark-grey/50 tracking-wider">{month}</p>
          <p className="text-2xl font-bold text-ink-charcoal leading-none mt-0.5 tabular-nums">{day}</p>
        </div>
        <div className="flex-1 min-w-0 border-l border-ink-light-grey pl-4">
          <p className="font-semibold text-sm text-ink-charcoal tracking-tight truncate">{activity.name}</p>
          <p className="text-xs text-ink-dark-grey/60 mt-1 flex items-center gap-1.5">
            <Clock size={12} /> {activity.startTime}–{activity.endTime}
          </p>
          <div className="flex items-center justify-between mt-2.5">
            <span className="text-xs text-ink-dark-grey/70">
              {full ? 'Full' : `${remaining} places left`}
            </span>
            {reserved ? (
              <Badge tone="dark" dot>Reserved</Badge>
            ) : full ? (
              <Badge tone="outline">Full</Badge>
            ) : (
              <Badge tone="outline">{activity.category}</Badge>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={open}
      className="group bg-ink-white border border-ink-light-grey rounded-2xl shadow-soft hover:shadow-card hover:border-ink-grey transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
    >
      <ActivityImage seed={activity.imageSeed} className="h-32 sm:h-36" />
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Badge tone="outline">{activity.category}</Badge>
          {activity.status === 'active' && <Badge tone="solid" dot>Live</Badge>}
          {activity.status === 'completed' && <Badge tone="light">Completed</Badge>}
        </div>
        <h3 className="font-semibold text-ink-charcoal tracking-tight leading-snug">{activity.name}</h3>
        <p className="text-sm text-ink-dark-grey/65 mt-1.5 line-clamp-2 tracking-tight">{activity.description}</p>

        <div className="mt-4 flex flex-col gap-1.5 text-xs text-ink-dark-grey/70">
          <span className="flex items-center gap-2"><Calendar size={13} /> {formatDate(activity.date, 'long')}</span>
          <span className="flex items-center gap-2"><Clock size={13} /> {activity.startTime} – {activity.endTime}</span>
          <span className="flex items-center gap-2"><MapPin size={13} /> {activity.venue}</span>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-ink-dark-grey/70 flex items-center gap-1.5"><Users size={12} /> {activity.reserved}/{activity.capacity} reserved</span>
            <span className="font-medium text-ink-charcoal">{full ? 'Full' : `${remaining} left`}</span>
          </div>
          <Progress value={activity.reserved} max={activity.capacity} />
        </div>

        <div className="mt-4 pt-4 border-t border-ink-light-grey">
          {reserved ? (
            <Button variant="secondary" size="sm" fullWidth onClick={(e) => { e.stopPropagation(); open(); }}>
              <Check size={15} /> Reserved — View Details
            </Button>
          ) : full ? (
            <Button variant="ghost" size="sm" fullWidth disabled onClick={(e) => e.stopPropagation()}>
              Registration Full
            </Button>
          ) : (
            <Button variant="primary" size="sm" fullWidth onClick={(e) => { e.stopPropagation(); reservePlace(activity.id); }}>
              Reserve My Place
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

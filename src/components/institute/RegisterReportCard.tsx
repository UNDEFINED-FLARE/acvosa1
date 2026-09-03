import type { Activity } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { formatDate } from '@/utils/format';
import { ClipboardList, Users } from 'lucide-react';

interface RegisterReportCardProps {
  activity: Activity;
  onOpen?: () => void;
}

export function RegisterReportCard({ activity, onOpen }: RegisterReportCardProps) {
  const expected = activity.reserved;
  const present = activity.attendedCount;
  const rate = expected > 0 ? Math.round((present / expected) * 100) : 0;
  const finalised = activity.status === 'completed';

  return (
    <div
      onClick={onOpen}
      className={`h-full bg-ink-white border border-ink-light-grey rounded-2xl p-5 shadow-soft transition-all duration-300 flex flex-col ${
        onOpen ? 'hover:shadow-card hover:border-ink-grey cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-2xs uppercase tracking-wider text-ink-dark-grey/55">
          <ClipboardList size={13} /> Register
        </span>
        {finalised ? <Badge tone="light">Finalised</Badge> : <Badge tone="solid" dot>Open</Badge>}
      </div>

      <p className="font-semibold text-sm text-ink-charcoal tracking-tight mt-3 leading-snug line-clamp-2">{activity.name}</p>
      <p className="text-xs text-ink-dark-grey/60 mt-1 tracking-tight">{formatDate(activity.date, 'long')}</p>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-ink-charcoal tracking-tight tabular-nums">{rate}%</span>
        <span className="text-xs text-ink-dark-grey/60 tracking-tight">attendance</span>
      </div>

      <div className="mt-3">
        <Progress value={present} max={Math.max(expected, 1)} />
        <p className="text-xs text-ink-dark-grey/65 mt-2 flex items-center gap-1.5 tracking-tight">
          <Users size={12} /> {present} present of {expected} registered
          {activity.noShowCount > 0 && <span className="text-ink-dark-grey/45">· {activity.noShowCount} absent</span>}
        </p>
      </div>
    </div>
  );
}

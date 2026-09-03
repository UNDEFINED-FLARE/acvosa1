import type { Stakeholder } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Building2, Mail, UserRound } from 'lucide-react';

interface StakeholderCardProps {
  stakeholder: Stakeholder;
  unitName?: string;
}

const statusTone = {
  active: 'dark',
  pending: 'outline',
  dormant: 'light',
} as const;

export function StakeholderCard({ stakeholder, unitName }: StakeholderCardProps) {
  return (
    <div className="h-full bg-ink-white border border-ink-light-grey rounded-2xl p-5 shadow-soft hover:shadow-card hover:border-ink-grey transition-all duration-300 flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-2xs uppercase tracking-wider text-ink-dark-grey/55">
          <Building2 size={13} /> {stakeholder.type}
        </span>
        <Badge tone={statusTone[stakeholder.status]} dot={stakeholder.status === 'active'}>
          {stakeholder.status === 'active' ? 'Active' : stakeholder.status === 'pending' ? 'In discussion' : 'Dormant'}
        </Badge>
      </div>

      <h3 className="font-semibold text-sm text-ink-charcoal tracking-tight leading-snug mt-3">{stakeholder.name}</h3>
      <p className="text-xs text-ink-dark-grey/65 mt-1.5 tracking-tight">{stakeholder.relationship}</p>
      {stakeholder.focus && (
        <p className="text-xs text-ink-dark-grey/55 mt-2 tracking-tight line-clamp-2">{stakeholder.focus}</p>
      )}

      <div className="mt-auto pt-4 flex flex-col gap-1.5 text-xs text-ink-dark-grey/60 tracking-tight">
        {stakeholder.contactPerson && (
          <span className="flex items-center gap-1.5"><UserRound size={12} /> {stakeholder.contactPerson}</span>
        )}
        {stakeholder.contactEmail && (
          <span className="flex items-center gap-1.5 truncate"><Mail size={12} /> {stakeholder.contactEmail}</span>
        )}
        <div className="flex items-center justify-between gap-2 pt-2 mt-1 border-t border-ink-light-grey">
          {unitName ? <span className="truncate">{unitName}</span> : <span>Institute-wide</span>}
          {stakeholder.since && <span className="shrink-0 tabular-nums">Since {stakeholder.since}</span>}
        </div>
      </div>
    </div>
  );
}

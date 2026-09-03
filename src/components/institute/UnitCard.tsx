import type { Unit, UnitStaff } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight, UserRound } from 'lucide-react';

interface UnitCardProps {
  unit: Unit;
  staff: UnitStaff[];
  onOpen: () => void;
}

export function UnitCard({ unit, staff, onOpen }: UnitCardProps) {
  const permanent = staff.filter((s) => s.category === 'Permanent Staff').length;
  const champions = staff.filter((s) => s.category === 'Innovation Champion').length;

  return (
    <div
      onClick={onOpen}
      className="group h-full bg-ink-white border border-ink-light-grey rounded-2xl p-5 shadow-soft hover:shadow-card hover:border-ink-grey hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col"
    >
      <div className="flex items-start justify-between gap-3">
        <Badge tone="outline">{unit.shortName}</Badge>
        <ArrowRight size={16} className="text-ink-dark-grey/30 group-hover:text-ink-charcoal transition-colors shrink-0" />
      </div>

      <h3 className="font-semibold text-ink-charcoal tracking-tight leading-snug mt-3">{unit.name}</h3>
      <p className="text-sm text-ink-dark-grey/65 mt-1.5 tracking-tight line-clamp-2">{unit.focus}</p>

      {unit.lead && (
        <p className="text-xs text-ink-dark-grey/60 mt-3 flex items-center gap-1.5 tracking-tight">
          <UserRound size={13} /> {unit.lead}
        </p>
      )}

      <div className="mt-4 pt-4 border-t border-ink-light-grey flex items-center gap-4 text-xs text-ink-dark-grey/65 tracking-tight">
        <span><span className="font-semibold text-ink-charcoal tabular-nums">{staff.length}</span> members</span>
        <span><span className="font-semibold text-ink-charcoal tabular-nums">{permanent}</span> permanent</span>
        <span><span className="font-semibold text-ink-charcoal tabular-nums">{champions}</span> champions</span>
      </div>
    </div>
  );
}

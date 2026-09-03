import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { PageContainer } from '@/components/layout/Topbar';
import { PageHeader } from '@/components/ui/SectionHeader';
import { StatTile } from '@/components/ui/StatTile';
import { EmptyState } from '@/components/ui/EmptyState';
import { StakeholderCard } from '@/components/institute/StakeholderCard';
import type { StakeholderType } from '@/types';
import { Handshake, Building2, Globe2, HeartHandshake } from 'lucide-react';

const TYPES: (StakeholderType | 'All')[] = [
  'All',
  'Government',
  'Academic',
  'Funder',
  'Community',
  'NGO',
  'Industry',
  'International',
];

export function StakeholdersPage() {
  const { stakeholders, units } = useApp();
  const [type, setType] = useState<StakeholderType | 'All'>('All');

  const visible = type === 'All' ? stakeholders : stakeholders.filter((s) => s.type === type);
  const active = stakeholders.filter((s) => s.status === 'active').length;
  const international = stakeholders.filter((s) => s.type === 'International').length;
  const funders = stakeholders.filter((s) => s.type === 'Funder').length;

  const unitName = (unitId: string | null) => units.find((u) => u.id === unitId)?.shortName;

  return (
    <PageContainer className="pb-28 lg:pb-10">
      <PageHeader
        title="External Relations"
        subtitle="Stakeholders and partners the Institute for Rural Development works with."
      />

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatTile label="Stakeholders" value={stakeholders.length} icon={<Handshake size={16} />} />
        <StatTile label="Active" value={active} icon={<HeartHandshake size={16} />} />
        <StatTile label="Funders" value={funders} icon={<Building2 size={16} />} />
        <StatTile label="International" value={international} icon={<Globe2 size={16} />} />
      </div>

      <div className="mt-6 -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 w-max">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-4 py-2 rounded-full text-sm font-medium tracking-tight whitespace-nowrap transition-all ${
                type === t ? 'bg-ink-black text-ink-white' : 'bg-ink-white text-ink-dark-grey border border-ink-light-grey'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<Handshake size={24} />}
          title="No stakeholders"
          description="Try a different category to see the Institute's external relationships."
        />
      ) : (
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((s) => (
            <StakeholderCard key={s.id} stakeholder={s} unitName={unitName(s.unitId)} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

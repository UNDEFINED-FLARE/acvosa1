import { useApp } from '@/context/AppContext';
import { useNav } from '@/context/NavContext';
import { PageContainer } from '@/components/layout/Topbar';
import { PageHeader } from '@/components/ui/SectionHeader';
import { StatTile } from '@/components/ui/StatTile';
import { EmptyState } from '@/components/ui/EmptyState';
import { UnitCard } from '@/components/institute/UnitCard';
import { Network, Users, Lightbulb, GraduationCap } from 'lucide-react';

export function UnitsPage() {
  const { units, unitStaff } = useApp();
  const { navigate } = useNav();

  const champions = unitStaff.filter((s) => s.category === 'Innovation Champion').length;
  const committee = unitStaff.filter((s) => s.category === 'Postgraduate Committee').length;

  return (
    <PageContainer className="pb-28 lg:pb-10">
      <PageHeader
        title="Institute Units"
        subtitle="The research and support units of the Institute for Rural Development and the people in each."
      />

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatTile label="Units" value={units.length} icon={<Network size={16} />} />
        <StatTile label="People" value={unitStaff.length} icon={<Users size={16} />} />
        <StatTile label="Innovation Champions" value={champions} icon={<Lightbulb size={16} />} />
        <StatTile label="Postgraduate Committee" value={committee} icon={<GraduationCap size={16} />} />
      </div>

      {units.length === 0 ? (
        <EmptyState
          icon={<Network size={24} />}
          title="No units yet"
          description="Institute units and their staff will appear here once they have been captured."
        />
      ) : (
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {units.map((unit) => (
            <UnitCard
              key={unit.id}
              unit={unit}
              staff={unitStaff.filter((s) => s.unitId === unit.id)}
              onOpen={() => navigate('unit-detail', { id: unit.id })}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

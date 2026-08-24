import { useApp } from '@/context/AppContext';
import { PageContainer } from '@/components/layout/Topbar';
import { PageHeader } from '@/components/ui/SectionHeader';
import { Card } from '@/components/ui/Card';
import { StatTile } from '@/components/ui/StatTile';
import { DonutChart } from '@/components/ui/Charts';
import { Users, Calendar, FolderKanban, Clock, MapPin, TrendingUp } from 'lucide-react';

export function AdminImpact() {
  const { impact, activities, members } = useApp();

  const categoryTotals = activities.reduce<Record<string, number>>((acc, a) => {
    acc[a.category] = (acc[a.category] ?? 0) + 1;
    return acc;
  }, {});
  const donutSegments = Object.entries(categoryTotals).map(([label, value]) => ({ label, value }));

  const totalReserved = activities.reduce((s, a) => s + a.reserved, 0);
  const totalAttended = activities.reduce((s, a) => s + a.attendedCount, 0);
  const liveAttendanceRate = totalReserved > 0 ? Math.round((totalAttended / totalReserved) * 100) : 0;

  return (
    <PageContainer className="pb-28 lg:pb-10">
      <PageHeader title="Impact Analytics" subtitle="Institutional impact measurement and analytics." />

      <div className="mt-8 grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatTile label="Activities" value={impact.activities} icon={<Calendar size={16} />} />
        <StatTile label="Participants" value={impact.participants.toLocaleString()} icon={<Users size={16} />} />
        <StatTile label="Projects" value={impact.projects} icon={<FolderKanban size={16} />} />
        <StatTile label="Volunteer Hours" value={impact.volunteerHours.toLocaleString()} icon={<Clock size={16} />} />
        <StatTile label="Communities" value={impact.communities} icon={<MapPin size={16} />} />
      </div>

      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-sm font-semibold text-ink-charcoal tracking-tight mb-4">Activities by category</h3>
          {donutSegments.length > 0 ? (
            <DonutChart segments={donutSegments} />
          ) : (
            <p className="text-sm text-ink-dark-grey/55 tracking-tight py-8 text-center">No activities yet.</p>
          )}
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-ink-charcoal tracking-tight mb-4">Live attendance</h3>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-ink-light-grey flex items-center justify-center shrink-0">
              <TrendingUp size={26} className="text-ink-charcoal" />
            </div>
            <div>
              <p className="text-3xl font-bold text-ink-charcoal tabular-nums tracking-tight">{liveAttendanceRate}%</p>
              <p className="text-xs text-ink-dark-grey/60 tracking-tight mt-0.5">
                {totalAttended.toLocaleString()} of {totalReserved.toLocaleString()} reserved places checked in across all activities
              </p>
            </div>
          </div>
          <p className="text-xs text-ink-dark-grey/50 tracking-tight mt-4">{members.length} registered members overall.</p>
        </Card>
      </div>
    </PageContainer>
  );
}

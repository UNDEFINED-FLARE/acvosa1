import { useApp } from '@/context/AppContext';
import { PageContainer } from '@/components/layout/Topbar';
import { PageHeader } from '@/components/ui/SectionHeader';
import { Card } from '@/components/ui/Card';
import { StatTile } from '@/components/ui/StatTile';
import { DonutChart, HBarList } from '@/components/ui/Charts';
import { Users, Calendar, FolderKanban, Clock, MapPin } from 'lucide-react';

export function ImpactDashboard() {
  const { impact, activities, projects } = useApp();

  const categoryTotals = activities.reduce<Record<string, number>>((acc, a) => {
    acc[a.category] = (acc[a.category] ?? 0) + 1;
    return acc;
  }, {});
  const donutSegments = Object.entries(categoryTotals).map(([label, value]) => ({ label, value }));

  const venueTotals = activities.reduce<Record<string, number>>((acc, a) => {
    acc[a.venue] = (acc[a.venue] ?? 0) + a.reserved;
    return acc;
  }, {});
  const venueMax = Math.max(1, ...Object.values(venueTotals));
  const venueBars = Object.entries(venueTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value]) => ({ label, value, max: venueMax, display: value.toLocaleString() }));

  return (
    <PageContainer className="pb-28 lg:pb-10">
      <PageHeader title="Institute Impact" subtitle="Measuring participation, projects and institutional impact." />

      {/* Large stats */}
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
          <h3 className="text-sm font-semibold text-ink-charcoal tracking-tight mb-4">Reservations by venue</h3>
          {venueBars.length > 0 ? (
            <HBarList items={venueBars} />
          ) : (
            <p className="text-sm text-ink-dark-grey/55 tracking-tight py-8 text-center">No reservations yet.</p>
          )}
        </Card>
      </div>

      <Card className="mt-6 bg-ink-charcoal text-ink-white border-ink-charcoal">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-2xs uppercase tracking-wider text-ink-white/50">{impact.year} Institutional Impact</p>
            <p className="text-xl font-bold mt-1 tracking-tight">A measurable contribution to students, communities and the institution.</p>
          </div>
          <div className="flex items-center gap-8">
            <div>
              <p className="text-3xl font-bold tabular-nums">{impact.attendanceRate}%</p>
              <p className="text-2xs text-ink-white/60 tracking-tight mt-1">Attendance rate</p>
            </div>
            <div>
              <p className="text-3xl font-bold tabular-nums">{impact.communities}</p>
              <p className="text-2xs text-ink-white/60 tracking-tight mt-1">Communities</p>
            </div>
          </div>
        </div>
      </Card>

      {projects.length > 0 && (
        <Card className="mt-6">
          <h3 className="text-sm font-semibold text-ink-charcoal tracking-tight mb-4">Active projects</h3>
          <div className="flex flex-col divide-y divide-ink-light-grey">
            {projects.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-charcoal tracking-tight truncate">{p.title}</p>
                  <p className="text-xs text-ink-dark-grey/55 mt-0.5 tracking-tight">{p.community}</p>
                </div>
                <span className="text-xs text-ink-dark-grey/60 tabular-nums shrink-0 ml-3">{p.participants} participants</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </PageContainer>
  );
}

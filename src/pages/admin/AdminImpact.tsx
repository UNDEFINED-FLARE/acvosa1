import { useApp } from '@/context/AppContext';
import { PageContainer } from '@/components/layout/Topbar';
import { PageHeader } from '@/components/ui/SectionHeader';
import { Card } from '@/components/ui/Card';
import { StatTile } from '@/components/ui/StatTile';
import { LineChart, BarChart, DonutChart, HBarList } from '@/components/ui/Charts';
import { chartSeries } from '@/data/mockData';
import { Users, Calendar, FolderKanban, Clock, MapPin, TrendingUp } from 'lucide-react';

export function AdminImpact() {
  const { impact } = useApp();
  const series = chartSeries['2026'];

  const donutSegments = [
    { label: 'Workshops', value: 14 },
    { label: 'Community', value: 9 },
    { label: 'Academic', value: 8 },
    { label: 'Leadership', value: 6 },
    { label: 'Other', value: 5 },
  ];

  const communityBars = [
    { label: 'Makhado', value: 920, max: 1500, display: '920' },
    { label: 'Thohoyandou', value: 780, max: 1500, display: '780' },
    { label: 'UNIVEN Campus', value: 1240, max: 1500, display: '1,240' },
    { label: 'Tswinga', value: 420, max: 1500, display: '420' },
    { label: 'Other', value: 482, max: 1500, display: '482' },
  ];

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
          <h3 className="text-sm font-semibold text-ink-charcoal tracking-tight mb-4">Activities over time</h3>
          <BarChart data={series.activities} height={200} />
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-ink-charcoal tracking-tight mb-4">Student participation</h3>
          <LineChart data={series.participation} height={200} />
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-ink-charcoal tracking-tight mb-4">Attendance rate (%)</h3>
          <LineChart data={series.attendance} height={200} area={false} />
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-ink-charcoal tracking-tight mb-4">Activities by category</h3>
          <DonutChart segments={donutSegments} />
        </Card>
      </div>

      <Card className="mt-6">
        <h3 className="text-sm font-semibold text-ink-charcoal tracking-tight mb-4">Community reach</h3>
        <HBarList items={communityBars} />
        <div className="mt-5 pt-4 border-t border-ink-light-grey flex items-center gap-2 text-xs text-ink-dark-grey/60">
          <TrendingUp size={14} />
          <span className="tracking-tight">+18% reach vs 2025</span>
        </div>
      </Card>
    </PageContainer>
  );
}

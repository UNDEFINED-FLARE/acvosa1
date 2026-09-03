import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { PageContainer } from '@/components/layout/Topbar';
import { PageHeader } from '@/components/ui/SectionHeader';
import { Card } from '@/components/ui/Card';
import { StatTile } from '@/components/ui/StatTile';
import { LineChart, BarChart, DonutChart, HBarList } from '@/components/ui/Charts';
import { chartSeries } from '@/data/mockData';
import { Users, Calendar, FolderKanban, Clock, MapPin, TrendingUp } from 'lucide-react';

const YEARS = ['2026', '2025', '2024'];

export function ImpactDashboard() {
  const { impact } = useApp();
  const [year, setYear] = useState('2026');
  const series = chartSeries[year];

  const donutSegments = [
    { label: 'Workshops', value: 14 },
    { label: 'Community', value: 9 },
    { label: 'Academic', value: 8 },
    { label: 'Leadership', value: 6 },
    { label: 'Other', value: 5 },
  ];

  const communityBars = [
    { label: 'Makhado', value: 920, max: 1000, display: '920' },
    { label: 'Thohoyandou', value: 780, max: 1000, display: '780' },
    { label: 'UNIVEN Campus', value: 1240, max: 1500, display: '1,240' },
    { label: 'Tswinga', value: 420, max: 1000, display: '420' },
    { label: 'Other districts', value: 482, max: 1000, display: '482' },
  ];

  return (
    <PageContainer className="pb-28 lg:pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <PageHeader title="Institute Impact" subtitle="Measuring participation, projects and institutional impact." />
        <div className="flex items-center gap-1.5 bg-ink-white border border-ink-light-grey rounded-full p-1">
          {YEARS.map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium tracking-tight transition-all ${
                year === y ? 'bg-ink-black text-ink-white' : 'text-ink-dark-grey hover:text-ink-charcoal'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Large stats */}
      <div className="mt-8 grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatTile label="Activities" value={impact.activities} icon={<Calendar size={16} />} />
        <StatTile label="Participants" value={impact.participants.toLocaleString()} icon={<Users size={16} />} />
        <StatTile label="Projects" value={impact.projects} icon={<FolderKanban size={16} />} />
        <StatTile label="Volunteer Hours" value={impact.volunteerHours.toLocaleString()} icon={<Clock size={16} />} />
        <StatTile label="Communities" value={impact.communities} icon={<MapPin size={16} />} />
      </div>

      {/* Charts */}
      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-ink-charcoal tracking-tight">Activities over time</h3>
            <span className="text-2xs text-ink-dark-grey/50 tracking-tight">{year}</span>
          </div>
          <BarChart data={series.activities} height={200} />
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-ink-charcoal tracking-tight">Student participation</h3>
            <span className="text-2xs text-ink-dark-grey/50 tracking-tight">{year}</span>
          </div>
          <LineChart data={series.participation} height={200} />
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-ink-charcoal tracking-tight">Attendance rate</h3>
            <span className="text-2xs text-ink-dark-grey/50 tracking-tight">{year} · %</span>
          </div>
          <LineChart data={series.attendance} height={200} area={false} />
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-ink-charcoal tracking-tight">Projects completed</h3>
            <span className="text-2xs text-ink-dark-grey/50 tracking-tight">{year}</span>
          </div>
          <BarChart data={series.projects} height={200} />
        </Card>
      </div>

      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-sm font-semibold text-ink-charcoal tracking-tight mb-4">Activities by category</h3>
          <DonutChart segments={donutSegments} />
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-ink-charcoal tracking-tight mb-4">Community reach</h3>
          <HBarList items={communityBars} />
          <div className="mt-5 pt-4 border-t border-ink-light-grey flex items-center gap-2 text-xs text-ink-dark-grey/60">
            <TrendingUp size={14} />
            <span className="tracking-tight">+18% reach vs {Number(year) - 1}</span>
          </div>
        </Card>
      </div>

      <Card className="mt-6 bg-ink-charcoal text-ink-white border-ink-charcoal">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-2xs uppercase tracking-wider text-ink-white/50">2026 Institutional Impact</p>
            <p className="text-xl font-bold mt-1 tracking-tight">A measurable contribution to students, communities and the institution.</p>
          </div>
          <div className="flex items-center gap-8">
            <div>
              <p className="text-3xl font-bold tabular-nums">91%</p>
              <p className="text-2xs text-ink-white/60 tracking-tight mt-1">Attendance rate</p>
            </div>
            <div>
              <p className="text-3xl font-bold tabular-nums">15</p>
              <p className="text-2xs text-ink-white/60 tracking-tight mt-1">Communities</p>
            </div>
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}

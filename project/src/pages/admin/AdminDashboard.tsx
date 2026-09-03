import { useApp } from '@/context/AppContext';
import { useNav } from '@/context/NavContext';
import { PageContainer } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/Card';
import { StatTile } from '@/components/ui/StatTile';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LineChart, BarChart } from '@/components/ui/Charts';
import { chartSeries } from '@/data/mockData';
import { formatDate } from '@/utils/format';
import {
  Users, CalendarDays, Activity as ActivityIcon, Ticket, FolderKanban,
  TrendingUp, Plus, ArrowRight, Clock,
} from 'lucide-react';

export function AdminDashboard() {
  const { activities, members, reservations, impact, projects, attendanceRecords } = useApp();
  const { navigate } = useNav();

  const upcoming = activities.filter((a) => a.status === 'upcoming').length;
  const active = activities.filter((a) => a.status === 'active').length;
  const totalReservations = reservations.filter((r) => r.status === 'confirmed').length;
  const studentsReached = projects.reduce((s, p) => s + p.participants, 0);

  const recentActivities = [...activities]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);

  const series = chartSeries['2026'];

  return (
    <PageContainer className="pb-28 lg:pb-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink-charcoal tracking-tight">Dashboard</h1>
          <p className="text-sm text-ink-dark-grey/65 mt-1.5 tracking-tight">Overview of Institute operations and institutional activity.</p>
        </div>
        <Button size="sm" onClick={() => navigate('admin-create-activity')} className="shrink-0">
          <Plus size={16} /> New Activity
        </Button>
      </div>

      {/* Stats grid */}
      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatTile label="Total Members" value={members.length} icon={<Users size={16} />} />
        <StatTile label="Upcoming Activities" value={upcoming} icon={<CalendarDays size={16} />} />
        <StatTile label="Active Activities" value={active} icon={<ActivityIcon size={16} />} sub="Live now" />
        <StatTile label="Total Reservations" value={totalReservations} icon={<Ticket size={16} />} />
        <StatTile label="Attendance Rate" value={`${impact.attendanceRate}%`} icon={<TrendingUp size={16} />} />
        <StatTile label="Projects" value={projects.length} icon={<FolderKanban size={16} />} />
        <StatTile label="Students Reached" value={studentsReached.toLocaleString()} icon={<Users size={16} />} />
        <StatTile label="Volunteer Hours" value={impact.volunteerHours.toLocaleString()} icon={<Clock size={16} />} />
      </div>

      {/* Charts */}
      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-sm font-semibold text-ink-charcoal tracking-tight mb-4">Activities published (2026)</h3>
          <BarChart data={series.activities} height={200} />
        </Card>
        <Card>
          <h3 className="text-sm font-semibold text-ink-charcoal tracking-tight mb-4">Student participation (2026)</h3>
          <LineChart data={series.participation} height={200} />
        </Card>
      </div>

      {/* Recent activities */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-ink-charcoal tracking-tight">Recent Activities</h2>
          <button onClick={() => navigate('admin-activities')} className="text-sm text-ink-dark-grey/70 hover:text-ink-charcoal tracking-tight flex items-center gap-1">
            View all <ArrowRight size={14} />
          </button>
        </div>
        <Card padded={false} className="overflow-hidden">
          <div className="divide-y divide-ink-light-grey">
            {recentActivities.map((a) => (
              <div key={a.id} className="flex items-center gap-4 p-4 hover:bg-ink-off-white transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-charcoal tracking-tight truncate">{a.name}</p>
                  <p className="text-xs text-ink-dark-grey/60 mt-0.5 tracking-tight">{formatDate(a.date, 'long')}</p>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-xs text-ink-dark-grey/60 tabular-nums">{a.reserved}/{a.capacity}</span>
                </div>
                <Badge
                  tone={a.status === 'active' ? 'solid' : a.status === 'completed' ? 'light' : 'outline'}
                  dot={a.status === 'active'}
                >
                  {a.status === 'active' ? 'Live' : a.status === 'completed' ? 'Completed' : 'Upcoming'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}

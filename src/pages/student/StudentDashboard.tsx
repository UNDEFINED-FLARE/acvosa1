import { useApp } from '@/context/AppContext';
import { useNav } from '@/context/NavContext';
import { PageContainer } from '@/components/layout/Topbar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { ActivityCard } from '@/components/student/ActivityCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Avatar } from '@/components/ui/Avatar';
import { initials, formatDate, relativeDeadline, classForPriority } from '@/utils/format';
import {
  CalendarDays, CheckSquare, Ticket, FolderKanban, ArrowRight,
  Clock, MapPin, Calendar, AlertCircle,
} from 'lucide-react';

const QUICK_ACTIONS = [
  { label: 'Activities', icon: CalendarDays, route: 'activities' as const },
  { label: 'My Attendance', icon: CheckSquare, route: 'attendance' as const },
  { label: 'My Reservations', icon: Ticket, route: 'reservations' as const },
  { label: 'Projects', icon: FolderKanban, route: 'projects' as const },
];

export function StudentDashboard() {
  const { user, activities, deadlines } = useApp();
  const { navigate } = useNav();

  const upcoming = activities.filter((a) => a.status !== 'completed').sort((a, b) => a.date.localeCompare(b.date));
  const featured = activities.find((a) => a.id === 'a1') ?? upcoming[0];
  const upcomingList = upcoming.filter((a) => a.id !== featured?.id).slice(0, 3);
  const sortedDeadlines = [...deadlines].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);

  return (
    <PageContainer className="pb-28 lg:pb-10">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-ink-dark-grey/60 tracking-tight">Good morning,</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink-charcoal tracking-tight mt-0.5">{user.name.split(' ')[0]}</h1>
          <p className="text-sm text-ink-dark-grey/65 mt-1 tracking-tight">Stay connected with what ACVOSA is doing.</p>
        </div>
        <div className="flex items-center gap-3">
          <Avatar initials={initials(user.name)} size="lg" />
        </div>
      </div>

      {/* Featured next activity */}
      {featured && (
        <Card className="mt-8 p-0 overflow-hidden" hover={false}>
          <div className="grid lg:grid-cols-[1.4fr_1fr]">
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2">
                <Badge tone="solid" dot>Next Activity</Badge>
                <Badge tone="outline">{featured.category}</Badge>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-ink-charcoal tracking-tight mt-3 leading-tight">{featured.name}</h2>
              <p className="text-sm text-ink-dark-grey/70 mt-2 tracking-tight line-clamp-2">{featured.description}</p>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center gap-2 text-ink-dark-grey/75">
                  <Calendar size={16} className="text-ink-dark-grey/45" />
                  <span className="tracking-tight">{formatDate(featured.date, 'long')}</span>
                </div>
                <div className="flex items-center gap-2 text-ink-dark-grey/75">
                  <Clock size={16} className="text-ink-dark-grey/45" />
                  <span className="tracking-tight">{featured.startTime} – {featured.endTime}</span>
                </div>
                <div className="flex items-center gap-2 text-ink-dark-grey/75">
                  <MapPin size={16} className="text-ink-dark-grey/45" />
                  <span className="tracking-tight truncate">{featured.venue}</span>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-ink-dark-grey/70 tracking-tight">{featured.reserved} / {featured.capacity} places reserved</span>
                  <span className="font-semibold text-ink-charcoal tabular-nums">{featured.capacity - featured.reserved} remaining</span>
                </div>
                <Progress value={featured.reserved} max={featured.capacity} />
              </div>

              <div className="mt-6">
                <Button variant="primary" size="md" onClick={() => navigate('activity-detail', { id: featured.id })}>
                  View Activity <ArrowRight size={16} />
                </Button>
              </div>
            </div>

            {/* visual panel */}
            <div className="relative bg-gradient-to-br from-ink-light-grey to-ink-off-white hidden lg:flex items-center justify-center min-h-[280px]">
              <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, #111 0%, transparent 60%)' }} />
              <div className="text-center px-8">
                <div className="w-16 h-16 rounded-2xl bg-ink-white shadow-card flex items-center justify-center mx-auto">
                  <CalendarDays size={28} className="text-ink-charcoal" strokeWidth={1.6} />
                </div>
                <p className="mt-5 text-5xl font-bold text-ink-charcoal tracking-tight tabular-nums">{new Date(featured.date + 'T00:00:00').getDate()}</p>
                <p className="text-sm text-ink-dark-grey/60 uppercase tracking-widest mt-1">
                  {['January','February','March','April','May','June','July','August','September','October','November','December'][new Date(featured.date + 'T00:00:00').getMonth()]}
                </p>
                <p className="text-xs text-ink-dark-grey/45 mt-3 tracking-tight">UNIVEN Campus</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Quick actions */}
      <div className="mt-8">
        <SectionHeader title="Quick Actions" />
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {QUICK_ACTIONS.map((qa) => (
            <button
              key={qa.label}
              onClick={() => navigate(qa.route)}
              className="group flex flex-col items-start gap-3 p-4 sm:p-5 bg-ink-white border border-ink-light-grey rounded-2xl shadow-soft hover:shadow-card hover:border-ink-grey hover:-translate-y-0.5 transition-all duration-300 text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-ink-light-grey group-hover:bg-ink-black flex items-center justify-center transition-colors">
                <qa.icon size={20} className="text-ink-charcoal group-hover:text-ink-white transition-colors" strokeWidth={1.8} />
              </div>
              <span className="text-sm font-medium text-ink-charcoal tracking-tight">{qa.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid lg:grid-cols-[1.6fr_1fr] gap-6">
        {/* Upcoming activities */}
        <div>
          <SectionHeader
            title="Upcoming Activities"
            action={<button onClick={() => navigate('activities')} className="text-sm text-ink-dark-grey/70 hover:text-ink-charcoal transition-colors tracking-tight flex items-center gap-1">View all <ArrowRight size={14} /></button>}
          />
          <div className="mt-4 flex flex-col gap-3">
            {upcomingList.map((a) => (
              <ActivityCard key={a.id} activity={a} compact />
            ))}
          </div>
        </div>

        {/* Deadlines */}
        <div>
          <SectionHeader title="Important Deadlines" />
          <Card className="mt-4 p-0">
            <div className="flex flex-col divide-y divide-ink-light-grey">
              {sortedDeadlines.map((d) => (
                <div key={d.id} className="flex items-center gap-3 p-4">
                  <span className={`w-1.5 self-stretch rounded-full ${d.priority === 'high' ? 'bg-ink-black' : d.priority === 'medium' ? 'bg-ink-dark-grey' : 'bg-ink-grey'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-charcoal tracking-tight leading-snug">{d.title}</p>
                    <p className="text-xs text-ink-dark-grey/60 mt-1 tracking-tight">{formatDate(d.date, 'long')}</p>
                  </div>
                  <span className={`text-2xs font-medium px-2.5 py-1 rounded-full tracking-tight ${classForPriority(d.priority)}`}>
                    {relativeDeadline(d.date)}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="mt-4 bg-ink-charcoal text-ink-white border-ink-charcoal">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-ink-white/80 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium tracking-tight">Registration closes soon</p>
                <p className="text-xs text-ink-white/65 mt-1 tracking-tight">Entrepreneurship Workshop registration closes in 5 days. Don't miss out.</p>
                <button onClick={() => navigate('activities')} className="text-xs font-medium text-ink-white underline underline-offset-2 mt-3 tracking-tight">
                  Browse activities
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useNav } from '@/context/NavContext';
import { PageContainer } from '@/components/layout/Topbar';
import { PageHeader } from '@/components/ui/SectionHeader';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { StatTile } from '@/components/ui/StatTile';
import { Badge } from '@/components/ui/Badge';
import { initials, formatDate } from '@/utils/format';
import { Mail, Building2, CalendarDays, Award, Clock, CheckSquare, Settings, LogOut } from 'lucide-react';

export function ProfilePage() {
  const { user, attendanceRecords, reservations, impact, members, activities } = useApp();
  const { signOut } = useAuth();
  const { navigate } = useNav();

  const relevantReservations = reservations.filter((r) => r.status === 'confirmed' || r.status === 'completed');
  const attendanceRate = relevantReservations.length > 0
    ? Math.round((attendanceRecords.length / relevantReservations.length) * 100)
    : 0;
  const member = members.find((m) => (user.studentNumber && m.studentNumber === user.studentNumber) || m.email === user.email);
  const volunteerHours = member?.volunteerHours ?? 0;
  const attendedCategories = Array.from(new Set(
    attendanceRecords
      .map((r) => activities.find((a) => a.id === r.activityId)?.category)
      .filter((c): c is NonNullable<typeof c> => Boolean(c))
  ));

  return (
    <PageContainer className="pb-28 lg:pb-10">
      <PageHeader title="My Profile" subtitle="Your ACVOSA membership and participation summary." />

      {/* Profile card */}
      <Card className="mt-6 p-0 overflow-hidden" hover={false}>
        <div className="h-24 bg-gradient-to-br from-ink-light-grey to-ink-grey/50" />
        <div className="px-5 sm:px-7 pb-6">
          <div className="flex items-end justify-between -mt-10">
            <Avatar initials={initials(user.name)} size="lg" className="ring-4 ring-ink-white !w-20 !h-20 !text-2xl" />
            <Badge tone="dark" dot>Active Member</Badge>
          </div>
          <h2 className="text-xl font-bold text-ink-charcoal tracking-tight mt-4">{user.name}</h2>
          <p className="text-sm text-ink-dark-grey/65 mt-1 tracking-tight">{user.faculty}</p>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2.5 text-ink-dark-grey/75">
              <Mail size={15} className="text-ink-dark-grey/45" />
              <span className="tracking-tight truncate">{user.email}</span>
            </div>
            {user.studentNumber && (
              <div className="flex items-center gap-2.5 text-ink-dark-grey/75">
                <span className="text-2xs text-ink-dark-grey/45 uppercase tracking-wider">Student No.</span>
                <span className="font-medium tracking-tight tabular-nums">{user.studentNumber}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5 text-ink-dark-grey/75">
              <CalendarDays size={15} className="text-ink-dark-grey/45" />
              <span className="tracking-tight">Joined {user.joined}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatTile label="Activities Attended" value={attendanceRecords.length} icon={<CheckSquare size={16} />} />
        <StatTile label="Active Reservations" value={reservations.filter((r) => r.status === 'confirmed').length} icon={<CalendarDays size={16} />} />
        <StatTile label="Volunteer Hours" value={volunteerHours} icon={<Clock size={16} />} />
        <StatTile label="Attendance Rate" value={`${attendanceRate}%`} icon={<Award size={16} />} />
      </div>

      {/* Participation summary */}
      <Card className="mt-6">
        <h3 className="text-base font-semibold text-ink-charcoal tracking-tight">Participation Summary</h3>
        <p className="text-sm text-ink-dark-grey/65 mt-1.5 tracking-tight">
          You have participated in {attendanceRecords.length} activities and contributed to ACVOSA's reach of {impact.participants.toLocaleString()} students across {impact.communities} communities.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {attendedCategories.length > 0 ? (
            attendedCategories.map((c) => <Badge key={c} tone="outline">{c}</Badge>)
          ) : (
            <span className="text-xs text-ink-dark-grey/50 tracking-tight">No attendance recorded yet.</span>
          )}
        </div>
      </Card>

      {/* Quick links */}
      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        <button onClick={() => navigate('attendance')} className="flex items-center gap-3 p-4 bg-ink-white border border-ink-light-grey rounded-2xl hover:border-ink-grey transition-colors text-left">
          <CheckSquare size={20} className="text-ink-dark-grey/60" />
          <div className="flex-1">
            <p className="text-sm font-medium text-ink-charcoal tracking-tight">View Attendance History</p>
            <p className="text-xs text-ink-dark-grey/55 tracking-tight mt-0.5">{attendanceRecords.length} records</p>
          </div>
        </button>
        <button onClick={() => navigate('reservations')} className="flex items-center gap-3 p-4 bg-ink-white border border-ink-light-grey rounded-2xl hover:border-ink-grey transition-colors text-left">
          <CalendarDays size={20} className="text-ink-dark-grey/60" />
          <div className="flex-1">
            <p className="text-sm font-medium text-ink-charcoal tracking-tight">My Reservations</p>
            <p className="text-xs text-ink-dark-grey/55 tracking-tight mt-0.5">{reservations.filter((r) => r.status === 'confirmed').length} upcoming</p>
          </div>
        </button>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button onClick={() => signOut()} className="flex items-center gap-2 text-sm text-ink-dark-grey/60 hover:text-ink-charcoal transition-colors tracking-tight">
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </PageContainer>
  );
}

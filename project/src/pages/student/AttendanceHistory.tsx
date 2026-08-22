import { useApp } from '@/context/AppContext';
import { useNav } from '@/context/NavContext';
import { PageContainer } from '@/components/layout/Topbar';
import { PageHeader } from '@/components/ui/SectionHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatTile } from '@/components/ui/StatTile';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/utils/format';
import { CheckSquare, Check, Clock } from 'lucide-react';

export function AttendanceHistory() {
  const { attendanceRecords } = useApp();
  const { navigate } = useNav();

  const present = attendanceRecords.filter((r) => r.status === 'present').length;
  const total = 26; // mock denominator
  const rate = Math.round((present / total) * 100);
  const hours = attendanceRecords.length * 2; // approx

  return (
    <PageContainer className="pb-28 lg:pb-10">
      <PageHeader title="My Attendance" subtitle="Your participation record across ACVOSA activities." />

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatTile label="Activities Attended" value={present} />
        <StatTile label="Attendance Rate" value={`${rate}%`} />
        <StatTile label="Hours Participated" value={hours} />
        <StatTile label="Current Streak" value="6" sub="activities in a row" />
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-ink-charcoal tracking-tight mb-4">History</h2>
        <Card padded={false} className="overflow-hidden">
          {attendanceRecords.length === 0 ? (
            <EmptyState icon={<CheckSquare size={24} />} title="No attendance yet" description="Your attendance will appear here after your first activity." />
          ) : (
            <div className="divide-y divide-ink-light-grey">
              {attendanceRecords.map((r) => (
                <div key={r.id} className="flex items-center gap-4 p-4 hover:bg-ink-off-white transition-colors">
                  <div className="w-10 h-10 rounded-full bg-ink-light-grey flex items-center justify-center shrink-0">
                    <Check size={18} className="text-ink-charcoal" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-charcoal tracking-tight truncate">{r.activityName}</p>
                    <p className="text-xs text-ink-dark-grey/60 mt-0.5 tracking-tight flex items-center gap-1.5">
                      <Clock size={11} /> {formatDate(r.date, 'long')} · Checked in {r.checkInTime}
                    </p>
                  </div>
                  <Badge tone="dark" dot>Present</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="mt-6">
        <button onClick={() => navigate('reservations')} className="text-sm text-ink-dark-grey/70 hover:text-ink-charcoal transition-colors tracking-tight">
          View my reservations →
        </button>
      </div>
    </PageContainer>
  );
}

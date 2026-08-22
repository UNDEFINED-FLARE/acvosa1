import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { PageContainer } from '@/components/layout/Topbar';
import { PageHeader } from '@/components/ui/SectionHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatTile } from '@/components/ui/StatTile';
import { Download, Check, X, Users } from 'lucide-react';

export function AdminAttendance() {
  const { participants, activities } = useApp();
  const [selectedActivity, setSelectedActivity] = useState(activities[0]?.id ?? '');

  const activity = activities.find((a) => a.id === selectedActivity) ?? activities[0];
  const checkedIn = participants.filter((p) => p.attended).length;
  const absent = participants.filter((p) => p.reserved && !p.attended).length;
  const rate = participants.length > 0 ? Math.round((checkedIn / participants.length) * 100) : 0;

  return (
    <PageContainer className="pb-28 lg:pb-10">
      <PageHeader title="Attendance" subtitle="Live attendance tracking and participant management." />

      {/* Activity selector */}
      <div className="mt-6 -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 w-max">
          {activities.filter((a) => a.status !== 'upcoming').map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedActivity(a.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium tracking-tight whitespace-nowrap transition-all ${
                selectedActivity === a.id ? 'bg-ink-black text-ink-white' : 'bg-ink-white text-ink-dark-grey border border-ink-light-grey'
              }`}
            >
              {a.name.length > 30 ? a.name.slice(0, 28) + '…' : a.name}
            </button>
          ))}
        </div>
      </div>

      {activity && (
        <>
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatTile label="Registered" value={participants.length} icon={<Users size={16} />} />
            <StatTile label="Checked In" value={checkedIn} />
            <StatTile label="Absent" value={absent} />
            <StatTile label="Attendance" value={`${rate}%`} />
          </div>

          <div className="mt-6 flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink-charcoal tracking-tight">Participant List</h2>
            <Button variant="outline" size="sm">
              <Download size={15} /> Export Attendance
            </Button>
          </div>

          {/* Desktop table */}
          <Card padded={false} className="mt-4 hidden sm:block overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-light-grey bg-ink-off-white">
                  <th className="text-left font-medium text-2xs uppercase tracking-wider text-ink-dark-grey/55 px-5 py-3">Student Name</th>
                  <th className="text-left font-medium text-2xs uppercase tracking-wider text-ink-dark-grey/55 px-3 py-3">Student No.</th>
                  <th className="text-center font-medium text-2xs uppercase tracking-wider text-ink-dark-grey/55 px-3 py-3">Reservation</th>
                  <th className="text-center font-medium text-2xs uppercase tracking-wider text-ink-dark-grey/55 px-3 py-3">Attendance</th>
                  <th className="text-right font-medium text-2xs uppercase tracking-wider text-ink-dark-grey/55 px-5 py-3">Check-in</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-light-grey">
                {participants.map((p) => (
                  <tr key={p.id} className="hover:bg-ink-off-white transition-colors">
                    <td className="px-5 py-3.5 font-medium text-ink-charcoal tracking-tight">{p.name}</td>
                    <td className="px-3 py-3.5 tabular-nums text-ink-dark-grey/70">{p.studentNumber}</td>
                    <td className="text-center px-3 py-3.5">
                      {p.reserved ? <Badge tone="light">Reserved</Badge> : <Badge tone="outline">—</Badge>}
                    </td>
                    <td className="text-center px-3 py-3.5">
                      {p.attended ? (
                        <span className="inline-flex items-center gap-1 text-ink-charcoal"><Check size={14} /> Present</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-ink-dark-grey/50"><X size={14} /> Absent</span>
                      )}
                    </td>
                    <td className="text-right tabular-nums text-ink-dark-grey/70 px-5 py-3.5">{p.checkInTime ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Mobile list */}
          <div className="mt-4 flex flex-col gap-2 sm:hidden">
            {participants.map((p) => (
              <Card key={p.id} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${p.attended ? 'bg-ink-black' : 'bg-ink-light-grey'}`}>
                  {p.attended ? <Check size={16} className="text-ink-white" /> : <X size={16} className="text-ink-dark-grey/50" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-charcoal tracking-tight truncate">{p.name}</p>
                  <p className="text-xs text-ink-dark-grey/55 tracking-tight">{p.studentNumber}</p>
                </div>
                <span className="text-xs text-ink-dark-grey/60 tabular-nums shrink-0">{p.checkInTime ?? '—'}</span>
              </Card>
            ))}
          </div>
        </>
      )}
    </PageContainer>
  );
}

import { useApp } from '@/context/AppContext';
import { useNav } from '@/context/NavContext';
import { PageContainer } from '@/components/layout/Topbar';
import { PageHeader } from '@/components/ui/SectionHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { formatDate } from '@/utils/format';
import { Users, Eye } from 'lucide-react';

export function AdminReservations() {
  const { activities } = useApp();
  const { navigate } = useNav();

  return (
    <PageContainer className="pb-28 lg:pb-10">
      <PageHeader title="Reservations" subtitle="Monitor registration and capacity across all activities." />

      {/* Desktop table */}
      <Card padded={false} className="mt-6 hidden sm:block overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-light-grey bg-ink-off-white">
              <th className="text-left font-medium text-2xs uppercase tracking-wider text-ink-dark-grey/55 px-5 py-3">Activity</th>
              <th className="text-center font-medium text-2xs uppercase tracking-wider text-ink-dark-grey/55 px-3 py-3">Capacity</th>
              <th className="text-center font-medium text-2xs uppercase tracking-wider text-ink-dark-grey/55 px-3 py-3">Reserved</th>
              <th className="text-center font-medium text-2xs uppercase tracking-wider text-ink-dark-grey/55 px-3 py-3">Available</th>
              <th className="text-center font-medium text-2xs uppercase tracking-wider text-ink-dark-grey/55 px-3 py-3">Attendance</th>
              <th className="text-center font-medium text-2xs uppercase tracking-wider text-ink-dark-grey/55 px-3 py-3">No-shows</th>
              <th className="text-right font-medium text-2xs uppercase tracking-wider text-ink-dark-grey/55 px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-light-grey">
            {activities.map((a) => {
              const available = a.capacity - a.reserved;
              const attended = a.status === 'completed' ? Math.round(a.reserved * 0.85) : 0;
              const noShows = a.status === 'completed' ? a.reserved - attended : 0;
              return (
                <tr key={a.id} className="hover:bg-ink-off-white transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-ink-charcoal tracking-tight">{a.name}</p>
                    <p className="text-xs text-ink-dark-grey/55 mt-0.5 tracking-tight">{formatDate(a.date)}</p>
                  </td>
                  <td className="text-center tabular-nums text-ink-dark-grey/70 px-3 py-4">{a.capacity}</td>
                  <td className="text-center tabular-nums font-medium text-ink-charcoal px-3 py-4">{a.reserved}</td>
                  <td className="text-center tabular-nums text-ink-dark-grey/70 px-3 py-4">{available}</td>
                  <td className="text-center tabular-nums text-ink-dark-grey/70 px-3 py-4">{attended || '—'}</td>
                  <td className="text-center tabular-nums text-ink-dark-grey/70 px-3 py-4">{noShows || '—'}</td>
                  <td className="px-5 py-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => navigate('admin-attendance')}>
                      <Eye size={14} /> Participants
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* Mobile cards */}
      <div className="mt-6 flex flex-col gap-3 sm:hidden">
        {activities.map((a) => {
          const available = a.capacity - a.reserved;
          return (
            <Card key={a.id}>
              <p className="font-medium text-ink-charcoal tracking-tight">{a.name}</p>
              <p className="text-xs text-ink-dark-grey/55 mt-0.5 tracking-tight">{formatDate(a.date)}</p>
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-ink-dark-grey/60">{a.reserved}/{a.capacity} reserved</span>
                  <span className="font-medium text-ink-charcoal">{available} available</span>
                </div>
                <Progress value={a.reserved} max={a.capacity} />
              </div>
              <Button variant="ghost" size="sm" fullWidth className="mt-3" onClick={() => navigate('admin-attendance')}>
                <Users size={14} /> View Participants
              </Button>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}

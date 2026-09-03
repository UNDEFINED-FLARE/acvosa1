import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { PageContainer } from '@/components/layout/Topbar';
import { PageHeader } from '@/components/ui/SectionHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatTile } from '@/components/ui/StatTile';
import { Search, Users, Clock, Award } from 'lucide-react';

export function AdminMembers() {
  const { members } = useApp();
  const [query, setQuery] = useState('');

  const filtered = members.filter(
    (m) => m.name.toLowerCase().includes(query.toLowerCase()) || m.studentNumber.includes(query)
  );

  const activeCount = members.filter((m) => m.status === 'active').length;
  const totalHours = members.reduce((s, m) => s + m.volunteerHours, 0);
  const totalAttended = members.reduce((s, m) => s + m.activitiesAttended, 0);

  const field = "w-full h-11 pl-10 pr-3.5 rounded-xl bg-ink-white border border-ink-light-grey text-sm text-ink-charcoal tracking-tight focus:outline-none focus:border-ink-dark-grey transition-colors";

  return (
    <PageContainer className="pb-28 lg:pb-10">
      <PageHeader title="Members" subtitle="Manage Institute membership and participation records." />

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatTile label="Total Members" value={members.length} icon={<Users size={16} />} />
        <StatTile label="Active" value={activeCount} />
        <StatTile label="Total Activities" value={totalAttended} icon={<Award size={16} />} />
        <StatTile label="Volunteer Hours" value={totalHours.toLocaleString()} icon={<Clock size={16} />} />
      </div>

      <div className="mt-6 relative max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-dark-grey/40" />
        <input className={field} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or student number..." />
      </div>

      {/* Desktop table */}
      <Card padded={false} className="mt-4 hidden sm:block overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-light-grey bg-ink-off-white">
              <th className="text-left font-medium text-2xs uppercase tracking-wider text-ink-dark-grey/55 px-5 py-3">Name</th>
              <th className="text-left font-medium text-2xs uppercase tracking-wider text-ink-dark-grey/55 px-3 py-3">Student No.</th>
              <th className="text-left font-medium text-2xs uppercase tracking-wider text-ink-dark-grey/55 px-3 py-3">Faculty</th>
              <th className="text-left font-medium text-2xs uppercase tracking-wider text-ink-dark-grey/55 px-3 py-3">Role</th>
              <th className="text-center font-medium text-2xs uppercase tracking-wider text-ink-dark-grey/55 px-3 py-3">Activities</th>
              <th className="text-center font-medium text-2xs uppercase tracking-wider text-ink-dark-grey/55 px-3 py-3">Hours</th>
              <th className="text-right font-medium text-2xs uppercase tracking-wider text-ink-dark-grey/55 px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-light-grey">
            {filtered.map((m) => (
              <tr key={m.id} className="hover:bg-ink-off-white transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-ink-charcoal text-ink-white flex items-center justify-center text-xs font-semibold shrink-0">
                      {m.name.split(' ').map((x) => x[0]).slice(0, 2).join('')}
                    </div>
                    <span className="font-medium text-ink-charcoal tracking-tight">{m.name}</span>
                  </div>
                </td>
                <td className="px-3 py-3.5 tabular-nums text-ink-dark-grey/70">{m.studentNumber}</td>
                <td className="px-3 py-3.5 text-ink-dark-grey/70 tracking-tight">{m.faculty}</td>
                <td className="px-3 py-3.5"><Badge tone="outline">{m.role}</Badge></td>
                <td className="text-center tabular-nums text-ink-dark-grey/70 px-3 py-3.5">{m.activitiesAttended}</td>
                <td className="text-center tabular-nums text-ink-dark-grey/70 px-3 py-3.5">{m.volunteerHours}</td>
                <td className="text-right px-5 py-3.5">
                  <Badge tone={m.status === 'active' ? 'dark' : 'light'} dot={m.status === 'active'}>
                    {m.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Mobile cards */}
      <div className="mt-4 flex flex-col gap-2 sm:hidden">
        {filtered.map((m) => (
          <Card key={m.id} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-ink-charcoal text-ink-white flex items-center justify-center text-xs font-semibold shrink-0">
              {m.name.split(' ').map((x) => x[0]).slice(0, 2).join('')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink-charcoal tracking-tight truncate">{m.name}</p>
              <p className="text-xs text-ink-dark-grey/55 tracking-tight">{m.faculty} · {m.role}</p>
            </div>
            <Badge tone={m.status === 'active' ? 'dark' : 'light'}>{m.status}</Badge>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}

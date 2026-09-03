import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { PageContainer } from '@/components/layout/Topbar';
import { PageHeader } from '@/components/ui/SectionHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/utils/format';
import { Ticket, Calendar, MapPin, Check, X, Clock } from 'lucide-react';
import type { ReservationStatus } from '@/types';

const TABS: { key: ReservationStatus | 'all'; label: string }[] = [
  { key: 'confirmed', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

function QRTicket({ code, name, date, venue }: { code: string; name: string; date: string; venue: string }) {
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=4&data=${encodeURIComponent(code)}`;
  return (
    <div className="bg-ink-white border border-ink-light-grey rounded-2xl p-5 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xs font-medium uppercase tracking-wider text-ink-dark-grey/50">Digital Ticket</span>
        <Ticket size={16} className="text-ink-dark-grey/40" />
      </div>
      <div className="flex gap-4">
        <div className="shrink-0 w-24 h-24 rounded-xl bg-ink-white border border-ink-light-grey p-1.5 overflow-hidden">
          <img src={qrImageUrl} alt="Reservation ticket code" className="w-full h-full object-contain" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink-charcoal tracking-tight line-clamp-2">{name}</p>
          <p className="text-xs text-ink-dark-grey/60 mt-1.5 tracking-tight flex items-center gap-1.5"><Calendar size={11} /> {formatDate(date, 'long')}</p>
          <p className="text-xs text-ink-dark-grey/60 mt-1 tracking-tight flex items-center gap-1.5 truncate"><MapPin size={11} /> {venue}</p>
          <p className="text-2xs font-mono text-ink-dark-grey/50 mt-2 tracking-tight truncate">{code}</p>
          <p className="text-2xs text-ink-dark-grey/40 mt-1 tracking-tight">Proof of reservation — check in with the venue's attendance QR code.</p>
        </div>
      </div>
    </div>
  );
}

export function ReservationsPage() {
  const { reservations } = useApp();
  const [tab, setTab] = useState<ReservationStatus | 'all'>('confirmed');

  const filtered = reservations.filter((r) => r.status === tab);

  return (
    <PageContainer className="pb-28 lg:pb-10">
      <PageHeader title="My Reservations" subtitle="Manage your places at Institute activities." />

      <div className="mt-6 flex items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium tracking-tight transition-all ${
              tab === t.key ? 'bg-ink-black text-ink-white' : 'bg-ink-white text-ink-dark-grey border border-ink-light-grey hover:border-ink-grey'
            }`}
          >
            {t.label}
            <span className={`ml-2 text-2xs tabular-nums ${tab === t.key ? 'text-ink-white/60' : 'text-ink-dark-grey/40'}`}>
              {reservations.filter((r) => r.status === t.key).length}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-6">
        {filtered.length === 0 ? (
          <EmptyState icon={<Ticket size={24} />} title={`No ${tab} reservations`} description={tab === 'confirmed' ? 'Reserve a place at an activity to see it here.' : undefined} />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {filtered.map((r) => (
              <div key={r.id} className="flex flex-col gap-3">
                <Card>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink-charcoal tracking-tight">{r.activityName}</p>
                      <p className="text-xs text-ink-dark-grey/60 mt-1.5 tracking-tight flex items-center gap-1.5"><Calendar size={11} /> {formatDate(r.date, 'long')}</p>
                      <p className="text-xs text-ink-dark-grey/60 mt-1 tracking-tight flex items-center gap-1.5"><MapPin size={11} /> {r.venue}</p>
                    </div>
                    <Badge
                      tone={r.status === 'confirmed' ? 'dark' : r.status === 'completed' ? 'light' : 'outline'}
                      dot={r.status === 'confirmed'}
                    >
                      {r.status === 'confirmed' ? 'Confirmed' : r.status === 'completed' ? 'Completed' : 'Cancelled'}
                    </Badge>
                  </div>
                </Card>
                {r.status === 'confirmed' && <QRTicket code={r.ticketCode} name={r.activityName} date={r.date} venue={r.venue} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}

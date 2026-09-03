import { useApp } from '@/context/AppContext';
import { useNav } from '@/context/NavContext';
import { PageContainer } from '@/components/layout/Topbar';
import { PageHeader } from '@/components/ui/SectionHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Bell, CheckCheck, Calendar, ShieldCheck, AlertCircle, FolderKanban, Clock, Info,
} from 'lucide-react';
import type { NotificationCategory } from '@/types';

const ICONS: Record<NotificationCategory, typeof Bell> = {
  reservation: Calendar,
  attendance: ShieldCheck,
  deadline: AlertCircle,
  project: FolderKanban,
  reminder: Clock,
  system: Info,
};

export function NotificationsPage() {
  const { notifications, markAllRead, markRead, unreadCount } = useApp();
  const { navigate } = useNav();

  return (
    <PageContainer className="pb-28 lg:pb-10">
      <div className="flex items-start justify-between gap-4">
        <PageHeader title="Notifications" subtitle="Stay up to date with Institute activities and updates." />
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="shrink-0 mt-1">
            <CheckCheck size={15} /> Mark all read
          </Button>
        )}
      </div>

      <div className="mt-6">
        {notifications.length === 0 ? (
          <EmptyState icon={<Bell size={24} />} title="No notifications" />
        ) : (
          <div className="flex flex-col gap-3">
            {notifications.map((n) => {
              const Icon = ICONS[n.category];
              return (
                <Card
                  key={n.id}
                  className={`transition-all ${n.read ? 'opacity-75' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.read ? 'bg-ink-light-grey' : 'bg-ink-black'}`}>
                      <Icon size={18} className={n.read ? 'text-ink-dark-grey/60' : 'text-ink-white'} />
                    </div>
                    <div className="flex-1 min-w-0" onClick={() => markRead(n.id)}>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-ink-charcoal tracking-tight">{n.title}</p>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-ink-black shrink-0" />}
                      </div>
                      <p className="text-sm text-ink-dark-grey/70 mt-1 tracking-tight">{n.message}</p>
                      <p className="text-2xs text-ink-dark-grey/45 mt-2 tracking-tight">{n.timestamp}</p>
                    </div>
                    {n.activityId && (
                      <button
                        onClick={() => navigate('activity-detail', { id: n.activityId! })}
                        className="text-2xs font-medium text-ink-dark-grey/60 hover:text-ink-charcoal transition-colors shrink-0 tracking-tight"
                      >
                        View →
                      </button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PageContainer>
  );
}

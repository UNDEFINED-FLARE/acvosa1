import { useApp } from '@/context/AppContext';
import { useNav } from '@/context/NavContext';
import { PageContainer } from '@/components/layout/Topbar';
import { PageHeader } from '@/components/ui/SectionHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ActivityImage } from '@/components/ui/ActivityImage';
import { formatDate } from '@/utils/format';
import { Plus, Calendar, Users, Pencil, CalendarDays } from 'lucide-react';

export function AdminActivities() {
  const { activities } = useApp();
  const { navigate } = useNav();

  return (
    <PageContainer className="pb-28 lg:pb-10">
      <div className="flex items-start justify-between gap-4">
        <PageHeader title="Activities" subtitle="Create and manage Institute programmes." />
        <Button size="sm" onClick={() => navigate('admin-create-activity')} className="shrink-0">
          <Plus size={16} /> New Activity
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {activities.map((a) => (
          <Card key={a.id} hover={false} className="flex flex-col sm:flex-row sm:items-center gap-4">
            <ActivityImage
              seed={a.imageSeed}
              url={a.imageUrl}
              className="shrink-0 w-full h-28 sm:w-16 sm:h-16 rounded-xl"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-ink-charcoal tracking-tight">{a.name}</p>
                <Badge tone="outline">{a.category}</Badge>
              </div>
              <div className="flex items-center gap-4 mt-1.5 text-xs text-ink-dark-grey/60 tracking-tight flex-wrap">
                <span className="flex items-center gap-1.5"><Calendar size={11} /> {formatDate(a.date)}</span>
                <span className="flex items-center gap-1.5"><Users size={11} /> {a.reserved}/{a.capacity}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge
                tone={a.status === 'active' ? 'solid' : a.status === 'completed' ? 'light' : 'outline'}
                dot={a.status === 'active'}
              >
                {a.status === 'active' ? 'Live' : a.status === 'completed' ? 'Completed' : 'Upcoming'}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => navigate('admin-attendance')}>
                <Pencil size={14} /> Manage
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {activities.length === 0 && (
        <EmptyState
          icon={<CalendarDays size={24} />}
          title="No activities yet"
          description="Create your first Institute activity."
          action={<Button onClick={() => navigate('admin-create-activity')}><Plus size={16} /> New Activity</Button>}
        />
      )}
    </PageContainer>
  );
}

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { PageContainer } from '@/components/layout/Topbar';
import { PageHeader } from '@/components/ui/SectionHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Bell, Send, Clock } from 'lucide-react';
import type { NotificationCategory } from '@/types';

export function AdminNotifications() {
  const { sendNotification, notifications, activities } = useApp();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('All students');
  const [activityId, setActivityId] = useState('');

  const field = "w-full h-11 px-3.5 rounded-xl bg-ink-white border border-ink-light-grey text-sm text-ink-charcoal tracking-tight focus:outline-none focus:border-ink-dark-grey transition-colors";
  const label = "text-2xs font-medium uppercase tracking-wider text-ink-dark-grey/55 mb-1.5 block";

  const handleSend = (scheduled: boolean) => {
    if (!title || !message) return;
    const category: NotificationCategory = activityId ? 'reservation' : 'system';
    sendNotification({ title, message, category, activityId: activityId || undefined });
    setTitle(''); setMessage(''); setActivityId('');
    void scheduled;
  };

  const sentNotifications = notifications.slice(0, 6);

  return (
    <PageContainer className="pb-28 lg:pb-10">
      <PageHeader title="Notifications" subtitle="Send announcements and reminders to ACVOSA members." />

      <div className="mt-6 grid lg:grid-cols-[1.3fr_1fr] gap-6">
        {/* Compose */}
        <Card>
          <h2 className="text-base font-semibold text-ink-charcoal tracking-tight mb-4">Compose Notification</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className={label}>Title</label>
              <input className={field} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notification title" />
            </div>
            <div>
              <label className={label}>Message</label>
              <textarea className={`${field} h-24 py-3 resize-none`} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your message..." />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={label}>Target audience</label>
                <select className={field} value={audience} onChange={(e) => setAudience(e.target.value)}>
                  <option>All students</option>
                  <option>Reserved students</option>
                  <option>Volunteers</option>
                  <option>Coordinators</option>
                </select>
              </div>
              <div>
                <label className={label}>Linked activity</label>
                <select className={field} value={activityId} onChange={(e) => setActivityId(e.target.value)}>
                  <option value="">None</option>
                  {activities.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Button variant="primary" fullWidth onClick={() => handleSend(false)}>
                <Send size={16} /> Send Now
              </Button>
              <Button variant="outline" fullWidth onClick={() => handleSend(true)}>
                <Clock size={16} /> Schedule Notification
              </Button>
            </div>
          </div>
        </Card>

        {/* Recent sent */}
        <Card>
          <h2 className="text-base font-semibold text-ink-charcoal tracking-tight mb-4">Recent Notifications</h2>
          <div className="flex flex-col gap-3">
            {sentNotifications.map((n) => (
              <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl bg-ink-off-white">
                <div className="w-8 h-8 rounded-lg bg-ink-light-grey flex items-center justify-center shrink-0">
                  <Bell size={14} className="text-ink-dark-grey/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-charcoal tracking-tight">{n.title}</p>
                  <p className="text-xs text-ink-dark-grey/55 mt-0.5 tracking-tight line-clamp-1">{n.message}</p>
                  <p className="text-2xs text-ink-dark-grey/40 mt-1 tracking-tight">{n.timestamp}</p>
                </div>
                <Badge tone="outline">{n.category}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}

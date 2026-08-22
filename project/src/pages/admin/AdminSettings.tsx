import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useNav } from '@/context/NavContext';
import { PageContainer } from '@/components/layout/Topbar';
import { PageHeader } from '@/components/ui/SectionHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Bell, Shield, Database, LogOut, Building2 } from 'lucide-react';
import { DEMO_MODE } from '@/firebase/config';

export function AdminSettings() {
  const { pushToast } = useApp();
  const { user, signOut } = useAuth();
  const { navigate } = useNav();

  const userFullName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Administrator';
  const userInitials = user ? `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase() : 'A';
  const userEmail = user?.email ?? '';
  const userFaculty = user?.faculty ?? '';

  const field = "w-full h-11 px-3.5 rounded-xl bg-ink-white border border-ink-light-grey text-sm text-ink-charcoal tracking-tight focus:outline-none focus:border-ink-dark-grey transition-colors";
  const label = "text-2xs font-medium uppercase tracking-wider text-ink-dark-grey/55 mb-1.5 block";

  return (
    <PageContainer className="pb-28 lg:pb-10">
      <PageHeader title="Settings" subtitle="Configure ACVOSA Connect platform preferences." />

      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        {/* Profile */}
        <Card>
          <div className="flex items-center gap-4 mb-5">
            <Avatar initials={userInitials} size="lg" />
            <div>
              <p className="font-semibold text-ink-charcoal tracking-tight">{userFullName}</p>
              <p className="text-sm text-ink-dark-grey/60 tracking-tight">{userEmail}</p>
              <Badge tone="dark" dot className="mt-1.5">Administrator</Badge>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <label className={label}>Display name</label>
              <input className={field} defaultValue={userFullName} />
            </div>
            <div>
              <label className={label}>Email</label>
              <input className={field} defaultValue={userEmail} />
            </div>
            <div>
              <label className={label}>Department</label>
              <input className={field} defaultValue={userFaculty} />
            </div>
            <Button variant="primary" size="sm" onClick={() => pushToast('Profile updated', 'success')}>
              Save Changes
            </Button>
          </div>
        </Card>

        {/* Platform settings */}
        <div className="flex flex-col gap-5">
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-ink-light-grey flex items-center justify-center"><Bell size={18} className="text-ink-charcoal" /></div>
              <h3 className="text-base font-semibold text-ink-charcoal tracking-tight">Notifications</h3>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { label: 'New reservations', on: true },
                { label: 'Attendance alerts', on: true },
                { label: 'Deadline reminders', on: true },
                { label: 'Project updates', on: false },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-ink-dark-grey/80 tracking-tight">{s.label}</span>
                  <button
                    onClick={() => pushToast('Setting updated', 'info')}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors ${s.on ? 'bg-ink-black' : 'bg-ink-grey'}`}
                  >
                    <span className={`block w-5 h-5 rounded-full bg-ink-white transition-transform ${s.on ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-ink-light-grey flex items-center justify-center"><Shield size={18} className="text-ink-charcoal" /></div>
              <h3 className="text-base font-semibold text-ink-charcoal tracking-tight">Security</h3>
            </div>
            <Button variant="outline" size="sm" fullWidth onClick={() => pushToast('Password reset link sent', 'info')}>
              Reset password
            </Button>
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-ink-light-grey flex items-center justify-center"><Database size={18} className="text-ink-charcoal" /></div>
              <div>
                <h3 className="text-sm font-semibold text-ink-charcoal tracking-tight">Data Backend</h3>
                <p className="text-xs text-ink-dark-grey/55 tracking-tight">Firebase-ready architecture</p>
              </div>
            </div>
            <p className="text-xs text-ink-dark-grey/60 tracking-tight">
              {DEMO_MODE
                ? 'Demo Mode is active. Configure Firebase environment variables to enable live data persistence.'
                : 'Connected to Firebase. All data is persisted to Firestore and Storage.'}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Building2 size={14} className="text-ink-dark-grey/40" />
              <span className="text-xs text-ink-dark-grey/50 tracking-tight">University of Venda · ACVOSA</span>
            </div>
          </Card>

          <button
            onClick={() => signOut().then(() => navigate('login'))}
            className="flex items-center justify-center gap-2 p-4 text-sm text-ink-dark-grey/60 hover:text-ink-charcoal border border-ink-light-grey rounded-2xl hover:border-ink-grey transition-all tracking-tight"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </div>
    </PageContainer>
  );
}

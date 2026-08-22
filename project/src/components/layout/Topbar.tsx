import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useNav } from '@/context/NavContext';
import { Avatar } from '@/components/ui/Avatar';
import { Bell, ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

interface TopbarProps {
  title?: string;
  showBack?: boolean;
  admin?: boolean;
}

export function Topbar({ title, showBack, admin }: TopbarProps) {
  const { unreadCount } = useApp();
  const { user } = useAuth();
  const { back, navigate: nav } = useNav();

  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : 'User';
  const avatarInitials = user ? `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase() : 'U';

  return (
    <header className="sticky top-0 z-30 bg-ink-off-white/85 backdrop-blur-lg border-b border-ink-light-grey">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        <div className="flex items-center gap-3 min-w-0">
          {showBack && (
            <button
              onClick={back}
              className="w-9 h-9 rounded-full flex items-center justify-center text-ink-dark-grey hover:bg-ink-light-grey transition-colors shrink-0"
              aria-label="Go back"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          {title && (
            <h1 className="text-base sm:text-lg font-semibold text-ink-charcoal tracking-tight truncate">{title}</h1>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => nav(admin ? 'admin-notifications' : 'notifications')}
            className="relative w-10 h-10 rounded-full flex items-center justify-center text-ink-dark-grey hover:bg-ink-light-grey transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} strokeWidth={1.8} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-ink-black text-ink-white text-[10px] font-semibold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <button onClick={() => nav(admin ? 'admin-settings' : 'profile')} className="flex items-center gap-2.5 pl-1" aria-label="Profile">
            <Avatar initials={avatarInitials} size="sm" />
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-sm font-medium text-ink-charcoal tracking-tight max-w-[140px] truncate">{displayName}</span>
              <span className="text-2xs text-ink-dark-grey/60 tracking-tight">{admin ? 'Administrator' : 'Student'}</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}

export function PageContainer({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl mx-auto w-full ${className}`}>
      {children}
    </div>
  );
}

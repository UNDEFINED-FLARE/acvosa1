import { useNav, type Route } from '@/context/NavContext';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, CalendarDays, CheckSquare, FolderKanban, User,
  Home, Bell, BarChart3, Clock, Settings, FileText, Users, ListChecks, History,
  Network, Handshake,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  label: string;
  route: Route;
  icon: LucideIcon;
}

const studentNav: NavItem[] = [
  { label: 'Home', route: 'home', icon: Home },
  { label: 'Activities', route: 'activities', icon: CalendarDays },
  { label: 'Attendance', route: 'attendance', icon: CheckSquare },
  { label: 'Projects', route: 'projects', icon: FolderKanban },
  { label: 'Units', route: 'units', icon: Network },
  { label: 'Stakeholders', route: 'stakeholders', icon: Handshake },
  { label: 'Impact', route: 'impact', icon: BarChart3 },
  { label: 'History', route: 'history', icon: History },
  { label: 'Profile', route: 'profile', icon: User },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard', route: 'admin-dashboard', icon: LayoutDashboard },
  { label: 'Activities', route: 'admin-activities', icon: CalendarDays },
  { label: 'Reservations', route: 'admin-reservations', icon: ListChecks },
  { label: 'Attendance', route: 'admin-attendance', icon: CheckSquare },
  { label: 'Notifications', route: 'admin-notifications', icon: Bell },
  { label: 'Projects', route: 'admin-projects', icon: FolderKanban },
  { label: 'Units', route: 'units', icon: Network },
  { label: 'Stakeholders', route: 'stakeholders', icon: Handshake },
  { label: 'Impact', route: 'admin-impact', icon: BarChart3 },
  { label: 'Members', route: 'admin-members', icon: Users },
  { label: 'Reports', route: 'admin-reports', icon: FileText },
  { label: 'Settings', route: 'admin-settings', icon: Settings },
];

function Brand({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-xl bg-ink-black flex items-center justify-center shrink-0">
              <span className="text-ink-white font-bold text-lg tracking-tighter"><img src="/logo.jpg" alt="Institute for Rural Development logo" className="w-full h-full object-cover" /></span>
      </div>
      {!collapsed && (
        <div className="leading-none">
          <p className="font-semibold text-sm text-ink-charcoal tracking-tight">UNIVEN IRD</p>
          <p className="text-2xs text-ink-dark-grey/60 tracking-wider uppercase mt-0.5">Rural Development</p>
        </div>
      )}
    </div>
  );
}

export function StudentSidebar() {
  const { route, navigate } = useNav();
  const { signOut } = useAuth();
  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-ink-light-grey bg-ink-white h-screen sticky top-0">
      <div className="px-5 py-6">
        <Brand />
      </div>
      <nav className="flex-1 px-3 py-2 flex flex-col gap-1">
        {studentNav.map((item) => {
          const active = route === item.route
          || (item.route === 'activities' && route === 'activity-detail')
          || (item.route === 'projects' && route === 'project-detail')
          || (item.route === 'units' && route === 'unit-detail');
          return (
            <button
              key={item.route}
              onClick={() => navigate(item.route)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium tracking-tight transition-all duration-200 ${
                active
                  ? 'bg-ink-black text-ink-white'
                  : 'text-ink-dark-grey hover:bg-ink-light-grey hover:text-ink-charcoal'
              }`}
            >
              <item.icon size={18} strokeWidth={active ? 2.2 : 1.8} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="px-5 py-4 border-t border-ink-light-grey">
        <button
          onClick={() => signOut()}
          className="text-xs text-ink-dark-grey/60 hover:text-ink-charcoal transition-colors tracking-tight"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}

export function AdminSidebar() {
  const { route, navigate } = useNav();
  const { signOut } = useAuth();
  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-ink-light-grey bg-ink-white h-screen sticky top-0">
      <div className="px-5 py-6">
        <Brand />
      </div>
      <div className="px-5 pb-3">
        <span className="text-2xs font-medium text-ink-dark-grey/50 uppercase tracking-wider">Administrator</span>
      </div>
      <nav className="flex-1 px-3 py-1 flex flex-col gap-1 overflow-y-auto scrollbar-thin">
        {adminNav.map((item) => {
          const active = route === item.route
          || (item.route === 'admin-activities' && route === 'admin-create-activity')
          || (item.route === 'units' && route === 'unit-detail');
          return (
            <button
              key={item.route}
              onClick={() => navigate(item.route)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium tracking-tight transition-all duration-200 ${
                active
                  ? 'bg-ink-black text-ink-white'
                  : 'text-ink-dark-grey hover:bg-ink-light-grey hover:text-ink-charcoal'
              }`}
            >
              <item.icon size={18} strokeWidth={active ? 2.2 : 1.8} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="px-5 py-4 border-t border-ink-light-grey">
        <button
          onClick={() => signOut()}
          className="text-xs text-ink-dark-grey/60 hover:text-ink-charcoal transition-colors tracking-tight"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}

const studentBottom: NavItem[] = [
  { label: 'Home', route: 'home', icon: Home },
  { label: 'Activities', route: 'activities', icon: CalendarDays },
  { label: 'Attendance', route: 'attendance', icon: Clock },
  { label: 'Projects', route: 'projects', icon: FolderKanban },
  { label: 'Units', route: 'units', icon: Network },
  { label: 'Profile', route: 'profile', icon: User },
];

const adminBottom: NavItem[] = [
  { label: 'Dashboard', route: 'admin-dashboard', icon: LayoutDashboard },
  { label: 'Activities', route: 'admin-activities', icon: CalendarDays },
  { label: 'Attendance', route: 'admin-attendance', icon: CheckSquare },
  { label: 'Projects', route: 'admin-projects', icon: FolderKanban },
  { label: 'Units', route: 'units', icon: Network },
  { label: 'Impact', route: 'admin-impact', icon: BarChart3 },
];

export function BottomNav({ admin }: { admin?: boolean }) {
  const { route, navigate } = useNav();
  const items = admin ? adminBottom : studentBottom;
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-ink-white/95 backdrop-blur-lg border-t border-ink-light-grey pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-around px-2">
        {items.map((item) => {
          const active = route === item.route
            || (item.route === 'activities' && (route === 'activity-detail' || route === 'admin-activities' || route === 'admin-create-activity'))
            || (item.route === 'admin-attendance' && route === 'admin-attendance')
            || (item.route === 'projects' && (route === 'project-detail' || route === 'admin-projects'))
            || (item.route === 'units' && route === 'unit-detail')
            || (item.route === 'admin-impact' && route === 'admin-impact');
          return (
            <button
              key={item.route}
              onClick={() => navigate(item.route)}
              className="flex flex-col items-center justify-center gap-1 py-2.5 px-3 min-w-[58px] transition-colors"
            >
              <item.icon
                size={20}
                strokeWidth={active ? 2.4 : 1.8}
                className={active ? 'text-ink-black' : 'text-ink-dark-grey/55'}
              />
              <span className={`text-[10px] font-medium tracking-tight ${active ? 'text-ink-black' : 'text-ink-dark-grey/55'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

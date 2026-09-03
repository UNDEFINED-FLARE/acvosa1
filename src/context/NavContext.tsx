import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Route =
  // student
  | 'home'
  | 'activities'
  | 'activity-detail'
  | 'attendance'
  | 'reservations'
  | 'notifications'
  | 'projects'
  | 'project-detail'
  | 'impact'
  | 'history'
  | 'profile'
  // institute (shared by both roles)
  | 'units'
  | 'unit-detail'
  // admin
  | 'admin-dashboard'
  | 'admin-activities'
  | 'admin-create-activity'
  | 'admin-reservations'
  | 'admin-attendance'
  | 'admin-notifications'
  | 'admin-projects'
  | 'admin-create-project'
  | 'admin-impact'
  | 'admin-members'
  | 'admin-reports'
  | 'admin-venues'
  | 'admin-settings';

interface NavState {
  route: Route;
  params: Record<string, string>;
  navigate: (route: Route, params?: Record<string, string>) => void;
  back: () => void;
}

const NavContext = createContext<NavState | null>(null);

export function NavProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<{ route: Route; params: Record<string, string> }[]>([
    { route: 'home', params: {} },
  ]);

  const current = stack[stack.length - 1];

  const navigate = (route: Route, params: Record<string, string> = {}) => {
    setStack((s) => [...s, { route, params }]);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const back = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));

  useEffect(() => {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
  }, [current.route]);

  return (
    <NavContext.Provider value={{ route: current.route, params: current.params, navigate, back }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav must be used within NavProvider');
  return ctx;
}

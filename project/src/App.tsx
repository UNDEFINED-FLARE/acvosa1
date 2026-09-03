import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AppProvider } from '@/context/AppContext';
import { NavProvider, useNav, type Route } from '@/context/NavContext';
import { ToastStack } from '@/components/ui/Toast';
import { FullPageLoader, DemoModeBanner, PageSkeleton } from '@/components/ui/LoadingStates';
import { StudentSidebar, AdminSidebar, BottomNav } from '@/components/layout/Navigation';
import { Topbar } from '@/components/layout/Topbar';

// Auth pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';

// Student pages
import { StudentDashboard } from '@/pages/student/StudentDashboard';
import { ActivitiesPage } from '@/pages/student/ActivitiesPage';
import { ActivityDetail } from '@/pages/student/ActivityDetail';
import { AttendanceHistory } from '@/pages/student/AttendanceHistory';
import { ReservationsPage } from '@/pages/student/ReservationsPage';
import { NotificationsPage } from '@/pages/student/NotificationsPage';
import { ProjectsPage } from '@/pages/student/ProjectsPage';
import { ProjectDetail } from '@/pages/student/ProjectDetail';
import { ImpactDashboard } from '@/pages/student/ImpactDashboard';
import { HistoryPage } from '@/pages/student/HistoryPage';
import { ProfilePage } from '@/pages/student/ProfilePage';

// Admin pages
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminActivities } from '@/pages/admin/AdminActivities';
import { AdminCreateActivity } from '@/pages/admin/AdminCreateActivity';
import { AdminReservations } from '@/pages/admin/AdminReservations';
import { AdminAttendance } from '@/pages/admin/AdminAttendance';
import { AdminNotifications } from '@/pages/admin/AdminNotifications';
import { AdminProjects } from '@/pages/admin/AdminProjects';
import { AdminImpact } from '@/pages/admin/AdminImpact';
import { AdminMembers } from '@/pages/admin/AdminMembers';
import { AdminReports } from '@/pages/admin/AdminReports';
import { AdminSettings } from '@/pages/admin/AdminSettings';

const ADMIN_ROUTES = new Set<Route>([
  'admin-dashboard', 'admin-activities', 'admin-create-activity',
  'admin-reservations', 'admin-attendance', 'admin-notifications',
  'admin-projects', 'admin-impact', 'admin-members', 'admin-reports', 'admin-settings',
]);

const AUTH_ROUTES = new Set<Route>(['login', 'register', 'forgot-password']);

const STUDENT_ROUTES = new Set<Route>([
  'home', 'activities', 'activity-detail', 'attendance', 'reservations',
  'notifications', 'projects', 'project-detail', 'impact', 'history', 'profile',
]);

function renderPage(route: Route): React.ReactNode {
  // Auth
  if (route === 'login') return <LoginPage />;
  if (route === 'register') return <RegisterPage />;
  if (route === 'forgot-password') return <ForgotPasswordPage />;

  // Student
  if (route === 'home') return <StudentDashboard />;
  if (route === 'activities') return <ActivitiesPage />;
  if (route === 'activity-detail') return <ActivityDetail />;
  if (route === 'attendance') return <AttendanceHistory />;
  if (route === 'reservations') return <ReservationsPage />;
  if (route === 'notifications') return <NotificationsPage />;
  if (route === 'projects') return <ProjectsPage />;
  if (route === 'project-detail') return <ProjectDetail />;
  if (route === 'impact') return <ImpactDashboard />;
  if (route === 'history') return <HistoryPage />;
  if (route === 'profile') return <ProfilePage />;

  // Admin
  if (route === 'admin-dashboard') return <AdminDashboard />;
  if (route === 'admin-activities') return <AdminActivities />;
  if (route === 'admin-create-activity') return <AdminCreateActivity />;
  if (route === 'admin-reservations') return <AdminReservations />;
  if (route === 'admin-attendance') return <AdminAttendance />;
  if (route === 'admin-notifications') return <AdminNotifications />;
  if (route === 'admin-projects') return <AdminProjects />;
  if (route === 'admin-impact') return <AdminImpact />;
  if (route === 'admin-members') return <AdminMembers />;
  if (route === 'admin-reports') return <AdminReports />;
  if (route === 'admin-settings') return <AdminSettings />;

  return <StudentDashboard />;
}

function determineRoute(route: Route, user: AppUser | null): Route {
  if (!user) {
    return AUTH_ROUTES.has(route) ? route : 'login';
  }

  // Authenticated user on an auth page → redirect to their dashboard
  if (AUTH_ROUTES.has(route)) {
    return user.role === 'admin' || user.role === 'superAdmin' ? 'admin-dashboard' : 'home';
  }

  // Admin route protection
  if (ADMIN_ROUTES.has(route)) {
    const isAdmin = user.role === 'admin' || user.role === 'superAdmin' ||
      user.role === 'eventManager' || user.role === 'projectManager' || user.role === 'reportViewer';
    if (!isAdmin) return 'home';
  }

  return route;
}

import type { AppUser } from '@/types';

function Shell() {
  const { user, loading, initialized } = useAuth();
  const { route, params } = useNav();

  if (!initialized || loading) {
    return <FullPageLoader label="Loading IRD Connect..." />;
  }

  const effectiveRoute = determineRoute(route, user);

  // Auth pages — no sidebar/layout
  if (AUTH_ROUTES.has(effectiveRoute)) {
    return (
      <>
        {renderPage(effectiveRoute)}
        <ToastStack />
      </>
    );
  }

  const isAdmin = ADMIN_ROUTES.has(effectiveRoute);
  const showTopbar = effectiveRoute !== 'home' && effectiveRoute !== 'admin-dashboard';
  const detailRoutes = new Set<Route>(['activity-detail', 'project-detail', 'reservations', 'notifications', 'impact', 'history', 'profile', 'attendance', 'activities']);
  const showTopbarFinal = showTopbar || detailRoutes.has(effectiveRoute);

  return (
    <div className="flex min-h-screen bg-ink-off-white">
      {isAdmin ? <AdminSidebar /> : <StudentSidebar />}
      <div className="flex-1 min-w-0 flex flex-col">
        {isAdmin && <DemoModeBanner />}
        {showTopbarFinal && <Topbar admin={isAdmin} />}
        <main className="flex-1" key={effectiveRoute + JSON.stringify(params)}>
          {renderPage(effectiveRoute)}
        </main>
      </div>
      <BottomNav admin={isAdmin} />
      <ToastStack />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavProvider>
        <AppProvider>
          <Shell />
        </AppProvider>
      </NavProvider>
    </AuthProvider>
  );
}

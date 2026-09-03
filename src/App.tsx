import { AppProvider, useApp } from '@/context/AppContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { NavProvider, useNav } from '@/context/NavContext';
import { ToastStack } from '@/components/ui/Toast';
import { Login } from '@/pages/auth/Login';
import { StudentSidebar, AdminSidebar, BottomNav } from '@/components/layout/Navigation';
import { Topbar } from '@/components/layout/Topbar';
import { Loader2 } from 'lucide-react';

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

// Institute pages (shared by both roles)
import { UnitsPage } from '@/pages/institute/UnitsPage';
import { UnitDetail } from '@/pages/institute/UnitDetail';
import { StakeholdersPage } from '@/pages/institute/StakeholdersPage';

// Admin pages
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminActivities } from '@/pages/admin/AdminActivities';
import { AdminCreateActivity } from '@/pages/admin/AdminCreateActivity';
import { AdminReservations } from '@/pages/admin/AdminReservations';
import { AdminAttendance } from '@/pages/admin/AdminAttendance';
import { AdminNotifications } from '@/pages/admin/AdminNotifications';
import { AdminProjects } from '@/pages/admin/AdminProjects';
import { AdminCreateProject } from '@/pages/admin/AdminCreateProject';
import { AdminImpact } from '@/pages/admin/AdminImpact';
import { AdminMembers } from '@/pages/admin/AdminMembers';
import { AdminReports } from '@/pages/admin/AdminReports';
import { AdminSettings } from '@/pages/admin/AdminSettings';
import { AdminVenues } from '@/pages/admin/AdminVenues';

function StudentRouter() {
  const { route } = useNav();

  const detailRoutes = new Set(['activity-detail', 'project-detail', 'reservations', 'notifications', 'impact', 'history', 'profile', 'attendance', 'units', 'unit-detail', 'stakeholders']);
  const showTopbar = detailRoutes.has(route) || route === 'activities';

  return (
    <div className="flex min-h-screen bg-ink-off-white">
      <StudentSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        {showTopbar && <Topbar />}
        <main className="flex-1">
          {renderStudent(route)}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}

function renderStudent(route: string) {
  switch (route) {
    case 'home': return <StudentDashboard />;
    case 'activities': return <ActivitiesPage />;
    case 'activity-detail': return <ActivityDetail />;
    case 'attendance': return <AttendanceHistory />;
    case 'reservations': return <ReservationsPage />;
    case 'notifications': return <NotificationsPage />;
    case 'projects': return <ProjectsPage />;
    case 'project-detail': return <ProjectDetail />;
    case 'impact': return <ImpactDashboard />;
    case 'history': return <HistoryPage />;
    case 'profile': return <ProfilePage />;
    case 'units': return <UnitsPage />;
    case 'unit-detail': return <UnitDetail />;
    case 'stakeholders': return <StakeholdersPage />;
    default: return <StudentDashboard />;
  }
}

function AdminRouter() {
  const { route } = useNav();

  const showTopbar = route !== 'admin-dashboard';

  return (
    <div className="flex min-h-screen bg-ink-off-white">
      <AdminSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        {showTopbar && <Topbar admin />}
        <main className="flex-1">
          {renderAdmin(route)}
        </main>
      </div>
      <BottomNav admin />
    </div>
  );
}

function renderAdmin(route: string) {
  switch (route) {
    case 'admin-dashboard': return <AdminDashboard />;
    case 'admin-activities': return <AdminActivities />;
    case 'admin-create-activity': return <AdminCreateActivity />;
    case 'admin-reservations': return <AdminReservations />;
    case 'admin-attendance': return <AdminAttendance />;
    case 'admin-notifications': return <AdminNotifications />;
    case 'admin-projects': return <AdminProjects />;
    case 'admin-create-project': return <AdminCreateProject />;
    case 'admin-impact': return <AdminImpact />;
    case 'admin-members': return <AdminMembers />;
    case 'admin-reports': return <AdminReports />;
    case 'admin-venues': return <AdminVenues />;
    case 'admin-settings': return <AdminSettings />;
    case 'units': return <UnitsPage />;
    case 'unit-detail': return <UnitDetail />;
    case 'stakeholders': return <StakeholdersPage />;
    default: return <AdminDashboard />;
  }
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-ink-off-white flex items-center justify-center">
      <Loader2 className="animate-spin text-ink-charcoal" size={28} />
    </div>
  );
}

function Shell() {
  const { session, loading: authLoading } = useAuth();
  const { role, loading: appLoading } = useApp();

  if (authLoading) return <LoadingScreen />;
  if (!session) return <Login />;
  if (appLoading) return <LoadingScreen />;

  return role === 'admin' ? <AdminRouter /> : <StudentRouter />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <NavProvider>
          <Shell />
          <ToastStack />
        </NavProvider>
      </AppProvider>
    </AuthProvider>
  );
}

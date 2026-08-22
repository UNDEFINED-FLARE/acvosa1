import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import type {
  Activity, AppNotification, AttendanceRecord, Deadline, ImpactSnapshot,
  Member, Participant, Project, Reservation,
} from '@/types';
import {
  activities as initialActivities,
  attendanceRecords as initialAttendance,
  deadlines as initialDeadlines,
  historyEvents,
  impactSnapshots,
  members as initialMembers,
  notifications as initialNotifications,
  participants as initialParticipants,
  projects as initialProjects,
  reservations as initialReservations,
} from '@/data/mockData';
import {
  reserveActivity as svcReserve,
  cancelReservation as svcCancel,
  verifyAttendance as svcVerify,
  sendNotification as svcSendNotification,
  createActivity as svcCreateActivity,
  createProject as svcCreateProject,
  logAuditEvent,
  getActivities, getActivity, getReservationsForStudent,
  getAttendanceForStudent, getNotificationsForUser, markNotificationRead,
  markAllNotificationsRead, getDeadlines, getProjects, getProject,
  getImpactMetrics, getMembers, getHistoryEvents,
} from '@/firebase/services';
import { DEMO_MODE } from '@/firebase/config';

interface Toast {
  id: number;
  message: string;
  tone: 'success' | 'info' | 'error';
}

interface AppState {
  activities: Activity[];
  deadlines: Deadline[];
  attendanceRecords: AttendanceRecord[];
  reservations: Reservation[];
  notifications: AppNotification[];
  projects: Project[];
  members: Member[];
  participants: Participant[];
  impact: ImpactSnapshot;
  history: typeof historyEvents;
  loading: boolean;
  demoMode: boolean;

  refreshActivities: () => Promise<void>;
  refreshReservations: () => Promise<void>;
  refreshAttendance: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  refreshProjects: () => Promise<void>;
  refreshAll: () => Promise<void>;

  isReserved: (activityId: string) => boolean;
  hasAttended: (activityId: string) => boolean;
  reservePlace: (activityId: string) => Promise<void>;
  cancelReservation: (activityId: string) => Promise<void>;
  confirmAttendance: (activityId: string, verificationMethod: string) => Promise<void>;

  unreadCount: number;
  markAllRead: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  sendNotification: (n: { title: string; message: string; category?: AppNotification['category']; activityId?: string }) => Promise<void>;

  createActivity: (a: Omit<Activity, 'id' | 'reserved' | 'status'>) => Promise<void>;
  createProject: (p: Omit<Project, 'id'>) => Promise<void>;

  toasts: Toast[];
  pushToast: (message: string, tone?: Toast['tone']) => void;
  dismissToast: (id: number) => void;
}

const AppContext = createContext<AppState | null>(null);

const PROTOTYPE_DATE = new Date('2026-08-21T00:00:00');

function resolveActivityState(a: Activity): Activity {
  const start = new Date(`${a.date}T${a.startTime}:00`);
  const end = new Date(`${a.date}T${a.endTime}:00`);
  let status: Activity['status'] = 'upcoming';
  if (PROTOTYPE_DATE >= start && PROTOTYPE_DATE <= end) status = 'active';
  else if (PROTOTYPE_DATE > end) status = 'completed';
  return { ...a, status };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.uid ?? 'demo-student';

  const [activities, setActivities] = useState<Activity[]>(() => initialActivities.map(resolveActivityState));
  const [deadlines, setDeadlines] = useState<Deadline[]>(initialDeadlines);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(initialAttendance);
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [participants] = useState<Participant[]>(initialParticipants);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [loading, setLoading] = useState(false);
  const [impact, setImpact] = useState<ImpactSnapshot>(impactSnapshots[0]);

  const pushToast = useCallback((message: string, tone: Toast['tone'] = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  // ─── Data loading ───────────────────────────────────────────

  const refreshActivities = useCallback(async () => {
    try {
      const data = await getActivities();
      setActivities(data);
    } catch { /* keep fallback data */ }
  }, []);

  const refreshReservations = useCallback(async () => {
    try {
      const data = await getReservationsForStudent(userId);
      setReservations(data);
    } catch { /* keep fallback */ }
  }, [userId]);

  const refreshAttendance = useCallback(async () => {
    try {
      const data = await getAttendanceForStudent(userId);
      setAttendanceRecords(data);
    } catch { /* keep fallback */ }
  }, [userId]);

  const refreshNotifications = useCallback(async () => {
    try {
      const data = await getNotificationsForUser(userId);
      setNotifications(data);
    } catch { /* keep fallback */ }
  }, [userId]);

  const refreshProjects = useCallback(async () => {
    try {
      const data = await getProjects();
      setProjects(data);
    } catch { /* keep fallback */ }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      refreshActivities(),
      refreshReservations(),
      refreshAttendance(),
      refreshNotifications(),
      refreshProjects(),
    ]);
    try {
      const [impactData, deadlineData, memberData] = await Promise.all([
        getImpactMetrics(),
        getDeadlines(),
        getMembers(),
      ]);
      setImpact(impactData);
      setDeadlines(deadlineData);
      setMembers(memberData);
    } catch { /* keep fallbacks */ }
    setLoading(false);
  }, [refreshActivities, refreshReservations, refreshAttendance, refreshNotifications, refreshProjects]);

  useEffect(() => {
    if (user) refreshAll();
  }, [user, refreshAll]);

  // ─── Derived state ──────────────────────────────────────────

  const isReserved = useCallback(
    (activityId: string) => reservations.some((r) => r.activityId === activityId && r.status === 'confirmed'),
    [reservations]
  );

  const hasAttended = useCallback(
    (activityId: string) => attendanceRecords.some((r) => r.activityId === activityId && r.status === 'present'),
    [attendanceRecords]
  );

  // ─── Mutations ──────────────────────────────────────────────

  const reservePlace = useCallback(async (activityId: string) => {
    const activity = activities.find((a) => a.id === activityId);
    if (!activity) return;
    if (isReserved(activityId)) return;
    try {
      const reservation = await svcReserve(activityId, userId);
      setActivities((prev) => prev.map((a) => (a.id === activityId ? { ...a, reserved: a.reserved + 1 } : a)));
      setReservations((prev) => [reservation, ...prev]);
      setNotifications((prev) => [
        { id: `n-${Date.now()}`, title: 'Reservation confirmed', message: `Your reservation for ${activity.name} is confirmed.`, category: 'reservation', timestamp: 'Just now', read: false, activityId },
        ...prev,
      ]);
      pushToast(`Place reserved for ${activity.name}`, 'success');
      if (!DEMO_MODE) await logAuditEvent({ actorId: userId, action: 'reserve', entityType: 'activity', entityId: activityId });
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Unable to reserve. Please try again.', 'error');
    }
  }, [activities, isReserved, userId, pushToast]);

  const cancelReservation = useCallback(async (activityId: string) => {
    const reservation = reservations.find((r) => r.activityId === activityId && r.status === 'confirmed');
    if (!reservation) return;
    try {
      await svcCancel(reservation.id, activityId);
      setActivities((prev) => prev.map((a) => (a.id === activityId ? { ...a, reserved: Math.max(0, a.reserved - 1) } : a)));
      setReservations((prev) => prev.map((r) => (r.id === reservation.id ? { ...r, status: 'cancelled' as const } : r)));
      pushToast('Reservation cancelled', 'info');
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Unable to cancel. Please try again.', 'error');
    }
  }, [reservations, pushToast]);

  const confirmAttendance = useCallback(async (activityId: string, verificationMethod: string) => {
    const activity = activities.find((a) => a.id === activityId);
    if (!activity || hasAttended(activityId)) return;
    try {
      const record = await svcVerify(activityId, userId, verificationMethod);
      setAttendanceRecords((prev) => [{ ...record, activityName: activity.name, date: activity.date }, ...prev]);
      setNotifications((prev) => [
        { id: `n-${Date.now()}`, title: 'Attendance confirmed', message: `Your attendance at ${activity.name} has been recorded.`, category: 'attendance', timestamp: 'Just now', read: false, activityId },
        ...prev,
      ]);
      pushToast('Attendance confirmed', 'success');
      if (!DEMO_MODE) await logAuditEvent({ actorId: userId, action: 'attendance_checkin', entityType: 'activity', entityId: activityId });
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Unable to verify attendance. Please try again.', 'error');
    }
  }, [activities, hasAttended, userId, pushToast]);

  // ─── Notifications ──────────────────────────────────────────

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (!DEMO_MODE) await markAllNotificationsRead(userId);
  }, [userId]);

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    if (!DEMO_MODE) await markNotificationRead(id);
  }, []);

  const sendNotification = useCallback(async (n: { title: string; message: string; category?: AppNotification['category']; activityId?: string }) => {
    if (!DEMO_MODE) {
      await svcSendNotification({ recipientId: 'all', title: n.title, message: n.message, type: n.category ?? 'system', activityId: n.activityId });
    }
    setNotifications((prev) => [
      { id: `n-${Date.now()}`, title: n.title, message: n.message, category: n.category ?? 'system', timestamp: 'Just now', read: false, activityId: n.activityId },
      ...prev,
    ]);
    pushToast('Notification sent', 'success');
  }, [pushToast]);

  // ─── Admin mutations ────────────────────────────────────────

  const createActivity = useCallback(async (a: Omit<Activity, 'id' | 'reserved' | 'status'>) => {
    try {
      const id = await svcCreateActivity(a);
      const newActivity = resolveActivityState({ ...a, id, reserved: 0, status: 'upcoming' as const });
      setActivities((prev) => [newActivity, ...prev]);
      setNotifications((prev) => [
        { id: `n-${Date.now()}`, title: 'New activity published', message: `${a.name} is now open for registration.`, category: 'system', timestamp: 'Just now', read: false, activityId: id },
        ...prev,
      ]);
      pushToast(`${a.name} published`, 'success');
      if (!DEMO_MODE) await logAuditEvent({ actorId: userId, action: 'activity_created', entityType: 'activity', entityId: id });
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Unable to publish activity.', 'error');
    }
  }, [userId, pushToast]);

  const createProject = useCallback(async (p: Omit<Project, 'id'>) => {
    try {
      const id = await svcCreateProject(p);
      setProjects((prev) => [{ ...p, id }, ...prev]);
      pushToast(`${p.title} created`, 'success');
      if (!DEMO_MODE) await logAuditEvent({ actorId: userId, action: 'project_created', entityType: 'project', entityId: id });
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Unable to create project.', 'error');
    }
  }, [userId, pushToast]);

  // simulate deadline notification on mount
  useEffect(() => {
    const t = window.setTimeout(() => {
      pushToast('Registration for Entrepreneurship Workshop closes in 5 days', 'info');
    }, 1200);
    return () => window.clearTimeout(t);
  }, [pushToast]);

  const value: AppState = {
    activities, deadlines, attendanceRecords, reservations, notifications,
    projects, members, participants, impact, history: historyEvents,
    loading, demoMode: DEMO_MODE,
    refreshActivities, refreshReservations, refreshAttendance, refreshNotifications, refreshProjects, refreshAll,
    isReserved, hasAttended, reservePlace, cancelReservation, confirmAttendance,
    unreadCount, markAllRead, markRead, sendNotification,
    createActivity, createProject,
    toasts, pushToast, dismissToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

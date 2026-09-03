import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type {
  Activity,
  AppNotification,
  AttendanceRecord,
  Deadline,
  HistoryEvent,
  ImpactSnapshot,
  Member,
  Participant,
  Project,
  Reservation,
  Role,
  Unit,
  UnitStaff,
  User,
  Venue,
} from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface Toast {
  id: number;
  message: string;
  tone: 'success' | 'info' | 'error';
}

interface AppState {
  role: Role;
  user: User;
  loading: boolean;

  activities: Activity[];
  deadlines: Deadline[];
  attendanceRecords: AttendanceRecord[];
  reservations: Reservation[];
  notifications: AppNotification[];
  projects: Project[];
  members: Member[];
  impact: ImpactSnapshot;
  history: HistoryEvent[];
  units: Unit[];
  unitStaff: UnitStaff[];
  venues: Venue[];

  saveVenue: (v: Omit<Venue, 'id'> & { id?: string }) => Promise<boolean>;
  deleteVenue: (id: string) => Promise<boolean>;

  saveUnit: (u: Omit<Unit, 'id'> & { id?: string }) => Promise<boolean>;
  deleteUnit: (id: string) => Promise<boolean>;
  saveUnitStaff: (s: Omit<UnitStaff, 'id'> & { id?: string }) => Promise<boolean>;
  deleteUnitStaff: (id: string) => Promise<boolean>;

  reservePlace: (activityId: string) => Promise<void>;
  cancelReservation: (activityId: string) => Promise<void>;
  isReserved: (activityId: string) => boolean;
  hasAttended: (activityId: string) => boolean;
  confirmAttendance: (
    activityId: string,
    code: string,
    position?: { lat: number; lng: number; accuracyM?: number } | null
  ) => Promise<{ ok: boolean; error: string | null }>;
  fetchParticipants: (activityId: string) => Promise<Participant[]>;
  generateAttendanceCode: (activityId: string) => Promise<string | null>;

  unreadCount: number;
  markAllRead: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  sendNotification: (n: { title: string; message: string; category?: AppNotification['category']; activityId?: string }) => Promise<void>;

  createActivity: (a: Omit<Activity, 'id' | 'reserved' | 'status' | 'attendedCount' | 'noShowCount' | 'attendanceCode'>) => Promise<void>;
  uploadActivityImage: (file: File) => Promise<string | null>;
  createProject: (p: Omit<Project, 'id' | 'evidenceCount'>) => Promise<void>;
  uploadProjectEvidence: (projectId: string, file: File) => Promise<boolean>;

  toasts: Toast[];
  pushToast: (message: string, tone?: Toast['tone']) => void;
  dismissToast: (id: number) => void;
}

const AppContext = createContext<AppState | null>(null);

function resolveActivityState(a: Activity): Activity {
  const start = new Date(`${a.date}T${a.startTime}:00`);
  const end = new Date(`${a.date}T${a.endTime}:00`);
  const now = new Date();
  let status: Activity['status'] = 'upcoming';
  if (now >= start && now <= end) status = 'active';
  else if (now > end) status = 'completed';
  return { ...a, status };
}

// ---- row mappers: DB (snake_case) -> app types (camelCase) ----

function mapActivity(row: any): Activity {
  return resolveActivityState({
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    date: row.date,
    startTime: row.start_time?.slice(0, 5) ?? row.start_time,
    endTime: row.end_time?.slice(0, 5) ?? row.end_time,
    venue: row.venue,
    capacity: row.capacity,
    reserved: row.reserved ?? 0,
    attendedCount: row.attended_count ?? 0,
    noShowCount: row.no_show_count ?? 0,
    registrationDeadline: row.registration_deadline,
    organizer: row.organizer,
    attendanceCode: row.attendance_code ?? null,
    requirements: row.requirements ?? [],
    imageSeed: row.image_seed ?? row.category?.toLowerCase(),
    imageUrl: row.image_url ?? null,
    venueId: row.venue_id ?? null,
    // geofence_* are the resolved values from the view (venue's circle when the
    // activity is linked to one, else its own coordinates).
    venueLat: row.geofence_lat ?? null,
    venueLng: row.geofence_lng ?? null,
    geofenceRadiusM: row.geofence_radius ?? 250,
    status: 'upcoming',
  });
}

function mapReservation(row: any, activityName: string, venue: string, date: string): Reservation {
  return {
    id: row.id,
    activityId: row.activity_id,
    activityName,
    date,
    venue,
    status: row.status,
    ticketCode: row.ticket_code,
  };
}

function mapAttendance(row: any, activityName: string, date: string): AttendanceRecord {
  return {
    id: row.id,
    activityId: row.activity_id,
    activityName,
    date,
    checkInTime: row.check_in_time,
    status: row.status,
    checkInDistanceM: row.check_in_distance_m ?? null,
  };
}

function mapNotification(row: any): AppNotification {
  return {
    id: row.id,
    title: row.title,
    message: row.message,
    category: row.category,
    timestamp: new Date(row.created_at).toLocaleString(),
    read: row.read,
    activityId: row.activity_id ?? undefined,
  };
}

function mapProject(row: any): Project {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    objectives: row.objectives ?? [],
    date: row.date,
    location: row.location,
    status: row.status,
    team: (row.project_team ?? []).map((t: any) => ({ name: t.name, role: t.role })),
    participants: row.participants,
    volunteers: row.volunteers,
    sessions: row.sessions,
    satisfaction: Number(row.satisfaction),
    community: row.community,
    phases: (row.project_phases ?? [])
      .sort((a: any, b: any) => a.position - b.position)
      .map((p: any) => ({ title: p.title, date: p.date, description: p.description, done: p.done })),
    evidenceUrls: row.evidence_urls ?? [],
    evidenceCount: (row.evidence_urls ?? []).length,
    documents: row.documents ?? [],
    results: row.results ?? [],
  };
}

function mapMember(row: any): Member {
  return {
    id: row.id,
    name: row.name,
    studentNumber: row.student_number ?? '',
    email: row.email,
    faculty: row.faculty ?? '',
    role: row.role,
    activitiesAttended: row.activities_attended,
    volunteerHours: Number(row.volunteer_hours),
    joined: row.joined,
    status: row.status,
  };
}

function mapUnit(row: any): Unit {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name ?? row.name,
    focus: row.focus ?? '',
    description: row.description ?? '',
    lead: row.lead ?? '',
    email: row.email ?? '',
    position: row.position ?? 0,
  };
}

function mapUnitStaff(row: any): UnitStaff {
  return {
    id: row.id,
    unitId: row.unit_id,
    name: row.name,
    category: row.category,
    title: row.title ?? '',
    email: row.email ?? '',
    focus: row.focus ?? '',
    status: row.status,
  };
}

function mapVenue(row: any): Venue {
  return {
    id: row.id,
    name: row.name,
    address: row.address ?? '',
    lat: row.lat,
    lng: row.lng,
    geofenceRadiusM: row.geofence_radius_m ?? 250,
    capacity: row.capacity ?? null,
    isActive: row.is_active ?? true,
  };
}

const EMPTY_IMPACT: ImpactSnapshot = {
  year: '—',
  activities: 0,
  participants: 0,
  projects: 0,
  volunteerHours: 0,
  communities: 0,
  attendanceRate: 0,
};

export function AppProvider({ children }: { children: ReactNode }) {
  const { session, profile } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitStaff, setUnitStaff] = useState<UnitStaff[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [impact, setImpact] = useState<ImpactSnapshot>(EMPTY_IMPACT);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [loading, setLoading] = useState(true);

  const role: Role = profile?.role ?? 'student';
  const user: User = {
    name: profile?.full_name ?? '',
    role,
    studentNumber: profile?.student_number ?? undefined,
    email: profile?.email ?? '',
    faculty: profile?.faculty ?? '',
    joined: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' }) : '',
    avatarSeed: (profile?.full_name ?? 'U').split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase(),
  };

  const pushToast = useCallback((message: string, tone: Toast['tone'] = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3600);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const refetchActivities = useCallback(async () => {
    const { data, error } = await supabase.from('activities_with_counts').select('*').order('date', { ascending: true });
    if (!error && data) setActivities(data.map(mapActivity));
  }, []);

  const refetchReservations = useCallback(async () => {
    if (!session) return;
    const { data, error } = await supabase
      .from('reservations')
      .select('*, activities(name, venue, date)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    if (!error && data) {
      setReservations(data.map((r: any) => mapReservation(r, r.activities?.name ?? '', r.activities?.venue ?? '', r.activities?.date ?? '')));
    }
  }, [session]);

  const refetchAttendance = useCallback(async () => {
    if (!session) return;
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*, activities(name, date)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    if (!error && data) {
      setAttendanceRecords(data.map((r: any) => mapAttendance(r, r.activities?.name ?? '', r.activities?.date ?? '')));
    }
  }, [session]);

  const refetchNotifications = useCallback(async () => {
    if (!session) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', session.user.id)
      .order('created_at', { ascending: false });
    if (!error && data) setNotifications(data.map(mapNotification));
  }, [session]);

  const refetchProjects = useCallback(async () => {
    const { data, error } = await supabase.from('projects').select('*, project_team(*), project_phases(*)').order('date', { ascending: false });
    if (!error && data) setProjects(data.map(mapProject));
  }, []);

  const refetchMembers = useCallback(async () => {
    if (role !== 'admin') {
      setMembers([]);
      return;
    }
    const { data, error } = await supabase.from('members').select('*').order('name', { ascending: true });
    if (!error && data) setMembers(data.map(mapMember));
  }, [role]);

  const refetchDeadlines = useCallback(async () => {
    const { data, error } = await supabase.from('deadlines').select('*').order('date', { ascending: true });
    if (!error && data) {
      setDeadlines(
        data.map((d: any) => ({ id: d.id, title: d.title, date: d.date, priority: d.priority, activityId: d.activity_id ?? undefined }))
      );
    }
  }, []);

  const refetchVenues = useCallback(async () => {
    const { data, error } = await supabase.from('venues').select('*').order('name', { ascending: true });
    if (!error && data) setVenues(data.map(mapVenue));
  }, []);

  const refetchOrganisation = useCallback(async () => {
    const [unitsRes, staffRes] = await Promise.all([
      supabase.from('units').select('*').order('position', { ascending: true }),
      supabase.from('unit_staff').select('*').order('position', { ascending: true }),
    ]);
    if (!unitsRes.error && unitsRes.data) setUnits(unitsRes.data.map(mapUnit));
    if (!staffRes.error && staffRes.data) setUnitStaff(staffRes.data.map(mapUnitStaff));
  }, []);

  const saveVenue = useCallback(
    async (v: Omit<Venue, 'id'> & { id?: string }) => {
      const payload = {
        name: v.name,
        address: v.address,
        lat: v.lat,
        lng: v.lng,
        geofence_radius_m: v.geofenceRadiusM,
        capacity: v.capacity,
        is_active: v.isActive,
      };
      const { error } = v.id
        ? await supabase.from('venues').update(payload).eq('id', v.id)
        : await supabase.from('venues').insert(payload);
      if (error) {
        pushToast(error.message, 'error');
        return false;
      }
      await Promise.all([refetchVenues(), refetchActivities()]);
      pushToast(v.id ? `${v.name} updated` : `${v.name} added`, 'success');
      return true;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refetchVenues, refetchActivities]
  );

  const saveUnit = useCallback(
    async (u: Omit<Unit, 'id'> & { id?: string }) => {
      const payload = {
        name: u.name,
        short_name: u.shortName,
        focus: u.focus,
        description: u.description,
        lead: u.lead,
        email: u.email,
        position: u.position,
      };
      const { error } = u.id
        ? await supabase.from('units').update(payload).eq('id', u.id)
        : await supabase.from('units').insert(payload);
      if (error) {
        pushToast(error.message, 'error');
        return false;
      }
      await refetchOrganisation();
      pushToast(u.id ? `${u.name} updated` : `${u.name} added`, 'success');
      return true;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refetchOrganisation]
  );

  const deleteUnit = useCallback(
    async (id: string) => {
      // unit_staff rows cascade with the unit.
      const { error } = await supabase.from('units').delete().eq('id', id);
      if (error) {
        pushToast(error.message, 'error');
        return false;
      }
      await refetchOrganisation();
      pushToast('Unit removed', 'info');
      return true;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refetchOrganisation]
  );

  const saveUnitStaff = useCallback(
    async (s: Omit<UnitStaff, 'id'> & { id?: string }) => {
      const payload = {
        unit_id: s.unitId,
        name: s.name,
        category: s.category,
        title: s.title,
        email: s.email,
        focus: s.focus,
        status: s.status,
      };
      const { error } = s.id
        ? await supabase.from('unit_staff').update(payload).eq('id', s.id)
        : await supabase.from('unit_staff').insert(payload);
      if (error) {
        pushToast(error.message, 'error');
        return false;
      }
      await refetchOrganisation();
      pushToast(s.id ? `${s.name} updated` : `${s.name} added`, 'success');
      return true;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refetchOrganisation]
  );

  const deleteUnitStaff = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('unit_staff').delete().eq('id', id);
      if (error) {
        pushToast(error.message, 'error');
        return false;
      }
      await refetchOrganisation();
      pushToast('Person removed', 'info');
      return true;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refetchOrganisation]
  );

  const deleteVenue = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('venues').delete().eq('id', id);
      if (error) {
        // FK restrict fires when activities still point at this venue.
        pushToast(
          error.code === '23503'
            ? 'This venue is used by existing activities — archive it instead.'
            : error.message,
          'error'
        );
        return false;
      }
      await refetchVenues();
      pushToast('Venue removed', 'info');
      return true;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refetchVenues]
  );

  const refetchHistoryAndImpact = useCallback(async () => {
    const [historyRes, impactRes] = await Promise.all([
      supabase.from('history_events').select('*').order('year', { ascending: true }),
      supabase.from('impact_snapshots').select('*').order('year', { ascending: false }).limit(1),
    ]);
    if (!historyRes.error && historyRes.data) {
      setHistory(historyRes.data.map((h: any) => ({ year: h.year, title: h.title, description: h.description })));
    }
    if (!impactRes.error && impactRes.data && impactRes.data[0]) {
      const i = impactRes.data[0];
      setImpact({
        year: i.year,
        activities: i.activities,
        participants: i.participants,
        projects: i.projects,
        volunteerHours: i.volunteer_hours,
        communities: i.communities,
        attendanceRate: Number(i.attendance_rate),
      });
    }
  }, []);

  useEffect(() => {
    if (!session) {
      setActivities([]);
      setReservations([]);
      setAttendanceRecords([]);
      setNotifications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      refetchActivities(),
      refetchReservations(),
      refetchAttendance(),
      refetchNotifications(),
      refetchProjects(),
      refetchMembers(),
      refetchDeadlines(),
      refetchHistoryAndImpact(),
      refetchOrganisation(),
      refetchVenues(),
    ]).finally(() => setLoading(false));
  }, [session, role, refetchActivities, refetchReservations, refetchAttendance, refetchNotifications, refetchProjects, refetchMembers, refetchDeadlines, refetchHistoryAndImpact, refetchOrganisation, refetchVenues]);

  const isReserved = useCallback(
    (activityId: string) => reservations.some((r) => r.activityId === activityId && r.status === 'confirmed'),
    [reservations]
  );

  const hasAttended = useCallback(
    (activityId: string) => attendanceRecords.some((r) => r.activityId === activityId && r.status === 'present'),
    [attendanceRecords]
  );

  const reservePlace = useCallback(
    async (activityId: string) => {
      const { error } = await supabase.rpc('reserve_activity', { p_activity_id: activityId });
      if (error) {
        pushToast(error.message, 'error');
        return;
      }
      await Promise.all([refetchActivities(), refetchReservations(), refetchNotifications()]);
      pushToast('Place reserved', 'success');
    },
    [pushToast, refetchActivities, refetchReservations, refetchNotifications]
  );

  const cancelReservation = useCallback(
    async (activityId: string) => {
      const { error } = await supabase.rpc('cancel_reservation', { p_activity_id: activityId });
      if (error) {
        pushToast(error.message, 'error');
        return;
      }
      await Promise.all([refetchActivities(), refetchReservations()]);
      pushToast('Reservation cancelled', 'info');
    },
    [pushToast, refetchActivities, refetchReservations]
  );

  const confirmAttendance = useCallback(
    async (activityId: string, code: string, position?: { lat: number; lng: number; accuracyM?: number } | null) => {
      const { error } = await supabase.rpc('confirm_attendance', {
        p_activity_id: activityId,
        p_code: code,
        p_lat: position?.lat,
        p_lng: position?.lng,
        p_accuracy_m: position?.accuracyM,
      });
      if (error) {
        pushToast(error.message, 'error');
        return { ok: false, error: error.message };
      }
      await Promise.all([refetchAttendance(), refetchNotifications(), refetchActivities()]);
      pushToast('Attendance confirmed', 'success');
      return { ok: true, error: null };
    },
    [pushToast, refetchAttendance, refetchNotifications, refetchActivities]
  );

  const generateAttendanceCode = useCallback(
    async (activityId: string) => {
      const { data, error } = await supabase.rpc('generate_attendance_code', { p_activity_id: activityId });
      if (error) {
        pushToast(error.message, 'error');
        return null;
      }
      await refetchActivities();
      return data as string;
    },
    [pushToast, refetchActivities]
  );

  const fetchParticipants = useCallback(async (activityId: string): Promise<Participant[]> => {
    const { data, error } = await supabase.from('activity_participants').select('*').eq('activity_id', activityId);
    if (error || !data) return [];
    return data.map((p: any) => ({
      id: `${p.activity_id}-${p.user_id}`,
      activityId: p.activity_id,
      name: p.name,
      studentNumber: p.student_number ?? '',
      reserved: p.reserved,
      attended: p.attended,
      checkInTime: p.check_in_time,
    }));
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const markAllRead = useCallback(async () => {
    if (!session) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await supabase.from('notifications').update({ read: true }).eq('recipient_id', session.user.id).eq('read', false);
  }, [session]);

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await supabase.from('notifications').update({ read: true }).eq('id', id);
  }, []);

  const sendNotification = useCallback(
    async (n: { title: string; message: string; category?: AppNotification['category']; activityId?: string }) => {
      const { error } = await supabase.rpc('broadcast_notification', {
        p_title: n.title,
        p_message: n.message,
        p_category: n.category ?? 'system',
        p_activity_id: n.activityId ?? null,
      });
      if (error) {
        pushToast(error.message, 'error');
        return;
      }
      pushToast('Notification sent', 'success');
    },
    [pushToast]
  );

  const uploadActivityImage = useCallback(
    async (file: File) => {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from('activity-images').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (error) {
        pushToast(error.message, 'error');
        return null;
      }
      const { data } = supabase.storage.from('activity-images').getPublicUrl(path);
      return data.publicUrl;
    },
    [pushToast]
  );

  const createActivity = useCallback(
    async (a: Omit<Activity, 'id' | 'reserved' | 'status' | 'attendedCount' | 'noShowCount' | 'attendanceCode'>) => {
      const { error } = await supabase.from('activities').insert({
        name: a.name,
        description: a.description,
        category: a.category,
        date: a.date,
        start_time: a.startTime,
        end_time: a.endTime,
        venue: a.venue,
        capacity: a.capacity,
        registration_deadline: a.registrationDeadline,
        organizer: a.organizer,
        requirements: a.requirements,
        image_seed: a.imageSeed,
        image_url: a.imageUrl ?? null,
        venue_lat: a.venueLat,
        venue_lng: a.venueLng,
        geofence_radius_m: a.geofenceRadiusM,
      });
      if (error) {
        pushToast(error.message, 'error');
        return;
      }
      await refetchActivities();
      pushToast(`${a.name} published`, 'success');
    },
    [pushToast, refetchActivities]
  );

  const uploadProjectEvidence = useCallback(
    async (projectId: string, file: File) => {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${projectId}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('project-evidence').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (uploadError) {
        pushToast(uploadError.message, 'error');
        return false;
      }
      const { data } = supabase.storage.from('project-evidence').getPublicUrl(path);

      const current = projects.find((p) => p.id === projectId);
      const nextUrls = [...(current?.evidenceUrls ?? []), data.publicUrl];
      const { error: updateError } = await supabase.from('projects').update({ evidence_urls: nextUrls }).eq('id', projectId);
      if (updateError) {
        pushToast(updateError.message, 'error');
        return false;
      }
      await refetchProjects();
      pushToast('Evidence uploaded', 'success');
      return true;
    },
    [pushToast, projects, refetchProjects]
  );

  const createProject = useCallback(
    // evidenceCount is derived from evidence_urls on read, so callers don't supply it.
    async (p: Omit<Project, 'id' | 'evidenceCount'>) => {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          title: p.title,
          description: p.description,
          objectives: p.objectives,
          date: p.date,
          location: p.location,
          status: p.status,
          participants: p.participants,
          volunteers: p.volunteers,
          sessions: p.sessions,
          satisfaction: p.satisfaction,
          community: p.community,
          evidence_urls: p.evidenceUrls,
          documents: p.documents,
          results: p.results,
        })
        .select('id')
        .single();
      if (error || !data) {
        pushToast(error?.message ?? 'Failed to create project', 'error');
        return;
      }
      if (p.team.length > 0) {
        await supabase.from('project_team').insert(p.team.map((t) => ({ project_id: data.id, name: t.name, role: t.role })));
      }
      if (p.phases.length > 0) {
        await supabase
          .from('project_phases')
          .insert(p.phases.map((ph, i) => ({ project_id: data.id, title: ph.title, date: ph.date, description: ph.description, done: ph.done, position: i })));
      }
      await refetchProjects();
      pushToast(`${p.title} created`, 'success');
    },
    [pushToast, refetchProjects]
  );

  const value: AppState = {
    role,
    user,
    loading,
    activities,
    deadlines,
    attendanceRecords,
    reservations,
    notifications,
    projects,
    members,
    impact,
    history,
    units,
    unitStaff,
    venues,
    saveVenue,
    deleteVenue,
    saveUnit,
    deleteUnit,
    saveUnitStaff,
    deleteUnitStaff,
    reservePlace,
    cancelReservation,
    isReserved,
    hasAttended,
    confirmAttendance,
    fetchParticipants,
    generateAttendanceCode,
    unreadCount,
    markAllRead,
    markRead,
    sendNotification,
    createActivity,
    uploadActivityImage,
    createProject,
    uploadProjectEvidence,
    toasts,
    pushToast,
    dismissToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

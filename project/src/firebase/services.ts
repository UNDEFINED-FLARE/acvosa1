import {
  collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc,
  query, where, orderBy, limit, onSnapshot, serverTimestamp,
  runTransaction, type Unsubscribe,
} from 'firebase/firestore';
import { db, DEMO_MODE } from '@/firebase/config';
import * as mock from '@/data/mockData';
import type {
  Activity, AppNotification, AttendanceRecord, Deadline, ImpactSnapshot,
  Member, Participant, Project, Reservation,
} from '@/types';

// ─── Helpers ──────────────────────────────────────────────────

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((r) => setTimeout(() => r(value), ms));
}

const PROTOTYPE_DATE = new Date('2026-08-21T00:00:00');

function resolveActivityState(a: Activity): Activity {
  const start = new Date(`${a.date}T${a.startTime}:00`);
  const end = new Date(`${a.date}T${a.endTime}:00`);
  let status: Activity['status'] = 'upcoming';
  if (PROTOTYPE_DATE >= start && PROTOTYPE_DATE <= end) status = 'active';
  else if (PROTOTYPE_DATE > end) status = 'completed';
  return { ...a, status };
}

// ─── Activities ───────────────────────────────────────────────

export async function getActivities(): Promise<Activity[]> {
  if (DEMO_MODE) {
    return delay(mock.activities.map(resolveActivityState));
  }
  const snap = await getDocs(query(collection(db!, 'activities'), where('status', 'in', ['published', 'active', 'completed'])));
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Activity);
  return items.map(resolveActivityState);
}

export async function getActivity(id: string): Promise<Activity | null> {
  if (DEMO_MODE) {
    const a = mock.activities.find((x) => x.id === id);
    return delay(a ? resolveActivityState(a) : null);
  }
  const snap = await getDoc(doc(db!, 'activities', id));
  if (!snap.exists()) return null;
  return resolveActivityState({ id: snap.id, ...snap.data() } as Activity);
}

export async function createActivity(data: Omit<Activity, 'id' | 'reserved' | 'status'>): Promise<string> {
  if (DEMO_MODE) {
    return delay(`a-${Date.now()}`);
  }
  const ref = await addDoc(collection(db!, 'activities'), {
    ...data,
    reservedCount: 0,
    status: 'published',
    attendanceStatus: 'unavailable',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateActivity(id: string, updates: Partial<Activity>): Promise<void> {
  if (DEMO_MODE) return delay(undefined);
  await updateDoc(doc(db!, 'activities', id), { ...updates, updatedAt: serverTimestamp() });
}

// ─── Reservations ─────────────────────────────────────────────

export async function getReservationsForStudent(studentId: string): Promise<Reservation[]> {
  if (DEMO_MODE) {
    const all = mock.reservations.filter((r) => r.studentId === studentId || true);
    return delay(all);
  }
  const snap = await getDocs(query(collection(db!, 'reservations'), where('studentId', '==', studentId)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Reservation);
}

export async function reserveActivity(activityId: string, studentId: string): Promise<Reservation> {
  if (DEMO_MODE) {
    const activity = mock.activities.find((a) => a.id === activityId);
    if (!activity) throw new Error('Activity not found.');
    if (activity.reserved >= activity.capacity) throw new Error('Registration is full.');
    const ticketCode = `ACV-2026-${activityId.toUpperCase()}-${Math.floor(10000 + Math.random() * 89999)}`;
    return delay({ id: `r-${Date.now()}`, activityId, studentId, status: 'confirmed', reservedAt: new Date().toISOString(), cancelledAt: null, ticketCode, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }

  // Production: use transaction for atomic capacity update
  const activityRef = doc(db!, 'activities', activityId);
  const reservationId = `${activityId}_${studentId}`;
  const reservationRef = doc(db!, 'reservations', reservationId);

  return runTransaction(db!, async (tx) => {
    const activityDoc = await tx.get(activityRef);
    if (!activityDoc.exists()) throw new Error('Activity not found.');
    const activity = activityDoc.data() as Activity;
    if (activity.status === 'cancelled' || activity.status === 'completed') throw new Error('Registration for this activity has closed.');
    if (activity.reserved >= activity.capacity) throw new Error('Registration is full.');

    const existingRes = await tx.get(reservationRef);
    if (existingRes.exists() && existingRes.data().status === 'confirmed') {
      throw new Error('You already have a reservation for this activity.');
    }

    const ticketCode = `ACV-2026-${activityId.toUpperCase()}-${Math.floor(10000 + Math.random() * 89999)}`;
    tx.set(reservationRef, {
      activityId, studentId, status: 'confirmed',
      reservedAt: serverTimestamp(), cancelledAt: null,
      ticketCode, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
    });
    tx.update(activityRef, { reserved: (activity.reserved ?? 0) + 1, updatedAt: serverTimestamp() });

    return { id: reservationId, activityId, studentId, status: 'confirmed' as const, reservedAt: new Date().toISOString(), cancelledAt: null, ticketCode, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  });
}

export async function cancelReservation(reservationId: string, activityId: string): Promise<void> {
  if (DEMO_MODE) return delay(undefined);
  const activityRef = doc(db!, 'activities', activityId);
  const reservationRef = doc(db!, 'reservations', reservationId);
  await runTransaction(db!, async (tx) => {
    const activityDoc = await tx.get(activityRef);
    if (!activityDoc.exists()) return;
    const activity = activityDoc.data() as Activity;
    tx.update(reservationRef, { status: 'cancelled', cancelledAt: serverTimestamp(), updatedAt: serverTimestamp() });
    tx.update(activityRef, { reserved: Math.max(0, (activity.reserved ?? 1) - 1), updatedAt: serverTimestamp() });
  });
}

// ─── Attendance ───────────────────────────────────────────────

export async function getAttendanceForStudent(studentId: string): Promise<AttendanceRecord[]> {
  if (DEMO_MODE) {
    return delay(mock.attendanceRecords);
  }
  const snap = await getDocs(query(collection(db!, 'attendance'), where('studentId', '==', studentId)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AttendanceRecord);
}

export async function verifyAttendance(
  activityId: string,
  studentId: string,
  verificationMethod: string
): Promise<AttendanceRecord> {
  if (DEMO_MODE) {
    const activity = mock.activities.find((a) => a.id === activityId);
    if (!activity) throw new Error('Activity not found.');
    if (activity.status !== 'active') throw new Error('Attendance is not currently open.');
    const now = new Date();
    const checkInTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    return delay({
      id: `att-${Date.now()}`,
      activityId, studentId, reservationId: '',
      sessionId: '', status: 'present',
      verificationMethod, checkedInAt: new Date().toISOString(),
      verificationResult: 'success',
      locationVerified: verificationMethod.includes('GPS'),
      bluetoothVerified: verificationMethod.includes('Bluetooth'),
      createdAt: new Date().toISOString(),
    }, 1500);
  }

  // Production: would call a Cloud Function for trusted validation
  // For now, use Firestore transaction for basic duplicate prevention
  const attendanceId = `${activityId}_${studentId}`;
  const attendanceRef = doc(db!, 'attendance', attendanceId);

  return runTransaction(db!, async (tx) => {
    const existing = await tx.get(attendanceRef);
    if (existing.exists()) throw new Error('You have already checked in.');

    const now = new Date();
    const record: AttendanceRecord = {
      id: attendanceId, activityId, studentId, reservationId: '',
      sessionId: '', status: 'present',
      verificationMethod, checkedInAt: now.toISOString(),
      verificationResult: 'success',
      locationVerified: verificationMethod.includes('GPS'),
      bluetoothVerified: verificationMethod.includes('Bluetooth'),
      createdAt: now.toISOString(),
    };
    tx.set(attendanceRef, { ...record, createdAt: serverTimestamp() });
    return record;
  });
}

export async function getParticipantsForActivity(activityId: string): Promise<Participant[]> {
  if (DEMO_MODE) {
    return delay(mock.participants);
  }
  const snap = await getDocs(query(collection(db!, 'reservations'), where('activityId', '==', activityId), where('status', '==', 'confirmed')));
  const reservations = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Reservation);
  const participants: Participant[] = [];
  for (const r of reservations) {
    const userDoc = await getDoc(doc(db!, 'users', r.studentId));
    const userData = userDoc.exists() ? userDoc.data() : null;
    const attDoc = await getDoc(doc(db!, 'attendance', `${activityId}_${r.studentId}`));
    participants.push({
      id: r.id,
      name: userData ? `${userData.firstName} ${userData.lastName}` : 'Unknown',
      studentNumber: (userData?.studentNumber as string) ?? '',
      reserved: true,
      attended: attDoc.exists(),
      checkInTime: attDoc.exists() ? (attDoc.data().checkedInAt as string) : null,
    });
  }
  return participants;
}

export function subscribeToParticipants(activityId: string, callback: (participants: Participant[]) => void): Unsubscribe {
  if (DEMO_MODE) {
    callback(mock.participants);
    return () => {};
  }
  return onSnapshot(
    query(collection(db!, 'reservations'), where('activityId', '==', activityId), where('status', '==', 'confirmed')),
    () => { getParticipantsForActivity(activityId).then(callback); }
  );
}

// ─── Notifications ────────────────────────────────────────────

export async function getNotificationsForUser(userId: string): Promise<AppNotification[]> {
  if (DEMO_MODE) {
    return delay(mock.notifications);
  }
  const snap = await getDocs(
    query(collection(db!, 'notifications'), where('recipientId', '==', userId), orderBy('createdAt', 'desc'), limit(50))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AppNotification);
}

export async function markNotificationRead(id: string): Promise<void> {
  if (DEMO_MODE) return delay(undefined);
  await updateDoc(doc(db!, 'notifications', id), { read: true });
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  if (DEMO_MODE) return delay(undefined);
  const snap = await getDocs(query(collection(db!, 'notifications'), where('recipientId', '==', userId), where('read', '==', false)));
  await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { read: true })));
}

export async function sendNotification(data: {
  recipientId: string; title: string; message: string;
  type: AppNotification['category']; activityId?: string;
}): Promise<void> {
  if (DEMO_MODE) return delay(undefined);
  await addDoc(collection(db!, 'notifications'), {
    ...data, read: false, createdAt: serverTimestamp(),
  });
}

// ─── Deadlines ────────────────────────────────────────────────

export async function getDeadlines(): Promise<Deadline[]> {
  if (DEMO_MODE) {
    return delay(mock.deadlines);
  }
  const snap = await getDocs(query(collection(db!, 'deadlines'), where('deadlineAt', '>=', new Date().toISOString()), limit(20)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Deadline);
}

// ─── Projects ─────────────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  if (DEMO_MODE) {
    return delay(mock.projects);
  }
  const snap = await getDocs(query(collection(db!, 'projects'), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Project);
}

export async function getProject(id: string): Promise<Project | null> {
  if (DEMO_MODE) {
    return delay(mock.projects.find((p) => p.id === id) ?? null);
  }
  const snap = await getDoc(doc(db!, 'projects', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } as Project : null;
}

export async function createProject(data: Omit<Project, 'id'>): Promise<string> {
  if (DEMO_MODE) return delay(`p-${Date.now()}`);
  const ref = await addDoc(collection(db!, 'projects'), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return ref.id;
}

// ─── Impact ───────────────────────────────────────────────────

export async function getImpactMetrics(year?: string): Promise<ImpactSnapshot> {
  if (DEMO_MODE) {
    const snapshot = year
      ? mock.impactSnapshots.find((s) => s.year === year) ?? mock.impactSnapshots[0]
      : mock.impactSnapshots[0];
    return delay(snapshot);
  }
  const q = year
    ? query(collection(db!, 'impactMetrics'), where('year', '==', year), limit(1))
    : query(collection(db!, 'impactMetrics'), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) {
    return { year: year ?? '2026', activities: 0, participants: 0, projects: 0, volunteerHours: 0, communities: 0, attendanceRate: 0 };
  }
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as ImpactSnapshot;
}

export function getChartSeries(year: string) {
  return mock.chartSeries[year] ?? mock.chartSeries['2026'];
}

// ─── Members ──────────────────────────────────────────────────

export async function getMembers(): Promise<Member[]> {
  if (DEMO_MODE) {
    return delay(mock.members);
  }
  const snap = await getDocs(query(collection(db!, 'users'), limit(100)));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      name: `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim(),
      studentNumber: (data.studentNumber as string) ?? '',
      email: (data.email as string) ?? '',
      faculty: (data.faculty as string) ?? '',
      role: (data.role as string) ?? 'Member',
      activitiesAttended: 0,
      volunteerHours: 0,
      joined: '—',
      status: (data.status as string) ?? 'active',
    } as Member;
  });
}

// ─── History ──────────────────────────────────────────────────

export async function getHistoryEvents() {
  return delay(mock.historyEvents);
}

// ─── Audit Log ────────────────────────────────────────────────

export async function logAuditEvent(entry: {
  actorId: string; action: string; entityType: string; entityId: string; metadata?: Record<string, unknown>;
}): Promise<void> {
  if (DEMO_MODE) return;
  await addDoc(collection(db!, 'auditLogs'), {
    ...entry, timestamp: serverTimestamp(),
  });
}

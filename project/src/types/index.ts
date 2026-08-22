export type Role = 'student' | 'admin' | 'eventManager' | 'projectManager' | 'reportViewer' | 'superAdmin';

export type ActivityCategory =
  | 'Workshops'
  | 'Community'
  | 'Academic'
  | 'Leadership'
  | 'Social'
  | 'Volunteer';

export type ActivityState = 'upcoming' | 'active' | 'completed';

export type ActivityStatus = 'draft' | 'published' | 'active' | 'completed' | 'cancelled';

export type AttendanceStatusValue = 'unavailable' | 'open' | 'closed';

export type AttendanceMethod = 'QR' | 'GPS' | 'Bluetooth' | 'QR + GPS';

export type ReservationStatus = 'confirmed' | 'completed' | 'cancelled';

export type AttendanceStatus = 'present' | 'late' | 'rejected' | 'cancelled';

export type ProjectStatus = 'planning' | 'active' | 'completed';

export type NotificationCategory =
  | 'reservation'
  | 'attendance'
  | 'deadline'
  | 'project'
  | 'reminder'
  | 'system';

export interface AppUser {
  uid: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  faculty: string;
  course: string;
  yearLevel: string;
  role: Role;
  profileImageUrl: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  category: ActivityCategory;
  date: string; // ISO date
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  venue: string;
  capacity: number;
  reserved: number;
  registrationDeadline: string; // ISO date
  organizer: string;
  attendanceMethod: AttendanceMethod;
  requirements: string[];
  imageSeed: string;
  status: ActivityState;
  // Firebase production fields
  organizerId?: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  geofenceRadius?: number;
  attendanceStatus?: AttendanceStatusValue;
}

export interface Deadline {
  id: string;
  title: string;
  date: string; // ISO date
  priority: 'high' | 'medium' | 'low';
  activityId?: string;
}

export interface AttendanceRecord {
  id: string;
  activityId: string;
  activityName?: string;
  date?: string;
  checkInTime: string;
  status: AttendanceStatus;
  // Firebase production fields
  studentId?: string;
  reservationId?: string;
  sessionId?: string;
  verificationMethod?: string;
  checkedInAt?: string;
  verificationResult?: string;
  locationVerified?: boolean;
  bluetoothVerified?: boolean;
  createdAt?: string;
}

export interface Reservation {
  id: string;
  activityId: string;
  activityName?: string;
  date?: string;
  venue?: string;
  status: ReservationStatus;
  ticketCode: string;
  // Firebase production fields
  studentId?: string;
  reservedAt?: string | null;
  cancelledAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectMember {
  name: string;
  role: string;
}

export interface ProjectPhase {
  title: string;
  date: string;
  description: string;
  done: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  date: string;
  location: string;
  status: ProjectStatus;
  team: ProjectMember[];
  participants: number;
  volunteers: number;
  sessions: number;
  satisfaction: number;
  community: string;
  phases: ProjectPhase[];
  evidenceCount: number;
  documents: string[];
  results: string[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  timestamp: string; // relative
  read: boolean;
  activityId?: string;
  // Firebase production fields
  recipientId?: string;
  type?: string;
  createdAt?: string;
}

export interface HistoryEvent {
  year: string;
  title: string;
  description: string;
}

export interface ImpactSnapshot {
  id?: string;
  year: string;
  activities: number;
  participants: number;
  projects: number;
  volunteerHours: number;
  communities: number;
  attendanceRate: number;
}

export interface Member {
  id: string;
  name: string;
  studentNumber: string;
  email: string;
  faculty: string;
  role: 'Member' | 'Coordinator' | 'Volunteer' | string;
  activitiesAttended: number;
  volunteerHours: number;
  joined: string;
  status: 'active' | 'inactive' | string;
}

export interface Participant {
  id: string;
  name: string;
  studentNumber: string;
  reserved: boolean;
  attended: boolean;
  checkInTime: string | null;
  verificationMethod?: string;
}

// Legacy User interface kept for backward compatibility with existing components
export interface User {
  name: string;
  role: Role;
  studentNumber?: string;
  email: string;
  faculty: string;
  joined: string;
  avatarSeed: string;
}

// Audit log entry
export interface AuditLogEntry {
  id?: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

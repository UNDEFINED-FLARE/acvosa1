export type Role = 'student' | 'admin';

export type ActivityCategory =
  | 'Workshops'
  | 'Community'
  | 'Academic'
  | 'Leadership'
  | 'Social'
  | 'Volunteer';

export type ActivityState = 'upcoming' | 'active' | 'completed';

export type ReservationStatus = 'confirmed' | 'completed' | 'cancelled';

export type AttendanceStatus = 'present' | 'absent' | 'pending';

export type ProjectStatus = 'planning' | 'active' | 'completed';

export type NotificationCategory =
  | 'reservation'
  | 'attendance'
  | 'deadline'
  | 'project'
  | 'reminder'
  | 'system';

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
  attendedCount: number;
  noShowCount: number;
  registrationDeadline: string; // ISO date
  organizer: string;
  attendanceCode: string | null;
  requirements: string[];
  imageSeed: string;
  imageUrl: string | null;
  status: ActivityState;
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
  activityName: string;
  date: string;
  checkInTime: string;
  status: AttendanceStatus;
}

export interface Reservation {
  id: string;
  activityId: string;
  activityName: string;
  date: string;
  venue: string;
  status: ReservationStatus;
  ticketCode: string;
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
  evidenceUrls: string[];
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
}

export interface HistoryEvent {
  year: string;
  title: string;
  description: string;
}

export interface ImpactSnapshot {
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
  role: 'Member' | 'Coordinator' | 'Volunteer';
  activitiesAttended: number;
  volunteerHours: number;
  joined: string;
  status: 'active' | 'inactive';
}

export interface Participant {
  id: string;
  name: string;
  studentNumber: string;
  reserved: boolean;
  attended: boolean;
  checkInTime: string | null;
}

export interface User {
  name: string;
  role: Role;
  studentNumber?: string;
  email: string;
  faculty: string;
  joined: string;
  avatarSeed: string;
}

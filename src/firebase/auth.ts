import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  type User as FBUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, DEMO_MODE } from '@/firebase/config';
import type { AppUser, Role } from '@/types';

const DEMO_USERS: Record<string, { password: string; user: AppUser }> = {
  'karabo@student.univen.ac.za': {
    password: 'demo1234',
    user: {
      uid: 'demo-student',
      studentNumber: '202301456',
      firstName: 'Karabo',
      lastName: 'Nkuna',
      email: 'karabo@student.univen.ac.za',
      phone: '',
      faculty: 'Faculty of Management Sciences',
      course: 'BCom Economics',
      yearLevel: '3',
      role: 'student',
      profileImageUrl: '',
      status: 'active',
      createdAt: '2024-02-01',
      updatedAt: '2024-02-01',
    },
  },
  'admin@acvosa.univen.ac.za': {
    password: 'admin1234',
    user: {
      uid: 'demo-admin',
      studentNumber: '',
      firstName: 'Thandiwe',
      lastName: 'Mphahlele',
      email: 'admin@acvosa.univen.ac.za',
      phone: '',
      faculty: 'ACVOSA Directorate',
      course: '',
      yearLevel: '',
      role: 'admin',
      profileImageUrl: '',
      status: 'active',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15',
    },
  },
};

export const DEMO_ACCOUNTS = [
  { email: 'karabo@student.univen.ac.za', password: 'demo1234', label: 'Student', name: 'Karabo Nkuna' },
  { email: 'admin@acvosa.univen.ac.za', password: 'admin1234', label: 'Administrator', name: 'Dr. Thandiwe Mphahlele' },
];

const CURRENT_USER_KEY = 'acvosa_demo_user';

export function mapFBUser(uid: string, data: Record<string, unknown>): AppUser {
  return {
    uid,
    studentNumber: (data.studentNumber as string) ?? '',
    firstName: (data.firstName as string) ?? '',
    lastName: (data.lastName as string) ?? '',
    email: (data.email as string) ?? '',
    phone: (data.phone as string) ?? '',
    faculty: (data.faculty as string) ?? '',
    course: (data.course as string) ?? '',
    yearLevel: (data.yearLevel as string) ?? '',
    role: (data.role as Role) ?? 'student',
    profileImageUrl: (data.profileImageUrl as string) ?? '',
    status: (data.status as string) ?? 'active',
    createdAt: (data.createdAt as string) ?? '',
    updatedAt: (data.updatedAt as string) ?? '',
  };
}

export async function signUp(
  email: string,
  password: string,
  profile: { firstName: string; lastName: string; studentNumber: string; faculty: string; course: string; yearLevel: string }
): Promise<AppUser> {
  if (DEMO_MODE) {
    const user: AppUser = {
      uid: `demo-${Date.now()}`,
      studentNumber: profile.studentNumber,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email,
      phone: '',
      faculty: profile.faculty,
      course: profile.course,
      yearLevel: profile.yearLevel,
      role: 'student',
      profileImageUrl: '',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  }

  const cred = await createUserWithEmailAndPassword(auth!, email, password);
  await updateProfile(cred.user, { displayName: `${profile.firstName} ${profile.lastName}` });

  const userData = {
    studentNumber: profile.studentNumber,
    firstName: profile.firstName,
    lastName: profile.lastName,
    email,
    phone: '',
    faculty: profile.faculty,
    course: profile.course,
    yearLevel: profile.yearLevel,
    role: 'student' as Role,
    profileImageUrl: '',
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(doc(db!, 'users', cred.user.uid), userData);
  return mapFBUser(cred.user.uid, userData as unknown as Record<string, unknown>);
}

export async function signIn(email: string, password: string): Promise<AppUser> {
  if (DEMO_MODE) {
    const account = DEMO_USERS[email.toLowerCase()];
    if (!account || account.password !== password) {
      throw new Error('Invalid email or password.');
    }
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(account.user));
    return account.user;
  }

  const cred = await signInWithEmailAndPassword(auth!, email, password);
  const userDoc = await getDoc(doc(db!, 'users', cred.user.uid));
  if (!userDoc.exists()) {
    throw new Error('User profile not found. Please contact support.');
  }
  return mapFBUser(cred.user.uid, userDoc.data() as Record<string, unknown>);
}

export async function signOutUser(): Promise<void> {
  if (DEMO_MODE) {
    localStorage.removeItem(CURRENT_USER_KEY);
    return;
  }
  await fbSignOut(auth!);
}

export async function resetPassword(email: string): Promise<void> {
  if (DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 600));
    return;
  }
  await sendPasswordResetEmail(auth!, email);
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<Pick<AppUser, 'firstName' | 'lastName' | 'phone' | 'faculty' | 'course' | 'yearLevel' | 'profileImageUrl'>>
): Promise<void> {
  if (DEMO_MODE) {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    if (stored) {
      const u = JSON.parse(stored) as AppUser;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ ...u, ...updates, updatedAt: new Date().toISOString() }));
    }
    return;
  }
  await setDoc(doc(db!, 'users', uid), { ...updates, updatedAt: serverTimestamp() }, { merge: true });
}

export function subscribeToAuth(callback: (user: AppUser | null) => void): () => void {
  if (DEMO_MODE) {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    callback(stored ? (JSON.parse(stored) as AppUser) : null);
    const handler = () => {
      const s = localStorage.getItem(CURRENT_USER_KEY);
      callback(s ? (JSON.parse(s) as AppUser) : null);
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }

  return onAuthStateChanged(auth!, async (fbUser: FBUser | null) => {
    if (!fbUser) {
      callback(null);
      return;
    }
    try {
      const userDoc = await getDoc(doc(db!, 'users', fbUser.uid));
      if (userDoc.exists()) {
        callback(mapFBUser(fbUser.uid, userDoc.data() as Record<string, unknown>));
      } else {
        callback(null);
      }
    } catch {
      callback(null);
    }
  });
}

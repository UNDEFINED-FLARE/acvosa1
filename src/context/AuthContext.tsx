import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Role } from '@/types';

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  student_number: string | null;
  email: string;
  faculty: string | null;
  avatar_seed: string | null;
  status: 'active' | 'inactive';
  created_at: string;
}

interface AuthState {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signInWithMicrosoft: () => Promise<{ error: string | null }>;
  signUp: (params: {
    email: string;
    password: string;
    fullName: string;
    studentNumber?: string;
    faculty?: string;
  }) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Failed to load profile', error);
      setProfile(null);
      return;
    }

    setProfile(data as Profile | null);
  }

  useEffect(() => {
    let mounted = true;

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!mounted) return;

        setSession(newSession);

        if (newSession) {
          setTimeout(() => {
            if (!mounted) return;

            loadProfile(newSession.user.id).finally(() => {
              if (mounted) setLoading(false);
            });
          }, 0);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn: AuthState['signIn'] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error: error?.message ?? null };
  };

  const signInWithGoogle: AuthState['signInWithGoogle'] = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    return { error: error?.message ?? null };
  };

  const signInWithMicrosoft: AuthState['signInWithMicrosoft'] = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        redirectTo: window.location.origin,
        scopes: 'email',
      },
    });

    return { error: error?.message ?? null };
  };

  const signUp: AuthState['signUp'] = async ({
    email,
    password,
    fullName,
    studentNumber,
    faculty,
  }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          student_number: studentNumber,
          faculty,
        },
      },
    });

    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        loading,
        signIn,
        signInWithGoogle,
        signInWithMicrosoft,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return ctx;
}
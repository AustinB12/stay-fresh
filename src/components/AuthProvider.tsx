import { createContext, useContext, useEffect, useState } from 'react';
import * as React from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signUpWithEmail: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If supabase is a proxy that throws, we catch it here
    try {
      // Check active sessions and sets the user
      supabase.auth
        .getSession()
        .then(({ data: { session } }) => {
          setUser(session?.user ?? null);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Supabase session error:', err);
          setLoading(false);
        });

      // Listen for changes on auth state (sign in, sign out, etc.)
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } catch (e) {
      console.warn(
        'Supabase auth is not available. Please configure environment variables.',
      );
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = async () => {
    console.log(
      `%c ${window.location.origin}`,
      'color: green; font-weight: bold;',
    );
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) console.error('Error signing in:', error.message);
  };

  const signInWithEmail = async (
    email: string,
    password: string,
  ): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { error: error.message };
      return { error: null };
    } catch (e: any) {
      return { error: e?.message ?? 'An unexpected error occurred.' };
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
  ): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) return { error: error.message };
      return { error: null };
    } catch (e: any) {
      return { error: e?.message ?? 'An unexpected error occurred.' };
    }
  };

  const resetPassword = async (
    email: string,
  ): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) return { error: error.message };
      return { error: null };
    } catch (e: any) {
      return { error: e?.message ?? 'An unexpected error occurred.' };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error.message);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

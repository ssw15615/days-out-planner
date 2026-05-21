import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getProfile } from './supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = loading
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) loadProfile(data.session.user.id);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId) {
    try {
      const p = await getProfile(userId);
      setProfile(p);
    } catch {
      // Profile not yet created — will be created by DB trigger
      setProfile(null);
    }
  }

  const isAdmin = profile?.role === 'admin';
  const loading = session === undefined;

  return (
    <AuthContext.Provider value={{ session, profile, isAdmin, loading, refreshProfile: () => loadProfile(session?.user?.id) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

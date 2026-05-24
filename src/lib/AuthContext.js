import { createContext, useContext, useEffect, useState } from 'react';
import { getSession, getProfile, onAuthStateChange } from './supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = loading
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const session = getSession();
    setSession(session);
    if (session) loadProfile(session.user.id);

    const unsubscribe = onAuthStateChange(() => {
      const session = getSession();
      setSession(session);
      if (session) loadProfile(session.user.id);
      else setProfile(null);
    });

    return () => unsubscribe();
  }, []);

  async function loadProfile(userId) {
    try {
      const p = await getProfile(userId);
      setProfile(p);
    } catch {
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

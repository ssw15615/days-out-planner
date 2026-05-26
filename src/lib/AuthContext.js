import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthChange, getUserProfile } from './firebaseAuth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = loading
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let canceled = false;
    const unsubscribe = onAuthChange(async (user) => {
      if (canceled) return;
      if (!user) {
        setSession(null);
        setProfile(null);
        return;
      }

      setSession({ user });
      try {
        const profileData = await getUserProfile(user.uid);
        setProfile(profileData || { name: user.displayName || user.email, email: user.email, role: 'user' });
      } catch {
        setProfile({ name: user.displayName || user.email, email: user.email, role: 'user' });
      }
    });

    return () => {
      canceled = true;
      unsubscribe();
    };
  }, []);

  const isAdmin = profile?.role === 'admin';
  const loading = session === undefined;

  return (
    <AuthContext.Provider value={{ session, profile, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

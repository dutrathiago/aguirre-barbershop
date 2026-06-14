'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserProfile, AppUser } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  appUser: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setUser(firebaseUser);
        if (firebaseUser) {
          const profile = await getUserProfile(firebaseUser.uid);
          setAppUser(profile);
        } else {
          setAppUser(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.warn("Firebase Auth não está configurado corretamente. Rodando em modo UI-only.", error);
      // Fallback: modo UI-only para não quebrar o layout
      setLoading(false);
      setAppUser(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, appUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

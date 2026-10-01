import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, onAuthStateChanged, doc, getDoc, setDoc } from '../firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as UserProfile);
        } else {
          // This should be handled in the signup flow, but as a fallback:
          const newUser: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || '',
            role: 'farmer', // Default role
            photoURL: firebaseUser.photoURL || '',
            createdAt: new Date().toISOString(),
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, ALLOWED_EMAILS } from '../firebase';
import { User } from '../types';
import { errorUtils } from '../utils';
import toast from 'react-hot-toast';

// AuthContext tipi
interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  loading: boolean;
}

// Context oluştur
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// AuthProvider props tipi
interface AuthProviderProps {
  children: ReactNode;
}

// Firebase User'ı kendi User tipimize çevir
const mapFirebaseUser = (firebaseUser: FirebaseUser): User => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  displayName: firebaseUser.displayName,
  photoURL: firebaseUser.photoURL
});

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const isEmailAllowed = (email: string): boolean => {
    return ALLOWED_EMAILS.includes(email.toLowerCase());
  };

  const signup = async (email: string, password: string) => {
    if (!isEmailAllowed(email)) {
      throw new Error('Bu email adresi ile kayıt olamazsınız. Bu uygulama sadece özel kullanım içindir.');
    }
    
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error: any) {
      errorUtils.logError(error, 'AuthContext.signup');
      
      // Firebase error kodlarını kontrol et
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Email/Password girişi Firebase Console\'da etkinleştirilmemiş. Lütfen Firebase Authentication ayarlarını kontrol edin.');
      }
      
      // Utility fonksiyonunu kullan
      const friendlyMessage = errorUtils.getFirebaseErrorMessage(error);
      throw new Error(friendlyMessage);
    }
  };

  const login = async (email: string, password: string) => {
    if (!isEmailAllowed(email)) {
      throw new Error('Bu email adresi ile giriş yapamazsınız. Bu uygulama sadece özel kullanım içindir.');
    }
    
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error: any) {
      errorUtils.logError(error, 'AuthContext.login');
      
      // Firebase error kodlarını kontrol et
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Email/Password girişi Firebase Console\'da etkinleştirilmemiş. Lütfen Firebase Authentication ayarlarını kontrol edin.');
      }
      
      // Utility fonksiyonunu kullan
      const friendlyMessage = errorUtils.getFirebaseErrorMessage(error);
      throw new Error(friendlyMessage);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error: any) {
      errorUtils.logError(error, 'AuthContext.logout');
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Email kontrolü
        if (!isEmailAllowed(firebaseUser.email || '')) {
          signOut(auth);
          toast.error('Yetkisiz erişim. Oturum kapatıldı.');
          setCurrentUser(null);
        } else {
          // Firebase User'ı kendi tipimize çevir
          setCurrentUser(mapFirebaseUser(firebaseUser));
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    login,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

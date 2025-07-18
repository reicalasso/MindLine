import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, ALLOWED_EMAILS } from '../firebase';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isEmailAllowed = (email) => {
    return ALLOWED_EMAILS.includes(email.toLowerCase());
  };

  const signup = async (email, password) => {
    if (!isEmailAllowed(email)) {
      throw new Error('Bu email adresi ile kayıt olamazsınız. Bu uygulama sadece özel kullanım içindir.');
    }
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Kayıt başarılı
      return result;
    } catch (error) {
      console.error('Kayıt hatası:', error);
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Email/Password girişi Firebase Console\'da etkinleştirilmemiş. Lütfen Firebase Authentication ayarlarını kontrol edin.');
      }
      if (error.code === 'auth/weak-password') {
        throw new Error('Şifre çok zayıf. En az 6 karakter olmalıdır.');
      }
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Bu email adresi zaten kullanımda.');
      }
      if (error.code === 'auth/invalid-email') {
        throw new Error('Geçersiz email adresi.');
      }
      throw error;
    }
  };

  const login = async (email, password) => {
    if (!isEmailAllowed(email)) {
      throw new Error('Bu email adresi ile giriş yapamazsınız. Bu uygulama sadece özel kullanım içindir.');
    }
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      // Giriş başarılı
      return result;
    } catch (error) {
      console.error('Giriş hatası:', error);
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Email/Password girişi Firebase Console\'da etkinleştirilmemiş. Lütfen Firebase Authentication ayarlarını kontrol edin.');
      }
      if (error.code === 'auth/user-not-found') {
        throw new Error('Bu email adresi ile kayıtlı kullanıcı bulunamadı.');
      }
      if (error.code === 'auth/wrong-password') {
        throw new Error('Hatalı şifre.');
      }
      if (error.code === 'auth/invalid-email') {
        throw new Error('Geçersiz email adresi.');
      }
      throw error;
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !isEmailAllowed(user.email)) {
        signOut(auth);
        toast.error('Yetkisiz erişim. Oturum kapatıldı.');
        setCurrentUser(null);
      } else {
        setCurrentUser(user);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDUSL5YiXj3IJSgnCFKPs4LnwPNxLIuzcs",
  authDomain: "mindline-6fe1b.firebaseapp.com",
  projectId: "mindline-6fe1b",
  storageBucket: "mindline-6fe1b.firebasestorage.app",
  messagingSenderId: "428246922721",
  appId: "1:428246922721:web:1552cedb91238b728c8ea0",
  measurementId: "G-GK3Q0S8XWH"
};

// Sadece belirli email adreslerine izin ver
export const ALLOWED_EMAILS = [
  'yintsukuyomi@proton.me',
  'maruko@gmail.com'
];

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Bağlantı durumunu kontrol et
console.log('Firebase başlatıldı');
console.log('İzin verilen emailler:', ALLOWED_EMAILS);

export default app;

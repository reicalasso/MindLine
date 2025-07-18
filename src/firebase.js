import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, writeBatch } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDUSL5YiXj3IJSgnCFKPs4LnwPNxLIuzcs",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "mindline-6fe1b.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "mindline-6fe1b",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "mindline-6fe1b.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "428246922721",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:428246922721:web:1552cedb91238b728c8ea0",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-GK3Q0S8XWH"
};

// Sadece belirli email adreslerine izin ver
export const ALLOWED_EMAILS = process.env.REACT_APP_ALLOWED_EMAILS 
  ? process.env.REACT_APP_ALLOWED_EMAILS.split(',').map(email => email.trim())
  : [
    'yintsukuyomi@proton.me',
    'mrandmrscalasso@gmail.com'
  ];

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { writeBatch };

// Bağlantı durumunu kontrol et
console.log('Firebase başlatıldı');

// Firebase bağlantısı başarılı oldu
// Not: Üretim ortamında console.log ifadeleri kaldırılmalıdır

export default app;

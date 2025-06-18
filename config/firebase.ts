// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence, connectAuthEmulator } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase konfigürasyonu - mevcut projen
const firebaseConfig = {
  apiKey: "AIzaSyDK2HRlN1E4O0LMclgi0KgxoIHGTMU1gp0",
  authDomain: "medora-1f84d.firebaseapp.com",
  projectId: "medora-1f84d",
  storageBucket: "medora-1f84d.firebasestorage.app",
  messagingSenderId: "458233108930",
  appId: "1:458233108930:web:ccb6659c88958ae2985e5b"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Firestore ve Auth servislerini al
export const db = getFirestore(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Network bağlantısı için timeout ayarları
// Firestore offline support
import { enableNetwork, disableNetwork } from "firebase/firestore";

// Firestore ayarları
if (__DEV__) {
  // Development modunda daha kısa timeout
  console.log("Firebase initialized in development mode");
}

// Network durumunu kontrol et ve bağlantıyı yönet
export const enableFirestoreNetwork = () => enableNetwork(db);
export const disableFirestoreNetwork = () => disableNetwork(db);

export default app;
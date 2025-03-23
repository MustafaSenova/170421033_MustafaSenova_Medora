// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {initializeAuth , getReactNativePersistence} from 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDK2HRlN1E4O0LMclgi0KgxoIHGTMU1gp0",
  authDomain: "medora-1f84d.firebaseapp.com",
  databaseURL: "https://medora-1f84d-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "medora-1f84d",
  storageBucket: "medora-1f84d.firebasestorage.app",
  messagingSenderId: "458233108930",
  appId: "1:458233108930:web:ccb6659c88958ae2985e5b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


//auth
export const auth = initializeAuth(app,{
    persistence: getReactNativePersistence(AsyncStorage),
})

export const firestore = getFirestore(app);
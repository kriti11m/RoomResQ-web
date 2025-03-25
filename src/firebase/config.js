import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCqReqTU8QtIPKTkW-E-VmEzPGeHGDho8s",
  authDomain: "roomresq.firebaseapp.com",
  projectId: "roomresq",
  storageBucket: "roomresq.firebasestorage.app",
  messagingSenderId: "60931557033",
  appId: "1:60931557033:web:705e0146027dbd762b8bb8",
  measurementId: "G-VFDDGHMJEX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); 
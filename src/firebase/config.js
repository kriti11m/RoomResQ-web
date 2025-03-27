// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC-MZcXqCDOFcu31JnUXfyTi2fqfTM8Lrs",
  authDomain: "roomresq-73635.firebaseapp.com",
  projectId: "roomresq-73635",
  storageBucket: "roomresq-73635.firebasestorage.app",
  messagingSenderId: "119094862262",
  appId: "1:119094862262:web:453cb25dcbf64121ac6117",
  measurementId: "G-7NJRNP0HR0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 
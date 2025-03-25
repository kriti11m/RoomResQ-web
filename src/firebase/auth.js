import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth, db } from './config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    
    // Configure the Google provider
    provider.setCustomParameters({
      prompt: 'select_account' // This will show the account selector every time
    });

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if the email is from VIT domain (both staff and student emails)
      if (!user.email.endsWith('@vit.ac.in') && !user.email.endsWith('@vitstudent.ac.in')) {
        await firebaseSignOut(auth);
        throw new Error('Please use your VIT email address (@vit.ac.in or @vitstudent.ac.in)');
      }

      // Check if user profile exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: new Date().toISOString()
        });
      }

      return user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = () => {
    return firebaseSignOut(auth);
  };

  const updateUserProfile = async (profileData) => {
    if (!user) throw new Error('No user logged in');

    try {
      // Update Firestore user profile
      await setDoc(doc(db, 'users', user.uid), {
        ...profileData,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: profileData.fullName
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 
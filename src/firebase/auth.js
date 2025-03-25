import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './config';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          // Check if user exists in backend
          const response = await fetch(`http://172.18.219.69:8081/api/user/${user.uid}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          });

          if (response.ok) {
            const userData = await response.json();
            localStorage.setItem('userProfile', JSON.stringify(userData));
            setHasProfile(true);
          } else {
            localStorage.removeItem('userProfile');
            setHasProfile(false);
          }
        } catch (error) {
          console.error('Error checking user:', error);
          localStorage.removeItem('userProfile');
          setHasProfile(false);
        }
      } else {
        localStorage.removeItem('userProfile');
        setHasProfile(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      if (!user.email.endsWith('@vit.ac.in') && !user.email.endsWith('@vitstudent.ac.in')) {
        await firebaseSignOut(auth);
        throw new Error('Please use your VIT email address (@vit.ac.in or @vitstudent.ac.in)');
      }

      const idToken = await user.getIdToken();
      
      // Send token to backend for authentication and user creation
      const response = await fetch('http://172.18.219.69:8081/api/auth/google-signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ idToken })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Backend authentication failed:', errorData);
        await firebaseSignOut(auth);
        throw new Error('Backend authentication failed');
      }

      const responseData = await response.json();
      const userData = responseData.user; // Extract user data from response

      // Store basic profile data
      const basicProfile = {
        firebaseUid: userData.firebaseUid || user.uid,
        email: userData.email || user.email,
        name: userData.name || user.displayName,
        photoUrl: userData.photoUrl || user.photoURL
      };
      localStorage.setItem('userProfile', JSON.stringify(basicProfile));

      // Check if profile is complete
      const isNewUser = !userData.regNo || !userData.phonenumber || !userData.block || !userData.roomNo;
      setHasProfile(!isNewUser);

      return { user, isNewUser };
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = () => {
    localStorage.removeItem('userProfile');
    setHasProfile(false);
    return firebaseSignOut(auth);
  };

  const value = {
    user,
    loading,
    hasProfile,
    signInWithGoogle,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 
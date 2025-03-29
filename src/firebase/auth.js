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
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          // Check if user exists in backend
          const response = await fetch(`http://localhost:8081/api/user/${user.uid}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          });

          if (response.ok) {
            const userData = await response.json();
            localStorage.setItem('userProfile', JSON.stringify(userData));
            setHasProfile(true);
            setIsAdmin(userData.isAdmin || false);
          } else {
            localStorage.removeItem('userProfile');
            setHasProfile(false);
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('Error checking user:', error);
          localStorage.removeItem('userProfile');
          setHasProfile(false);
          setIsAdmin(false);
        }
      } else {
        localStorage.removeItem('userProfile');
        setHasProfile(false);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async (isAdminLogin = false) => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Only check domain for student login
      if (!isAdminLogin && !user.email.endsWith('@vit.ac.in') && !user.email.endsWith('@vitstudent.ac.in')) {
        await firebaseSignOut(auth);
        throw new Error('Please use your VIT email address (@vit.ac.in or @vitstudent.ac.in)');
      }

      const idToken = await user.getIdToken();
      
      // Send token to backend for authentication and user creation
      const response = await fetch('http://localhost:8081/api/auth/google-signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          idToken,
          isAdmin: isAdminLogin 
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Backend authentication failed:', errorData);
        await firebaseSignOut(auth);
        throw new Error('Backend authentication failed');
      }

      const responseData = await response.json();
      const userData = responseData.user;

      // Store basic profile data
      const basicProfile = {
        firebaseUid: userData.firebaseUid || user.uid,
        email: userData.email || user.email,
        name: userData.name || user.displayName,
        photoUrl: userData.photoUrl || user.photoURL,
        isAdmin: userData.isAdmin || isAdminLogin
      };
      localStorage.setItem('userProfile', JSON.stringify(basicProfile));

      // Check if profile is complete
      const isNewUser = !userData.block; // For admin, we only need block
      setHasProfile(!isNewUser);
      setIsAdmin(isAdminLogin);

      return { user, isNewUser };
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = () => {
    localStorage.removeItem('userProfile');
    setHasProfile(false);
    setIsAdmin(false);
    return firebaseSignOut(auth);
  };

  const value = {
    user,
    loading,
    hasProfile,
    isAdmin,
    signInWithGoogle,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 
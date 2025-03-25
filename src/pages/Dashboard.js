import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const loadProfile = React.useCallback(async () => {
    try {
      if (!user?.uid) return;

      // Try to get profile from localStorage first
      const storedProfile = localStorage.getItem('userProfile');
      if (storedProfile) {
        const parsedProfile = JSON.parse(storedProfile);
        console.log('Loaded stored profile:', parsedProfile);
        if (parsedProfile.firebaseUid === user.uid) {
          setProfileData(parsedProfile);
          return;
        }
      }

      // If no valid profile in localStorage or it doesn't match current user,
      // fetch from backend
      const response = await fetch(`http://localhost:8081/api/user/${user.uid}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('Fetched profile from backend:', userData);
        localStorage.setItem('userProfile', JSON.stringify(userData));
        setProfileData(userData);
      } else {
        console.error('Failed to fetch profile data');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }, [user]);

  // Load profile when component mounts or user changes
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Listen for localStorage changes and profile updates
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'userProfile' && event.newValue) {
        try {
          const newProfile = JSON.parse(event.newValue);
          if (newProfile && newProfile.firebaseUid === user?.uid) {
            console.log('Profile updated from storage event:', newProfile);
            setProfileData(newProfile);
          }
        } catch (error) {
          console.error('Error parsing profile data from storage event:', error);
        }
      }
    };

    // Listen for storage events from other tabs/windows
    window.addEventListener('storage', handleStorageChange);

    // Create a custom event listener for same-tab updates
    const handleCustomStorageEvent = (event) => {
      if (event.detail && event.detail.key === 'userProfile') {
        const newProfile = event.detail.value;
        if (newProfile && newProfile.firebaseUid === user?.uid) {
          console.log('Profile updated from custom event:', newProfile);
          setProfileData(newProfile);
        }
      }
    };

    window.addEventListener('localStorageUpdated', handleCustomStorageEvent);

    // Initial load from localStorage
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      try {
        const parsedProfile = JSON.parse(storedProfile);
        if (parsedProfile.firebaseUid === user?.uid) {
          setProfileData(parsedProfile);
        }
      } catch (error) {
        console.error('Error parsing stored profile:', error);
      }
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageUpdated', handleCustomStorageEvent);
    };
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      localStorage.removeItem('userProfile');
      setProfileData(null);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div>
      <header style={{
        backgroundColor: 'var(--dark)',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        borderBottom: '1px solid rgba(147, 51, 234, 0.2)'
      }}>
        <h1 style={{ margin: 0, color: 'var(--white)' }}>RoomResQ</h1>
        
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--white)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              transition: 'all 0.3s ease'
            }}
            className="profile-button"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {profileData?.photoUrl ? (
                <img 
                  src={profileData.photoUrl} 
                  alt="Profile" 
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%',
                    border: '2px solid var(--primary)',
                    objectFit: 'cover'
                  }} 
                  onError={(e) => {
                    console.error('Image load error:', e.target.src);
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  {profileData?.name?.charAt(0) || user?.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 'bold', color: 'var(--white)' }}>
                  {profileData?.name || user?.displayName || 'User'}
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8, color: 'var(--light)' }}>
                  {profileData?.regNo || profileData?.email}
                </div>
              </div>
            </div>
            <span style={{ color: 'var(--light)', marginLeft: '4px' }}>▼</span>
          </button>
          
          <AnimatePresence>
            {isProfileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  backgroundColor: 'var(--dark)',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  minWidth: '250px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(147, 51, 234, 0.2)'
                }}
              >
                {profileData && (
                  <div style={{ 
                    marginBottom: '1rem', 
                    borderBottom: '1px solid rgba(147, 51, 234, 0.2)', 
                    paddingBottom: '1rem'
                  }}>
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                      {profileData.photoUrl ? (
                        <img 
                          src={profileData.photoUrl} 
                          alt="Profile" 
                          style={{ 
                            width: '80px', 
                            height: '80px', 
                            borderRadius: '50%',
                            border: '3px solid var(--primary)',
                            objectFit: 'cover',
                            boxShadow: '0 2px 8px rgba(147, 51, 234, 0.2)'
                          }} 
                        />
                      ) : (
                        <div style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '32px',
                          fontWeight: 'bold',
                          margin: '0 auto',
                          boxShadow: '0 2px 8px rgba(147, 51, 234, 0.2)'
                        }}>
                          {profileData.name?.charAt(0) || 'U'}
                        </div>
                      )}
                    </div>
                    <div style={{ color: 'var(--white)', marginBottom: '0.75rem' }}>
                      <strong>Name:</strong> {profileData.name}
                    </div>
                    <div style={{ color: 'var(--white)', marginBottom: '0.75rem' }}>
                      <strong>Email:</strong> {profileData.email}
                    </div>
                    {profileData.regNo && (
                      <div style={{ color: 'var(--white)', marginBottom: '0.75rem' }}>
                        <strong>Registration No:</strong> {profileData.regNo}
                      </div>
                    )}
                    {profileData.phonenumber && (
                      <div style={{ color: 'var(--white)', marginBottom: '0.75rem' }}>
                        <strong>Phone:</strong> {profileData.phonenumber}
                      </div>
                    )}
                    {profileData.hostelType && (
                      <div style={{ color: 'var(--white)', marginBottom: '0.75rem' }}>
                        <strong>Hostel:</strong> {profileData.hostelType}
                      </div>
                    )}
                    {profileData.block && profileData.roomNo && (
                      <div style={{ color: 'var(--white)' }}>
                        <strong>Room:</strong> {profileData.block}-{profileData.roomNo}
                      </div>
                    )}
                  </div>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button
                    onClick={handleSignOut}
                    style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: 'rgba(147, 51, 234, 0.1)',
                      color: 'var(--primary)',
                      border: '1px solid var(--primary)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      fontWeight: 'bold'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = 'var(--primary)';
                      e.target.style.color = 'var(--white)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = 'rgba(147, 51, 234, 0.1)';
                      e.target.style.color = 'var(--primary)';
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
        <nav style={{
          width: '250px',
          backgroundColor: 'var(--dark-light)',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          borderRight: '1px solid rgba(147, 51, 234, 0.2)'
        }}>
          <Link
            to="/dashboard"
            style={{
              padding: '0.75rem',
              color: isActive('/dashboard') ? 'var(--primary)' : 'var(--light)',
              textDecoration: 'none',
              borderRadius: '6px',
              backgroundColor: isActive('/dashboard') ? 'rgba(147, 51, 234, 0.1)' : 'transparent',
              transition: 'all 0.3s ease'
            }}
          >
            Dashboard
          </Link>
          <Link
            to="/maintenance-request"
            style={{
              padding: '0.75rem',
              color: isActive('/maintenance-request') ? 'var(--primary)' : 'var(--light)',
              textDecoration: 'none',
              borderRadius: '6px',
              backgroundColor: isActive('/maintenance-request') ? 'rgba(147, 51, 234, 0.1)' : 'transparent',
              transition: 'all 0.3s ease'
            }}
          >
            New Request
          </Link>
          <Link
            to="/request-status"
            style={{
              padding: '0.75rem',
              color: isActive('/request-status') ? 'var(--primary)' : 'var(--light)',
              textDecoration: 'none',
              borderRadius: '6px',
              backgroundColor: isActive('/request-status') ? 'rgba(147, 51, 234, 0.1)' : 'transparent',
              transition: 'all 0.3s ease'
            }}
          >
            Request Status
          </Link>
        </nav>

        <main style={{ flex: 1, padding: '2rem', backgroundColor: 'var(--dark)' }}>
          <motion.div 
            className="container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div style={{ 
              backgroundColor: 'var(--dark-light)',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(147, 51, 234, 0.2)'
            }}>
              <h2 style={{ color: 'var(--white)', marginBottom: '2rem' }}>Welcome to RoomResQ</h2>
              <p style={{ color: 'var(--light)', lineHeight: '1.6' }}>
                Manage your maintenance requests and track their status from this dashboard.
              </p>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard; 
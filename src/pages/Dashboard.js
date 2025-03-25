import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    gender: '',
    hostelBlock: '',
    roomNumber: ''
  });
  const { user, signOut, updateUserProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setProfileData(userDoc.data());
        }
      }
    };
    fetchUserProfile();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile(profileData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const hostelBlocks = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'E-annex'
  ];

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
            <span>{user?.displayName || 'User'}</span>
            <span>▼</span>
          </button>
          
          <AnimatePresence>
            {isProfileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  backgroundColor: 'var(--dark-light)',
                  border: '1px solid rgba(147, 51, 234, 0.2)',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginTop: '0.5rem',
                  width: '300px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                }}
              >
                <div style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(147, 51, 234, 0.2)', paddingBottom: '1rem' }}>
                  <h3 style={{ color: 'var(--white)', marginBottom: '0.5rem' }}>Profile Information</h3>
                  {!isEditing ? (
                    <div>
                      <div style={{ marginBottom: '0.5rem', color: 'var(--light)' }}>
                        <strong>Name:</strong> {profileData.fullName || 'Not set'}
                      </div>
                      <div style={{ marginBottom: '0.5rem', color: 'var(--light)' }}>
                        <strong>Gender:</strong> {profileData.gender ? profileData.gender.charAt(0).toUpperCase() + profileData.gender.slice(1) : 'Not set'}
                      </div>
                      <div style={{ marginBottom: '0.5rem', color: 'var(--light)' }}>
                        <strong>Block:</strong> {profileData.hostelBlock || 'Not set'}
                      </div>
                      <div style={{ marginBottom: '0.5rem', color: 'var(--light)' }}>
                        <strong>Room:</strong> {profileData.roomNumber || 'Not set'}
                      </div>
                      <div style={{ color: 'var(--light)' }}>
                        <strong>Email:</strong> {user?.email}
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleProfileUpdate}>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <input
                          type="text"
                          name="fullName"
                          value={profileData.fullName}
                          onChange={handleChange}
                          placeholder="Full Name"
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: '1px solid rgba(147, 51, 234, 0.3)',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--white)'
                          }}
                        />
                      </div>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <select
                          name="gender"
                          value={profileData.gender}
                          onChange={handleChange}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: '1px solid rgba(147, 51, 234, 0.3)',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--white)'
                          }}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <select
                          name="hostelBlock"
                          value={profileData.hostelBlock}
                          onChange={handleChange}
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: '1px solid rgba(147, 51, 234, 0.3)',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--white)'
                          }}
                        >
                          <option value="">Select Block</option>
                          {hostelBlocks.map(block => (
                            <option key={block} value={block}>{block}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <input
                          type="text"
                          name="roomNumber"
                          value={profileData.roomNumber}
                          onChange={handleChange}
                          placeholder="Room Number"
                          style={{
                            width: '100%',
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: '1px solid rgba(147, 51, 234, 0.3)',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--white)'
                          }}
                        />
                      </div>
                    </form>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  {isEditing ? (
                    <>
                      <button
                        type="submit"
                        onClick={handleProfileUpdate}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: 'var(--primary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: 'transparent',
                          color: 'var(--white)',
                          border: '1px solid rgba(147, 51, 234, 0.3)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: 'var(--primary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Edit Profile
                      </button>
                      <button
                        onClick={handleSignOut}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: 'transparent',
                          color: 'var(--white)',
                          border: '1px solid rgba(147, 51, 234, 0.3)',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Sign Out
                      </button>
                    </>
                  )}
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
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [editedProfile, setEditedProfile] = useState(null);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const loadProfile = React.useCallback(async () => {
    try {
      if (!user?.uid) return;

      // Check if profile is already completed
      const isProfileCompleted = localStorage.getItem('profileCompleted') === 'true';
      
      // Try to get profile from localStorage first
      const storedProfile = localStorage.getItem('userProfile');
      if (storedProfile && isProfileCompleted) {
        const parsedProfile = JSON.parse(storedProfile);
        console.log('Loaded stored profile:', parsedProfile);
        if (parsedProfile.firebaseUid === user.uid) {
          setProfileData(parsedProfile);
          return;
        }
      }

      // If profile isn't completed yet or doesn't match user, show minimal data
      if (!isProfileCompleted) {
        console.log('Profile not completed yet, showing minimal data');
        setProfileData({
          firebaseUid: user.uid,
          name: user.displayName || '',
          email: user.email,
          regNo: '',
          phonenumber: '',
          hostelType: '',
          block: '',
          roomNo: ''
        });
        
        // Automatically open edit profile modal for new users
        if (!storedProfile) {
          setTimeout(() => {
            setEditedProfile({
              firebaseUid: user.uid,
              name: user.displayName || '',
              email: user.email,
              regNo: '',
              phonenumber: '',
              hostelType: '',
              block: '',
              roomNo: ''
            });
            setIsEditModalOpen(true);
          }, 500);
        }
        return;
      }

      // Only fetch from backend if profile is completed
      const response = await fetch(`http://localhost:8081/api/user/${user.uid}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('Fetched profile from backend:', userData);
        
        // Check if profile has all required fields
        if (userData.regNo && userData.phonenumber && userData.hostelType && userData.block && userData.roomNo) {
          localStorage.setItem('userProfile', JSON.stringify(userData));
          localStorage.setItem('profileCompleted', 'true');
          setProfileData(userData);
        } else {
          // If backend profile is incomplete, prompt user to complete it
          setProfileData({
            firebaseUid: user.uid,
            name: user.displayName || userData.name || '',
            email: user.email,
            regNo: userData.regNo || '',
            phonenumber: userData.phonenumber || '',
            hostelType: userData.hostelType || '',
            block: userData.block || '',
            roomNo: userData.roomNo || ''
          });
          
          // Show edit modal if profile is incomplete
          setTimeout(() => {
            setEditedProfile({
              firebaseUid: user.uid,
              name: user.displayName || userData.name || '',
              email: user.email,
              regNo: userData.regNo || '',
              phonenumber: userData.phonenumber || '',
              hostelType: userData.hostelType || '',
              block: userData.block || '',
              roomNo: userData.roomNo || ''
            });
            setIsEditModalOpen(true);
          }, 500);
        }
      } else if (response.status === 404) {
        // If user not found, keep minimal data
        console.log('User not found in backend');
      } else {
        console.error('Failed to fetch profile data');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }, [user]);

  // Load profile when component mounts or user changes
  useEffect(() => {
    if (user?.uid) {
      loadProfile();
    }
  }, [user, loadProfile]);

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

  // Set profileCompleted flag if valid profile exists but flag isn't set
  useEffect(() => {
    if (user?.uid) {
      const profileCompletedFlag = localStorage.getItem('profileCompleted');
      const userProfileString = localStorage.getItem('userProfile');
      
      // If we have a profile but the flag isn't set, check if it has required fields
      if (userProfileString && profileCompletedFlag !== 'true') {
        try {
          const userProfile = JSON.parse(userProfileString);
          if (userProfile.firebaseUid === user.uid &&
              userProfile.name && 
              userProfile.email && 
              userProfile.regNo && 
              userProfile.phonenumber && 
              userProfile.hostelType && 
              userProfile.block && 
              userProfile.roomNo) {
            // Set the flag if all required fields are present
            localStorage.setItem('profileCompleted', 'true');
            console.log('Profile completion flag set based on existing profile data');
          }
        } catch (error) {
          console.error('Error checking profile completion:', error);
        }
      }
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      localStorage.removeItem('userProfile');
      localStorage.removeItem('profileCompleted');
      setProfileData(null);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleEditProfile = () => {
    setEditedProfile({ ...profileData });
    setIsEditModalOpen(true);
    setIsProfileMenuOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      // Validate required fields
      if (!editedProfile.name || !editedProfile.email || !editedProfile.regNo || 
          !editedProfile.phonenumber || !editedProfile.hostelType || 
          !editedProfile.block || !editedProfile.roomNo) {
        alert('All fields are required to complete your profile');
        return;
      }

      // Prepare the profile data for update
      const updatedProfileData = {
        ...editedProfile,
        firebaseUid: user.uid,
        email: user.email // Ensure email matches Firebase user
      };

      // Use the completeprofile endpoint for updates
      const response = await fetch('http://localhost:8081/api/user/completeprofile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(updatedProfileData)
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        console.log('Profile updated successfully:', updatedProfile);
        
        // Set profile as completed and store the data
        localStorage.setItem('profileCompleted', 'true');
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        setProfileData(updatedProfile);
        setIsEditModalOpen(false);
        
        // Dispatch custom event for same-tab updates
        window.dispatchEvent(new CustomEvent('localStorageUpdated', {
          detail: { key: 'userProfile', value: updatedProfile }
        }));

        // Show success message
        alert('Profile completed successfully!');
        
        // Force reload the page to ensure everything is updated
        window.location.reload();
      } else {
        const errorData = await response.json();
        console.error('Failed to update profile:', errorData);
        alert(errorData.message || 'Failed to complete profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while completing your profile. Please try again.');
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
                    <div style={{ color: 'var(--white)', marginBottom: '0.75rem' }}>
                      <strong>Registration No:</strong> {profileData.regNo || 'Not set'}
                    </div>
                    <div style={{ color: 'var(--white)', marginBottom: '0.75rem' }}>
                      <strong>Phone:</strong> {profileData.phonenumber || 'Not set'}
                    </div>
                    <div style={{ color: 'var(--white)', marginBottom: '0.75rem' }}>
                      <strong>Hostel:</strong> {profileData.hostelType || 'Not set'}
                    </div>
                    <div style={{ color: 'var(--white)' }}>
                      <strong>Room:</strong> {(profileData.block && profileData.roomNo) ? `${profileData.block}-${profileData.roomNo}` : 'Not set'}
                    </div>
                  </div>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button
                    onClick={handleEditProfile}
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
                    Edit Profile
                  </button>
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

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1001
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                backgroundColor: 'var(--dark-light)',
                padding: '2rem',
                borderRadius: '12px',
                width: '90%',
                maxWidth: '500px',
                maxHeight: '90vh',
                overflowY: 'auto',
                border: '1px solid rgba(147, 51, 234, 0.2)'
              }}
            >
              <h2 style={{ color: 'var(--white)', marginBottom: '1.5rem' }}>Edit Profile</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ color: 'var(--light)', display: 'block', marginBottom: '0.5rem' }}>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editedProfile?.name || ''}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'var(--dark)',
                      border: '1px solid rgba(147, 51, 234, 0.2)',
                      borderRadius: '6px',
                      color: 'var(--white)'
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: 'var(--light)', display: 'block', marginBottom: '0.5rem' }}>Phone Number</label>
                  <input
                    type="tel"
                    name="phonenumber"
                    value={editedProfile?.phonenumber || ''}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'var(--dark)',
                      border: '1px solid rgba(147, 51, 234, 0.2)',
                      borderRadius: '6px',
                      color: 'var(--white)'
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: 'var(--light)', display: 'block', marginBottom: '0.5rem' }}>Hostel Type</label>
                  <input
                    type="text"
                    name="hostelType"
                    value={editedProfile?.hostelType || ''}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'var(--dark)',
                      border: '1px solid rgba(147, 51, 234, 0.2)',
                      borderRadius: '6px',
                      color: 'var(--white)'
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: 'var(--light)', display: 'block', marginBottom: '0.5rem' }}>Block</label>
                  <input
                    type="text"
                    name="block"
                    value={editedProfile?.block || ''}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'var(--dark)',
                      border: '1px solid rgba(147, 51, 234, 0.2)',
                      borderRadius: '6px',
                      color: 'var(--white)'
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: 'var(--light)', display: 'block', marginBottom: '0.5rem' }}>Room Number</label>
                  <input
                    type="text"
                    name="roomNo"
                    value={editedProfile?.roomNo || ''}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'var(--dark)',
                      border: '1px solid rgba(147, 51, 234, 0.2)',
                      borderRadius: '6px',
                      color: 'var(--white)'
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'transparent',
                    color: 'var(--light)',
                    border: '1px solid var(--light)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    flex: 1
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'var(--primary)',
                    color: 'var(--white)',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    flex: 1
                  }}
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
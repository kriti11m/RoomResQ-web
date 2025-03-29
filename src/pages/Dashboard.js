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
      // Always fetch the latest profile data from the backend
      const fetchLatestProfile = async () => {
        try {
          // First, let's make sure we have a local fallback
          const localFallback = {
            firebaseUid: user.uid,
            name: user.displayName || '',
            email: user.email || '',
            photoUrl: user.photoURL || '',
            regNo: '',
            phonenumber: '',
            hostelType: '',
            block: '',
            roomNo: ''
          };
          
          console.log('Firebase user photo URL:', user.photoURL);
          
          const response = await fetch(`http://localhost:8081/api/user/${user.uid}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            }
          });
          
          if (response.ok) {
            let userData = await response.json();
            console.log('Fetched profile from backend on mount:', userData);
            
            // Check if photo URL exists in Firebase but not in backend data
            if ((!userData.photoUrl || userData.photoUrl === "null" || userData.photoUrl === "undefined") && user.photoURL) {
              console.log('Adding missing photo URL from Firebase:', user.photoURL);
              
              // Update our local user data first
              userData.photoUrl = user.photoURL;
              
              // Update the backend with the photo URL
              try {
                const updateResponse = await fetch('http://localhost:8081/api/user/completeprofile', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                  },
                  body: JSON.stringify({
                    ...userData,
                    photoUrl: user.photoURL,
                    firebaseUid: user.uid,
                    email: user.email,
                    name: user.displayName
                  })
                });
                
                if (updateResponse.ok) {
                  userData = await updateResponse.json();
                  console.log('Updated backend with photo URL:', userData);
                  
                  // Double check the response contains the photo
                  if (!userData.photoUrl && user.photoURL) {
                    userData.photoUrl = user.photoURL;
                  }
                }
              } catch (updateError) {
                console.error('Error updating photo URL in backend:', updateError);
                // Still use the photo URL from Firebase even if backend update fails
                userData.photoUrl = user.photoURL;
              }
            }
            
            // Ensure we have a photo URL if it's available from Firebase
            if ((!userData.photoUrl || userData.photoUrl === "null" || userData.photoUrl === "undefined") && user.photoURL) {
              userData.photoUrl = user.photoURL;
            }
            
            console.log('Final user data with photo:', userData);
            
            // Update profile data state with the latest data
            setProfileData(userData);
            
            // Store in localStorage
            localStorage.setItem('userProfile', JSON.stringify(userData));
            localStorage.setItem('profileCompleted', 'true');
          } else {
            // Fallback to loadProfile if backend fetch fails
            console.log('Backend fetch failed, falling back to stored data');
            
            // Set minimal profile data while we wait for loadProfile
            setProfileData(prevData => ({
              ...prevData,
              ...localFallback
            }));
            
            loadProfile();
          }
        } catch (error) {
          console.error('Error fetching profile on mount:', error);
          loadProfile();
        }
      };
      
      fetchLatestProfile();
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

  const handleEditProfile = async () => {
    try {
      // Fetch the latest profile data from the backend before editing
      if (user?.uid) {
        const response = await fetch(`http://localhost:8081/api/user/${user.uid}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          const latestUserData = await response.json();
          console.log('Fetched fresh profile data:', latestUserData);
          
          // Ensure photoUrl is set from Firebase if missing in backend
          if ((!latestUserData.photoUrl || latestUserData.photoUrl === "null" || latestUserData.photoUrl === "undefined") && user.photoURL) {
            console.log('Setting photo URL from Firebase in edit data:', user.photoURL);
            latestUserData.photoUrl = user.photoURL;
          }
          
          // Update profileData state with the latest data
          setProfileData(latestUserData);
          
          // Store in localStorage
          localStorage.setItem('userProfile', JSON.stringify(latestUserData));
          
          // Set up edit form with the latest data
          setEditedProfile(latestUserData);
        } else {
          console.warn('Could not fetch latest profile data, using existing data');
          const updatedProfileData = { 
            ...profileData,
            photoUrl: profileData?.photoUrl || user?.photoURL 
          };
          console.log('Using existing data with photo:', updatedProfileData);
          setEditedProfile(updatedProfileData);
        }
      } else {
        // Fallback to existing data if user ID is not available
        const updatedProfileData = { 
          ...profileData,
          photoUrl: profileData?.photoUrl || user?.photoURL 
        };
        console.log('No user ID, using existing data with photo:', updatedProfileData);
        setEditedProfile(updatedProfileData);
      }
    } catch (error) {
      console.error('Error fetching latest profile data:', error);
      // Fallback to existing data
      const updatedProfileData = { 
        ...profileData,
        photoUrl: profileData?.photoUrl || user?.photoURL 
      };
      console.log('Error occurred, using existing data with photo:', updatedProfileData);
      setEditedProfile(updatedProfileData);
    }
    
    // Open the edit modal and close the profile menu
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
      const requiredFields = ['name', 'email', 'regNo', 'phonenumber', 'hostelType', 'block', 'roomNo'];
      const missingFields = requiredFields.filter(field => !editedProfile[field]);
      
      if (missingFields.length > 0) {
        alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Always ensure we have the photo URL from Firebase if it's not in the edited profile
      const photoUrl = editedProfile.photoUrl || user.photoURL || '';

      // Prepare the profile data for update
      const updatedProfileData = {
        ...editedProfile,
        firebaseUid: user.uid,
        email: user.email, // Ensure email matches Firebase user
        name: user.displayName, // Ensure name matches Firebase user
        photoUrl: photoUrl // Ensure photo URL is included
      };

      console.log('Sending profile update with data:', updatedProfileData);

      // Send update request to the backend
      const response = await fetch('http://localhost:8081/api/user/completeprofile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(updatedProfileData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedProfile = await response.json();
      
      // Ensure we still have the photo URL in the updated profile
      if (!updatedProfile.photoUrl && photoUrl) {
        updatedProfile.photoUrl = photoUrl;
      }
      
      // Update local storage and state
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      localStorage.setItem('profileCompleted', 'true');
      
      // Update the UI state directly
      setProfileData(updatedProfile);
      setIsEditModalOpen(false);
      
      // Dispatch custom event for same-tab updates
      window.dispatchEvent(new CustomEvent('localStorageUpdated', {
        detail: { key: 'userProfile', value: updatedProfile }
      }));

      // Show success message
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error.message || 'An error occurred while updating your profile. Please try again.');
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
              {(profileData?.photoUrl || user?.photoURL) ? (
                <img 
                  src={profileData?.photoUrl || user?.photoURL} 
                  alt="Profile" 
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%',
                    border: '2px solid var(--primary)',
                    objectFit: 'cover',
                    backgroundColor: 'var(--primary-light)'
                  }} 
                  onError={(e) => {
                    console.error('Image load error:', e.target.src);
                    // Instead of hiding the image, replace with fallback
                    e.target.style.display = 'none';
                    // Create fallback initial
                    const parent = e.target.parentNode;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.style.width = '32px';
                      fallback.style.height = '32px';
                      fallback.style.borderRadius = '50%';
                      fallback.style.backgroundColor = 'var(--primary)';
                      fallback.style.display = 'flex';
                      fallback.style.alignItems = 'center';
                      fallback.style.justifyContent = 'center';
                      fallback.style.color = 'white';
                      fallback.style.fontSize = '16px';
                      fallback.style.fontWeight = 'bold';
                      fallback.innerText = profileData?.name?.charAt(0) || user?.displayName?.charAt(0) || 'U';
                      parent.insertBefore(fallback, e.target);
                    }
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
                      {(profileData.photoUrl || user?.photoURL) ? (
                        <img 
                          src={profileData.photoUrl || user?.photoURL} 
                          alt="Profile" 
                          style={{ 
                            width: '80px', 
                            height: '80px', 
                            borderRadius: '50%',
                            border: '3px solid var(--primary)',
                            objectFit: 'cover',
                            boxShadow: '0 2px 8px rgba(147, 51, 234, 0.2)',
                            backgroundColor: 'var(--primary-light)'
                          }} 
                          onError={(e) => {
                            console.error('Image load error in dropdown:', e.target.src);
                            // Instead of hiding the image, replace with fallback
                            e.target.style.display = 'none';
                            // Create fallback initial
                            const parent = e.target.parentNode;
                            if (parent) {
                              const fallback = document.createElement('div');
                              fallback.style.width = '80px';
                              fallback.style.height = '80px';
                              fallback.style.borderRadius = '50%';
                              fallback.style.backgroundColor = 'var(--primary)';
                              fallback.style.display = 'flex';
                              fallback.style.alignItems = 'center';
                              fallback.style.justifyContent = 'center';
                              fallback.style.color = 'white';
                              fallback.style.fontSize = '32px';
                              fallback.style.fontWeight = 'bold';
                              fallback.style.margin = '0 auto';
                              fallback.style.boxShadow = '0 2px 8px rgba(147, 51, 234, 0.2)';
                              fallback.innerText = profileData.name?.charAt(0) || user?.displayName?.charAt(0) || 'U';
                              parent.insertBefore(fallback, e.target);
                            }
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
                          {profileData.name?.charAt(0) || user?.displayName?.charAt(0) || 'U'}
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
            style={{ 
              height: '100%',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              paddingTop: '3rem'
            }}
          >
            <div style={{ 
              backgroundColor: 'var(--dark-light)',
              borderRadius: '12px',
              padding: '2rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(147, 51, 234, 0.2)',
              maxWidth: '600px',
              width: '100%',
              textAlign: 'center'
            }}>
              <h2 style={{ 
                color: 'var(--white)', 
                marginBottom: '1.5rem', 
                fontSize: '2rem',
                fontWeight: '600',
                background: 'linear-gradient(90deg, #ffffff, var(--primary-light))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Welcome to RoomResQ
              </h2>
              <p style={{ 
                color: 'var(--light)', 
                lineHeight: '1.6',
                fontSize: '1.1rem',
                marginBottom: '1.5rem'
              }}>
                Manage your maintenance requests and track their status from this dashboard.
              </p>
              <div style={{
                marginTop: '2rem',
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem'
              }}>
                <Link
                  to="/maintenance-request"
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    display: 'inline-block'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = 'var(--primary-light)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'var(--primary)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Create New Request
                </Link>
                <Link
                  to="/request-status"
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'transparent',
                    color: 'var(--light)',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    border: '1px solid var(--primary)',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    display: 'inline-block'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = 'rgba(147, 51, 234, 0.1)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  View Request Status
                </Link>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard; 
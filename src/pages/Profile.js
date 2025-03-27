import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../firebase/auth';
import { motion } from 'framer-motion';

const Profile = () => {
  const navigate = useNavigate();
  const { user, hasProfile } = useAuth();
  const [formData, setFormData] = useState({
    firebaseUid: user?.uid || '',
    email: user?.email || '',
    name: user?.displayName || '',
    phonenumber: '',
    roomNo: '',
    hostelType: '',
    block: '',
    regNo: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect to dashboard if user already has a profile
  useEffect(() => {
    if (hasProfile) {
      navigate('/dashboard', { replace: true });
    }
  }, [hasProfile, navigate]);

  // Load existing profile data if available
  useEffect(() => {
    if (!user) return;

    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      try {
        const profile = JSON.parse(storedProfile);
        if (profile.firebaseUid === user.uid) {
          setFormData(prevData => ({
            ...prevData,
            ...profile
          }));
        }
      } catch (error) {
        console.error('Error parsing stored profile:', error);
      }
    }
  }, [user]);

  const hostelTypes = ['Boys Hostel', 'Girls Hostel'];
  const blocks = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'E-annex'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Ensure all required fields are filled
      const requiredFields = ['regNo', 'phonenumber', 'hostelType', 'block', 'roomNo'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      const response = await fetch('http://172.18.218.136:8081/api/user/completeprofile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          email: user.email,
          name: user.displayName,
          photoUrl: user.photoURL,
          firebaseUid: user.uid
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to complete profile');
      }

      // Store the complete profile data in localStorage
      localStorage.setItem('userProfile', JSON.stringify(responseData));
      
      // Dispatch event to update profile status
      window.dispatchEvent(new CustomEvent('localStorageUpdated', {
        detail: {
          key: 'userProfile',
          value: responseData
        }
      }));

      // Force a page reload to ensure all states are updated
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error completing profile:', error);
      setError(error.message || 'Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const formVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } }
  };

  return (
    <motion.div
      className="container"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className="form-container"
        variants={formVariants}
      >
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ marginBottom: '2rem', textAlign: 'center' }}
        >
          Complete Your Profile
        </motion.h2>

        {error && (
          <div className="error-message" style={{ marginBottom: '1rem', color: 'red', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <motion.div className="form-group" variants={inputVariants}>
            <label htmlFor="regNo">Registration Number</label>
            <input
              type="text"
              id="regNo"
              name="regNo"
              value={formData.regNo}
              onChange={handleChange}
              required
              placeholder="Enter your registration number"
            />
          </motion.div>

          <motion.div className="form-group" variants={inputVariants}>
            <label htmlFor="phonenumber">Phone Number</label>
            <input
              type="tel"
              id="phonenumber"
              name="phonenumber"
              value={formData.phonenumber}
              onChange={handleChange}
              required
              placeholder="Enter your phone number"
              pattern="[0-9]{10}"
              title="Please enter a valid 10-digit phone number"
            />
          </motion.div>

          <motion.div className="form-group" variants={inputVariants}>
            <label htmlFor="hostelType">Hostel Type</label>
            <select
              id="hostelType"
              name="hostelType"
              value={formData.hostelType}
              onChange={handleChange}
              required
            >
              <option value="">Select Hostel Type</option>
              {hostelTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </motion.div>

          <motion.div className="form-group" variants={inputVariants}>
            <label htmlFor="block">Block</label>
            <select
              id="block"
              name="block"
              value={formData.block}
              onChange={handleChange}
              required
            >
              <option value="">Select Block</option>
              {blocks.map(block => (
                <option key={block} value={block}>{block}</option>
              ))}
            </select>
          </motion.div>

          <motion.div className="form-group" variants={inputVariants}>
            <label htmlFor="roomNo">Room Number</label>
            <input
              type="text"
              id="roomNo"
              name="roomNo"
              value={formData.roomNo}
              onChange={handleChange}
              required
              placeholder="Enter your room number"
            />
          </motion.div>

          <motion.button
            type="submit"
            className="btn-primary"
            style={{ width: '100%' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
          >
            {loading ? 'Completing Profile...' : 'Complete Profile'}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Profile; 
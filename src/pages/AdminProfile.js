import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../firebase/auth';
import { motion } from 'framer-motion';

const AdminProfile = () => {
  const navigate = useNavigate();
  const { user, hasProfile, isAdmin } = useAuth();
  const [formData, setFormData] = useState({
    firebaseUid: user?.uid || '',
    email: user?.email || '',
    name: user?.displayName || '',
    hostelType: '',
    block: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect to admin dashboard if user already has a profile or is not an admin
  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard', { replace: true });
    } else if (hasProfile) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [hasProfile, isAdmin, navigate]);

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
      if (!formData.hostelType || !formData.block) {
        throw new Error('Please fill in all required fields');
      }

      const response = await fetch('http://localhost:8081/api/admin/completeprofile', {
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
          firebaseUid: user.uid,
          isAdmin: true
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

      // Navigate to admin dashboard
      navigate('/admin/dashboard');
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
          Complete Admin Profile
        </motion.h2>

        {error && (
          <div className="error-message" style={{ marginBottom: '1rem', color: 'red', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
            <label htmlFor="block">Block Assignment</label>
            <select
              id="block"
              name="block"
              value={formData.block}
              onChange={handleChange}
              required
            >
              <option value="">Select Block</option>
              {blocks.map(block => (
                <option key={block} value={block}>Block {block}</option>
              ))}
            </select>
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

export default AdminProfile; 
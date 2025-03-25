import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../firebase/auth';
import { motion } from 'framer-motion';

const Profile = () => {
  const navigate = useNavigate();
  const { updateUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    hostelBlock: '',
    roomNumber: ''
  });

  const hostelBlocks = [
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
    try {
      await updateUserProfile(formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const formVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const inputVariants = {
    focus: {
      scale: 1.02,
      transition: {
        duration: 0.2
      }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2
      }
    },
    tap: {
      scale: 0.95
    }
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
        <form onSubmit={handleSubmit}>
          <motion.div
            className="form-group"
            whileFocus="focus"
            variants={inputVariants}
          >
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </motion.div>

          <motion.div
            className="form-group"
            whileFocus="focus"
            variants={inputVariants}
          >
            <label>Gender</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <motion.label
                whileHover={{ scale: 1.05 }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={handleChange}
                  required
                />
                Male
              </motion.label>
              <motion.label
                whileHover={{ scale: 1.05 }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={handleChange}
                  required
                />
                Female
              </motion.label>
            </div>
          </motion.div>

          <motion.div
            className="form-group"
            whileFocus="focus"
            variants={inputVariants}
          >
            <label htmlFor="hostelBlock">Hostel Block</label>
            <select
              id="hostelBlock"
              name="hostelBlock"
              value={formData.hostelBlock}
              onChange={handleChange}
              required
            >
              <option value="">Select Block</option>
              {hostelBlocks.map(block => (
                <option key={block} value={block}>{block}</option>
              ))}
            </select>
          </motion.div>

          <motion.div
            className="form-group"
            whileFocus="focus"
            variants={inputVariants}
          >
            <label htmlFor="roomNumber">Room Number</label>
            <input
              type="text"
              id="roomNumber"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleChange}
              required
            />
          </motion.div>

          <motion.button
            type="submit"
            className="btn-primary"
            style={{ width: '100%' }}
            whileHover="hover"
            whileTap="tap"
            variants={buttonVariants}
          >
            Save Profile
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Profile; 
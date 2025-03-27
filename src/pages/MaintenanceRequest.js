import React, { useState, useEffect } from 'react';
import { submitMaintenanceRequest } from '../firebase/requests';
import Header from '../components/Header';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../firebase/auth';

const MaintenanceRequest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    issueType: '',
    description: '',
    urgencyLevel: '',
    preferredDateTime: '',
    listType: '',
    proof: null
  });

  // Check if user profile is completed
  useEffect(() => {
    // Check both localStorage flag and actual profile data
    const userProfileString = localStorage.getItem('userProfile');
    
    // Only show alert if we can't find profile data at all
    if (!userProfileString && user) {
      setError('Please complete your profile before submitting a maintenance request.');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      return;
    }
    
    try {
      // Verify we have at least the basic required fields
      if (userProfileString) {
        const userProfile = JSON.parse(userProfileString);
        const hasRequiredFields = userProfile.name && 
                                 userProfile.email && 
                                 userProfile.regNo && 
                                 userProfile.phonenumber;
                                 
        if (!hasRequiredFields && user) {
          const missingFields = [];
          if (!userProfile.name) missingFields.push('Name');
          if (!userProfile.email) missingFields.push('Email');
          if (!userProfile.regNo) missingFields.push('Registration Number');
          if (!userProfile.phonenumber) missingFields.push('Phone Number');
          
          setError(`Please complete your profile with all required fields: ${missingFields.join(', ')}`);
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        }
      }
    } catch (e) {
      console.error('Error parsing profile data:', e);
      setError('Error checking profile data. Please try again.');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  }, [user, navigate, setError]);

  const issueTypes = [
    'Electrical',
    'Plumbing',
    'Cleaning',
    'Internet',
    'Laundry',
    'Other'
  ];

  const listTypes = [
    'Suggestions',
    'Improvements',
    'Feedback',
    'Requisition'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear any previous errors when user makes changes
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit. Please choose a smaller file.');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        proof: file
      }));
      setError('');
    }
  };

  const validateForm = () => {
    // Validate required fields
    if (!formData.issueType) return 'Please select an issue type';
    if (!formData.description) return 'Please provide a description';
    if (!formData.urgencyLevel) return 'Please select an urgency level';
    if (!formData.preferredDateTime) return 'Please select a preferred date and time';
    if (!formData.listType) return 'Please select a request category';
    
    // Check if the date is in the future
    const selectedDate = new Date(formData.preferredDateTime);
    if (selectedDate < new Date()) {
      return 'Please select a future date and time';
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await submitMaintenanceRequest(formData);
      
      // Check if the result contains a ticket ID
      if (result && result.ticketid) {
        alert('Request submitted successfully!');
        
        // Reset form data
        setFormData({
          issueType: '',
          description: '',
          urgencyLevel: '',
          preferredDateTime: '',
          listType: '',
          proof: null
        });
        
        // Navigate to request details page
        navigate(`/request/${result.ticketid}`);
      } else {
        // Fallback to request status page if no ticket ID is returned
        alert('Request submitted successfully!');
        setFormData({
          issueType: '',
          description: '',
          urgencyLevel: '',
          preferredDateTime: '',
          listType: '',
          proof: null
        });
        navigate('/request-status');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      setError(error.message || 'Error submitting request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--dark)' }}>
      <Header />
      <div style={{ 
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        minHeight: 'calc(100vh - 64px)'
      }}>
        <motion.div 
          className="form-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: 'linear-gradient(145deg, var(--dark-light), rgba(12, 12, 30, 0.95))',
            borderRadius: '24px',
            padding: '3rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(147, 51, 234, 0.1)'
          }}
        >
          <motion.h2 
            style={{ 
              marginBottom: '2rem', 
              textAlign: 'center',
              fontSize: '2.8rem',
              padding: '1.5rem 2rem',
              background: 'linear-gradient(90deg, #ffffff, var(--primary-light))',
              borderRadius: '16px',
              border: '1px solid rgba(147, 51, 234, 0.2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              boxShadow: '0 4px 20px rgba(147, 51, 234, 0.1)'
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Submit Maintenance Request
          </motion.h2>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '1rem',
                marginBottom: '2rem',
                backgroundColor: 'rgba(255, 50, 50, 0.1)',
                border: '1px solid rgba(255, 50, 50, 0.3)',
                borderRadius: '8px',
                color: '#ff6b6b',
                textAlign: 'center'
              }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label htmlFor="issueType" style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                color: 'var(--white)',
                fontSize: '1.1rem',
                fontWeight: '500'
              }}>
                Type of Issue
              </label>
              <select
                id="issueType"
                name="issueType"
                value={formData.issueType}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '2px solid rgba(147, 51, 234, 0.2)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--white)',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <option value="">Select Issue Type</option>
                {issueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label htmlFor="description" style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                color: 'var(--white)',
                fontSize: '1.1rem',
                fontWeight: '500'
              }}>
                Description of Issue
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                required
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '2px solid rgba(147, 51, 234, 0.2)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--white)',
                  fontSize: '1rem',
                  resize: 'vertical',
                  minHeight: '150px'
                }}
                placeholder="Please provide detailed information about the issue..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
              <div className="form-group">
                <label htmlFor="urgencyLevel" style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  color: 'var(--white)',
                  fontSize: '1.1rem',
                  fontWeight: '500'
                }}>
                  Urgency Level
                </label>
                <select
                  id="urgencyLevel"
                  name="urgencyLevel"
                  value={formData.urgencyLevel}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '2px solid rgba(147, 51, 234, 0.2)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--white)',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Select Urgency Level</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="preferredDateTime" style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem',
                  color: 'var(--white)',
                  fontSize: '1.1rem',
                  fontWeight: '500'
                }}>
                  Preferred Date/Time
                </label>
                <input
                  type="datetime-local"
                  id="preferredDateTime"
                  name="preferredDateTime"
                  value={formData.preferredDateTime}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '2px solid rgba(147, 51, 234, 0.2)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--white)',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label htmlFor="listType" style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                color: 'var(--white)',
                fontSize: '1.1rem',
                fontWeight: '500'
              }}>
                Request Category
              </label>
              <select
                id="listType"
                name="listType"
                value={formData.listType}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '2px solid rgba(147, 51, 234, 0.2)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--white)',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select Category</option>
                {listTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                color: 'var(--white)',
                fontSize: '1.1rem',
                fontWeight: '500'
              }}>
                Proof (Optional)
              </label>
              <div style={{
                padding: '1.5rem',
                borderRadius: '12px',
                border: '2px dashed rgba(147, 51, 234, 0.2)',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="proof"
                />
                <label htmlFor="proof" style={{ cursor: 'pointer' }}>
                  {formData.proof ? (
                    <span style={{ color: 'var(--primary-light)' }}>{formData.proof.name}</span>
                  ) : (
                    <span style={{ color: 'var(--light)' }}>
                      Click to upload image (JPG, PNG)
                    </span>
                  )}
                </label>
              </div>
              <div style={{ 
                marginTop: '0.5rem', 
                fontSize: '0.85rem', 
                color: 'var(--light)', 
                textAlign: 'right' 
              }}>
                Max file size: 5MB
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '12px',
                border: 'none',
                background: isLoading 
                  ? 'linear-gradient(135deg, #666, #888)' 
                  : 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? 'Submitting...' : 'Submit Request'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default MaintenanceRequest; 
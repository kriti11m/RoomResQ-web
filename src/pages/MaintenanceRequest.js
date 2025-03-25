import React, { useState } from 'react';
import { submitMaintenanceRequest } from '../firebase/requests';
import Header from '../components/Header';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const MaintenanceRequest = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    issueType: '',
    description: '',
    urgencyLevel: '',
    preferredDateTime: '',
    listType: '',
    proof: null
  });

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
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        proof: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitMaintenanceRequest(formData);
      alert('Request submitted successfully!');
      setFormData({
        issueType: '',
        description: '',
        urgencyLevel: '',
        preferredDateTime: '',
        listType: '',
        proof: null
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Error submitting request. Please try again.');
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
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
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
                  accept=".pdf,.doc,.docx,.jpg,.jpeg"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="proof"
                />
                <label htmlFor="proof" style={{ cursor: 'pointer' }}>
                  {formData.proof ? (
                    <span style={{ color: 'var(--primary-light)' }}>{formData.proof.name}</span>
                  ) : (
                    <span style={{ color: 'var(--light)' }}>
                      Click to upload file (PDF, DOC, JPG)
                    </span>
                  )}
                </label>
              </div>
            </div>

            <motion.button
              type="submit"
              className="btn-primary"
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Submit Request
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default MaintenanceRequest; 
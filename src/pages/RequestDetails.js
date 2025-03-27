import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRequestById } from '../firebase/requests';
import Header from '../components/Header';
import { motion } from 'framer-motion';

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequestDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getRequestById(id);
        setRequest(data);
      } catch (err) {
        console.error('Error fetching request details:', err);
        setError(err.message || 'Failed to load maintenance request details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRequestDetails();
    }
  }, [id]);

  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'status-badge status-pending';
      case 'IN_PROGRESS':
      case 'INPROGRESS':
        return 'status-badge status-in-progress';
      case 'COMPLETED':
        return 'status-badge status-completed';
      case 'CANCELLED':
        return 'status-badge status-cancelled';
      default:
        return 'status-badge';
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString;
    }
  };
  
  // Convert base64 to image URL
  const getImageUrl = (base64Data) => {
    if (!base64Data) return null;
    return `data:image/jpeg;base64,${base64Data}`;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--dark)' }}>
      <Header />
      <div style={{ 
        padding: '2rem',
        maxWidth: '1000px',
        margin: '0 auto',
        minHeight: 'calc(100vh - 64px)'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <h2 style={{ 
              color: 'var(--white)',
              fontSize: '2.5rem',
              margin: 0
            }}>
              Maintenance Request Details
            </h2>
            <button 
              onClick={() => navigate('/request-status')}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                border: '1px solid var(--primary)',
                color: 'var(--primary)',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(147, 51, 234, 0.1)'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              Back to Requests
            </button>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading request details...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <div className="error-icon">⚠️</div>
              <h3>Error Loading Request Details</h3>
              <p>{error}</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                <button className="retry-button" onClick={() => navigate(`/request/${id}`)}>
                  Try Again
                </button>
                <button className="dashboard-button" onClick={() => navigate('/request-status')}>
                  Back to All Requests
                </button>
              </div>
            </div>
          ) : !request ? (
            <div className="error-container">
              <div className="error-icon">🔍</div>
              <h3>Request Not Found</h3>
              <p>The maintenance request with ID {id} could not be found.</p>
              <button className="dashboard-button" onClick={() => navigate('/request-status')}>
                Back to All Requests
              </button>
            </div>
          ) : (
            <div style={{
              background: 'linear-gradient(145deg, var(--dark-light), rgba(12, 12, 30, 0.95))',
              borderRadius: '12px',
              padding: '2rem',
              border: '1px solid rgba(147, 51, 234, 0.1)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '2rem',
                borderBottom: '1px solid rgba(147, 51, 234, 0.2)',
                paddingBottom: '1.5rem'
              }}>
                <div>
                  <h3 style={{ 
                    color: 'var(--white)', 
                    fontSize: '1.8rem', 
                    margin: '0 0 0.5rem' 
                  }}>
                    {request.issue || 'Maintenance Request'}
                  </h3>
                  <p style={{ 
                    color: 'var(--light)', 
                    margin: 0,
                    fontSize: '1.1rem'
                  }}>
                    Ticket ID: <span style={{ 
                      fontFamily: 'monospace', 
                      color: 'var(--primary-light)', 
                      fontWeight: 'bold' 
                    }}>{request.ticketid}</span>
                  </p>
                </div>
                <span className={getStatusBadgeClass(request.status)} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                  {request.status || 'UNKNOWN'}
                </span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                  <h4 style={{ color: 'var(--primary-light)', marginTop: 0, marginBottom: '1rem' }}>Request Information</h4>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ color: 'var(--light)', fontWeight: 'bold', marginBottom: '0.25rem' }}>Category:</p>
                    <p style={{ color: 'var(--white)', margin: 0 }}>{request.category || 'Not specified'}</p>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ color: 'var(--light)', fontWeight: 'bold', marginBottom: '0.25rem' }}>Urgency:</p>
                    <p style={{ color: 'var(--white)', margin: 0 }}>{request.urgency || 'Not specified'}</p>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ color: 'var(--light)', fontWeight: 'bold', marginBottom: '0.25rem' }}>Submitted Date:</p>
                    <p style={{ color: 'var(--white)', margin: 0 }}>{formatDate(request.date)}</p>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ color: 'var(--light)', fontWeight: 'bold', marginBottom: '0.25rem' }}>Preferred Time:</p>
                    <p style={{ color: 'var(--white)', margin: 0 }}>{formatDate(request.time)}</p>
                  </div>
                </div>
                
                <div>
                  <h4 style={{ color: 'var(--primary-light)', marginTop: 0, marginBottom: '1rem' }}>Description</h4>
                  <p style={{ 
                    color: 'var(--white)', 
                    backgroundColor: 'rgba(0, 0, 0, 0.2)', 
                    padding: '1rem', 
                    borderRadius: '8px',
                    lineHeight: '1.6',
                    minHeight: '150px'
                  }}>
                    {request.description || 'No description provided'}
                  </p>
                </div>
              </div>
              
              {request.image && (
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ color: 'var(--primary-light)', marginBottom: '1rem' }}>Attached Image</h4>
                  <div style={{ 
                    borderRadius: '8px', 
                    overflow: 'hidden', 
                    border: '1px solid rgba(147, 51, 234, 0.2)',
                    maxWidth: '500px'
                  }}>
                    <img 
                      src={getImageUrl(request.image)} 
                      alt="Request attachment" 
                      style={{ width: '100%', display: 'block' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/500x300?text=Image+Not+Available';
                        e.target.style.opacity = '0.5';
                      }}
                    />
                  </div>
                </div>
              )}
              
              <div style={{ 
                marginTop: '2rem', 
                paddingTop: '1.5rem', 
                borderTop: '1px solid rgba(147, 51, 234, 0.2)',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <button 
                  onClick={() => navigate('/request-status')}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'transparent',
                    border: '1px solid var(--light)',
                    color: 'var(--light)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Back to All Requests
                </button>
                
                <button 
                  onClick={() => navigate('/maintenance-request')}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'var(--primary)',
                    border: 'none',
                    color: 'white',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
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
                  Submit New Request
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default RequestDetails; 
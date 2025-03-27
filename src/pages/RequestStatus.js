import React, { useState, useEffect } from 'react';
import { getUserRequests } from '../firebase/requests';
import Header from '../components/Header';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const RequestStatus = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRequests = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    
    try {
      const data = await getUserRequests();
      setRequests(data);
    } catch (err) {
      console.error('Error fetching requests:', err);
      
      // Special handling for the PostgreSQL Large Objects error
      if (err.message && err.message.includes('Large Objects may not be used in auto-commit mode')) {
        setError('The server is experiencing a database configuration issue. The administrator has been notified. Please try again later or contact support if this persists.');
      } else {
        setError(err.message || 'Failed to load maintenance requests');
      }
    } finally {
      setLoading(false);
      if (showRefreshing) {
        setRefreshing(false);
      }
    }
  };

  // Fetch requests when component mounts
  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRefresh = () => {
    fetchRequests(true);
  };

  const handleViewDetails = (id) => {
    navigate(`/request/${id}`);
  };

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
        maxWidth: '1200px',
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
              Your Maintenance Requests
            </h2>
            <button 
              onClick={handleRefresh}
              disabled={refreshing || loading}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                border: '1px solid var(--primary)',
                color: 'var(--primary)',
                borderRadius: '6px',
                cursor: refreshing || loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                if (!refreshing && !loading) {
                  e.target.style.backgroundColor = 'rgba(147, 51, 234, 0.1)';
                }
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              {refreshing ? (
                <>
                  <div className="loading-spinner-small"></div>
                  <span>Refreshing...</span>
                </>
              ) : (
                <>
                  <i className="fa fa-refresh"></i>
                  <span>Refresh</span>
                </>
              )}
            </button>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading your maintenance requests...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <div className="error-icon">⚠️</div>
              <h3>Error Loading Requests</h3>
              <p>{error}</p>
              <button className="retry-button" onClick={() => fetchRequests()}>
                Try Again
              </button>
            </div>
          ) : requests.length === 0 ? (
            <div className="empty-container">
              <div className="empty-icon">📋</div>
              <h3>No Maintenance Requests</h3>
              <p>You haven't submitted any maintenance requests yet.</p>
              <button 
                className="create-request-button"
                onClick={() => navigate('/maintenance-request')}
              >
                Create New Request
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {requests.map((request) => (
                <motion.div 
                  key={request.ticketid} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: 'linear-gradient(145deg, var(--dark-light), rgba(12, 12, 30, 0.95))',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid rgba(147, 51, 234, 0.1)',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => handleViewDetails(request.ticketid)}
                  whileHover={{ 
                    scale: 1.01, 
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                    border: '1px solid rgba(147, 51, 234, 0.3)'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '1rem',
                    borderBottom: '1px solid rgba(147, 51, 234, 0.1)',
                    paddingBottom: '0.75rem'
                  }}>
                    <h3 style={{ color: 'var(--white)', margin: 0 }}>
                      {request.issue || 'Maintenance Request'}
                    </h3>
                    <span className={getStatusBadgeClass(request.status)}>
                      {request.status || 'UNKNOWN'}
                    </span>
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr',
                    gap: '1.5rem',
                    marginBottom: '1.5rem' 
                  }}>
                    <div>
                      <p style={{ 
                        color: 'var(--light)', 
                        fontWeight: 'bold',
                        marginBottom: '0.25rem' 
                      }}>Description:</p>
                      <p style={{ color: 'var(--white)', margin: 0, maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {request.description || 'No description provided'}
                      </p>
                    </div>
                    
                    <div>
                      <p style={{ 
                        color: 'var(--light)', 
                        fontWeight: 'bold',
                        marginBottom: '0.25rem' 
                      }}>Category:</p>
                      <p style={{ color: 'var(--white)', margin: 0 }}>
                        {request.category || 'Not specified'}
                      </p>
                    </div>
                  </div>

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '1rem',
                    marginBottom: '0.5rem'
                  }}>
                    <div>
                      <p style={{ 
                        color: 'var(--light)', 
                        fontWeight: 'bold',
                        marginBottom: '0.25rem' 
                      }}>Date:</p>
                      <p style={{ color: 'var(--white)', margin: 0 }}>
                        {formatDate(request.date)}
                      </p>
                    </div>
                    
                    <div>
                      <p style={{ 
                        color: 'var(--light)', 
                        fontWeight: 'bold',
                        marginBottom: '0.25rem' 
                      }}>Ticket ID:</p>
                      <p style={{ color: 'var(--primary-light)', margin: 0, fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                        {request.ticketid}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ 
                    textAlign: 'right', 
                    marginTop: '1rem', 
                    fontSize: '0.9rem', 
                    color: 'var(--primary-light)' 
                  }}>
                    Click to view details
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default RequestStatus; 
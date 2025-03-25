import React, { useState, useEffect } from 'react';
import { getUserRequests } from '../firebase/requests';
import Header from '../components/Header';
import { motion } from 'framer-motion';

const RequestStatus = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const userRequests = await getUserRequests();
        setRequests(userRequests);
      } catch (error) {
        console.error('Error fetching requests:', error);
        setError(error.message || 'Failed to load your maintenance requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return { 
          className: 'status-badge status-pending',
          background: 'rgba(255, 166, 0, 0.1)',
          color: '#ff9800',
          border: '1px solid rgba(255, 166, 0, 0.3)'
        };
      case 'IN_PROGRESS':
      case 'INPROGRESS':
        return { 
          className: 'status-badge status-in-progress',
          background: 'rgba(33, 150, 243, 0.1)',
          color: '#2196f3',
          border: '1px solid rgba(33, 150, 243, 0.3)'
        };
      case 'COMPLETED':
        return { 
          className: 'status-badge status-completed',
          background: 'rgba(76, 175, 80, 0.1)',
          color: '#4caf50',
          border: '1px solid rgba(76, 175, 80, 0.3)'
        };
      case 'CANCELLED':
        return { 
          className: 'status-badge status-cancelled',
          background: 'rgba(244, 67, 54, 0.1)',
          color: '#f44336',
          border: '1px solid rgba(244, 67, 54, 0.3)'
        };
      default:
        return { 
          className: 'status-badge',
          background: 'rgba(158, 158, 158, 0.1)',
          color: '#9e9e9e',
          border: '1px solid rgba(158, 158, 158, 0.3)'
        };
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
          <h2 style={{ 
            marginBottom: '2rem', 
            textAlign: 'center',
            color: 'var(--white)',
            fontSize: '2.5rem'
          }}>
            Your Maintenance Requests
          </h2>
          
          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem',
              color: 'var(--light)' 
            }}>
              <p>Loading your requests...</p>
            </div>
          ) : error ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem',
              color: '#ff6b6b' 
            }}>
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  background: 'transparent',
                  border: '1px solid var(--primary)',
                  color: 'var(--primary)',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Try Again
              </button>
            </div>
          ) : requests.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem',
              background: 'linear-gradient(145deg, var(--dark-light), rgba(12, 12, 30, 0.95))',
              borderRadius: '12px',
              color: 'var(--light)'
            }}>
              <p>You haven't submitted any maintenance requests yet.</p>
              <button 
                onClick={() => window.location.href = '/maintenance-request'} 
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem 1.5rem',
                  background: 'var(--primary)',
                  border: 'none',
                  color: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Submit a New Request
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
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
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
                    <span style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '50px',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      ...getStatusBadgeClass(request.status)
                    }}>
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
                      <p style={{ color: 'var(--white)', margin: 0 }}>
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
                    marginBottom: '1.5rem'
                  }}>
                    <div>
                      <p style={{ 
                        color: 'var(--light)', 
                        fontWeight: 'bold',
                        marginBottom: '0.25rem' 
                      }}>Urgency:</p>
                      <p style={{ color: 'var(--white)', margin: 0 }}>
                        {request.Urgeny || 'Not specified'}
                      </p>
                    </div>
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
                      }}>Time:</p>
                      <p style={{ color: 'var(--white)', margin: 0 }}>
                        {formatDate(request.time)}
                      </p>
                    </div>
                    <div>
                      <p style={{ 
                        color: 'var(--light)', 
                        fontWeight: 'bold',
                        marginBottom: '0.25rem' 
                      }}>Ticket ID:</p>
                      <p style={{ color: 'var(--white)', margin: 0 }}>
                        #{request.ticketid || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {request.image && (
                    <div style={{ marginTop: '1rem' }}>
                      <p style={{ 
                        color: 'var(--light)', 
                        fontWeight: 'bold',
                        marginBottom: '0.5rem' 
                      }}>Image:</p>
                      <div style={{ 
                        maxWidth: '100%', 
                        overflow: 'hidden', 
                        borderRadius: '8px',
                        border: '1px solid rgba(147, 51, 234, 0.2)'
                      }}>
                        <img 
                          src={getImageUrl(request.image)} 
                          alt="Maintenance issue" 
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '300px',
                            objectFit: 'contain',
                            display: 'block',
                            margin: '0 auto'
                          }} 
                        />
                      </div>
                    </div>
                  )}
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
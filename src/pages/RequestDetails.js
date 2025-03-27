import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { motion } from 'framer-motion';
import { getUserRequests } from '../firebase/requests';

const RequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequestDetails = async () => {
      setLoading(true);
      try {
        const allRequests = await getUserRequests();
        const foundRequest = allRequests.find(req => req.ticketid === id);
        
        if (foundRequest) {
          setRequest(foundRequest);
        } else {
          setError('Request not found');
        }
      } catch (err) {
        console.error('Error fetching request details:', err);
        setError(err.message || 'Failed to load request details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRequestDetails();
    } else {
      setError('Invalid request ID');
      setLoading(false);
    }
  }, [id]);

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
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString;
    }
  };
  
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
          <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center' }}>
            <button 
              onClick={() => navigate('/request-status')}
              style={{
                marginRight: '1rem',
                padding: '0.5rem 1rem',
                background: 'transparent',
                border: '1px solid var(--light)',
                color: 'var(--light)',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              Back to All Requests
            </button>
            <h2 style={{ color: 'var(--white)', margin: 0 }}>
              Request Details
            </h2>
          </div>
          
          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem',
              background: 'linear-gradient(145deg, var(--dark-light), rgba(12, 12, 30, 0.95))',
              borderRadius: '12px',
              color: 'var(--light)' 
            }}>
              <p style={{ marginBottom: '1rem' }}>Loading request details...</p>
              <div className="loading-spinner" style={{ 
                width: '40px', 
                height: '40px', 
                margin: '0 auto',
                border: '3px solid rgba(147, 51, 234, 0.3)',
                borderTop: '3px solid var(--primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            </div>
          ) : error ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem',
              color: '#ff6b6b',
              background: 'linear-gradient(145deg, var(--dark-light), rgba(12, 12, 30, 0.95))',
              borderRadius: '12px',
              border: '1px solid rgba(255, 107, 107, 0.2)'
            }}>
              <p>{error}</p>
              <button 
                onClick={() => navigate('/request-status')} 
                style={{
                  marginTop: '1.5rem',
                  padding: '0.75rem 1.5rem',
                  background: 'transparent',
                  border: '1px solid var(--primary)',
                  color: 'var(--primary)',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Back to All Requests
              </button>
            </div>
          ) : request ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                background: 'linear-gradient(145deg, var(--dark-light), rgba(12, 12, 30, 0.95))',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid rgba(147, 51, 234, 0.2)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)'
              }}
            >
              <div style={{ 
                padding: '1.5rem 2rem',
                borderBottom: '1px solid rgba(147, 51, 234, 0.2)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ color: 'var(--white)', margin: 0, fontSize: '1.5rem' }}>
                  {request.issue || 'Maintenance Request'}
                </h3>
                <span style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '50px',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  ...getStatusBadgeClass(request.status)
                }}>
                  {request.status || 'UNKNOWN'}
                </span>
              </div>

              <div style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ color: 'var(--primary-light)', marginTop: 0, marginBottom: '0.75rem' }}>
                    Ticket Information
                  </h4>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.5rem',
                    padding: '1rem',
                    background: 'rgba(12, 12, 30, 0.5)',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <p style={{ color: 'var(--light)', margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>
                        Ticket ID
                      </p>
                      <p style={{ 
                        color: 'var(--primary-light)', 
                        margin: 0, 
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        letterSpacing: '0.5px'
                      }}>
                        {request.ticketid}
                      </p>
                    </div>
                    
                    <div>
                      <p style={{ color: 'var(--light)', margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>
                        Submitted On
                      </p>
                      <p style={{ color: 'var(--white)', margin: 0 }}>
                        {formatDate(request.date)}
                      </p>
                    </div>
                    
                    <div>
                      <p style={{ color: 'var(--light)', margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>
                        Category
                      </p>
                      <p style={{ color: 'var(--white)', margin: 0 }}>
                        {request.category || 'Not specified'}
                      </p>
                    </div>
                    
                    <div>
                      <p style={{ color: 'var(--light)', margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>
                        Urgency
                      </p>
                      <p style={{ color: 'var(--white)', margin: 0 }}>
                        {request.Urgeny || 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ color: 'var(--primary-light)', marginTop: 0, marginBottom: '0.75rem' }}>
                    Request Details
                  </h4>
                  <div style={{ 
                    padding: '1.5rem',
                    background: 'rgba(12, 12, 30, 0.5)',
                    borderRadius: '8px'
                  }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                      <p style={{ color: 'var(--light)', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
                        Issue
                      </p>
                      <p style={{ color: 'var(--white)', margin: 0, fontWeight: 'bold' }}>
                        {request.issue || 'No issue specified'}
                      </p>
                    </div>
                    
                    <div>
                      <p style={{ color: 'var(--light)', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>
                        Description
                      </p>
                      <p style={{ 
                        color: 'var(--white)', 
                        margin: 0,
                        lineHeight: '1.6',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {request.description || 'No description provided'}
                      </p>
                    </div>
                  </div>
                </div>
                
                {request.image && (
                  <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ color: 'var(--primary-light)', marginTop: 0, marginBottom: '0.75rem' }}>
                      Attached Image
                    </h4>
                    <div style={{ 
                      background: 'rgba(12, 12, 30, 0.5)',
                      borderRadius: '8px',
                      padding: '1rem',
                      textAlign: 'center'
                    }}>
                      <img 
                        src={getImageUrl(request.image)} 
                        alt="Maintenance issue" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '400px',
                          objectFit: 'contain',
                          borderRadius: '4px'
                        }} 
                      />
                    </div>
                  </div>
                )}
                
                {request.comments && request.comments.length > 0 && (
                  <div>
                    <h4 style={{ color: 'var(--primary-light)', marginTop: 0, marginBottom: '0.75rem' }}>
                      Updates & Comments
                    </h4>
                    <div style={{ 
                      padding: '1rem',
                      background: 'rgba(12, 12, 30, 0.5)',
                      borderRadius: '8px'
                    }}>
                      {request.comments.map((comment, index) => (
                        <div 
                          key={index}
                          style={{
                            padding: '1rem',
                            borderBottom: index < request.comments.length - 1 ? '1px solid rgba(147, 51, 234, 0.1)' : 'none',
                            marginBottom: index < request.comments.length - 1 ? '1rem' : 0
                          }}
                        >
                          <div style={{ 
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '0.5rem'
                          }}>
                            <span style={{ color: 'var(--primary-light)', fontWeight: 'bold' }}>
                              {comment.author || 'Staff'}
                            </span>
                            <span style={{ color: 'var(--light)', fontSize: '0.85rem' }}>
                              {formatDate(comment.date)}
                            </span>
                          </div>
                          <p style={{ color: 'var(--white)', margin: 0 }}>
                            {comment.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div style={{ 
                padding: '1.5rem 2rem',
                borderTop: '1px solid rgba(147, 51, 234, 0.2)',
                background: 'rgba(12, 12, 30, 0.8)',
                textAlign: 'right'
              }}>
                <button 
                  onClick={() => navigate('/request-status')}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'transparent',
                    border: '1px solid var(--primary)',
                    color: 'var(--primary)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginLeft: '1rem',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = 'rgba(147, 51, 234, 0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  Back to All Requests
                </button>
              </div>
            </motion.div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem',
              background: 'linear-gradient(145deg, var(--dark-light), rgba(12, 12, 30, 0.95))',
              borderRadius: '12px',
              color: 'var(--light)' 
            }}>
              <p>No data available</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default RequestDetails; 
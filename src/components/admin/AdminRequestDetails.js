import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './AdminRequestDetails.css';

const AdminRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusOptions] = useState(['pending', 'in-progress', 'completed']);
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    const fetchRequestDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`http://localhost:8081/api/maintenance/${id}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch maintenance request details');
        }

        const data = await response.json();
        setRequest(data);
        setSelectedStatus(data.status || 'pending');
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

  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:8081/api/maintenance/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update maintenance request status');
      }

      // Update the local state with the new status
      setRequest(prev => ({ ...prev, status: newStatus }));
      setSelectedStatus(newStatus);
      
    } catch (err) {
      console.error('Error updating request status:', err);
      setError(err.message || 'Failed to update status');
    } finally {
      setLoading(false);
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
    <div className="admin-request-details">
      <div className="request-details-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="details-header">
            <h1>Maintenance Request Details</h1>
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="back-button"
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
              <h3>Error Loading Request</h3>
              <p>{error}</p>
              <button className="retry-button" onClick={() => window.location.reload()}>
                Retry
              </button>
            </div>
          ) : !request ? (
            <div className="error-container">
              <h3>Request Not Found</h3>
              <p>The maintenance request with ID {id} could not be found.</p>
              <button className="back-button" onClick={() => navigate('/admin/dashboard')}>
                Back to Dashboard
              </button>
            </div>
          ) : (
            <div className="request-details-card">
              <div className="request-header">
                <div>
                  <h2>{request.issue || 'Maintenance Request'}</h2>
                  <p className="ticket-id">Ticket ID: <span>{request.ticketid || id}</span></p>
                </div>
                <div className={`status-badge status-${request.status}`}>
                  {request.status || 'pending'}
                </div>
              </div>
              
              <div className="request-content">
                <div className="request-info">
                  <h3>Request Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <strong>Category:</strong>
                      <span>{request.category || 'Not specified'}</span>
                    </div>
                    <div className="info-item">
                      <strong>Urgency:</strong>
                      <span>{request.urgency || 'Not specified'}</span>
                    </div>
                    <div className="info-item">
                      <strong>Submitted Date:</strong>
                      <span>{formatDate(request.time || request.createdAt)}</span>
                    </div>
                    <div className="info-item">
                      <strong>Preferred Time:</strong>
                      <span>{formatDate(request.preferredDateTime)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="student-info-section">
                  <h3>Student Information</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <strong>Name:</strong>
                      <span>{request.user?.name || 'Not available'}</span>
                    </div>
                    <div className="info-item">
                      <strong>Room Number:</strong>
                      <span>{request.user?.roomNo || 'Not available'}</span>
                    </div>
                    <div className="info-item">
                      <strong>Block:</strong>
                      <span>{request.user?.block || 'Not available'}</span>
                    </div>
                    <div className="info-item">
                      <strong>Hostel Type:</strong>
                      <span>{request.user?.hostelType || 'Not available'}</span>
                    </div>
                    <div className="info-item">
                      <strong>Email:</strong>
                      <span>{request.user?.email || 'Not available'}</span>
                    </div>
                    <div className="info-item">
                      <strong>Phone:</strong>
                      <span>{request.user?.phonenumber || 'Not available'}</span>
                    </div>
                  </div>
                </div>

                <div className="description-section">
                  <h3>Description</h3>
                  <p>{request.description || 'No description provided'}</p>
                </div>
                
                {request.image && (
                  <div className="image-section">
                    <h3>Attached Image</h3>
                    <div className="image-container">
                      <img 
                        src={getImageUrl(request.image)} 
                        alt="Maintenance issue" 
                        className="request-image"
                      />
                    </div>
                  </div>
                )}
                
                <div className="status-update-section">
                  <h3>Update Status</h3>
                  <div className="status-buttons">
                    {statusOptions.map(status => (
                      <button
                        key={status}
                        className={`status-button ${status} ${selectedStatus === status ? 'active' : ''}`}
                        onClick={() => handleStatusChange(status)}
                        disabled={loading || selectedStatus === status}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="action-footer">
                <button 
                  onClick={() => navigate('/admin/dashboard')}
                  className="back-button"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminRequestDetails; 
import React, { useState, useEffect } from 'react';
import { getUserRequests } from '../firebase/requests';
import Header from '../components/Header';

const RequestStatus = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const userRequests = await getUserRequests();
        setRequests(userRequests);
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'status-badge status-pending';
      case 'in progress':
        return 'status-badge status-in-progress';
      case 'completed':
        return 'status-badge status-completed';
      default:
        return 'status-badge';
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div className="container">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Loading requests...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="container">
        <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Your Maintenance Requests</h2>
        
        {requests.length === 0 ? (
          <div className="form-container" style={{ textAlign: 'center' }}>
            <p>No maintenance requests found.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {requests.map((request) => (
              <div key={request.id} className="form-container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3>{request.issueType}</h3>
                  <span className={getStatusBadgeClass(request.status)}>
                    {request.status}
                  </span>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Description:</strong>
                  <p>{request.description}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <strong>Work Type:</strong>
                    <p>{request.workType}</p>
                  </div>
                  <div>
                    <strong>Urgency:</strong>
                    <p>{request.urgencyLevel}</p>
                  </div>
                  <div>
                    <strong>Preferred Date:</strong>
                    <p>{new Date(request.preferredDateTime).toLocaleString()}</p>
                  </div>
                  <div>
                    <strong>Submitted:</strong>
                    <p>{new Date(request.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {request.comments && (
                  <div style={{ marginTop: '1rem' }}>
                    <strong>Comments:</strong>
                    <p>{request.comments}</p>
                  </div>
                )}

                {request.proofUrl && (
                  <div style={{ marginTop: '1rem' }}>
                    <strong>Proof:</strong>
                    <a href={request.proofUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)' }}>
                      View Attachment
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestStatus; 
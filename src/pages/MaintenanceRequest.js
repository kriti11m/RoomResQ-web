import React, { useState } from 'react';
import { submitMaintenanceRequest } from '../firebase/requests';

const MaintenanceRequest = () => {
  const [formData, setFormData] = useState({
    issueType: '',
    description: '',
    urgencyLevel: '',
    preferredDateTime: '',
    workType: '',
    listType: '',
    comments: '',
    proof: null
  });

  const workTypes = [
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
        workType: '',
        listType: '',
        comments: '',
        proof: null
      });
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Error submitting request. Please try again.');
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Maintenance Request</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="issueType">Type of Issue</label>
            <input
              type="text"
              id="issueType"
              name="issueType"
              value={formData.issueType}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description of Issue</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="urgencyLevel">Urgency Level</label>
            <select
              id="urgencyLevel"
              name="urgencyLevel"
              value={formData.urgencyLevel}
              onChange={handleChange}
              required
            >
              <option value="">Select Urgency Level</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="preferredDateTime">Preferred Date/Time</label>
            <input
              type="datetime-local"
              id="preferredDateTime"
              name="preferredDateTime"
              value={formData.preferredDateTime}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="workType">Type of Work</label>
            <select
              id="workType"
              name="workType"
              value={formData.workType}
              onChange={handleChange}
              required
            >
              <option value="">Select Work Type</option>
              {workTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="listType">List Type</label>
            <select
              id="listType"
              name="listType"
              value={formData.listType}
              onChange={handleChange}
              required
            >
              <option value="">Select List Type</option>
              {listTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="comments">Comments</label>
            <textarea
              id="comments"
              name="comments"
              value={formData.comments}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Proof (Optional)</label>
            <div className="file-upload">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="proof"
              />
              <label htmlFor="proof" style={{ cursor: 'pointer' }}>
                {formData.proof ? formData.proof.name : 'Click to upload file'}
              </label>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceRequest; 
import { auth } from './config';

export const submitMaintenanceRequest = async (requestData) => {
  if (!auth.currentUser) throw new Error('No user logged in');

  try {
    let formData = new FormData();
    
    // Add all request data
    Object.keys(requestData).forEach(key => {
      if (key !== 'proof') {
        formData.append(key, requestData[key]);
      }
    });

    // Add the proof file if it exists
    if (requestData.proof) {
      formData.append('proof', requestData.proof);
    }

    // Add user ID
    formData.append('userId', auth.currentUser.uid);

    const response = await fetch('http://172.18.219.69:8081/api/maintenance/submit', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || 'Failed to submit maintenance request');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
};

export const getUserRequests = async () => {
  if (!auth.currentUser) throw new Error('No user logged in');

  try {
    const response = await fetch(`http://localhost:8081/api/maintenance/user/${auth.currentUser.uid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || 'Failed to fetch maintenance requests');
    }

    const requests = await response.json();
    return requests;
  } catch (error) {
    throw error;
  }
}; 
import { auth } from './config';

export const submitMaintenanceRequest = async (formData) => {
  try {
    // Get current user from localStorage
    const userProfileString = localStorage.getItem('userProfile');
    if (!userProfileString) {
      throw new Error('User profile not found. Please complete your profile first.');
    }
    
    // Parse user profile to get email
    const userProfile = JSON.parse(userProfileString);
    if (!userProfile.email) {
      throw new Error('User email not found. Please complete your profile first.');
    }
    
    // Verify required profile fields
    const hasRequiredFields = userProfile.name && 
                            userProfile.email && 
                            userProfile.regNo && 
                            userProfile.phonenumber;
    
    if (!hasRequiredFields) {
      throw new Error('Please complete all required profile fields before submitting a request.');
    }
    
    // Convert file to base64 if provided
    let imageData = null;
    if (formData.proof) {
      imageData = await convertFileToBase64(formData.proof);
    }
    
    // Format preferred date and time
    const dateTime = new Date(formData.preferredDateTime);
    
    // Prepare request payload according to backend structure
    const requestPayload = {
      issue: formData.issueType,
      description: formData.description,
      Urgeny: formData.urgencyLevel,
      status: 'PENDING', // Default status for new requests
      date: dateTime.toISOString().split('T')[0] + 'T00:00:00', // Format as LocalDateTime
      time: dateTime.toISOString(), // Full date and time
      category: formData.listType,
      image: imageData ? imageData.split(',')[1] : null, // Extract base64 content without prefix
      email: userProfile.email // Include user email from profile
    };
    
    console.log('Sending maintenance request:', requestPayload);
    
    // Send request to maintenance endpoint with email as request parameter
    const response = await fetch(`http://172.18.219.69:8081/api/maintenance?email=${encodeURIComponent(userProfile.email)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit maintenance request');
    }
    
    const result = await response.json();
    console.log('Maintenance request submitted successfully:', result);
    return result;
  } catch (error) {
    console.error('Error submitting maintenance request:', error);
    throw error;
  }
};

// Helper function to convert file to base64
const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export const getUserRequests = async () => {
  try {
    // Get user profile from localStorage
    const userProfileString = localStorage.getItem('userProfile');
    if (!userProfileString) {
      throw new Error('User profile not found. Please complete your profile first.');
    }
    
    // Parse user profile to get email
    const userProfile = JSON.parse(userProfileString);
    if (!userProfile.email) {
      throw new Error('User email not found. Please complete your profile.');
    }

    // Fetch requests based on user email from localStorage
    const response = await fetch(`http://172.18.219.69:8081/api/maintenance/user?email=${encodeURIComponent(userProfile.email)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        // No requests found is not an error, just return empty array
        return [];
      }
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch maintenance requests');
    }

    const requests = await response.json();
    console.log('Fetched maintenance requests:', requests);
    return requests;
  } catch (error) {
    console.error('Error fetching maintenance requests:', error);
    throw error;
  }
}; 
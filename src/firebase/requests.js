import { auth } from './config';

// API endpoint for maintenance requests
const API_BASE_URL = 'http://localhost:8081/api';

// Function to submit a maintenance request
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
      urgency: formData.urgencyLevel,
      status: 'PENDING', // Default status for new requests
      date: dateTime.toISOString().split('T')[0] + 'T00:00:00', // Format as LocalDateTime
      time: dateTime.toISOString(), // Full date and time
      category: formData.listType,
      image: imageData ? imageData.split(',')[1] : null, // Extract base64 content without prefix
      
    };

    console.log('Sending maintenance request:', requestPayload);

    // Send maintenance request with email as a request parameter
    const maintenanceResponse = await fetch(`http://localhost:8081/api/maintenance?email=${encodeURIComponent(userProfile.email)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    });

    if (!maintenanceResponse.ok) {
      const errorData = await maintenanceResponse.json();
      throw new Error(errorData.message || 'Failed to submit maintenance request');
    }

    const maintenanceResult = await maintenanceResponse.json();
    console.log('Maintenance request submitted successfully:', maintenanceResult);
    
    // Return the maintenance request result including the ticket ID
    return maintenanceResult;
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

// Function to get all maintenance requests for the user
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

    console.log('Fetching maintenance requests for email:', userProfile.email);

    // Fetch requests based on user email from localStorage
    const response = await fetch(`http://localhost:8081/api/maintenance/user?email=${encodeURIComponent(userProfile.email)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        // No requests found is not an error, just return empty array
        console.log('No maintenance requests found for this user');
        return [];
      }
      
      // Try to get the error details as text
      const errorText = await response.text();
      console.error('Error response from server:', errorText);
      
      // Check if the error is related to PostgreSQL Large Objects
      if (errorText.includes('Large Objects may not be used in auto-commit mode')) {
        console.warn('Server database configuration issue detected. This is a backend issue that needs to be fixed by the administrator.');
        // Return an empty array to prevent the UI from breaking
        return [];
      }
      
      // For other errors, try to parse JSON or provide a fallback error message
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || 'Failed to fetch maintenance requests');
      } catch (e) {
        // If we can't parse JSON, use the raw error text
        throw new Error(`Failed to fetch maintenance requests: ${errorText || response.statusText}`);
      }
    }

    const requests = await response.json();
    console.log('Fetched maintenance requests:', requests);
    return requests;
  } catch (error) {
    console.error('Error fetching maintenance requests:', error);
    
    // If error is related to the PostgreSQL Large Objects issue, return empty array
    // This prevents the UI from breaking completely
    if (error.message && error.message.includes('Large Objects may not be used in auto-commit mode')) {
      console.warn('Handling PostgreSQL Large Objects error gracefully. Returning empty requests array.');
      return [];
    }
    
    throw error;
  }
};

// Function to get a single maintenance request by ID
export const getRequestById = async (requestId) => {
  try {
    console.log(`Fetching maintenance request with ID: ${requestId}`);

    // Send the GET request to the backend endpoint
    const response = await fetch(`http://localhost:8081/api/maintenance/${requestId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    // Check if the request was successful
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Maintenance request not found');
      }
      
      const errorText = await response.text();
      console.error('Request failed with status:', response.status);
      console.error('Error response:', errorText);
      
      // Check if the error is related to PostgreSQL Large Objects
      if (errorText.includes('Large Objects may not be used in auto-commit mode')) {
        throw new Error('Unable to load request details due to a server database configuration issue. Please contact support.');
      }
      
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || 'Failed to fetch maintenance request');
      } catch (parseError) {
        throw new Error(errorText || 'Failed to fetch maintenance request');
      }
    }

    // Parse and return the response data
    const data = await response.json();
    console.log('Maintenance request fetched successfully:', data);
    return data;
    
  } catch (error) {
    console.error('Error fetching maintenance request:', error);
    throw error;
  }
}; 
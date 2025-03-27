import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../firebase/auth';

// Protected route component that redirects to login if not authenticated
const AuthRoute = ({ children }) => {
  const { user, loading, hasProfile } = useAuth();
  const location = useLocation();
  const isProfilePage = location.pathname === '/profile';

  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // If user is not logged in, redirect to home page
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Special handling for profile page
  if (isProfilePage) {
    // If user has profile and tries to access profile page, redirect to dashboard
    if (hasProfile) {
      return <Navigate to="/dashboard" replace />;
    }
    // If user doesn't have profile, allow access to profile page
    return children;
  }

  // For all other protected routes
  // If user is logged in but hasn't completed their profile, redirect to profile page
  if (!hasProfile) {
    return <Navigate to="/profile" replace />;
  }

  // If user is logged in and has completed their profile, show the protected content
  return children;
};

export default AuthRoute; 
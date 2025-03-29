import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './firebase/auth';
import Home from './pages/Home';
import Profile from './pages/Profile';
import AdminProfile from './pages/AdminProfile';
import Dashboard from './pages/Dashboard';
import MaintenanceRequest from './pages/MaintenanceRequest';
import RequestStatus from './pages/RequestStatus';
import RequestDetails from './pages/RequestDetails';
import AdminDashboard from './components/admin/AdminDashboard';
import AuthRoute from './components/AuthRoute';
import './App.css';

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  if (!user || !isAdmin) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />

          {/* Protected Student Routes */}
          <Route
            path="/profile"
            element={
              <AuthRoute>
                <Profile />
              </AuthRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <AuthRoute>
                <Dashboard />
              </AuthRoute>
            }
          />
          <Route
            path="/maintenance-request"
            element={
              <AuthRoute>
                <MaintenanceRequest />
              </AuthRoute>
            }
          />
          <Route
            path="/request-status"
            element={
              <AuthRoute>
                <RequestStatus />
              </AuthRoute>
            }
          />
          <Route
            path="/request/:id"
            element={
              <AuthRoute>
                <RequestDetails />
              </AuthRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/profile"
            element={
              <AdminRoute>
                <AdminProfile />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

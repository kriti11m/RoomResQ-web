import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './firebase/auth';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import MaintenanceRequest from './pages/MaintenanceRequest';
import RequestStatus from './pages/RequestStatus';
import RequestDetails from './pages/RequestDetails';
import AdminDashboard from './components/admin/AdminDashboard';
import AuthRoute from './components/AuthRoute';
import './App.css';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  // Check if user is admin (only allow kritim724@gmail.com)
  const isAdmin = user?.email === 'kritim724@gmail.com';
  
  if (!user) {
    return <Navigate to="/" />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
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
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

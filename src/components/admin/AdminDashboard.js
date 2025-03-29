import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportType, setReportType] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const fetchAdminProfile = async () => {
    if (!user?.uid) return;
    
    try {
      const response = await fetch(`http://localhost:8081/api/admin/profile/${user.uid}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const profileData = await response.json();
        setProfileData(profileData);
        // Store in localStorage as fallback
        localStorage.setItem('userProfile', JSON.stringify(profileData));
        // After getting profile, fetch maintenance requests
        fetchMaintenanceRequests(profileData.block);
      } else {
        // Fallback to localStorage if backend request fails
        const storedProfile = localStorage.getItem('userProfile');
        if (storedProfile) {
          try {
            const profile = JSON.parse(storedProfile);
            if (profile.firebaseUid === user.uid) {
              setProfileData(profile);
              // Use stored profile block to fetch maintenance requests
              fetchMaintenanceRequests(profile.block);
            }
          } catch (error) {
            console.error('Error parsing stored profile:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      setError('Failed to fetch admin profile. Please try again later.');
    }
  };

  const fetchMaintenanceRequests = async (adminBlock) => {
    if (!adminBlock) {
      setError('Admin block not found. Please complete your profile.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:8081/api/admin/${adminBlock}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.status === 404) {
        setMaintenanceRequests([]);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch maintenance requests');
      }
      
      const requests = await response.json();
      console.log('Maintenance requests from backend:', requests);
      
      // Log the user data in the requests to verify the format
      requests.forEach((request, index) => {
        console.log(`Request #${index + 1} user data:`, request.user);
      });
      
      setMaintenanceRequests(requests);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
      setError('Failed to fetch maintenance requests. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.uid) {
      fetchAdminProfile();
    }
  }, [user]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      // Handle backend format like "2025-04-05 00:00:00.000000"
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) return 'N/A';
      
      // Return formatted date (Apr 5, 2025)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };
  
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    
    try {
      // Handle backend format like "2025-04-05 12:10:00.000000"
      const date = new Date(dateTimeString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) return 'N/A';
      
      // Return formatted date and time (Apr 5, 2025, 12:10 PM)
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting date time:', error);
      return 'N/A';
    }
  };

  const formatType = (request) => {
    // Use issue field for type, fall back to type if issue is not available
    const issueValue = request.issue || request.type || 'N/A';
    if (!issueValue) return 'N/A';
    // Capitalize first letter and format issue string
    return issueValue.charAt(0).toUpperCase() + issueValue.slice(1).toLowerCase();
  };

  const generateReport = (type) => {
    switch (type) {
      case 'student':
        return generateStudentReport();
      case 'monthly':
        return generateMonthlyReport();
      case 'weekly':
        return generateWeeklyReport();
      case 'type':
        return generateTypeReport();
      default:
        return generateAllReport();
    }
  };

  const generateStudentReport = () => {
    // Group requests by student
    const studentReport = maintenanceRequests.reduce((acc, request) => {
      const student = request.studentName || 'Unknown';
      if (!acc[student]) {
        acc[student] = [];
      }
      acc[student].push({
        ...request,
        formattedDate: formatDate(request.createdAt || request.date),
        formattedDateTime: formatDateTime(request.createdAt || request.time),
        formattedType: formatType(request)
      });
      return acc;
    }, {});

    return studentReport;
  };

  const generateMonthlyReport = () => {
    // Group requests by month
    const monthlyReport = maintenanceRequests.reduce((acc, request) => {
      const date = new Date(request.createdAt || request.date || request.time);
      const monthYear = isNaN(date.getTime()) ? 
        'Unknown Date' : 
        `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push({
        ...request,
        formattedDate: formatDate(request.createdAt || request.date),
        formattedDateTime: formatDateTime(request.createdAt || request.time),
        formattedType: formatType(request)
      });
      return acc;
    }, {});

    return monthlyReport;
  };

  const generateWeeklyReport = () => {
    // Group requests by week
    const weeklyReport = maintenanceRequests.reduce((acc, request) => {
      const date = new Date(request.createdAt || request.date || request.time);
      const weekNumber = getWeekNumber(date);
      if (!acc[weekNumber]) {
        acc[weekNumber] = [];
      }
      acc[weekNumber].push({
        ...request,
        formattedDate: formatDate(request.createdAt || request.date),
        formattedDateTime: formatDateTime(request.createdAt || request.time),
        formattedType: formatType(request)
      });
      return acc;
    }, {});

    return weeklyReport;
  };

  const generateTypeReport = () => {
    // Group requests by type
    const typeReport = maintenanceRequests.reduce((acc, request) => {
      const type = request.type || 'Unknown';
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(request);
      return acc;
    }, {});

    return typeReport;
  };

  const generateAllReport = () => {
    return maintenanceRequests;
  };

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const exportToExcel = (data) => {
    let worksheet;
    
    if (reportType === 'student') {
      // Convert student report to flat structure
      const flatData = Object.entries(data).flatMap(([student, requests]) =>
        requests.map(request => ({
          Student: student,
          Date: request.formattedDateTime || formatDateTime(request.createdAt || request.time),
          Type: formatType(request),
          Status: request.status,
          Description: request.description
        }))
      );
      worksheet = XLSX.utils.json_to_sheet(flatData);
    } else if (reportType === 'monthly' || reportType === 'weekly') {
      // Convert time-based report to flat structure
      const flatData = Object.entries(data).flatMap(([period, requests]) =>
        requests.map(request => ({
          Period: period,
          Student: request.studentName,
          Date: request.formattedDateTime || formatDateTime(request.createdAt || request.time),
          Type: formatType(request),
          Status: request.status,
          Description: request.description
        }))
      );
      worksheet = XLSX.utils.json_to_sheet(flatData);
    } else {
      // All requests
      const flatData = data.map(request => ({
        Date: formatDateTime(request.createdAt || request.time),
        Student: request.studentName,
        Type: formatType(request),
        Status: request.status,
        Description: request.description
      }));
      worksheet = XLSX.utils.json_to_sheet(flatData);
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Maintenance Requests');
    
    // Generate Excel file
    XLSX.writeFile(workbook, `maintenance_report_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = (data) => {
    const doc = new jsPDF();
    let tableData = [];

    if (reportType === 'student') {
      // Convert student report to table data
      tableData = Object.entries(data).flatMap(([student, requests]) =>
        requests.map(request => [
          student,
          request.formattedDateTime || formatDateTime(request.createdAt || request.time),
          formatType(request),
          request.status,
          request.description
        ])
      );
    } else if (reportType === 'monthly' || reportType === 'weekly') {
      // Convert time-based report to table data
      tableData = Object.entries(data).flatMap(([period, requests]) =>
        requests.map(request => [
          period,
          request.studentName,
          request.formattedDateTime || formatDateTime(request.createdAt || request.time),
          formatType(request),
          request.status,
          request.description
        ])
      );
    } else if (reportType === 'type') {
      // Convert type report to table data
      tableData = Object.entries(data).flatMap(([type, requests]) =>
        requests.map(request => [
          type,
          request.studentName,
          request.formattedDateTime || formatDateTime(request.createdAt || request.time),
          request.status,
          request.description
        ])
      );
    } else {
      // All requests
      tableData = data.map(request => [
        formatDateTime(request.createdAt || request.time),
        request.studentName,
        formatType(request),
        request.status,
        request.description
      ]);
    }

    // Add title
    doc.setFontSize(16);
    doc.text('Maintenance Requests Report', 14, 15);
    doc.setFontSize(10);

    // Add report type and date
    doc.setFontSize(12);
    doc.text(`Report Type: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`, 14, 25);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);
    doc.setFontSize(10);

    // Define table columns based on report type
    const columns = reportType === 'student' ? 
      ['Student', 'Date & Time', 'Type', 'Status', 'Description'] :
      reportType === 'monthly' || reportType === 'weekly' ?
      ['Period', 'Student', 'Date & Time', 'Type', 'Status', 'Description'] :
      reportType === 'type' ?
      ['Type', 'Student', 'Date & Time', 'Status', 'Description'] :
      ['Date & Time', 'Student', 'Type', 'Status', 'Description'];

    // Generate table 
    autoTable(doc, {
      head: [columns],
      body: tableData,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [147, 51, 234] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 25 },
        2: { cellWidth: 30 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 'auto' }
      }
    });

    // Save PDF
    doc.save(`maintenance_report_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Add a function to handle View button click
  const handleViewRequest = (requestId) => {
    navigate(`/admin/request/${requestId}`);
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={fetchAdminProfile} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <h1 className="dashboard-title">RoomResQ Admin</h1>
        
        <div className="profile-container">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="profile-button"
          >
            <div className="profile-info">
              <div className="avatar">
                {profileData?.name?.charAt(0) || user?.displayName?.charAt(0) || 'A'}
              </div>
              <div className="user-details">
                <div className="user-name">
                  {profileData?.name || user?.displayName || 'Admin'}
                </div>
                <div className="user-email">
                  {profileData?.email || user?.email}
                </div>
              </div>
            </div>
            <span className="dropdown-arrow">▼</span>
          </button>

          <AnimatePresence>
            {isProfileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="profile-dropdown"
              >
                {profileData && (
                  <div className="profile-details">
                    <div className="profile-avatar-container">
                      <div className="profile-avatar-large">
                        {profileData.name?.charAt(0) || user?.displayName?.charAt(0) || 'A'}
                      </div>
                    </div>
                    <div className="profile-info-row">
                      <strong>Name:</strong> {profileData.name}
                    </div>
                    <div className="profile-info-row">
                      <strong>Email:</strong> {profileData.email}
                    </div>
                    <div className="profile-info-row">
                      <strong>Hostel:</strong> {profileData.hostelType}
                    </div>
                    <div className="profile-info-row">
                      <strong>Block:</strong> {profileData.block}
                    </div>
                  </div>
                )}
                <div className="profile-actions">
                  <button className="profile-action-button">
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <div className="dashboard-layout">
        {/* Sidebar Navigation */}
        <nav className="dashboard-sidebar">
          <Link
            to="/admin/dashboard"
            className={`sidebar-link ${isActive('/admin/dashboard') ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link
            to="/admin/requests"
            className={`sidebar-link ${isActive('/admin/requests') ? 'active' : ''}`}
          >
            Maintenance Requests
          </Link>
          <Link
            to="/admin/users"
            className={`sidebar-link ${isActive('/admin/users') ? 'active' : ''}`}
          >
            Manage Users
          </Link>
        </nav>

        {/* Main Content */}
        <main className="dashboard-main">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Requests</h3>
                <p className="stat-value primary">
                  {maintenanceRequests.length}
                </p>
              </div>
              <div className="stat-card">
                <h3>Pending</h3>
                <p className="stat-value pending">
                  {maintenanceRequests.filter(req => req.status === 'pending').length}
                </p>
              </div>
              <div className="stat-card">
                <h3>In Progress</h3>
                <p className="stat-value in-progress">
                  {maintenanceRequests.filter(req => req.status === 'in-progress').length}
                </p>
              </div>
              <div className="stat-card">
                <h3>Completed</h3>
                <p className="stat-value completed">
                  {maintenanceRequests.filter(req => req.status === 'completed').length}
                </p>
              </div>
            </div>

            {/* Report Controls */}
            <div className="report-controls">
              <select 
                value={reportType} 
                onChange={(e) => setReportType(e.target.value)}
                className="report-select"
              >
                <option value="all">All Requests</option>
                <option value="student">Student-wise Report</option>
                <option value="monthly">Monthly Report</option>
                <option value="weekly">Weekly Report</option>
                <option value="type">Type-wise Report</option>
              </select>

              <div className="date-range">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="date-input"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="date-input"
                />
              </div>

              <div className="export-buttons">
                <button 
                  onClick={() => exportToExcel(generateReport(reportType))}
                  className="export-button"
                >
                  Export to Excel
                </button>
                <button 
                  onClick={() => exportToPDF(generateReport(reportType))}
                  className="export-button"
                >
                  Export to PDF
                </button>
              </div>
            </div>

            {/* Requests Table */}
            <div className="requests-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Student</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenanceRequests.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="no-data">No maintenance requests found</td>
                    </tr>
                  ) : (
                    maintenanceRequests.map((request) => {
                      return (
                        <tr key={request.ticketid || request.id}>
                          <td>{formatDateTime(request.time || request.createdAt)}</td>
                          <td className="student-cell">
                            <div className="student-info">
                              <span className="student-name">
                                {request.user?.name || 'N/A'}
                              </span>
                              {request.user && (
                                <div className="student-details-inline">
                                  <span className="student-room">Room: {request.user.roomNo || 'N/A'}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td>{formatType(request)}</td>
                          <td>
                            <span className={`status-badge status-${request.status}`}>
                              {request.status || 'pending'}
                            </span>
                          </td>
                          <td>{request.description || 'No description'}</td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className="action-button view"
                                onClick={() => handleViewRequest(request.ticketid || request.id)}
                              >
                                View
                              </button>
                              <button className="action-button edit">Update</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard; 
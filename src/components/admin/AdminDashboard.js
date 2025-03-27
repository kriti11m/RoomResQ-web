import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportType, setReportType] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  useEffect(() => {
    fetchMaintenanceRequests();
  }, []);

  const fetchMaintenanceRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const querySnapshot = await getDocs(collection(db, 'maintenanceRequests'));
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMaintenanceRequests(requests);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
      setError('Failed to fetch maintenance requests. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
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
      acc[student].push(request);
      return acc;
    }, {});

    return studentReport;
  };

  const generateMonthlyReport = () => {
    // Group requests by month
    const monthlyReport = maintenanceRequests.reduce((acc, request) => {
      const date = new Date(request.createdAt?.toDate());
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      if (!acc[monthYear]) {
        acc[monthYear] = [];
      }
      acc[monthYear].push(request);
      return acc;
    }, {});

    return monthlyReport;
  };

  const generateWeeklyReport = () => {
    // Group requests by week
    const weeklyReport = maintenanceRequests.reduce((acc, request) => {
      const date = new Date(request.createdAt?.toDate());
      const weekNumber = getWeekNumber(date);
      if (!acc[weekNumber]) {
        acc[weekNumber] = [];
      }
      acc[weekNumber].push(request);
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
          Date: request.createdAt?.toDate().toLocaleDateString(),
          Type: request.type,
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
          Type: request.type,
          Status: request.status,
          Description: request.description
        }))
      );
      worksheet = XLSX.utils.json_to_sheet(flatData);
    } else if (reportType === 'type') {
      // Convert type report to flat structure
      const flatData = Object.entries(data).flatMap(([type, requests]) =>
        requests.map(request => ({
          Type: type,
          Student: request.studentName,
          Date: request.createdAt?.toDate().toLocaleDateString(),
          Status: request.status,
          Description: request.description
        }))
      );
      worksheet = XLSX.utils.json_to_sheet(flatData);
    } else {
      // All requests
      const flatData = data.map(request => ({
        Date: request.createdAt?.toDate().toLocaleDateString(),
        Student: request.studentName,
        Type: request.type,
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
          request.createdAt?.toDate().toLocaleDateString(),
          request.type,
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
          request.type,
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
          request.createdAt?.toDate().toLocaleDateString(),
          request.status,
          request.description
        ])
      );
    } else {
      // All requests
      tableData = data.map(request => [
        request.createdAt?.toDate().toLocaleDateString(),
        request.studentName,
        request.type,
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
      ['Student', 'Date', 'Type', 'Status', 'Description'] :
      reportType === 'monthly' || reportType === 'weekly' ?
      ['Period', 'Student', 'Type', 'Status', 'Description'] :
      reportType === 'type' ?
      ['Type', 'Student', 'Date', 'Status', 'Description'] :
      ['Date', 'Student', 'Type', 'Status', 'Description'];

    // Generate table
    doc.autoTable({
      head: [columns],
      body: tableData,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [0, 123, 255] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 'auto' }
      }
    });

    // Save PDF
    doc.save(`maintenance_report_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Loading maintenance requests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error">
          {error}
          <button onClick={fetchMaintenanceRequests} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      <div className="report-controls">
        <select 
          value={reportType} 
          onChange={(e) => setReportType(e.target.value)}
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
          />
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          />
        </div>

        <div className="export-buttons">
          <button onClick={() => exportToExcel(generateReport(reportType))}>
            Export to Excel
          </button>
          <button onClick={() => exportToPDF(generateReport(reportType))}>
            Export to PDF
          </button>
        </div>
      </div>

      <div className="requests-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Student</th>
              <th>Type</th>
              <th>Status</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {maintenanceRequests.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">No maintenance requests found</td>
              </tr>
            ) : (
              maintenanceRequests.map((request) => (
                <tr key={request.id}>
                  <td>{request.createdAt?.toDate().toLocaleDateString()}</td>
                  <td>{request.studentName}</td>
                  <td>{request.type}</td>
                  <td>{request.status}</td>
                  <td>{request.description}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard; 
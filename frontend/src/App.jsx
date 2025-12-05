import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard pages
import AdminDashboard from './pages/dashboards/AdminDashboard';
import DoctorDashboard from './pages/dashboards/DoctorDashboard';
import PatientDashboard from './pages/dashboards/PatientDashboard';

// Feature pages
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Visits from './pages/Visits';
import Prescriptions from './pages/Prescriptions';
import MedicalRecords from './pages/MedicalRecords';
import AIAnalytics from './pages/AIAnalytics';
import Profile from './pages/Profile';
import VideoCall from './pages/VideoCall';
import NotFound from './pages/NotFound';

// Layout
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { user } = useAuth();

  const getDashboardByRole = () => {
    if (!user) return <Navigate to="/login" replace />;
    
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'doctor':
        return <DoctorDashboard />;
      case 'patient':
        return <PatientDashboard />;
      default:
        return <Navigate to="/login" replace />;
    }
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Video call route - outside layout for fullscreen */}
      <Route 
        path="/video-call/:roomId" 
        element={
          <ProtectedRoute>
            <VideoCall />
          </ProtectedRoute>
        } 
      />

      {/* Protected routes */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={getDashboardByRole()} />
        
        {/* Admin & Doctor routes */}
        <Route 
          path="patients" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'doctor']}>
              <Patients />
            </ProtectedRoute>
          } 
        />
        
        {/* All authenticated users */}
        <Route path="appointments" element={<Appointments />} />
        <Route path="visits" element={<Visits />} />
        <Route path="prescriptions" element={<Prescriptions />} />
        <Route path="records" element={<MedicalRecords />} />
        <Route path="profile" element={<Profile />} />
        
        {/* AI Analytics - placeholder for your team */}
        <Route 
          path="ai-analytics" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'doctor']}>
              <AIAnalytics />
            </ProtectedRoute>
          } 
        />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;

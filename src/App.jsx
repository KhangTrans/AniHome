import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ShelterDashboard from './pages/ShelterDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import UserLandingPage from './pages/UserLandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ShelterListPage from './pages/ShelterListPage';
import ShelterDetailPage from './pages/ShelterDetailPage';
import BlogListPage from './pages/BlogListPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their appropriate dashboard if they try to access unauthorized pages
    if (user.role === 'super_admin') return <Navigate to="/admin" replace />;
    if (user.role === 'shelter_admin') return <Navigate to="/shelter" replace />;
    if (user.role === 'volunteer') return <Navigate to="/volunteer" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

// Redirect root to dashboard if logged in
const RootRedirect = () => {
  const { user } = useAuth();
  if (user) {
    if (user.role === 'super_admin') return <Navigate to="/admin" replace />;
    if (user.role === 'shelter_admin') return <Navigate to="/shelter" replace />;
    if (user.role === 'volunteer') return <Navigate to="/volunteer" replace />;
    // Adopters stay on landing page but logged in
  }
  return <UserLandingPage />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/" element={<RootRedirect />} />
          <Route path="/shelters" element={<ShelterListPage />} />
          <Route path="/shelters/:id" element={<ShelterDetailPage />} />
          <Route path="/blog" element={<BlogListPage />} />
          
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/shelter/*" 
            element={
              <ProtectedRoute allowedRoles={['shelter_admin']}>
                <ShelterDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/volunteer/*" 
            element={
              <ProtectedRoute allowedRoles={['volunteer']}>
                <VolunteerDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

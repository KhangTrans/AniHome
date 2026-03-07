import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Protected Route Component
 * Bảo vệ routes yêu cầu authentication và phân quyền
 */
export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '1.2rem',
        color: 'var(--gray)'
      }}>
        Loading...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role permissions if specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.roleID)) {
    // Redirect to appropriate page based on user's role
    switch (user.roleID) {
      case 1: // Super Admin
        return <Navigate to="/admin" replace />;
      case 2: // Shelter Admin
        return <Navigate to="/shelter" replace />;
      case 3: // Volunteer
        return <Navigate to="/volunteer" replace />;
      default: // User
        return <Navigate to="/" replace />;
    }
  }

  // Render the protected component
  return children;
};

/**
 * Public Only Route Component
 * Chỉ cho phép truy cập khi CHƯA đăng nhập
 * (Ví dụ: Login, Register pages)
 */
export const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    // Redirect authenticated users based on their role
    switch (user.roleID) {
      case 1:
        return <Navigate to="/admin" replace />;
      case 2:
        return <Navigate to="/shelter" replace />;
      case 3:
        return <Navigate to="/volunteer" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

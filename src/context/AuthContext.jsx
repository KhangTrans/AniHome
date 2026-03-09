import React, { createContext, useState, useContext } from 'react';
import * as publicAuthService from '../services/public/authService';
import * as userService from '../services/user/userService';

const AuthContext = createContext(null);

// Helper: Map roleID to role string
const mapRoleIDToRole = (roleID) => {
  const roleMap = {
    1: 'super_admin',
    2: 'shelter_admin',
    3: 'volunteer',
    4: 'user'
  };
  return roleMap[roleID] || 'user';
};

// Helper: Enhance user with role string
const enhanceUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    role: mapRoleIDToRole(user.roleID)
  };
};

export const AuthProvider = ({ children }) => {
  // Initialize user from localStorage on mount
  const [user, setUser] = useState(() => {
    const storedUser = publicAuthService.getCurrentUser();
    const isAuth = publicAuthService.isAuthenticated();
    return (isAuth && storedUser) ? enhanceUser(storedUser) : null;
  });
  const loading = false;

  /**
   * Đăng nhập
   * @param {string} usernameOrEmail - Username hoặc Email
   * @param {string} password - Password
   */
  const login = async (usernameOrEmail, password) => {
    try {
      const result = await publicAuthService.login(usernameOrEmail, password);
      
      if (result.success) {
        const enhancedUser = enhanceUser(result.data.user);
        setUser(enhancedUser);
        return { 
          success: true, 
          role: result.data.user.roleID,
          user: enhancedUser 
        };
      }
      
      return { 
        success: false, 
        message: result.error || 'Invalid credentials' 
      };
    } catch {
      return { 
        success: false, 
        message: 'Login failed. Please try again.' 
      };
    }
  };

  /**
   * Đăng ký tài khoản mới
   * @param {Object} userData - Dữ liệu đăng ký
   */
  const register = async (userData) => {
    try {
      const result = await publicAuthService.register(userData);
      
      if (result.success) {
        // Backend không trả về token/user info sau khi register
        // User cần login sau khi đăng ký thành công
        return { 
          success: true,
          message: result.message || 'Registration successful. Please login.',
          needLogin: true,
        };
      }
      
      return { 
        success: false, 
        message: result.error || 'Registration failed' 
      };
    } catch {
      return { 
        success: false, 
        message: 'Registration failed. Please try again.' 
      };
    }
  };

  /**
   * Đăng nhập bằng Google
   * @param {string} idToken - Google ID Token
   */
  const loginWithGoogle = async (idToken) => {
    try {
      const result = await publicAuthService.loginWithGoogle(idToken);
      
      if (result.success) {
        const enhancedUser = enhanceUser(result.data.user);
        setUser(enhancedUser);
        return { 
          success: true, 
          role: result.data.user.roleID,
          user: enhancedUser 
        };
      }
      
      return { 
        success: false, 
        message: result.error || 'Google login failed' 
      };
    } catch {
      return { 
        success: false, 
        message: 'Google login failed. Please try again.' 
      };
    }
  };

  /**
   * Đăng xuất
   */
  const logout = async () => {
    try {
      if (user && user.id) {
        // Call logout API (User service - requires auth)
        await userService.logout(user.id);
      } else {
        // Just clear local storage
        publicAuthService.clearAuthData();
      }
      setUser(null);
    } catch {
      // Clear user anyway
      publicAuthService.clearAuthData();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      register,
      loginWithGoogle,
      loading,
      isAuthenticated: !!user 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

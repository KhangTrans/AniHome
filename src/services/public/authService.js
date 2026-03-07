import axiosInstance from '../axiosConfig';

/**
 * 🔓 PUBLIC AUTH APIs - /api/auth
 * Không cần authentication (Register & Login)
 */

/**
 * POST /api/auth/register
 * Đăng ký tài khoản mới
 */
export const register = async (userData) => {
  try {
    const response = await axiosInstance.post('/auth/register', {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      confirmNewPassword: userData.confirmNewPassword,
      fullName: userData.fullName,
    });
    
    // Lưu token và user info
    const { accessToken, refreshToken, user } = response.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Registration failed',
    };
  }
};

/**
 * POST /api/auth/login
 * Đăng nhập
 */
export const login = async (usernameOrEmail, password) => {
  try {
    const response = await axiosInstance.post('/auth/login', {
      usernameOrEmail,
      password,
    });
    
    // Lưu token và user info
    const { accessToken, refreshToken, user } = response.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Login failed',
    };
  }
};

/**
 * POST /api/auth/google
 * Đăng nhập bằng Google (Requires Google OAuth Setup)
 */
export const loginWithGoogle = async (googleToken) => {
  try {
    const response = await axiosInstance.post('/auth/google', {
      token: googleToken,
    });
    
    const { accessToken, refreshToken, user } = response.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Google login failed',
    };
  }
};

/**
 * POST /api/auth/forgot-password
 * Gửi mã reset password qua email
 */
export const forgotPassword = async (email) => {
  try {
    const response = await axiosInstance.post('/auth/forgot-password', {
      email,
    });
    
    return {
      success: true,
      message: response.data.message || 'Reset code sent to your email',
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to send reset code',
    };
  }
};

/**
 * POST /api/auth/reset-password
 * Reset password với mã xác thực
 */
export const resetPassword = async (resetData) => {
  try {
    const response = await axiosInstance.post('/auth/reset-password', {
      email: resetData.email,
      token: resetData.token,
      newPassword: resetData.newPassword,
      confirmNewPassword: resetData.confirmNewPassword,
    });
    
    return {
      success: true,
      message: response.data.message || 'Password reset successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to reset password',
    };
  }
};

/**
 * Utility: Get current user from localStorage
 */
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    return null;
  }
};

/**
 * Utility: Get access token
 */
export const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

/**
 * Utility: Get refresh token
 */
export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

/**
 * Utility: Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getAccessToken() && !!getCurrentUser();
};

/**
 * Utility: Clear auth data (for logout)
 */
export const clearAuthData = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

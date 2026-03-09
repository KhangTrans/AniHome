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
    const payload = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      confirmNewPassword: userData.confirmNewPassword,
      fullName: userData.fullName,
    };
    
    const response = await axiosInstance.post('/Auth/register', payload);
    
    // Backend trả về format: { message: "Đăng ký tài khoản thành công!" }
    // Không có token và user info ngay lập tức
    // User cần login sau khi đăng ký
    
    return {
      success: true,
      data: response.data,
      message: response.data.message || 'Registration successful',
      needLogin: true, // Flag để frontend biết cần redirect đến login
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data?.title || 'Registration failed',
      details: error.response?.data?.errors || error.response?.data,
    };
  }
};

/**
 * POST /api/Auth/login
 * Đăng nhập
 */
export const login = async (usernameOrEmail, password) => {
  try {
    const payload = {
      usernameOrEmail,
      password,
    };
    
    const response = await axiosInstance.post('/Auth/login', payload);
    
    // Backend trả về: { accessToken, refreshToken, fullName, avatarURL }
    const { accessToken, refreshToken, fullName, avatarURL } = response.data;
    
    // Decode JWT để lấy thông tin user (bao gồm roleID)
    let roleID = 4; // Default: User thường
    let userId = null;
    
    try {
      const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
      
      // Backend có thể lưu role/roleId/RoleId trong token
      roleID = tokenPayload.roleId || tokenPayload.RoleId || tokenPayload.role || 4;
      userId = tokenPayload.userId || tokenPayload.UserId || tokenPayload.sub || null;
    } catch {
      // Use default roleID = 4 if token decode fails
    }

    // Extract shelterID from token if available
    let shelterID = null;
    try {
      const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
      shelterID = tokenPayload.shelterID || tokenPayload.shelterId || tokenPayload.ShelterId || null;
    } catch {
      // shelterID not available in token
    }
    
    // Tạo user object từ response
    const user = {
      userId,
      fullName,
      avatarURL,
      usernameOrEmail,
      roleID,
      shelterID,
    };
    
    // Lưu vào localStorage
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return {
      success: true,
      data: {
        accessToken,
        refreshToken,
        user,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Sai tài khoản hoặc mật khẩu',
    };
  }
};

/**
 * POST /api/auth/google-login
 * Đăng nhập bằng Google (Requires Google OAuth Setup)
 */
export const loginWithGoogle = async (googleToken) => {
  try {
    const response = await axiosInstance.post('/auth/google-login', {
      idToken: googleToken,
    });
    
    // Backend trả về format tương tự login: { accessToken, refreshToken, fullName, avatarURL }
    const { accessToken, refreshToken, fullName, avatarURL } = response.data;
    
    // Decode JWT để lấy thông tin user
    let roleID = 4;
    let userId = null;
    
    try {
      const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
      roleID = tokenPayload.roleId || tokenPayload.RoleId || tokenPayload.role || 4;
      userId = tokenPayload.userId || tokenPayload.UserId || tokenPayload.sub || null;
    } catch {
      // Use default roleID = 4 if token decode fails
    }
    
    const user = {
      userId,
      fullName,
      avatarURL,
      roleID,
    };
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return {
      success: true,
      data: {
        accessToken,
        refreshToken,
        user,
      },
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
    const response = await axiosInstance.post('/Auth/forgot-password', {
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
    const response = await axiosInstance.post('/Auth/reset-password', {
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
  } catch {
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

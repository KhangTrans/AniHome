import axiosInstance from '../axiosConfig';

/**
 * 👤 USER APIs - Role: "User" (RoleID = 4)
 * /api/auth - Authenticated User Actions
 * Requires: accessToken in headers
 */

/**
 * POST /api/auth/change-password
 * Đổi mật khẩu
 * 
 * @param {Object} passwordData
 * @param {string} passwordData.currentPassword - Mật khẩu hiện tại
 * @param {string} passwordData.newPassword - Mật khẩu mới
 * @param {string} passwordData.confirmNewPassword - Xác nhận mật khẩu mới
 */
export const changePassword = async (passwordData) => {
  try {
    const response = await axiosInstance.post('/auth/change-password', {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
      confirmNewPassword: passwordData.confirmNewPassword,
    });
    
    return {
      success: true,
      data: response.data,
      message: 'Đổi mật khẩu thành công!',
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to change password',
    };
  }
};

/**
 * PUT /api/auth/update-profile
 * Cập nhật thông tin profile
 * 
 * @param {Object} profileData
 * @param {string} profileData.fullName - Họ tên
 * @param {string} profileData.email - Email
 * @param {string} profileData.phone - Số điện thoại (optional)
 * @param {string} profileData.address - Địa chỉ (optional)
 * @param {string} profileData.avatar - URL avatar (optional)
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await axiosInstance.put('/auth/update-profile', {
      fullName: profileData.fullName,
      email: profileData.email,
      phone: profileData.phone || '',
      address: profileData.address || '',
      avatar: profileData.avatar || '',
    });
    
    // Cập nhật user info trong localStorage
    const updatedUser = response.data;
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    return {
      success: true,
      data: updatedUser,
      message: 'Cập nhật profile thành công!',
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update profile',
    };
  }
};

/**
 * GET /api/auth/profile/{userId}
 * Xem thông tin profile của user
 * 
 * @param {number} userId - User ID
 */
export const getUserProfile = async (userId) => {
  try {
    const response = await axiosInstance.get(`/auth/profile/${userId}`);
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch user profile',
    };
  }
};

/**
 * POST /api/auth/refresh-token
 * Làm mới access token
 */
export const refreshToken = async () => {
  try {
    const refreshTokenStr = localStorage.getItem('refreshToken');
    
    if (!refreshTokenStr) {
      throw new Error('No refresh token found');
    }
    
    const response = await axiosInstance.post('/auth/refresh-token', {
      refreshToken: refreshTokenStr,
    });
    
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    
    // Cập nhật tokens
    localStorage.setItem('accessToken', accessToken);
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    }
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    // Clear auth data nếu refresh token failed
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    return {
      success: false,
      error: error.response?.data?.message || 'Token refresh failed',
    };
  }
};

/**
 * POST /api/auth/logout/{userId}
 * Đăng xuất
 * 
 * @param {number} userId - User ID
 */
export const logout = async (userId) => {
  try {
    await axiosInstance.post(`/auth/logout/${userId}`);
    
    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    return {
      success: true,
      message: 'Đăng xuất thành công!',
    };
  } catch (error) {
    // Vẫn clear local storage dù API fail
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    return {
      success: false,
      error: error.response?.data?.message || 'Logout failed',
    };
  }
};

/**
 * Utility: Validate password strength
 */
export const validatePassword = (password) => {
  const minLength = 6;
  
  if (!password) {
    return { isValid: false, error: 'Vui lòng nhập mật khẩu' };
  }
  
  if (password.length < minLength) {
    return { isValid: false, error: `Mật khẩu phải có ít nhất ${minLength} ký tự` };
  }
  
  // Check at least one letter and one number
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return { isValid: false, error: 'Mật khẩu phải có cả chữ và số' };
  }
  
  return { isValid: true };
};

/**
 * Utility: Validate profile data
 */
export const validateProfileData = (data) => {
  const errors = {};
  
  if (!data.fullName) errors.fullName = 'Vui lòng nhập họ tên';
  if (!data.email) errors.email = 'Vui lòng nhập email';
  
  // Email validation
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Email không hợp lệ';
  }
  
  // Phone validation (optional)
  if (data.phone && !/^[0-9]{10,11}$/.test(data.phone.replace(/\s/g, ''))) {
    errors.phone = 'Số điện thoại không hợp lệ';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

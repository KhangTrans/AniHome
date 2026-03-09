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
 * @param {number} passwordData.userId - ID của user
 * @param {string} passwordData.oldPassword - Mật khẩu hiện tại
 * @param {string} passwordData.newPassword - Mật khẩu mới
 * @param {string} passwordData.confirmNewPassword - Xác nhận mật khẩu mới
 */
export const changePassword = async (passwordData) => {
  try {
    const response = await axiosInstance.post('/Auth/change-password', {
      userId: passwordData.userId,
      oldPassword: passwordData.oldPassword,
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
 * @param {number} profileData.userId - ID của user
 * @param {string} profileData.fullName - Họ tên
 * @param {string} profileData.phone - Số điện thoại
 * @param {string} profileData.avatarUrl - URL avatar (đã upload)
 */
export const updateProfile = async (profileData) => {
  try {
    const payload = {
      userId: Number(profileData.userId),
      email: profileData.email,
      fullName: profileData.fullName,
      phone: profileData.phone || null,
      avatarUrl: profileData.avatarUrl || null,
    };
    
    console.log('📤 updateProfile payload:', JSON.stringify(payload, null, 2));
    
    const response = await axiosInstance.put('/Auth/update-profile', payload);
    
    const message = response.data.message || 'Cập nhật hồ sơ thành công!';
    return {
      success: true,
      message,
    };
  } catch (error) {
    console.error("Lỗi update profile raw: ", error); // In test ra FE
    // Extract ASP.NET validation errors if any
    let errorMessage = error.response?.data?.message || 'Failed to update profile';
    if (!error.response?.data?.message && error.response?.data?.errors) {
      const errors = error.response.data.errors;
      const firstKey = Object.keys(errors)[0];
      errorMessage = errors[firstKey][0];
    }

    return {
      success: false,
      error: errorMessage,
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
    const response = await axiosInstance.get(`/Auth/profile/${userId}`);
    
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
    
    const response = await axiosInstance.post('/Auth/refresh-token', {
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
    await axiosInstance.post(`/Auth/logout/${userId}`);
    
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

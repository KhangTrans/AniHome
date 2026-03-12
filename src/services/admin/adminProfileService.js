import axiosInstance from '../axiosConfig';

/**
 * ADMIN PROFILE API - /api/admin/profile 🛡️
 */

/**
 * GET /api/admin/profile
 * Lấy thông tin cá nhân của Admin
 */
export const getAdminProfile = async () => {
  try {
    const response = await axiosInstance.get('/admin/profile');
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch admin profile',
    };
  }
};

/**
 * PUT /api/admin/profile
 * Cập nhật thông tin cá nhân của Admin
 * 
 * @param {Object} profileData - Dữ liệu cập nhật
 * @param {string} profileData.fullName
 * @param {string} profileData.email
 * @param {string} profileData.phone
 * @param {string} profileData.avatarUrl
 */
export const updateAdminProfile = async (profileData) => {
  try {
    const response = await axiosInstance.put('/admin/profile', profileData);
    return {
      success: true,
      data: response.data,
      message: 'Cập nhật hồ sơ admin thành công!',
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update admin profile',
    };
  }
};

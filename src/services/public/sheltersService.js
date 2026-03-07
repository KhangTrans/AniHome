import axiosInstance from '../axiosConfig';

/**
 * 🏥 PUBLIC SHELTERS APIs - /api/shelters
 * Không cần authentication
 */

/**
 * GET /api/shelters
 * Danh sách trạm cứu hộ
 * 
 * @param {Object} params - Query parameters
 * @param {string} params.location - Lọc theo địa điểm (optional)
 * @param {string} params.status - Active/Inactive (optional)
 * @param {number} params.page - Trang hiện tại (default: 1)
 * @param {number} params.pageSize - Số lượng mỗi trang (default: 10)
 */
export const getShelters = async (params = {}) => {
  try {
    const queryParams = {
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      ...(params.location && { location: params.location }),
      ...(params.status && { status: params.status }),
    };

    const queryString = new URLSearchParams(queryParams).toString();
    const response = await axiosInstance.get(`/shelters?${queryString}`);
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch shelters',
    };
  }
};

/**
 * GET /api/shelters/{id}
 * Chi tiết trạm cứu hộ
 * 
 * @param {number} id - Shelter ID
 */
export const getShelterById = async (id) => {
  try {
    const response = await axiosInstance.get(`/shelters/${id}`);
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch shelter details',
    };
  }
};

/**
 * Utility: Format shelter phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  // Format: 0123456789 -> 012-345-6789
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
};

/**
 * Utility: Get shelter status badge
 */
export const getShelterStatusBadge = (status) => {
  return {
    Active: { text: 'Hoạt động', color: '#10b981', bg: '#d1fae5' },
    Inactive: { text: 'Tạm ngưng', color: '#ef4444', bg: '#fee2e2' },
  }[status] || { text: status, color: '#6b7280', bg: '#f3f4f6' };
};

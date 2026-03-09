import axiosInstance from '../axiosConfig';

/**
 * 🏥 PUBLIC SHELTERS APIs - /api/Shelters
 * Không cần authentication
 * 
 * Backend Response Format:
 * {
 *   items: [{ shelterID, shelterName, location, regionName, totalPets }],
 *   totalCount, currentPage, pageSize, totalPages
 * }
 */

/**
 * GET /api/Shelters
 * Danh sách trạm cứu hộ với filter, search và pagination
 * 
 * @param {Object} params - Query parameters
 * @param {string} params.keyword - Tìm kiếm theo tên shelter (optional)
 * @param {number} params.regionID - Lọc theo vùng/miền (optional)
 * @param {number} params.page - Trang hiện tại (default: 1)
 * @param {number} params.pageSize - Số lượng mỗi trang (default: 6)
 * @returns {Object} { success, data: { items, totalCount, currentPage, pageSize, totalPages }, error }
 */
export const getShelters = async (params = {}) => {
  try {
    const queryParams = {
      page: params.page || 1,
      pageSize: params.pageSize || 6,
      ...(params.keyword && { keyword: params.keyword }),
      ...(params.regionID && { regionID: params.regionID }),
    };

    const queryString = new URLSearchParams(queryParams).toString();
    const response = await axiosInstance.get(`/Shelters?${queryString}`);
    
    return {
      success: true,
      data: response.data, // { items, totalCount, currentPage, pageSize, totalPages }
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch shelters',
    };
  }
};

/**
 * GET /api/Shelters/{id}
 * Lấy thông tin chi tiết của trạm cứu hộ
 * 
 * @param {number} shelterID - ID của trạm cứu hộ
 * @returns {Object} { success, data: { shelterID, shelterName, location, regionName, totalPets, description, createdAt }, error }
 */
export const getShelterById = async (shelterID) => {
  try {
    const response = await axiosInstance.get(`/Shelters/${shelterID}`);
    
    return {
      success: true,
      data: response.data, // { shelterID, shelterName, location, regionName, totalPets, description, createdAt }
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

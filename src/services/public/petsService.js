import axiosInstance from '../axiosConfig';

/**
 * 🐾 PUBLIC PETS APIs - /api/pets
 * Không cần authentication
 */

/**
 * GET /api/pets
 * Xem danh sách thú cưng với filter
 * 
 * @param {Object} params - Query parameters
 * @param {string} params.keyword - Tìm kiếm theo tên (optional)
 * @param {number} params.categoryId - Lọc theo loại (optional)
 * @param {number} params.shelterId - Lọc theo shelter (optional)
 * @param {string} params.status - Lọc theo trạng thái (optional, ex: "Available" hoặc "Available,InTreatment")
 * @param {number} params.page - Trang hiện tại (default: 1)
 * @param {number} params.pageSize - Số lượng mỗi trang (default: 9)
 */
export const getPets = async (params = {}) => {
  try {
    const queryParams = {
      page: params.page || 1,
      pageSize: params.pageSize || 9,
      ...(params.keyword && { keyword: params.keyword }),
      ...(params.categoryId && { categoryId: params.categoryId }),
      ...(params.shelterId && { shelterId: params.shelterId }),
      ...(params.status && { status: params.status }),
    };

    const queryString = new URLSearchParams(queryParams).toString();
    const response = await axiosInstance.get(`/pets?${queryString}`);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch pets',
    };
  }
};

/**
 * GET /api/pets/{id}
 * Xem chi tiết thú cưng
 * 
 * @param {number} id - Pet ID
 */
export const getPetById = async (id) => {
  try {
    const response = await axiosInstance.get(`/pets/${id}`);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch pet details',
    };
  }
};

/**
 * GET /api/pets/available
 * Lấy danh sách tất cả pet có sẵn (Available + InTreatment) với pagination
 * 
 * @param {Object} params - Query parameters
 * @param {number} params.page - Trang hiện tại (default: 1)
 * @param {number} params.pageSize - Số lượng mỗi trang (default: 12)
 */
export const getAvailablePets = async (params = {}) => {
  try {
    const queryParams = {
      page: params.page || 1,
      pageSize: params.pageSize || 12,
    };

    const queryString = new URLSearchParams(queryParams).toString();
    const response = await axiosInstance.get(`/pets/available?${queryString}`);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch available pets',
    };
  }
};

/**
 * GET /api/pets/shelter/{shelterId}/available
 * Lấy danh sách pet có sẵn (Available + InTreatment) của trạm với pagination
 * 
 * @param {number} shelterId - Shelter ID
 * @param {Object} params - Query parameters
 * @param {number} params.page - Trang hiện tại (default: 1)
 * @param {number} params.pageSize - Số lượng mỗi trang (default: 9)
 */
export const getAvailablePetsByShelter = async (shelterId, params = {}) => {
  try {
    const queryParams = {
      page: params.page || 1,
      pageSize: params.pageSize || 9,
    };

    const queryString = new URLSearchParams(queryParams).toString();
    const response = await axiosInstance.get(`/pets/shelter/${shelterId}/available?${queryString}`);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch available pets',
    };
  }
};

/**
 * Utility: Get pet status badge
 */
export const getPetStatusBadge = (status) => {
  return {
    Available: { text: 'Sẵn sàng', color: '#10b981', bg: '#d1fae5' },
    Pending: { text: 'Đang duyệt', color: '#f59e0b', bg: '#fef3c7' },
    Adopted: { text: 'Đã nhận nuôi', color: '#6b7280', bg: '#f3f4f6' },
  }[status] || { text: status, color: '#6b7280', bg: '#f3f4f6' };
};

/**
 * Utility: Format pet age
 */
export const formatPetAge = (ageInMonths) => {
  if (!ageInMonths) return 'Chưa rõ';

  if (ageInMonths < 12) {
    return `${ageInMonths} tháng`;
  }

  const years = Math.floor(ageInMonths / 12);
  const months = ageInMonths % 12;

  if (months === 0) {
    return `${years} tuổi`;
  }

  return `${years} tuổi ${months} tháng`;
};

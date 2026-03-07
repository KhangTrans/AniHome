import axiosInstance from '../axiosConfig';

/**
 * 🏥 ADMIN SHELTERS MANAGEMENT APIs
 * /api/admin/shelters
 * Role: Admin (RoleID = 1)
 * Requires: accessToken + Admin role
 */

/**
 * GET /api/admin/shelters
 * Lấy danh sách tất cả shelters (Admin view)
 * 
 * @param {Object} params - Query params
 * @param {string} params.status - Filter by status (Active/Inactive/Pending)
 * @param {number} params.page - Page number
 * @param {number} params.pageSize - Page size
 */
export const getAllShelters = async (params = {}) => {
  try {
    const queryParams = {
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      ...(params.status && { status: params.status }),
    };

    const queryString = new URLSearchParams(queryParams).toString();
    const response = await axiosInstance.get(`/admin/shelters?${queryString}`);
    
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
 * PATCH /api/admin/shelters/{id}/status
 * Cập nhật trạng thái shelter (Admin can activate/deactivate)
 * 
 * @param {number} id - Shelter ID
 * @param {string} status - New status (Active/Inactive/Pending)
 */
export const updateShelterStatus = async (id, status) => {
  try {
    const response = await axiosInstance.patch(`/admin/shelters/${id}/status`, {
      status,
    });
    
    return {
      success: true,
      data: response.data,
      message: 'Cập nhật trạng thái shelter thành công!',
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update shelter status',
    };
  }
};

/**
 * DELETE /api/admin/shelters/{id}
 * Xóa shelter (Admin only - Cẩn thận!)
 * 
 * @param {number} id - Shelter ID
 */
export const deleteShelter = async (id) => {
  try {
    const response = await axiosInstance.delete(`/admin/shelters/${id}`);
    
    return {
      success: true,
      data: response.data,
      message: 'Đã xóa shelter!',
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete shelter',
    };
  }
};

/**
 * Utility: Shelter status options for admin
 */
export const ADMIN_SHELTER_STATUS_OPTIONS = [
  { value: 'Active', label: 'Hoạt động', color: '#10b981', icon: '✅' },
  { value: 'Inactive', label: 'Tạm ngưng', color: '#6b7280', icon: '⏸️' },
  { value: 'Pending', label: 'Chờ duyệt', color: '#f59e0b', icon: '⏳' },
  { value: 'Suspended', label: 'Đình chỉ', color: '#ef4444', icon: '🚫' },
];

/**
 * Utility: Get shelter status badge for admin
 */
export const getAdminShelterStatusBadge = (status) => {
  return {
    Active: { text: 'Hoạt động', color: '#10b981', bg: '#d1fae5', icon: '✅' },
    Inactive: { text: 'Tạm ngưng', color: '#6b7280', bg: '#f3f4f6', icon: '⏸️' },
    Pending: { text: 'Chờ duyệt', color: '#f59e0b', bg: '#fef3c7', icon: '⏳' },
    Suspended: { text: 'Đình chỉ', color: '#ef4444', bg: '#fee2e2', icon: '🚫' },
  }[status] || { text: status, color: '#6b7280', bg: '#f3f4f6', icon: '❓' };
};

/**
 * Utility: Validate shelter status change
 */
export const canChangeShelterStatus = (currentStatus, newStatus) => {
  const transitions = {
    Pending: ['Active', 'Suspended'],
    Active: ['Inactive', 'Suspended'],
    Inactive: ['Active', 'Suspended'],
    Suspended: ['Active', 'Inactive'],
  };
  
  return transitions[currentStatus]?.includes(newStatus) || false;
};

import axiosInstance from '../axiosConfig';

/**
 * 👥 ADMIN USERS MANAGEMENT APIs
 * /api/admin/users
 * Role: Admin (RoleID = 1)
 * Requires: accessToken + Admin role
 */

/**
 * GET /api/admin/users
 * Lấy danh sách người dùng (Admin view)
 * 
 * @param {Object} params - Query params
 * @param {string} params.Search - Tìm theo username, email, fullname
 * @param {number} params.RoleID - 1=Admin, 2=ShelterOwner, 3=User
 * @param {boolean} params.IsActive - true=active, false=banned
 * @param {number} params.PageNumber - Page number (default: 1)
 * @param {number} params.PageSize - Page size (default: 10)
 */
export const getAllUsers = async (params = {}) => {
  try {
    const queryParams = {
      PageNumber: params.PageNumber || 1,
      PageSize: params.PageSize || 10,
      ...(params.Search && { Search: params.Search }),
      ...(params.RoleID && { RoleID: params.RoleID }),
      ...(params.IsActive !== undefined && params.IsActive !== null && { IsActive: params.IsActive }),
    };

    const queryString = new URLSearchParams(queryParams).toString();
    const response = await axiosInstance.get(`/admin/users?${queryString}`);
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch users',
    };
  }
};

/**
 * GET /api/admin/users/{userId}
 * Lấy chi tiết người dùng
 * 
 * @param {number} userId - User ID
 */
export const getUserDetail = async (userId) => {
  try {
    const response = await axiosInstance.get(`/admin/users/${userId}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch user detail',
    };
  }
};

/**
 * PATCH /api/admin/users/{userId}/status
 * Ban/Unban user
 * 
 * @param {number} userId - User ID
 * @param {boolean} isActive - false = ban, true = unban
 */
export const updateUserStatus = async (userId, isActive) => {
  try {
    const response = await axiosInstance.patch(`/admin/users/${userId}/status`, {
      isActive,
    });
    
    return {
      success: true,
      data: response.data,
      message: isActive 
        ? 'Đã kích hoạt tài khoản người dùng.' 
        : 'Đã vô hiệu hóa tài khoản người dùng.',
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update user status',
    };
  }
};

/**
 * Utility: Role options for admin filter
 */
export const ROLE_OPTIONS = [
  { value: '', label: 'Tất cả vai trò' },
  { value: 1, label: 'Admin' },
  { value: 2, label: 'Shelter Manager' },
  { value: 3, label: 'Volunteer' },
  { value: 4, label: 'Customer' },
];

/**
 * Utility: Status options for admin filter
 */
export const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'true', label: 'Đang hoạt động' },
  { value: 'false', label: 'Đã bị cấm' },
];

/**
 * Utility: Get role badge styling
 */
export const getRoleBadge = (roleName) => {
  return {
    Admin: { text: 'Admin', color: '#7c3aed', bg: '#ede9fe', icon: '👑' },
    ShelterManager: { text: 'Shelter Manager', color: '#2563eb', bg: '#dbeafe', icon: '🏠' },
    Volunteer: { text: 'Volunteer', color: '#f59e0b', bg: '#fef3c7', icon: '🤝' },
    Customer: { text: 'Customer', color: '#059669', bg: '#d1fae5', icon: '👤' },
  }[roleName] || { text: roleName, color: '#6b7280', bg: '#f3f4f6', icon: '❓' };
};

/**
 * Utility: Get status badge styling
 */
export const getStatusBadge = (isActive) => {
  return isActive 
    ? { text: 'Hoạt động', color: '#10b981', bg: '#d1fae5', icon: '✅' }
    : { text: 'Bị cấm', color: '#ef4444', bg: '#fee2e2', icon: '🚫' };
};

import axiosInstance from '../axiosConfig';

/**
 * 📝 ADMIN CONTENT MODERATION APIs
 * /api/admin/moderation
 * Role: Admin (RoleID = 1)
 * Requires: accessToken + Admin role
 */

/**
 * GET /api/admin/moderation/posts
 * Lấy danh sách bài viết chờ duyệt
 * 
 * @param {Object} params - Query params
 * @param {string} params.status - Filter by status (pending/approved/rejected)
 * @param {number} params.page - Page number
 * @param {number} params.pageSize - Page size
 */
export const getPendingPosts = async (params = {}) => {
  try {
    const queryParams = {
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      ...(params.status && { status: params.status }),
    };

    const queryString = new URLSearchParams(queryParams).toString();
    const response = await axiosInstance.get(`/admin/moderation/posts?${queryString}`);
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch pending posts',
    };
  }
};

/**
 * PATCH /api/admin/moderation/posts/{postId}/review
 * Duyệt hoặc từ chối bài viết
 * 
 * @param {number} postId - Post ID
 * @param {Object} reviewData
 * @param {string} reviewData.action - approve or reject
 * @param {string} reviewData.reason - Lý do (bắt buộc nếu reject)
 */
export const reviewPost = async (postId, reviewData) => {
  try {
    const response = await axiosInstance.patch(`/admin/moderation/posts/${postId}/review`, {
      isApproved: reviewData.isApproved,
      note: reviewData.note || '',
    });
    
    const message = reviewData.isApproved 
      ? 'Đã duyệt bài viết!' 
      : 'Đã từ chối bài viết!';
    
    return {
      success: true,
      data: response.data,
      message,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to review post',
    };
  }
};

/**
 * GET /api/admin/moderation/reports
 * Lấy danh sách báo cáo vi phạm
 * 
 * @param {Object} params - Query params
 * @param {string} params.status - Filter by status (pending/resolved)
 * @param {number} params.page - Page number
 * @param {number} params.pageSize - Page size
 */
export const getReports = async (params = {}) => {
  try {
    const queryParams = {
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      ...(params.status && { status: params.status }),
    };

    const queryString = new URLSearchParams(queryParams).toString();
    const response = await axiosInstance.get(`/admin/moderation/reports?${queryString}`);
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch reports',
    };
  }
};

/**
 * PATCH /api/admin/moderation/reports/{reportId}/handle
 * Xử lý báo cáo vi phạm
 * 
 * @param {number} reportId - Report ID
 * @param {Object} handleData
 * @param {string} handleData.action - Resolved, Dismissed, Banned
 * @param {number} [handleData.offendingUserID] - (Optional) ID của User vi phạm
 */
export const handleReport = async (reportId, handleData) => {
  try {
    const response = await axiosInstance.patch(`/admin/moderation/reports/${reportId}/handle`, {
      action: handleData.action,
      offendingUserID: handleData.offendingUserID || 0,
    });
    
    return {
      success: true,
      data: response.data,
      message: 'Đã xử lý báo cáo!',
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to handle report',
    };
  }
};

/**
 * Utility: Review actions
 */
export const REVIEW_ACTIONS = [
  { value: 'approve', label: 'Duyệt', color: '#10b981', icon: '✅' },
  { value: 'reject', label: 'Từ chối', color: '#ef4444', icon: '❌' },
];

/**
 * Utility: Report handle actions
 */
export const REPORT_ACTIONS = [
  { value: 'dismiss', label: 'Bỏ qua', color: '#6b7280', icon: '👌' },
  { value: 'warning', label: 'Cảnh cáo', color: '#f59e0b', icon: '⚠️' },
  { value: 'suspend', label: 'Đình chỉ tạm thời', color: '#ef4444', icon: '⏸️' },
  { value: 'ban', label: 'Cấm vĩnh viễn', color: '#991b1b', icon: '🚫' },
];

/**
 * Utility: Get post status badge
 */
export const getPostReviewStatusBadge = (status) => {
  return {
    pending: { text: 'Chờ duyệt', color: '#f59e0b', bg: '#fef3c7', icon: '⏳' },
    approved: { text: 'Đã duyệt', color: '#10b981', bg: '#d1fae5', icon: '✅' },
    rejected: { text: 'Từ chối', color: '#ef4444', bg: '#fee2e2', icon: '❌' },
  }[status] || { text: status, color: '#6b7280', bg: '#f3f4f6', icon: '❓' };
};

/**
 * Utility: Get report status badge
 */
export const getReportStatusBadge = (status) => {
  return {
    pending: { text: 'Chờ xử lý', color: '#f59e0b', bg: '#fef3c7', icon: '⏳' },
    resolved: { text: 'Đã xử lý', color: '#10b981', bg: '#d1fae5', icon: '✅' },
    dismissed: { text: 'Đã bỏ qua', color: '#6b7280', bg: '#f3f4f6', icon: '👌' },
  }[status] || { text: status, color: '#6b7280', bg: '#f3f4f6', icon: '❓' };
};

/**
 * Utility: Report severity levels
 */
export const REPORT_SEVERITY = {
  low: { text: 'Thấp', color: '#10b981', icon: '🟢' },
  medium: { text: 'Trung bình', color: '#f59e0b', icon: '🟡' },
  high: { text: 'Cao', color: '#ef4444', icon: '🔴' },
  critical: { text: 'Nghiêm trọng', color: '#991b1b', icon: '⚠️' },
};

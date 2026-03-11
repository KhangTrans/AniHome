import axiosInstance from '../axiosConfig';

/**
 * 📰 PUBLIC POSTS APIs - /api/posts
 * Không cần authentication
 */

/**
 * GET /api/posts
 * Danh sách bài viết blog
 * 
 * @param {Object} params - Query parameters
 * @param {string} params.keyword - Tìm kiếm (optional)
 * @param {string} params.status - approved/pending (optional)
 * @param {number} params.page - Trang hiện tại (default: 1)
 * @param {number} params.pageSize - Số lượng mỗi trang (default: 10)
 */
export const getPosts = async (params = {}) => {
  try {
    const queryParams = {
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      ...(params.searchTerm && { searchTerm: params.searchTerm }),
      ...(params.postType && { postType: params.postType }),
      ...(params.status && { status: params.status }),
    };

    const queryString = new URLSearchParams(queryParams).toString();
    const response = await axiosInstance.get(`/posts?${queryString}`);
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch posts',
    };
  }
};

/**
 * GET /api/posts/{id}
 * Chi tiết bài viết
 * 
 * @param {number} id - Post ID
 */
export const getPostById = async (id) => {
  try {
    const response = await axiosInstance.get(`/posts/${id}`);
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch post details',
    };
  }
};

/**
 * GET /api/Posts/happy-stories
 * Danh sách những câu chuyện hạnh phúc
 */
export const getHappyStories = async () => {
  try {
    const response = await axiosInstance.get(`/posts/happy-stories`);
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch happy stories',
    };
  }
};

/**
 * Utility: Format post date
 */
export const formatPostDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hôm nay';
  if (diffDays === 1) return 'Hôm qua';
  if (diffDays < 7) return `${diffDays} ngày trước`;
  
  return date.toLocaleDateString('vi-VN');
};

/**
 * Utility: Get post status badge
 */
export const getPostStatusBadge = (status) => {
  return {
    approved: { text: 'Đã duyệt', color: '#10b981', bg: '#d1fae5' },
    pending: { text: 'Chờ duyệt', color: '#f59e0b', bg: '#fef3c7' },
    rejected: { text: 'Từ chối', color: '#ef4444', bg: '#fee2e2' },
  }[status] || { text: status, color: '#6b7280', bg: '#f3f4f6' };
};

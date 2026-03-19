import axiosInstance from '../axiosConfig';

/**
 * 📰 SHELTER POSTS APIs - /api/posts
 * Requires Authentication (ShelterManager or Admin)
 */

/**
 * POST /api/posts
 * Tạo bài viết mới
 * 
 * @param {number} shelterId - Shelter ID
 * @param {Object} postData - Dữ liệu bài viết
 * @param {string} postData.title - Tiêu đề bài viết
 * @param {string} postData.content - Nội dung bài viết
 * @param {string} postData.postType - Loại bài viết (Story, News, Event)
 * @param {string[]} postData.imageUrls - Mảng các đường link ảnh
 */
export const createNewPost = async (shelterId, postData) => {
  try {
    const response = await axiosInstance.post(`/posts?shelterId=${shelterId}`, postData);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create post',
    };
  }
};

/**
 * GET /api/Posts/by-shelter/{shelterId}
 * Lấy danh sách bài viết do Trạm Cứu Hộ hiện tại đăng
 * 
 * @param {number} shelterId - Shelter ID
 * @param {Object} params - Query parameters
 * @param {number} params.page - Trang hiện tại
 * @param {number} params.pageSize - Số lượng hiển thị
 * @param {string} params.postType - Lọc theo loại bài viết
 */
export const getMyPosts = async (shelterId, params = {}) => {
  try {
    const queryParams = {
      page: params.page || 1,
      pageSize: params.pageSize || 6,
      ...(params.postType && { postType: params.postType }),
      ...(params.searchTerm && { searchTerm: params.searchTerm }),
    };

    const queryString = new URLSearchParams(queryParams).toString();
    const response = await axiosInstance.get(`/Posts/by-shelter/${shelterId}?${queryString}`);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    // If 401 unauthorized, typical handling via interceptor or manual redirect
    return {
      success: false,
      status: error.response?.status,
      error: error.response?.data?.message || 'Không thể xác thực hoặc tải bài viết',
    };
  }
};

/**
 * GET /api/posts/my-posts/management
 * Lấy TẤT CẢ bài viết của tôi (Pending + Published + Rejected) - Dành cho Management
 * 
 * @param {Object} params - Query parameters
 * @param {number} params.page - Trang hiện tại
 * @param {number} params.pageSize - Số lượng hiển thị
 * @param {string} params.postType - Lọc theo loại bài viết
 */
export const getMyPostsManagement = async (params = {}) => {
  try {
    const queryParams = {
      page: params.page || 1,
      pageSize: params.pageSize || 12,
      ...(params.postType && { postType: params.postType }),
      ...(params.searchTerm && { searchTerm: params.searchTerm }),
    };

    const queryString = new URLSearchParams(queryParams).toString();
    const response = await axiosInstance.get(`/posts/my-posts/management?${queryString}`);

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status,
      error: error.response?.data?.message || 'Không thể tải danh sách bài viết',
    };
  }
};

/**
 * GET /api/posts/my-posts/{id}
 * Xem chi tiết bài viết (Dành cho Dashboard)
 * 
 * @param {number} id - Post ID
 */
export const getMyPostById = async (id) => {
  try {
    const response = await axiosInstance.get(`/posts/my-posts/${id}`);

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
 * PUT /api/posts/{id}
 * Cập nhật bài viết
 * 
 * @param {number} id - Post ID
 * @param {Object} postData - Dữ liệu cập nhật
 * @param {string} postData.title - Tiêu đề bài viết
 * @param {string} postData.content - Nội dung bài viết
 * @param {string} postData.postType - Loại bài viết
 * @param {string[]} postData.imageUrls - Mảng các đường link ảnh
 */
export const updatePost = async (id, postData) => {
  try {
    const response = await axiosInstance.put(`/posts/${id}`, postData);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update post',
    };
  }
};

/**
 * DELETE /api/posts/{id}
 * Xóa bài viết
 * 
 * @param {number} id - Post ID
 */
export const deletePost = async (id) => {
  try {
    const response = await axiosInstance.delete(`/posts/${id}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete post',
    };
  }
};

import axiosInstance from '../axiosConfig';

/**
 * 📂 ADMIN CATEGORIES MANAGEMENT APIs
 * /api/admin/categories
 * Role: Admin (RoleID = 1)
 * Requires: accessToken + Admin role
 */

/**
 * GET /api/admin/categories
 * Lấy danh sách tất cả categories
 */
export const getAllCategories = async () => {
  try {
    const response = await axiosInstance.get('/admin/categories');
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch categories',
    };
  }
};

/**
 * POST /api/admin/categories
 * Thêm category mới
 * 
 * @param {Object} categoryData
 * @param {string} categoryData.name - Tên category
 * @param {string} categoryData.description - Mô tả
 * @param {string} categoryData.icon - Icon emoji (optional)
 */
export const createCategory = async (categoryData) => {
  try {
    const response = await axiosInstance.post('/admin/categories', {
      name: categoryData.name,
      description: categoryData.description || '',
      icon: categoryData.icon || '',
    });
    
    return {
      success: true,
      data: response.data,
      message: 'Thêm category thành công!',
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create category',
    };
  }
};

/**
 * DELETE /api/admin/categories/{categoryId}
 * Xóa category
 * 
 * @param {number} categoryId - Category ID
 */
export const deleteCategory = async (categoryId) => {
  try {
    const response = await axiosInstance.delete(`/admin/categories/${categoryId}`);
    
    return {
      success: true,
      data: response.data,
      message: 'Đã xóa category!',
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to delete category',
    };
  }
};

/**
 * Utility: Validate category data
 */
export const validateCategoryData = (data) => {
  const errors = {};
  
  if (!data.name) errors.name = 'Vui lòng nhập tên category';
  
  if (data.name && data.name.length < 2) {
    errors.name = 'Tên category phải có ít nhất 2 ký tự';
  }
  
  if (data.name && data.name.length > 50) {
    errors.name = 'Tên category không được quá 50 ký tự';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Utility: Common pet category icons
 */
export const CATEGORY_ICON_SUGGESTIONS = [
  { icon: '🐶', label: 'Chó' },
  { icon: '🐱', label: 'Mèo' },
  { icon: '🐰', label: 'Thỏ' },
  { icon: '🐹', label: 'Chuột Hamster' },
  { icon: '🐦', label: 'Chim' },
  { icon: '🐢', label: 'Rùa' },
  { icon: '🐠', label: 'Cá' },
  { icon: '🦎', label: 'Bò Sát' },
  { icon: '🐴', label: 'Ngựa' },
  { icon: '🐮', label: 'Gia Súc' },
  { icon: '🦜', label: 'Vẹt' },
  { icon: '🦔', label: 'Nhím' },
];

/**
 * Utility: Check if category can be deleted
 */
export const canDeleteCategory = (category) => {
  // Không thể xóa nếu còn pets trong category
  return !category.petCount || category.petCount === 0;
};

/**
 * Utility: Format category with count
 */
export const formatCategoryWithCount = (category) => {
  const count = category.petCount || 0;
  return `${category.name} (${count} thú cưng)`;
};

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
 * @param {string} categoryData.categoryName - Tên category (bắt buộc)
 * @param {string} categoryData.categoryType - Loại category (bắt buộc, e.g., "Pet")
 */
export const createCategory = async (categoryData) => {
  try {
    const response = await axiosInstance.post('/admin/categories', {
      categoryName: categoryData.categoryName,
      categoryType: categoryData.categoryType,
    });
    
    return {
      success: true,
      data: response.data,
      message: 'Thêm thể loại thành công!',
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create category',
    };
  }
};

/**
 * PUT /api/admin/categories/{categoryId}
 * Cập nhật category
 * 
 * @param {number} categoryId - Category ID
 * @param {Object} categoryData
 * @param {string} categoryData.categoryName - Tên category (bắt buộc)
 * @param {string} categoryData.categoryType - Loại category (bắt buộc)
 */
export const updateCategory = async (categoryId, categoryData) => {
  try {
    const response = await axiosInstance.put(`/admin/categories/${categoryId}`, {
      categoryName: categoryData.categoryName,
      categoryType: categoryData.categoryType,
    });
    
    return {
      success: true,
      data: response.data,
      message: 'Cập nhật thể loại thành công!',
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update category',
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
  
  if (!data.categoryName) errors.categoryName = 'Vui lòng nhập tên thể loại';
  
  if (data.categoryName && data.categoryName.length < 2) {
    errors.categoryName = 'Tên thể loại phải có ít nhất 2 ký tự';
  }
  
  if (data.categoryName && data.categoryName.length > 50) {
    errors.categoryName = 'Tên thể loại không được quá 50 ký tự';
  }
  
  if (!data.categoryType) errors.categoryType = 'Vui lòng chọn loại thể loại';
  
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
  return !category.itemCount || category.itemCount === 0;
};

/**
 * Utility: Format category with count
 */
export const formatCategoryWithCount = (category) => {
  const count = category.itemCount || 0;
  return `${category.categoryName} (${count} thú cưng)`;
};

/**
 * Utility: Category types
 */
export const CATEGORY_TYPES = [
  { value: 'Pet', label: 'Thú cưng' },
  { value: 'Supply', label: 'Vật phẩm' },
  { value: 'Service', label: 'Dịch vụ' },
];

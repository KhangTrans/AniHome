import axiosInstance from '../axiosConfig';

/**
 * 📦 SHELTER INVENTORY MANAGEMENT APIs
 * /api/manage-shelter/{shelterId}/inventory
 * Role: Shelter (RoleID = 2)
 * Requires: accessToken + own shelterId
 */

/**
 * GET /api/manage-shelter/{shelterId}/inventory
 * Lấy danh sách vật tư kho
 * 
 * @param {number} shelterId - Shelter ID
 * @param {Object} params - Query params
 * @param {string} params.lowStock - Filter low stock items (true/false)
 */
export const getShelterInventory = async (shelterId, params = {}) => {
  try {
    const queryParams = {
      ...(params.lowStock && { lowStock: params.lowStock }),
    };

    const queryString = new URLSearchParams(queryParams).toString();
    const url = queryString 
      ? `/manage-shelter/${shelterId}/inventory?${queryString}`
      : `/manage-shelter/${shelterId}/inventory`;
      
    const response = await axiosInstance.get(url);
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch inventory',
    };
  }
};

/**
 * POST /api/manage-shelter/{shelterId}/inventory
 * Thêm vật tư mới vào kho
 * 
 * @param {number} shelterId - Shelter ID
 * @param {Object} inventoryData - Inventory item data
 * @param {string} inventoryData.itemName - Tên vật tư
 * @param {string} inventoryData.category - Danh mục (food, medicine, equipment, etc.)
 * @param {number} inventoryData.quantity - Số lượng
 * @param {string} inventoryData.unit - Đơn vị (kg, liter, pieces, etc.)
 * @param {number} inventoryData.minStockLevel - Mức tồn kho tối thiểu
 * @param {string} inventoryData.description - Mô tả (optional)
 * @param {string} inventoryData.expiryDate - Hạn sử dụng (optional, ISO string)
 */
export const addInventoryItem = async (shelterId, inventoryData) => {
  try {
    const response = await axiosInstance.post(`/manage-shelter/${shelterId}/inventory`, {
      categoryID: Number(inventoryData.categoryID),
      itemName: inventoryData.itemName,
      quantity: Number(inventoryData.quantity),
      unit: inventoryData.unit,
      minRequired: Number(inventoryData.minRequired),
    });
    
    return {
      success: true,
      data: response.data,
      message: 'Thêm vật tư thành công!',
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to add inventory item',
    };
  }
};

/**
 * PATCH /api/manage-shelter/{shelterId}/inventory/{supplyId}/stock
 * Cập nhật số lượng tồn kho
 * 
 * @param {number} shelterId - Shelter ID
 * @param {number} supplyId - Supply ID
 * @param {number} quantity - New quantity
 */
export const updateInventoryStock = async (shelterId, supplyId, quantity) => {
  try {
    const response = await axiosInstance.patch(
      `/manage-shelter/${shelterId}/inventory/${supplyId}/stock`,
      { newQuantity: Number(quantity) }
    );
    
    return {
      success: true,
      data: response.data,
      message: 'Cập nhật tồn kho thành công!',
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update stock',
    };
  }
};

/**
 * GET /api/manage-shelter/{shelterId}/store/stats
 * Lấy thống kê Kho & Cửa Hàng
 */
export const getStoreStats = async (shelterId, month, year) => {
  try {
    const params = {};
    if (month) params.month = month;
    if (year) params.year = year;

    const response = await axiosInstance.get(
      `/manage-shelter/${shelterId}/store/stats`,
      { params },
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch store stats",
    };
  }
};

/**
 * GET /api/manage-shelter/{shelterId}/store/supplies
 * Lấy danh sách vật phẩm nội bộ
 */
export const getStoreSupplies = async (shelterId) => {
  try {
    const response = await axiosInstance.get(
      `/manage-shelter/${shelterId}/store/supplies`,
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch supplies list",
    };
  }
};

/**
 * GET /api/manage-shelter/{shelterId}/store/products
 * Lấy danh sách sản phẩm gây quỹ của shelter
 */
export const getStoreProducts = async (shelterId) => {
  try {
    const response = await axiosInstance.get(
      `/manage-shelter/${shelterId}/store/products`,
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch products list",
    };
  }
};

/**
 * GET /api/manage-shelter/{shelterId}/store/subscription/packages
 * Lấy danh sách gói đăng ký cho Shelter Manager
 */
export const getShelterSubscriptionPackages = async (shelterId) => {
  try {
    const response = await axiosInstance.get(
      `/manage-shelter/${shelterId}/store/subscription/packages`,
    );

    return {
      success: true,
      data: Array.isArray(response.data) ? response.data : [],
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      error: error.response?.data?.message || "Failed to fetch subscription packages",
    };
  }
};

/**
 * GET /api/manage-shelter/{shelterId}/store/subscription/status
 * Lấy trạng thái gói đăng ký hiện tại của shelter
 */
export const getShelterSubscriptionStatus = async (shelterId) => {
  try {
    const response = await axiosInstance.get(
      `/manage-shelter/${shelterId}/store/subscription/status`,
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch subscription status",
    };
  }
};

/**
 * POST /api/manage-shelter/{shelterId}/store/subscription/packages/{packageId}/subscribe
 * Đăng ký hoặc nâng cấp gói cho shelter
 */
export const subscribeShelterPackage = async (shelterId, packageId) => {
  try {
    const response = await axiosInstance.post(
      `/manage-shelter/${shelterId}/store/subscription/packages/${packageId}/subscribe`,
    );

    return {
      success: true,
      data: response.data,
      message:
        response.data?.message || response.data?.Message || "Đăng ký gói thành công",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.response?.data?.Message ||
        "Không thể đăng ký gói",
    };
  }
};

/**
 * POST /api/manage-shelter/{shelterId}/store/subscription/cancel
 * Hủy gói đăng ký hiện tại của shelter
 */
export const cancelShelterSubscription = async (shelterId) => {
  try {
    const response = await axiosInstance.post(
      `/manage-shelter/${shelterId}/store/subscription/cancel`,
    );

    return {
      success: true,
      data: response.data,
      message:
        response.data?.message || response.data?.Message || "Hủy gói thành công",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.response?.data?.Message ||
        "Không thể hủy gói đăng ký",
    };
  }
};

/**
 * Utility: Inventory categories
 */
export const INVENTORY_CATEGORIES = [
  { value: 'food', label: 'Thức Ăn', icon: '🍖', color: '#ef4444' },
  { value: 'medicine', label: 'Thuốc', icon: '💊', color: '#10b981' },
  { value: 'equipment', label: 'Thiết Bị', icon: '🔧', color: '#3b82f6' },
  { value: 'cleaning', label: 'Vệ Sinh', icon: '🧹', color: '#f59e0b' },
  { value: 'toys', label: 'Đồ Chơi', icon: '🎾', color: '#8b5cf6' },
  { value: 'bedding', label: 'Giường Nệm', icon: '🛏️', color: '#ec4899' },
  { value: 'other', label: 'Khác', icon: '📦', color: '#6b7280' },
];

/**
 * Utility: Unit types
 */
export const UNIT_TYPES = [
  { value: 'kg', label: 'Kg' },
  { value: 'liter', label: 'Lít' },
  { value: 'pieces', label: 'Cái' },
  { value: 'boxes', label: 'Hộp' },
  { value: 'bags', label: 'Bao' },
  { value: 'bottles', label: 'Chai' },
];

/**
 * Utility: Validate inventory data
 */
export const validateInventoryData = (data) => {
  const errors = {};
  
  if (!data.itemName) errors.itemName = 'Vui lòng nhập tên vật tư';
  if (!data.category) errors.category = 'Vui lòng chọn danh mục';
  if (data.quantity === undefined || data.quantity === null) {
    errors.quantity = 'Vui lòng nhập số lượng';
  }
  if (!data.unit) errors.unit = 'Vui lòng chọn đơn vị';
  if (data.minStockLevel === undefined || data.minStockLevel === null) {
    errors.minStockLevel = 'Vui lòng nhập mức tồn kho tối thiểu';
  }
  
  if (data.quantity !== undefined && data.quantity < 0) {
    errors.quantity = 'Số lượng không thể âm';
  }
  
  if (data.minStockLevel !== undefined && data.minStockLevel < 0) {
    errors.minStockLevel = 'Mức tồn kho không thể âm';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Utility: Check if stock is low
 */
export const isLowStock = (quantity, minStockLevel) => {
  return quantity <= minStockLevel;
};

/**
 * Utility: Get stock status badge
 */
export const getStockStatusBadge = (quantity, minStockLevel) => {
  if (quantity === 0) {
    return { text: 'Hết hàng', color: '#ef4444', bg: '#fee2e2', icon: '❌' };
  }
  
  if (quantity <= minStockLevel) {
    return { text: 'Sắp hết', color: '#f59e0b', bg: '#fef3c7', icon: '⚠️' };
  }
  
  return { text: 'Đầy đủ', color: '#10b981', bg: '#d1fae5', icon: '✅' };
};

/**
 * Utility: Check if item is expired
 */
export const isExpired = (expiryDate) => {
  if (!expiryDate) return false;
  return new Date(expiryDate) < new Date();
};

/**
 * Utility: Check if item is expiring soon (within 30 days)
 */
export const isExpiringSoon = (expiryDate) => {
  if (!expiryDate) return false;
  
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  
  return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
};

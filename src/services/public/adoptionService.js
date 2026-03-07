import axiosInstance from '../axiosConfig';
import { getCurrentUser } from '../authService';

/**
 * ❤️ PUBLIC ADOPTION APIs - /api/adoptions
 * userId có thể null (không bắt buộc đăng nhập)
 */

/**
 * POST /api/adoptions/request
 * Gửi yêu cầu nhận nuôi thú cưng
 * 
 * @param {Object} adoptionData - Thông tin yêu cầu nhận nuôi
 * @param {number} adoptionData.petId - ID thú cưng (required)
 * @param {number} adoptionData.userId - ID người dùng (optional, null nếu chưa đăng nhập)
 * @param {string} adoptionData.adopterName - Tên người nhận nuôi (required)
 * @param {string} adoptionData.adopterEmail - Email (required)
 * @param {string} adoptionData.adopterPhone - Số điện thoại (required)
 * @param {string} adoptionData.adopterAddress - Địa chỉ (required)
 * @param {string} adoptionData.reason - Lý do nhận nuôi (required)
 * @param {string} adoptionData.experience - Kinh nghiệm nuôi thú cưng (optional)
 * @param {boolean} adoptionData.hasOtherPets - Có nuôi thú khác không (optional)
 * @param {string} adoptionData.livingSpace - Điều kiện sống (optional)
 */
export const submitAdoptionRequest = async (adoptionData) => {
  try {
    // Tự động lấy userId nếu user đã đăng nhập
    const currentUser = getCurrentUser();
    const userId = currentUser ? currentUser.id : null;

    const payload = {
      petId: adoptionData.petId,
      userId: userId,
      adopterName: adoptionData.adopterName,
      adopterEmail: adoptionData.adopterEmail,
      adopterPhone: adoptionData.adopterPhone,
      adopterAddress: adoptionData.adopterAddress,
      reason: adoptionData.reason,
      experience: adoptionData.experience || '',
      hasOtherPets: adoptionData.hasOtherPets || false,
      livingSpace: adoptionData.livingSpace || '',
    };

    const response = await axiosInstance.post('/adoptions/request', payload);
    
    return {
      success: true,
      data: response.data,
      message: 'Yêu cầu nhận nuôi đã được gửi thành công!',
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to submit adoption request',
    };
  }
};

/**
 * GET /api/adoptions/{id}
 * Xem chi tiết yêu cầu nhận nuôi (Public)
 * 
 * @param {number} id - Adoption request ID
 */
export const getAdoptionById = async (id) => {
  try {
    const response = await axiosInstance.get(`/adoptions/${id}`);
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch adoption details',
    };
  }
};

/**
 * Utility: Validate adoption form data
 */
export const validateAdoptionData = (data) => {
  const errors = {};
  
  if (!data.petId) errors.petId = 'Vui lòng chọn thú cưng';
  if (!data.adopterName) errors.adopterName = 'Vui lòng nhập tên';
  if (!data.adopterEmail) errors.adopterEmail = 'Vui lòng nhập email';
  if (!data.adopterPhone) errors.adopterPhone = 'Vui lòng nhập số điện thoại';
  if (!data.adopterAddress) errors.adopterAddress = 'Vui lòng nhập địa chỉ';
  if (!data.reason) errors.reason = 'Vui lòng nhập lý do nhận nuôi';
  
  // Email validation
  if (data.adopterEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.adopterEmail)) {
    errors.adopterEmail = 'Email không hợp lệ';
  }
  
  // Phone validation (Vietnamese format)
  if (data.adopterPhone && !/^[0-9]{10,11}$/.test(data.adopterPhone.replace(/\s/g, ''))) {
    errors.adopterPhone = 'Số điện thoại không hợp lệ';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Utility: Get adoption status badge
 */
export const getAdoptionStatusBadge = (status) => {
  return {
    pending: { text: 'Chờ duyệt', color: '#f59e0b', bg: '#fef3c7' },
    approved: { text: 'Đã duyệt', color: '#10b981', bg: '#d1fae5' },
    rejected: { text: 'Từ chối', color: '#ef4444', bg: '#fee2e2' },
    completed: { text: 'Hoàn thành', color: '#6b7280', bg: '#f3f4f6' },
  }[status] || { text: status, color: '#6b7280', bg: '#f3f4f6' };
};

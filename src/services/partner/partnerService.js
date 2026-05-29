import axiosInstance from '../axiosConfig';

/**
 * 🙋 VOLUNTEER APIs - Role: "Volunteer" (RoleID = 3)
 * /api/volunteer - Volunteer-specific actions
 * Requires: accessToken + role = Volunteer
 */

/**
 * GET /api/volunteer/{volunteerId}/tasks/today
 * Lấy danh sách nhiệm vụ hôm nay
 * 
 * @param {number} volunteerId - Volunteer ID
 */
export const getTodayTasks = async (volunteerId) => {
  try {
    const response = await axiosInstance.get(`/volunteer/${volunteerId}/tasks/today`);
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch today tasks',
    };
  }
};

/**
 * PATCH /api/volunteer/tasks/{taskId}/complete
 * Đánh dấu nhiệm vụ đã hoàn thành
 * 
 * @param {number} taskId - Task ID
 * @param {string} notes - Ghi chú (optional)
 */
export const completeTask = async (taskId, notes = '') => {
  try {
    const response = await axiosInstance.patch(`/volunteer/tasks/${taskId}/complete`, {
      notes,
    });
    
    return {
      success: true,
      data: response.data,
      message: 'Nhiệm vụ đã hoàn thành!',
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to complete task',
    };
  }
};

/**
 * GET /api/volunteer/{volunteerId}/assigned-pets
 * Lấy danh sách pets được giao chăm sóc
 * 
 * @param {number} volunteerId - Volunteer ID
 */
export const getAssignedPets = async (volunteerId) => {
  try {
    const response = await axiosInstance.get(`/volunteer/${volunteerId}/assigned-pets`);
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch assigned pets',
    };
  }
};

/**
 * POST /api/volunteer/logs
 * Gửi nhật ký chăm sóc pet
 * 
 * @param {Object} logData
 * @param {number} logData.petId - Pet ID
 * @param {number} logData.volunteerId - Volunteer ID
 * @param {string} logData.activityType - Loại hoạt động (feeding, cleaning, exercise, medical, etc.)
 * @param {string} logData.notes - Ghi chú chi tiết
 * @param {string} logData.timestamp - Thời gian (ISO string)
 */
export const submitCareLog = async (logData) => {
  try {
    const response = await axiosInstance.post('/volunteer/logs', {
      petId: logData.petId,
      volunteerId: logData.volunteerId,
      activityType: logData.activityType,
      notes: logData.notes,
      timestamp: logData.timestamp || new Date().toISOString(),
    });
    
    return {
      success: true,
      data: response.data,
      message: 'Nhật ký đã được ghi nhận!',
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to submit care log',
    };
  }
};

/**
 * Utility: Get task status badge
 */
export const getTaskStatusBadge = (status) => {
  return {
    pending: { text: 'Chờ làm', color: '#f59e0b', bg: '#fef3c7', icon: '⏳' },
    inProgress: { text: 'Đang làm', color: '#3b82f6', bg: '#dbeafe', icon: '🔄' },
    completed: { text: 'Hoàn thành', color: '#10b981', bg: '#d1fae5', icon: '✅' },
    overdue: { text: 'Trễ hạn', color: '#ef4444', bg: '#fee2e2', icon: '⚠️' },
  }[status] || { text: status, color: '#6b7280', bg: '#f3f4f6', icon: '📋' };
};

/**
 * Utility: Activity types for care logs
 */
export const ACTIVITY_TYPES = [
  { value: 'feeding', label: 'Cho ăn', icon: '🍽️' },
  { value: 'cleaning', label: 'Vệ sinh', icon: '🧹' },
  { value: 'exercise', label: 'Tập luyện', icon: '🏃' },
  { value: 'medical', label: 'Y tế', icon: '💊' },
  { value: 'grooming', label: 'Chăm sóc lông', icon: '✂️' },
  { value: 'socializing', label: 'Giao lưu', icon: '🤝' },
  { value: 'training', label: 'Huấn luyện', icon: '🎓' },
  { value: 'other', label: 'Khác', icon: '📝' },
];

/**
 * Utility: Validate care log data
 */
export const validateCareLog = (data) => {
  const errors = {};
  
  if (!data.petId) errors.petId = 'Vui lòng chọn thú cưng';
  if (!data.activityType) errors.activityType = 'Vui lòng chọn loại hoạt động';
  if (!data.notes) errors.notes = 'Vui lòng nhập ghi chú';
  
  if (data.notes && data.notes.length < 10) {
    errors.notes = 'Ghi chú phải có ít nhất 10 ký tự';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Utility: Format task time
 */
export const formatTaskTime = (timeString) => {
  if (!timeString) return '';
  
  const date = new Date(timeString);
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

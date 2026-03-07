import axiosInstance from '../axiosConfig';

/**
 * 📅 SHELTER EVENTS MANAGEMENT APIs
 * /api/manage-shelter/{shelterId}/events
 * Role: Shelter (RoleID = 2)
 * Requires: accessToken + own shelterId
 */

/**
 * GET /api/manage-shelter/{shelterId}/events
 * Lấy lịch sự kiện của shelter
 * 
 * @param {number} shelterId - Shelter ID
 * @param {Object} params - Query params
 * @param {string} params.startDate - Filter from date (optional)
 * @param {string} params.endDate - Filter to date (optional)
 */
export const getShelterEvents = async (shelterId, params = {}) => {
  try {
    const queryParams = {
      ...(params.startDate && { startDate: params.startDate }),
      ...(params.endDate && { endDate: params.endDate }),
    };

    const queryString = new URLSearchParams(queryParams).toString();
    const url = queryString 
      ? `/manage-shelter/${shelterId}/events?${queryString}`
      : `/manage-shelter/${shelterId}/events`;
      
    const response = await axiosInstance.get(url);
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch events',
    };
  }
};

/**
 * POST /api/manage-shelter/{shelterId}/events
 * Tạo sự kiện mới
 * 
 * @param {number} shelterId - Shelter ID
 * @param {Object} eventData - Event information
 * @param {string} eventData.title - Tiêu đề sự kiện
 * @param {string} eventData.description - Mô tả
 * @param {string} eventData.eventType - Loại sự kiện (adoption_drive, fundraising, volunteer_day, etc.)
 * @param {string} eventData.startTime - Thời gian bắt đầu (ISO string)
 * @param {string} eventData.endTime - Thời gian kết thúc (ISO string)
 * @param {string} eventData.location - Địa điểm
 * @param {number} eventData.maxParticipants - Số người tham gia tối đa (optional)
 */
export const createShelterEvent = async (shelterId, eventData) => {
  try {
    const response = await axiosInstance.post(`/manage-shelter/${shelterId}/events`, {
      title: eventData.title,
      description: eventData.description,
      eventType: eventData.eventType,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      location: eventData.location,
      maxParticipants: eventData.maxParticipants || null,
    });
    
    return {
      success: true,
      data: response.data,
      message: 'Tạo sự kiện thành công!',
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create event',
    };
  }
};

/**
 * Utility: Event types
 */
export const EVENT_TYPES = [
  { value: 'adoption_drive', label: 'Ngày Nhận Nuôi', icon: '❤️', color: '#ef4444' },
  { value: 'fundraising', label: 'Gây Quỹ', icon: '💰', color: '#10b981' },
  { value: 'volunteer_day', label: 'Ngày Tình Nguyện', icon: '🙋', color: '#3b82f6' },
  { value: 'education', label: 'Giáo Dục Cộng Đồng', icon: '📚', color: '#8b5cf6' },
  { value: 'health_checkup', label: 'Khám Sức Khỏe', icon: '💊', color: '#f59e0b' },
  { value: 'other', label: 'Khác', icon: '📅', color: '#6b7280' },
];

/**
 * Utility: Validate event data
 */
export const validateEventData = (data) => {
  const errors = {};
  
  if (!data.title) errors.title = 'Vui lòng nhập tiêu đề';
  if (!data.eventType) errors.eventType = 'Vui lòng chọn loại sự kiện';
  if (!data.startTime) errors.startTime = 'Vui lòng chọn thời gian bắt đầu';
  if (!data.endTime) errors.endTime = 'Vui lòng chọn thời gian kết thúc';
  if (!data.location) errors.location = 'Vui lòng nhập địa điểm';
  
  if (data.startTime && data.endTime) {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    
    if (end <= start) {
      errors.endTime = 'Thời gian kết thúc phải sau thời gian bắt đầu';
    }
  }
  
  if (data.maxParticipants && data.maxParticipants < 1) {
    errors.maxParticipants = 'Số người tham gia phải lớn hơn 0';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Utility: Format event date range
 */
export const formatEventDateRange = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  const dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
  const timeOptions = { hour: '2-digit', minute: '2-digit' };
  
  const startDate = start.toLocaleDateString('vi-VN', dateOptions);
  const startTimeStr = start.toLocaleTimeString('vi-VN', timeOptions);
  const endTimeStr = end.toLocaleTimeString('vi-VN', timeOptions);
  
  return `${startDate} • ${startTimeStr} - ${endTimeStr}`;
};

/**
 * Utility: Check if event is upcoming
 */
export const isEventUpcoming = (startTime) => {
  return new Date(startTime) > new Date();
};

/**
 * Utility: Check if event is ongoing
 */
export const isEventOngoing = (startTime, endTime) => {
  const now = new Date();
  return new Date(startTime) <= now && now <= new Date(endTime);
};

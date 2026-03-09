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
 * @param {string} params.from - Ngày bắt đầu (YYYY-MM-DD)
 * @param {string} params.to - Ngày kết thúc (YYYY-MM-DD)
 */
export const getShelterEvents = async (shelterId, params = {}) => {
  try {
    const queryParams = {
      ...(params.from && { from: params.from }),
      ...(params.to && { to: params.to }),
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
 * @param {string} eventData.eventName - Tên sự kiện
 * @param {string} eventData.eventDate - Ngày giờ (ISO string)
 * @param {string} eventData.eventType - Loại (HealthCheckup/Vaccination/Adoption/Training/Grooming/Other)
 * @param {number} eventData.petID - Pet ID (optional)
 * @param {string} eventData.description - Mô tả
 * @param {string} eventData.location - Địa điểm
 * @param {number} eventData.reminderBefore - Nhắc trước bao nhiêu giờ
 */
export const createShelterEvent = async (shelterId, eventData) => {
  try {
    const response = await axiosInstance.post(`/manage-shelter/${shelterId}/events`, {
      eventName: eventData.eventName,
      eventDate: eventData.eventDate,
      eventType: eventData.eventType,
      petID: eventData.petID || null,
      description: eventData.description,
      location: eventData.location,
      reminderBefore: eventData.reminderBefore || null,
    });
    
    return {
      success: true,
      data: response.data,
      message: response.data?.message || 'Thêm lịch hẹn thành công.',
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create event',
    };
  }
};

/**
 * Utility: Event types theo API spec
 */
export const EVENT_TYPES = [
  { value: 'HealthCheckup', label: 'Khám Sức Khỏe', icon: '🩺', color: '#1890FF' },
  { value: 'Vaccination', label: 'Tiêm Vaccine', icon: '💉', color: '#F5222D' },
  { value: 'Adoption', label: 'Lịch Hẹn Nhận Nuôi', icon: '❤️', color: '#eb2f96' },
  { value: 'Training', label: 'Huấn Luyện', icon: '🎓', color: '#722ED1' },
  { value: 'Grooming', label: 'Tắm Rửa / Chăm Sóc', icon: '✂️', color: '#52C41A' },
  { value: 'Other', label: 'Khác', icon: '📅', color: '#8c8c8c' },
];

/**
 * Utility: Get event type info
 */
export const getEventTypeInfo = (eventType) => {
  return EVENT_TYPES.find(t => t.value === eventType) || EVENT_TYPES[EVENT_TYPES.length - 1];
};

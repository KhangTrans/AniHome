import axiosInstance from '../axiosConfig';

/**
 * 📅 PARTNER EVENTS MANAGEMENT APIs
 * /api/Marketplace/partner/events
 * Role: Partner (RoleID = 3)
 * Requires: accessToken
 */

/**
 * GET /api/Marketplace/partner/events
 * Lấy lịch sự kiện của partner (shop/vet)
 * 
 * @param {Object} params - Query params
 * @param {string} params.from - Ngày bắt đầu (YYYY-MM-DD)
 * @param {string} params.to - Ngày kết thúc (YYYY-MM-DD)
 */
export const getPartnerEvents = async (params = {}) => {
  try {
    const queryParams = {
      ...(params.from && { from: params.from }),
      ...(params.to && { to: params.to }),
    };

    const queryString = new URLSearchParams(queryParams).toString();
    const url = queryString 
      ? `/Marketplace/partner/events?${queryString}`
      : `/Marketplace/partner/events`;
      
    const response = await axiosInstance.get(url);
    console.log('Fetching Partner Events URL:', url, 'Result:', response.data);
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Không thể tải lịch hẹn',
    };
  }
};

/**
 * POST /api/Marketplace/partner/events
 * Tạo sự kiện/lịch hẹn mới cho partner
 * 
 * @param {Object} eventData - Event information
 * @param {string} eventData.eventName - Tên sự kiện
 * @param {string} eventData.eventDate - Ngày giờ (ISO string)
 * @param {string} eventData.eventType - Loại (HealthCheckup/Vaccination/Adoption/Training/Grooming/Other)
 * @param {number} eventData.petID - Pet ID (optional)
 * @param {string} eventData.description - Mô tả
 * @param {string} eventData.location - Địa điểm
 * @param {number} eventData.reminderBefore - Nhắc trước bao nhiêu giờ
 */
export const createPartnerEvent = async (eventData) => {
  try {
    const response = await axiosInstance.post('/Marketplace/partner/events', {
      eventName: eventData.eventName,
      eventDate: eventData.eventDate,
      eventType: eventData.eventType,
      petID: eventData.petID || null,
      description: eventData.description,
      location: eventData.location,
      reminderBefore: eventData.reminderBefore || null,
      endTime: eventData.endTime || null,
    });
    
    return {
      success: true,
      data: response.data,
      message: response.data?.message || 'Thêm lịch hẹn thành công.',
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Không thể tạo sự kiện',
    };
  }
};

/**
 * DELETE /api/Marketplace/partner/events/{eventId}
 * Xóa sự kiện/lịch hẹn của partner
 * 
 * @param {number} eventId - ID của sự kiện cần xóa
 */
export const deletePartnerEvent = async (eventId) => {
  try {
    const response = await axiosInstance.delete(`/Marketplace/partner/events/${eventId}`);
    return {
      success: true,
      data: response.data,
      message: response.data?.message || 'Xóa lịch hẹn thành công.',
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Không thể xóa lịch hẹn',
    };
  }
};

/**
 * PUT /api/Marketplace/partner/events/{eventId}
 * Cập nhật sự kiện/lịch hẹn của partner
 * 
 * @param {number} eventId - ID của sự kiện cần cập nhật
 * @param {Object} eventData - Thông tin sự kiện mới
 */
export const updatePartnerEvent = async (eventId, eventData) => {
  try {
    const response = await axiosInstance.put(`/Marketplace/partner/events/${eventId}`, {
      eventName: eventData.eventName,
      eventDate: eventData.eventDate,
      eventType: eventData.eventType,
      petID: eventData.petID || null,
      description: eventData.description,
      location: eventData.location,
      reminderBefore: eventData.reminderBefore || null,
      endTime: eventData.endTime || null,
    });
    
    return {
      success: true,
      data: response.data,
      message: response.data?.message || 'Cập nhật lịch hẹn thành công.',
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Không thể cập nhật lịch hẹn',
    };
  }
};

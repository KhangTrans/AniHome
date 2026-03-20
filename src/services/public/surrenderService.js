import axiosInstance from '../axiosConfig';

export const submitRescueRequest = async (payload) => {
  try {
    const response = await axiosInstance.post('/Surrender/submit', payload);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Lấy danh sách yêu cầu cứu hộ theo khu vực của trạm (RoleID 2)
 * @param {string} status - Optional filter by status (Pending, Approved, Rejected)
 */
export const getRegionalRequests = async (status = null) => {
  try {
    let url = '/Surrender/regional-requests';
    if (status) {
      url += `?status=${status}`;
    }
    const response = await axiosInstance.get(url);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Không thể tải danh sách yêu cầu cứu hộ.'
    };
  }
};

/**
 * Xử lý yêu cầu cứu hộ (Chấp nhận/Từ chối)
 * @param {number} requestId - ID của yêu cầu
 * @param {Object} data - { status: 1|2, notes: string }
 */
export const processRescueRequest = async (requestId, data) => {
  try {
    const response = await axiosInstance.put(`/Surrender/${requestId}/process`, data);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Không thể xử lý yêu cầu.'
    };
  }
};

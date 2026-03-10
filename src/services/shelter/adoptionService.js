import axiosInstance from '../axiosConfig';

/**
 * ADOPTION MANAGEMENT APIs - /api/manage-shelter/{shelterId}/adoptions
 */

/**
 * GET /api/manage-shelter/{shelterId}/adoptions
 * Lấy danh sách yêu cầu nhận nuôi của trạm
 */
export const getAdoptionsByShelter = async (shelterId) => {
  try {
    const response = await axiosInstance.get(`/manage-shelter/${shelterId}/adoptions`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch adoption requests',
    };
  }
};

/**
 * PATCH /api/manage-shelter/{shelterId}/adoptions/{requestId}/status
 * Cập nhật trạng thái yêu cầu nhận nuôi (Approved/Rejected)
 */
export const updateAdoptionStatus = async (shelterId, requestId, newStatus) => {
  try {
    const response = await axiosInstance.patch(`/manage-shelter/${shelterId}/adoptions/${requestId}/status`, {
      newStatus,
    });
    return {
      success: true,
      data: response.data,
      message: response.data.message || `Request ${newStatus.toLowerCase()} successfully`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || `Failed to update status to ${newStatus}`,
    };
  }
};

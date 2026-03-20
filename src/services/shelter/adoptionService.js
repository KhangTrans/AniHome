import axiosInstance from '../axiosConfig';

/**
 * ADOPTION MANAGEMENT APIs - /api/manage-shelter/{shelterId}/adoptions
 */

/**
 * GET /api/manage-shelter/{shelterId}/adoptions
 * Lấy danh sách yêu cầu nhận nuôi của trạm
 * @param {number} shelterId - ID of the shelter
 * @param {string} status - Optional status filter (Pending/Approved/Rejected)
 */
export const getAdoptionsByShelter = async (shelterId, status = null) => {
  try {
    let url = `/manage-shelter/${shelterId}/adoptions`;
    if (status) {
      url += `?status=${status}`;
    }
    const response = await axiosInstance.get(url);
    console.log(`[ADOPTION SERVICE] Fetched adoptions (status: ${status || 'all'}):`, response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('[ADOPTION SERVICE] Error fetching adoptions:', error.response?.data || error.message);
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

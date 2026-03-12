import axiosInstance from '../axiosConfig';

/**
 * 💰 ADMIN DONATIONS APIs
 * /api/admin/donations
 * Role: Admin (RoleID = 1)
 */

/**
 * GET /api/admin/donations
 * Lấy lịch sử quyên góp toàn hệ thống
 */
export const getAdminDonations = async (params) => {
  try {
    const response = await axiosInstance.get('/Admin/donations', {
      params: {
        Keyword: params?.keyword,
        FromDate: params?.fromDate,
        ToDate: params?.toDate,
        ShelterID: params?.shelterId,
        Page: params?.page || 1,
        PageSize: params?.pageSize || 10
      }
    });
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Không thể tải lịch sử quyên góp',
    };
  }
};

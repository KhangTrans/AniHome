import axiosInstance from '../axiosConfig';

/**
 * 🛡️ ADMIN PETS APIs
 * /api/admin/pets
 * Role: Admin (RoleID = 1)
 */

/**
 * GET /api/admin/pets
 * Lấy danh sách thú cưng toàn hệ thống (có phân trang & lọc)
 */
export const getAdminPets = async (params) => {
  try {
    const response = await axiosInstance.get('/Admin/pets', {
      params: {
        Keyword: params?.keyword,
        CategoryID: params?.categoryId,
        Status: params?.status,
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
      error: error.response?.data?.message || 'Không thể tải danh sách thú cưng',
    };
  }
};

/**
 * GET /api/admin/pets/{id}
 * Lấy chi tiết thú cưng dành cho Admin
 */
export const getAdminPetDetail = async (id) => {
  try {
    const response = await axiosInstance.get(`/Admin/pets/${id}`);
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Không thể tải chi tiết thú cưng',
    };
  }
};

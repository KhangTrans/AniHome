import axiosInstance from '../axiosConfig';

/**
 * 🐾 SHELTER PETS MANAGEMENT APIs
 * /api/manage-shelter/{shelterId}/pets
 * Role: Shelter (RoleID = 2)
 * Requires: accessToken + own shelterId
 */

/**
 * GET /api/manage-shelter/{shelterId}/pets
 * Lấy danh sách pets của shelter
 * 
 * @param {number} shelterId - Shelter ID
 * @param {Object} params - Query params
 * @param {string} params.status - Filter by status (optional)
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.pageSize - Page size (default: 10)
 */
export const getShelterPets = async (shelterId, params = {}) => {
  try {
    const queryParams = {
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      ...(params.status && { status: params.status }),
    };

    const queryString = new URLSearchParams(queryParams).toString();
    const response = await axiosInstance.get(`/manage-shelter/${shelterId}/pets?${queryString}`);
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch shelter pets',
    };
  }
};

/**
 * POST /api/manage-shelter/{shelterId}/pets
 * Thêm pet mới vào shelter
 * 
 * @param {number} shelterId - Shelter ID
 * @param {Object} petData - Pet information
 * @param {string} petData.name - Tên thú cưng
 * @param {number} petData.categoryId - ID loại thú cưng
 * @param {string} petData.breed - Giống
 * @param {number} petData.age - Tuổi (tháng)
 * @param {string} petData.gender - Giới tính (Male/Female)
 * @param {string} petData.color - Màu sắc
 * @param {number} petData.weight - Cân nặng (kg)
 * @param {string} petData.healthStatus - Tình trạng sức khỏe
 * @param {string} petData.description - Mô tả
 * @param {string} petData.image - URL hình ảnh
 * @param {string} petData.status - Trạng thái (Available/Pending/Adopted)
 */
export const addShelterPet = async (shelterId, petData) => {
  try {
    const response = await axiosInstance.post(`/manage-shelter/${shelterId}/pets`, {
      name: petData.name,
      categoryId: petData.categoryId,
      breed: petData.breed,
      age: petData.age,
      gender: petData.gender,
      color: petData.color,
      weight: petData.weight,
      healthStatus: petData.healthStatus,
      description: petData.description,
      image: petData.image,
      status: petData.status || 'Available',
    });
    
    return {
      success: true,
      data: response.data,
      message: 'Thêm thú cưng thành công!',
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to add pet',
    };
  }
};

/**
 * PATCH /api/manage-shelter/{shelterId}/pets/{petId}/status
 * Cập nhật trạng thái pet
 * 
 * @param {number} shelterId - Shelter ID
 * @param {number} petId - Pet ID
 * @param {string} status - New status (Available/Pending/Adopted)
 */
export const updatePetStatus = async (shelterId, petId, status) => {
  try {
    const response = await axiosInstance.patch(
      `/manage-shelter/${shelterId}/pets/${petId}/status`,
      { status }
    );
    
    return {
      success: true,
      data: response.data,
      message: 'Cập nhật trạng thái thành công!',
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update pet status',
    };
  }
};

/**
 * Utility: Validate pet data
 */
export const validatePetData = (data) => {
  const errors = {};
  
  if (!data.name) errors.name = 'Vui lòng nhập tên thú cưng';
  if (!data.categoryId) errors.categoryId = 'Vui lòng chọn loại thú cưng';
  if (!data.breed) errors.breed = 'Vui lòng nhập giống';
  if (!data.age) errors.age = 'Vui lòng nhập tuổi';
  if (!data.gender) errors.gender = 'Vui lòng chọn giới tính';
  if (!data.healthStatus) errors.healthStatus = 'Vui lòng nhập tình trạng sức khỏe';
  
  if (data.age && (data.age < 0 || data.age > 300)) {
    errors.age = 'Tuổi không hợp lệ';
  }
  
  if (data.weight && (data.weight < 0 || data.weight > 200)) {
    errors.weight = 'Cân nặng không hợp lệ';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Utility: Get pet gender options
 */
export const PET_GENDER_OPTIONS = [
  { value: 'Male', label: 'Đực', icon: '♂️' },
  { value: 'Female', label: 'Cái', icon: '♀️' },
];

/**
 * Utility: Get pet status options
 */
export const PET_STATUS_OPTIONS = [
  { value: 'Available', label: 'Sẵn sàng', color: '#10b981' },
  { value: 'Pending', label: 'Đang duyệt', color: '#f59e0b' },
  { value: 'Adopted', label: 'Đã nhận nuôi', color: '#6b7280' },
];

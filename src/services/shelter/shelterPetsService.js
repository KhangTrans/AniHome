import axiosInstance from "../axiosConfig";

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
 * @param {string} params.keyword - Search by pet name (optional)
 * @param {number} params.categoryId - Filter by category (optional)
 * @param {string} params.status - Filter by status (optional)
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.pageSize - Page size (default: 10)
 */
export const getShelterPets = async (shelterId, params = {}) => {
  try {
    const queryParams = {
      page: params.page || 1,
      pageSize: params.pageSize || 10,
      ...(params.keyword && { keyword: params.keyword }),
      ...(params.categoryId && { categoryId: params.categoryId }),
      ...(params.status && { status: params.status }),
    };

    const queryString = new URLSearchParams(queryParams).toString();
    const response = await axiosInstance.get(
      `/manage-shelter/${shelterId}/pets?${queryString}`,
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch shelter pets",
    };
  }
};

/**
 * POST /api/manage-shelter/{shelterId}/pets
 * Thêm pet mới vào shelter
 *
 * @param {number} shelterId - Shelter ID
 * @param {Object} petData - Pet information
 * @param {string} petData.petName - Tên thú cưng
 * @param {number} petData.categoryID - ID loại thú cưng
 * @param {string} petData.breed - Giống
 * @param {number} petData.age - Tuổi
 * @param {string} petData.gender - Giới tính (Male/Female)
 * @param {string} petData.color - Màu sắc
 * @param {number} petData.weight - Cân nặng (kg)
 * @param {string} petData.healthStatus - Tình trạng sức khỏe
 * @param {string} petData.vaccinationStatus - Tình trạng tiêm chủng
 * @param {string} petData.description - Mô tả
 * @param {string} petData.imageURL - URL hình ảnh
 */
export const addShelterPet = async (shelterId, petData) => {
  try {
    const response = await axiosInstance.post(
      `/manage-shelter/${shelterId}/pets`,
      {
        petName: petData.petName,
        categoryID: petData.categoryID,
        breed: petData.breed,
        age: petData.age,
        gender: petData.gender,
        color: petData.color,
        weight: petData.weight,
        healthStatus: petData.healthStatus,
        vaccinationStatus: petData.vaccinationStatus,
        description: petData.description,
        imageURL: petData.imageUrls?.[0] || petData.imageURL || "",
        imageUrls:
          petData.imageUrls || (petData.imageURL ? [petData.imageURL] : []),
        status: petData.status || "Available",
      },
    );

    return {
      success: true,
      data: response.data,
      message: "Thêm hồ sơ thú cưng thành công.",
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to add pet",
    };
  }
};

/**
 * PUT /api/manage-shelter/{shelterId}/pets/{petId}
 * Cập nhật thông tin pet
 *
 * @param {number} shelterId - Shelter ID
 * @param {number} petId - Pet ID
 * @param {Object} petData - Pet information
 */
export const updateShelterPet = async (shelterId, petId, petData) => {
  try {
    const response = await axiosInstance.put(
      `/manage-shelter/${shelterId}/pets/${petId}`,
      {
        petName: petData.petName,
        categoryID: petData.categoryID,
        breed: petData.breed,
        age: petData.age,
        gender: petData.gender,
        color: petData.color,
        weight: petData.weight,
        healthStatus: petData.healthStatus,
        vaccinationStatus: petData.vaccinationStatus,
        description: petData.description,
        imageURL: petData.imageUrls?.[0] || petData.imageURL || "",
        imageUrls:
          petData.imageUrls || (petData.imageURL ? [petData.imageURL] : []),
        status: petData.status || "Available",
      },
    );

    return {
      success: true,
      data: response.data,
      message: "Cập nhật hồ sơ thú cưng thành công.",
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to update pet",
    };
  }
};

/**
 * PATCH /api/manage-shelter/{shelterId}/pets/{petId}/status
 * Cập nhật trạng thái pet
 *
 * @param {number} shelterId - Shelter ID
 * @param {number} petId - Pet ID
 * @param {string} newStatus - New status (Available/Adopted/InTreatment/Reserved/Deceased)
 */
export const updatePetStatus = async (shelterId, petId, newStatus) => {
  try {
    const response = await axiosInstance.patch(
      `/manage-shelter/${shelterId}/pets/${petId}/status`,
      { newStatus },
    );

    return {
      success: true,
      data: response.data,
      message: "Cập nhật trạng thái thành công.",
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to update pet status",
    };
  }
};

/**
 * DELETE /api/pets/{petId}
 * Xóa pet
 *
 * @param {number} petId - Pet ID
 */
export const deleteShelterPet = async (petId) => {
  try {
    const response = await axiosInstance.delete(
      `/pets/${petId}`,
    );

    return {
      success: true,
      data: response.data,
      message: "Xóa hồ sơ thú cưng thành công.",
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to delete pet",
    };
  }
};

/**
 * Utility: Validate pet data
 */
export const validatePetData = (data) => {
  const errors = {};

  if (!data.petName) errors.petName = "Vui lòng nhập tên thú cưng";
  if (!data.categoryID) errors.categoryID = "Vui lòng chọn loại thú cưng";
  if (!data.breed) errors.breed = "Vui lòng nhập giống";
  if (!data.age) errors.age = "Vui lòng nhập tuổi";
  if (!data.gender) errors.gender = "Vui lòng chọn giới tính";
  if (!data.healthStatus)
    errors.healthStatus = "Vui lòng nhập tình trạng sức khỏe";

  if (data.age && (data.age < 0 || data.age > 300)) {
    errors.age = "Tuổi không hợp lệ";
  }

  if (data.weight && (data.weight < 0 || data.weight > 200)) {
    errors.weight = "Cân nặng không hợp lệ";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Utility: Pet status options
 */
export const PET_STATUS_OPTIONS = [
  { value: "Available", label: "Sẵn Sàng Nhận Nuôi", color: "success" },
  { value: "InTreatment", label: "Đang Điều Trị", color: "warning" },
  { value: "Reserved", label: "Đã Đặt Trước", color: "processing" },
  { value: "Adopted", label: "Đã Được Nhận Nuôi", color: "default" },
  { value: "Deceased", label: "Đã Mất", color: "error" },
];

/**
 * Utility: Get pet gender options
 */
export const PET_GENDER_OPTIONS = [
  { value: "Male", label: "Đực", icon: "♂️" },
  { value: "Female", label: "Cái", icon: "♀️" },
];

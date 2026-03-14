import axiosInstance from "../axiosConfig";

/**
 * 🏥 SHELTER DASHBOARD APIs
 * /api/shelters/{shelterId}/dashboard
 * Role: Shelter (RoleID = 2)
 * Requires: accessToken + own shelterId
 */

/**
 * GET /api/shelters/{shelterId}/dashboard
 * Lấy thông tin dashboard của shelter
 *
 * @param {number} shelterId - Shelter ID
 */
export const getShelterDashboard = async (shelterId) => {
  try {
    const response = await axiosInstance.get(
      `/shelters/${shelterId}/dashboard`,
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message || "Failed to fetch shelter dashboard",
    };
  }
};

/**
 * GET /api/manage-shelter/{shelterId}/profile
 * Lấy thông tin chi tiết hồ sơ trạm cứu hộ (Dành cho Quản lý trạm)
 */
export const getShelterProfile = async (shelterId) => {
  try {
    const response = await axiosInstance.get(
      `/manage-shelter/${shelterId}/profile`,
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch shelter profile",
    };
  }
};

/**
 * PUT /api/manage-shelter/{shelterId}/profile
 * Cập nhật hồ sơ trạm (Bao gồm danh sách ảnh imageUrls)
 */
export const updateShelterProfile = async (shelterId, profileData) => {
  try {
    const response = await axiosInstance.put(
      `/manage-shelter/${shelterId}/profile`,
      {
        shelterName: profileData.shelterName,
        location: profileData.location,
        description: profileData.description,
        bankName: profileData.bankName,
        accountNumber: profileData.accountNumber,
        imageUrls: profileData.imageUrls || [],
      },
    );

    return {
      success: true,
      data: response.data,
      message: "Cập nhật hồ sơ trạm thành công!",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message || "Failed to update shelter profile",
    };
  }
};

/**
 * Utility: Format dashboard stats
 */
export const formatDashboardStats = (stats) => {
  return {
    totalPets: stats.totalPets || 0,
    availablePets: stats.availablePets || 0,
    adoptedPets: stats.adoptedPets || 0,
    pendingAdoptions: stats.pendingAdoptions || 0,
    upcomingEvents: stats.upcomingEvents || 0,
    lowStockItems: stats.lowStockItems || 0,
  };
};

/**
 * Utility: Get quick stats for dashboard cards
 */
export const getDashboardCards = (stats) => {
  return [
    {
      title: "Tổng Thú Cưng",
      value: stats.totalPets || 0,
      icon: "🐾",
      color: "#3b82f6",
      trend: "+12% từ tháng trước",
    },
    {
      title: "Sẵn Sàng Nhận Nuôi",
      value: stats.availablePets || 0,
      icon: "❤️",
      color: "#10b981",
      trend: "Đang chờ chủ mới",
    },
    {
      title: "Yêu Cầu Chờ Duyệt",
      value: stats.pendingAdoptions || 0,
      icon: "📋",
      color: "#f59e0b",
      trend: "Cần xử lý",
    },
    {
      title: "Sự Kiện Sắp Tới",
      value: stats.upcomingEvents || 0,
      icon: "📅",
      color: "#8b5cf6",
      trend: "Trong tuần này",
    },
  ];
};

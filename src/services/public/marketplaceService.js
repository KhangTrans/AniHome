import axiosInstance from "../axiosConfig";

/**
 * GET /api/Marketplace/products/count?shelterId={shelterId}
 * Lấy tổng số sản phẩm gây quỹ của một shelter
 */
export const getMarketplaceProductCountByShelter = async (shelterId) => {
  try {
    const response = await axiosInstance.get("/Marketplace/products/count", {
      params: { shelterId },
    });

    return {
      success: true,
      totalProducts:
        response.data?.totalProducts ?? response.data?.TotalProducts ?? 0,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      totalProducts: 0,
      error: error.response?.data?.message || "Failed to fetch product count",
    };
  }
};

/**
 * GET /api/Marketplace/products/list?shelterId={shelterId}
 * Lấy danh sách sản phẩm gây quỹ theo shelter
 */
export const getMarketplaceProductsByShelter = async (shelterId) => {
  try {
    const response = await axiosInstance.get("/Marketplace/products/list", {
      params: { shelterId },
    });

    return {
      success: true,
      data: Array.isArray(response.data) ? response.data : [],
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      error: error.response?.data?.message || "Failed to fetch products list",
    };
  }
};

/**
 * GET /api/Marketplace/packages
 * Lấy danh sách các gói đăng ký gian hàng
 */
export const getMarketplacePackages = async () => {
  try {
    const response = await axiosInstance.get("/Marketplace/packages");

    return {
      success: true,
      data: Array.isArray(response.data) ? response.data : [],
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      error: error.response?.data?.message || "Failed to fetch packages",
    };
  }
};

/**
 * POST /api/Marketplace/subscription/packages/{packageId}/subscribe
 * Dang ky goi subscription cho tai khoan hien tai
 */
export const subscribeMarketplacePackage = async (packageId) => {
  try {
    const response = await axiosInstance.post(
      `/Marketplace/subscription/packages/${packageId}/subscribe`,
    );

    return {
      success: true,
      data: response.data,
      message: response.data?.message || response.data?.Message || "Dang ky goi thanh cong",
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.response?.data?.Message || "Khong the dang ky goi",
    };
  }
};

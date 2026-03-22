import axiosInstance from "../axiosConfig";

/**
 * GET /api/manage-shelter/{shelterId}/store/products
 * Lấy danh sách sản phẩm của một shelter từ Store API
 */
export const getProductsByShelterId = async (shelterId) => {
  try {
    const response = await axiosInstance.get(
      `/manage-shelter/${shelterId}/store/products`
    );

    console.log("Products from Store API:", response.data);

    return {
      success: true,
      data: Array.isArray(response.data) ? response.data : [],
    };
  } catch (error) {
    console.error("Error fetching products from store:", error);
    return {
      success: false,
      data: [],
      error: error.response?.data?.message || "Failed to fetch products",
    };
  }
};

/**
 * GET /api/manage-shelter/{shelterId}/store/products/{productId}
 * Lấy chi tiết một sản phẩm cụ thể
 */
export const getProductDetail = async (shelterId, productId) => {
  try {
    const response = await axiosInstance.get(
      `/manage-shelter/${shelterId}/store/products/${productId}`
    );

    console.log("Product Detail:", response.data);

    return {
      success: true,
      data: response.data || null,
    };
  } catch (error) {
    console.error("Error fetching product detail:", error);
    return {
      success: false,
      data: null,
      error: error.response?.data?.message || "Failed to fetch product detail",
    };
  }
};

/**
 * POST /api/marketplace/partner/{profileId}/order
 * Tạo đơn hàng mua sản phẩm
 */
export const createOrder = async (profileId, orderData) => {
  try {
    const response = await axiosInstance.post(
      `/marketplace/partner/${profileId}/order`,
      orderData
    );

    console.log("Order created:", response.data);

    return {
      success: true,
      message: response.data?.message || "Đơn hàng đã được tạo thành công",
      data: response.data,
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể tạo đơn hàng",
      error: error.response?.data,
    };
  }
};

/**
 * GET /api/marketplace/my-orders
 * Lấy lịch sử đơn hàng của user
 */
export const getMyOrders = async () => {
  try {
    const response = await axiosInstance.get("/marketplace/my-orders");

    console.log("My orders:", response.data);

    return {
      success: true,
      data: Array.isArray(response.data) ? response.data : [],
    };
  } catch (error) {
    console.error("Error fetching my orders:", error);
    return {
      success: false,
      data: [],
      error: error.response?.data?.message || "Failed to fetch orders",
    };
  }
};

/**
 * GET /api/marketplace/orders/{orderId}
 * Lấy chi tiết một đơn hàng
 */
export const getOrderDetail = async (orderId) => {
  try {
    const response = await axiosInstance.get(`/marketplace/orders/${orderId}`);

    console.log("Order detail:", response.data);

    return {
      success: true,
      data: response.data || null,
    };
  } catch (error) {
    console.error("Error fetching order detail:", error);
    return {
      success: false,
      data: null,
      error: error.response?.data?.message || "Failed to fetch order detail",
    };
  }
};

/**
 * PUT /api/marketplace/orders/{orderId}/cancel
 * Hủy đơn hàng
 */
export const cancelOrder = async (orderId) => {
  try {
    const response = await axiosInstance.put(
      `/marketplace/orders/${orderId}/cancel`
    );

    console.log("Order cancelled:", response.data);

    return {
      success: true,
      message: response.data?.message || "Đơn hàng đã được hủy",
      data: response.data,
    };
  } catch (error) {
    console.error("Error cancelling order:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể hủy đơn hàng",
      error: error.response?.data,
    };
  }
};

/**
 * GET /api/marketplace/partner/orders
 * Lấy danh sách đơn hàng của seller/partner
 */
export const getPartnerOrders = async () => {
  try {
    const response = await axiosInstance.get("/marketplace/partner/orders");

    console.log("Partner orders:", response.data);

    return {
      success: true,
      data: Array.isArray(response.data) ? response.data : [],
    };
  } catch (error) {
    console.error("Error fetching partner orders:", error);
    return {
      success: false,
      data: [],
      error: error.response?.data?.message || "Failed to fetch partner orders",
    };
  }
};

/**
 * PUT /api/marketplace/order/{orderId}/status
 * Cập nhật trạng thái đơn hàng (dành cho seller/partner)
 */
export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const response = await axiosInstance.put(
      `/marketplace/order/${orderId}/status`,
      { status: newStatus }
    );

    console.log("Order status updated:", response.data);

    return {
      success: true,
      message: response.data?.message || "Trạng thái đơn hàng đã được cập nhật",
      data: response.data,
    };
  } catch (error) {
    console.error("Error updating order status:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể cập nhật trạng thái",
      error: error.response?.data,
    };
  }
};

/**
 * GET /api/marketplace/products/count?shelterId={shelterId}
 * Lấy tổng số sản phẩm gây quỹ của một shelter
 */
export const getMarketplaceProductCountByShelter = async (shelterId) => {
  try {
    const response = await axiosInstance.get("/marketplace/products/count", {
      params: { shelterId },
    });

    return {
      success: true,
      totalProducts:
        response.data?.totalProducts ?? response.data?.TotalProducts ?? 0,
      data: response.data,
    };
  } catch (error) {
    console.error("Error fetching product count:", error);
    return {
      success: false,
      totalProducts: 0,
      error: error.response?.data?.message || "Failed to fetch product count",
    };
  }
};

/**
 * GET /api/marketplace/products/list?shelterId={shelterId}
 * Lấy danh sách sản phẩm gây quỹ theo shelter
 */
export const getMarketplaceProductsByShelter = async (shelterId) => {
  try {
    const response = await axiosInstance.get("/marketplace/products/list", {
      params: { shelterId },
    });

    console.log("Products fetched:", response.data);

    return {
      success: true,
      data: Array.isArray(response.data) ? response.data : [],
    };
  } catch (error) {
    console.error("Error fetching products by shelter:", error);
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

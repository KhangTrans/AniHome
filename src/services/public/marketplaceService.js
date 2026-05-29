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

/**
 * GET /api/Marketplace/subscription/status
 * Lấy trạng thái đăng ký và thông tin hồ sơ của partner hiện tại (bao gồm StoreType)
 */
export const getPartnerSubscriptionStatus = async () => {
  try {
    const response = await axiosInstance.get("/Marketplace/subscription/status");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Không thể lấy trạng thái đăng ký",
    };
  }
};

/**
 * POST /api/Marketplace/partners
 * Thiết lập hồ sơ và loại hình kinh doanh ban đầu cho đối tác
 */
export const registerPartnerProfile = async (partnerData) => {
  try {
    const response = await axiosInstance.post("/Marketplace/partners", {
      storeName: partnerData.storeName,
      storeType: partnerData.storeType, // "Shop", "Vet", "Spa"
      address: partnerData.address || "N/A",
      regionID: partnerData.regionID || 1,
      contactPhone: partnerData.contactPhone || "",
      description: partnerData.description || "",
    });
    return {
      success: true,
      data: response.data,
      message: response.data?.message || "Thiết lập hồ sơ thành công",
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || "Không thể thiết lập hồ sơ",
    };
  }
};

/**
 * GET /api/Marketplace/my-products
 * Lấy danh sách sản phẩm của chính đối tác đang đăng nhập
 */
export const getPartnerProducts = async () => {
  try {
    const response = await axiosInstance.get("/Marketplace/my-products");
    return {
      success: true,
      data: Array.isArray(response.data) ? response.data : [],
    };
  } catch (error) {
    console.error("Error fetching partner products:", error);
    return {
      success: false,
      data: [],
      error: error.response?.data?.message || "Không thể lấy danh sách sản phẩm",
    };
  }
};

/**
 * POST /api/Marketplace/products
 * Tạo mới sản phẩm đối tác
 */
export const createPartnerProduct = async (productData) => {
  try {
    const payload = {
      productName: productData.productName || productData.name,
      ProductName: productData.productName || productData.name,
      name: productData.productName || productData.name,
      Name: productData.productName || productData.name,
      price: Number(productData.price),
      Price: Number(productData.price),
      quantity: Number(productData.quantity || productData.stock || 0),
      Quantity: Number(productData.quantity || productData.stock || 0),
      stock: Number(productData.quantity || productData.stock || 0),
      Stock: Number(productData.quantity || productData.stock || 0),
      unit: productData.unit || "cái",
      Unit: productData.unit || "cái",
      categoryID: productData.categoryID || null,
      CategoryID: productData.categoryID || null,
      categoryId: productData.categoryID || null,
      imageUrls: Array.isArray(productData.imageUrls) ? productData.imageUrls : [productData.image || ""].filter(Boolean),
      ImageUrls: Array.isArray(productData.imageUrls) ? productData.imageUrls : [productData.image || ""].filter(Boolean),
      imageUrl: Array.isArray(productData.imageUrls) && productData.imageUrls.length > 0 ? productData.imageUrls[0] : (productData.image || ""),
      ImageUrl: Array.isArray(productData.imageUrls) && productData.imageUrls.length > 0 ? productData.imageUrls[0] : (productData.image || ""),
      description: productData.description || productData.desc || "",
      Description: productData.description || productData.desc || "",
    };
    const response = await axiosInstance.post("/Marketplace/products", payload);
    return {
      success: true,
      message: response.data?.message || "Thêm sản phẩm thành công",
      data: response.data,
    };
  } catch (error) {
    console.error("Error creating partner product:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể thêm sản phẩm",
    };
  }
};

/**
 * PUT /api/Marketplace/products/{productId}
 * Cập nhật sản phẩm đối tác
 */
export const updatePartnerProduct = async (productId, productData) => {
  try {
    const payload = {
      id: productId,
      Id: productId,
      productID: productId,
      ProductID: productId,
      productName: productData.productName || productData.name,
      ProductName: productData.productName || productData.name,
      name: productData.productName || productData.name,
      Name: productData.productName || productData.name,
      price: Number(productData.price),
      Price: Number(productData.price),
      quantity: Number(productData.quantity || productData.stock || 0),
      Quantity: Number(productData.quantity || productData.stock || 0),
      stock: Number(productData.quantity || productData.stock || 0),
      Stock: Number(productData.quantity || productData.stock || 0),
      unit: productData.unit || "cái",
      Unit: productData.unit || "cái",
      categoryID: productData.categoryID || null,
      CategoryID: productData.categoryID || null,
      categoryId: productData.categoryID || null,
      imageUrls: Array.isArray(productData.imageUrls) ? productData.imageUrls : [productData.image || ""].filter(Boolean),
      ImageUrls: Array.isArray(productData.imageUrls) ? productData.imageUrls : [productData.image || ""].filter(Boolean),
      imageUrl: Array.isArray(productData.imageUrls) && productData.imageUrls.length > 0 ? productData.imageUrls[0] : (productData.image || ""),
      ImageUrl: Array.isArray(productData.imageUrls) && productData.imageUrls.length > 0 ? productData.imageUrls[0] : (productData.image || ""),
      description: productData.description || productData.desc || "",
      Description: productData.description || productData.desc || "",
      isActive: productData.isActive !== false,
      IsActive: productData.isActive !== false,
    };
    const response = await axiosInstance.put(`/Marketplace/products/${productId}`, payload);
    return {
      success: true,
      message: response.data?.message || "Cập nhật sản phẩm thành công",
      data: response.data,
    };
  } catch (error) {
    console.error("Error updating partner product:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể cập nhật sản phẩm",
    };
  }
};

/**
 * DELETE /api/Marketplace/products/{productId}
 * Xóa sản phẩm đối tác
 */
export const deletePartnerProduct = async (productId) => {
  try {
    const response = await axiosInstance.delete(`/Marketplace/products/${productId}`);
    return {
      success: true,
      message: response.data?.message || "Xóa sản phẩm thành công",
      data: response.data,
    };
  } catch (error) {
    console.error("Error deleting partner product:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể xóa sản phẩm",
    };
  }
};

/**
 * GET /api/admin/categories
 * Lấy danh sách danh mục sản phẩm từ hệ thống
 */
export const getCategories = async () => {
  try {
    const response = await axiosInstance.get("/admin/categories");
    return {
      success: true,
      data: Array.isArray(response.data) ? response.data : [],
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return {
      success: false,
      data: [],
      error: error.response?.data?.message || "Failed to fetch categories",
    };
  }
};

/**
 * GET /api/Marketplace/partner/profile
 * Lấy chi tiết hồ sơ đối tác
 */
export const getPartnerProfile = async () => {
  try {
    const response = await axiosInstance.get("/Marketplace/partner/profile");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error fetching partner profile:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Không thể lấy thông tin hồ sơ đối tác",
    };
  }
};

/**
 * PUT /api/Marketplace/partner/profile
 * Cập nhật hồ sơ đối tác
 */
export const updatePartnerProfile = async (profileData) => {
  try {
    const response = await axiosInstance.put("/Marketplace/partner/profile", profileData);
    return {
      success: true,
      message: response.data?.message || "Cập nhật hồ sơ thành công",
      data: response.data,
    };
  } catch (error) {
    console.error("Error updating partner profile:", error);
    const detailError = error.response?.data?.message || error.response?.data?.Message || error.response?.data?.error || error.response?.data?.Error;
    return {
      success: false,
      error: detailError ? `Không thể cập nhật hồ sơ đối tác: ${detailError}` : "Không thể cập nhật hồ sơ đối tác",
    };
  }
};

/**
 * GET /api/Marketplace/partner/patients
 * Lấy danh sách bệnh nhân (thú cưng) và lịch sử hồ sơ sức khỏe từ database
 */
export const getPartnerPatients = async () => {
  try {
    const response = await axiosInstance.get("/Marketplace/partner/patients");
    return {
      success: true,
      data: Array.isArray(response.data) ? response.data : [],
    };
  } catch (error) {
    console.error("Error fetching partner patients:", error);
    return {
      success: false,
      data: [],
      error: error.response?.data?.message || "Không thể lấy danh sách bệnh nhân",
    };
  }
};

/**
 * POST /api/Marketplace/partner/patients/health-records
 * Thêm hồ sơ bệnh án mới cho thú cưng
 */
export const createPartnerHealthRecord = async (payload) => {
  try {
    const response = await axiosInstance.post(
      "/Marketplace/partner/patients/health-records",
      payload
    );
    return {
      success: true,
      message: response.data?.message || "Tạo hồ sơ bệnh án thành công",
      data: response.data,
    };
  } catch (error) {
    console.error("Error creating health record:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Không thể tạo hồ sơ bệnh án",
    };
  }
};

/**
 * PUT /api/Marketplace/partner/patients/health-records/{recordId}
 * Sửa hồ sơ bệnh án
 */
export const updatePartnerHealthRecord = async (recordId, payload) => {
  try {
    const response = await axiosInstance.put(
      `/Marketplace/partner/patients/health-records/${recordId}`,
      payload
    );
    return {
      success: true,
      message: response.data?.message || "Cập nhật hồ sơ bệnh án thành công",
      data: response.data,
    };
  } catch (error) {
    console.error("Error updating health record:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Không thể cập nhật hồ sơ bệnh án",
    };
  }
};

/**
 * DELETE /api/Marketplace/partner/patients/health-records/{recordId}
 * Xóa hồ sơ bệnh án
 */
export const deletePartnerHealthRecord = async (recordId) => {
  try {
    const response = await axiosInstance.delete(
      `/Marketplace/partner/patients/health-records/${recordId}`
    );
    return {
      success: true,
      message: response.data?.message || "Xóa hồ sơ bệnh án thành công",
      data: response.data,
    };
  } catch (error) {
    console.error("Error deleting health record:", error);
    return {
      success: false,
      error: error.response?.data?.message || "Không thể xóa hồ sơ bệnh án",
    };
  }
};


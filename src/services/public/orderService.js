import axiosConfig from "../axiosConfig";

/**
 * Fetch user's order history
 * @param {number} page - Page number (default: 1)
 * @param {number} pageSize - Items per page (default: 10)
 */
export const getOrderHistory = async (page = 1, pageSize = 10) => {
    try {
        console.log("[orderService] Fetching order history...", { page, pageSize });
        const response = await axiosConfig.get("/orders", {
            params: { page, pageSize }
        });

        if (response.data) {
            const orders = Array.isArray(response.data) ? response.data : response.data.data || [];
            console.log("[orderService] Orders loaded:", orders.length);
            return { success: true, data: orders };
        }

        return { success: false, error: "Không có dữ liệu đơn hàng" };
    } catch (error) {
        console.error("[orderService] Error fetching order history:", error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.message || "Không thể tải lịch sử đơn hàng",
        };
    }
};

/**
 * Get detailed information about a specific order
 * @param {string} orderId - Order ID
 */
export const getOrderDetail = async (orderId) => {
    try {
        console.log("[orderService] Fetching order detail...", orderId);
        const response = await axiosConfig.get(`/orders/${orderId}`);

        if (response.data) {
            console.log("[orderService] Order detail loaded");
            return { success: true, data: response.data };
        }

        return { success: false, error: "Không tìm thấy đơn hàng" };
    } catch (error) {
        console.error("[orderService] Error fetching order detail:", error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.message || "Không thể tải chi tiết đơn hàng",
        };
    }
};

/**
 * Get order tracking/shipping status
 * @param {string} orderId - Order ID
 */
export const getOrderTracking = async (orderId) => {
    try {
        console.log("[orderService] Fetching order tracking...", orderId);
        const response = await axiosConfig.get(`/orders/${orderId}/tracking`);

        if (response.data) {
            return { success: true, data: response.data };
        }

        return { success: false, error: "Không tìm thấy thông tin vận chuyển" };
    } catch (error) {
        console.error("[orderService] Error fetching tracking:", error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.message || "Không thể tải thông tin vận chuyển",
        };
    }
};

/**
 * Cancel an order
 * @param {string} orderId - Order ID to cancel
 * @param {string} reason - Reason for cancellation
 */
export const cancelOrder = async (orderId, reason = "") => {
    try {
        console.log("[orderService] Canceling order...", orderId);
        const response = await axiosConfig.post(`/orders/${orderId}/cancel`, {
            CancellationReason: reason
        });

        if (response.data) {
            console.log("[orderService] Order cancelled successfully");
            return { success: true, data: response.data, message: "Hủy đơn hàng thành công" };
        }

        return { success: false, error: "Không thể hủy đơn hàng" };
    } catch (error) {
        console.error("[orderService] Error canceling order:", error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.message || "Không thể hủy đơn hàng",
        };
    }
};

/**
 * Get order status options
 */
export const getOrderStatusLabel = (status) => {
    const statusMap = {
        "pending": { label: "Chờ xác nhận", color: "#f59e0b", icon: "⏳" },
        "confirmed": { label: "Đã xác nhận", color: "#3b82f6", icon: "✓" },
        "processing": { label: "Đang chuẩn bị", color: "#8b5cf6", icon: "📦" },
        "shipped": { label: "Đang giao hàng", color: "#06b6d4", icon: "🚚" },
        "delivered": { label: "Đã giao", color: "#10b981", icon: "✅" },
        "cancelled": { label: "Đã hủy", color: "#ef4444", icon: "❌" },
        "failed": { label: "Giao không thành công", color: "#ff6b6b", icon: "⚠️" },
    };

    return statusMap[status?.toLowerCase()] || { label: "Không xác định", color: "#999", icon: "❓" };
};

/**
 * Get payment status label
 */
export const getPaymentStatusLabel = (status) => {
    const statusMap = {
        "pending": { label: "Chưa thanh toán", color: "#f59e0b", icon: "⏳" },
        "completed": { label: "Đã thanh toán", color: "#10b981", icon: "✓" },
        "failed": { label: "Thanh toán thất bại", color: "#ef4444", icon: "❌" },
        "refunded": { label: "Đã hoàn tiền", color: "#06b6d4", icon: "↩️" },
    };

    return statusMap[status?.toLowerCase()] || { label: "---", color: "#999", icon: "?" };
};

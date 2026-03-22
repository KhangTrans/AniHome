import axiosConfig from "../axiosConfig";

/**
 * Order Payment Service - Quản lý thanh toán và vận chuyên
 * Gọi API từ /api/order-payment
 */

// ===== PAYMENT METHODS =====
export const getPaymentMethods = async () => {
    try {
        const response = await axiosConfig.get("/order-payment/methods");
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.Message || error.message,
        };
    }
};

// ===== SHIPPING CARRIERS =====
export const getShippingCarriers = async () => {
    try {
        const response = await axiosConfig.get("/order-payment/carriers");
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.Message || error.message,
        };
    }
};

// ===== SELECT PAYMENT METHOD =====
export const selectPaymentMethod = async (orderId, paymentMethod, shippingCarrier = null) => {
    try {
        // Backend DTO expects PascalCase: PaymentMethod, ShippingCarrier
        const payload = {
            PaymentMethod: paymentMethod,
            ShippingCarrier: shippingCarrier,
        };
        const response = await axiosConfig.post(
            `/order-payment/orders/${orderId}/select-payment`,
            payload
        );
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.Message || error.message,
        };
    }
};

// ===== GET ORDER PAYMENT DETAIL =====
export const getOrderPaymentDetail = async (orderId) => {
    try {
        const response = await axiosConfig.get(`/order-payment/orders/${orderId}/payment-detail`);
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.Message || error.message,
        };
    }
};

// ===== CREATE VIETQR PAYMENT =====
export const createVietQRPayment = async (orderId, returnUrl = "") => {
    try {
        const response = await axiosConfig.post(
            `/order-payment/orders/${orderId}/vietqr`,
            {},
            {
                params: { returnUrl },
            }
        );
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.Message || error.message,
        };
    }
};

// ===== CHECK PAYMENT STATUS =====
export const checkPaymentStatus = async (orderId) => {
    try {
        const response = await axiosConfig.get(`/order-payment/orders/${orderId}/payment-status`);
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.Message || error.message,
        };
    }
};

// ===== GET SHIPPING DETAIL =====
export const getShippingDetail = async (orderId) => {
    try {
        const response = await axiosConfig.get(`/order-payment/orders/${orderId}/shipping`);
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.Message || error.message,
        };
    }
};

// ===== UPDATE TRACKING NUMBER =====
export const updateTrackingNumber = async (orderId, shippingCarrier, trackingNumber) => {
    try {
        // Backend DTO expects PascalCase: ShippingCarrier, TrackingNumber
        const payload = {
            ShippingCarrier: shippingCarrier,
            TrackingNumber: trackingNumber,
        };
        const response = await axiosConfig.put(
            `/order-payment/orders/${orderId}/tracking`,
            payload
        );
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.Message || error.message,
        };
    }
};

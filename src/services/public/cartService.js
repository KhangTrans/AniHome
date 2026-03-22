import axiosConfig from "../axiosConfig";

/**
 * Cart Service - Quản lý giỏ hàng từ backend API
 * Gọi API từ /api/cart
 */

// ===== GET CART =====
export const getCart = async () => {
    try {
        const response = await axiosConfig.get("/cart");
        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.Message || error.message,
            data: null,
        };
    }
};

// ===== ADD TO CART =====
export const addToCart = async (productId, quantity) => {
    try {
        // Backend DTO expects: ShelterProductID, Quantity (PascalCase)
        const payload = {
            ShelterProductID: parseInt(productId),
            Quantity: parseInt(quantity),
        };
        console.log("[cartService] POST /cart/add payload:", payload, "productId type:", typeof productId);

        const response = await axiosConfig.post("/cart/add", payload);

        console.log("[cartService] Response:", response.data);
        return {
            success: response.data.success,
            message: response.data.message,
            data: response.data.cart,
        };
    } catch (error) {
        console.error("[cartService] Error:", {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message,
            originalProductId: productId,
        });
        return {
            success: false,
            message: error.response?.data?.message || error.response?.data?.Message || error.message,
            data: null,
        };
    }
};

// ===== UPDATE CART ITEM =====
export const updateCartItem = async (cartItemId, quantity) => {
    try {
        // Backend DTO expects PascalCase: CartItemID, Quantity
        const response = await axiosConfig.put("/cart/update", {
            CartItemID: cartItemId,
            Quantity: parseInt(quantity),
        });
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

// ===== REMOVE FROM CART =====
export const removeFromCart = async (cartItemId) => {
    try {
        const response = await axiosConfig.delete(`/cart/items/${cartItemId}`);
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

// ===== CLEAR CART =====
export const clearCart = async () => {
    try {
        const response = await axiosConfig.delete("/cart/clear");
        return {
            success: response.data.success || true,
            message: response.data.Message || response.data.message,
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.Message || error.message,
        };
    }
};

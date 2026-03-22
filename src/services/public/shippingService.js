// API mở lấy danh sách tỉnh thành Việt Nam - không cần token
// Sử dụng Vite proxy forward đến esgoo.github.io/api (tránh CORS)
const PROVINCES_API = "/provinces-api/";

// Mock shipping options
const MOCK_SHIPPING_OPTIONS = [
    { CarrierCode: "GHN", CarrierName: "Giao Hàng Nhanh", TotalCost: 20000, EstimatedDays: 1 },
    { CarrierCode: "GHTK", CarrierName: "Giao Hàng Tiết Kiệm", TotalCost: 15000, EstimatedDays: 2 },
    { CarrierCode: "GRAB", CarrierName: "Grab Bike", TotalCost: 25000, EstimatedDays: "cùng ngày" },
];

/**
 * Get all provinces from esgoo API
 * API endpoint: https://esgoo.github.io/api/province/
 */
export const getProvinces = async () => {
    try {
        console.log("[shippingService] Fetching provinces from API...");
        const response = await fetch(`${PROVINCES_API}province/`);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        // Transform API data to match our format
        // esgoo format: { data: [{code: "01", name: "Hà Nội"}], status: 200}
        const provinces = (data.data || []).map(province => ({
            ProvinceId: province.code,
            ProvinceName: province.name,
        }));

        console.log("[shippingService] Provinces loaded:", provinces.length);
        return { success: true, data: provinces };
    } catch (error) {
        console.error("[shippingService] Error fetching provinces:", error.message);
        return {
            success: false,
            error: "Không thể tải danh sách tỉnh/thành phố",
        };
    }
};

/**
 * Get districts for a specific province from esgoo API
 * @param {number|string} provinceId - Province code
 */
export const getDistricts = async (provinceId) => {
    try {
        console.log("[shippingService] Fetching districts for province:", provinceId);

        const response = await fetch(`${PROVINCES_API}district/?pid=${provinceId}`);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        // Transform API data to match our format
        // esgoo format: { data: [{code: "001", name: "Quận 1"}], status: 200}
        const districts = (data.data || []).map(district => ({
            DistrictID: district.code,
            DistrictName: district.name,
        }));

        console.log("[shippingService] Districts loaded:", districts.length);
        return { success: true, data: districts };
    } catch (error) {
        console.error("[shippingService] Error fetching districts:", error.message);
        return {
            success: false,
            error: "Không thể tải danh sách quận/huyện",
        };
    }
};

/**
 * Get wards for a specific district from esgoo API
 * @param {number|string} provinceId - Province code
 * @param {number|string} districtId - District code
 */
export const getWards = async (provinceId, districtId) => {
    try {
        console.log("[shippingService] Fetching wards for district:", districtId);

        const response = await fetch(`${PROVINCES_API}ward/?did=${districtId}`);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        // Transform API data to match our format
        // esgoo format: { data: [{code: "00001", name: "Phường Bến Nghé"}], status: 200}
        const wards = (data.data || []).map(ward => ({
            WardID: ward.code,
            WardName: ward.name,
        }));

        console.log("[shippingService] Wards loaded:", wards.length);
        return { success: true, data: wards };
    } catch (error) {
        console.error("[shippingService] Error fetching wards:", error.message);
        return {
            success: false,
            error: "Không thể tải danh sách phường/xã",
        };
    }
};

/**
 * Calculate shipping cost and get available carriers
 * @param {number} fromDistrictId - Warehouse district ID
 * @param {number} toDistrictId - Destination district ID
 * @param {number} weight - Package weight in grams
 */
export const calculateShippingCost = async (
    fromDistrictId,
    toDistrictId,
    weight = 500,
    length = 20,
    width = 15,
    height = 10,
    insuranceValue = 0
) => {
    try {
        console.log("[shippingService] Calculating shipping cost...", {
            fromDistrictId,
            toDistrictId,
            weight,
        });

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Return mock shipping options with variation based on weight
        const weightMultiplier = Math.ceil(weight / 1000);
        const options = MOCK_SHIPPING_OPTIONS.map(opt => ({
            ...opt,
            TotalCost: opt.TotalCost + (weightMultiplier - 1) * 5000,
        }));

        console.log("[shippingService] Shipping options loaded:", options.length);
        return {
            success: true,
            data: {
                FromDistrictId: fromDistrictId,
                ToDistrictId: toDistrictId,
                Weight: weight,
                ShippingOptions: options,
            }
        };
    } catch (error) {
        console.error("[shippingService] Error calculating shipping:", error.message);
        return {
            success: false,
            error: "Không thể tính phí vận chuyển",
        };
    }
};

// Legacy function aliases for backward compatibility
export const getAvailableProvinces = getProvinces;
export const getAvailableDistricts = getDistricts;

/**
 * Get shipping status (legacy)
 */
export const getShippingStatus = async (orderId) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 300));
        return {
            success: true,
            data: {
                OrderID: orderId,
                Status: "Đang giao hàng",
                CurrentLocation: "Quận 1, TP. Hồ Chí Minh",
                EstimatedDelivery: "Hôm nay",
            },
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.Message || error.message,
        };
    }
};

/**
 * Track shipment (legacy)
 */
export const trackShipment = async (trackingNumber, carrier) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 300));
        return {
            success: true,
            data: {
                TrackingNumber: trackingNumber,
                Carrier: carrier,
                Status: "Đang giao hàng",
                CurrentLocation: "Quận 1, TP. Hồ Chí Minh",
                EstimatedDelivery: "Hôm nay",
                History: [
                    { Time: "08:30", Location: "Kho phát hàng", Status: "Đã tiếp nhận" },
                    { Time: "10:15", Location: "Trung tâm phân loại", Status: "Đã sắp xếp" },
                    { Time: "12:00", Location: "Đang vận chuyển", Status: "Trên đường" },
                ],
            },
        };
    } catch (error) {
        return {
            success: false,
            error: "Không thể lấy thông tin vận chuyển",
        };
    }
};

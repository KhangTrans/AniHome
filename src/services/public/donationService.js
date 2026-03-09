import axiosInstance from '../axiosConfig';

/**
 * 💰 PUBLIC DONATION APIs - /api/Donations
 * Donate cho Shelter hoặc Pet thông qua VNPay
 * 
 * ===== USAGE EXAMPLE =====
 * 
 * // 1. Donate cho Shelter:
 * const result = await createVNPayDonation({
 *   shelterID: 1,
 *   amount: 50000,
 *   message: "Ủng hộ trạm cứu hộ",
 *   userID: getCurrentUserId() // Auto lấy từ localStorage
 * });
 * 
 * if (result.success) {
 *   // Redirect sang VNPay
 *   redirectToVNPay(result.data.paymentUrl);
 * }
 * 
 * // 2. Donate cho Pet:
 * const result = await createVNPayDonation({
 *   petID: 123,
 *   amount: 100000,
 *   message: "Ủng hộ cho bé Milo"
 * });
 * 
 * // 3. Sau khi thanh toán, VNPay redirect về:
 * // - Success: /donation/success
 * // - Failed: /donation/failed
 * ========================
 */

/**
 * POST /api/Donations/vnpay
 * Tạo payment URL VNPay để donate cho Shelter hoặc Pet
 * 
 * @param {Object} donationData - Thông tin quyên góp
 * @param {number} donationData.shelterID - ID trạm cứu hộ (bắt buộc nếu không có petID)
 * @param {number} donationData.petID - ID pet (optional, nếu có thì tự động xác định shelter)
 * @param {number} donationData.userID - ID user (optional, lấy từ localStorage nếu đã login)
 * @param {number} donationData.amount - Số tiền quyên góp (VND, tối thiểu 1,000đ)
 * @param {string} donationData.message - Lời nhắn (optional)
 * 
 * @returns {Object} { success, data: { paymentUrl }, error }
 */
export const createVNPayDonation = async (donationData) => {
  try {
    // Validate required fields
    if (!donationData.amount || donationData.amount < 1000) {
      return {
        success: false,
        error: 'Số tiền tối thiểu là 1,000đ',
      };
    }

    if (!donationData.shelterID && !donationData.petID) {
      return {
        success: false,
        error: 'Vui lòng chọn Shelter hoặc Pet để donate',
      };
    }

    const payload = {
      amount: donationData.amount,
      message: donationData.message || '',
    };

    // Add shelterID hoặc petID
    if (donationData.petID) {
      payload.petID = donationData.petID;
    } else {
      payload.shelterID = donationData.shelterID;
    }

    // Add userID nếu có (user đã login)
    if (donationData.userID) {
      payload.userID = donationData.userID;
    }

    const response = await axiosInstance.post('/Donations/vnpay', payload);
    
    return {
      success: true,
      data: response.data, // Backend trả về: { paymentUrl: "https://sandbox.vnpayment.vn/..." }
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Không thể tạo thanh toán. Vui lòng thử lại.',
    };
  }
};

// Alias for backward compatibility
export const createDonationPayment = createVNPayDonation;

/**
 * GET /api/donations/callback
 * Xử lý callback từ VNPay (Backend sẽ handle)
 * Frontend chỉ cần redirect user về trang success/fail
 */
export const handleVNPayCallback = (queryParams) => {
  // Parse VNPay response
  const responseCode = queryParams.get('vnp_ResponseCode');
  const transactionNo = queryParams.get('vnp_TransactionNo');
  const amount = queryParams.get('vnp_Amount');
  
  if (responseCode === '00') {
    return {
      success: true,
      message: 'Thanh toán thành công!',
      transactionNo,
      amount: parseInt(amount) / 100, // VNPay trả về amount * 100
    };
  }
  
  return {
    success: false,
    message: 'Thanh toán thất bại hoặc bị hủy',
    responseCode,
  };
};

/**
 * Utility: Validate donation amount
 */
export const validateDonationAmount = (amount) => {
  const minAmount = 1000; // 1,000 VND (theo yêu cầu)
  const maxAmount = 100000000; // 100,000,000 VND
  
  if (!amount || isNaN(amount)) {
    return { isValid: false, error: 'Vui lòng nhập số tiền' };
  }
  
  if (amount < minAmount) {
    return { isValid: false, error: `Số tiền tối thiểu ${formatCurrency(minAmount)}` };
  }
  
  if (amount > maxAmount) {
    return { isValid: false, error: `Số tiền tối đa ${formatCurrency(maxAmount)}` };
  }
  
  // Check step 1,000đ
  if (amount % 1000 !== 0) {
    return { isValid: false, error: 'Số tiền phải là bội số của 1,000đ' };
  }
  
  return { isValid: true };
};

/**
 * Utility: Format currency (VND)
 */
export const formatCurrency = (amount) => {
  if (!amount) return '0đ';
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

// Alias for backward compatibility
export const formatCurrencyVND = formatCurrency;

/**
 * Utility: Parse currency input (remove non-digits)
 */
export const parseCurrencyInput = (input) => {
  if (!input) return '';
  // Remove all non-digit characters
  const digits = input.toString().replace(/\D/g, '');
  return digits ? parseInt(digits) : '';
};

/**
 * Utility: Get impact message based on donation amount
 */
export const getDonationImpactMessage = (amount) => {
  if (amount >= 2000000) {
    return '🌟 Bạn có thể giúp chăm sóc 1 bé trong 1 tháng!';
  } else if (amount >= 1000000) {
    return '❤️ Đủ tiền thức ăn cho 10 bé trong 1 tuần!';
  } else if (amount >= 500000) {
    return '🐾 Giúp được nhiều bé có cuộc sống tốt hơn!';
  } else if (amount >= 200000) {
    return '💙 Đủ chi phí khám bệnh cho 1 bé!';
  } else if (amount >= 100000) {
    return '🍖 Đủ thức ăn cho 5 bé trong 1 ngày!';
  } else if (amount >= 50000) {
    return '🥰 Mỗi đồng đều quý giá với các bé!';
  }
  return '💕 Cảm ơn bạn đã quan tâm!';
};

/**
 * Utility: Validate donation form
 */
export const validateDonationForm = (formData) => {
  const errors = {};
  
  // Validate amount
  if (!formData.amount || formData.amount <= 0) {
    errors.amount = 'Vui lòng nhập số tiền quyên góp';
  } else if (formData.amount < 1000) {
    errors.amount = 'Số tiền tối thiểu là 1,000đ';
  } else if (formData.amount % 1000 !== 0) {
    errors.amount = 'Số tiền phải là bội số của 1,000đ';
  } else if (formData.amount > 100000000) {
    errors.amount = 'Số tiền tối đa là 100,000,000đ';
  }
  
  // Validate shelterID hoặc petID
  if (!formData.shelterID && !formData.petID) {
    errors.target = 'Vui lòng chọn Shelter hoặc Pet để donate';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Utility: Quick donation amount buttons (theo yêu cầu UX)
 */
export const DONATION_PRESETS = [
  { value: 50000, label: '50k', display: '50,000đ' },
  { value: 100000, label: '100k', display: '100,000đ' },
  { value: 200000, label: '200k', display: '200,000đ' },
  { value: 500000, label: '500k', display: '500,000đ' },
];

/**
 * Constants: Donation amount constraints
 */
export const DONATION_CONSTRAINTS = {
  MIN_AMOUNT: 1000,     // 1,000đ
  MAX_AMOUNT: 100000000, // 100,000,000đ
  STEP: 1000,           // Bội số của 1,000đ
};

/**
 * Utility: Get current user ID từ localStorage
 */
export const getCurrentUserId = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    return user?.userId || user?.id || null;
  } catch {
    return null;
  }
};

/**
 * Utility: Redirect to VNPay payment page
 * @param {string} paymentUrl - URL từ backend trả về
 * @param {boolean} newTab - Mở tab mới (default: false, redirect current page)
 */
export const redirectToVNPay = (paymentUrl, newTab = false) => {
  if (!paymentUrl) {
    console.error('Payment URL is required');
    return false;
  }
  
  try {
    if (newTab) {
      // Mở tab mới để thanh toán
      window.open(paymentUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Redirect trang hiện tại sang VNPay
      window.location.href = paymentUrl;
    }
    return true;
  } catch (error) {
    console.error('Failed to redirect to VNPay:', error);
    return false;
  }
};

/**
 * Utility: Format số tiền hiển thị (50,000đ thay vì 50000)
 */
export const formatAmountDisplay = (amount) => {
  if (!amount) return '0đ';
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};

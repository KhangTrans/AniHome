import axiosInstance from '../axiosConfig';

/**
 * 💰 PUBLIC DONATION APIs - /api/donations
 * Không cần authentication (Guest có thể donate)
 */

/**
 * POST /api/donations/create-payment
 * Tạo link thanh toán VNPay
 * 
 * @param {Object} donationData - Thông tin quyên góp
 * @param {number} donationData.amount - Số tiền quyên góp (VND)
 * @param {string} donationData.donorName - Tên người quyên góp (optional)
 * @param {string} donationData.donorEmail - Email (optional)
 * @param {string} donationData.message - Lời nhắn (optional)
 */
export const createDonationPayment = async (donationData) => {
  try {
    const payload = {
      amount: donationData.amount,
      donorName: donationData.donorName || 'Ẩn danh',
      donorEmail: donationData.donorEmail || '',
      donorPhone: donationData.donorPhone || '',
      message: donationData.message || '',
    };

    const response = await axiosInstance.post('/donations/create-payment', payload);
    
    return {
      success: true,
      data: response.data, // { paymentUrl: "https://vnpay.vn/..." }
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create payment',
    };
  }
};

// Alias for backward compatibility
export const createVNPayDonation = createDonationPayment;

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
  const minAmount = 10000; // 10,000 VND
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
  } else if (formData.amount < 10000) {
    errors.amount = 'Số tiền tối thiểu là 10,000đ';
  } else if (formData.amount > 100000000) {
    errors.amount = 'Số tiền tối đa là 100,000,000đ';
  }
  
  // Validate email (if provided)
  if (formData.donorEmail && formData.donorEmail.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.donorEmail)) {
      errors.donorEmail = 'Email không hợp lệ';
    }
  }
  
  // Validate phone (if provided)
  if (formData.donorPhone && formData.donorPhone.trim()) {
    const phoneRegex = /^[0-9]{10,11}$/;
    const cleanPhone = formData.donorPhone.replace(/\D/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      errors.donorPhone = 'Số điện thoại không hợp lệ (10-11 số)';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Utility: Predefined donation amounts
 */
export const DONATION_PRESETS = [
  { value: 50000, label: '50,000đ' },
  { value: 100000, label: '100,000đ' },
  { value: 200000, label: '200,000đ' },
  { value: 500000, label: '500,000đ' },
  { value: 1000000, label: '1,000,000đ' },
  { value: 2000000, label: '2,000,000đ' },
];

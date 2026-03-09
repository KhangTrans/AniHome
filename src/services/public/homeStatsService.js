import axiosInstance from '../axiosConfig';

/**
 * 📊 PUBLIC HOME STATS APIs - /api/home-stats
 * Không cần authentication - Hiển thị trên trang chủ
 */

/**
 * GET /api/HomeStats
 * Lấy thống kê tổng quan cho homepage
 * 
 * @returns {Object} Stats data
 * @returns {number} data.totalRescuedPets - Tổng số thú cưng được cứu hộ
 * @returns {number} data.successfulAdoptions - Số lượng nhận nuôi thành công
 * @returns {number} data.activeShelters - Số trạm cứu hộ đang hoạt động
 */
export const getHomeStats = async () => {
  try {
    const response = await axiosInstance.get('/HomeStats');
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch home stats',
    };
  }
};

/**
 * Utility: Format large numbers
 */
export const formatStatNumber = (num) => {
  if (!num) return '0';
  
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  
  return num.toString();
};

/**
 * Utility: Format number with thousand separators
 */
export const formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Utility: Format currency (VND)
 */
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0đ';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Utility: Calculate adoption rate percentage
 */
export const calculateAdoptionRate = (adopted, total) => {
  if (!total || total === 0) return 0;
  return Math.round((adopted / total) * 100);
};

/**
 * Utility: Get stat icon
 */
export const getStatIcon = (statType) => {
  const icons = {
    totalPets: '🐾',
    totalAdoptions: '❤️',
    totalShelters: '🏥',
    totalVolunteers: '🙋',
  };
  
  return icons[statType] || '📊';
};

/**
 * Utility: Get stat card color theme
 */
export const getStatCardTheme = (type) => {
  const themes = {
    pets: {
      color: '#3b82f6',
      bg: '#dbeafe',
      icon: '🐾',
    },
    adopted: {
      color: '#10b981',
      bg: '#d1fae5',
      icon: '❤️',
    },
    shelters: {
      color: '#8b5cf6',
      bg: '#ede9fe',
      icon: '🏠',
    },
    volunteers: {
      color: '#f59e0b',
      bg: '#fef3c7',
      icon: '👥',
    },
    donations: {
      color: '#ec4899',
      bg: '#fce7f3',
      icon: '💰',
    },
  };
  return themes[type] || themes.pets;
};

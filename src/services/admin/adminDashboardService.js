import axiosInstance from '../axiosConfig';

/**
 * 🛡️ ADMIN DASHBOARD APIs
 * /api/admin/dashboard
 * Role: Admin (RoleID = 1)
 * Requires: accessToken + Admin role
 */

/**
 * GET /api/admin/dashboard
 * Lấy thống kê tổng quan hệ thống
 */
export const getAdminDashboard = async () => {
  try {
    const response = await axiosInstance.get('/Admin/dashboard');
    
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch admin dashboard',
    };
  }
};

/**
 * Utility: Format admin dashboard stats
 */
export const formatAdminStats = (stats) => {
  return {
    totalUsers: stats.totalUsers || 0,
    totalShelters: stats.totalShelters || 0,
    totalPets: stats.totalPets || 0,
    totalAdoptions: stats.totalAdoptions || 0,
    pendingShelters: stats.pendingShelters || 0,
    pendingPosts: stats.pendingPosts || 0,
    activeReports: stats.activeReports || 0,
    totalDonations: stats.totalDonations || 0,
  };
};

/**
 * Utility: Get admin dashboard cards
 */
export const getAdminDashboardCards = (stats) => {
  return [
    {
      title: 'Tổng Người Dùng',
      value: stats.totalUsers || 0,
      icon: '👥',
      color: '#3b82f6',
      change: '+8.2%',
    },
    {
      title: 'Tổng Trạm Cứu Hộ',
      value: stats.totalShelters || 0,
      icon: '🏥',
      color: '#10b981',
      change: '+3 mới',
    },
    {
      title: 'Shelter Chờ Duyệt',
      value: stats.pendingShelters || 0,
      icon: '⏳',
      color: '#f59e0b',
      change: 'Cần xử lý',
    },
    {
      title: 'Báo Cáo Vi Phạm',
      value: stats.activeReports || 0,
      icon: '⚠️',
      color: '#ef4444',
      change: 'Cần kiểm tra',
    },
  ];
};

/**
 * Utility: Get system health status
 */
export const getSystemHealthStatus = (stats) => {
  const pendingItems = (stats.pendingShelters || 0) + (stats.pendingPosts || 0);
  const activeIssues = stats.activeReports || 0;
  
  if (activeIssues > 10) {
    return { status: 'critical', text: 'Nghiêm trọng', color: '#ef4444' };
  }
  
  if (pendingItems > 20 || activeIssues > 5) {
    return { status: 'warning', text: 'Cần chú ý', color: '#f59e0b' };
  }
  
  return { status: 'healthy', text: 'Hoạt động tốt', color: '#10b981' };
};

import axios from 'axios';

// Base URL - Lấy từ environment variable
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Tạo axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// Request Interceptor - Tự động thêm accessToken vào mọi request
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && accessToken !== 'undefined' && accessToken !== 'null') {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Tự động refresh token khi hết hạn
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 403 (Forbidden): User không có quyền truy cập
    if (error.response?.status === 403) {
      console.warn('[Axios Interceptor] 403 Forbidden: Missing permissions.');
      // Import and use toast if possible, or use window alert as fallback
      if (window.toast) {
        window.toast.error("Bạn không có quyền truy cập vào chức năng này.");
      } else {
        alert("Bạn không có quyền truy cập.");
      }
      return Promise.reject(error);
    }

    // Nếu lỗi 401 (Unauthorized) và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken || refreshToken === 'undefined') {
          console.warn('[Axios Interceptor] 401 Unauthorized! Missing refresh token. Redirecting to login...');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Gọi API refresh token
        const response = await axios.post(`${BASE_URL}/Auth/refresh-token`, {
          refreshToken,
        });

        const newAccessToken = response.data.accessToken || response.data.AccessToken;

        if (!newAccessToken) {
          throw new Error('No access token returned from refresh');
        }

        // Lưu token mới
        localStorage.setItem('accessToken', newAccessToken);

        // Retry request với token mới
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('[Axios Interceptor] Refresh token failed:', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

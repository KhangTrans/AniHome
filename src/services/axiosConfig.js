import axios from 'axios';

// Base URL - Lấy từ environment variable
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Tạo axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - Tự động thêm accessToken vào mọi request
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
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

    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          // Không có refresh token, redirect to login
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Gọi API refresh token
        const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken: newAccessToken } = response.data;

        // Lưu token mới
        localStorage.setItem('accessToken', newAccessToken);

        // Retry request với token mới
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh token thất bại, logout
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

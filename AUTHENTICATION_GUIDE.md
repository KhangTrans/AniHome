# AUTHENTICATION SYSTEM - HƯỚNG DẪN SỬ DỤNG

## 📋 Tổng Quan

Authentication system đã được implement đầy đủ theo API documentation với các tính năng:

- ✅ Đăng ký tài khoản với validation đầy đủ
- ✅ Đăng nhập bằng username hoặc email
- ✅ Đăng nhập bằng Google (UI sẵn sàng)
- ✅ Quản lý token (access + refresh)
- ✅ Tự động refresh token khi hết hạn
- ✅ Đăng xuất an toàn

## 🗂 Cấu Trúc Files Đã Tạo

```
src/
├── services/
│   ├── axiosConfig.js         # Axios instance + interceptors
│   └── authService.js         # Authentication API calls
├── utils/
│   └── validation.js          # Client-side validation
├── context/
│   └── AuthContext.jsx        # Authentication context (đã update)
└── pages/
    ├── LoginPage.jsx          # Login form (đã update)
    └── RegisterPage.jsx       # Registration form (đã update)
```

## ⚙️ Cấu Hình

### 1. Thay Đổi Base URL API

Mở file `src/services/axiosConfig.js` và thay đổi:

```javascript
const BASE_URL = 'http://localhost:8080/api'; // Thay bằng URL của bạn
```

### 2. Token Management

Hệ thống tự động lưu và quản lý:
- `accessToken` - Token ngắn hạn cho API calls
- `refreshToken` - Token dài hạn để làm mới accessToken
- `user` - Thông tin người dùng

## 🎯 Validation Rules

### Username
- ✅ Bắt buộc nhập
- ✅ Từ 3-50 ký tự
- ✅ Không chứa khoảng trắng
- ⚠️ Kiểm tra trùng lặp ở server

### Email
- ✅ Bắt buộc nhập
- ✅ Format email hợp lệ
- ⚠️ Kiểm tra trùng lặp ở server

### Password
- ✅ Bắt buộc nhập
- ✅ Độ dài 6-50 ký tự
- ✅ Ít nhất 1 chữ HOA
- ✅ Ít nhất 1 ký tự đặc biệt (!@#$%^&*...)
- ✅ Không chứa khoảng trắng

### Confirm Password
- ✅ Phải khớp với password

### Full Name
- ✅ Bắt buộc nhập
- ✅ Tối thiểu 2 ký tự

## 📝 API Endpoints

### 1. Đăng Ký
```javascript
POST /api/auth/register
Body: {
  username, 
  email, 
  password, 
  confirmNewPassword, 
  fullName
}
```

### 2. Đăng Nhập
```javascript
POST /api/auth/login
Body: {
  usernameOrEmail,  // Username HOẶC Email
  password
}
```

### 3. Google Login
```javascript
POST /api/auth/google-login
Body: {
  idToken  // Google ID Token
}
```

### 4. Đăng Xuất
```javascript
POST /api/auth/logout
Headers: {
  Authorization: Bearer <accessToken>
}
```

### 5. Refresh Token
```javascript
POST /api/auth/refresh-token
Body: {
  refreshToken
}
```

## 🔒 Automatic Token Refresh

Axios interceptor tự động xử lý:

1. **Request Interceptor**: Tự động thêm `Authorization: Bearer <token>` vào mọi request
2. **Response Interceptor**: 
   - Phát hiện lỗi 401 (Unauthorized)
   - Tự động gọi refresh token API
   - Retry request với token mới
   - Redirect về login nếu refresh thất bại

## 💻 Sử Dụng Trong Components

### Hook `useAuth()`

```javascript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { 
    user,              // User object hoặc null
    login,             // Function đăng nhập
    register,          // Function đăng ký
    loginWithGoogle,   // Function đăng nhập Google
    logout,            // Function đăng xuất
    loading,           // Loading state
    isAuthenticated    // Boolean
  } = useAuth();

  // Sử dụng...
}
```

### Đăng Nhập

```javascript
const handleLogin = async () => {
  const result = await login('username_or_email', 'password');
  
  if (result.success) {
    // Redirect based on roleID
    switch (result.role) {
      case 1: navigate('/admin'); break;
      case 2: navigate('/shelter'); break;
      case 3: navigate('/volunteer'); break;
      default: navigate('/');
    }
  } else {
    console.error(result.message);
  }
};
```

### Đăng Ký

```javascript
const handleRegister = async () => {
  const userData = {
    username: 'johndoe',
    email: 'john@example.com',
    password: 'Password123!',
    confirmNewPassword: 'Password123!',
    fullName: 'John Doe'
  };
  
  const result = await register(userData);
  
  if (result.success) {
    navigate('/');
  } else {
    console.error(result.message);
  }
};
```

### Google Login (Cần Setup Thêm)

```javascript
// 1. Install package
npm install @react-oauth/google

// 2. Wrap app với GoogleOAuthProvider
import { GoogleOAuthProvider } from '@react-oauth/google';

<GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
  <App />
</GoogleOAuthProvider>

// 3. Sử dụng trong component
import { GoogleLogin } from '@react-oauth/google';

<GoogleLogin
  onSuccess={async (credentialResponse) => {
    const result = await loginWithGoogle(credentialResponse.credential);
    if (result.success) {
      navigate('/');
    }
  }}
  onError={() => {
    console.log('Login Failed');
  }}
/>
```

## 🔐 Protected Routes

Tạo component bảo vệ routes:

```javascript
// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.roleID)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Sử dụng trong routes
<Route 
  path="/admin" 
  element={
    <ProtectedRoute allowedRoles={[1]}>
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>
```

## 🎨 UI/UX Features

### Register Page
- ✅ Real-time validation errors
- ✅ Password requirements hint
- ✅ Field-level error display
- ✅ Loading state during submission
- ✅ Clear error messages

### Login Page
- ✅ Username or Email support
- ✅ Google login button
- ✅ Forgot password link
- ✅ Loading state
- ✅ Error display

## 🚨 Error Handling

```javascript
// Server errors được handle tự động
try {
  const result = await login(username, password);
  if (!result.success) {
    // result.error chứa message từ server
    setError(result.error);
  }
} catch (error) {
  // Network errors
  setError('Connection failed');
}
```

## 📱 Response Format

Tất cả API responses theo format:

```javascript
// Success
{
  success: true,
  data: {
    accessToken: "...",
    refreshToken: "...",
    user: {
      id: 1,
      username: "johndoe",
      email: "john@example.com",
      fullName: "John Doe",
      roleID: 4
    }
  }
}

// Error
{
  success: false,
  error: "Error message here"
}
```

## 🧪 Testing

### Test Registration với các cases:
1. ✅ Valid data → Success
2. ❌ Username < 3 chars → Error
3. ❌ Username có spaces → Error
4. ❌ Email invalid format → Error
5. ❌ Password không có chữ HOA → Error
6. ❌ Password không có ký tự đặc biệt → Error
7. ❌ Password có spaces → Error
8. ❌ Confirm password không khớp → Error

### Test Login:
1. ✅ Username + valid password → Success
2. ✅ Email + valid password → Success
3. ❌ Invalid credentials → Error
4. ❌ Empty fields → Error

## 🔄 Token Lifecycle

```
1. User Login/Register
   ↓
2. Receive accessToken + refreshToken
   ↓
3. Store in localStorage
   ↓
4. Add accessToken to ALL API requests (auto)
   ↓
5. Access Token expires (401 error)
   ↓
6. Interceptor catches 401
   ↓
7. Auto call refresh token API
   ↓
8. Get new accessToken
   ↓
9. Retry original request
   ↓
10. If refresh fails → Logout + Redirect to login
```

## ⚠️ Lưu Ý Quan Trọng

1. **Không lưu password vào localStorage** ✅ (Đã implement)
2. **Clear localStorage khi logout** ✅ (Đã implement)
3. **Validate ở cả client và server** ⚠️ (Client done, server cần implement)
4. **HTTPS trong production** ⚠️ (Cần config server)
5. **Secure httpOnly cookies cho refreshToken** 💡 (Option tốt hơn localStorage)
6. **Rate limiting cho login attempts** ⚠️ (Cần implement ở server)
7. **CORS configuration** ⚠️ (Cần config server)

## 🛠 Next Steps

1. **Implement Backend API** theo đúng contract
2. **Setup Google OAuth** với Client ID thực
3. **Add Forgot Password** flow
4. **Email Verification** after registration
5. **2FA (Two-Factor Authentication)**
6. **Session Management** dashboard
7. **Security Logs** và audit trail

## 📚 Dependencies

```json
{
  "axios": "^1.x.x",
  "react": "^19.2.0",
  "react-router-dom": "^7.13.0",
  "lucide-react": "^0.563.0"
}
```

## 🐛 Troubleshooting

### Axios Network Error
- Kiểm tra BASE_URL đúng chưa
- Kiểm tra backend có đang chạy không
- Kiểm tra CORS configuration

### Token Refresh Loop
- Clear localStorage
- Kiểm tra refresh token API response format
- Check interceptor logic

### Validation không hoạt động
- Kiểm tra import validation functions
- Check console errors
- Verify validation rules logic

---

**Developed by:** Your Team
**Date:** March 7, 2026
**Version:** 1.0.0

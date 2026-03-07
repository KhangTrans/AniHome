# 🚀 BACKEND CONNECTED - READY TO TEST

## ✅ Backend Configuration

**Backend URL:** `https://tramcuuho.onrender.com`

Đã cấu hình tại:
- ✅ [src/services/axiosConfig.js](src/services/axiosConfig.js)
- ✅ [.env.local](.env.local) (backup config)

## 🧪 Testing Guide

### 1. Start Development Server

```bash
npm run dev
```

### 2. Test Registration

1. Vào http://localhost:5173/register
2. Điền form:
   - **Username:** `testuser` (3-50 ký tự, không có space)
   - **Email:** `test@example.com` (format hợp lệ)
   - **Full Name:** `Nguyen Van Test`
   - **Password:** `Test123!` (có chữ HOA + ký tự đặc biệt)
   - **Confirm Password:** `Test123!`
3. Click "Sign Up"
4. Kiểm tra:
   - ✅ Request được gửi đến `https://tramcuuho.onrender.com/api/auth/register`
   - ✅ Nhận response với accessToken, refreshToken, user
   - ✅ Redirect về trang phù hợp với roleID

### 3. Test Login

1. Vào http://localhost:5173/login
2. Nhập:
   - **Username hoặc Email:** `testuser` hoặc `test@example.com`
   - **Password:** `Test123!`
3. Click "Sign In"
4. Kiểm tra:
   - ✅ Request gửi đến `https://tramcuuho.onrender.com/api/auth/login`
   - ✅ Nhận tokens và user info
   - ✅ Redirect theo roleID (1=admin, 2=shelter, 3=volunteer, 4=user)

### 4. Test Token Refresh (Tự động)

- Token sẽ tự động refresh khi hết hạn
- Không cần làm gì, axios interceptor xử lý tự động
- Kiểm tra trong Console: "Token refreshed successfully"

### 5. Test Logout

1. Click nút Logout (nếu có)
2. Hoặc gọi `logout()` từ useAuth hook
3. Kiểm tra:
   - ✅ localStorage được clear
   - ✅ Redirect về /login

## 🔍 Debug với Browser DevTools

### Network Tab
1. Mở DevTools (F12)
2. Tab "Network"
3. Test register/login
4. Kiểm tra:
   - Request URL: `https://tramcuuho.onrender.com/api/auth/...`
   - Request Headers: `Content-Type: application/json`
   - Request Payload: username, email, password, etc.
   - Response: accessToken, refreshToken, user

### Console Tab
- Xem lỗi nếu có
- Check token được lưu: `localStorage.getItem('accessToken')`
- Check user: `localStorage.getItem('user')`

### Application Tab > Local Storage
Kiểm tra data được lưu:
```
- accessToken: "eyJhbGc..."
- refreshToken: "eyJhbGc..."
- user: "{\"id\":1,\"username\":\"testuser\",...}"
```

## ⚠️ Common Issues & Solutions

### Issue 1: CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution:** Backend cần enable CORS cho domain frontend
```java
// Spring Boot example
config.addAllowedOrigin("http://localhost:5173");
config.addAllowedOrigin("https://your-frontend-domain.com");
```

### Issue 2: Network Error / Failed to fetch
```
Network Error
```

**Possible causes:**
1. Backend không chạy/không accessible
2. URL sai
3. Render service đang cold start (đợi ~30s)

**Solution:**
- Test backend trực tiếp: https://tramcuuho.onrender.com/api/auth/login
- Đợi Render service khởi động
- Kiểm tra backend logs

### Issue 3: 401 Unauthorized
```
Status: 401 Unauthorized
```

**Causes:**
1. Credentials sai
2. Token expired
3. Token format không đúng

**Solution:**
- Kiểm tra username/password đúng chưa
- Clear localStorage và login lại
- Kiểm tra backend token validation

### Issue 4: Validation Errors
```
Password must contain at least 1 uppercase letter
```

**Solution:**
- Đọc kỹ validation rules
- Password: `Test123!` (có HOA + đặc biệt)
- Username: không có space, 3-50 chars

### Issue 5: Server Response 500
```
Status: 500 Internal Server Error
```

**Solution:**
- Kiểm tra backend logs
- Verify database connection
- Check backend validation logic
- Test với Postman trước

## 🧪 Test với Postman (Optional)

Trước khi test với frontend, có thể test backend với Postman:

### Register
```http
POST https://tramcuuho.onrender.com/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "Test123!",
  "confirmNewPassword": "Test123!",
  "fullName": "Test User"
}
```

### Login
```http
POST https://tramcuuho.onrender.com/api/auth/login
Content-Type: application/json

{
  "usernameOrEmail": "testuser",
  "password": "Test123!"
}
```

### Logout
```http
POST https://tramcuuho.onrender.com/api/auth/logout
Authorization: Bearer <your_access_token>
```

## 📊 Expected Response Format

### Success Response
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "fullName": "Test User",
    "roleID": 4
  }
}
```

### Error Response
```json
{
  "message": "Username already exists"
}
```
or
```json
{
  "error": "Invalid credentials"
}
```

## 🎯 Testing Checklist

- [ ] Registration với valid data → Success
- [ ] Registration với username đã tồn tại → Error
- [ ] Registration với email đã tồn tại → Error
- [ ] Registration với password yếu → Client-side error
- [ ] Login với username → Success
- [ ] Login với email → Success
- [ ] Login với sai password → 401 Error
- [ ] Token được lưu vào localStorage
- [ ] User data được lưu vào localStorage
- [ ] Redirect đúng theo roleID
- [ ] Logout clear localStorage
- [ ] Token refresh tự động khi 401

## 🔐 Security Check

Before production:
- [ ] HTTPS enabled (✅ Render provides this)
- [ ] CORS properly configured
- [ ] Sensitive data not exposed in console
- [ ] Tokens stored securely
- [ ] Password not in localStorage
- [ ] API rate limiting enabled
- [ ] Input sanitization on backend

## 📞 Support

Nếu gặp vấn đề:
1. Check browser Console
2. Check Network tab trong DevTools
3. Test endpoint với Postman
4. Kiểm tra backend logs trên Render
5. Verify backend API documentation

---

**Backend:** https://tramcuuho.onrender.com
**Frontend:** http://localhost:5173
**Status:** ✅ Connected and Ready to Test!

Chúc bạn test thành công! 🎉

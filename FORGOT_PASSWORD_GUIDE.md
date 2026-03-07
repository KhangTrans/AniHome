# 🔐 FORGOT PASSWORD FEATURE - 2-STEP FLOW

## ✅ Đã Implement

### 1. **API Services** - [src/services/authService.js](src/services/authService.js)
- ✅ `forgotPassword(email)` - Gửi mã 6 số qua email
- ✅ `resetPassword(resetData)` - Reset password với mã xác thực

### 2. **Validation** - [src/utils/validation.js](src/utils/validation.js)
- ✅ `validateResetToken(token)` - Validate mã 6 số
- ✅ `validateResetPasswordForm(formData)` - Validate toàn bộ form
- ✅ `validateForgotPasswordEmail(email)` - Validate email

### 3. **UI Component** - [src/pages/ForgotPasswordPage.jsx](src/pages/ForgotPasswordPage.jsx)
- ✅ Step 1: Nhập email → Gửi mã
- ✅ Step 2: Nhập mã + password mới
- ✅ Success/Error messages
- ✅ Resend code functionality
- ✅ Real-time validation
- ✅ Auto-redirect sau success

### 4. **Login Page Update** - [src/pages/LoginPage.jsx](src/pages/LoginPage.jsx)
- ✅ "Forgot Password?" link đã thêm

## 🚀 Setup - Add Route

Bạn cần thêm route cho ForgotPasswordPage vào `App.jsx`:

```javascript
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import { PublicOnlyRoute } from './components/ProtectedRoute';

// Trong <Routes>:
<Route
  path="/forgot-password"
  element={
    <PublicOnlyRoute>
      <ForgotPasswordPage />
    </PublicOnlyRoute>
  }
/>
```

**Full Example:**

```javascript
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import { PublicOnlyRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Public Only Routes */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />
      
      <Route
        path="/forgot-password"
        element={
          <PublicOnlyRoute>
            <ForgotPasswordPage />
          </PublicOnlyRoute>
        }
      />
      
      {/* Other routes... */}
    </Routes>
  );
}
```

## 🧪 Testing Guide

### Step 1: Send Reset Code

1. **Vào trang login:** http://localhost:5173/login
2. **Click "Forgot Password?"** link
3. **Nhập email:** (email đã đăng ký trong hệ thống)
4. **Click "Send Reset Code"**
5. **Kiểm tra:**
   - ✅ Request gửi đến: `POST https://tramcuuho.onrender.com/api/auth/forgot-password`
   - ✅ Request body: email as plain text (not JSON)
   - ✅ Response: "Reset code sent to email"
   - ✅ Success message hiển thị
   - ✅ Tự động chuyển sang Step 2

### Step 2: Reset Password

1. **Check email** → Lấy mã 6 số
2. **Form Step 2 hiển thị:**
   - Email (read-only, disabled)
   - Reset Code (6 digits)
   - New Password
   - Confirm New Password
3. **Nhập thông tin:**
   - Mã: `123456` (ví dụ từ email)
   - Password: `NewPass123!` (có HOA + đặc biệt)
   - Confirm: `NewPass123!`
4. **Click "Reset Password"**
5. **Kiểm tra:**
   - ✅ Request: `POST https://tramcuuho.onrender.com/api/auth/reset-password`
   - ✅ Body: `{ email, token, newPassword, confirmNewPassword }`
   - ✅ Response: Success message
   - ✅ Redirect về /login sau 2 giây
6. **Test login** với password mới

## 📱 User Flow

```
┌─────────────────┐
│  Login Page     │
│                 │
│ [Forgot Pwd?] ←─┼─── Click
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ Forgot Password Page    │
│                         │
│ STEP 1: Enter Email     │
│ ┌─────────────────────┐ │
│ │ Email: _________    │ │
│ └─────────────────────┘ │
│                         │
│ [Send Reset Code]       │
└────────┬────────────────┘
         │
         │ POST /auth/forgot-password
         │ (email as plain text)
         ▼
┌─────────────────────────┐
│ Backend                 │
│ - Check email exists    │
│ - Generate 6-digit code │
│ - Save to DB (15min)    │
│ - Send email            │
└────────┬────────────────┘
         │
         │ ✅ Code sent!
         ▼
┌─────────────────────────┐
│ Forgot Password Page    │
│                         │
│ STEP 2: Reset Password  │
│ ┌─────────────────────┐ │
│ │ Email: user@... (RO)│ │
│ │ Code: ______        │ │
│ │ New Pwd: _______    │ │
│ │ Confirm: _______    │ │
│ └─────────────────────┘ │
│                         │
│ [Reset Password]        │
│ [Resend Code]           │
└────────┬────────────────┘
         │
         │ POST /auth/reset-password
         │ { email, token, newPassword, confirmNewPassword }
         ▼
┌─────────────────────────┐
│ Backend                 │
│ - Verify token          │
│ - Check expiry (<15min) │
│ - Validate password     │
│ - Update password       │
│ - Invalidate token      │
└────────┬────────────────┘
         │
         │ ✅ Password updated!
         ▼
┌─────────────────┐
│  Login Page     │
│                 │
│ Login with new  │
│ password        │
└─────────────────┘
```

## 🔍 API Details

### 1. Forgot Password (Step 1)

**Endpoint:** `POST /api/auth/forgot-password`

**Request:**
```http
POST https://tramcuuho.onrender.com/api/auth/forgot-password
Content-Type: text/plain

user@example.com
```

⚠️ **QUAN TRỌNG:** Body là **plain text string**, không phải JSON object!

**Response Success (200):**
```
Reset code sent to email
```

**Response Error (404):**
```json
{
  "message": "Email not found"
}
```

### 2. Reset Password (Step 2)

**Endpoint:** `POST /api/auth/reset-password`

**Request:**
```http
POST https://tramcuuho.onrender.com/api/auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "token": "123456",
  "newPassword": "NewPass123!",
  "confirmNewPassword": "NewPass123!"
}
```

**Response Success (200):**
```
Password reset successfully
```

**Response Error (400):**
```json
{
  "message": "Invalid or expired token"
}
```

## 🎯 Validation Rules

### Email
- ✅ Required
- ✅ Valid email format
- ✅ Must exist in system

### Reset Code (Token)
- ✅ Required
- ✅ Exactly 6 digits
- ✅ Must be valid and not expired (<15 minutes)

### New Password
- ✅ Required
- ✅ Min 6 characters
- ✅ At least 1 uppercase letter
- ✅ At least 1 special character (!@#$%^&*...)
- ✅ No spaces
- ✅ Cannot match old password (checked by backend)

### Confirm Password
- ✅ Required
- ✅ Must match new password

## ⚠️ Important Notes

### 1. Email Body Format
Backend expects **plain text**, not JSON:
```javascript
// ✅ CORRECT
await axiosInstance.post('/auth/forgot-password', email, {
  headers: { 'Content-Type': 'text/plain' }
});

// ❌ WRONG
await axiosInstance.post('/auth/forgot-password', { email });
```

### 2. Token Expiry
- Mã có hiệu lực **15 phút**
- User có thể request mã mới bất cứ lúc nào
- Mã cũ sẽ bị invalidate khi có mã mới

### 3. Security
- Backend phải verify email tồn tại
- Token phải random và unique
- Token phải hash/encrypt trong database
- Rate limit requests (prevent spam)
- Log all reset attempts

### 4. Email Content
Email nên chứa:
- Mã 6 số (lớn, dễ đọc)
- Thời gian hết hạn (15 phút)
- Warning: không share mã
- Link back to app (optional)

## 🛠 Troubleshooting

### Issue 1: "Email not found"
**Cause:** Email chưa đăng ký trong hệ thống
**Solution:** Kiểm tra email đúng chưa, hoặc đăng ký tài khoản mới

### Issue 2: "Invalid or expired token"
**Cause:** Mã sai hoặc quá 15 phút
**Solution:** Click "Resend Code" để nhận mã mới

### Issue 3: Email không nhận được mã
**Possible causes:**
- SMTP service chưa config
- Email vào spam folder
- Email service down

**Solution:**
- Check spam/junk folder
- Wait 1-2 minutes (email delay)
- Request new code
- Check backend logs

### Issue 4: Password validation failed
**Cause:** Password không đủ mạnh
**Solution:** Ensure:
- Min 6 chars
- 1 uppercase (A-Z)
- 1 special char (!@#$%^&*...)
- No spaces

## 📊 Testing Checklist

- [ ] Click "Forgot Password?" từ login page
- [ ] Step 1: Nhập email hợp lệ → Success
- [ ] Step 1: Nhập email không tồn tại → Error
- [ ] Step 1: Nhập email sai format → Client validation error
- [ ] Step 2: Form hiển thị đúng
- [ ] Step 2: Email field disabled
- [ ] Step 2: Nhập mã 6 số đúng → Success
- [ ] Step 2: Nhập mã sai → Error
- [ ] Step 2: Nhập mã hết hạn → Error
- [ ] Step 2: Password yếu → Client validation error
- [ ] Step 2: Confirm password không khớp → Error
- [ ] Click "Resend Code" → Quay về Step 1
- [ ] Success → Auto redirect về login
- [ ] Login với password mới → Success

## 🎨 UI Features

- ✅ 2-step wizard UI
- ✅ Real-time validation
- ✅ Success/Error notifications
- ✅ Auto-redirect after success
- ✅ Resend code functionality
- ✅ Loading states
- ✅ Responsive design
- ✅ Password requirements hint
- ✅ Timer note (15 minutes)
- ✅ Clean, modern design

## 📝 Summary

**Implemented:**
- ✅ 2-step forgot password flow
- ✅ Email verification (step 1)
- ✅ Code + password reset (step 2)
- ✅ Full validation
- ✅ Beautiful UI
- ✅ Error handling
- ✅ Resend functionality

**Total Files:**
- 1 new page (ForgotPasswordPage.jsx)
- 2 new API functions (authService.js)
- 3 new validation functions (validation.js)
- 1 updated page (LoginPage.jsx)

**Ready to use after adding route!** 🎉

---

**Need help?** Check:
- [AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md) - Full auth guide
- [TESTING_WITH_BACKEND.md](TESTING_WITH_BACKEND.md) - Backend testing
- [QUICK_START.md](QUICK_START.md) - Quick setup

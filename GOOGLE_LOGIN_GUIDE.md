# 🔐 Google OAuth Login Setup Guide

## ✅ Đã Hoàn Thành

- ✅ Cài đặt `@react-oauth/google`
- ✅ Tạo `.env` file với Google Client ID placeholder
- ✅ Wrap app với `GoogleOAuthProvider` trong main.jsx
- ✅ Implement Google Login button trong LoginPage
- ✅ Tích hợp với backend API `/api/auth/google`

## 🚀 Hướng Dẫn Lấy Google OAuth Client ID

### Bước 1: Truy cập Google Cloud Console

1. Truy cập: https://console.cloud.google.com/
2. Đăng nhập với Google account của bạn

### Bước 2: Tạo hoặc Chọn Project

1. Click vào dropdown "Select a project" ở top bar
2. Click "NEW PROJECT"
3. Đặt tên project: `Animal Rescue Platform` (hoặc tên bạn muốn)
4. Click "CREATE"

### Bước 3: Enable Google+ API (không bắt buộc với OAuth mới)

1. Vào "APIs & Services" → "Library"
2. Tìm "Google+ API" (optional)
3. Click "ENABLE"

### Bước 4: Tạo OAuth Client ID

1. Vào "APIs & Services" → "Credentials"
2. Click "CREATE CREDENTIALS" → "OAuth client ID"

#### 4.1. Configure Consent Screen (nếu chưa có)

- Chọn "External" (cho testing với bất kì email nào)
- App name: `Animal Rescue Platform`
- User support email: email của bạn
- Developer contact: email của bạn
- Click "SAVE AND CONTINUE"
- Scopes: Không cần thêm gì → Click "SAVE AND CONTINUE"
- Test users: Thêm email test của bạn → Click "SAVE AND CONTINUE"

#### 4.2. Create OAuth Client ID

- Application type: **Web application**
- Name: `Animal Rescue Platform - Local Dev`

**Authorized JavaScript origins:**
```
http://localhost:5173
http://localhost:3000
```

**Authorized redirect URIs:** (có thể để trống cho @react-oauth/google)
```
http://localhost:5173
```

- Click "CREATE"

### Bước 5: Copy Client ID

1. Sau khi tạo, sẽ hiện popup với **Client ID** và **Client Secret**
2. **Copy Client ID** (dạng: `123456789012-abc...xyz.apps.googleusercontent.com`)
3. Paste vào file `.env`:

```env
VITE_GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
```

### Bước 6: Thêm Production URLs (khi deploy)

Khi deploy lên production, quay lại Google Cloud Console:

1. Vào "Credentials" → Click vào OAuth 2.0 Client ID đã tạo
2. Thêm production URL vào "Authorized JavaScript origins":
```
https://your-domain.com
```
3. Click "SAVE"

## 🧪 Test Google Login

### Development (Local)

1. **Khởi động server:**
```bash
npm run dev
```

2. **Mở trình duyệt:** http://localhost:5173/login

3. **Click "Continue with Google"**

4. **Chọn Google account để login**

5. **Sau khi authorize, app sẽ:**
   - Gửi Google token đến backend `/api/auth/google`
   - Backend verify token với Google
   - Trả về JWT tokens + user data
   - Frontend lưu tokens vào localStorage
   - Redirect theo role của user

### Expected Flow

```
User clicks "Continue with Google"
↓
Google OAuth popup opens
↓
User selects Google account
↓
Google returns credential token
↓
Frontend sends token to: POST /api/auth/google
↓
Backend verifies token with Google API
↓
Backend creates/finds user, returns JWT tokens
↓
Frontend saves tokens, updates user state
↓
Redirect to appropriate dashboard based on role
```

## 📁 Files Đã Update

### 1. `.env` (Created)
```env
VITE_API_BASE_URL=https://tramcuuho.onrender.com/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### 2. `src/main.jsx`
```javascript
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

<GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
  <App />
</GoogleOAuthProvider>
```

### 3. `src/pages/public/LoginPage.jsx`
```javascript
import { GoogleLogin } from '@react-oauth/google';

const handleGoogleLogin = async (credentialResponse) => {
  const result = await loginWithGoogle(credentialResponse.credential);
  // Handle success/error, redirect
};

<GoogleLogin
  onSuccess={handleGoogleLogin}
  onError={handleGoogleLoginError}
  theme="outline"
  size="large"
/>
```

### 4. `src/context/AuthContext.jsx`
```javascript
const loginWithGoogle = async (idToken) => {
  const result = await publicAuthService.loginWithGoogle(idToken);
  // Set user, return result
};
```

### 5. `src/services/public/authService.js` (Already exists)
```javascript
export const loginWithGoogle = async (googleToken) => {
  const response = await axiosInstance.post('/auth/google', {
    token: googleToken,
  });
  // Save tokens, return user
};
```

## 🔧 Backend Requirements

Backend cần có endpoint: `POST /api/auth/google`

**Request:**
```json
{
  "token": "google_id_token_here"
}
```

**Response (Success):**
```json
{
  "accessToken": "jwt_access_token",
  "refreshToken": "jwt_refresh_token",
  "user": {
    "id": 123,
    "username": "user123",
    "email": "user@gmail.com",
    "fullName": "User Name",
    "roleID": 4,
    "avatar": "https://...",
    ...
  }
}
```

**Backend implementation example (Node.js):**
```javascript
// Verify Google token
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
}

// POST /api/auth/google
app.post('/api/auth/google', async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verify token with Google
    const payload = await verifyGoogleToken(token);
    const { email, name, picture, sub: googleId } = payload;
    
    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        fullName: name,
        avatar: picture,
        googleId,
        roleID: 4, // Default: User role
        isVerified: true, // Google email is verified
      });
    }
    
    // Generate JWT tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    res.json({ accessToken, refreshToken, user });
  } catch (error) {
    res.status(401).json({ message: 'Invalid Google token' });
  }
});
```

## ⚠️ Lưu Ý Quan Trọng

### Security

1. **Không commit Google Client ID vào Git** (đã có trong .gitignore)
2. **Mỗi environment nên có Client ID riêng:**
   - Development: `http://localhost:5173`
   - Staging: `https://staging.your-domain.com`
   - Production: `https://your-domain.com`

### Testing

1. **Add test users** trong Google Cloud Console nếu app chưa publish
2. **OAuth Consent Screen** phải được configure đầy đủ
3. **Domain verification** (khi production)

### Errors

**Error: "Invalid Client ID"**
- Check `.env` có đúng Client ID không
- Restart dev server sau khi update `.env`

**Error: "redirect_uri_mismatch"**
- Check "Authorized JavaScript origins" trong Google Console
- Phải match chính xác với URL đang chạy (http://localhost:5173)

**Error: "Access blocked: This app's request is invalid"**
- Check OAuth Consent Screen đã configure chưa
- Thêm test user email vào test users list

## 🎉 Khi Nào Google Login Hoạt Động?

✅ Backend API `/api/auth/google` đã implement  
✅ Google OAuth Client ID đã có và đã thêm vào `.env`  
✅ Authorized origins đã config đúng trong Google Console  
✅ Dev server đã restart sau khi update `.env`

Sau khi đủ các điều kiện trên, Google Login button sẽ hoạt động và user có thể login bằng Google account!

## 📚 Resources

- Google OAuth Guide: https://developers.google.com/identity/protocols/oauth2
- @react-oauth/google: https://www.npmjs.com/package/@react-oauth/google
- Google Cloud Console: https://console.cloud.google.com/

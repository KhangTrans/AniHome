/**
 * GOOGLE OAUTH SETUP GUIDE
 * Hướng dẫn tích hợp Google Login
 */

// ============================================
// BƯỚC 1: CÀI ĐẶT PACKAGE
// ============================================
// npm install @react-oauth/google


// ============================================
// BƯỚC 2: LẤY GOOGLE CLIENT ID
// ============================================
// 1. Truy cập: https://console.cloud.google.com/
// 2. Tạo project mới hoặc chọn project có sẵn
// 3. Enable Google+ API
// 4. Credentials → Create Credentials → OAuth Client ID
// 5. Application type: Web application
// 6. Authorized JavaScript origins: http://localhost:5173
// 7. Copy Client ID


// ============================================
// BƯỚC 3: WRAP APP VỚI GoogleOAuthProvider
// ============================================
// File: src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import './index.css';

const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);


// ============================================
// BƯỚC 4: CẬP NHẬT LoginPage.jsx
// ============================================
// Thay thế function handleGoogleLogin trong LoginPage

import { GoogleLogin } from '@react-oauth/google';

// Trong component:
const LoginPage = () => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const result = await loginWithGoogle(credentialResponse.credential);
      
      if (result.success) {
        // Redirect based on roleID
        const roleID = result.role;
        switch (roleID) {
          case 1: navigate('/admin'); break;
          case 2: navigate('/shelter'); break;
          case 3: navigate('/volunteer'); break;
          default: navigate('/');
        }
      } else {
        setError(result.message || 'Google login failed');
      }
    } catch (error) {
      setError('Google login failed. Please try again.');
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
  };

  return (
    <div>
      {/* ... existing code ... */}
      
      {/* Replace the Google button with GoogleLogin component */}
      <div style={{ marginTop: '1.5rem' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1rem', 
          marginBottom: '1rem' 
        }}>
          <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }}></div>
          <span style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }}></div>
        </div>

        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          theme="outline"
          size="large"
          text="continue_with"
          shape="rectangular"
          width="100%"
        />
      </div>

      {/* ... rest of the code ... */}
    </div>
  );
};


// ============================================
// BƯỚC 5: CUSTOM GOOGLE BUTTON (OPTIONAL)
// ============================================
// Nếu muốn custom button design:

import { useGoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Get user info from Google
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then(res => res.json());

        // Or send the access token directly to your backend
        const result = await loginWithGoogle(tokenResponse.access_token);
        
        if (result.success) {
          switch (result.role) {
            case 1: navigate('/admin'); break;
            case 2: navigate('/shelter'); break;
            case 3: navigate('/volunteer'); break;
            default: navigate('/');
          }
        }
      } catch (error) {
        console.error('Google login error:', error);
      }
    },
    onError: (error) => {
      console.error('Google login error:', error);
    },
  });

  return (
    <button
      type="button"
      onClick={() => googleLogin()}
      style={{
        // Your custom styles
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18">
        {/* Google icon SVG */}
      </svg>
      Continue with Google
    </button>
  );
};


// ============================================
// BƯỚC 6: ENVIRONMENT VARIABLES
// ============================================
// File: .env.local (Tạo file mới ở root)

VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

// File: src/main.jsx (Update)

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Add .env.local to .gitignore!


// ============================================
// BƯỚC 7: BACKEND IMPLEMENTATION
// ============================================
// Backend của bạn cần verify Google token

/*
Java Spring Boot Example:

@PostMapping("/auth/google-login")
public ResponseEntity<?> googleLogin(@RequestBody GoogleLoginRequest request) {
    try {
        // Verify Google ID Token
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(transport, jsonFactory)
            .setAudience(Collections.singletonList(GOOGLE_CLIENT_ID))
            .build();
        
        GoogleIdToken idToken = verifier.verify(request.getIdToken());
        
        if (idToken != null) {
            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            
            // Find or create user
            User user = userService.findOrCreateGoogleUser(email, name);
            
            // Generate tokens
            String accessToken = jwtService.generateAccessToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);
            
            return ResponseEntity.ok(new AuthResponse(accessToken, refreshToken, user));
        }
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(new ErrorResponse("Invalid Google token"));
            
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ErrorResponse("Google authentication failed"));
    }
}
*/


// ============================================
// TESTING
// ============================================
// 1. Chạy app: npm run dev
// 2. Mở browser
// 3. Click "Continue with Google"
// 4. Chọn Google account
// 5. Authorize app
// 6. Kiểm tra redirect và user data


// ============================================
// TROUBLESHOOTING
// ============================================

/*
ERROR: "popup_closed_by_user"
→ User đóng popup, không phải lỗi code

ERROR: "idpiframe_initialization_failed"  
→ Check GOOGLE_CLIENT_ID đúng chưa
→ Check domain trong Google Console

ERROR: "access_denied"
→ User denied permission
→ Check OAuth scopes

ERROR: CORS error
→ Add domain vào "Authorized JavaScript origins" trong Google Console

ERROR: "Invalid token"
→ Token đã expired (1 hour)
→ Token không được verify đúng ở backend
*/


// ============================================
// SECURITY BEST PRACTICES
// ============================================

/*
1. ✅ ALWAYS verify ID token ở backend, KHÔNG tin tưởng client
2. ✅ Set proper authorized domains trong Google Console
3. ✅ Use HTTPS trong production
4. ✅ Store Client ID trong environment variables
5. ✅ Don't expose Client Secret ở frontend
6. ✅ Implement rate limiting cho authentication endpoints
7. ✅ Log authentication attempts cho security audit
*/


// ============================================
// ADDITIONAL FEATURES
// ============================================

// Auto-refresh token before expiry
useEffect(() => {
  const checkTokenExpiry = () => {
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    const now = Date.now();
    
    // Refresh 5 minutes before expiry
    if (tokenExpiry && now > tokenExpiry - 5 * 60 * 1000) {
      refreshAccessToken();
    }
  };
  
  const interval = setInterval(checkTokenExpiry, 60000); // Check every minute
  return () => clearInterval(interval);
}, []);


// One-tap Google Sign In
import { GoogleOneTapLogin } from '@react-oauth/google';

<GoogleOneTapLogin
  onSuccess={handleGoogleSuccess}
  onError={handleGoogleError}
/>


export default {
  note: 'Copy code blocks above vào các files tương ứng để implement Google OAuth'
};

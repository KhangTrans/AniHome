# 🚀 QUICK START GUIDE

## Prerequisites

- ✅ Node.js installed
- ✅ npm or yarn
- ✅ Backend API running (or ready to connect)

## 1️⃣ Install Dependencies

All required packages are already installed:
- ✅ axios
- ✅ react-router-dom
- ✅ lucide-react (icons)

## 2️⃣ Configure Backend URL

Open `src/services/axiosConfig.js` and set your API base URL:

```javascript
const BASE_URL = 'http://localhost:8080/api'; // ⬅️ CHANGE THIS
```

Common configurations:
- Local development: `http://localhost:8080/api`
- Staging: `https://staging.yourapi.com/api`
- Production: `https://api.yourapp.com/api`

## 3️⃣ Start Development Server

```bash
npm run dev
```

App will start at: http://localhost:5173

## 4️⃣ Test the Features

### Test Registration
1. Navigate to `/register`
2. Fill in the form:
   - Username: `testuser` (3-50 chars, no spaces)
   - Email: `test@example.com`
   - Full Name: `Test User`
   - Password: `Test123!` (uppercase + special char required)
   - Confirm Password: `Test123!`
3. Click "Sign Up"
4. ✅ See validation in action!

### Test Login
1. Navigate to `/login`
2. Enter username or email: `testuser` or `test@example.com`
3. Enter password: `Test123!`
4. Click "Sign In"
5. ✅ Should redirect based on role!

## 5️⃣ Backend Implementation Needed

Your backend must respond to these API calls:

### Critical Endpoints:

**POST /api/auth/register**
- Accepts: username, email, password, confirmNewPassword, fullName
- Returns: accessToken, refreshToken, user object

**POST /api/auth/login**
- Accepts: usernameOrEmail, password
- Returns: accessToken, refreshToken, user object

**POST /api/auth/logout**
- Accepts: Authorization header
- Returns: success message

**POST /api/auth/refresh-token**
- Accepts: refreshToken
- Returns: new accessToken

## 6️⃣ Common Issues & Solutions

### Issue: Network Error
**Solution:** Check if backend is running and BASE_URL is correct

### Issue: CORS Error
**Solution:** Backend needs to allow requests from `http://localhost:5173`

Example CORS config (Spring Boot):
```java
@Configuration
public class WebConfig {
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin("http://localhost:5173");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        config.setAllowCredentials(true);
        source.registerCorsConfiguration("/api/**", config);
        return new CorsFilter(source);
    }
}
```

### Issue: Validation Not Working
**Solution:** Check browser console for JavaScript errors

### Issue: Token Not Refreshing
**Solution:** 
1. Check refresh token endpoint response format
2. Verify token stored in localStorage
3. Check axios interceptor is working

## 7️⃣ Verify Installation

Check these files exist:

```
✅ src/services/axiosConfig.js
✅ src/services/authService.js
✅ src/utils/validation.js
✅ src/components/ProtectedRoute.jsx
✅ src/context/AuthContext.jsx (updated)
✅ src/pages/LoginPage.jsx (updated)
✅ src/pages/RegisterPage.jsx (updated)
```

## 8️⃣ Development Workflow

1. **Develop Frontend First** (Current Stage)
   - Test with mock data or local backend
   - Validate all forms work correctly
   - Test navigation and routing

2. **Connect to Backend**
   - Update BASE_URL
   - Test API integration
   - Handle errors from real API

3. **Add Protected Routes**
   - Wrap routes with ProtectedRoute component
   - Test role-based access
   - Implement redirects

4. **Security Hardening**
   - Use HTTPS in production
   - Implement rate limiting
   - Add security headers
   - Enable 2FA (optional)

## 9️⃣ Environment Variables (Recommended)

Create `.env.local` in project root:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_GOOGLE_CLIENT_ID=your_client_id_here
```

Update `axiosConfig.js`:
```javascript
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

⚠️ Add `.env.local` to `.gitignore`!

## 🔟 Next Steps

- [ ] Set up backend API
- [ ] Test registration flow end-to-end
- [ ] Test login flow end-to-end
- [ ] Implement Google OAuth (optional)
- [ ] Add protected routes to your app
- [ ] Deploy to production

## 📚 Additional Resources

- **Full Guide:** See `AUTHENTICATION_GUIDE.md`
- **Google OAuth:** See `GOOGLE_OAUTH_SETUP.js`
- **Route Examples:** See `PROTECTED_ROUTE_EXAMPLES.js`
- **Summary:** See `IMPLEMENTATION_SUMMARY.md`

## 🆘 Need Help?

1. Check console for errors
2. Verify network requests in DevTools
3. Check backend logs
4. Review documentation files
5. Test with tools like Postman first

---

**You're all set! 🎉**

Start your backend, run `npm run dev`, and begin testing!

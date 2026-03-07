# 🎨 AUTHENTICATION FLOW DIAGRAMS

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  LoginPage   │    │ RegisterPage │    │ ProtectedRoute│  │
│  │              │    │              │    │               │  │
│  │ - Username/  │    │ - Validation │    │ - Role check  │  │
│  │   Email      │    │ - Form       │    │ - Redirect    │  │
│  │ - Password   │    │ - Errors     │    │               │  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬────────┘  │
│         │                   │                    │           │
│         └───────────────────┼────────────────────┘           │
│                             │                                │
│                    ┌────────▼────────┐                       │
│                    │  AuthContext    │                       │
│                    │                 │                       │
│                    │ - User State    │                       │
│                    │ - Login()       │                       │
│                    │ - Register()    │                       │
│                    │ - Logout()      │                       │
│                    └────────┬────────┘                       │
│                             │                                │
│                    ┌────────▼────────┐                       │
│                    │  authService    │                       │
│                    │                 │                       │
│                    │ - API Calls     │                       │
│                    │ - Token Mgmt    │                       │
│                    └────────┬────────┘                       │
│                             │                                │
│                    ┌────────▼────────┐                       │
│                    │  axiosConfig    │                       │
│                    │                 │                       │
│                    │ - Interceptors  │                       │
│                    │ - Auto Refresh  │                       │
│                    └────────┬────────┘                       │
└─────────────────────────────┼────────────────────────────────┘
                              │
                              │ HTTP Requests
                              │
┌─────────────────────────────▼────────────────────────────────┐
│                      BACKEND API                             │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  POST /api/auth/register                                     │
│  POST /api/auth/login                                        │
│  POST /api/auth/google-login                                 │
│  POST /api/auth/logout                                       │
│  POST /api/auth/refresh-token                                │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## 🔄 Registration Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. Fill Registration Form
     ▼
┌─────────────────┐
│ RegisterPage    │
│                 │
│ - username      │
│ - email         │
│ - fullName      │
│ - password      │
│ - confirm pwd   │
└────┬────────────┘
     │
     │ 2. Client-side Validation
     ▼
┌─────────────────┐
│ validation.js   │
│                 │
│ ✓ Username 3-50 │
│ ✓ Email valid   │
│ ✓ Password rules│
│ ✓ Pwd match     │
└────┬────────────┘
     │
     │ 3. If valid, call register()
     ▼
┌─────────────────┐
│ AuthContext     │
│ register(data)  │
└────┬────────────┘
     │
     │ 4. Call API
     ▼
┌─────────────────┐
│ authService     │
│ POST /register  │
└────┬────────────┘
     │
     │ 5. HTTP Request
     ▼
┌─────────────────┐
│ axiosConfig     │
│ + interceptors  │
└────┬────────────┘
     │
     │ 6. To Backend
     ▼
┌─────────────────┐
│ Backend API     │
│                 │
│ - Validate      │
│ - Create User   │
│ - Generate JWT  │
└────┬────────────┘
     │
     │ 7. Response
     ▼
┌─────────────────────────┐
│ Response:               │
│ {                       │
│   accessToken: "...",   │
│   refreshToken: "...",  │
│   user: {               │
│     id, username,       │
│     email, fullName,    │
│     roleID              │
│   }                     │
│ }                       │
└────┬────────────────────┘
     │
     │ 8. Store tokens + user
     ▼
┌─────────────────┐
│ localStorage    │
│                 │
│ - accessToken   │
│ - refreshToken  │
│ - user          │
└────┬────────────┘
     │
     │ 9. Update context
     ▼
┌─────────────────┐
│ AuthContext     │
│ setUser(user)   │
└────┬────────────┘
     │
     │ 10. Redirect based on roleID
     ▼
┌─────────────────┐
│ Role-based      │
│ Navigation      │
│                 │
│ 1 → /admin      │
│ 2 → /shelter    │
│ 3 → /volunteer  │
│ 4 → /           │
└─────────────────┘
```

## 🔐 Login Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. Enter credentials
     ▼
┌──────────────────────┐
│ LoginPage            │
│                      │
│ - usernameOrEmail    │
│ - password           │
└────┬─────────────────┘
     │
     │ 2. Click "Sign In"
     ▼
┌──────────────────────┐
│ Validation           │
│                      │
│ ✓ Fields not empty   │
└────┬─────────────────┘
     │
     │ 3. Call login()
     ▼
┌──────────────────────┐
│ AuthContext          │
│ login(user, pwd)     │
└────┬─────────────────┘
     │
     │ 4. API Request
     ▼
┌──────────────────────┐
│ authService          │
│ POST /auth/login     │
└────┬─────────────────┘
     │
     │ 5. Backend validates
     ▼
┌──────────────────────┐
│ Backend              │
│                      │
│ - Check credentials  │
│ - Generate tokens    │
└────┬─────────────────┘
     │
     │ 6. Success response
     ▼
┌──────────────────────┐
│ Store in localStorage│
│ + Update context     │
└────┬─────────────────┘
     │
     │ 7. Navigate by role
     ▼
┌──────────────────────┐
│ Dashboard            │
└──────────────────────┘
```

## 🔄 Token Refresh Flow (Automatic)

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. Use app normally
     ▼
┌──────────────────────────┐
│ Any Protected Page       │
│                          │
│ - Fetch data             │
│ - Submit form            │
│ - etc.                   │
└────┬─────────────────────┘
     │
     │ 2. API Request with token
     ▼
┌──────────────────────────┐
│ axiosConfig              │
│                          │
│ Request Interceptor:     │
│ + Add Authorization      │
│   Bearer <accessToken>   │
└────┬─────────────────────┘
     │
     │ 3. Send to backend
     ▼
┌──────────────────────────┐
│ Backend API              │
│                          │
│ Validate token...        │
│ Token expired! ❌        │
└────┬─────────────────────┘
     │
     │ 4. Return 401 Unauthorized
     ▼
┌──────────────────────────┐
│ axiosConfig              │
│                          │
│ Response Interceptor:    │
│ Catch 401 error          │
└────┬─────────────────────┘
     │
     │ 5. Get refreshToken
     ▼
┌──────────────────────────┐
│ localStorage             │
│ refreshToken: "..."      │
└────┬─────────────────────┘
     │
     │ 6. Call refresh API
     ▼
┌──────────────────────────┐
│ POST /auth/refresh-token │
│                          │
│ Body: { refreshToken }   │
└────┬─────────────────────┘
     │
     │ 7. Get new accessToken
     ▼
┌──────────────────────────┐
│ Response:                │
│ {                        │
│   accessToken: "new..."  │
│ }                        │
└────┬─────────────────────┘
     │
     │ 8. Update localStorage
     ▼
┌──────────────────────────┐
│ localStorage             │
│ accessToken = new token  │
└────┬─────────────────────┘
     │
     │ 9. Retry original request
     │    with new token
     ▼
┌──────────────────────────┐
│ Original API Call        │
│                          │
│ Authorization: Bearer    │
│ <new accessToken>        │
└────┬─────────────────────┘
     │
     │ 10. Success! ✅
     ▼
┌──────────────────────────┐
│ Return data to component │
└──────────────────────────┘

     ⚠️ If refresh fails:
     │
     ▼
┌──────────────────────────┐
│ Clear localStorage       │
│ Redirect to /login       │
└──────────────────────────┘
```

## 🚪 Logout Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. Click "Logout"
     ▼
┌──────────────────────┐
│ AuthContext          │
│ logout()             │
└────┬─────────────────┘
     │
     │ 2. Call API
     ▼
┌──────────────────────┐
│ authService          │
│ POST /auth/logout    │
└────┬─────────────────┘
     │
     │ 3. Backend invalidates
     │    refresh token
     ▼
┌──────────────────────┐
│ Backend              │
│ - Blacklist token    │
│ - Delete session     │
└────┬─────────────────┘
     │
     │ 4. Clear frontend
     ▼
┌──────────────────────┐
│ localStorage.clear() │
└────┬─────────────────┘
     │
     │ 5. Reset state
     ▼
┌──────────────────────┐
│ AuthContext          │
│ setUser(null)        │
└────┬─────────────────┘
     │
     │ 6. Redirect
     ▼
┌──────────────────────┐
│ Navigate to /login   │
└──────────────────────┘
```

## 🛡️ Protected Route Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ Try to access /admin
     ▼
┌───────────────────────────┐
│ ProtectedRoute            │
│                           │
│ allowedRoles={[1]}        │
└────┬──────────────────────┘
     │
     │ Check authentication
     ▼
   ┌───────────────┐
   │ isAuthenticated? │
   └────┬───────┬────┘
        │       │
    NO  │       │ YES
        │       │
        ▼       ▼
   ┌────────┐ ┌────────────────┐
   │Redirect│ │ Check user role│
   │/login  │ │                │
   └────────┘ └────┬───────────┘
                   │
                   ▼
              ┌────────────────┐
              │ user.roleID === 1? │
              └────┬───────┬────┘
                   │       │
               YES │       │ NO
                   │       │
                   ▼       ▼
          ┌─────────────┐ ┌──────────────┐
          │ Render Page │ │ Redirect to  │
          │             │ │ appropriate  │
          │   /admin    │ │ dashboard    │
          └─────────────┘ └──────────────┘
```

## 📱 State Management

```
┌─────────────────────────────────────┐
│          AuthContext State          │
├─────────────────────────────────────┤
│                                     │
│  user: {                            │
│    id: number                       │
│    username: string                 │
│    email: string                    │
│    fullName: string                 │
│    roleID: number                   │
│  } | null                           │
│                                     │
│  loading: boolean                   │
│  isAuthenticated: boolean           │
│                                     │
│  Functions:                         │
│  - login(username, password)        │
│  - register(userData)               │
│  - loginWithGoogle(idToken)         │
│  - logout()                         │
│                                     │
└─────────────────────────────────────┘
         │
         ├── Used by: All components
         │
         └── Syncs with: localStorage
```

## 💾 localStorage Structure

```
localStorage
├── accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
├── refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
└── user: "{
      \"id\": 1,
      \"username\": \"johndoe\",
      \"email\": \"john@example.com\",
      \"fullName\": \"John Doe\",
      \"roleID\": 4
    }"
```

## 🎯 Role-Based Access Matrix

```
┌─────────────┬──────────┬─────────┬───────────┬──────┐
│   Route     │ roleID 1 │roleID 2 │ roleID 3  │roleID│
│             │(SuperAdm)│(Shelter)│(Volunteer)│  4   │
├─────────────┼──────────┼─────────┼───────────┼──────┤
│ /           │    ✅    │   ✅    │    ✅     │  ✅  │
│ /login      │    ✅    │   ✅    │    ✅     │  ✅  │
│ /register   │    ✅    │   ✅    │    ✅     │  ✅  │
├─────────────┼──────────┼─────────┼───────────┼──────┤
│ /admin/*    │    ✅    │   ❌    │    ❌     │  ❌  │
│ /shelter/*  │    ❌    │   ✅    │    ❌     │  ❌  │
│ /volunteer/*│    ❌    │   ❌    │    ✅     │  ❌  │
│ /profile    │    ✅    │   ✅    │    ✅     │  ✅  │
└─────────────┴──────────┴─────────┴───────────┴──────┘

✅ = Access Allowed
❌ = Access Denied (Redirected)
```

---

**Use these diagrams to understand the complete authentication flow!**

All flows are implemented and ready to use. Just connect to your backend API! 🚀

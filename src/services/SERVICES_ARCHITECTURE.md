# 📁 Services Architecture - Role-Based Organization

Cấu trúc services được tổ chức theo roles để dễ quản lý và maintain.

## 📂 Cấu trúc Thư Mục

```
src/services/
├── axiosConfig.js              # Base Axios configuration
├── uploadService.js            # File upload utilities (shared)
│
├── public/                     # 🌐 PUBLIC APIs (16 endpoints)
│   ├── index.js                   └── Guest/Public access, không cần authentication
│   ├── authService.js             # Register, Login, Google Login
│   ├── petsService.js             # GET pets, pet details
│   ├── sheltersService.js         # GET shelters, shelter details
│   ├── postsService.js            # GET posts (blog)
│   ├── homeStatsService.js        # GET home statistics
│   ├── adoptionService.js         # POST adoption requests
│   └── donationService.js         # POST donation payments (VNPay)
│
├── user/                       # 👤 USER APIs (5 endpoints)
│   ├── index.js                   └── Role: User (RoleID = 4)
│   └── userService.js             # Change password, update profile, refresh token, logout
│
├── volunteer/                  # 🙋 VOLUNTEER APIs (4 endpoints)
│   ├── index.js                   └── Role: Volunteer (RoleID = 3)
│   └── volunteerService.js        # Tasks, assigned pets, care logs
│
├── shelter/                    # 🏥 SHELTER APIs (9 endpoints)
│   ├── index.js                   └── Role: Shelter (RoleID = 2)
│   ├── shelterDashboardService.js # Dashboard stats
│   ├── shelterPetsService.js      # Manage pets
│   ├── shelterEventsService.js    # Manage events
│   └── inventoryService.js        # Manage inventory/supplies
│
└── admin/                      # 🛡️ ADMIN APIs (11 endpoints)
    ├── index.js                   └── Role: Admin (RoleID = 1)
    ├── adminDashboardService.js   # System overview
    ├── adminSheltersService.js    # Manage all shelters
    ├── adminModerationService.js  # Content moderation (posts, reports)
    └── adminCategoriesService.js  # Manage pet categories
```

## 🎯 Cách Sử Dụng

### 1. Import từ Public APIs (Không cần auth)

```javascript
// Option 1: Import trực tiếp từ file
import { getPets, getPetById } from '../services/public/petsService';
import { register, login } from '../services/public/authService';
import { submitAdoptionRequest } from '../services/public/adoptionService';

// Option 2: Import từ index (recommended)
import { getPets, register, submitAdoptionRequest } from '../services/public';
```

### 2. Import từ User APIs (Cần auth token)

```javascript
import { changePassword, updateProfile, logout } from '../services/user';

// Usage example
const handlePasswordChange = async () => {
  const result = await changePassword({
    currentPassword: 'old123',
    newPassword: 'new123',
    confirmNewPassword: 'new123',
  });
  
  if (result.success) {
    toast.success(result.message);
  } else {
    toast.error(result.error);
  }
};
```

### 3. Import từ Volunteer APIs

```javascript
import { getTodayTasks, completeTask, submitCareLog } from '../services/volunteer';

// Usage example
const VolunteerDashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  
  useEffect(() => {
    const fetchTasks = async () => {
      const result = await getTodayTasks(user.id);
      if (result.success) setTasks(result.data);
    };
    fetchTasks();
  }, [user.id]);
};
```

### 4. Import từ Shelter APIs

```javascript
import { 
  getShelterDashboard, 
  getShelterPets, 
  addShelterPet,
  updatePetStatus,
  getShelterEvents,
  getShelterInventory 
} from '../services/shelter';

// Usage example - AnimalManager.jsx
const AnimalManager = () => {
  const { user } = useAuth(); // user.shelterId
  const [pets, setPets] = useState([]);
  
  useEffect(() => {
    const fetchPets = async () => {
      const result = await getShelterPets(user.shelterId);
      if (result.success) setPets(result.data);
    };
    fetchPets();
  }, [user.shelterId]);
  
  const handleAddPet = async (petData) => {
    const result = await addShelterPet(user.shelterId, petData);
    if (result.success) {
      toast.success(result.message);
      // Refresh pets list
    }
  };
};
```

### 5. Import từ Admin APIs

```javascript
import { 
  getAdminDashboard,
  getAllShelters,
  updateShelterStatus,
  getPendingPosts,
  reviewPost,
  getAllCategories 
} from '../services/admin';

// Usage example - ContentModerator.jsx
const ContentModerator = () => {
  const [posts, setPosts] = useState([]);
  
  useEffect(() => {
    const fetchPendingPosts = async () => {
      const result = await getPendingPosts({ status: 'pending' });
      if (result.success) setPosts(result.data);
    };
    fetchPendingPosts();
  }, []);
  
  const handleReview = async (postId, action) => {
    const result = await reviewPost(postId, { action });
    if (result.success) {
      toast.success(result.message);
      // Refresh posts list
    }
  };
};
```

## 📊 API Response Format

Tất cả services đều return consistent format:

```javascript
// Success
{
  success: true,
  data: { ... },
  message: 'Optional success message'
}

// Error
{
  success: false,
  error: 'Error message from server or default'
}
```

## 🔐 Authentication Flow

```javascript
// 1. Login/Register (Public)
import { login, register } from '../services/public';

const result = await login('username', 'password');
if (result.success) {
  // Token tự động lưu vào localStorage
  // user info lưu vào localStorage
  // Redirect based on role
}

// 2. Make authenticated requests
// axiosConfig.js tự động thêm accessToken vào headers

// 3. Token refresh (User service)
import { refreshToken } from '../services/user';

// Auto-called by axios interceptor khi token expired
const result = await refreshToken();

// 4. Logout (User service)
import { logout } from '../services/user';

const result = await logout(userId);
// Clear localStorage và redirect to login
```

## ⚠️ Important Notes

### 1. **Old imports cần update:**

Migration từ structure cũ sang mới:

```javascript
// ❌ OLD (Deprecated)
import { getPets } from '../services/petsService';
import { getShelters } from '../services/sheltersService';
import { login } from '../services/authService';

// ✅ NEW (Recommended)
import { getPets } from '../services/public/petsService';  // hoặc '../services/public'
import { getShelters } from '../services/public/sheltersService';
import { login } from '../services/public/authService';
```

### 2. **Role-based imports:**

Chỉ import APIs phù hợp với role của component:

```javascript
// ✅ UserLandingPage.jsx - Public APIs
import { getPets, getShelters } from '../services/public';

// ✅ VolunteerDashboard.jsx - Volunteer APIs
import { getTodayTasks } from '../services/volunteer';

// ✅ ShelterDashboard.jsx/AnimalManager.jsx - Shelter APIs
import { getShelterPets, addShelterPet } from '../services/shelter';

// ✅ SuperAdminDashboard.jsx - Admin APIs
import { getAdminDashboard, getAllShelters } from '../services/admin';
```

### 3. **Shared utilities:**

```javascript
// uploadService.js stays at root level (shared by all roles)
import { uploadImage } from '../services/uploadService';

// axiosConfig.js at root (base configuration)
import axiosInstance from '../services/axiosConfig';
```

## 📝 Checklist Migration

- [ ] Update imports in UserLandingPage.jsx
- [ ] Update imports in ShelterListPage.jsx
- [ ] Update imports in ShelterDetailPage.jsx
- [ ] Update imports in LoginPage.jsx
- [ ] Update imports in RegisterPage.jsx
- [ ] Update imports in DonationPage.jsx
- [ ] Update imports in VolunteerDashboard.jsx
- [ ] Update imports in ShelterDashboard pages
- [ ] Update imports in SuperAdminDashboard pages
- [ ] Delete old service files from root after migration
- [ ] Test all pages to ensure services work correctly

## 🎨 Benefits of This Structure

✅ **Role-based Separation** - Dễ quản lý quyền truy cập  
✅ **Clear Organization** - Biết API nào thuộc role nào  
✅ **Scalability** - Dễ thêm APIs mới  
✅ **Maintainability** - Dễ maintain và debug  
✅ **Type Safety** - Có thể thêm TypeScript sau này  
✅ **Consistent Patterns** - Tất cả services follow same pattern

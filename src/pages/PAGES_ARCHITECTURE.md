# 📁 Pages Architecture - Role-Based Organization

Cấu trúc pages được tổ chức theo roles để dễ quản lý và maintain, tương tự như services.

## 📂 Cấu trúc Thư Mục

```
src/pages/
│
├── public/                     # 🌐 PUBLIC PAGES (12 pages)
│   │                              └── Không cần authentication
│   ├── UserLandingPage.jsx        # Homepage/Landing page
│   ├── LoginPage.jsx              # Đăng nhập
│   ├── RegisterPage.jsx           # Đăng ký
│   ├── ForgotPasswordPage.jsx     # Quên mật khẩu
│   ├── ShelterListPage.jsx        # Danh sách trạm cứu hộ (public view)
│   ├── ShelterDetailPage.jsx      # Chi tiết trạm (public view)
│   ├── PetsListPage.jsx           # Danh sách thú cưng (public view)
│   ├── PetDetailPage.jsx          # Chi tiết thú cưng (public view)
│   ├── BlogListPage.jsx           # Danh sách blog/posts
│   ├── DonationPage.jsx           # Trang quyên góp
│   ├── DonationSuccessPage.jsx    # Quyên góp thành công
│   └── DonationFailedPage.jsx     # Quyên góp thất bại
│
├── user/                       # 👤 USER PAGES
│   │                              └── Role: User (RoleID = 4)
│   └── (Current: empty - có thể thêm UserProfile, UserSettings, etc.)
│
├── volunteer/                  # 🙋 VOLUNTEER PAGES (1 page)
│   │                              └── Role: Volunteer (RoleID = 3)
│   └── VolunteerDashboard.jsx     # Volunteer dashboard + sub-routes
│
├── shelter/                    # 🏥 SHELTER PAGES (5 pages)
│   │                              └── Role: Shelter (RoleID = 2)
│   ├── ShelterDashboard.jsx       # Shelter main dashboard với sub-routes
│   ├── ShelterOverview.jsx        # Tổng quan shelter
│   ├── AnimalManager.jsx          # Quản lý thú cưng
│   ├── InventoryManager.jsx       # Quản lý kho vật tư
│   └── ScheduleManager.jsx        # Quản lý lịch sự kiện
│
└── admin/                      # 🛡️ ADMIN PAGES (6 pages)
    │                              └── Role: Admin (RoleID = 1)
    ├── SuperAdminDashboard.jsx    # Admin main dashboard với sub-routes
    ├── AdminOverview.jsx          # Tổng quan hệ thống
    ├── CategoryEditor.jsx         # Quản lý categories
    ├── ContentModerator.jsx       # Duyệt nội dung
    ├── ReportManager.jsx          # Quản lý báo cáo vi phạm
    └── ShelterManager.jsx         # Quản lý shelters
```

## 🎯 Routing Structure

### Public Routes (Không cần auth)

```javascript
import UserLandingPage from './pages/public/UserLandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
// ... other public pages

<Routes>
  <Route path="/" element={<UserLandingPage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
  
  <Route path="/shelters" element={<ShelterListPage />} />
  <Route path="/shelters/:id" element={<ShelterDetailPage />} />
  
  <Route path="/pets" element={<PetsListPage />} />
  <Route path="/pets/:id" element={<PetDetailPage />} />
  
  <Route path="/blog" element={<BlogListPage />} />
  
  <Route path="/donation" element={<DonationPage />} />
  <Route path="/donation/success" element={<DonationSuccessPage />} />
  <Route path="/donation/failed" element={<DonationFailedPage />} />
</Routes>
```

### Protected Routes (Cần auth + specific role)

```javascript
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';
import ShelterDashboard from './pages/shelter/ShelterDashboard';
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';

<Routes>
  {/* Admin Routes */}
  <Route 
    path="/admin/*" 
    element={
      <ProtectedRoute allowedRoles={['super_admin']}>
        <SuperAdminDashboard />
      </ProtectedRoute>
    } 
  />
  
  {/* Shelter Routes */}
  <Route 
    path="/shelter/*" 
    element={
      <ProtectedRoute allowedRoles={['shelter_admin']}>
        <ShelterDashboard />
      </ProtectedRoute>
    } 
  />
  
  {/* Volunteer Routes */}
  <Route 
    path="/volunteer/*" 
    element={
      <ProtectedRoute allowedRoles={['volunteer']}>
        <VolunteerDashboard />
      </ProtectedRoute>
    } 
  />
</Routes>
```

## 📦 Dashboard Sub-Routes

Each dashboard component handles its own sub-routes:

### SuperAdminDashboard.jsx

```javascript
import AdminOverview from './admin/AdminOverview';
import CategoryEditor from './admin/CategoryEditor';
import ContentModerator from './admin/ContentModerator';
import ReportManager from './admin/ReportManager';
import ShelterManager from './admin/ShelterManager';

<Routes>
  <Route path="/" element={<AdminOverview />} />
  <Route path="/categories" element={<CategoryEditor />} />
  <Route path="/moderation" element={<ContentModerator />} />
  <Route path="/reports" element={<ReportManager />} />
  <Route path="/shelters" element={<ShelterManager />} />
</Routes>
```

### ShelterDashboard.jsx

```javascript
import ShelterOverview from './shelter/ShelterOverview';
import AnimalManager from './shelter/AnimalManager';
import InventoryManager from './shelter/InventoryManager';
import ScheduleManager from './shelter/ScheduleManager';

<Routes>
  <Route path="/" element={<ShelterOverview />} />
  <Route path="/animals" element={<AnimalManager />} />
  <Route path="/inventory" element={<InventoryManager />} />
  <Route path="/schedule" element={<ScheduleManager />} />
</Routes>
```

## 🔐 Role-Based Access Control

### Public Pages
- **Access:** Anyone (Guest users)
- **Services:** `services/public/*`
- **Features:** View info, register, login, donate, adoption requests

### User Pages
- **Access:** Authenticated users (RoleID = 4)
- **Services:** `services/user/*`
- **Features:** Profile management, change password

### Volunteer Pages
- **Access:** Volunteer role only (RoleID = 3)
- **Services:** `services/volunteer/*`
- **Features:** View tasks, submit care logs

### Shelter Pages
- **Access:** Shelter admin role only (RoleID = 2)
- **Services:** `services/shelter/*`
- **Features:** Manage pets, events, inventory

### Admin Pages
- **Access:** Super admin role only (RoleID = 1)
- **Services:** `services/admin/*`
- **Features:** Full system management

## 🎨 Page Components Usage

### Public Page Example

```javascript
// src/pages/public/PetsListPage.jsx
import { getPets } from '../../services/public/petsService';

export default function PetsListPage() {
  const [pets, setPets] = useState([]);
  
  useEffect(() => {
    const fetchPets = async () => {
      const result = await getPets({ page: 1, pageSize: 20 });
      if (result.success) setPets(result.data.items);
    };
    fetchPets();
  }, []);
  
  return <div>...</div>;
}
```

### Protected Page Example

```javascript
// src/pages/shelter/AnimalManager.jsx
import { getShelterPets, addShelterPet } from '../../services/shelter/shelterPetsService';
import { useAuth } from '../../context/AuthContext';

export default function AnimalManager() {
  const { user } = useAuth();
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
      // Refresh list
    }
  };
  
  return <div>...</div>;
}
```

## 📊 Page Organization Benefits

✅ **Clear Separation** - Dễ phân biệt public vs protected pages  
✅ **Role-Based Structure** - Match với services structure  
✅ **Easy Navigation** - Biết page nào ở đâu  
✅ **Maintainable** - Dễ maintain và scale  
✅ **Consistent Auth** - Rõ ràng về quyền truy cập  
✅ **Better Security** - Role-based routing rõ ràng

## 🔄 Migration Checklist

✅ Created role-based folders (public, user, volunteer, shelter, admin)  
✅ Moved 12 public pages to `pages/public/`  
✅ Moved VolunteerDashboard to `pages/volunteer/`  
✅ Moved ShelterDashboard to `pages/shelter/` (already had 4 sub-pages)  
✅ Moved SuperAdminDashboard to `pages/admin/` (already had 5 sub-pages)  
✅ Updated imports in App.jsx  
✅ No compilation errors

## 📝 Future Additions

Có thể thêm pages mới vào đúng folder:

### User Pages (Future)
- `UserProfilePage.jsx` - Xem/edit profile
- `UserSettingsPage.jsx` - User settings
- `UserAdoptionHistoryPage.jsx` - Lịch sử nhận nuôi
- `UserDonationHistoryPage.jsx` - Lịch sử quyên góp

### Public Pages (Future)
- `AboutUsPage.jsx` - Về chúng tôi
- `ContactPage.jsx` - Liên hệ
- `FAQPage.jsx` - Câu hỏi thường gặp
- `TermsPage.jsx` - Điều khoản sử dụng

## 🚀 Quick Reference

```bash
# Public pages (không auth)
src/pages/public/

# User pages (auth required)
src/pages/user/

# Volunteer pages (volunteer role)
src/pages/volunteer/

# Shelter pages (shelter_admin role)
src/pages/shelter/

# Admin pages (super_admin role)
src/pages/admin/
```

Match với services structure:
```bash
src/services/public/   → src/pages/public/
src/services/user/     → src/pages/user/
src/services/volunteer/ → src/pages/volunteer/
src/services/shelter/  → src/pages/shelter/
src/services/admin/    → src/pages/admin/
```

Perfect symmetry! 🎯

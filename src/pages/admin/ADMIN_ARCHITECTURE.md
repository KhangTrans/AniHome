# Admin Pages Architecture

## Structure Overview

```
src/pages/admin/
├── SuperAdminDashboard.jsx    # Main admin layout với sidebar & routing
├── AdminLayout.css            # Shared admin styles
│
├── dashboard/                 # Dashboard Module
│   ├── index.jsx             # Dashboard overview page
│   ├── components/           # Dashboard-specific components
│   └── README.md
│
├── shelters/                 # Shelter Management Module
│   ├── index.jsx            # Shelter manager page
│   ├── components/          # Shelter-specific components
│   └── README.md
│
├── moderation/              # Content Moderation Module
│   ├── ContentModerator.jsx # Blog post moderation
│   ├── ReportManager.jsx    # User reports handling
│   ├── components/          # Moderation-specific components
│   └── README.md
│
└── categories/              # Categories Module
    ├── index.jsx           # Category management page
    ├── components/         # Category-specific components
    └── README.md
```

## Module Responsibilities

### Dashboard Module
**Path:** `./dashboard`
- Display system statistics (users, shelters, pets, adoptions)
- Show adoption success rate chart
- Display donation & expense tracker
- Pending blog posts preview

**Services Used:**
- `src/services/admin/adminDashboardService.js`

**Routes:**
- `/admin` - Main dashboard

---

### Shelters Module
**Path:** `./shelters`
- List all shelters with pagination
- Search and filter shelters
- Approve/Reject/Delete shelter applications
- Update shelter status

**Services Used:**
- `src/services/admin/adminSheltersService.js`

**Routes:**
- `/admin/shelters` - Shelter management

---

### Moderation Module
**Path:** `./moderation`

#### Content Moderator
- Review pending blog posts
- Approve or reject posts
- View post details

#### Report Manager
- View all user reports
- Handle violations
- Take action on reported content

**Services Used:**
- `src/services/admin/adminModerationService.js`

**Routes:**
- `/admin/content` - Content moderation
- `/admin/reports` - Report management

---

### Categories Module
**Path:** `./categories`
- List all categories
- Create new categories
- Edit existing categories
- Delete categories

**Services Used:**
- `src/services/admin/adminCategoriesService.js`

**Routes:**
- `/admin/categories` - Category management

---

## Layout Structure

### SuperAdminDashboard (Main Layout)
Uses Ant Design Layout components:
- **Sider**: Collapsible sidebar (260px -> 80px)
- **Content**: Dynamic content area
- **Mobile**: Overlay sidebar with hamburger menu

### Sidebar Navigation
- Dashboard (Tổng Quan)
- Shelter Management (Quản Lý Trạm)
- Content Moderation (Kiểm Duyệt Nội Dung)
- Report Management (Báo Cáo Vi Phạm)
- Categories (Danh Mục)

---

## Shared Styles
**File:** `AdminLayout.css`
- Mobile header styles
- Page header styles
- Stats grid layout
- Charts grid layout
- Mobile text utilities

---

## Component Organization

Each module can have its own components folder for:
- Reusable UI components
- Feature-specific forms
- Custom tables/lists
- Modals and dialogs

Example:
```
dashboard/components/
├── StatCard.jsx
├── PieChart.jsx
└── BarChart.jsx
```

---

## API Integration

All admin API calls use services from:
```
src/services/admin/
├── index.js                      # Main export
├── adminDashboardService.js      # Dashboard stats
├── adminSheltersService.js       # Shelter CRUD
├── adminModerationService.js     # Content & reports
└── adminCategoriesService.js     # Category management
```

---

## Future Improvements

1. **Extract Reusable Components**
   - StatCard component for dashboard
   - DataTable component for listings
   - Modal wrappers for actions

2. **Add Module-Specific Styles**
   - Each module can have its own CSS file
   - Use CSS modules or styled-components

3. **State Management**
   - Consider adding Redux/Zustand for complex state
   - Share data between modules

4. **Testing**
   - Add unit tests for each module
   - Integration tests for user flows

5. **Documentation**
   - API documentation for each service
   - Component documentation with examples

---

## Development Guidelines

1. **Keep modules independent**: Each module should be self-contained
2. **Use README files**: Document features and usage in each module
3. **Consistent naming**: Use clear, descriptive names for files
4. **Component extraction**: Extract reusable logic into components
5. **Service calls**: Always use services, never direct API calls

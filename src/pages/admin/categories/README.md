# Categories Management Module

## Overview
Quản lý thể loại trong hệ thống (Pet, Supply, Service).

## Files
- `index.jsx` - Category management page (✅ API Integrated)
- `components/CategoryForm.jsx` - Reusable add/edit form (✅ Completed)

## Features
- ✅ List all categories with item count
- ✅ Create new categories (categoryName + categoryType)
- ✅ Edit existing categories (inline form)
- ✅ Delete categories (with protection for categories with items)
- ✅ Reusable form component for add and edit
- ✅ Real-time data refresh
- ✅ Loading states and error handling
- ✅ Form validation

## API Endpoints
```text
GET    /api/admin/categories        - Fetch all categories
POST   /api/admin/categories        - Create category
PUT    /api/admin/categories/{id}   - Update category
DELETE /api/admin/categories/{id}   - Delete category
```

## API Services
Uses: `src/services/admin/adminCategoriesService.js`
- `getAllCategories()` - Fetch categories
- `createCategory(data)` - Create new category
- `updateCategory(id, data)` - Update existing category
- `deleteCategory(id)` - Delete category
- `validateCategoryData(data)` - Form validation
- `CATEGORY_TYPES` - Available category types

## Data Structure
```javascript
{
  categoryID: number,
  categoryName: string,
  categoryType: string,  // "Pet" | "Supply" | "Service"
  itemCount: number      // Number of items in this category
}
```

## Components
### CategoryForm
Reusable form component for both adding and editing categories.

**Props:**
- `category` (Object|null): Category to edit, or null for add mode
- `onSubmit` (Function): Callback when form is submitted
- `onCancel` (Function): Callback to cancel editing
- `submitting` (boolean): Loading state

**Features:**
- Automatically switches between add/edit mode
- Form validation with error messages
- Disabled state while submitting
- Cancel button in edit mode

## Future Components
- `components/CategoryList.jsx` - Reusable category table
- `components/CategoryStats.jsx` - Category statistics

# Import Path Reference

## After Restructuring

When files were moved to feature folders, import paths changed:

### ✅ Correct Import Paths

#### Files in root admin folder (`src/pages/admin/`)
Example: `SuperAdminDashboard.jsx`
```javascript
import Sidebar from '../../components/Sidebar';
import './AdminLayout.css';
```

#### Files in feature subfolders (`src/pages/admin/<feature>/`)
Examples: `dashboard/index.jsx`, `shelters/index.jsx`, etc.

**Services:**
```javascript
import { getAdminDashboard } from '../../../services/admin/adminDashboardService';
import { getAllShelters } from '../../../services/admin/adminSheltersService';
```

**Context:**
```javascript
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../context/AuthContext';
```

**Shared CSS:**
```javascript
import '../AdminLayout.css';  // From feature folders
```

### Path Rules

From `src/pages/admin/<feature>/index.jsx`:
- To reach `src/services/`: Use `../../../services/`
- To reach `src/context/`: Use `../../../context/`
- To reach `src/components/`: Use `../../../components/`
- To reach parent CSS: Use `../AdminLayout.css`

From `src/pages/admin/SuperAdminDashboard.jsx`:
- To reach `src/services/`: Use `../../services/`
- To reach `src/context/`: Use `../../context/`
- To reach `src/components/`: Use `../../components/`

### Common Mistakes ❌

```javascript
// WRONG - Too few levels up
import { useToast } from '../../context/ToastContext';  // From feature folder

// CORRECT - Three levels up
import { useToast } from '../../../context/ToastContext';
```

### Quick Reference

| From Location | To Location | Path |
|--------------|-------------|------|
| `admin/shelters/index.jsx` | `services/admin/` | `../../../services/admin/` |
| `admin/dashboard/index.jsx` | `context/` | `../../../context/` |
| `admin/SuperAdminDashboard.jsx` | `components/` | `../../components/` |
| `admin/shelters/index.jsx` | `admin/AdminLayout.css` | `../AdminLayout.css` |

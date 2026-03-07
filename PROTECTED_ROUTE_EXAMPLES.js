/**
 * EXAMPLE: How to use ProtectedRoute in App.jsx
 * 
 * Update your routing configuration to protect routes
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute, { PublicOnlyRoute } from './components/ProtectedRoute';

// Import pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserLandingPage from './pages/UserLandingPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ShelterDashboard from './pages/ShelterDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';

function App() {
  return (
    <Routes>
      {/* PUBLIC ONLY ROUTES - Chỉ truy cập khi chưa login */}
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

      {/* PUBLIC ROUTES - Ai cũng truy cập được */}
      <Route path="/" element={<UserLandingPage />} />

      {/* PROTECTED ROUTES - Cần login mới truy cập */}
      
      {/* Super Admin Routes - roleID = 1 */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={[1]}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Shelter Admin Routes - roleID = 2 */}
      <Route
        path="/shelter/*"
        element={
          <ProtectedRoute allowedRoles={[2]}>
            <ShelterDashboard />
          </ProtectedRoute>
        }
      />

      {/* Volunteer Routes - roleID = 3 */}
      <Route
        path="/volunteer/*"
        element={
          <ProtectedRoute allowedRoles={[3]}>
            <VolunteerDashboard />
          </ProtectedRoute>
        }
      />

      {/* User Routes - roleID = 4 (hoặc any authenticated user) */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/my-adoptions"
        element={
          <ProtectedRoute allowedRoles={[4]}>
            <MyAdoptions />
          </ProtectedRoute>
        }
      />

      {/* Multiple Roles - Admin hoặc Shelter Admin */}
      <Route
        path="/animals/:id/edit"
        element={
          <ProtectedRoute allowedRoles={[1, 2]}>
            <EditAnimal />
          </ProtectedRoute>
        }
      />

      {/* 404 Not Found */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;


/**
 * ROLE IDs REFERENCE:
 * 
 * 1 = Super Admin    → Full access
 * 2 = Shelter Admin  → Manage shelter, animals, volunteers  
 * 3 = Volunteer      → View assignments, update tasks
 * 4 = User/Adopter   → Browse animals, adopt, donate
 */


/**
 * EXAMPLE: Conditional rendering based on role
 */
import { useAuth } from './context/AuthContext';

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav>
      {isAuthenticated ? (
        <>
          <span>Welcome, {user.fullName}</span>
          
          {/* Show Admin link only for Super Admin */}
          {user.roleID === 1 && (
            <a href="/admin">Admin Panel</a>
          )}
          
          {/* Show Shelter link only for Shelter Admin */}
          {user.roleID === 2 && (
            <a href="/shelter">Shelter Dashboard</a>
          )}
          
          {/* Show for multiple roles */}
          {[1, 2, 3].includes(user.roleID) && (
            <a href="/manage">Management</a>
          )}
          
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <a href="/login">Login</a>
          <a href="/register">Register</a>
        </>
      )}
    </nav>
  );
}


/**
 * EXAMPLE: Check permission in component
 */
function AnimalCard({ animal }) {
  const { user, isAuthenticated } = useAuth();
  
  // Check if user can edit
  const canEdit = isAuthenticated && [1, 2].includes(user.roleID);
  
  // Check if user can adopt
  const canAdopt = isAuthenticated && user.roleID === 4;
  
  return (
    <div>
      <h3>{animal.name}</h3>
      
      {canEdit && (
        <button onClick={() => editAnimal(animal.id)}>
          Edit
        </button>
      )}
      
      {canAdopt && (
        <button onClick={() => adoptAnimal(animal.id)}>
          Adopt Me
        </button>
      )}
    </div>
  );
}


/**
 * EXAMPLE: Programmatic navigation after auth check
 */
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

function SomeComponent() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const handleProtectedAction = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (user.roleID !== 1) {
      alert('You do not have permission');
      return;
    }
    
    // Perform action
    performAdminAction();
  };
  
  return (
    <button onClick={handleProtectedAction}>
      Admin Action
    </button>
  );
}

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { Toaster } from "react-hot-toast";

// Admin Pages
import SuperAdminDashboard from "./pages/admin/SuperAdminDashboard";

// Shelter Pages
import ShelterDashboard from "./pages/shelter/ShelterDashboard";

// Volunteer Pages
import VolunteerDashboard from "./pages/volunteer/VolunteerDashboard";

// Public Pages
import UserLandingPage from "./pages/public/UserLandingPage";
import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";
import ForgotPasswordPage from "./pages/public/ForgotPasswordPage";
import ShelterListPage from "./pages/public/ShelterListPage";
import ShelterDetailPage from "./pages/public/ShelterDetailPage";
import BlogListPage from "./pages/public/BlogListPage";
import BlogDetailPage from "./pages/public/BlogDetailPage";
import PetsListPage from "./pages/public/PetsListPage";
import PetDetailPage from "./pages/public/PetDetailPage";
import DonationPage from "./pages/public/DonationPage";
import DonationSuccessPage from "./pages/public/DonationSuccessPage";
import DonationFailedPage from "./pages/public/DonationFailedPage";

// User Profile
import UserProfilePage from "./pages/user/UserProfilePage";

// Rescue Request
import RescueRequestPage from "./pages/public/RescueRequestPage";

// Floating Rescue Button
import RescueFloatingButton from "./components/RescueFloatingButton";

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their appropriate dashboard if they try to access unauthorized pages
    if (user.role === "super_admin") return <Navigate to="/admin" replace />;
    if (user.role === "shelter_admin")
      return <Navigate to="/shelter" replace />;
    if (user.role === "partner") return <Navigate to="/partner" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

// Redirect root to dashboard if logged in
const RootRedirect = () => {
  const { user } = useAuth();
  if (user) {
    if (user.role === "super_admin") return <Navigate to="/admin" replace />;
    if (user.role === "shelter_admin")
      return <Navigate to="/shelter" replace />;
    if (user.role === "partner") return <Navigate to="/partner" replace />;
    // Adopters stay on landing page but logged in
  }
  return <UserLandingPage />;
};

function App() {
  return (
    <ToastProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes - Authentication */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Public Routes - Main Pages */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="/shelters" element={<ShelterListPage />} />
            <Route path="/shelters/:id" element={<ShelterDetailPage />} />
            <Route path="/blog" element={<BlogListPage />} />
            <Route path="/blog/:id" element={<BlogDetailPage />} />

            {/* Public Routes - Pets */}
            <Route path="/pets" element={<PetsListPage />} />
            <Route path="/pets/:id" element={<PetDetailPage />} />

            {/* Public Routes - Donation */}
            <Route path="/donation" element={<DonationPage />} />
            <Route path="/donation/success" element={<DonationSuccessPage />} />
            <Route path="/donation/failed" element={<DonationFailedPage />} />

            {/* User Routes - Universal Profile Route */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Rescue Request Route */}
            <Route
              path="/rescue-request"
              element={
                <ProtectedRoute>
                  <RescueRequestPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={["super_admin"]}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/shelter/*"
              element={
                <ProtectedRoute allowedRoles={["shelter_admin"]}>
                  <ShelterDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/partner/*"
              element={
                <ProtectedRoute allowedRoles={["partner"]}>
                  <VolunteerDashboard />{" "}
                  {/* Using existing dashboard for now or until renamed */}
                </ProtectedRoute>
              }
            />
          </Routes>
          <RescueFloatingButton />
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;

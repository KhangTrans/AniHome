import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { Lock, Mail, User, UserCircle, ArrowLeft, AlertCircle, CheckCircle, Heart, Building } from "lucide-react";
import { validateRegistrationForm } from "../../utils/validation";

const PartnerRegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmNewPassword: "",
    fullName: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        navigate("/partner/login");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: [],
      }));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setServerError("");
    setSuccessMessage("");

    // Validate form
    const validation = validateRegistrationForm(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Register through AuthContext (calls backend API)
      const result = await register({ ...formData, roleID: 3 });

      if (result.success) {
        setSuccessMessage("Partnership registration successful! Redirecting to login...");
        toast.success("Registration success! Welcome to the Network.");
        setFormData({
          username: "",
          email: "",
          password: "",
          confirmNewPassword: "",
          fullName: "",
        });
      } else {
        setServerError(result.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setServerError("Registration failed. Please check network connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFieldErrors = (fieldErrors) => {
    if (!fieldErrors || fieldErrors.length === 0) return null;

    return (
      <div style={{ marginTop: "0.25rem" }}>
        {fieldErrors.map((error, index) => (
          <div
            key={index}
            style={{
              color: "#dc2626",
              fontSize: "0.75rem",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              marginTop: "0.15rem",
            }}
          >
            <AlertCircle size={12} />
            <span>{error}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "row",
        backgroundColor: "#f8f9fa",
        fontFamily: "'Be Vietnam Pro', sans-serif",
      }}
    >
      {/* Left Column: Hero (5/12) */}
      <div
        style={{
          width: "41.666667%",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "3rem",
          color: "white",
        }}
        className="md:flex hidden"
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.35)",
            zIndex: 10,
          }}
        ></div>

        <img
          src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80"
          alt="Veterinary clinic setup"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 1,
          }}
        />

        <div style={{ position: "relative", zIndex: 20 }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "1.5rem" }}>
            <img src="/logo_wed.png" alt="HomePaws Logo" style={{ height: "60px", objectFit: "contain", background: "rgba(255, 255, 255, 0.9)", padding: "10px", borderRadius: "12px" }} />
          </div>

          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "800",
              lineHeight: "1.2",
              marginBottom: "1rem",
              textShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            Empower Your Pet Business
          </h1>
          <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.9)", maxWidth: "420px", marginBottom: "2rem" }}>
            Create a specialized partner account to manage products, veterinary records, booking appointments, and pet health services.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--primary)" }}></div>
              <span style={{ fontSize: "0.95rem", fontWeight: "500" }}>Shop Retail & Revenue Trackers</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--primary)" }}></div>
              <span style={{ fontSize: "0.95rem", fontWeight: "500" }}>Veterinary Diagnostics & EHR records</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--primary)" }}></div>
              <span style={{ fontSize: "0.95rem", fontWeight: "500" }}>Spa Appointments & Styling Packages</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Form (7/12) */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "2rem",
          backgroundColor: "#ffffff",
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: "480px", padding: "1rem 0" }}>
          {/* Back button */}
          <Link
            to="/partner/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.9rem",
              color: "#95A5A6",
              marginBottom: "1.5rem",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            <ArrowLeft size={16} /> Back to Sign In
          </Link>

          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: "bold",
                color: "var(--primary)",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                display: "block",
                marginBottom: "0.5rem",
              }}
            >
              REGISTRATION
            </span>
            <h2 style={{ fontSize: "2rem", fontWeight: "800", color: "#1a1c1e", margin: 0 }}>
              Partner Registration
            </h2>
            <p style={{ color: "#5d6466", marginTop: "0.5rem" }}>
              Apply for a partnership account. Setting up service workspaces happens after login.
            </p>
          </div>

          {successMessage && (
            <div
              style={{
                background: "#d1fae5",
                color: "#065f46",
                padding: "1rem",
                borderRadius: "12px",
                marginBottom: "1.5rem",
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                border: "1px solid #10b981",
              }}
            >
              <CheckCircle size={24} style={{ color: "var(--success)", flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: "600" }}>{successMessage}</div>
                <div style={{ fontSize: "0.8rem", marginTop: "0.25rem" }}>
                  Chuyển sang trang đăng nhập trong giây lát...
                </div>
              </div>
            </div>
          )}

          {serverError && (
            <div
              style={{
                background: "#fee2e2",
                color: "#b91c1c",
                padding: "0.75rem 1rem",
                borderRadius: "12px",
                marginBottom: "1.5rem",
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                border: "1px solid #fecaca",
              }}
            >
              <AlertCircle size={18} />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Username */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#191c1d" }}>Username</label>
              <div style={{ position: "relative" }}>
                <UserCircle size={18} color="#95A5A6" style={{ position: "absolute", top: "12px", left: "12px" }} />
                <input
                  type="text"
                  name="username"
                  placeholder="3-50 chars, no spaces"
                  value={formData.username}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem 0.75rem 2.8rem",
                    borderRadius: "12px",
                    border: errors.username?.length ? "1px solid #dc2626" : "1px solid #dae1e3",
                    backgroundColor: "#f8f9fa",
                    outline: "none",
                    fontFamily: "inherit",
                    fontSize: "0.9rem",
                  }}
                  required
                />
              </div>
              {renderFieldErrors(errors.username)}
            </div>

            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#191c1d" }}>Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail size={18} color="#95A5A6" style={{ position: "absolute", top: "12px", left: "12px" }} />
                <input
                  type="email"
                  name="email"
                  placeholder="partner@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem 0.75rem 2.8rem",
                    borderRadius: "12px",
                    border: errors.email?.length ? "1px solid #dc2626" : "1px solid #dae1e3",
                    backgroundColor: "#f8f9fa",
                    outline: "none",
                    fontFamily: "inherit",
                    fontSize: "0.9rem",
                  }}
                  required
                />
              </div>
              {renderFieldErrors(errors.email)}
            </div>

            {/* Full Name / Company Name */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#191c1d" }}>Full Name / Brand Name</label>
              <div style={{ position: "relative" }}>
                <Building size={18} color="#95A5A6" style={{ position: "absolute", top: "12px", left: "12px" }} />
                <input
                  type="text"
                  name="fullName"
                  placeholder="e.g. HomePaws Vet Clinic / Brand"
                  value={formData.fullName}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem 0.75rem 2.8rem",
                    borderRadius: "12px",
                    border: errors.fullName?.length ? "1px solid #dc2626" : "1px solid #dae1e3",
                    backgroundColor: "#f8f9fa",
                    outline: "none",
                    fontFamily: "inherit",
                    fontSize: "0.9rem",
                  }}
                  required
                />
              </div>
              {renderFieldErrors(errors.fullName)}
            </div>

            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#191c1d" }}>Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={18} color="#95A5A6" style={{ position: "absolute", top: "12px", left: "12px" }} />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem 0.75rem 2.8rem",
                    borderRadius: "12px",
                    border: errors.password?.length ? "1px solid #dc2626" : "1px solid #dae1e3",
                    backgroundColor: "#f8f9fa",
                    outline: "none",
                    fontFamily: "inherit",
                    fontSize: "0.9rem",
                  }}
                  required
                />
              </div>
              {renderFieldErrors(errors.password)}
              <span style={{ fontSize: "0.7rem", color: "#95A5A6", paddingLeft: "0.25rem" }}>
                • 6-50 characters • 1 uppercase letter • 1 special character
              </span>
            </div>

            {/* Confirm Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#191c1d" }}>Confirm Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={18} color="#95A5A6" style={{ position: "absolute", top: "12px", left: "12px" }} />
                <input
                  type="password"
                  name="confirmNewPassword"
                  placeholder="••••••••"
                  value={formData.confirmNewPassword}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem 0.75rem 2.8rem",
                    borderRadius: "12px",
                    border: errors.confirmPassword?.length ? "1px solid #dc2626" : "1px solid #dae1e3",
                    backgroundColor: "#f8f9fa",
                    outline: "none",
                    fontFamily: "inherit",
                    fontSize: "0.9rem",
                  }}
                  required
                />
              </div>
              {renderFieldErrors(errors.confirmPassword)}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || successMessage}
              className="btn btn-primary"
              style={{
                justifyContent: "center",
                padding: "0.85rem",
                marginTop: "0.5rem",
                opacity: isSubmitting || successMessage ? 0.7 : 1,
                cursor: isSubmitting || successMessage ? "not-allowed" : "pointer",
                borderRadius: "12px",
                fontSize: "0.95rem",
                width: "100%",
              }}
            >
              {isSubmitting ? "Submitting Application..." : "Apply as Partner"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem", color: "#5d6466" }}>
            Already have an account?{" "}
            <Link to="/partner/login" style={{ color: "var(--primary)", fontWeight: "700", textDecoration: "none" }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerRegisterPage;

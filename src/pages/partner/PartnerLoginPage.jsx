import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { Lock, Mail, ArrowRight, AlertCircle, ShoppingBag, ShieldCheck, Heart } from "lucide-react";
import { validateLoginForm } from "../../utils/validation";

const PartnerLoginPage = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/partner";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // Validate form
    const validation = validateLoginForm(usernameOrEmail, password);

    if (!validation.isValid) {
      const errorMessages = Object.values(validation.errors).flat();
      setError(errorMessages.join(", "));
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(usernameOrEmail, password);

      if (result.success) {
        // Verify they are actually a partner
        const userRoleID = result.user.roleID;
        if (userRoleID === 3) {
          toast.success("Welcome to HomePaws Partner Network!");
          navigate(from, { replace: true });
        } else {
          // If not a partner, log them out and show error
          await logout();
          toast.error("This account is not registered as a Business Partner.");
          setError("Access Denied: Account is not a registered partner.");
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
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
        {/* Dark overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            zIndex: 10,
          }}
        ></div>

        <img
          src="https://images.unsplash.com/photo-1581888227599-779811939961?auto=format&fit=crop&w=800&q=80"
          alt="Cheerful veterinarian with retriever"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 1,
          }}
        />

        {/* Content */}
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
            Become a HomePaws Partner
          </h1>
          <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.9)", maxWidth: "420px", marginBottom: "2rem" }}>
            Join the leading professional pet network. Reach thousands of local pet owners every day and grow your service business.
          </p>

          {/* Quick stats badges */}
          <div style={{ display: "flex", gap: "1.5rem", marginTop: "1rem" }}>
            <div>
              <p style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>5,000+</p>
              <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", margin: 0 }}>Active Pet Owners</p>
            </div>
            <div style={{ width: "1px", backgroundColor: "rgba(255,255,255,0.3)" }}></div>
            <div>
              <p style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>98%</p>
              <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", margin: 0 }}>Partner Satisfaction</p>
            </div>
            <div style={{ width: "1px", backgroundColor: "rgba(255,255,255,0.3)" }}></div>
            <div>
              <p style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>24/7</p>
              <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", margin: 0 }}>Workspace Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Form (7/12 on desktop, full on mobile) */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "2rem",
          backgroundColor: "#ffffff",
        }}
      >
        <div style={{ width: "100%", maxWidth: "440px" }}>
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
              PARTNER NETWORK
            </span>
            <h2 style={{ fontSize: "2rem", fontWeight: "800", color: "#1a1c1e", margin: 0 }}>
              Partner Sign In
            </h2>
            <p style={{ color: "#5d6466", marginTop: "0.5rem" }}>
              Access your specialized business dashboard and services.
            </p>
          </div>

          {error && (
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
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.9rem", fontWeight: "600", color: "#191c1d" }}>
                Username or Email
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={18}
                  color="#95A5A6"
                  style={{ position: "absolute", top: "14px", left: "14px" }}
                />
                <input
                  type="text"
                  placeholder="enter your partner username"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.8rem 1rem 0.8rem 2.8rem",
                    borderRadius: "12px",
                    border: "1px solid #dae1e3",
                    backgroundColor: "#f8f9fa",
                    outline: "none",
                    fontFamily: "inherit",
                    fontSize: "0.95rem",
                  }}
                  required
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.9rem", fontWeight: "600", color: "#191c1d" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={18}
                  color="#95A5A6"
                  style={{ position: "absolute", top: "14px", left: "14px" }}
                />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.8rem 1rem 0.8rem 2.8rem",
                    borderRadius: "12px",
                    border: "1px solid #dae1e3",
                    backgroundColor: "#f8f9fa",
                    outline: "none",
                    fontFamily: "inherit",
                    fontSize: "0.95rem",
                  }}
                  required
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input type="checkbox" id="remember" style={{ accentColor: "var(--primary)" }} />
                <label htmlFor="remember" style={{ fontSize: "0.85rem", color: "#5d6466", cursor: "pointer" }}>
                  Remember me
                </label>
              </div>
              <Link
                to="/forgot-password"
                style={{
                  fontSize: "0.85rem",
                  color: "var(--primary)",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{
                justifyContent: "center",
                padding: "0.9rem",
                marginTop: "0.5rem",
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                borderRadius: "12px",
                width: "100%",
                fontSize: "1rem",
              }}
            >
              {isSubmitting ? "Verifying..." : "Sign In to Dashboard"}
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Footer links */}
          <div style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.9rem", color: "#5d6466" }}>
            Don't have a partner account?{" "}
            <Link
              to="/partner/register"
              style={{
                color: "var(--primary)",
                fontWeight: "700",
                textDecoration: "none",
              }}
            >
              Apply now
            </Link>
          </div>

          <div
            style={{
              marginTop: "2rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid #dae1e3",
              textAlign: "center",
              fontSize: "0.85rem",
              color: "#95A5A6",
            }}
          >
            Looking for the customer portal?{" "}
            <Link to="/login" style={{ color: "var(--secondary)", fontWeight: "600", textDecoration: "none" }}>
              Customer Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerLoginPage;

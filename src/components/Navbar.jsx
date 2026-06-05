import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { PawPrint, LayoutDashboard, Menu, X, LogOut, User, ShoppingCart } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = async () => {
    if (!user) {
      setCartCount(0);
      return;
    }
    let totalCount = 0;
    try {
      const { getCart } = await import("../services/public/cartService");
      const res = await getCart();
      if (res.success && res.data) {
        totalCount += (res.data.items || []).reduce((sum, item) => sum + (item.quantity || 1), 0);
      }
    } catch (err) {
      console.log("Failed to fetch backend cart count in navbar:", err);
    }
    try {
      const localCartKey = `local_cart_items_${user.userId || user.id}`;
      const savedLocal = localStorage.getItem(localCartKey);
      if (savedLocal) {
        totalCount += JSON.parse(savedLocal).reduce((sum, item) => sum + (item.quantity || 1), 0);
      }
    } catch (err) {
      console.log("Failed to fetch local cart count in navbar:", err);
    }
    setCartCount(totalCount);
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener("cart-updated", updateCartCount);
    return () => {
      window.removeEventListener("cart-updated", updateCartCount);
    };
  }, [user]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav
      style={{
        padding: "0.8rem 2rem",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        position: "sticky",
        top: 0,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(10px)",
        zIndex: 100,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <Link
          to="/"
          style={{ textDecoration: "none" }}
          onClick={() => setIsMenuOpen(false)}
        >
          <img
            src="/logo_wed.png"
            alt="HomePaws Logo"
            style={{
              height: "70px",
              width: "auto",
              objectFit: "contain",
            }}
          />
        </Link>

        {/* Toggle Button for Mobile */}
        <button
          className="md:hidden"
          onClick={toggleMenu}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.5rem",
          }}
        >
          {isMenuOpen ? (
            <X size={28} color="var(--dark)" />
          ) : (
            <Menu size={28} color="var(--dark)" />
          )}
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <div
            style={{
              display: "flex",
              gap: "2rem",
              fontSize: "1rem",
              fontWeight: 600,
              color: "#4b5563",
              alignItems: "center",
            }}
          >
            <Link
              to="/"
              className="hover-text-primary transition-colors"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              Tìm Thú Cưng
            </Link>
            <Link
              to="/shelters"
              className="hover-text-primary transition-colors"
              style={{
                textDecoration: "none",
                color: location.pathname.includes("/shelters")
                  ? "var(--primary)"
                  : "inherit",
              }}
            >
              Trạm Cứu Hộ
            </Link>
            <Link
              to="/blog"
              className="hover-text-primary transition-colors"
              style={{
                textDecoration: "none",
                color: location.pathname.includes("/blog")
                  ? "var(--primary)"
                  : "inherit",
              }}
            >
              Tin Tức
            </Link>
            {user && (
              <Link
                to="/rescue-request"
                className="hover-text-primary transition-colors"
                style={{
                  textDecoration: "none",
                  color: location.pathname.includes("/rescue-request")
                    ? "var(--primary)"
                    : "inherit",
                }}
              >
                Cứu Hộ
              </Link>
            )}
            <Link
              to="/services"
              className="hover-text-primary transition-colors"
              style={{
                textDecoration: "none",
                color: location.pathname.includes("/services")
                  ? "var(--primary)"
                  : "inherit",
              }}
            >
              Dịch Vụ
            </Link>
            {user && (
              <Link
                to="/cart"
                className="hover-text-primary transition-colors"
                style={{
                  textDecoration: "none",
                  color: location.pathname === "/cart" ? "var(--primary)" : "inherit",
                  display: "flex",
                  alignItems: "center",
                  fontSize: "1.2rem",
                  position: "relative"
                }}
                title="Giỏ Hàng"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-10px",
                    background: "var(--primary)",
                    color: "white",
                    fontSize: "0.7rem",
                    fontWeight: "bold",
                    borderRadius: "50%",
                    width: "18px",
                    height: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
                  }}>
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
          </div>

          <div
            style={{
              width: "1px",
              height: "24px",
              background: "#e5e7eb",
              margin: "0 0.5rem",
            }}
          ></div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {user ? (
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <Link
                  to="/profile"
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "6px",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f3f4f6";
                    e.currentTarget.style.color = "var(--primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "inherit";
                  }}
                  title="Xem hồ sơ cá nhân"
                >
                  <User size={18} />
                  <span style={{ fontSize: "0.9rem", color: "var(--dark)" }}>
                    Xin chào,{" "}
                    <strong>
                      {user.fullName ||
                        user.username ||
                        user.name ||
                        "Người dùng"}
                    </strong>
                  </span>
                </Link>

                {/* Dashboard Link based on Role */}
                {(user.role === "shelter_admin" ||
                  user.role === "super_admin") && (
                    <Link
                      to={user.role === "super_admin" ? "/admin" : "/shelter"}
                      className="btn btn-primary"
                      style={{
                        padding: "0.5rem 1rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                      title="Vào Trang Quản Lý"
                    >
                      <LayoutDashboard size={18} /> Quản Lý
                    </Link>
                  )}

                {user.role === "partner" && (
                  <Link
                    to="/seller-orders"
                    className="btn btn-primary"
                    style={{
                      padding: "0.5rem 1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                    title="Quản Lý Đơn Hàng"
                  >
                    <LayoutDashboard size={18} /> Đơn Hàng
                  </Link>
                )}

                <button
                  onClick={logout}
                  className="btn btn-outline"
                  style={{
                    fontSize: "0.9rem",
                    padding: "0.5rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    borderColor: "#fee2e2",
                    color: "#ef4444",
                  }}
                >
                  <LogOut size={18} /> Thoát
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <Link
                  to="/login"
                  className="btn"
                  style={{
                    textDecoration: "none",
                    color: "var(--primary)",
                    fontWeight: "bold",
                  }}
                >
                  Đăng Nhập
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                  style={{
                    textDecoration: "none",
                    borderRadius: "50px",
                    padding: "0.6rem 1.5rem",
                  }}
                >
                  Đăng Ký Ngay
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "white",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            borderTop: "1px solid #f3f4f6",
            zIndex: 99,
          }}
          className="md:hidden"
        >
          <Link
            to="/"
            onClick={toggleMenu}
            style={{
              textDecoration: "none",
              color: "#1f2937",
              padding: "0.75rem",
              fontWeight: 600,
              fontSize: "1.1rem",
            }}
          >
            Tìm Thú Cưng
          </Link>
          <Link
            to="/shelters"
            onClick={toggleMenu}
            style={{
              textDecoration: "none",
              color: "#1f2937",
              padding: "0.75rem",
              fontWeight: 600,
              fontSize: "1.1rem",
            }}
          >
            Trạm Cứu Hộ
          </Link>
          <Link
            to="/blog"
            onClick={toggleMenu}
            style={{
              textDecoration: "none",
              color: "#1f2937",
              padding: "0.75rem",
              fontWeight: 600,
              fontSize: "1.1rem",
            }}
          >
            Tin Tức
          </Link>
          {user && (
            <Link
              to="/rescue-request"
              onClick={toggleMenu}
              style={{
                textDecoration: "none",
                color: "#1f2937",
                padding: "0.75rem",
                fontWeight: 600,
                fontSize: "1.1rem",
              }}
            >
              Cứu Hộ
            </Link>
          )}
          <Link
            to="/services"
            onClick={toggleMenu}
            style={{
              textDecoration: "none",
              color: location.pathname.includes("/services")
                ? "var(--primary)"
                : "#1f2937",
              padding: "0.75rem",
              fontWeight: 600,
              fontSize: "1.1rem",
            }}
          >
            Dịch Vụ
          </Link>

          <hr
            style={{
              border: "none",
              borderTop: "1px solid #e5e7eb",
              width: "100%",
              margin: "0.5rem 0",
            }}
          />

          {user ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <Link
                to="/profile"
                onClick={toggleMenu}
                style={{
                  textDecoration: "none",
                  padding: "0.5rem",
                  fontWeight: "bold",
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <User size={20} /> Xin chào,{" "}
                {user.fullName || user.username || user.name || "Người dùng"}
              </Link>

              {(user.role === "shelter_admin" ||
                user.role === "super_admin") && (
                  <Link
                    to={user.role === "super_admin" ? "/admin" : "/shelter"}
                    onClick={toggleMenu}
                    className="btn btn-primary"
                    style={{
                      textAlign: "center",
                      justifyContent: "center",
                      padding: "1rem",
                    }}
                  >
                    <LayoutDashboard size={20} className="mr-2" /> Vào Trang Quản
                    Lý
                  </Link>
                )}

              <button
                onClick={() => {
                  logout();
                  toggleMenu();
                }}
                className="btn btn-outline"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  color: "#ef4444",
                  borderColor: "#fee2e2",
                  padding: "1rem",
                }}
              >
                <LogOut size={20} className="mr-2" /> Đăng Xuất
              </button>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <Link
                to="/login"
                onClick={toggleMenu}
                className="btn btn-outline"
                style={{
                  textAlign: "center",
                  textDecoration: "none",
                  justifyContent: "center",
                  padding: "1rem",
                }}
              >
                Đăng Nhập
              </Link>
              <Link
                to="/register"
                onClick={toggleMenu}
                className="btn btn-primary"
                style={{
                  textAlign: "center",
                  textDecoration: "none",
                  justifyContent: "center",
                  padding: "1rem",
                }}
              >
                Đăng Ký Ngay
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

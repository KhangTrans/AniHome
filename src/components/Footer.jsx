import React from "react";
import { PawPrint } from "lucide-react";

const Footer = () => {
  return (
    <footer
      style={{
        background: "#f8f9fa",
        color: "var(--dark)",
        padding: "4rem 2rem",
        marginTop: "0", // Reset margin because some pages handle it differently
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "3rem",
        }}
      >
        <div>
          <h4
            style={{
              fontSize: "1.2rem",
              marginBottom: "1rem",
              background:
                "linear-gradient(135deg, var(--primary) 0%, #ff8787 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <PawPrint size={20} /> HomePaws
          </h4>
          <p style={{ color: "var(--gray)", fontSize: "0.9rem" }}>
            Làm cho thế giới tốt đẹp hơn, từng bé một.
          </p>
        </div>
        <div>
          <h4 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Liên Kết</h4>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              color: "var(--gray)",
              fontSize: "0.9rem",
              lineHeight: "2",
            }}
          >
            <li>
              <a href="#" style={{ textDecoration: "none", color: "inherit" }}>
                Về Chúng Tôi
              </a>
            </li>
            <li>
              <a href="#" style={{ textDecoration: "none", color: "inherit" }}>
                Tình Nguyện
              </a>
            </li>
            <li>
              <a href="#" style={{ textDecoration: "none", color: "inherit" }}>
                Quyên Góp
              </a>
            </li>
            <li>
              <a href="#" style={{ textDecoration: "none", color: "inherit" }}>
                Điều Khoản
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Liên Hệ</h4>
          <p
            style={{
              color: "var(--gray)",
              fontSize: "0.9rem",
              marginBottom: "0.5rem",
            }}
          >
            123 Đường Cứu Hộ, TP.HCM
          </p>
          <p style={{ color: "var(--gray)", fontSize: "0.9rem" }}>
            hello@homepaws.com
          </p>
        </div>
      </div>
      <div
        style={{
          textAlign: "center",
          marginTop: "3rem",
          paddingTop: "2rem",
          borderTop: "1px solid #eee",
          color: "var(--gray)",
          fontSize: "0.8rem",
        }}
      >
        &copy; 2026 Animal Rescue Platform. Built for EXE101 Demo.
      </div>
    </footer>
  );
};

export default Footer;

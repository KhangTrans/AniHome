import React from "react";
import { Link } from "react-router-dom";
import { Heart, Info, CheckCircle } from "lucide-react";

const statusConfig = {
  Available: { label: "Có thể nhận nuôi", color: "var(--success)" },
  "Ready for Adoption": { label: "Sẵn sàng", color: "var(--success)" },
  "Sẵn sàng": { label: "Sẵn sàng", color: "var(--success)" },
  Pending: { label: "Đang chờ duyệt", color: "var(--warning)" },
  Adopted: { label: "Đã có chủ", color: "var(--gray)" },
  InTreatment: { label: "Đang điều trị", color: "#8b5cf6" },
};

const AnimalCard = ({ animal, isAdmin = false, onAction }) => {
  const badge = statusConfig[animal.status] ?? {
    label: animal.status,
    color: "var(--gray)",
  };

  // Phần trên card (ảnh + tên + mô tả) click vào sẽ chuyển trang chi tiết
  const petId = animal.petID ?? animal.id;

  const handleButtonClick = (e, action) => {
    // Ngăn không cho sự kiện click lan ra Link bên ngoài
    e.preventDefault();
    e.stopPropagation();
    if (onAction) onAction(action);
  };

  return (
    <Link
      to={`/pets/${petId}`}
      style={{
        textDecoration: "none",
        color: "inherit",
        display: "block",
        height: "100%",
      }}
    >
      <div
        className="card hover-lift group"
        style={{
          padding: 0,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          border: "none",
          boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
          cursor: "pointer",
        }}
      >
        {/* ── Image ── */}
        <div
          style={{
            position: "relative",
            height: "240px",
            width: "100%",
            overflow: "hidden",
          }}
        >
          <img
            src={animal.image}
            alt={animal.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=500&q=80";
            }}
            className="card-img-zoom"
          />
          {/* Status badge */}
          <div
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
              background: "rgba(255, 255, 255, 0.92)",
              padding: "5px 12px",
              borderRadius: "20px",
              fontSize: "0.8rem",
              fontWeight: "bold",
              color: badge.color,
              boxShadow: "0 2px 4px rgba(0,0,0,0.12)",
            }}
          >
            {badge.label}
          </div>

          {/* Overlay hint khi hover */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(59,130,246,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0,
              transition: "opacity 0.2s",
            }}
            className="card-hover-overlay"
          >
            <span
              style={{
                background: "white",
                color: "#3b82f6",
                fontWeight: 700,
                padding: "8px 20px",
                borderRadius: "20px",
                fontSize: "0.9rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            >
              Xem Chi Tiết →
            </span>
          </div>
        </div>

        {/* ── Content ── */}
        <div
          style={{
            padding: "1.5rem",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}
          >
            <h3
              style={{
                fontSize: "1.4rem",
                margin: 0,
                fontWeight: 700,
                color: "var(--dark)",
              }}
            >
              {animal.name}
            </h3>
            <span
              style={{
                color: "var(--gray)",
                fontSize: "0.9rem",
                background: "#f3f4f6",
                padding: "0.2rem 0.8rem",
                borderRadius: "12px",
              }}
            >
              {animal.breed}
            </span>
          </div>

          <p
            style={{
              color: "#6b7280",
              fontSize: "0.95rem",
              marginBottom: "1.5rem",
              flex: 1,
              lineHeight: "1.6",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {animal.description}
          </p>

          {/* ── Buttons (click riêng, không trigger Link) ── */}
          <div style={{ display: "flex", gap: "0.8rem", marginTop: "auto" }}>
            {isAdmin ? (
              <>
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={(e) => handleButtonClick(e, "approve")}
                >
                  Duyệt <CheckCircle size={18} />
                </button>
                <button
                  className="btn btn-outline"
                  style={{ padding: "0.6rem" }}
                  onClick={(e) => handleButtonClick(e, "details")}
                >
                  <Info size={18} />
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={(e) => handleButtonClick(e, "adopt")}
                >
                  Nhận Nuôi <Heart size={18} className="ml-1" />
                </button>
                <button
                  className="btn btn-outline"
                  style={{
                    padding: "0.6rem 1rem",
                    borderColor: "#fee2e2",
                    color: "var(--primary)",
                  }}
                  onClick={(e) => handleButtonClick(e, "donate")}
                >
                  Ủng Hộ
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .card:hover .card-hover-overlay {
          opacity: 1 !important;
        }
      `}</style>
    </Link>
  );
};

export default AnimalCard;

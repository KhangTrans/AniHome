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
        <div className="card-image-wrapper">
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
          <div className="status-badge" style={{ color: badge.color }}>
            {badge.label}
          </div>

          {/* Overlay hint khi hover */}
          <div className="card-hover-overlay">
            <span>Xem Chi Tiết →</span>
          </div>
        </div>

        {/* ── Content ── */}
        <div
          className="card-content-area"
          style={{
            padding: "1.5rem",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="card-header-info">
            <h3 className="card-title">
              {animal.name}
            </h3>
            <span className="card-breed-badge">
              {animal.breed}
            </span>
          </div>

          <p className="card-description">
            {animal.description}
          </p>

          {/* ── Buttons (click riêng, không trigger Link) ── */}
          <div className="card-actions">
            {isAdmin ? (
              <>
                <button
                  className="btn btn-secondary action-btn-main"
                  onClick={(e) => handleButtonClick(e, "approve")}
                >
                  <span className="btn-text">Duyệt</span> <CheckCircle size={16} />
                </button>
                <button
                  className="btn btn-outline action-btn-alt"
                  onClick={(e) => handleButtonClick(e, "details")}
                >
                  <Info size={16} />
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn btn-primary action-btn-main"
                  onClick={(e) => handleButtonClick(e, "adopt")}
                >
                  <span className="btn-text">Nhận nuôi</span> <Heart size={16} />
                </button>
                <button
                  className="btn btn-outline action-btn-alt"
                  onClick={(e) => handleButtonClick(e, "donate")}
                >
                  <span className="btn-text">Ủng hộ</span>
                  <span className="btn-icon-fallback"><Info size={16}/></span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .card-image-wrapper {
          position: relative;
          height: 240px;
          width: 100%;
          overflow: hidden;
        }

        .status-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(255, 255, 255, 0.92);
          padding: 5px 12px;
          borderRadius: 20px;
          fontSize: 0.8rem;
          font-weight: bold;
          box-shadow: 0 2px 4px rgba(0,0,0,0.12);
        }

        .card-hover-overlay {
          position: absolute;
          inset: 0;
          background: rgba(59,130,246,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .card-hover-overlay span {
          background: white;
          color: #3b82f6;
          font-weight: 700;
          padding: 8px 20px;
          border-radius: 20px;
          font-size: 0.9rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .card:hover .card-hover-overlay {
          opacity: 1 !important;
        }

        .card-header-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .card-title {
          font-size: 1.4rem;
          margin: 0;
          font-weight: 700;
          color: var(--dark);
        }

        .card-breed-badge {
          color: var(--gray);
          font-size: 0.9rem;
          background: #f3f4f6;
          padding: 0.2rem 0.8rem;
          border-radius: 12px;
        }

        .card-description {
          color: #6b7280;
          font-size: 0.95rem;
          margin-bottom: 1.5rem;
          flex: 1;
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-actions {
          display: flex;
          gap: 0.8rem;
          margin-top: auto;
        }

        .action-btn-main {
          flex: 1;
          justify-content: center;
        }

        .action-btn-alt {
          padding: 0.6rem 1rem;
          border-color: #fee2e2;
          color: var(--primary);
        }

        .btn-icon-fallback {
           display: none;
        }

        @media (max-width: 480px) {
          .card-image-wrapper {
            height: 150px;
          }

          .status-badge {
            top: 6px;
            right: 6px;
            padding: 2px 8px;
            font-size: 0.65rem;
          }

          .card-header-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .card-title {
            font-size: 1.1rem;
          }

          .card-breed-badge {
            font-size: 0.7rem;
            padding: 1px 6px;
          }

          .card-description {
            display: none; /* Hide description to save space on 2-col mobile */
          }

          .card-actions {
            gap: 4px;
          }

          .action-btn-main {
            padding: 0.5rem;
            font-size: 0.8rem;
          }

          .action-btn-alt {
            padding: 0.5rem;
          }

          .btn-text {
            display: none; /* Hide text on small buttons */
          }

          .btn-icon-fallback {
            display: block;
          }
          
          .card-content-area {
            padding: 0.75rem !important;
          }
        }
      `}</style>
    </Link>
  );
};

export default AnimalCard;

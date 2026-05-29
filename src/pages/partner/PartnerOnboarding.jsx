import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { ShoppingBag, Stethoscope, Sparkles, Check, Heart, ArrowRight } from "lucide-react";

const PartnerOnboarding = ({ onComplete }) => {
  const { user } = useAuth();
  const [selected, setSelected] = useState("shop"); // Default to shop

  const handleConfirm = () => {
    if (!selected) {
      toast.error("Vui lòng chọn một loại hình dịch vụ!");
      return;
    }
    
    // Call parent to register profile in DB
    if (onComplete) {
      onComplete(selected);
    }
  };

  const categories = [
    {
      id: "shop",
      title: "Cửa hàng (Shop)",
      desc: "Bán lẻ thức ăn, phụ kiện, đồ chơi và vật dụng cho thú cưng.",
      icon: <ShoppingBag size={32} />,
      color: "var(--primary)",
      lightBg: "#FFF0F0",
    },
    {
      id: "vet",
      title: "Thú y (Veterinary)",
      desc: "Phòng khám, dịch vụ xét nghiệm, điều trị và tiêm phòng vaccine.",
      icon: <Stethoscope size={32} />,
      color: "var(--secondary)",
      lightBg: "#EBFBFA",
    },
    {
      id: "spa",
      title: "Dịch vụ Spa & Grooming",
      desc: "Chăm sóc sắc đẹp, tắm rửa, cắt tỉa lông và massage thư giãn.",
      icon: <Sparkles size={32} />,
      color: "#9b93ff",
      lightBg: "#F4F3FF",
    },
  ];

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
            backgroundColor: "rgba(0,0,0,0.3)",
            zIndex: 10,
          }}
        ></div>

        <img
          src="https://images.unsplash.com/photo-1581888227599-779811939961?auto=format&fit=crop&w=800&q=80"
          alt="Veterinarian with dog"
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

          <h2
            style={{
              fontSize: "2.2rem",
              fontWeight: "800",
              lineHeight: "1.25",
              marginBottom: "1rem",
              textShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            Trở thành Đối tác của HomePaws
          </h2>
          <p style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.9)", maxWidth: "420px", marginBottom: "1rem" }}>
            Tham gia mạng lưới chăm sóc thú cưng chuyên nghiệp. Kết nối với hàng ngàn khách hàng tiềm năng mỗi ngày.
          </p>
        </div>
      </div>

      {/* Right Column: Service Selection (7/12) */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "3rem 4rem",
          backgroundColor: "#ffffff",
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: "680px" }}>
          {/* Header */}
          <div style={{ marginBottom: "2.5rem" }}>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: "700",
                color: "var(--primary)",
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                display: "block",
                marginBottom: "0.5rem",
              }}
            >
              ĐĂNG KÝ ĐỐI TÁC
            </span>
            <h2 style={{ fontSize: "2.25rem", fontWeight: "800", color: "#191c1d", margin: 0 }}>
              Thiết lập không gian làm việc
            </h2>
            <p style={{ color: "#5d6466", marginTop: "0.5rem", fontSize: "1.05rem" }}>
              Chọn danh mục phù hợp nhất với mô hình kinh doanh của bạn để hệ thống tự động chuẩn bị các công cụ chuyên dụng.
            </p>
          </div>

          {/* Cards Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1.5rem",
              width: "100%",
              marginBottom: "3rem",
            }}
          >
            {categories.map((cat) => {
              const isSelected = selected === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelected(cat.id)}
                  style={{
                    position: "relative",
                    cursor: "pointer",
                    borderRadius: "16px",
                    padding: "2rem 1.5rem",
                    border: `2px solid ${isSelected ? cat.color : "#dae1e3"}`,
                    backgroundColor: isSelected ? cat.lightBg : "#ffffff",
                    boxShadow: isSelected
                      ? "0 10px 20px rgba(0,0,0,0.04)"
                      : "0 4px 6px rgba(0,0,0,0.02)",
                    transform: isSelected ? "translateY(-4px)" : "translateY(0)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  className="hover-lift"
                >
                  {/* Selected check icon */}
                  {isSelected && (
                    <div
                      style={{
                        position: "absolute",
                        top: "1rem",
                        right: "1rem",
                        backgroundColor: cat.color,
                        color: "white",
                        borderRadius: "50%",
                        width: "22px",
                        height: "22px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                      }}
                    >
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}

                  {/* Icon container */}
                  <div
                    style={{
                      color: isSelected ? cat.color : "#5d6466",
                      marginBottom: "1.5rem",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: isSelected ? "white" : "#f1f3f4",
                      padding: "12px",
                      borderRadius: "14px",
                      boxShadow: isSelected ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {cat.icon}
                  </div>

                  {/* Text */}
                  <h4 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#191c1d", marginBottom: "0.5rem" }}>
                    {cat.title}
                  </h4>
                  <p style={{ fontSize: "0.88rem", color: "#5d6466", lineHeight: "1.5", margin: 0 }}>
                    {cat.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            className="btn btn-primary"
            style={{
              padding: "1rem 2.5rem",
              borderRadius: "12px",
              fontSize: "1.05rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              boxShadow: "0 8px 16px rgba(255, 107, 107, 0.25)",
            }}
          >
            Xác nhận và Thiết lập Không gian
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartnerOnboarding;

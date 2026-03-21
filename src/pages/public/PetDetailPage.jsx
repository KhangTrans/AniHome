import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getPetById } from "../../services/public/petsService";
import {
  getMarketplaceProductCountByShelter,
  getMarketplaceProductsByShelter,
} from "../../services/public/marketplaceService";
import {
  MapPin,
  Heart,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import AdoptionFormModal from "../../components/AdoptionFormModal";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

/**
 * PET DETAIL PAGE
 * Hiển thị chi tiết thú cưng với gallery nhiều ảnh
 */
export default function PetDetailPage() {
  const { id } = useParams();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [showAdoptionModal, setShowAdoptionModal] = useState(false);
  const [hasStoreProducts, setHasStoreProducts] = useState(false);
  const [showStoreProducts, setShowStoreProducts] = useState(false);
  const [storeProducts, setStoreProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const fetchPetDetail = async () => {
      setLoading(true);
      setError(null);
      const result = await getPetById(id);
      setLoading(false);
      if (result.success) {
        setPet(result.data);
        setActiveIdx(0);
      } else {
        setError(result.error);
      }
    };
    fetchPetDetail();
  }, [id]);

  useEffect(() => {
    const checkStoreAvailability = async () => {
      const shelterId = pet?.shelterID || pet?.shelterId;
      if (!shelterId) {
        setHasStoreProducts(false);
        return;
      }

      const result = await getMarketplaceProductCountByShelter(shelterId);
      setHasStoreProducts(result.success && Number(result.totalProducts) > 0);
    };

    if (pet) {
      checkStoreAvailability();
    }
  }, [pet]);

  const handleToggleStoreProducts = async () => {
    const shelterId = pet?.shelterID || pet?.shelterId;
    if (!shelterId) return;

    if (showStoreProducts) {
      setShowStoreProducts(false);
      return;
    }

    setProductsLoading(true);
    const result = await getMarketplaceProductsByShelter(shelterId);
    setProductsLoading(false);

    if (result.success) {
      setStoreProducts(result.data || []);
      setShowStoreProducts(true);
    } else {
      toast.error(result.error || "Không tải được sản phẩm của trạm");
    }
  };

  // ─── Helpers ────────────────────────────────────────────────
  const getImages = (pet) => {
    if (pet.images && pet.images.length > 0) {
      return pet.images.map((i) => i.imageURL);
    }
    // Fallback về imageURL cũ nếu chưa có bảng PetImage
    return pet.imageURL ? [pet.imageURL] : [];
  };

  const prevImage = (images) =>
    setActiveIdx((i) => (i - 1 + images.length) % images.length);

  const nextImage = (images) => setActiveIdx((i) => (i + 1) % images.length);

  // ─── Loading ────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <div
          style={{
            display: "inline-block",
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #3b82f6",
            borderRadius: "50%",
            width: "50px",
            height: "50px",
            animation: "spin 1s linear infinite",
          }}
        />
        <p style={{ marginTop: "20px", color: "#666" }}>
          Đang tải thông tin thú cưng...
        </p>
      </div>
    );
  }

  // ─── Error ───────────────────────────────────────────────────
  if (error || !pet) {
    return (
      <div style={{ padding: "100px 20px", textAlign: "center" }}>
        <div style={{ fontSize: "4rem", marginBottom: "20px" }}>😿</div>
        <h2>Không tìm thấy thú cưng</h2>
        <p style={{ color: "#666", marginBottom: "30px" }}>
          {error || "Thú cưng không tồn tại"}
        </p>
        <Link
          to="/pets"
          style={{
            display: "inline-block",
            padding: "12px 30px",
            background: "#3b82f6",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            fontWeight: "600",
          }}
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const images = getImages(pet);

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <Navbar />
      <div>
        {/* Main Content */}
        <div className="detail-container">
          <div className="detail-grid">

            {/* ── LEFT: Image Gallery ── */}
            <div>
              {/* Main image */}
              <div className="main-image-wrapper">
                <img
                  src={
                    images[activeIdx] ||
                    "https://placehold.co/600x500?text=No+Image"
                  }
                  alt={pet.petName}
                  className="main-image"
                />

                {/* Prev / Next buttons — chỉ hiện khi có nhiều hơn 1 ảnh */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => prevImage(images)}
                      style={navBtnStyle("left")}
                      aria-label="Ảnh trước"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={() => nextImage(images)}
                      style={navBtnStyle("right")}
                      aria-label="Ảnh tiếp theo"
                    >
                      <ChevronRight size={24} />
                    </button>

                    {/* Dot indicators */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "12px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        display: "flex",
                        gap: "8px",
                      }}
                    >
                      {images.map((_, i) => (
                        <span
                          key={i}
                          onClick={() => setActiveIdx(i)}
                          style={{
                            width: i === activeIdx ? "24px" : "8px",
                            height: "8px",
                            borderRadius: "4px",
                            background:
                              i === activeIdx
                                ? "#3b82f6"
                                : "rgba(255,255,255,0.7)",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                          }}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "12px",
                    overflowX: "auto",
                    paddingBottom: "4px",
                  }}
                >
                  {images.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Ảnh ${i + 1}`}
                      onClick={() => setActiveIdx(i)}
                      style={{
                        width: "80px",
                        height: "80px",
                        flexShrink: 0,
                        objectFit: "cover",
                        borderRadius: "10px",
                        cursor: "pointer",
                        border:
                          i === activeIdx
                            ? "3px solid #3b82f6"
                            : "3px solid transparent",
                        opacity: i === activeIdx ? 1 : 0.65,
                        transition: "all 0.2s ease",
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Image counter */}
              {images.length > 1 && (
                <p
                  style={{
                    textAlign: "center",
                    color: "#9ca3af",
                    fontSize: "0.85rem",
                    marginTop: "8px",
                  }}
                >
                  {activeIdx + 1} / {images.length}
                </p>
              )}
            </div>

            {/* ── RIGHT: Pet Info ── */}
            <div>
              {/* Status Badge */}
              <div
                style={{
                  display: "inline-block",
                  background:
                    pet.status === "Available"
                      ? "#d1fae5"
                      : pet.status === "Pending"
                        ? "#fef3c7"
                        : "#f3f4f6",
                  color:
                    pet.status === "Available"
                      ? "#10b981"
                      : pet.status === "Pending"
                        ? "#f59e0b"
                        : "#6b7280",
                  padding: "6px 16px",
                  borderRadius: "20px",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  marginBottom: "16px",
                }}
              >
                {pet.status === "Available"
                  ? "Sẵn sàng nhận nuôi"
                  : pet.status === "Pending"
                    ? "Đang xét duyệt"
                    : pet.status === "Adopted"
                      ? "Đã được nhận nuôi"
                      : pet.status}
              </div>

              <div className="pet-info-header">
                <h1
                  style={{ margin: "0 0 8px", color: "#111" }}
                >
                  {pet.petName}
                </h1>
              </div>
              <p
                style={{
                  fontSize: "1.1rem",
                  color: "#6b7280",
                  marginBottom: "24px",
                }}
              >
                {pet.breed} · {pet.categoryName}
              </p>

              {/* Shelter info */}
              {pet.shelterName && (
                <div
                  style={{
                    background: "#f3f4f6",
                    padding: "14px 18px",
                    borderRadius: "12px",
                    marginBottom: "24px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                  }}
                >
                  <MapPin
                    size={20}
                    color="#6b7280"
                    style={{ marginTop: "2px", flexShrink: 0 }}
                  />
                  <div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "#9ca3af",
                        marginBottom: "2px",
                      }}
                    >
                      Trạm cứu hộ
                    </div>
                    <div style={{ fontWeight: "600", color: "#374151" }}>
                      {pet.shelterName}
                    </div>
                    {pet.shelterLocation && (
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "#6b7280",
                          marginTop: "2px",
                        }}
                      >
                        {pet.shelterLocation}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Info grid */}
              <div className="info-grid">

                <InfoItem label="Loại thú" value={pet.categoryName} />
                <InfoItem label="Giống" value={pet.breed || "Chưa rõ"} />
                <InfoItem
                  label="Cập nhật lần cuối"
                  value={
                    pet.updatedAt
                      ? new Date(pet.updatedAt).toLocaleDateString("vi-VN")
                      : "Chưa rõ"
                  }
                />
                <InfoItem
                  label="Trạng thái"
                  value={
                    pet.status === "Available"
                      ? "Sẵn sàng"
                      : pet.status === "Pending"
                        ? "Đang xét duyệt"
                        : pet.status === "Adopted"
                          ? "Đã nhận nuôi"
                          : pet.status
                  }
                />
              </div>

              {/* Description */}
              {pet.description && (
                <div style={{ marginBottom: "28px" }}>
                  <h3
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      marginBottom: "10px",
                      color: "#374151",
                    }}
                  >
                    Giới thiệu về {pet.petName}
                  </h3>
                  <p
                    style={{
                      color: "#6b7280",
                      lineHeight: "1.8",
                      fontSize: "0.95rem",
                    }}
                  >
                    {pet.description}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => {
                    if (!user) {
                      toast.warning("Vui lòng đăng nhập để đăng ký nhận nuôi!");
                      return;
                    }
                    setShowAdoptionModal(true);
                  }}
                  style={{
                    flex: 1,
                    padding: "14px",
                    background:
                      pet.status === "Available" ? "#3b82f6" : "#e5e7eb",
                    color: pet.status === "Available" ? "white" : "#9ca3af",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "1rem",
                    fontWeight: "600",
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    cursor: pet.status === "Available" ? "pointer" : "not-allowed",
                    pointerEvents: pet.status === "Available" ? "auto" : "none",
                  }}
                >
                  <Heart size={18} />
                  {pet.status === "Available"
                    ? `Nhận nuôi ${pet.petName}`
                    : "Không khả dụng"}
                </button>
                {hasStoreProducts && (
                  <button
                    onClick={handleToggleStoreProducts}
                    style={{
                      padding: "14px 16px",
                      background: showStoreProducts ? "#1d4ed8" : "white",
                      color: showStoreProducts ? "white" : "#1d4ed8",
                      border: "1px solid #93c5fd",
                      borderRadius: "12px",
                      fontSize: "0.95rem",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <ShoppingBag size={17} />
                    {showStoreProducts ? "Ẩn sản phẩm" : "Xem sản phẩm"}
                  </button>
                )}
              </div>

              {showStoreProducts && (
                <div
                  style={{
                    marginTop: "18px",
                    background: "white",
                    borderRadius: "12px",
                    padding: "14px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1rem",
                      margin: "0 0 12px",
                      color: "#1f2937",
                    }}
                  >
                    Sản phẩm gây quỹ của trạm
                  </h3>

                  {productsLoading ? (
                    <div style={{ color: "#6b7280" }}>Đang tải sản phẩm...</div>
                  ) : storeProducts.length > 0 ? (
                    <div style={{ display: "grid", gap: "10px" }}>
                      {storeProducts.map((product) => (
                        <div
                          key={product.productID || product.ProductID}
                          style={{
                            border: "1px solid #e5e7eb",
                            borderRadius: "10px",
                            padding: "10px 12px",
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "12px",
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 600, color: "#111827" }}>
                              {product.productName || product.ProductName}
                            </div>
                            <div
                              style={{
                                color: "#6b7280",
                                fontSize: "0.85rem",
                                marginTop: 4,
                              }}
                            >
                              {product.description ||
                                product.Description ||
                                "Sản phẩm gây quỹ"}
                            </div>
                          </div>
                          <div
                            style={{
                              color: "#dc2626",
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {Number(
                              product.price ?? product.Price ?? 0,
                            ).toLocaleString("vi-VN")}
                            ₫
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: "#6b7280" }}>
                      Trạm chưa có sản phẩm gây quỹ.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <style>{`
        .detail-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }

        .main-image-wrapper {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.12);
        }

        .main-image {
          width: 100%;
          height: 480px;
          object-fit: cover;
          display: block;
        }

        .pet-info-header h1 {
          font-size: 2.2rem;
          line-height: 1.2;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }

        @media (max-width: 1024px) {
          .detail-grid {
            gap: 30px;
          }
        }

        @media (max-width: 768px) {
          .detail-container {
            padding: 20px 16px;
          }

          .detail-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .main-image {
            height: 380px;
          }

          .pet-info-header h1 {
            font-size: 1.8rem;
          }
        }

        @media (max-width: 480px) {
          .main-image {
            height: 280px;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }
          
          .pet-info-header h1 {
            font-size: 1.6rem;
          }
        }

        @keyframes spin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      </div>
      <Footer />
      
      {/* Adoption Modal */}
      {showAdoptionModal && (
        <AdoptionFormModal
          animal={{
            id: pet.petID,
            name: pet.petName,
            ...pet
          }}
          onClose={() => setShowAdoptionModal(false)}
          onSubmit={(data) => {
            console.log("Adoption request submitted:", data);
          }}
        />
      )}
    </div>
  );
}

// ─── Helper components & styles ──────────────────────────────

function InfoItem({ label, value }) {
  return (
    <div
      style={{
        background: "white",
        padding: "14px 16px",
        borderRadius: "10px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          fontSize: "0.78rem",
          color: "#9ca3af",
          marginBottom: "4px",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "1rem", fontWeight: "600", color: "#1f2937" }}>
        {value || "—"}
      </div>
    </div>
  );
}

function navBtnStyle(side) {
  return {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    [side]: "12px",
    background: "rgba(255,255,255,0.85)",
    border: "none",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    transition: "background 0.2s",
    zIndex: 1,
  };
}

import React, { useState, useEffect } from "react";
import { MapPin, Search, Filter, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Pagination from "../../components/Pagination";
import { getShelters } from "../../services/public/sheltersService";
import { useToast } from "../../context/ToastContext";
import Footer from "../../components/Footer";

// Region ID mapping cho backend
const REGION_MAP = {
  All: null,
  "Miền Bắc": 1,
  "Miền Trung": 2,
  "Miền Nam": 3,
};

const ShelterListPage = () => {
  const toast = useToast();
  const [regionFilter, setRegionFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState(""); // Input riêng để tránh gọi API liên tục

  // API States
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 6;

  // Fetch shelters từ API với filter và pagination
  useEffect(() => {
    const fetchShelters = async () => {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        pageSize: pageSize,
        ...(searchTerm && { keyword: searchTerm }),
        ...(REGION_MAP[regionFilter] && { regionID: REGION_MAP[regionFilter] }),
      };

      const result = await getShelters(params);

      if (result.success) {
        // Map data từ backend structure sang frontend structure
        const mappedShelters = (result.data.items || []).map((shelter) => ({
          id: shelter.shelterID,
          name: shelter.shelterName,
          address: shelter.location,
          region: shelter.regionName,
          animalCount: shelter.totalPets || 0,
          image:
            (shelter.imageUrls && shelter.imageUrls[0]) ||
            shelter.imageURL ||
            "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80",
          description:
            shelter.description ||
            `Trạm cứu hộ ${shelter.shelterName} tại ${shelter.location}`,
        }));

        setShelters(mappedShelters);
        setTotalPages(result.data.totalPages || 1);
        setTotalCount(result.data.totalCount || 0);
      } else {
        setError(result.error);
        toast.error("Failed to load shelters: " + result.error);
      }

      setLoading(false);
    };

    fetchShelters();
  }, [currentPage, searchTerm, regionFilter, toast]);

  // Handle search submit (chỉ gọi API khi nhấn Enter hoặc click search)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setCurrentPage(1); // Reset về trang 1 khi search mới
  };

  // Handle region filter change
  const handleRegionChange = (region) => {
    setRegionFilter(region);
    setCurrentPage(1); // Reset về trang 1 khi đổi filter
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      style={{
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        fontFamily: "var(--font-main)",
      }}
    >
      <Navbar />
      <div style={{ padding: "2rem" }} className="animate-fadeIn">
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Header */}
          <div
            style={{ textAlign: "center", marginBottom: "3rem" }}
            className="animate-slideUp"
          >
            <h1
              style={{
                fontSize: "2.5rem",
                marginBottom: "1rem",
                color: "var(--dark)",
                fontWeight: 800,
              }}
            >
              Đối Tác Cứu Hộ
            </h1>
            <p style={{ color: "var(--gray)", fontSize: "1.1rem" }}>
              Kết nối với các trạm cứu hộ uy tín trên toàn quốc.
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
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
                Đang tải danh sách trạm...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div
              style={{
                background: "#fee2e2",
                color: "#dc2626",
                padding: "20px",
                borderRadius: "8px",
                textAlign: "center",
                marginBottom: "20px",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Controls */}
          {!loading && !error && (
            <>
              <form onSubmit={handleSearchSubmit}>
                <div
                  style={{
                    background: "white",
                    padding: "1.5rem",
                    borderRadius: "16px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                    marginBottom: "3rem",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "1rem",
                    alignItems: "center",
                  }}
                  className="animate-slideUp delay-100"
                >
                  <div
                    style={{ position: "relative", flex: 1, minWidth: "300px" }}
                  >
                    <Search
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--gray)",
                      }}
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder="Tìm trạm theo tên (nhấn Enter)..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.8rem 1rem 0.8rem 2.8rem",
                        borderRadius: "8px",
                        border: "1px solid #eee",
                        outline: "none",
                        fontSize: "1rem",
                        transition: "border-color 0.2s",
                      }}
                      className="focus:border-primary"
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      overflowX: "auto",
                      paddingBottom: "5px",
                    }}
                  >
                    <Filter size={20} color="var(--gray)" />
                    {["All", "Miền Bắc", "Miền Trung", "Miền Nam"].map(
                      (region) => (
                        <button
                          key={region}
                          type="button"
                          onClick={() => handleRegionChange(region)}
                          className="btn hover-scale"
                          style={{
                            whiteSpace: "nowrap",
                            backgroundColor:
                              regionFilter === region ? "var(--dark)" : "white",
                            color:
                              regionFilter === region ? "white" : "var(--dark)",
                            border:
                              regionFilter === region
                                ? "none"
                                : "1px solid #ddd",
                            padding: "0.6rem 1.2rem",
                            borderRadius: "20px",
                            cursor: "pointer",
                          }}
                        >
                          {region === "All" ? "Tất cả" : region}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              </form>

              {/* Grid */}
              {shelters.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    background: "white",
                    borderRadius: "12px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  }}
                >
                  <p
                    style={{
                      fontSize: "1.2rem",
                      color: "#666",
                      marginBottom: "10px",
                    }}
                  >
                    😔 Không tìm thấy trạm nào
                  </p>
                  <p style={{ color: "#999" }}>
                    Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(350px, 1fr))",
                    gap: "2rem",
                  }}
                >
                  {shelters.map((shelter, index) => (
                    <div
                      key={shelter?.id || `shelter-${index}`}
                      style={{
                        background: "white",
                        borderRadius: "16px",
                        overflow: "hidden",
                        border: "none",
                        animationDelay: `${index * 50}ms`,
                      }}
                      className="card hover-lift group animate-fadeIn"
                    >
                      <div
                        style={{
                          height: "240px",
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        <img
                          src={shelter.image}
                          alt={shelter.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80";
                          }}
                          className="card-img-zoom"
                        />
                        <div
                          style={{
                            position: "absolute",
                            top: "12px",
                            right: "12px",
                            background: "rgba(255,255,255,0.9)",
                            color: "var(--primary)",
                            padding: "6px 12px",
                            borderRadius: "20px",
                            fontSize: "0.85rem",
                            fontWeight: "bold",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          }}
                        >
                          {shelter.animalCount} Bé
                        </div>
                      </div>
                      <div style={{ padding: "1.5rem" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
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
                            {shelter.name}
                          </h3>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            color: "#6b7280",
                            marginBottom: "1rem",
                            fontSize: "0.95rem",
                          }}
                        >
                          <MapPin size={16} color="var(--primary)" />{" "}
                          {shelter.address}
                          <span
                            style={{
                              height: "4px",
                              width: "4px",
                              borderRadius: "50%",
                              background: "#ccc",
                              margin: "0 4px",
                            }}
                          ></span>
                          <span
                            style={{
                              color: "var(--secondary)",
                              fontWeight: 600,
                            }}
                          >
                            {shelter.region}
                          </span>
                        </div>
                        <p
                          style={{
                            color: "#4b5563",
                            marginBottom: "1.5rem",
                            lineHeight: "1.6",
                            fontSize: "1rem",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {shelter.description}
                        </p>

                        <Link
                          to={`/shelters/${shelter.id}`}
                          className="btn btn-outline hover:bg-primary hover:text-white hover:border-primary transition-colors"
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "0.5rem",
                            width: "100%",
                            padding: "0.8rem",
                            borderRadius: "12px",
                            fontWeight: 600,
                          }}
                        >
                          Ghé Thăm Trạm <ArrowRight size={18} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {shelters.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalCount={totalCount}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ShelterListPage;

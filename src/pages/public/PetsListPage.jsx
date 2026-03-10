import { useState, useEffect } from "react";
import { getPets } from "../../services/public/petsService";
import { Link } from "react-router-dom";
import { Search, Filter } from "lucide-react";

/**
 * PETS LISTING PAGE
 * Hiển thị danh sách thú cưng với search & filter
 */
export default function PetsListPage() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    keyword: "",
    categoryId: null,
    page: 1,
    pageSize: 9,
  });

  useEffect(() => {
    const fetchPets = async () => {
      setLoading(true);
      setError(null);

      const result = await getPets(filters);

      setLoading(false);

      if (result.success) {
        setPets(result.data.items || []);
        setTotalPages(result.data.totalPages || 1);
      } else {
        setError(result.error);
      }
    };

    fetchPets();
  }, [filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "30px", textAlign: "center" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "10px" }}>
          🐾 Find Your Perfect Pet
        </h1>
        <p style={{ color: "#666", fontSize: "1.1rem" }}>
          Browse our available pets and give them a loving home
        </p>
      </div>

      {/* Search & Filter */}
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          marginBottom: "30px",
        }}
      >
        <form
          onSubmit={handleSearch}
          style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}
        >
          <div style={{ flex: "1", minWidth: "250px", position: "relative" }}>
            <Search
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#999",
              }}
              size={20}
            />
            <input
              type="text"
              placeholder="Search pets by name..."
              value={filters.keyword}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, keyword: e.target.value }))
              }
              style={{
                width: "100%",
                padding: "12px 12px 12px 45px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "1rem",
              }}
            />
          </div>

          <select
            value={filters.categoryId || ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                categoryId: e.target.value ? parseInt(e.target.value) : null,
                page: 1,
              }))
            }
            style={{
              padding: "12px",
              border: "1px solid #ddd",
              borderRadius: "8px",
              fontSize: "1rem",
              minWidth: "150px",
            }}
          >
            <option value="">All Categories</option>
            <option value="1">Dogs 🐕</option>
            <option value="2">Cats 🐈</option>
            <option value="3">Birds 🦜</option>
            <option value="4">Others 🐾</option>
          </select>

          <button
            type="submit"
            style={{
              padding: "12px 30px",
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Search
          </button>
        </form>
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
          <p style={{ marginTop: "20px", color: "#666" }}>Loading pets...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#dc2626",
            padding: "20px",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Pets Grid */}
      {!loading && !error && pets.length > 0 && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "25px",
              marginBottom: "40px",
            }}
          >
            {pets.map((pet) => (
              <PetCard key={pet.petID} pet={pet} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{ display: "flex", justifyContent: "center", gap: "10px" }}
            >
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 1}
                style={{
                  padding: "10px 20px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  background: filters.page === 1 ? "#f3f3f3" : "white",
                  cursor: filters.page === 1 ? "not-allowed" : "pointer",
                }}
              >
                Previous
              </button>

              <div style={{ display: "flex", gap: "5px" }}>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    style={{
                      padding: "10px 15px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      background: filters.page === i + 1 ? "#3b82f6" : "white",
                      color: filters.page === i + 1 ? "white" : "black",
                      cursor: "pointer",
                      fontWeight: filters.page === i + 1 ? "600" : "400",
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page === totalPages}
                style={{
                  padding: "10px 20px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  background: filters.page === totalPages ? "#f3f3f3" : "white",
                  cursor:
                    filters.page === totalPages ? "not-allowed" : "pointer",
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && !error && pets.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: "4rem", marginBottom: "20px" }}>🐾</div>
          <h3 style={{ fontSize: "1.5rem", marginBottom: "10px" }}>
            No pets found
          </h3>
          <p style={{ color: "#666" }}>Try adjusting your search filters</p>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/**
 * Pet Card Component
 */
function PetCard({ pet }) {
  const statusConfig = {
    Available: { label: "Có thể nhận nuôi", color: "#10b981" },
    Pending: { label: "Đang chờ duyệt", color: "#f59e0b" },
    Adopted: { label: "Đã có chủ", color: "#6b7280" },
  };
  const badge = statusConfig[pet.status] ?? {
    label: pet.status,
    color: "#6b7280",
  };

  return (
    <Link
      to={`/pets/${pet.petID}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          transition: "transform 0.2s, box-shadow 0.2s",
          cursor: "pointer",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-5px)";
          e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
        }}
      >
        {/* Image */}
        <div
          style={{
            height: "220px",
            background: `url(${pet.imageURL}) center/cover no-repeat, #f3f4f6`,
            position: "relative",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              background: badge.color,
              color: "white",
              padding: "5px 12px",
              borderRadius: "20px",
              fontSize: "0.8rem",
              fontWeight: "600",
            }}
          >
            {badge.label}
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            padding: "20px",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h3
            style={{
              fontSize: "1.2rem",
              marginBottom: "6px",
              margin: "0 0 6px",
            }}
          >
            {pet.petName}
          </h3>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
              color: "#666",
              fontSize: "0.9rem",
            }}
          >
            <span>{pet.breed}</span>
            {pet.categoryName && (
              <span
                style={{
                  background: "#eff6ff",
                  color: "#3b82f6",
                  padding: "3px 10px",
                  borderRadius: "12px",
                  fontSize: "0.8rem",
                  fontWeight: "500",
                }}
              >
                {pet.categoryName}
              </span>
            )}
          </div>

          {pet.description && (
            <p
              style={{
                color: "#666",
                fontSize: "0.9rem",
                lineHeight: "1.5",
                marginBottom: "16px",
                flex: 1,
              }}
            >
              {pet.description.length > 80
                ? pet.description.substring(0, 80) + "..."
                : pet.description}
            </p>
          )}

          <div style={{ display: "flex", gap: "10px", marginTop: "auto" }}>
            <span
              style={{
                flex: 1,
                padding: "11px",
                background: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.95rem",
                fontWeight: "600",
                textAlign: "center",
                display: "block",
              }}
            >
              Xem chi tiết →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

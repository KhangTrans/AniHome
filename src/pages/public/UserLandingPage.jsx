import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Heart,
  Bell,
  User,
  LogIn,
  LayoutDashboard,
  CreditCard,
  CheckCircle,
  PawPrint,
  Calendar,
  Mail,
  ArrowRight,
  Filter,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";
import AnimalCard from "../../components/AnimalCard";
import Pagination from "../../components/Pagination";
import Modal from "../../components/Modal";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import AdoptionFormModal from "../../components/AdoptionFormModal";
import { getPets } from "../../services/public/petsService";
import { getShelters } from "../../services/public/sheltersService";
import {
  createVNPayDonation,
  createVietQRDonation,
  checkVietQRStatus,
  getCurrentUserId,
  redirectToVNPay,
  DONATION_PRESETS,
  formatAmountDisplay,
} from "../../services/public/donationService";
import { getHomeStats } from "../../services/public/homeStatsService";
import {
  getHappyStories,
  formatPostDate,
} from "../../services/public/postsService";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { QrCode, Copy, Loader2 } from "lucide-react";

const UserLandingPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const toast = useToast();

  // Modal States
  const [activeModal, setActiveModal] = useState(null); // 'adoptForm', 'donate', 'success', 'success_donate'
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 12;

  // Donation States
  const [donationAmount, setDonationAmount] = useState(50000);
  const [donationMessage, setDonationMessage] = useState("");
  const [isDonating, setIsDonating] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("vnpay"); // 'vnpay' or 'vietqr'
  const [qrData, setQrData] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pollingIntervalRef = React.useRef(null);
  const dropdownRef = useRef(null);

  // API States
  const [animals, setAnimals] = useState([]);
  const [partners, setPartners] = useState([]);
  const [happyStories, setHappyStories] = useState([]);
  const [homeStats, setHomeStats] = useState(null);
  const [_loading, setLoading] = useState(true);
  const [_error, setError] = useState(null);

  const carouselRef = useRef(null);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Fetch pets and shelters from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // Fetch home stats
      const statsResult = await getHomeStats();
      if (statsResult.success) {
        setHomeStats(statsResult.data);
      }

      // Fetch pets with current page number
      const result = await getPets({ page: currentPage, pageSize: 12 });

      if (result.success) {
        // Map backend data structure to frontend format
        const mappedAnimals = (result.data.items || []).map((pet) => ({
          id: pet.petID,
          name: pet.petName,
          breed: pet.breed,
          status: pet.status,
          image: pet.imageURL,
          type: pet.categoryName,
          description:
            pet.description ||
            `${pet.petName} là một ${pet.breed} đang tìm mái ấm mới.`,
          // Keep original fields for API calls
          petID: pet.petID,
          petName: pet.petName,
        }));
        setAnimals(mappedAnimals);

        // Calculate pagination - use totalPages or totalCount from API
        const apiTotalPages = result.data.totalPages;
        if (apiTotalPages) {
          setTotalPages(apiTotalPages);
        } else {
          const totalCount = result.data.totalCount || mappedAnimals.length;
          setTotalPages(Math.ceil(totalCount / pageSize));
        }
      } else {
        setError(result.error);
        toast.error("Failed to load pets: " + result.error);
      }

      // Fetch partner shelters (limit 5 for carousel)
      const sheltersResult = await getShelters({ page: 1, pageSize: 5 });
      if (sheltersResult.success) {
        const mappedShelters = (sheltersResult.data.items || []).map(
          (shelter) => {
            let shelterImg =
              "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=600&q=80"; // Default image
            if (shelter.imageURL) {
              shelterImg = shelter.imageURL;
            } else if (shelter.imageUrls && shelter.imageUrls.length > 0) {
              shelterImg = shelter.imageUrls[0];
            }

            return {
              id: shelter.shelterID,
              name: shelter.shelterName,
              location: shelter.location,
              region: shelter.regionName,
              animalCount: shelter.totalPets || 0,
              img: shelterImg,
            };
          },
        );
        setPartners(mappedShelters);
      } else {
        console.warn("Failed to load partners:", sheltersResult.error);
        setPartners([]);
      }

      // Fetch happy stories
      const storiesResult = await getHappyStories();
      if (storiesResult.success) {
        setHappyStories(storiesResult.data || []);
      }

      setLoading(false);
    };

    fetchData();
  }, [toast, currentPage]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const scrollContainer = carouselRef.current;
    if (!scrollContainer) return;

    const scrollInterval = setInterval(() => {
      // Auto-scroll logic to loop back or scroll next
      if (
        Math.ceil(scrollContainer.scrollLeft + scrollContainer.clientWidth) >=
        scrollContainer.scrollWidth
      ) {
        scrollContainer.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollContainer.scrollBy({ left: 299, behavior: "smooth" }); // 275px width + 24px gap
      }
    }, 3000);

    return () => clearInterval(scrollInterval);
  }, []);

  const filteredAnimals = animals.filter((a) => {
    if (!a) return false;
    const matchesSearch =
      (a.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (a.breed?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || a.type === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Recalculate totalPages based on filtered animals (for client-side filtering)
  const filteredTotalPages =
    categoryFilter !== "All" || searchTerm
      ? Math.ceil(filteredAnimals.length / pageSize)
      : totalPages;

  const handleAction = (type, animal) => {
    setSelectedAnimal(animal);
    if (type === "adopt") {
      if (!user) {
        toast.warning("Vui lòng đăng nhập để đăng ký nhận nuôi!");
        return;
      }
      setActiveModal("adoptForm");
    } else if (type === "donate") {
      // Reset donation form
      setDonationAmount(50000);
      setDonationMessage("");
      setActiveModal("donate");
    }

    if (user) {
      setFormData({ ...formData, name: user.name, email: user.email });
    }
  };

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, searchTerm]);

  const handleDonate = async (e) => {
    e.preventDefault();

    // Get pet ID (đã map sẵn từ backend)
    const petID = selectedAnimal?.petID || selectedAnimal?.id;
    const petName =
      selectedAnimal?.petName || selectedAnimal?.name || "pet này";

    if (!petID) {
      toast.error("Không tìm thấy thông tin pet. Vui lòng thử lại.");
      return;
    }

    // Validation
    if (!donationAmount || donationAmount < 1000) {
      toast.error("Số tiền tối thiểu là 1,000đ");
      return;
    }

    if (donationAmount % 1000 !== 0) {
      toast.error("Số tiền phải là bội số của 1,000đ");
      return;
    }

    setIsDonating(true);

    try {
      if (paymentMethod === "vnpay") {
        const result = await createVNPayDonation({
          petID: petID,
          userID: getCurrentUserId(),
          amount: donationAmount,
          message: donationMessage || `Ủng hộ cho ${petName}`,
        });

        if (result.success) {
          setActiveModal(null);
          redirectToVNPay(result.data.paymentUrl);
        } else {
          toast.error(
            result.error || "Không thể tạo thanh toán. Vui lòng thử lại.",
          );
        }
      } else {
        // VietQR Flow
        const result = await createVietQRDonation({
          petID: petID,
          userID: getCurrentUserId(),
          amount: donationAmount,
          message: donationMessage || `Ủng hộ cho ${petName}`,
          donorName: user?.name || "",
        });

        if (result.success) {
          console.log("💰 VietQR Data Received (Landing):", result.data);
          setQrData(result.data);
          setActiveModal("vietqr_modal");
          startPolling(result.data.transactionID || result.data.TransactionID);
        } else {
          toast.error(result.error || "Không thể tạo mã QR. Vui lòng thử lại.");
        }
      }
    } catch {
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại.");
    } finally {
      setIsDonating(false);
    }
  };

  const startPolling = (transactionID) => {
    // Clear any existing polling first
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    setIsPolling(true);
    const interval = setInterval(async () => {
      const result = await checkVietQRStatus(transactionID);
      if (result.success && result.data.status === "Success") {
        clearInterval(interval);
        pollingIntervalRef.current = null;
        setIsPolling(false);
        setActiveModal(null);
        toast.success("Thanh toán thành công! Cảm ơn bạn đã quyên góp.");
      }
    }, 10000);

    pollingIntervalRef.current = interval;

    // Stop after 10 mins
    setTimeout(() => {
      if (pollingIntervalRef.current === interval) {
        clearInterval(interval);
        pollingIntervalRef.current = null;
        setIsPolling(false);
      }
    }, 600000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép nội dung chuyển khoản");
  };

  return (
    <div
      style={{
        backgroundColor: "#fff",
        minHeight: "100vh",
        fontFamily: "var(--font-main)",
      }}
    >
      {/* --- Navigation --- */}
      <Navbar />

      {/* --- Hero Section --- */}
      <header
        style={{
          padding: "8rem 2rem 10rem",
          textAlign: "center",
          background:
            "linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.2)), url(https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1600&q=80) center/cover",
          color: "white",
          borderRadius: "0 0 50px 50px",
          marginBottom: "6rem",
          position: "relative",
          zIndex: 20, /* Ensure header content is above the stats section that pulls up */
        }}
        className="animate-fadeIn"
      >
        <div
          style={{ maxWidth: "800px", margin: "0 auto" }}
          className="animate-slideUp"
        >
          <h2
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              marginBottom: "1.5rem",
              textShadow: "0 4px 20px rgba(0,0,0,0.5)",
              fontWeight: 800,
              lineHeight: 1.2,
            }}
          >
            Không chỉ là thú cưng,
            <br />
            <span style={{ color: "#FF8787" }}>Là thành viên gia đình.</span>
          </h2>
          <p
            style={{
              fontSize: "1.2rem",
              margin: "0 auto 2.5rem",
              opacity: 0.95,
              textShadow: "0 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            Hàng ngàn động vật vô gia cư đang chờ đợi một mái ấm yêu thương.{" "}
            <br className="hidden md:block" />
            Hãy thay đổi cuộc đời chúng ngay hôm nay.
          </p>

          {/* Search Box */}
          <div className="search-bar-container hover-scale">
            {/* Input Group */}
            <div className="search-input-group">
              <Search
                color="var(--primary)"
                size={22}
                style={{ minWidth: "22px" }}
              />
              <input
                type="text"
                placeholder="Tìm kiếm Golden, Mèo mướp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  fontSize: "1rem",
                  color: "var(--dark)",
                  marginLeft: "12px",
                  background: "transparent",
                }}
              />
            </div>

            {/* Filter Group */}
            <div
              className={`search-filter-group custom-select-wrapper ${isDropdownOpen ? "active" : ""}`}
              ref={dropdownRef}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="select-trigger">
                <Filter color="var(--gray)" size={18} />
                <span className="selected-value">
                  {categoryFilter === "All" ? "Tất cả" : categoryFilter}
                </span>
                <span className={`chevron ${isDropdownOpen ? "up" : ""}`}>▾</span>
              </div>

              {isDropdownOpen && (
                <div className="custom-options">
                  <div
                    className={`option-item ${categoryFilter === "All" ? "selected" : ""}`}
                    onClick={(e) => { e.stopPropagation(); setCategoryFilter("All"); setIsDropdownOpen(false); }}
                  >
                    Tất cả
                  </div>
                  <div
                    className={`option-item ${categoryFilter === "Chó" ? "selected" : ""}`}
                    onClick={(e) => { e.stopPropagation(); setCategoryFilter("Chó"); setIsDropdownOpen(false); }}
                  >
                    Chó
                  </div>
                  <div
                    className={`option-item ${categoryFilter === "Mèo" ? "selected" : ""}`}
                    onClick={(e) => { e.stopPropagation(); setCategoryFilter("Mèo"); setIsDropdownOpen(false); }}
                  >
                    Mèo
                  </div>
                </div>
              )}
            </div>

            {/* Button */}
            <button className="btn btn-primary search-button">Tìm Ngay</button>
          </div>
        </div>
      </header>

      {/* --- Stats Section --- */}
      <section className="stats-section animate-slideUp delay-200">
        <div className="stats-grid">

          <div className="stat-item hover-lift">
            <h3 className="stat-value primary">
              {homeStats ? homeStats.totalRescuedPets : "..."}
            </h3>
            <p className="stat-label">Động vật được cứu</p>
          </div>

          <div className="stat-item hover-lift">
            <h3 className="stat-value secondary">
              {homeStats ? homeStats.successfulAdoptions : "..."}
            </h3>
            <p className="stat-label">Ca nhận nuôi thành công</p>
          </div>

          <div className="stat-item hover-lift">
            <h3 className="stat-value warning">
              {homeStats ? homeStats.activeShelters : "..."}
            </h3>
            <p className="stat-label">Trạm cứu hộ hoạt động</p>
          </div>

        </div>
      </section>

      {/* --- Main Content --- */}
      <main className="landing-main-content">

        {/* Categories */}
        <div className="flex justify-center gap-4 mb-16 flex-wrap animate-fadeIn delay-300">
          {["All", "Chó", "Mèo"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`filter-pill ${categoryFilter === cat ? "active" : ""}`}
            >
              {cat === "All" ? "Tất cả" : cat}
            </button>
          ))}
        </div>

        {/* Animal Profiles */}
        <section id="featured" className="mb-20">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div className="animate-slideInRight">
              <h3
                style={{
                  fontSize: "2.5rem",
                  marginBottom: "0.5rem",
                  fontWeight: 800,
                }}
              >
                Gặp Gỡ Thú Cưng
              </h3>
              <p style={{ color: "var(--gray)", fontSize: "1.1rem" }}>
                Những thành viên mới nhất đang chờ đợi mái ấm.
              </p>
            </div>
            <Link
              to="/shelters"
              className="text-primary font-bold flex items-center gap-2 hover:translate-x-2 transition-transform"
            >
              Xem Tất Cả <ArrowRight size={20} />
            </Link>
          </div>

          <div className="pet-grid">

            {filteredAnimals.map((animal, index) => (
              <div
                key={animal.id}
                style={{ animationDelay: `${index * 100}ms` }}
                className="animate-fadeIn"
              >
                <AnimalCard
                  animal={animal}
                  onAction={(action) => handleAction(action, animal)}
                />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {filteredTotalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={filteredTotalPages}
              onPageChange={handlePageChange}
            />
          )}
        </section>

        {/* How It Works (Steps) */}
        <section
          id="how-it-works"
          className="how-it-works-section"
        >

          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "8px",
              background:
                "linear-gradient(to right, var(--primary), var(--secondary), var(--warning))",
            }}
          ></div>
          <div className="how-it-works-header">

            <h3
              style={{
                fontSize: "2.5rem",
                marginBottom: "1rem",
                fontWeight: 800,
              }}
            >
              Quy Trình Nhận Nuôi
            </h3>
            <p style={{ color: "var(--gray)", fontSize: "1.1rem" }}>
              Ba bước đơn giản để đón thành viên mới về nhà.
            </p>
          </div>

          <div className="steps-grid">
            <div
              className="hidden md:block"
              style={{
                position: "absolute",
                top: "3rem",
                left: "16%",
                right: "16%",
                height: "2px",
                background: "#e5e7eb",
                zIndex: 0,
              }}
            ></div>

            {[
              {
                icon: Search,
                color: "var(--primary)",
                title: "1. Tìm Kiếm",
                desc: "Tìm kiếm thú cưng phù hợp với bạn.",
              },
              {
                icon: Calendar,
                color: "var(--secondary)",
                title: "2. Gặp Gỡ",
                desc: "Đặt lịch hẹn với trạm cứu hộ để làm quen.",
              },
              {
                icon: CheckCircle,
                color: "var(--success)",
                title: "3. Nhận Nuôi",
                desc: "Hoàn tất thủ tục và đón bé về nhà.",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="hover-lift"
                style={{
                  textAlign: "center",
                  position: "relative",
                  zIndex: 1,
                  padding: "1rem",
                }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    background: "white",
                    borderRadius: "50%",
                    margin: "0 auto 1.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                    border: `2px solid ${step.color}`,
                  }}
                >
                  <step.icon color={step.color} size={32} />
                </div>
                <h4
                  style={{
                    fontSize: "1.5rem",
                    marginBottom: "0.5rem",
                    fontWeight: 700,
                  }}
                >
                  {step.title}
                </h4>
                <p
                  style={{
                    color: "var(--gray)",
                    fontSize: "1rem",
                    padding: "0 1rem",
                  }}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Partner Shelters Carousel */}
        <section className="mb-20">
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <h3
              style={{
                fontSize: "2rem",
                marginBottom: "1rem",
                fontWeight: 700,
              }}
            >
              Đối Tác Tin Cậy
            </h3>
            <p style={{ color: "var(--gray)", fontSize: "1.1rem" }}>
              Hợp tác cùng các trạm cứu hộ trên toàn quốc.
            </p>
          </div>

          <div
            ref={carouselRef}
            style={{
              display: "flex",
              gap: "1.5rem",
              overflowX: "auto",
              padding: "1rem 0 2rem",
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
              maxWidth: "1200px",
              margin: "0 auto",
            }}
            className="hide-scrollbar"
          >
            {partners.length > 0 ? (
              partners.map((shelter) => (
                <Link
                  key={shelter.id}
                  to={`/shelters/${shelter.id}`}
                  className="hover-lift"
                  style={{
                    flex: "0 0 auto",
                    width: "265px",
                    height: "400px",
                    borderRadius: "24px",
                    overflow: "hidden",
                    position: "relative",
                    scrollSnapAlign: "center",
                    boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
                    cursor: "pointer",
                    textDecoration: "none",
                  }}
                >
                  <img
                    src={shelter.img}
                    alt={shelter.name}
                    className="card-img-zoom"
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      width: "100%",
                      padding: "3rem 1.5rem 1.5rem",
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)",
                      color: "white",
                      display: "flex",
                      alignItems: "flex-end",
                    }}
                  >
                    <div>
                      <h4
                        style={{
                          fontSize: "1.4rem",
                          fontWeight: 700,
                          marginBottom: "0.25rem",
                          textShadow: "0 2px 10px rgba(0,0,0,0.3)",
                        }}
                      >
                        {shelter.name}
                      </h4>
                      <span
                        style={{
                          fontSize: "0.85rem",
                          opacity: 0.9,
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          marginBottom: "0.25rem",
                        }}
                      >
                        <MapPin size={14} /> {shelter.location}
                      </span>
                      <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                        {shelter.animalCount} bé đang chờ
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div
                style={{
                  width: "100%",
                  textAlign: "center",
                  padding: "3rem",
                  color: "#999",
                }}
              >
                Đang tải thông tin đối tác...
              </div>
            )}
          </div>
        </section>

        {/* Happy Stories Section */}
        {happyStories && happyStories.length > 0 && (
          <section className="happy-stories-section">

            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                  background: "#fef3c7",
                  color: "#d97706",
                  fontWeight: "bold",
                  borderRadius: "20px",
                  marginBottom: "1rem",
                }}
              >
                <Heart size={16} fill="currentColor" /> Phép Màu Có Thật
              </div>
              <h2
                style={{
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  fontWeight: 800,
                  color: "var(--dark)",
                  marginBottom: "1rem",
                }}
              >
                Câu Chuyện Hạnh Phúc
              </h2>
              <p
                style={{
                  color: "#64748b",
                  fontSize: "1.1rem",
                  maxWidth: "600px",
                  margin: "0 auto",
                  lineHeight: 1.6,
                }}
              >
                Những hành trình vượt qua giông bão để tìm thấy bến đỗ bình yên
                của các bé thú cưng.
              </p>
            </div>

            <div className="stories-grid">

              {happyStories.slice(0, 3).map((story) => {
                let imageUrl =
                  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80";
                try {
                  if (story.thumbnail) {
                    const parsed = JSON.parse(story.thumbnail);
                    if (Array.isArray(parsed) && parsed.length > 0)
                      imageUrl = parsed[0];
                  }
                } catch (e) { }

                return (
                  <Link
                    key={story.postID}
                    to={`/blog/${story.postID}`}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      display: "flex",
                    }}
                  >
                    <div
                      style={{
                        background: "white",
                        borderRadius: "24px",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                        border: "1px solid #f1f5f9",
                        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
                        transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      }}
                      className="hover:scale-105 hover:shadow-xl"
                    >
                      <div style={{ height: "220px", overflow: "hidden" }}>
                        <img
                          src={imageUrl}
                          alt={story.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          padding: "1.5rem",
                          display: "flex",
                          flexDirection: "column",
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            fontSize: "0.85rem",
                            color: "#94a3b8",
                            marginBottom: "0.75rem",
                          }}
                        >
                          <Calendar size={14} />{" "}
                          {formatPostDate(story.createdAt)}
                        </div>
                        <h3
                          style={{
                            fontSize: "1.25rem",
                            fontWeight: 700,
                            color: "#1e293b",
                            marginBottom: "0.75rem",
                            lineHeight: 1.4,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {story.title}
                        </h3>
                        <p
                          style={{
                            color: "#64748b",
                            fontSize: "0.95rem",
                            lineHeight: 1.6,
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            flex: 1,
                          }}
                        >
                          {String(
                            story.excerpt ||
                            story.content?.replace(/<[^>]*>?/gm, "") ||
                            "",
                          )
                            .replace(/&nbsp;/g, " ")
                            .substring(0, 120) + "..."}
                        </p>
                        <div
                          style={{
                            marginTop: "1rem",
                            color: "var(--primary)",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          Đọc thêm <ArrowRight size={16} />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            {happyStories.length > 3 && (
              <div style={{ textAlign: "center", marginTop: "3rem" }}>
                <Link to="/blog?type=HappyStory" className="btn btn-outline">
                  Xem tất cả câu chuyện
                </Link>
              </div>
            )}
          </section>
        )}

        {/* Newsletter */}
        <section
          style={{
            padding: "3rem 1.5rem",
            background: "var(--dark)",
            borderRadius: "24px",
            color: "white",
            textAlign: "center",
          }}
        >
          <Mail
            size={48}
            color="var(--primary)"
            style={{ marginBottom: "1rem", display: "inline-block" }}
          />
          <h3 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
            Đừng Bỏ Lỡ Thông Tin
          </h3>
          <p
            style={{
              opacity: 0.8,
              marginBottom: "2rem",
              maxWidth: "500px",
              margin: "0 auto 2rem",
            }}
          >
            Đăng ký để nhận tin tức mới nhất về các hoạt động cứu hộ.
          </p>
          <div className="newsletter-form">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="newsletter-input"
            />
            <button
              className="btn btn-primary"
              style={{ whiteSpace: "nowrap" }}
            >
              Đăng Ký
            </button>
          </div>
        </section>
      </main>

      <Footer />

      {/* --- MODALS --- */}
      {/* Adoption Form Modal (New) */}
      {activeModal === "adoptForm" && selectedAnimal && (
        <AdoptionFormModal
          animal={selectedAnimal}
          onClose={() => setActiveModal(null)}
          onSubmit={(data) => {
            console.log("Submission:", data);
          }}
        />
      )}

      <Modal
        isOpen={activeModal === "donate"}
        onClose={() => setActiveModal(null)}
        title={`Quyên góp cho ${selectedAnimal?.name || "pet"}`}
      >
        <form
          onSubmit={handleDonate}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <div
            style={{
              padding: "1rem",
              background: "#eff6ff",
              color: "#1e40af",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              marginBottom: "0.5rem",
            }}
          >
            Đóng góp của bạn giúp cung cấp thức ăn và y tế cho{" "}
            <strong>{selectedAnimal?.name || "pet này"}</strong>.
          </div>

          <label
            style={{
              fontWeight: "bold",
              fontSize: "0.875rem",
              color: "#4b5563",
            }}
          >
            Chọn Số Tiền
          </label>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {DONATION_PRESETS.map((preset) => (
              <button
                type="button"
                key={preset.value}
                onClick={() => setDonationAmount(preset.value)}
                className="btn-outline"
                style={{
                  flex: "1 1 45%",
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  border:
                    donationAmount === preset.value
                      ? "2px solid var(--primary)"
                      : "1px solid #e5e7eb",
                  background:
                    donationAmount === preset.value ? "#eff6ff" : "white",
                  color:
                    donationAmount === preset.value
                      ? "var(--primary)"
                      : "var(--dark)",
                  fontWeight: donationAmount === preset.value ? "600" : "400",
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div>
            <label
              style={{
                fontSize: "0.875rem",
                color: "#4b5563",
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              Hoặc nhập số tiền khác (VNĐ)
            </label>
            <input
              type="number"
              placeholder="Nhập số tiền (tối thiểu 1,000đ)"
              value={donationAmount || ""}
              onChange={(e) => setDonationAmount(parseInt(e.target.value) || 0)}
              min="1000"
              step="1000"
              style={{
                padding: "0.75rem",
                border: "1px solid #e5e7eb",
                borderRadius: "0.5rem",
                width: "100%",
                fontSize: "1rem",
              }}
            />
            <div
              style={{
                fontSize: "0.75rem",
                color: "#6b7280",
                marginTop: "0.25rem",
              }}
            >
              Số tiền hiện tại:{" "}
              <strong style={{ color: "var(--primary)" }}>
                {formatAmountDisplay(donationAmount)}
              </strong>
            </div>
          </div>

          <div>
            <label
              style={{
                fontSize: "0.875rem",
                color: "#4b5563",
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              Lời nhắn (không bắt buộc)
            </label>
            <textarea
              placeholder="Gửi lời động viên..."
              value={donationMessage}
              onChange={(e) => setDonationMessage(e.target.value)}
              rows={2}
              style={{
                padding: "0.75rem",
                border: "1px solid #e5e7eb",
                borderRadius: "0.5rem",
                width: "100%",
                fontSize: "0.875rem",
                resize: "vertical",
              }}
            />
          </div>

          <label
            style={{
              fontWeight: "bold",
              fontSize: "0.875rem",
              color: "#4b5563",
              marginTop: "0.5rem",
            }}
          >
            Phương Thức Thanh Toán
          </label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              onClick={() => setPaymentMethod("vnpay")}
              style={{
                flex: 1,
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border:
                  paymentMethod === "vnpay"
                    ? "2px solid #3b82f6"
                    : "1px solid #e5e7eb",
                background: paymentMethod === "vnpay" ? "#eff6ff" : "white",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                cursor: "pointer",
              }}
            >
              <CreditCard
                size={20}
                color={paymentMethod === "vnpay" ? "#3b82f6" : "#6b7280"}
              />
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: paymentMethod === "vnpay" ? "600" : "400",
                }}
              >
                VNPay
              </span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("vietqr")}
              style={{
                flex: 1,
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border:
                  paymentMethod === "vietqr"
                    ? "2px solid #3b82f6"
                    : "1px solid #e5e7eb",
                background: paymentMethod === "vietqr" ? "#eff6ff" : "white",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                cursor: "pointer",
              }}
            >
              <QrCode
                size={20}
                color={paymentMethod === "vietqr" ? "#3b82f6" : "#6b7280"}
              />
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: paymentMethod === "vietqr" ? "600" : "400",
                }}
              >
                VietQR
              </span>
            </button>
          </div>

          <button
            type="submit"
            disabled={isDonating || !donationAmount || donationAmount < 1000}
            className="btn btn-success"
            style={{
              backgroundColor: "var(--success)",
              color: "white",
              justifyContent: "center",
              marginTop: "0.5rem",
              opacity:
                isDonating || !donationAmount || donationAmount < 1000
                  ? 0.6
                  : 1,
              cursor:
                isDonating || !donationAmount || donationAmount < 1000
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {isDonating ? "Đang xử lý..." : "Quyên Góp Ngay"}
          </button>

          <div
            style={{
              fontSize: "0.75rem",
              color: "#6b7280",
              textAlign: "center",
              marginTop: "0.5rem",
            }}
          >
            🔒 Thanh toán an toàn qua{" "}
            {paymentMethod === "vnpay" ? "VNPay" : "Cassos (VietQR)"}
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={activeModal === "vietqr_modal"}
        onClose={() => setActiveModal(null)}
        title="Thanh toán qua VietQR"
      >
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: "0.875rem",
              color: "#4b5563",
              marginBottom: "1rem",
            }}
          >
            Dùng ứng dụng ngân hàng quét mã QR bên dưới
          </p>

          <div
            style={{
              background: "white",
              padding: "1rem",
              borderRadius: "1rem",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              marginBottom: "1rem",
            }}
          >
            {qrData?.qrImageUrl || qrData?.QrImageUrl ? (
              <img
                src={`https://images.weserv.nl/?url=${encodeURIComponent(qrData.qrImageUrl || qrData.QrImageUrl)}&t=${Date.now()}`}
                alt="QR Code"
                referrerPolicy="no-referrer"
                style={{
                  width: "100%",
                  maxWidth: "300px",
                  margin: "0 auto",
                  display: "block",
                }}
                onLoad={() => {
                  const manualDiv = document.getElementById(
                    "manual-payment-info",
                  );
                  if (manualDiv) manualDiv.style.display = "none";
                }}
                onError={(e) => {
                  console.error("QR Image Load Failed even with proxy");
                  e.target.style.display = "none";
                  const manualDiv = document.getElementById(
                    "manual-payment-info",
                  );
                  if (manualDiv) manualDiv.style.display = "block";
                }}
              />
            ) : null}

            <div
              id="manual-payment-info"
              style={{
                display:
                  qrData?.qrImageUrl || qrData?.QrImageUrl ? "none" : "block",
                padding: "1rem",
              }}
            >
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px dashed #cbd5e1",
                  borderRadius: "0.75rem",
                  padding: "1rem",
                }}
              >
                <p
                  style={{
                    color: "#ef4444",
                    fontWeight: "600",
                    marginBottom: "0.5rem",
                  }}
                >
                  ⚠️ Không thể tải mã QR
                </p>
                <div
                  style={{
                    textAlign: "left",
                    fontSize: "0.9rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div>
                    <strong>Ngân hàng:</strong> MB Bank (Quân Đội)
                  </div>
                  <div>
                    <strong>Số tài khoản:</strong>{" "}
                    <span style={{ color: "#1e40af", fontWeight: "bold" }}>
                      130072004
                    </span>
                  </div>
                  <div>
                    <strong>Chủ tài khoản:</strong> NGUYEN HOANG SANG
                  </div>
                  <div>
                    <strong>Số tiền:</strong>{" "}
                    <span style={{ color: "#15803d", fontWeight: "bold" }}>
                      {donationAmount.toLocaleString()} VNĐ
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    window.open(
                      qrData.qrImageUrl || qrData.QrImageUrl,
                      "_blank",
                    )
                  }
                  style={{
                    marginTop: "1rem",
                    width: "100%",
                    padding: "0.5rem",
                    background: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Mở mã QR trong tab mới ↗
                </button>
              </div>
            </div>
          </div>

          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "0.75rem",
              padding: "1rem",
              marginBottom: "1rem",
              textAlign: "left",
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                color: "#64748b",
                marginBottom: "4px",
              }}
            >
              Nội dung chuyển khoản
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  color: "#1e293b",
                }}
              >
                {qrData?.transferMessage || qrData?.TransferMessage}
              </span>
              <button
                onClick={() =>
                  copyToClipboard(
                    qrData?.transferMessage || qrData?.TransferMessage,
                  )
                }
                style={{
                  background: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "0.5rem",
                  padding: "0.5rem 0.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  cursor: "pointer",
                }}
              >
                <Copy size={16} /> Sao chép
              </button>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              color: "#15803d",
              background: "#f0fdf4",
              padding: "0.75rem",
              borderRadius: "0.75rem",
              fontSize: "0.875rem",
              marginBottom: "1rem",
            }}
          >
            {isPolling && <Loader2 className="animate-spin" size={16} />}
            <span>Đang chờ bạn thanh toán...</span>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center" }}
          >
            Tôi đã chuyển khoản
          </button>
        </div>
      </Modal>
      <style>{`
        .landing-main-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .pet-grid {
          display: grid;
          gap: 2rem;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        }

        .happy-stories-section {
          padding: 4rem 2rem;
          background: #fff;
          position: relative;
        }

        .stories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .landing-main-content {
            padding: 1.5rem 1rem;
          }

          .pet-grid {
            gap: 1.5rem;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          }

          .happy-stories-section {
            padding: 3rem 1rem;
          }

          .stories-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .landing-main-content {
            padding: 1rem 0.5rem;
          }

          .pet-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .happy-stories-section {
            padding: 2rem 0.75rem;
          }
        }

        .how-it-works-section {
          padding: 4rem 2rem;
          background: #f8f9fa;
          border-radius: 32px;
          position: relative;
          overflow: hidden;
          margin-bottom: 5rem;
        }

        .how-it-works-header {
          text-align: center;
          margin: 0 auto 4rem;
          max-width: 42rem;
        }

        .how-it-works-header h3 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          font-weight: 800;
        }

        @media (max-width: 768px) {
          .how-it-works-section {
            padding: 2rem 1rem;
            margin-bottom: 2.5rem;
            border-radius: 20px;
          }

          .how-it-works-header {
            margin-bottom: 1.5rem;
          }

          .how-it-works-header h3 {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
          }

          .how-it-works-header p {
            font-size: 0.9rem !important;
          }

          .steps-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 0.5rem;
          }

          .steps-grid p {
            display: none !important;
          }

          .steps-grid h4 {
            font-size: 0.85rem !important;
            white-space: nowrap;
          }

          .steps-grid .hover-lift div {
            width: 50px !important;
            height: 50px !important;
            margin-bottom: 0.75rem !important;
          }

          .steps-grid .hover-lift div svg {
            width: 24px !important;
            height: 24px !important;
          }
        }

        @media (max-width: 480px) {
          .how-it-works-section {
            padding: 1.5rem 0.5rem;
          }

          .how-it-works-header h3 {
            font-size: 1.35rem;
          }

          .steps-grid h4 {
            font-size: 0.75rem !important;
          }
        }

        .stats-section {
          max-width: 1000px;
          margin: -9rem auto 5rem;
          position: relative;
          z-index: 10;
          padding: 0 1rem;
        }

        .stats-grid {
          background: white;
          border-radius: 24px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          padding: 3rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 2rem;
          text-align: center;
        }

        .stat-item {
          padding: 1rem;
          border-radius: 12px;
        }

        .stat-value {
          font-size: 3rem;
          margin-bottom: 0.5rem;
          font-weight: 800;
        }

        .stat-value.primary { color: var(--primary); }
        .stat-value.secondary { color: var(--secondary); }
        .stat-value.warning { color: var(--warning); }

        .stat-label {
          color: var(--gray);
          font-weight: 600;
          font-size: 1.1rem;
        }

        @media (max-width: 768px) {
          .stats-section {
            margin: -6rem auto 3.5rem;
          }

          .stats-grid {
            padding: 1.25rem 0.5rem;
            gap: 0.5rem;
            grid-template-columns: repeat(3, 1fr);
          }

          .stat-item {
            padding: 0.25rem;
          }

          .stat-value {
            font-size: 1.5rem;
            margin-bottom: 0.2rem;
          }

          .stat-label {
            font-size: 0.75rem;
            line-height: 1.2;
          }
        }

        @media (max-width: 480px) {
          .stats-section {
            margin: -6rem auto 2.5rem;
          }

          .stats-grid {
            padding: 1rem 0.25rem;
            border-radius: 16px;
          }

          .stat-value {
            font-size: 1.25rem;
          }
          .stat-label {
            font-size: 0.7rem;
          }
        }
        /* Custom Select Styles */
        .custom-select-wrapper {
          position: relative;
          cursor: pointer;
          user-select: none;
          min-width: 120px;
        }

        .select-trigger {
          display: flex;
          align-items: center;
          gap: 10px;
          height: 100%;
          padding: 0 5px;
        }

        .selected-value {
          font-weight: 600;
          color: var(--dark);
          font-size: 0.95rem;
        }

        .chevron {
          font-size: 1.2rem;
          color: var(--gray);
          transition: transform 0.3s ease;
          margin-left: auto;
        }

        .chevron.up {
          transform: rotate(180deg);
        }

        .custom-options {
          position: absolute;
          top: calc(100% + 15px);
          left: 0;
          right: 0;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          overflow: hidden;
          z-index: 9999; /* Ensure it stays above everything */
          animation: slideDown 0.2s ease-out forwards;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .option-item {
          padding: 12px 20px;
          font-size: 0.95rem;
          color: #4b5563;
          transition: all 0.2s ease;
        }

        .option-item:hover {
          background: #fdf2f2;
          color: var(--primary);
        }

        .option-item.selected {
          background: #fff5f5;
          color: var(--primary);
          font-weight: 700;
        }

        .search-bar-container {
          z-index: 1000 !important;
          position: relative;
        }

        .custom-options {
          position: absolute;
          top: calc(100% + 10px);
          left: 0;
          right: 0;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          overflow: hidden;
          z-index: 10000;
          animation: slideDown 0.2s ease-out forwards;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .option-item {
          padding: 12px 20px;
          font-size: 0.95rem;
          color: #4b5563;
          transition: all 0.2s ease;
        }

        .option-item:hover {
          background: #fdf2f2;
          color: var(--primary);
        }

        .option-item.selected {
          background: #fff5f5;
          color: var(--primary);
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .custom-select-wrapper {
            width: 100%;
            border-bottom: 1px solid #f3f4f6;
            padding: 10px 0;
          }
          
          .custom-options {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
            background: white;
            z-index: 10000;
          }
          
          .select-trigger {
            padding: 0 1rem;
          }
        }
      `}</style>


    </div>
  );
};

export default UserLandingPage;

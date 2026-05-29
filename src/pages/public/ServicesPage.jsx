import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { addToCart } from "../../services/public/cartService";
import { 
  ShoppingBag, 
  Stethoscope, 
  Sparkles, 
  Plus, 
  Clock, 
  User, 
  Calendar, 
  X, 
  Grid, 
  Tag, 
  ChevronRight,
  Info
} from "lucide-react";

export default function ServicesPage() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Active Category Filter: 'all', 'shop', 'vet', 'spa'
  const [activeCategory, setActiveCategory] = useState("all");

  // Mock database collections
  const [products, setProducts] = useState([]);
  const [packages, setPackages] = useState([]);
  
  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    petName: "",
    ownerName: "",
    date: "",
    time: "09:00 AM",
    notes: "",
  });

  // Default Fallback Collections if localStorage is empty
  const defaultProducts = [
    { id: 1, name: "Thức ăn hạt cao cấp Royal Canin", category: "Food", price: 340000, image: "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=350&q=80", desc: "Thức ăn giàu dinh dưỡng dành cho chó trưởng thành." },
    { id: 2, name: "Sữa tắm chuyên dụng trị rận", category: "Grooming", price: 185000, image: "https://images.unsplash.com/photo-1608454509000-193ef5ab1797?auto=format&fit=crop&w=350&q=80", desc: "Sữa tắm dịu nhẹ trị bọ chét cho mèo cưng." },
    { id: 3, name: "Đồ chơi xương gặm cao su tự nhiên", category: "Toys", price: 95000, image: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=350&q=80", desc: "Giúp làm sạch răng chó cưng hiệu quả." },
    { id: 4, name: "Nhà cây Cat Tree sang trọng", category: "Furniture", price: 450000, image: "https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&w=350&q=80", desc: "Nhà cây leo trèo đa tầng dành cho mèo tò mò." },
    { id: 5, name: "Vòng cổ chuông sắc màu thú cưng", category: "Accessories", price: 55000, image: "https://images.unsplash.com/photo-1591946614720-90a587da4a36?auto=format&fit=crop&w=350&q=80", desc: "Vòng cổ vải dù bền đẹp đi kèm chuông nhỏ kêu vui tai." },
    { id: 6, name: "Pate Whiskas đóng lon vị cá ngừ", category: "Food", price: 45000, image: "https://images.unsplash.com/photo-1569591159212-b02ea8a9f239?auto=format&fit=crop&w=350&q=80", desc: "Pate đóng lon thơm ngon cung cấp đầy đủ đạm chất cho mèo cưng." }
  ];

  const defaultPackages = [
    { id: 1, name: "Gói Khám Sức Khỏe Toàn Diện", type: "vet", price: 850000, duration: "60 phút", desc: "Bao gồm siêu âm tổng quát, xét nghiệm máu cơ bản và tư vấn trực tiếp từ bác sĩ chuyên khoa." },
    { id: 2, name: "Gói Tắm & Cắt Tỉa Lông Cao Cấp", type: "spa", price: 450000, duration: "90 phút", desc: "Vệ sinh tai, cắt mài móng, vắt tuyến hôi, tắm sấy thơm dịu và tạo kiểu lông nghệ thuật." },
    { id: 3, name: "Gói Triệt Sản Thú Cưng", type: "vet", price: 1200000, duration: "120 phút", desc: "Phẫu thuật vô trùng tuyệt đối, gây mê an toàn và theo dõi hồi sức hậu phẫu chuyên sâu." },
    { id: 4, name: "Gói Vệ Sinh Răng Miệng Chuyên Sâu", type: "spa", price: 250000, duration: "30 phút", desc: "Đánh răng, cạo cao răng loại bỏ mảng bám nhẹ và xịt thơm miệng chuyên dụng." }
  ];

  // Load collections from localStorage on component mount
  useEffect(() => {
    const savedProducts = localStorage.getItem("partner_products");
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      localStorage.setItem("partner_products", JSON.stringify(defaultProducts));
      setProducts(defaultProducts);
    }

    const savedPackages = localStorage.getItem("partner_packages");
    if (savedPackages) {
      setPackages(JSON.parse(savedPackages));
    } else {
      localStorage.setItem("partner_packages", JSON.stringify(defaultPackages));
      setPackages(defaultPackages);
    }
  }, []);

  // Set booking modal form defaults when user changes
  useEffect(() => {
    if (user) {
      setBookingForm(prev => ({
        ...prev,
        ownerName: user.fullName || user.username || user.name || "",
      }));
    }
  }, [user]);

  // Handle Add to Cart
  const handleAddToCart = async (product) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      navigate("/login");
      return;
    }

    try {
      // Attempt backend cart update
      const result = await addToCart(product.id, 1);
      if (result.success) {
        toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`);
      } else {
        // Fallback for mock items that don't exist on backend DB yet
        toast.success(`[Demo Mode] Đã thêm "${product.name}" vào giỏ hàng thành công!`);
      }
    } catch (err) {
      // Graceful fallback
      toast.success(`[Demo Mode] Đã thêm "${product.name}" vào giỏ hàng thành công!`);
    }
  };

  // Open booking modal
  const handleOpenBooking = (pkg) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để đặt lịch hẹn dịch vụ!");
      navigate("/login");
      return;
    }
    setSelectedPackage(pkg);
    setBookingForm(prev => ({
      ...prev,
      petName: "",
      notes: "",
      date: new Date(Date.now() + 86400000).toISOString().split("T")[0], // default to tomorrow
    }));
    setShowBookingModal(true);
  };

  // Submit booking
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!bookingForm.petName || !bookingForm.date || !bookingForm.time) {
      toast.error("Vui lòng điền đầy đủ thông tin đặt lịch!");
      return;
    }

    // Load existing appointments
    const savedAppts = localStorage.getItem("partner_appointments");
    const appointmentsList = savedAppts ? JSON.parse(savedAppts) : [];

    // Create new appointment object matching PartnerDashboard's structures
    const newAppointment = {
      id: Date.now(),
      petName: bookingForm.petName,
      ownerName: bookingForm.ownerName || user?.fullName || user?.username || "Khách Hàng",
      date: bookingForm.date,
      time: bookingForm.time,
      type: selectedPackage.name,
      status: "pending",
      notes: bookingForm.notes || "Không có ghi chú thêm."
    };

    // Save to shared localStorage DB
    const updatedAppts = [newAppointment, ...appointmentsList];
    localStorage.setItem("partner_appointments", JSON.stringify(updatedAppts));

    // Notify Success
    toast.success("Đặt lịch dịch vụ thành công! Vui lòng chờ đối tác xác nhận.");
    setShowBookingModal(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#f8f9fa" }}>
      <Navbar />

      {/* Hero Section */}
      <section className="services-hero">
        <div className="hero-glow"></div>
        <div className="services-container hero-grid">
          <div className="hero-content">
            <span className="badge-promo">🐾 Dịch Vụ Cưng Chiều Thú Cưng</span>
            <h1 className="hero-title">
              Sản phẩm & Dịch vụ chất lượng cho người bạn bốn chân
            </h1>
            <p className="hero-desc">
              Khám phá hàng ngàn sản phẩm uy tín và các dịch vụ spa, y tế chuyên nghiệp từ mạng lưới đối tác rộng lớn của HomePaws. Mỗi giao dịch đều lan tỏa tình yêu thương đến cộng đồng.
            </p>
            <div className="hero-actions">
              <a href="#catalog" className="btn btn-primary btn-lg">Mua sắm ngay</a>
              <button 
                onClick={() => {
                  const el = document.getElementById("catalog");
                  el?.scrollIntoView({ behavior: "smooth" });
                }} 
                className="btn btn-outline btn-lg"
              >
                Tìm hiểu thêm
              </button>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="image-frame">
              <img 
                alt="Happy dog surrounded by toys" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCC5-DXb3qaA1NbEO5PsYbh33lUJhQbOwr2J9z_cghMUZnaPURnc3ahoUSAArA4gE0abudISxBtih75VPo7JCtIBuj9p-44iTqx_eRx6o7azKMTl1fLrs1wUJ4BUzyb8m5fO7Y3e5DKP1V1qwtjo2BIpDjyyLWehKg2D1ddBQ8lOyTRy9pjhSv6R_-LCK6rAbXbKtgTP_sqgBXuL4IGkOTsPZkL_FgD2vOTggfXKcedxWPqV1QeEMfSNyDShA22vu88q-Cp-CePlPc"
                className="dog-hero-image"
              />
              <div className="floating-stat-badge">
                <span className="badge-icon">⭐</span>
                <div>
                  <div className="stat-num">4.9/5</div>
                  <div className="stat-txt">Đánh giá dịch vụ</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Catalog & Filter Section */}
      <section id="catalog" className="services-container catalog-section">
        <div className="catalog-header">
          <div>
            <h2 className="section-title">Danh Mục Dịch Vụ & Mua Sắm</h2>
            <p className="section-subtitle">Lọc theo nhu cầu chăm sóc người bạn nhỏ của bạn</p>
          </div>
          
          {/* Tabs Filter */}
          <div className="filter-tabs">
            <button 
              onClick={() => setActiveCategory("all")} 
              className={`tab-btn ${activeCategory === "all" ? "active" : ""}`}
            >
              <Grid size={16} /> Tất cả
            </button>
            <button 
              onClick={() => setActiveCategory("shop")} 
              className={`tab-btn ${activeCategory === "shop" ? "active" : ""}`}
            >
              <ShoppingBag size={16} /> Mua sắm
            </button>
            <button 
              onClick={() => setActiveCategory("vet")} 
              className={`tab-btn ${activeCategory === "vet" ? "active" : ""}`}
            >
              <Stethoscope size={16} /> Y tế / Thú y
            </button>
            <button 
              onClick={() => setActiveCategory("spa")} 
              className={`tab-btn ${activeCategory === "spa" ? "active" : ""}`}
            >
              <Sparkles size={16} /> Spa & Làm đẹp
            </button>
          </div>
        </div>

        {/* Display Grid */}
        <div className="grid-catalog">
          
          {/* Render Products (Shop Category) */}
          {(activeCategory === "all" || activeCategory === "shop") && products.map(prod => (
            <div key={`prod-${prod.id}`} className="catalog-card product-card">
              <div className="card-media">
                <img src={prod.image} alt={prod.name} className="card-image" />
                <span className="badge-category shop">Mua Sắm</span>
              </div>
              <div className="card-content">
                <h4 className="card-title">{prod.name}</h4>
                <p className="card-desc">{prod.desc}</p>
                <div className="card-footer">
                  <div className="price-tag">{(prod.price).toLocaleString("vi-VN")} đ</div>
                  <button 
                    onClick={() => handleAddToCart(prod)}
                    className="btn-action add-cart-btn"
                    title="Thêm vào giỏ"
                  >
                    <Plus size={18} /> Thêm Giỏ
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Render Services (Vet & Spa Categories) */}
          {packages.filter(pkg => activeCategory === "all" || activeCategory === pkg.type).map(pkg => (
            <div key={`pkg-${pkg.id}`} className="catalog-card service-card">
              <div className="card-media service-bg">
                <div className="service-icon-circle">
                  {pkg.type === "vet" ? <Stethoscope size={36} color="var(--secondary)" /> : <Sparkles size={36} color="#9b93ff" />}
                </div>
                <span className={`badge-category ${pkg.type}`}>
                  {pkg.type === "vet" ? "Y Tế Thú Y" : "Spa & Grooming"}
                </span>
              </div>
              <div className="card-content">
                <h4 className="card-title">{pkg.name}</h4>
                <p className="card-desc">{pkg.desc}</p>
                <div className="service-meta">
                  <span className="meta-item"><Clock size={14} /> Thời gian: {pkg.duration || "60 phút"}</span>
                </div>
                <div className="card-footer">
                  <div className="price-tag">{(pkg.price).toLocaleString("vi-VN")} đ</div>
                  <button 
                    onClick={() => handleOpenBooking(pkg)}
                    className="btn-action booking-btn"
                  >
                    <Calendar size={16} /> Đặt Lịch
                  </button>
                </div>
              </div>
            </div>
          ))}

        </div>
      </section>

      {/* Booking Modal */}
      {showBookingModal && selectedPackage && (
        <div className="modal-overlay">
          <div className="modal-content-wrapper">
            <div className="modal-header">
              <h3>🐾 Đăng Ký Đặt Lịch Dịch Vụ</h3>
              <button onClick={() => setShowBookingModal(false)} className="close-modal-btn">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleBookingSubmit} className="modal-body-form">
              <div className="info-banner-mini">
                <Info size={16} color="var(--primary)" />
                <span>
                  Bạn đang đặt lịch: <strong>{selectedPackage.name}</strong> ({selectedPackage.price.toLocaleString("vi-VN")}đ)
                </span>
              </div>

              <div className="form-group">
                <label>Tên Chủ Thú Cưng</label>
                <input 
                  type="text" 
                  value={bookingForm.ownerName} 
                  onChange={(e) => setBookingForm({...bookingForm, ownerName: e.target.value})} 
                  placeholder="Nhập họ và tên chủ nuôi" 
                  required
                />
              </div>

              <div className="form-group">
                <label>Tên Thú Cưng *</label>
                <input 
                  type="text" 
                  value={bookingForm.petName} 
                  onChange={(e) => setBookingForm({...bookingForm, petName: e.target.value})} 
                  placeholder="Nhập tên bé cưng của bạn" 
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Ngày Hẹn *</label>
                  <input 
                    type="date" 
                    value={bookingForm.date} 
                    onChange={(e) => setBookingForm({...bookingForm, date: e.target.value})} 
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
                
                <div className="form-group half">
                  <label>Khung Giờ *</label>
                  <select 
                    value={bookingForm.time} 
                    onChange={(e) => setBookingForm({...bookingForm, time: e.target.value})}
                    required
                  >
                    <option value="08:00 AM">08:00 AM</option>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="01:30 PM">01:30 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Ghi Chú Yêu Cầu</label>
                <textarea 
                  value={bookingForm.notes} 
                  onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})} 
                  placeholder="Mô tả tình trạng bé cưng hoặc yêu cầu kiểu tỉa lông, cắt móng..." 
                  rows="3"
                />
              </div>

              <div className="modal-actions-footer">
                <button 
                  type="button" 
                  onClick={() => setShowBookingModal(false)} 
                  className="btn btn-outline"
                >
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary">
                  Xác Nhận Đặt Lịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />

      {/* Styled Styles */}
      <style>{`
        /* Hero Section Styling */
        .services-hero {
          position: relative;
          background: linear-gradient(135deg, #FFF9F9 0%, #FFF0F0 100%);
          padding: 5rem 2rem;
          overflow: hidden;
        }
        
        .hero-glow {
          position: absolute;
          top: -20%;
          right: -10%;
          width: 50%;
          height: 80%;
          background: radial-gradient(circle, rgba(255, 107, 107, 0.15) 0%, rgba(255, 107, 107, 0) 70%);
          pointer-events: none;
        }

        .services-container {
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 3rem;
          align-items: center;
        }

        .badge-promo {
          display: inline-block;
          background: rgba(255, 107, 107, 0.1);
          color: var(--primary);
          font-weight: 700;
          font-size: 0.85rem;
          padding: 0.4rem 1rem;
          border-radius: 50px;
          margin-bottom: 1.2rem;
          letter-spacing: 0.5px;
        }

        .hero-title {
          font-size: 2.8rem;
          font-weight: 800;
          line-height: 1.2;
          color: var(--dark);
          margin-bottom: 1.5rem;
        }

        .hero-desc {
          font-size: 1.1rem;
          color: #555;
          line-height: 1.7;
          margin-bottom: 2rem;
          max-width: 600px;
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
        }

        .btn-lg {
          padding: 0.9rem 2rem;
          font-size: 1.05rem;
          border-radius: 50px;
          font-weight: 700;
        }

        .hero-visual {
          position: relative;
        }

        .image-frame {
          position: relative;
          border-radius: 20px;
          overflow: visible;
          box-shadow: var(--shadow-lg);
          background: #fff;
          padding: 10px;
        }

        .dog-hero-image {
          width: 100%;
          height: auto;
          aspect-ratio: 4/3;
          object-fit: cover;
          border-radius: 12px;
        }

        .floating-stat-badge {
          position: absolute;
          bottom: -20px;
          left: -20px;
          background: #FFF;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          border-radius: 12px;
          padding: 0.8rem 1.2rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .badge-icon {
          font-size: 1.5rem;
        }

        .stat-num {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--dark);
        }

        .stat-txt {
          font-size: 0.75rem;
          color: #777;
        }



        /* Catalog & Filter Section */
        .catalog-section {
          padding: 2rem 1rem 5rem;
        }

        .catalog-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 3rem;
          border-bottom: 1px solid #EAEAEA;
          padding-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .section-title {
          font-size: 2rem;
          font-weight: 800;
          color: var(--dark);
          margin-bottom: 0.5rem;
        }

        .section-subtitle {
          font-size: 1rem;
          color: #777;
        }

        .filter-tabs {
          display: flex;
          background: #EFEFEF;
          padding: 0.3rem;
          border-radius: 12px;
          gap: 0.2rem;
        }

        .tab-btn {
          border: none;
          background: transparent;
          font-weight: 700;
          font-size: 0.9rem;
          padding: 0.7rem 1.4rem;
          border-radius: 9px;
          color: #666;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
        }

        .tab-btn:hover {
          color: var(--primary);
        }

        .tab-btn.active {
          background: #FFF;
          color: var(--primary);
          box-shadow: var(--shadow-sm);
        }

        /* Grid Catalog */
        .grid-catalog {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
        }

        .catalog-card {
          background: #FFF;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          border: 1px solid #EAEAEA;
          display: flex;
          flex-direction: column;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          height: 100%;
        }

        .catalog-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-lg);
        }

        .card-media {
          height: 200px;
          position: relative;
          overflow: hidden;
        }

        .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .catalog-card:hover .card-image {
          transform: scale(1.08);
        }

        .badge-category {
          position: absolute;
          top: 12px;
          left: 12px;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.3rem 0.8rem;
          border-radius: 50px;
          color: #FFF;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        }

        .badge-category.shop { background: var(--primary); }
        .badge-category.vet { background: var(--secondary); }
        .badge-category.spa { background: #9b93ff; }

        .service-bg {
          background: #FFF5F5;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .service-icon-circle {
          width: 76px;
          height: 76px;
          border-radius: 50%;
          background: #FFF;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-sm);
        }

        .card-content {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .card-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--dark);
          margin-bottom: 0.6rem;
          line-height: 1.4;
          height: 2.8rem;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .card-desc {
          font-size: 0.88rem;
          color: #666;
          line-height: 1.5;
          margin-bottom: 1.2rem;
          flex-grow: 1;
          height: 3.8rem;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }

        .service-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.82rem;
          color: #777;
          margin-bottom: 1.2rem;
          border-top: 1px dashed #EAEAEA;
          padding-top: 0.8rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #F0F0F0;
          padding-top: 1rem;
          margin-top: auto;
        }

        .price-tag {
          font-size: 1.2rem;
          font-weight: 800;
          color: #ef4444;
        }

        .btn-action {
          padding: 0.55rem 1rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .add-cart-btn {
          background: #eff6ff;
          color: #2563eb;
        }

        .add-cart-btn:hover {
          background: #2563eb;
          color: #FFF;
        }

        .booking-btn {
          background: #fdf2f2;
          color: var(--primary);
        }

        .booking-btn:hover {
          background: var(--primary);
          color: #FFF;
        }

        /* Modal Overlays */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content-wrapper {
          background: #FFF;
          border-radius: 16px;
          max-width: 500px;
          width: 100%;
          box-shadow: var(--shadow-lg);
          overflow: hidden;
          animation: modalFadeIn 0.3s ease;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .modal-header {
          padding: 1.2rem 1.5rem;
          background: #FFF;
          border-bottom: 1px solid #F0F0F0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h3 {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--dark);
          margin: 0;
        }

        .close-modal-btn {
          border: none;
          background: transparent;
          cursor: pointer;
          color: #999;
          display: flex;
          align-items: center;
        }

        .close-modal-btn:hover {
          color: var(--primary);
        }

        .modal-body-form {
          padding: 1.5rem;
        }

        .info-banner-mini {
          background: #FFF9F9;
          border: 1px solid rgba(255, 107, 107, 0.2);
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin-bottom: 1.2rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.88rem;
          color: #444;
        }

        .form-group {
          margin-bottom: 1.2rem;
        }

        .form-group label {
          display: block;
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--dark);
          margin-bottom: 0.4rem;
        }

        .form-group input, 
        .form-group select, 
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #DDD;
          border-radius: 8px;
          font-size: 0.92rem;
          font-family: inherit;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.2s;
        }

        .form-group input:focus, 
        .form-group select:focus, 
        .form-group textarea:focus {
          border-color: var(--primary);
        }

        .form-row {
          display: flex;
          gap: 1rem;
        }

        .form-group.half {
          flex: 1;
        }

        .modal-actions-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.8rem;
          margin-top: 1.8rem;
          border-top: 1px solid #F0F0F0;
          padding-top: 1.2rem;
        }

        /* Responsive Breakpoints */
        @media (max-width: 992px) {
          .hero-grid {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 2rem;
          }
          
          .hero-content {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          
          .hero-desc {
            margin: 0 auto 2rem;
          }

          .hero-actions {
            justify-content: center;
          }


        }

        @media (max-width: 768px) {
          .services-hero {
            padding: 3rem 1.2rem;
          }

          .hero-title {
            font-size: 2rem;
          }

          .catalog-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .filter-tabs {
            width: 100%;
            overflow-x: auto;
            white-space: nowrap;
          }
        }
      `}</style>
    </div>
  );
}

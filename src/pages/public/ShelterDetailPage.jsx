import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Phone, Mail, Globe, ArrowLeft, Heart, ShoppingBag, ChevronDown } from "lucide-react";
import AnimalCard from "../../components/AnimalCard";
import Pagination from "../../components/Pagination";
import Navbar from "../../components/Navbar";
import { getShelterById } from "../../services/public/sheltersService";
import { getAvailablePetsByShelter } from "../../services/public/petsService";
import { getProductsByShelterId, getProductDetail, createOrder } from "../../services/public/marketplaceService";
import { addToCart } from "../../services/public/cartService";
import AdoptionFormModal from "../../components/AdoptionFormModal";
import Modal from "../../components/Modal";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  createVNPayDonation,
  createVietQRDonation,
  checkVietQRStatus,
  getCurrentUserId,
  redirectToVNPay,
  DONATION_PRESETS,
  formatAmountDisplay,
} from "../../services/public/donationService";
import { QrCode, Copy, Loader2, CreditCard } from "lucide-react";
import Footer from "../../components/Footer";

const ShelterDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();

  // API States
  const [shelter, setShelter] = useState(null);
  const [animals, setAnimals] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showProducts, setShowProducts] = useState(false);
  const [activeTab, setActiveTab] = useState("pets"); // "pets" hoặc "products"
  const pageSize = 8;

  // Modal States
  const [activeModal, setActiveModal] = useState(null);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loadingProductDetail, setLoadingProductDetail] = useState(false);

  // Donation States
  const [donationAmount, setDonationAmount] = useState(50000);
  const [donationMessage, setDonationMessage] = useState("");
  const [isDonating, setIsDonating] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("vnpay");
  const [qrData, setQrData] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollingIntervalRef = useRef(null);

  // Order Form States
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderShippingAddress, setOrderShippingAddress] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // Address Selection States
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [phone, setPhone] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [confirmedAddress, setConfirmedAddress] = useState(null);
  const [shippingCarriers, setShippingCarriers] = useState([]);
  const [selectedShippingCarrier, setSelectedShippingCarrier] = useState("");
  const [shippingFee, setShippingFee] = useState(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("COD");
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Fetch shelter and animals on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // Fetch shelter details
      const shelterResult = await getShelterById(id);
      if (!shelterResult.success) {
        setError(shelterResult.error || "Failed to load shelter details");
        toast.error("Không thể tải thông tin trạm: " + shelterResult.error);
        setLoading(false);
        return;
      }

      // Map backend structure to frontend structure
      const backendShelter = shelterResult.data;
      const mappedShelter = {
        id: backendShelter.shelterID,
        name: backendShelter.shelterName,
        address: backendShelter.location,
        region: backendShelter.regionName,
        animalCount: backendShelter.totalPets || 0,
        description:
          backendShelter.description ||
          `Trạm cứu hộ ${backendShelter.shelterName} tại ${backendShelter.location}`,
        createdAt: backendShelter.createdAt,
        image:
          (backendShelter.imageUrls && backendShelter.imageUrls[0]) ||
          backendShelter.imageURL ||
          "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1200&q=80",
        imageUrls: backendShelter.imageUrls || [],
        // Bank info
        bankName: backendShelter.bankName,
        accountNumber: backendShelter.accountNumber,
        bankBin: backendShelter.bankBin,
        accountOwner: backendShelter.accountOwner,
        phone: null,
        email: null,
      };
      setShelter(mappedShelter);

      // Fetch available pets (Available + InTreatment) using new endpoint
      const petsResult = await getAvailablePetsByShelter(Number(id), {
        page: 1,
        pageSize: pageSize,
      });

      if (petsResult.success) {
        const mappedAnimals = (petsResult.data.items || []).map((pet) => ({
          id: pet.petID,
          name: pet.petName,
          breed: pet.breed,
          status: pet.status,
          image: pet.imageURL,
          type: pet.categoryName,
        }));

        setAnimals(mappedAnimals);
        setTotalPages(petsResult.data.totalPages || 1);
        setTotalCount(petsResult.data.totalCount || 0);
        setCurrentPage(1);
      }

      // Fetch marketplace products
      const productsResult = await getProductsByShelterId(Number(id));
      console.log("Products Result:", productsResult);
      if (productsResult.success) {
        console.log("Products loaded:", productsResult.data);
        setProducts(productsResult.data || []);
      } else {
        console.error("Failed to load products:", productsResult.error);
      }

      setLoading(false);
    };

    fetchData();
  }, [id, toast]);

  // Load provinces for address selection
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingProvinces(true);
      try {
        const res = await fetch("https://provinces.open-api.vn/api/p/");
        const data = await res.json();
        setProvinces(data || []);
      } catch (err) {
        console.error("Failed to fetch provinces:", err);
      }
      setLoadingProvinces(false);
    };
    fetchProvinces();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (!selectedProvince) {
      setDistricts([]);
      setWards([]);
      setSelectedDistrict("");
      setSelectedWard("");
      return;
    }

    const loadDistricts = async () => {
      setLoadingDistricts(true);
      try {
        const res = await fetch(
          `https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`,
        );
        const data = await res.json();
        setDistricts(data.districts || []);
      } catch (err) {
        console.error("Failed to fetch districts:", err);
      }
      setLoadingDistricts(false);
    };

    loadDistricts();
    setSelectedDistrict("");
    setSelectedWard("");
    setWards([]);
  }, [selectedProvince]);

  // Load wards when district changes
  useEffect(() => {
    if (!selectedDistrict) {
      setWards([]);
      setSelectedWard("");
      return;
    }

    const loadWards = async () => {
      setLoadingWards(true);
      try {
        const res = await fetch(
          `https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`,
        );
        const data = await res.json();
        setWards(data.wards || []);
      } catch (err) {
        console.error("Failed to fetch wards:", err);
      }
      setLoadingWards(false);
    };

    loadWards();
    setSelectedWard("");
  }, [selectedDistrict]);

  // Fetch available pets when currentPage changes (pagination)
  useEffect(() => {
    if (!id) return;

    const fetchAnimalsForPage = async () => {
      const petsResult = await getAvailablePetsByShelter(Number(id), {
        page: currentPage,
        pageSize: pageSize,
      });

      if (petsResult.success) {
        const mappedAnimals = (petsResult.data.items || []).map((pet) => ({
          id: pet.petID,
          name: pet.petName,
          breed: pet.breed,
          status: pet.status,
          image: pet.imageURL,
          type: pet.categoryName,
        }));

        setAnimals(mappedAnimals);
        setTotalPages(petsResult.data.totalPages || 1);
        setTotalCount(petsResult.data.totalCount || 0);
      }
    };

    fetchAnimalsForPage();
  }, [id, currentPage, pageSize]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  const handleAction = (type, animal) => {
    setSelectedAnimal(animal);
    if (type === "adopt") {
      if (!user) {
        toast.warning("Vui lòng đăng nhập để đăng ký nhận nuôi!");
        return;
      }
      setActiveModal("adoptForm");
    } else if (type === "donate") {
      setDonationAmount(50000);
      setDonationMessage("");
      setActiveModal("donate");
    }
  };

  const handleOpenProductDetail = async (product) => {
    setLoadingProductDetail(true);
    const result = await getProductDetail(Number(id), product.productID || product.id);

    if (result.success) {
      setSelectedProduct(result.data);
      setActiveModal("productDetail");
    } else {
      toast.error(result.error || "Không thể tải chi tiết sản phẩm");
    }

    setLoadingProductDetail(false);
  };

  const handleBuyProduct = () => {
    if (!user) {
      toast.warning("Vui lòng đăng nhập để mua sản phẩm!");
      return;
    }

    // Reset address selection states
    setSelectedProvince("");
    setSelectedDistrict("");
    setSelectedWard("");
    setPhone("");
    setDetailAddress("");
    setConfirmedAddress(null);
    setSelectedShippingCarrier("");
    setShippingFee(0);
    setSelectedPaymentMethod("COD");

    setOrderQuantity(1);
    setOrderNote("");
    setActiveModal("orderForm");
  };

  // Handle confirm address
  const handleConfirmAddress = async () => {
    if (!phone || !selectedProvince || !selectedDistrict || !selectedWard || !detailAddress) {
      toast.error("Vui lòng điền đầy đủ thông tin địa chỉ!");
      return;
    }

    const province = provinces.find(p => String(p.code) === String(selectedProvince));
    const district = districts.find(d => String(d.code) === String(selectedDistrict));
    const ward = wards.find(w => String(w.code) === String(selectedWard));

    if (!province || !district || !ward) {
      toast.error("Vui lòng chọn tỉnh, quận và phường hợp lệ!");
      return;
    }

    const fullAddress = `${detailAddress}, ${ward.name}, ${district.name}, ${province.name}`;

    setConfirmedAddress({
      phone,
      fullAddress,
      province: selectedProvince,
      district: selectedDistrict,
      ward: selectedWard,
      detail: detailAddress,
    });

    // Calculate shipping cost if needed
    try {
      const totalWeight = orderQuantity * 500;
      const response = await (await import("../../services/public/shippingService")).calculateShippingCost(1450, parseInt(selectedDistrict), totalWeight);

      if (response.success && response.data?.ShippingOptions) {
        const options = response.data.ShippingOptions;
        setShippingCarriers(options);
        if (options.length > 0) {
          setSelectedShippingCarrier(options[0].CarrierCode);
          setShippingFee(options[0].TotalCost || 0);
        }
      } else {
        setShippingFee(35000);
      }
    } catch (error) {
      console.error("Error calculating shipping:", error);
      setShippingFee(35000);
    }

    toast.success("Xác nhận địa chỉ thành công!");
  };

  // Add to cart function
  const handleAddToCart = async (product) => {
    if (!user) {
      toast.warning("Vui lòng đăng nhập để mua sản phẩm!");
      return;
    }

    if (!selectedProduct && !product) {
      toast.error("Không thể thêm vào giỏ hàng");
      return;
    }

    const productToAdd = selectedProduct || product;
    console.log("[handleAddToCart] Product object:", productToAdd);

    // Try multiple field names for product ID
    const productID = productToAdd.productID || productToAdd.id || productToAdd.ProductID;

    if (!productID || productID === 0) {
      console.error("[handleAddToCart] Invalid productID:", productID);
      toast.error(`Lỗi: Không tìm thấy ID sản phẩm. Fields: ${JSON.stringify(productToAdd)}`);
      return;
    }

    console.log("[handleAddToCart] Sending productID:", productID);
    // Call API to add to cart
    const result = await addToCart(productID, 1);

    if (result.success) {
      toast.success(`✓ Đã thêm "${productToAdd.productName || productToAdd.name}" vào giỏ hàng!`);
    } else {
      toast.error(result.message || "Không thể thêm vào giỏ hàng");
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();

    if (!selectedProduct) {
      toast.error("Sản phẩm không hợp lệ");
      return;
    }

    if (!orderQuantity || orderQuantity <= 0) {
      toast.error("Vui lòng nhập số lượng hợp lệ");
      return;
    }

    if (!confirmedAddress) {
      toast.error("Vui lòng xác nhận địa chỉ giao hàng");
      return;
    }

    setIsCreatingOrder(true);

    try {
      const orderData = {
        productID: selectedProduct.productID || selectedProduct.id,
        quantity: orderQuantity,
        shippingAddress: confirmedAddress.fullAddress,
        note: orderNote,
      };

      const result = await createOrder(Number(id), orderData);

      if (result.success) {
        toast.success(result.message || "Đơn hàng đã được tạo thành công!");
        setActiveModal(null);
        setSelectedProduct(null);
        // Reset form
        setOrderQuantity(1);
        setOrderNote("");
        setConfirmedAddress(null);
        setSelectedProvince("");
        setSelectedDistrict("");
        setSelectedWard("");
        setPhone("");
        setDetailAddress("");
      } else {
        toast.error(result.message || "Không thể tạo đơn hàng");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Đã xảy ra lỗi khi tạo đơn hàng");
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleDonate = async (e) => {
    e.preventDefault();

    // Check if donating to pet or shelter
    const petID = selectedAnimal?.id;
    const petName = selectedAnimal?.name || "";
    const shelterName = shelter?.name || "trạm này";

    // Must have either petID or shelterID
    if (!petID && !shelter?.id) {
      toast.error("Không tìm thấy thông tin pet hoặc trạm.");
      return;
    }

    setIsDonating(true);
    try {
      const donationData = {
        userID: getCurrentUserId(),
        amount: donationAmount,
        donorName: user?.name || "",
      };

      // Add petID or shelterID and set message based on type
      if (petID) {
        donationData.petID = petID;
        donationData.message = donationMessage || `Đóng góp của bạn giúp cung cấp thức ăn và y tế cho ${petName}`;
      } else {
        donationData.shelterID = shelter.id;
        donationData.message = donationMessage || `Đóng góp của bạn giúp hỗ trợ ${shelterName} chăm sóc các thú cưng`;
      }

      if (paymentMethod === "vnpay") {
        const result = await createVNPayDonation(donationData);
        if (result.success) {
          setActiveModal(null);
          redirectToVNPay(result.data.paymentUrl);
        } else {
          toast.error(result.error);
        }
      } else {
        const result = await createVietQRDonation(donationData);
        if (result.success) {
          console.log("💰 VietQR Data Received (Shelter Detail):", result.data);
          setActiveModal(null);
          window.location.href = "https://pay.payos.vn/web/300b23c945eb4a4c897cdc5f5c9de514";
        } else {
          toast.error(result.error);
        }
      }
    } catch {
      toast.error("Đã xảy ra lỗi khi quyên góp.");
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
      if (result.success && result.data?.status === "Success") {
        clearInterval(interval);
        pollingIntervalRef.current = null;
        setIsPolling(false);
        setActiveModal(null);
        toast.success("Thanh toán thành công! Cảm ơn bạn đã quyên góp.");
      }
    }, 10000);

    pollingIntervalRef.current = interval;

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
      <Navbar />

      {/* Loading State */}
      {loading && (
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
            Đang tải thông tin trạm...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div
          style={{ maxWidth: "800px", margin: "100px auto", padding: "0 20px" }}
        >
          <div
            style={{
              background: "#fee2e2",
              color: "#dc2626",
              padding: "40px",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <h2 style={{ marginBottom: "10px" }}>⚠️ Không thể tải dữ liệu</h2>
            <p>{error}</p>
            <Link
              to="/shelters"
              className="btn btn-primary"
              style={{
                marginTop: "20px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <ArrowLeft size={16} /> Quay lại danh sách
            </Link>
          </div>
        </div>
      )}

      {/* Content */}
      {!loading && !error && shelter && (
        <>
          {/* Hero */}
          <div style={{ position: "relative", height: "300px" }}>
            <img
              src={shelter.image}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              alt={shelter.name}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "2rem",
                color: "white",
              }}
            >
              <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <Link
                  to="/shelters"
                  style={{
                    color: "white",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "1rem",
                    opacity: 0.8,
                  }}
                >
                  <ArrowLeft size={16} /> Quay lại danh sách
                </Link>
                <h1
                  style={{ fontSize: "2.5rem", fontWeight: "bold", margin: 0 }}
                >
                  {shelter.name}
                </h1>
                <p
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginTop: "0.5rem",
                    opacity: 0.9,
                  }}
                >
                  <MapPin size={18} /> {shelter.address}
                </p>
              </div>
            </div>
          </div>

          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "2rem",
              display: "flex",
              gap: "3rem",
              flexWrap: "wrap",
              alignItems: "flex-start",
            }}
          >
            {/* Sidebar Info */}
            <div
              style={{
                flex: "1 1 300px",
                position: "sticky",
                top: "100px",
                background: "white",
                padding: "1.5rem",
                borderRadius: "16px",
                border: "1px solid #eee",
                boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
              }}
            >
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  marginBottom: "1rem",
                  borderBottom: "1px solid #eee",
                  paddingBottom: "0.5rem",
                }}
              >
                Liên Hệ
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    alignItems: "center",
                    color: "#4b5563",
                  }}
                >
                  <Phone size={18} color="var(--primary)" />{" "}
                  <span>{shelter.phone || "0123 456 789"}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    alignItems: "center",
                    color: "#4b5563",
                  }}
                >
                  <Mail size={18} color="var(--primary)" />{" "}
                  <span>{shelter.email || "contact@shelter.com"}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    alignItems: "center",
                    color: "#4b5563",
                  }}
                >
                  <Globe size={18} color="var(--primary)" />{" "}
                  <span>www.website.com</span>
                </div>
              </div>

              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  marginTop: "2rem",
                  marginBottom: "1rem",
                  borderBottom: "1px solid #eee",
                  paddingBottom: "0.5rem",
                }}
              >
                Về Chúng Tôi
              </h3>
              <p
                style={{ color: "#666", lineHeight: 1.6, marginBottom: "2rem" }}
              >
                {shelter.description}
              </p>

              {shelter.bankName && (
                <>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "bold",
                      marginTop: "2rem",
                      marginBottom: "1rem",
                      borderBottom: "1px solid #eee",
                      paddingBottom: "0.5rem",
                    }}
                  >
                    Ủng Hộ Trạm
                  </h3>
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "1rem",
                      borderRadius: "12px",
                      border: "1px dashed #3b82f6",
                    }}
                  >
                    <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                      Ngân hàng
                    </div>
                    <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
                      {shelter.bankName}
                    </div>

                    <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                      Số tài khoản
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: "bold",
                          fontSize: "1.1rem",
                          color: "#1e293b",
                        }}
                      >
                        {shelter.accountNumber}
                      </span>
                      <button
                        onClick={() => copyToClipboard(shelter.accountNumber)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#3b82f6",
                          cursor: "pointer",
                          padding: 4,
                        }}
                      >
                        <Copy size={16} />
                      </button>
                    </div>

                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#64748b",
                        marginTop: "0.5rem",
                      }}
                    >
                      Chủ tài khoản
                    </div>
                    <div
                      style={{ fontWeight: 500, textTransform: "uppercase" }}
                    >
                      {shelter.accountOwner}
                    </div>
                  </div>
                </>
              )}

              <button
                className="btn btn-primary"
                onClick={() => {
                  setSelectedAnimal(null);
                  setActiveModal("donate");
                }}
                style={{
                  width: "100%",
                  marginTop: "1.5rem",
                  display: "flex",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                <Heart size={18} /> Quyên Góp Nhanh
              </button>
            </div>

            {/* Main Content */}
            <div style={{ flex: "2 1 500px" }}>
              {/* Tabs Header */}
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  marginBottom: "2rem",
                  borderBottom: "2px solid #e5e7eb",
                }}
              >
                <button
                  onClick={() => setActiveTab("pets")}
                  style={{
                    padding: "1rem 1.5rem",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: activeTab === "pets" ? "#3b82f6" : "#6b7280",
                    borderBottom: activeTab === "pets" ? "3px solid #3b82f6" : "none",
                    marginBottom: "-2px",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== "pets") {
                      e.target.style.color = "#1f2937";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== "pets") {
                      e.target.style.color = "#6b7280";
                    }
                  }}
                >
                  🐾 Thú Cưng ({totalCount})
                </button>
                <button
                  onClick={() => setActiveTab("products")}
                  style={{
                    padding: "1rem 1.5rem",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: activeTab === "products" ? "#3b82f6" : "#6b7280",
                    borderBottom:
                      activeTab === "products" ? "3px solid #3b82f6" : "none",
                    marginBottom: "-2px",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== "products") {
                      e.target.style.color = "#1f2937";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== "products") {
                      e.target.style.color = "#6b7280";
                    }
                  }}
                >
                  🛍️ Sản Phẩm ({products.length})
                </button>
              </div>

              {/* Pets Tab Content */}
              {activeTab === "pets" && (
                <div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(250px, 1fr))",
                      gap: "1.5rem",
                    }}
                  >
                    {animals.length > 0 ? (
                      animals.map((animal) => (
                        <AnimalCard
                          key={animal.id}
                          animal={{
                            ...animal,
                            status:
                              animal.status === "Available"
                                ? "Sẵn sàng"
                                : animal.status === "Pending"
                                  ? "Đang duyệt"
                                  : animal.status,
                          }}
                          totalCount={totalCount}
                          onAction={(action) => handleAction(action, animal)}
                        />
                      ))
                    ) : (
                      <p
                        style={{
                          color: "#666",
                          gridColumn: "1 / -1",
                          textAlign: "center",
                          padding: "2rem",
                        }}
                      >
                        Chưa có thú cưng nào được cập nhật.
                      </p>
                    )}
                  </div>

                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalCount={animals.length}
                      onPageChange={handlePageChange}
                    />
                  )}
                </div>
              )}

              {/* Products Tab Content */}
              {activeTab === "products" && (
                <div>
                  {loadingProducts ? (
                    <div style={{ textAlign: "center", padding: "3rem" }}>
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
                      <p style={{ marginTop: "1rem", color: "#666" }}>
                        Đang tải sản phẩm...
                      </p>
                    </div>
                  ) : products.length > 0 ? (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(220px, 1fr))",
                        gap: "1.5rem",
                      }}
                    >
                      {products.map((product) => (
                        <div
                          key={product.productID || product.id}
                          onClick={() => handleOpenProductDetail(product)}
                          style={{
                            border: "1px solid #e5e7eb",
                            borderRadius: "12px",
                            overflow: "hidden",
                            transition: "all 0.3s ease",
                            cursor: "pointer",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                            background: "white",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow =
                              "0 8px 16px rgba(0,0,0,0.1)";
                            e.currentTarget.style.transform = "translateY(-4px)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow =
                              "0 2px 4px rgba(0,0,0,0.05)";
                            e.currentTarget.style.transform = "translateY(0)";
                          }}
                        >
                          {/* Product Image */}
                          <div
                            style={{
                              width: "100%",
                              height: "180px",
                              background: "#f3f4f6",
                              overflow: "hidden",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {product.imageUrls &&
                              product.imageUrls.length > 0 ? (
                              <img
                                src={product.imageUrls[0]}
                                alt={product.productName}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <ShoppingBag size={48} color="#9ca3af" />
                            )}
                          </div>

                          {/* Product Info */}
                          <div style={{ padding: "1rem" }}>
                            <h4
                              style={{
                                fontWeight: "600",
                                marginBottom: "0.5rem",
                                fontSize: "0.95rem",
                                color: "#1f2937",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {product.productName}
                            </h4>

                            <p
                              style={{
                                color: "#6b7280",
                                fontSize: "0.85rem",
                                marginBottom: "0.75rem",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                              }}
                            >
                              {product.description}
                            </p>

                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "0.75rem",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "1.25rem",
                                  fontWeight: "bold",
                                  color: "#3b82f6",
                                }}
                              >
                                {(product.price || 0).toLocaleString("vi-VN")}đ
                              </span>
                              <span
                                style={{
                                  fontSize: "0.85rem",
                                  background: "#f0fdf4",
                                  color: "#15803d",
                                  padding: "0.25rem 0.75rem",
                                  borderRadius: "20px",
                                }}
                              >
                                {product.quantity} {product.unit || "cái"}
                              </span>
                            </div>

                            {product.categoryName && (
                              <p
                                style={{
                                  fontSize: "0.8rem",
                                  color: "#9ca3af",
                                  marginBottom: "0.75rem",
                                }}
                              >
                                Danh mục: {product.categoryName}
                              </p>
                            )}

                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(product);
                                }}
                                style={{
                                  flex: 1,
                                  padding: "0.5rem",
                                  background: product.isActive === false || !product.quantity ? "#d1d5db" : "#10b981",
                                  color: product.isActive === false || !product.quantity ? "#6b7280" : "white",
                                  border: "none",
                                  borderRadius: "6px",
                                  cursor: product.isActive === false || !product.quantity ? "not-allowed" : "pointer",
                                  fontSize: "0.875rem",
                                  fontWeight: "600",
                                  transition: "all 0.2s ease",
                                }}
                                onMouseEnter={(e) => {
                                  if (product.isActive !== false && product.quantity) {
                                    e.target.style.background = "#059669";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (product.isActive !== false && product.quantity) {
                                    e.target.style.background = "#10b981";
                                  }
                                }}
                                disabled={product.isActive === false || !product.quantity}
                                title={!product.quantity ? "Hết hàng" : "Thêm vào giỏ hàng"}
                              >
                                {!product.quantity ? "❌ Hết" : "🛒 Giỏ"}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenProductDetail(product);
                                  setTimeout(() => handleBuyProduct(), 500);
                                }}
                                style={{
                                  flex: 1,
                                  padding: "0.5rem",
                                  background:
                                    product.isActive === false
                                      ? "#d1d5db"
                                      : "#3b82f6",
                                  color:
                                    product.isActive === false ? "#6b7280" : "white",
                                  border: "none",
                                  borderRadius: "6px",
                                  cursor:
                                    product.isActive === false
                                      ? "not-allowed"
                                      : "pointer",
                                  fontSize: "0.875rem",
                                  fontWeight: "600",
                                  transition: "all 0.2s ease",
                                }}
                                onMouseEnter={(e) => {
                                  if (product.isActive !== false) {
                                    e.target.style.background = "#1d4ed8";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (product.isActive !== false) {
                                    e.target.style.background = "#3b82f6";
                                  }
                                }}
                                disabled={product.isActive === false}
                              >
                                {product.isActive === false
                                  ? "Đã bán hết"
                                  : "💳 Mua"}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p
                      style={{
                        color: "#6b7280",
                        textAlign: "center",
                        padding: "2rem",
                      }}
                    >
                      Trạm không có sản phẩm nào đang bán.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Modals */}
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
            title={selectedAnimal ? `Quyên góp cho ${selectedAnimal.name}` : `Quyên góp cho ${shelter?.name}`}
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
                }}
              >
                {selectedAnimal ? (
                  <>
                    Đóng góp của bạn giúp cung cấp thức ăn và y tế cho{" "}
                    <strong>{selectedAnimal.name}</strong>.
                  </>
                ) : (
                  <>
                    Đóng góp của bạn giúp hỗ trợ <strong>{shelter?.name}</strong> chăm sóc các thú cưng.
                  </>
                )}
              </div>

              <label style={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                Chọn Số Tiền
              </label>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {DONATION_PRESETS.map((preset) => (
                  <button
                    type="button"
                    key={preset.value}
                    onClick={() => setDonationAmount(preset.value)}
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
                      cursor: "pointer",
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <input
                type="number"
                placeholder="Số tiền khác (tối tiểu 1,000đ)"
                value={donationAmount || ""}
                onChange={(e) =>
                  setDonationAmount(parseInt(e.target.value) || 0)
                }
                style={{
                  padding: "0.75rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                }}
              />

              <textarea
                placeholder="Lời nhắn..."
                value={donationMessage}
                onChange={(e) => setDonationMessage(e.target.value)}
                rows={2}
                style={{
                  padding: "0.75rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.5rem",
                }}
              />

              <label style={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                Thanh Toán Qua
              </label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("vnpay")}
                  style={{
                    flex: 1,
                    padding: "0.5rem",
                    borderRadius: "0.5rem",
                    border:
                      paymentMethod === "vnpay"
                        ? "2px solid #3b82f6"
                        : "1px solid #e5e7eb",
                    background: paymentMethod === "vnpay" ? "#eff6ff" : "white",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                  }}
                >
                  <CreditCard size={18} /> VNPay
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("vietqr")}
                  style={{
                    flex: 1,
                    padding: "0.5rem",
                    borderRadius: "0.5rem",
                    border:
                      paymentMethod === "vietqr"
                        ? "2px solid #3b82f6"
                        : "1px solid #e5e7eb",
                    background:
                      paymentMethod === "vietqr" ? "#eff6ff" : "white",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                  }}
                >
                  <QrCode size={18} /> VietQR
                </button>
              </div>

              <button
                type="submit"
                disabled={isDonating}
                className="btn btn-success"
                style={{ width: "100%", justifyContent: "center" }}
              >
                {isDonating
                  ? "Đang xử lý..."
                  : selectedAnimal
                    ? `Quyên Góp Cho ${selectedAnimal.name}`
                    : "Quyên Góp Cho Trạm"}
              </button>
            </form>
          </Modal>

          <Modal
            isOpen={activeModal === "vietqr_modal"}
            onClose={() => setActiveModal(null)}
            title="Thanh toán VietQR"
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  background: "white",
                  padding: "1rem",
                  borderRadius: "1rem",
                  marginBottom: "1rem",
                }}
              >
                {qrData?.qrImageUrl || qrData?.QrImageUrl ? (
                  <img
                    src={`https://images.weserv.nl/?url=${encodeURIComponent(qrData.qrImageUrl || qrData.QrImageUrl)}&t=${Date.now()}`}
                    alt="QR"
                    referrerPolicy="no-referrer"
                    style={{ width: "100%", display: "block" }}
                    onLoad={() => {
                      const manualDiv = document.getElementById(
                        "manual-payment-shelter",
                      );
                      if (manualDiv) manualDiv.style.display = "none";
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                      const manualDiv = document.getElementById(
                        "manual-payment-shelter",
                      );
                      if (manualDiv) manualDiv.style.display = "block";
                    }}
                  />
                ) : (
                  <Loader2 className="animate-spin" />
                )}

                <div
                  id="manual-payment-shelter"
                  style={{
                    display: "none",
                    textAlign: "left",
                    fontSize: "0.85rem",
                  }}
                >
                  <p style={{ color: "#ef4444", fontWeight: "bold" }}>
                    ⚠️ Lỗi tải QR - Chuyển khoản thủ công:
                  </p>
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "0.5rem",
                      borderRadius: "0.5rem",
                      border: "1px dashed #ccc",
                    }}
                  >
                    <div>
                      Ngân hàng: <strong>MB Bank</strong>
                    </div>
                    <div>
                      STK: <strong>130072004</strong>
                    </div>
                    <div>
                      Chủ TK: <strong>NGUYEN HOANG SANG</strong>
                    </div>
                    <div>
                      Số tiền:{" "}
                      <strong>{donationAmount.toLocaleString()} VNĐ</strong>
                    </div>
                  </div>
                </div>
              </div>
              <div
                style={{
                  background: "#f8fafc",
                  padding: "1rem",
                  borderRadius: "0.5rem",
                  marginBottom: "1rem",
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  Nội dung
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontWeight: "bold" }}>
                    {qrData?.transferMessage || qrData?.TransferMessage}
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        qrData?.transferMessage || qrData?.TransferMessage,
                      )
                    }
                    style={{
                      border: "none",
                      background: "#3b82f6",
                      color: "white",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "0.25rem",
                      cursor: "pointer",
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div
                style={{
                  padding: "0.5rem",
                  color: "#15803d",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px",
                }}
              >
                {isPolling && <Loader2 size={16} className="animate-spin" />}{" "}
                Đang chờ thanh toán...
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="btn btn-primary"
                style={{ width: "100%" }}
              >
                Tôi đã chuyển khoản
              </button>
            </div>
          </Modal>

          {/* Product Detail Modal */}
          <Modal
            isOpen={activeModal === "productDetail"}
            onClose={() => {
              setActiveModal(null);
              setSelectedProduct(null);
            }}
            title={selectedProduct?.productName || "Chi tiết sản phẩm"}
          >
            {loadingProductDetail ? (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <div
                  style={{
                    display: "inline-block",
                    border: "4px solid #f3f3f3",
                    borderTop: "4px solid #3b82f6",
                    borderRadius: "50%",
                    width: "40px",
                    height: "40px",
                    animation: "spin 1s linear infinite",
                  }}
                />
              </div>
            ) : selectedProduct ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {/* Product Images */}
                <div>
                  <div
                    style={{
                      width: "100%",
                      height: "300px",
                      background: "#f3f4f6",
                      borderRadius: "12px",
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "1rem",
                    }}
                  >
                    {selectedProduct.imageUrls && selectedProduct.imageUrls.length > 0 ? (
                      <img
                        src={selectedProduct.imageUrls[0]}
                        alt={selectedProduct.productName}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <ShoppingBag size={60} color="#9ca3af" />
                    )}
                  </div>

                  {/* Thumbnail Images */}
                  {selectedProduct.imageUrls && selectedProduct.imageUrls.length > 1 && (
                    <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto" }}>
                      {selectedProduct.imageUrls.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt={`${selectedProduct.productName} ${idx + 1}`}
                          style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "8px",
                            objectFit: "cover",
                            cursor: "pointer",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div>
                  <h4 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                    {selectedProduct.productName}
                  </h4>

                  {selectedProduct.categoryName && (
                    <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "0.75rem" }}>
                      📁 Danh mục: {selectedProduct.categoryName}
                    </p>
                  )}

                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      margin: "1rem 0",
                      padding: "1rem",
                      background: "#f8fafc",
                      borderRadius: "8px",
                    }}
                  >
                    <div>
                      <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>Giá</p>
                      <p
                        style={{
                          fontSize: "1.75rem",
                          fontWeight: "bold",
                          color: "#3b82f6",
                        }}
                      >
                        {(selectedProduct.price || 0).toLocaleString("vi-VN")}đ
                      </p>
                    </div>

                    <div style={{ borderLeft: "1px solid #e5e7eb" }}>
                      <p style={{ color: "#6b7280", fontSize: "0.85rem", marginLeft: "1rem" }}>
                        Số lượng
                      </p>
                      <p
                        style={{
                          fontSize: "1.5rem",
                          fontWeight: "bold",
                          color: "#059669",
                          marginLeft: "1rem",
                        }}
                      >
                        {selectedProduct.quantity} {selectedProduct.unit || "cái"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedProduct.description && (
                  <div>
                    <h5 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>Mô tả</h5>
                    <p style={{ color: "#666", lineHeight: 1.6 }}>
                      {selectedProduct.description}
                    </p>
                  </div>
                )}

                {/* Status */}
                <div
                  style={{
                    padding: "0.75rem",
                    background:
                      selectedProduct.isActive === false ? "#fee2e2" : "#f0fdf4",
                    color: selectedProduct.isActive === false ? "#b91c1c" : "#15803d",
                    borderRadius: "8px",
                    textAlign: "center",
                    fontWeight: "600",
                  }}
                >
                  {selectedProduct.isActive === false ? "❌ Đã ngừng bán" : "✅ Đang kinh doanh"}
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    onClick={handleBuyProduct}
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      background: selectedProduct.isActive === false ? "#d1d5db" : "#3b82f6",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "600",
                      cursor: selectedProduct.isActive === false ? "not-allowed" : "pointer",
                    }}
                    disabled={selectedProduct.isActive === false}
                  >
                    🛒 Mua ngay
                  </button>
                  <button
                    onClick={() => setActiveModal(null)}
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      background: "#e5e7eb",
                      color: "#1f2937",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ textAlign: "center", color: "#666" }}>
                Không thể tải chi tiết sản phẩm
              </p>
            )}
          </Modal>

          {/* Order Form Modal */}
          <Modal
            isOpen={activeModal === "orderForm"}
            onClose={() => setActiveModal(null)}
            title={`Đặt hàng - ${selectedProduct?.productName}`}
          >
            <form
              onSubmit={handleCreateOrder}
              style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
            >
              {/* Product Summary - Enhanced */}
              <div
                style={{
                  background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ display: "flex", gap: "1.5rem" }}>
                  {selectedProduct?.imageUrls && selectedProduct.imageUrls.length > 0 && (
                    <img
                      src={selectedProduct.imageUrls[0]}
                      alt={selectedProduct.productName}
                      style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "8px",
                        objectFit: "cover",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <p style={{ color: "#6b7280", fontSize: "0.85rem", margin: 0, fontWeight: "600" }}>
                      {selectedProduct?.categoryName}
                    </p>
                    <h4 style={{ fontWeight: "bold", marginBottom: "0.75rem", margin: "0.5rem 0 0" }}>
                      {selectedProduct?.productName}
                    </h4>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <p style={{ color: "#ef4444", fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>
                        {(selectedProduct?.price || 0).toLocaleString("vi-VN")}đ
                      </p>
                      <p style={{ color: "#9ca3af", fontSize: "0.9rem", margin: 0 }}>
                        / {selectedProduct?.unit || "cái"}
                      </p>
                    </div>
                    <p style={{ color: "#6b7280", fontSize: "0.9rem", margin: "0.5rem 0 0" }}>
                      📦 Sẵn có: <strong>{selectedProduct?.quantity} {selectedProduct?.unit || "cái"}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Quantity Input - Enhanced */}
              <div>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: "0.75rem", color: "#1f2937" }}>
                  🛒 Số Lượng
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "6px",
                      border: "1px solid #e5e7eb",
                      background: "#f9fafb",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "1.2rem",
                    }}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct?.quantity || 999}
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{
                      flex: 1,
                      padding: "0.75rem",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      fontSize: "1rem",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setOrderQuantity(Math.min(selectedProduct?.quantity || 999, orderQuantity + 1))}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "6px",
                      border: "1px solid #e5e7eb",
                      background: "#f9fafb",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "1.2rem",
                    }}
                  >
                    +
                  </button>
                </div>
                <small style={{ color: "#6b7280", marginTop: "0.5rem", display: "block" }}>
                  Tối đa: {selectedProduct?.quantity} {selectedProduct?.unit}
                </small>
              </div>

              {/* Divider */}
              <div style={{ borderTop: "1px solid #e5e7eb" }}></div>

              {/* Shipping Address - Enhanced */}
              <div>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: "0.75rem", color: "#1f2937" }}>
                  📍 Địa Chỉ Giao Hàng *
                </label>

                {!confirmedAddress ? (
                  <>
                    {/* Phone */}
                    <div style={{ marginBottom: "1rem" }}>
                      <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Số Điện Thoại</label>
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Nhập số điện thoại" style={{ width: "100%", padding: "0.6rem", border: "1px solid #e5e7eb", borderRadius: "6px", boxSizing: "border-box" }} />
                    </div>

                    {/* Province */}
                    <div style={{ marginBottom: "1rem" }}>
                      <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Tỉnh / Thành phố *</label>
                      <select value={selectedProvince} onChange={(e) => setSelectedProvince(e.target.value)} disabled={loadingProvinces} style={{ width: "100%", padding: "0.6rem", border: "1px solid #e5e7eb", borderRadius: "6px", cursor: "pointer" }}>
                        <option value="">-- Chọn Tỉnh/Thành phố --</option>
                        {provinces.map((p) => (<option key={p.code} value={p.code}>{p.name}</option>))}
                      </select>
                    </div>

                    {/* District */}
                    <div style={{ marginBottom: "1rem" }}>
                      <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Quận / Huyện *</label>
                      <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} disabled={!selectedProvince || loadingDistricts} style={{ width: "100%", padding: "0.6rem", border: "1px solid #e5e7eb", borderRadius: "6px", cursor: "pointer" }}>
                        <option value="">{loadingDistricts ? "Đang tải..." : "-- Chọn Quận/Huyện --"}</option>
                        {districts.map((d) => (<option key={d.code} value={d.code}>{d.name}</option>))}
                      </select>
                    </div>

                    {/* Ward */}
                    <div style={{ marginBottom: "1rem" }}>
                      <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Phường / Xã *</label>
                      <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)} disabled={!selectedDistrict || loadingWards} style={{ width: "100%", padding: "0.6rem", border: "1px solid #e5e7eb", borderRadius: "6px", cursor: "pointer" }}>
                        <option value="">{loadingWards ? "Đang tải..." : "-- Chọn Phường/Xã --"}</option>
                        {wards.map((w) => (<option key={w.code} value={w.code}>{w.name}</option>))}
                      </select>
                    </div>

                    {/* Detail Address */}
                    <div style={{ marginBottom: "1rem" }}>
                      <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem", fontSize: "0.9rem" }}>Địa Chỉ Chi Tiết *</label>
                      <input type="text" value={detailAddress} onChange={(e) => setDetailAddress(e.target.value)} placeholder="VD: 123 Đường Nguyễn Huệ" style={{ width: "100%", padding: "0.6rem", border: "1px solid #e5e7eb", borderRadius: "6px", boxSizing: "border-box" }} />
                    </div>

                    <button type="button" onClick={handleConfirmAddress} style={{ width: "100%", padding: "0.6rem", background: "#10b981", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", marginBottom: "1rem" }}>
                      ✓ Xác Nhận Địa Chỉ
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ background: "#f0fdf4", border: "2px solid #10b981", borderRadius: "8px", padding: "1rem", marginBottom: "1rem" }}>
                      <p style={{ margin: "0.5rem 0", fontSize: "0.9rem" }}><strong>📱 Số điện thoại:</strong> {confirmedAddress.phone}</p>
                      <p style={{ margin: "0.5rem 0", fontSize: "0.9rem", wordBreak: "break-word" }}><strong>📍 Địa chỉ:</strong> {confirmedAddress.fullAddress}</p>
                    </div>
                    <button type="button" onClick={() => setConfirmedAddress(null)} style={{ width: "100%", padding: "0.6rem", background: "#6b7280", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", marginBottom: "1rem" }}>
                      ✏️ Sửa Địa Chỉ
                    </button>

                    {/* Shipping Carriers */}
                    {shippingCarriers.length > 0 && (
                      <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem", fontSize: "0.9rem" }}>📦 Hãng Vận Chuyển</label>
                        {shippingCarriers.map((carrier) => (
                          <div key={carrier.CarrierCode} onClick={() => { setSelectedShippingCarrier(carrier.CarrierCode); setShippingFee(carrier.TotalCost); }} style={{ padding: "0.75rem", border: selectedShippingCarrier === carrier.CarrierCode ? "2px solid #10b981" : "1px solid #e5e7eb", borderRadius: "6px", background: selectedShippingCarrier === carrier.CarrierCode ? "#f0fdf4" : "white", cursor: "pointer", marginBottom: "0.5rem" }}>
                            <p style={{ margin: 0, fontWeight: "bold", fontSize: "0.9rem" }}>{carrier.CarrierName}</p>
                            <p style={{ margin: "0.25rem 0 0", color: "#6b7280", fontSize: "0.8rem" }}>{carrier.TotalCost.toLocaleString("vi-VN")}đ</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Payment Method */}
                    <div style={{ marginBottom: "1rem" }}>
                      <label style={{ display: "block", fontWeight: "600", marginBottom: "0.5rem", fontSize: "0.9rem" }}>💳 Phương Thức Thanh Toán</label>
                      <select value={selectedPaymentMethod} onChange={(e) => setSelectedPaymentMethod(e.target.value)} style={{ width: "100%", padding: "0.6rem", border: "1px solid #e5e7eb", borderRadius: "6px", cursor: "pointer" }}>
                        <option value="COD">💰 Thanh toán khi nhận hàng (COD)</option>
                        <option value="VIETQR">📱 Viet QR / Chuyển khoản</option>
                        <option value="BANKWIRE">🏦 Chuyển khoản ngân hàng</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* Note - Enhanced */}
              <div>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: "0.75rem", color: "#1f2937" }}>
                  📝 Ghi Chú (Tùy Chọn)
                </label>
                <textarea
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="Ví dụ: ghi chú cụ thể, yêu cầu đặc biệt..."
                  rows={2}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontFamily: "inherit",
                    fontSize: "0.95rem",
                  }}
                />
              </div>

              {/* Divider */}
              <div style={{ borderTop: "1px solid #e5e7eb" }}></div>

              {/* Total Price - Enhanced */}
              <div
                style={{
                  background: "linear-gradient(135deg, #fff7ed 0%, #fffbf0 100%)",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  border: "2px solid #fed7aa",
                  boxShadow: "0 2px 8px rgba(249, 115, 22, 0.1)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem", alignItems: "center" }}>
                  <span style={{ color: "#6b7280", fontSize: "0.95rem" }}>Đơn giá:</span>
                  <span style={{ color: "#6b7280", fontSize: "0.95rem" }}>
                    {(selectedProduct?.price || 0).toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem", alignItems: "center" }}>
                  <span style={{ color: "#6b7280", fontSize: "0.95rem" }}>Số lượng:</span>
                  <span style={{ color: "#6b7280", fontSize: "0.95rem" }}>{orderQuantity}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    borderTop: "2px solid #fed7aa",
                    paddingTop: "0.75rem",
                  }}
                >
                  <span style={{ color: "#1f2937", fontSize: "0.95rem", fontWeight: "600" }}>Tổng cộng:</span>
                  <span
                    style={{
                      fontSize: "1.75rem",
                      fontWeight: "bold",
                      color: "#ef4444",
                    }}
                  >
                    {((selectedProduct?.price || 0) * orderQuantity).toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>

              {/* Action Buttons - Enhanced */}
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="submit"
                  disabled={isCreatingOrder}
                  style={{
                    flex: 1,
                    padding: "1rem",
                    background: isCreatingOrder ? "#d1d5db" : "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    cursor: isCreatingOrder ? "not-allowed" : "pointer",
                    letterSpacing: "0.5px",
                    transition: "all 0.3s ease",
                  }}
                >
                  {isCreatingOrder ? "⏳ Đang xử lý..." : "✓ Xác Nhận Đặt Hàng"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  style={{
                    flex: 1,
                    padding: "1rem",
                    background: "#f3f4f6",
                    color: "#1f2937",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                >
                  ✕ Hủy
                </button>
              </div>
            </form>
          </Modal>
        </>
      )}
      <Footer />
    </div>
  );
};

export default ShelterDetailPage;
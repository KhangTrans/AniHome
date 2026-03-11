import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Phone, Mail, Globe, ArrowLeft, Heart } from "lucide-react";
import AnimalCard from "../../components/AnimalCard";
import Navbar from "../../components/Navbar";
import { getShelterById } from "../../services/public/sheltersService";
import { getPets } from "../../services/public/petsService";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal States
  const [activeModal, setActiveModal] = useState(null);
  const [selectedAnimal, setSelectedAnimal] = useState(null);

  // Donation States
  const [donationAmount, setDonationAmount] = useState(50000);
  const [donationMessage, setDonationMessage] = useState("");
  const [isDonating, setIsDonating] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("vnpay");
  const [qrData, setQrData] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollingIntervalRef = useRef(null);

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

      // Use nested pets from the shelter API if available, else fallback to global pets list
      if (backendShelter.pets && Array.isArray(backendShelter.pets)) {
        const mappedPets = backendShelter.pets.map((pet) => ({
          id: pet.petID,
          name: pet.petName,
          species: pet.categoryName, // Map categoryName to species
          breed: pet.breed,
          image: pet.imageURL,
          status: pet.status,
          description: pet.description || "",
        }));
        setAnimals(mappedPets);
      } else {
        // Fallback: Fetch all animals and filter by shelterId
        const petsResult = await getPets({ page: 1, pageSize: 100 });
        if (petsResult.success) {
          const mappedPets = (petsResult.data.items || []).map((pet) => ({
            id: pet.petID,
            name: pet.petName,
            species: pet.speciesName,
            breed: pet.breedName,
            age: pet.age,
            gender: pet.gender,
            healthStatus: pet.healthStatus,
            description: pet.description,
            image: pet.image,
            shelterId: pet.shelterID,
            status: pet.status,
          }));

          const shelterAnimals = mappedPets.filter(
            (animal) => animal.shelterId === parseInt(id),
          );
          setAnimals(shelterAnimals);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [id, toast]);

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

  const handleDonate = async (e) => {
    e.preventDefault();
    const petID = selectedAnimal?.id;
    const petName = selectedAnimal?.name || "pet này";

    if (!petID) {
      toast.error("Không tìm thấy thông tin pet.");
      return;
    }

    setIsDonating(true);
    try {
      if (paymentMethod === "vnpay") {
        const result = await createVNPayDonation({
          petID,
          userID: getCurrentUserId(),
          amount: donationAmount,
          message: donationMessage || `Ủng hộ cho ${petName}`,
        });
        if (result.success) {
          setActiveModal(null);
          redirectToVNPay(result.data.paymentUrl);
        } else {
          toast.error(result.error);
        }
      } else {
        const result = await createVietQRDonation({
          petID,
          userID: getCurrentUserId(),
          amount: donationAmount,
          message: donationMessage || `Ủng hộ cho ${petName}`,
          donorName: user?.name || "",
        });
        if (result.success) {
          console.log("💰 VietQR Data Received (Shelter Detail):", result.data);
          setQrData(result.data);
          setActiveModal("vietqr_modal");
          startPolling(result.data.transactionID || result.data.TransactionID);
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
                onClick={() => setActiveModal("donate")}
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
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "2rem",
                }}
              >
                <h2 style={{ fontSize: "2rem", fontWeight: "bold" }}>
                  Danh Sách Thú Cưng ({animals.length})
                </h2>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
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
            title={`Quyên góp cho ${selectedAnimal?.name}`}
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
                Đóng góp của bạn giúp cung cấp thức ăn và y tế cho{" "}
                <strong>{selectedAnimal?.name}</strong>.
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
        </>
      )}
      <Footer />
    </div>
  );
};

export default ShelterDetailPage;

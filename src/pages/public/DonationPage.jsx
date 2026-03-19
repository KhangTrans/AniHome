import { useState, useRef, useEffect, useCallback } from "react";
import { useToast } from "../../context/ToastContext";
import {
  createVNPayDonation,
  createVietQRDonation,
  checkVietQRStatus,
  validateDonationForm,
  DONATION_PRESETS,
  formatCurrencyVND,
  parseCurrencyInput,
  getDonationImpactMessage,
} from "../../services/public/donationService";
import { getPetById } from "../../services/public/petsService";
import { getShelterById } from "../../services/public/sheltersService";
import {
  Heart,
  CreditCard,
  Mail,
  Phone,
  User,
  QrCode,
  Copy,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  ExternalLink,
  ChevronLeft,
  RotateCcw
} from "lucide-react";
import { Modal, Spin, Typography, Space, Divider, Tag, Button } from "antd";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const { Title: AntTitle, Text } = Typography;

/**
 * TRANG QUYÊN GÓP (DONATION PAGE)
 * Hỗ trợ Quyên góp qua VNPay và VietQR (Quét mã tự động)
 */
export default function DonationPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URL Params
  const petID = searchParams.get("petID");
  const shelterID = searchParams.get("shelterID");
  const status = searchParams.get("status");
  const paymentCode = searchParams.get("code");
  const cancelParam = searchParams.get("cancel");
  const orderCode = searchParams.get("id");

  // Determine payment status based on PayOS response
  const isPaymentSuccess = status === "PAID" && paymentCode === "00" && cancelParam === "false";
  const isPaymentFailed = cancelParam === "true" || paymentCode !== "00";
  const paymentStatus = isPaymentSuccess ? "success" : isPaymentFailed ? "failed" : null;

  const [formData, setFormData] = useState({
    amount: "",
    donorName: "",
    donorEmail: "",
    donorPhone: "",
    message: "",
    petID: petID || null,
    shelterID: shelterID || null,
  });

  const [targetInfo, setTargetInfo] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [customAmount, setCustomAmount] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("vietqr"); // Default to vietqr as requested

  // VietQR Modal States
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [polling, setPolling] = useState(false);
  const pollingIntervalRef = useRef(null);
  const pollingTimeoutRef = useRef(null);

  // Fetch target info (Pet or Shelter)
  useEffect(() => {
    const fetchTargetInfo = async () => {
      if (petID) {
        const result = await getPetById(petID);
        if (result.success) setTargetInfo({ type: 'pet', name: result.data.petName, image: result.data.imageURL });
      } else if (shelterID) {
        const result = await getShelterById(shelterID);
        if (result.success) setTargetInfo({ type: 'shelter', name: result.data.shelterName, image: result.data.imageURL });
      }
    };
    fetchTargetInfo();
  }, [petID, shelterID]);

  const handlePresetAmount = (amount) => {
    setFormData((prev) => ({ ...prev, amount }));
    setCustomAmount(false);
    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: null }));
    }
  };

  const handleCustomAmountChange = (e) => {
    const value = parseCurrencyInput(e.target.value);
    setFormData((prev) => ({ ...prev, amount: value }));
    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: null }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validation = validateDonationForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error("Vui lòng kiểm tra lại thông tin quyên góp");
      return;
    }

    setLoading(true);

    if (paymentMethod === "vnpay") {
      const result = await createVNPayDonation(formData);
      setLoading(false);
      if (result.success) {
        window.location.href = result.data.paymentUrl;
      } else {
        toast.error(result.error || "Không thể tạo liên kết thanh toán. Vui lòng thử lại.");
      }
    } else {
      const result = await createVietQRDonation(formData);
      setLoading(false);

      if (result.success) {
        window.location.href = result.data.qrImageUrl;
      } else {
        toast.error(result.error || "Không thể tạo mã QR. Vui lòng thử lại.");
      }
    }
  };

  // Polling logic for VietQR
  const startPolling = useCallback((transactionID) => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);

    setPolling(true);
    const interval = setInterval(async () => {
      const result = await checkVietQRStatus(transactionID);
      if (result.success && result.data?.status === "Success") {
        clearInterval(interval);
        clearTimeout(pollingTimeoutRef.current);
        pollingIntervalRef.current = null;
        setPolling(false);
        setQrModalVisible(false);
        toast.success("Thanh toán thành công! Cảm ơn bạn đã quyên góp.");
        navigate("/donation/success");
      }
    }, 5000); // Polling every 5s for better UX

    pollingIntervalRef.current = interval;

    // Timeout after 15 minutes
    pollingTimeoutRef.current = setTimeout(() => {
      clearInterval(pollingIntervalRef.current);
      setPolling(false);
      toast.warning("Hết thời gian chờ giao dịch. Nếu bạn đã chuyển khoản, hãy liên hệ admin.");
    }, 900000);
  }, [navigate, toast]);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (pollingTimeoutRef.current) clearTimeout(pollingTimeoutRef.current);
    };
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép vào bộ nhớ tạm");
  };

  return (
    <div className="donation-page-wrapper">
      <Navbar />

      {/* Success Page */}
      {paymentStatus === "success" && (
        <div
          style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            padding: "80px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "24px",
              padding: "60px 40px",
              textAlign: "center",
              maxWidth: "500px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                background: "#f0fdf4",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <CheckCircle2 size={48} color="#16a34a" />
            </div>
            <h1 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "10px", color: "#1e293b" }}>
              Thanh Toán Thành Công!
            </h1>
            <p style={{ fontSize: "1.1rem", color: "#64748b", marginBottom: "30px", lineHeight: "1.6" }}>
              Cảm ơn bạn đã quyên góp cho những bé thú cưng cần được chăm sóc. Quyên góp của bạn sẽ mang lại cơ hội sống tốt hơn cho chúng!
            </p>
            <Link
              to="/pets"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 28px",
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                color: "white",
                textDecoration: "none",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "1rem",
              }}
            >
              <ArrowRight size={20} /> Quay lại danh sách thú cưng
            </Link>
          </div>
        </div>
      )}

      {/* Failed Page */}
      {paymentStatus === "failed" && (
        <div
          style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            padding: "80px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "24px",
              padding: "60px 40px",
              textAlign: "center",
              maxWidth: "500px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                background: "#fef2f2",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <Heart size={48} color="#ef4444" />
            </div>
            <h1 style={{ fontSize: "2rem", fontWeight: "800", marginBottom: "10px", color: "#1e293b" }}>
              Giao Dịch Thất Bại
            </h1>
            <p style={{ fontSize: "1.1rem", color: "#64748b", marginBottom: "30px", lineHeight: "1.6" }}>
              Rất tiếc, giao dịch của bạn không thành công. Vui lòng kiểm tra lại thông tin và thử lại, hoặc liên hệ admin nếu gặp vấn đề.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <Link
                to="/donation"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "14px 28px",
                  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "12px",
                  fontWeight: "700",
                  fontSize: "1rem",
                }}
              >
                <RotateCcw size={20} /> Thử Lại
              </Link>
              <Link
                to="/pets"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "14px 28px",
                  background: "white",
                  color: "#4f46e5",
                  border: "2px solid #4f46e5",
                  textDecoration: "none",
                  borderRadius: "12px",
                  fontWeight: "700",
                  fontSize: "1rem",
                }}
              >
                <ChevronLeft size={20} /> Về Trang Chủ
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Donation Form (default when no status) */}
      {!paymentStatus && (
        <div
          style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            padding: "80px 20px",
          }}
        >
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            {/* Header section */}
            <div style={{ textAlign: "center", marginBottom: "40px", color: "white" }}>
              <div style={{
                width: "80px",
                height: "80px",
                background: "rgba(255,255,255,0.2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px"
              }}>
                <Heart size={40} fill="white" color="white" />
              </div>
              <h1 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "10px", letterSpacing: "-0.5px" }}>
                Tiếp Sức Cho Những Ước Mơ
              </h1>
              <p style={{ fontSize: "1.2rem", opacity: 0.9, maxWidth: "600px", margin: "0 auto" }}>
                Mỗi đóng góp của bạn, dù nhỏ nhất, cũng mang lại cơ hội sống và mái ấm mới cho các bé thú cưng.
              </p>
            </div>

            <div style={{
              background: "white",
              borderRadius: "24px",
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
            }}>
              {/* Target Display if applicable */}
              {targetInfo && (
                <div style={{
                  background: "#f8fafc",
                  padding: "20px 40px",
                  borderBottom: "1px solid #e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  gap: "15px"
                }}>
                  <div style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "15px",
                    overflow: "hidden",
                    border: "2px solid white",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)"
                  }}>
                    <img src={targetInfo.image} alt={targetInfo.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: "0.85rem", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.5px" }}>
                      Bạn đang quyên góp cho:
                    </Text>
                    <AntTitle level={4} style={{ margin: 0, color: "#1e293b" }}>{targetInfo.name}</AntTitle>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ padding: "40px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
                  {/* Left Side: Amount and Info */}
                  <div>
                    <SectionTitle icon={<Zap size={20} color="#f59e0b" />} title="Số tiền quyên góp" />

                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                      marginBottom: "15px"
                    }}>
                      {DONATION_PRESETS.map((preset) => (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => handlePresetAmount(preset.value)}
                          style={{
                            padding: "14px",
                            border: formData.amount === preset.value && !customAmount ? "2.5px solid #4f46e5" : "2px solid #e2e8f0",
                            background: formData.amount === preset.value && !customAmount ? "#eef2ff" : "white",
                            color: formData.amount === preset.value && !customAmount ? "#4f46e5" : "#64748b",
                            borderRadius: "14px",
                            fontWeight: "700",
                            cursor: "pointer",
                            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          }}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    <div style={{ marginBottom: "25px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                        <input
                          type="checkbox"
                          id="custom-check"
                          checked={customAmount}
                          onChange={(e) => setCustomAmount(e.target.checked)}
                          style={{ width: "18px", height: "18px", cursor: "pointer" }}
                        />
                        <label htmlFor="custom-check" style={{ fontWeight: "600", fontSize: "0.95rem", color: "#475569", cursor: "pointer" }}>Nhập số tiền khác</label>
                      </div>

                      {customAmount && (
                        <div style={{ position: "relative" }}>
                          <input
                            type="text"
                            value={formData.amount ? formatCurrencyVND(formData.amount) : ""}
                            onChange={handleCustomAmountChange}
                            placeholder="Ví dụ: 1,000,000"
                            style={{
                              width: "100%",
                              padding: "14px 45px 14px 18px",
                              border: errors.amount ? "2px solid #ef4444" : "2px solid #e2e8f0",
                              borderRadius: "14px",
                              fontSize: "1.1rem",
                              fontWeight: "600",
                              outline: "none",
                              transition: "border-color 0.2s",
                            }}
                          />
                          <span style={{ position: "absolute", right: "18px", top: "50%", transform: "translateY(-50%)", fontWeight: "700", color: "#94a3b8" }}>VNĐ</span>
                        </div>
                      )}
                      {errors.amount && <p style={{ color: "#ef4444", fontSize: "0.85rem", marginTop: "8px", fontWeight: "500" }}>{errors.amount}</p>}
                    </div>

                    {formData.amount > 0 && (
                      <div style={{
                        padding: "16px",
                        background: "#f0fdf4",
                        borderRadius: "14px",
                        border: "1px solid #bbf7d0",
                        color: "#166534",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "30px",
                        fontSize: "0.95rem"
                      }}>
                        <div style={{ background: "#4ade80", padding: "6px", borderRadius: "50%" }}><CheckCircle2 size={16} color="white" /></div>
                        <span style={{ fontWeight: "600" }}>{getDonationImpactMessage(formData.amount)}</span>
                      </div>
                    )}

                    <SectionTitle icon={<User size={20} color="#4f46e5" />} title="Thông tin người gửi" />
                    <InputField icon={<User size={18} />} name="donorName" value={formData.donorName} onChange={handleInputChange} placeholder="Họ và tên của bạn *" error={errors.donorName} />
                    <InputField icon={<Mail size={18} />} name="donorEmail" value={formData.donorEmail} onChange={handleInputChange} placeholder="Địa chỉ Email *" error={errors.donorEmail} />
                    <InputField icon={<Phone size={18} />} name="donorPhone" value={formData.donorPhone} onChange={handleInputChange} placeholder="Số điện thoại (tùy chọn)" />
                  </div>

                  {/* Right Side: Message and Payment */}
                  <div>
                    <SectionTitle icon={<Mail size={20} color="#7c3aed" />} title="Lời tâm tình gửi gắm" />
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Gửi gắm lời chúc hoặc yêu cầu của bạn đến các bé thú cưng và trạm cứu hộ..."
                      rows={6}
                      style={{
                        width: "100%",
                        padding: "16px",
                        border: "2px solid #e2e8f0",
                        borderRadius: "18px",
                        fontSize: "1rem",
                        resize: "none",
                        marginBottom: "30px",
                        outline: "none",
                        transition: "border-color 0.2s",
                      }}
                    />

                    <SectionTitle icon={<CreditCard size={20} color="#ec4899" />} title="Phương thức thanh toán" />
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "35px" }}>
                      <PaymentMethodCard
                        id="vietqr"
                        selected={paymentMethod === "vietqr"}
                        onClick={() => setPaymentMethod("vietqr")}
                        icon={<QrCode size={24} />}
                        title="VietQR (Chuyển khoản tự động)"
                        desc="Hệ thống xác nhận ngay sau 1-5s"
                        badge="Khuyên dùng"
                      />
                      <PaymentMethodCard
                        id="vnpay"
                        selected={paymentMethod === "vnpay"}
                        onClick={() => setPaymentMethod("vnpay")}
                        icon={<ShieldCheck size={24} />}
                        title="Ví VNPay / Thẻ ATM"
                        desc="Thanh toán qua cổng VNPay"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        width: "100%",
                        padding: "20px",
                        background: loading ? "#94a3b8" : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: "18px",
                        fontSize: "1.2rem",
                        fontWeight: "800",
                        cursor: loading ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "12px",
                        boxShadow: "0 10px 15px -3px rgba(79, 70, 229, 0.4)",
                        transition: "transform 0.2s",
                      }}
                      onMouseEnter={e => !loading && (e.currentTarget.style.transform = "translateY(-2px)")}
                      onMouseLeave={e => !loading && (e.currentTarget.style.transform = "translateY(0)")}
                    >
                      {loading ? <Spin size="small" /> : <><Heart size={22} fill="white" /> Gửi Quyên Góp Ngay</>}
                    </button>
                  </div>
                </div>
              </form>

              <div style={{ padding: "20px", background: "#f1f5f9", textAlign: "center", borderTop: "1px solid #e2e8f0" }}>
                <Space split={<Divider type="vertical" />}>
                  <Text type="secondary"><ShieldCheck size={14} style={{ marginRight: 4 }} /> Bảo mật tuyệt đối</Text>
                  <Text type="secondary"><CheckCircle2 size={14} style={{ marginRight: 4 }} /> Minh bạch 100%</Text>
                  <Text type="secondary"><Zap size={14} style={{ marginRight: 4 }} /> Xử lý tự động</Text>
                </Space>
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: "40px" }}>
              <Link to="/pets" style={{ color: "white", textDecoration: "none", opacity: 0.8, display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <ChevronLeft size={20} /> Quay lại danh sách thú cưng
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Improved VietQR Modal */}
      <Modal
        title={null}
        open={qrModalVisible}
        onCancel={() => setQrModalVisible(false)}
        footer={null}
        width={480}
        centered
        styles={{ body: { padding: 0, overflow: "hidden", borderRadius: "24px" } }}
      >
        <div style={{ padding: "32px", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
            <div style={{
              padding: "10px 16px",
              background: "#f0f9ff",
              borderRadius: "30px",
              border: "1px solid #bae6fd",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#0369a1",
              fontSize: "0.85rem",
              fontWeight: "700"
            }}>
              <Zap size={14} fill="#0369a1" /> XỬ LÝ TỰ ĐỘNG QUA CASSO
            </div>
          </div>

          <AntTitle level={3} style={{ marginBottom: "8px" }}>Quét Mã Chuyển Khoản</AntTitle>
          <p style={{ color: "#64748b", fontSize: "0.95rem", marginBottom: "24px" }}>
            Hệ thống sẽ tự nhận diện giao dịch của bạn ngay lập tức
          </p>

          <div style={{
            background: "white",
            padding: "15px",
            borderRadius: "24px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            border: "1px solid #f1f5f9",
            marginBottom: "24px",
            position: "relative"
          }}>
            {qrData?.qrImageUrl || qrData?.QrImageUrl ? (
              <div style={{ position: "relative" }}>
                <img src={qrData.qrImageUrl || qrData.QrImageUrl} alt="VietQR" style={{ width: "100%", height: "auto", display: "block", borderRadius: "12px" }} />
                {/* Logo overlay or scanning line animation could go here */}
              </div>
            ) : (
              <div style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}><Spin size="large" /></div>
            )}
          </div>

          <div style={{
            background: "#f8fafc",
            padding: "16px",
            borderRadius: "20px",
            marginBottom: "24px",
            textAlign: "left",
            border: "1px solid #e2e8f0"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
              <div>
                <Text type="secondary" style={{ fontSize: "0.75rem", fontWeight: "700" }}>SỐ TIỀN</Text>
                <p style={{ fontSize: "1.1rem", fontWeight: "800", margin: 0, color: "#4f46e5" }}>{qrData?.amount?.toLocaleString() || formData.amount.toLocaleString()} VNĐ</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <Text type="secondary" style={{ fontSize: "0.75rem", fontWeight: "700" }}>MÃ GIAO DỊCH</Text>
                <p style={{ fontSize: "1.1rem", fontWeight: "800", margin: 0 }}>#{qrData?.transactionID || qrData?.TransactionID}</p>
              </div>
            </div>
            <Divider style={{ margin: "12px 0" }} />
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <div>
                  <Text type="secondary" style={{ fontSize: "0.75rem", fontWeight: "700" }}>NỘI DUNG CHUYỂN KHOẢN</Text>
                  <p style={{ fontSize: "1rem", fontWeight: "700", margin: 0, color: "#1e293b", letterSpacing: "1px" }}>{qrData?.transferMessage || qrData?.TransferMessage}</p>
                </div>
                <Button
                  type="primary"
                  size="small"
                  icon={<Copy size={12} />}
                  onClick={() => copyToClipboard(qrData?.transferMessage || qrData?.TransferMessage)}
                  style={{ background: "#4f46e5", borderRadius: "8px" }}
                >
                  Sao chép
                </Button>
              </div>
            </div>
          </div>

          <div style={{
            background: "#f0fdf4",
            padding: "16px",
            borderRadius: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            alignItems: "center",
            marginBottom: "24px",
            border: "1px solid #dcfce7"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#166534", fontWeight: "700" }}>
              <Spin size="small" indicator={<Clock size={16} className="animate-spin" />} />
              <span>Đang chờ bạn thực hiện thanh toán...</span>
            </div>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#15803d", opacity: 0.8 }}>
              Vui lòng <u>không</u> tắt cửa sổ này cho tới khi có thông báo thành công.
            </p>
          </div>

          <Space direction="vertical" style={{ width: "100%" }}>
            <Button
              onClick={() => setQrModalVisible(false)}
              block
              style={{ height: "50px", borderRadius: "14px", fontWeight: "700", background: "#f1f5f9", border: "none" }}
            >
              Hủy giao dịch
            </Button>
          </Space>

          <div style={{ marginTop: "24px", color: "#94a3b8", fontSize: "0.8rem", textAlign: "left" }}>
            <Text strong style={{ fontSize: "0.75rem", display: "block", marginBottom: "4px" }}>📌 LƯU Ý QUAN TRỌNG:</Text>
            <ul style={{ paddingLeft: "15px", margin: 0 }}>
              <li>Quét đúng mã QR để hệ thống tự động nhận diện chính xác số tiền và nội dung.</li>
              <li>Nếu bạn chuyển khoản thủ công, hãy nhập <b>chính xác</b> nội dung phía trên.</li>
              <li>Giao dịch thường được xác nhận trong vòng 10-30 giây sau khi ngân hàng báo trừ tiền.</li>
            </ul>
          </div>
        </div>
      </Modal>
      <Footer />
    </div>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
      <div style={{ padding: "8px", background: "#f1f5f9", borderRadius: "10px" }}>{icon}</div>
      <h3 style={{ fontSize: "1.1rem", fontWeight: "800", margin: 0, color: "#1e293b", letterSpacing: "-0.3px" }}>{title}</h3>
    </div>
  );
}

function PaymentMethodCard({ id, selected, onClick, icon, title, desc, badge }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "16px",
        border: selected ? "2.5px solid #4f46e5" : "2px solid #e2e8f0",
        background: selected ? "#eef2ff" : "white",
        borderRadius: "20px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "15px",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        boxShadow: selected ? "0 4px 12px rgba(79, 70, 229, 0.1)" : "none",
      }}
    >
      <div style={{
        width: "50px",
        height: "50px",
        background: selected ? "white" : "#f1f5f9",
        borderRadius: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: selected ? "#4f46e5" : "#64748b"
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontWeight: "700", color: selected ? "#1e293b" : "#475569" }}>{title}</span>
          {badge && <Tag color="gold" style={{ border: "none", borderRadius: "6px", fontSize: "0.7rem", fontWeight: "800" }}>{badge}</Tag>}
        </div>
        <p style={{ margin: "2px 0 0 0", fontSize: "0.85rem", color: "#94a3b8", fontWeight: "500" }}>{desc}</p>
      </div>
      {selected && (
        <div style={{ width: "22px", height: "22px", background: "#4f46e5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CheckCircle2 size={14} color="white" />
        </div>
      )}
    </div>
  );
}

function InputField({ icon, error, ...props }) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>{icon}</div>
        <input
          {...props}
          style={{
            width: "100%",
            padding: "14px 14px 14px 48px",
            border: error ? "2px solid #ef4444" : "2px solid #e2e8f0",
            borderRadius: "14px",
            fontSize: "1rem",
            fontWeight: "500",
            outline: "none",
            transition: "all 0.2s",
          }}
          onFocus={e => (e.target.style.borderColor = "#4f46e5")}
          onBlur={e => (e.target.style.borderColor = error ? "#ef4444" : "#e2e8f0")}
        />
      </div>
      {error && <p style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "6px", fontWeight: "500", paddingLeft: "4px" }}>{error}</p>}
    </div>
  );
}

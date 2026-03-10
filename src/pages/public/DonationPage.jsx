import { useState, useRef } from "react";
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
} from "lucide-react";
import { Modal, Spin } from "antd";
import { useNavigate } from "react-router-dom";

/**
 * DONATION PAGE
 * Trang quyên góp với VNPay payment
 */
export default function DonationPage() {
  const toast = useToast();
  const [formData, setFormData] = useState({
    amount: "",
    donorName: "",
    donorEmail: "",
    donorPhone: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [customAmount, setCustomAmount] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("vnpay"); // 'vnpay' or 'vietqr'

  // VietQR Modal States
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [polling, setPolling] = useState(false);
  const pollingIntervalRef = useRef(null);
  const navigate = useNavigate();
  // The following block was incorrectly placed and is removed as per the instruction's implied correction.
  // const pollingRef = (function () {
  //   try {
  //     return require("react").useRef(null);
  //   } catch (e) {
  //     return { current: null };
  //   }
  // })();

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
      return;
    }

    setLoading(true);

    if (paymentMethod === "vnpay") {
      // Create VNPay payment
      const result = await createVNPayDonation(formData);
      setLoading(false);

      if (result.success) {
        window.location.href = result.data.paymentUrl;
      } else {
        toast.error(
          result.error || "Failed to create payment. Please try again.",
        );
      }
    } else {
      // Create VietQR payment
      const result = await createVietQRDonation(formData);
      setLoading(false);

      if (result.success) {
        console.log("💰 VietQR Data Received:", result.data);
        setQrData(result.data);
        setQrModalVisible(true);
        startPolling(result.data.transactionID || result.data.TransactionID);
      } else {
        toast.error(
          result.error || "Failed to create QR code. Please try again.",
        );
      }
    }
  };

  // Polling logic for VietQR
  const startPolling = (transactionID) => {
    // Clear any previous interval to prevent leaks
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    setPolling(true);
    const interval = setInterval(async () => {
      const result = await checkVietQRStatus(transactionID);
      if (result.success && result.data?.status === "Success") {
        clearInterval(interval);
        pollingIntervalRef.current = null;
        setPolling(false);
        setQrModalVisible(false);
        toast.success("Thanh toán thành công! Cảm ơn bạn đã quyên góp.");
        navigate("/donation/success");
      }
    }, 10000); // 10 seconds

    pollingIntervalRef.current = interval;

    // Stop polling after 10 minutes
    setTimeout(() => {
      if (pollingIntervalRef.current === interval) {
        clearInterval(interval);
        pollingIntervalRef.current = null;
        setPolling(false);
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
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "60px 20px",
      }}
    >
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{ textAlign: "center", marginBottom: "40px", color: "white" }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "20px" }}>💰</div>
          <h1 style={{ fontSize: "2.5rem", marginBottom: "15px" }}>
            Make a Donation
          </h1>
          <p style={{ fontSize: "1.1rem", opacity: 0.9 }}>
            Help us rescue and care for animals in need
          </p>
        </div>

        {/* Form Card */}
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "40px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* Amount Selection */}
            <div style={{ marginBottom: "30px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  marginBottom: "15px",
                }}
              >
                Select Amount
              </label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "10px",
                  marginBottom: "15px",
                }}
              >
                {DONATION_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handlePresetAmount(preset.value)}
                    style={{
                      padding: "16px",
                      border:
                        formData.amount === preset.value && !customAmount
                          ? "2px solid #3b82f6"
                          : "2px solid #e5e7eb",
                      background:
                        formData.amount === preset.value && !customAmount
                          ? "#dbeafe"
                          : "white",
                      borderRadius: "12px",
                      fontSize: "1rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                    fontSize: "0.9rem",
                    color: "#666",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={customAmount}
                    onChange={(e) => setCustomAmount(e.target.checked)}
                  />
                  Custom Amount
                </label>

                {customAmount && (
                  <input
                    type="text"
                    value={
                      formData.amount ? formatCurrencyVND(formData.amount) : ""
                    }
                    onChange={handleCustomAmountChange}
                    placeholder="Enter custom amount..."
                    style={{
                      width: "100%",
                      padding: "14px",
                      border: errors.amount
                        ? "2px solid #ef4444"
                        : "2px solid #e5e7eb",
                      borderRadius: "12px",
                      fontSize: "1rem",
                    }}
                  />
                )}
              </div>

              {errors.amount && (
                <p
                  style={{
                    color: "#ef4444",
                    fontSize: "0.9rem",
                    marginTop: "8px",
                  }}
                >
                  {errors.amount}
                </p>
              )}

              {/* Impact Message */}
              {formData.amount && (
                <div
                  style={{
                    marginTop: "15px",
                    padding: "12px",
                    background: "#f0fdf4",
                    borderRadius: "8px",
                    color: "#15803d",
                    fontSize: "0.95rem",
                    textAlign: "center",
                    fontWeight: "500",
                  }}
                >
                  {getDonationImpactMessage(formData.amount)}
                </div>
              )}
            </div>

            {/* Payment Method Selection */}
            <div style={{ marginBottom: "30px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  marginBottom: "15px",
                }}
              >
                Payment Method
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setPaymentMethod("vnpay")}
                  style={{
                    padding: "16px",
                    border:
                      paymentMethod === "vnpay"
                        ? "2px solid #3b82f6"
                        : "2px solid #e5e7eb",
                    background: paymentMethod === "vnpay" ? "#eff6ff" : "white",
                    borderRadius: "12px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    transition: "0.2s",
                  }}
                >
                  <CreditCard
                    color={paymentMethod === "vnpay" ? "#3b82f6" : "#6b7280"}
                    size={24}
                  />
                  <span
                    style={{
                      fontWeight: "500",
                      color: paymentMethod === "vnpay" ? "#1e40af" : "#4b5563",
                    }}
                  >
                    VNPay
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("vietqr")}
                  style={{
                    padding: "16px",
                    border:
                      paymentMethod === "vietqr"
                        ? "2px solid #3b82f6"
                        : "2px solid #e5e7eb",
                    background:
                      paymentMethod === "vietqr" ? "#eff6ff" : "white",
                    borderRadius: "12px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    transition: "0.2s",
                  }}
                >
                  <QrCode
                    color={paymentMethod === "vietqr" ? "#3b82f6" : "#6b7280"}
                    size={24}
                  />
                  <span
                    style={{
                      fontWeight: "500",
                      color: paymentMethod === "vietqr" ? "#1e40af" : "#4b5563",
                    }}
                  >
                    VietQR (Casso)
                  </span>
                </button>
              </div>
            </div>

            {/* Donor Information */}
            <div style={{ marginBottom: "25px" }}>
              <h3
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  marginBottom: "15px",
                }}
              >
                Your Information
              </h3>

              <InputField
                icon={<User size={20} />}
                name="donorName"
                value={formData.donorName}
                onChange={handleInputChange}
                placeholder="Full Name *"
                error={errors.donorName}
              />

              <InputField
                icon={<Mail size={20} />}
                name="donorEmail"
                type="email"
                value={formData.donorEmail}
                onChange={handleInputChange}
                placeholder="Email Address *"
                error={errors.donorEmail}
              />

              <InputField
                icon={<Phone size={20} />}
                name="donorPhone"
                value={formData.donorPhone}
                onChange={handleInputChange}
                placeholder="Phone Number (optional)"
                error={errors.donorPhone}
              />

              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Leave a message (optional)"
                rows={4}
                style={{
                  width: "100%",
                  padding: "14px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "18px",
                background: loading
                  ? "#9ca3af"
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "1.1rem",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  <CreditCard size={22} />
                  Proceed to Payment
                </>
              )}
            </button>
          </form>

          {/* Security Note */}
          <div
            style={{
              marginTop: "25px",
              padding: "15px",
              background: "#f3f4f6",
              borderRadius: "12px",
              fontSize: "0.85rem",
              color: "#666",
              textAlign: "center",
            }}
          >
            🔒 Secure payment powerd by Cassos & VNPay
          </div>
        </div>
      </div>

      {/* VietQR Modal */}
      <Modal
        title={null}
        open={qrModalVisible}
        onCancel={() => setQrModalVisible(false)}
        footer={null}
        width={450}
        centered
        styles={{ body: { padding: "24px" } }}
      >
        <div style={{ textAlign: "center" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              marginBottom: "8px",
              color: "#1f2937",
            }}
          >
            Quét mã để ủng hộ
          </h2>
          <p style={{ color: "#6b7280", marginBottom: "24px" }}>
            Sử dụng ứng dụng ngân hàng hoặc ví điện tử để quét mã
          </p>

          <div
            style={{
              background: "white",
              padding: "16px",
              borderRadius: "16px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              marginBottom: "24px",
              position: "relative",
            }}
          >
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
                  src={qrData.qrImageUrl || qrData.QrImageUrl}
                  alt="QR"
                  referrerPolicy="no-referrer"
                  style={{ width: "100%", display: "block" }}
                  onError={(e) => {
                    e.target.style.display = "none";
                    const manualDiv = document.getElementById(
                      "manual-payment-shelter",
                    );
                    if (manualDiv) manualDiv.style.display = "block";
                  }}
                />
              ) : (
                <Spin size="large" />
              )}

              <div
                id="manual-payment-shelter"
                style={{
                  display:
                    qrData?.qrImageUrl || qrData?.QrImageUrl ? "none" : "block",
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
                    padding: "1rem",
                    borderRadius: "1rem",
                    border: "1px dashed #cbd5e1",
                  }}
                >
                  <p
                    style={{
                      color: "#ef4444",
                      fontWeight: "600",
                      marginBottom: "8px",
                    }}
                  >
                    ⚠️ Không thể hiển thị QR
                  </p>
                  <p style={{ fontSize: "0.9rem", marginBottom: "4px" }}>
                    Ngân hàng: <strong>MB Bank</strong>
                  </p>
                  <p style={{ fontSize: "0.9rem", marginBottom: "4px" }}>
                    STK: <strong>130072004</strong>
                  </p>
                  <p style={{ fontSize: "0.9rem", marginBottom: "4px" }}>
                    Chủ TK: <strong>NGUYEN HOANG SANG</strong>
                  </p>
                  <p style={{ fontSize: "0.9rem", marginBottom: "12px" }}>
                    Số tiền:{" "}
                    <strong>{formData.amount.toLocaleString()} VNĐ</strong>
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        qrData?.qrImageUrl || qrData?.QrImageUrl,
                        "_blank",
                      )
                    }
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      background: "#3b82f6",
                      color: "white",
                      border: "none",
                      borderRadius: "0.5rem",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    Mở Mã QR Tab Mới ↗
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "24px",
              textAlign: "left",
            }}
          >
            <div
              style={{
                fontSize: "0.85rem",
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
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: "#1e293b",
                  letterSpacing: "1px",
                }}
              >
                {qrData?.transferMessage ||
                  qrData?.TransferMessage ||
                  "Đang tải..."}
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
                  borderRadius: "8px",
                  padding: "8px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "0.85rem",
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
              padding: "12px",
              borderRadius: "12px",
              fontSize: "0.9rem",
              marginBottom: "24px",
            }}
          >
            <Spin size="small" spinning={polling} />
            <span>Hệ thống đang chờ bạn chuyển khoản...</span>
          </div>

          <button
            onClick={() => setQrModalVisible(false)}
            style={{
              width: "100%",
              padding: "14px",
              background: "#1e293b",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Tôi đã chuyển khoản
          </button>
        </div>
      </Modal>
    </div>
  );
}

/**
 * Input Field Component
 */
function InputField({ icon, error, ...props }) {
  return (
    <div style={{ marginBottom: "15px" }}>
      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            left: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#9ca3af",
          }}
        >
          {icon}
        </div>
        <input
          {...props}
          style={{
            width: "100%",
            padding: "14px 14px 14px 50px",
            border: error ? "2px solid #ef4444" : "2px solid #e5e7eb",
            borderRadius: "12px",
            fontSize: "1rem",
          }}
        />
      </div>
      {error && (
        <p style={{ color: "#ef4444", fontSize: "0.85rem", marginTop: "5px" }}>
          {error}
        </p>
      )}
    </div>
  );
}

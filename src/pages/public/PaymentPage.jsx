import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    CreditCard,
    DollarSign,
    Home,
    ArrowLeft,
    CheckCircle,
    AlertCircle,
    Loader,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

const PaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();
    const { user } = useAuth();

    // Get order data from location state
    const {
        items = [],
        address = null,
        shippingCarrier = "",
        shippingFee = 0,
        paymentMethod = "COD",
        total = 0,
    } = location.state || {};

    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(paymentMethod);
    const [isProcessing, setIsProcessing] = useState(false);
    const [bankDetails, setBankDetails] = useState({
        bankName: "",
        accountNumber: "",
        accountOwner: "",
    });

    // Validate order data
    if (!items.length || !address) {
        return (
            <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
                <Navbar />
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
                    <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "2rem", textAlign: "center", maxWidth: "500px" }}>
                        <AlertCircle size={48} color="#ef4444" style={{ margin: "0 auto 1rem" }} />
                        <p style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "1rem" }}>
                            Dữ liệu đơn hàng bị mất!
                        </p>
                        <p style={{ color: "#666", marginBottom: "2rem" }}>
                            Vui lòng quay lại giỏ hàng để kiểm tra thông tin.
                        </p>
                        <button
                            onClick={() => navigate("/cart")}
                            style={{
                                padding: "0.75rem 2rem",
                                background: "#3b82f6",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: "bold",
                            }}
                        >
                            ← Quay Lại Giỏ Hàng
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const handlePayment = async () => {
        // Validate payment method
        if (selectedPaymentMethod === "BANKWIRE" && (!bankDetails.bankName || !bankDetails.accountNumber)) {
            toast.error("Vui lòng điền đầy đủ thông tin ngân hàng!");
            return;
        }

        setIsProcessing(true);

        try {
            // Simulate payment processing
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Generate Order ID
            const orderId = `HP${Date.now()}`;

            // Create order object
            const orderData = {
                orderId,
                items,
                address,
                shippingCarrier,
                shippingFee,
                paymentMethod: selectedPaymentMethod,
                total,
                createdAt: new Date().toISOString(),
            };

            // TODO: Send to backend API
            console.log("Order created:", orderData);

            // Navigate to confirmation page
            navigate("/order-confirmation", {
                state: {
                    orderId,
                    items,
                    shippingAddress: address.fullAddress,
                    phone: address.phone,
                    paymentMethod: selectedPaymentMethod,
                    total,
                    shippingFee,
                },
            });

            toast.success("Thanh toán thành công!");
        } catch (error) {
            console.error("Payment error:", error);
            toast.error("Thanh toán thất bại. Vui lòng thử lại.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Navbar />

            {/* Header */}
            <div style={{ padding: "1.5rem 1rem" }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                    <h1 style={{ fontSize: "2rem", fontWeight: "bold", margin: 0, display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <CreditCard size={32} /> Thanh Toán
                    </h1>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, maxWidth: "1200px", margin: "0 auto", padding: "2rem 1rem", width: "100%" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "2rem" }}>
                    {/* Left Column - Payment Methods */}
                    <div>
                        {/* Payment Methods */}
                        <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "1.5rem" }}>
                            <h2 style={{ fontSize: "1.1rem", fontWeight: "bold", margin: "0 0 1.5rem" }}>
                                Chọn Phương Thức Thanh Toán
                            </h2>

                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {/* COD Payment */}
                                <div
                                    onClick={() => setSelectedPaymentMethod("COD")}
                                    style={{
                                        padding: "1.25rem",
                                        border: selectedPaymentMethod === "COD" ? "2px solid #10b981" : "1px solid #e5e7eb",
                                        borderRadius: "8px",
                                        background: selectedPaymentMethod === "COD" ? "#f0fdf4" : "white",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                        <div style={{ fontSize: "2rem" }}>💰</div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, fontWeight: "bold", fontSize: "1rem" }}>
                                                Thanh Toán Khi Nhận Hàng (COD)
                                            </p>
                                            <p style={{ margin: "0.5rem 0 0", color: "#6b7280", fontSize: "0.85rem" }}>
                                                Thanh toán tiền mặt cho shipper khi giao hàng
                                            </p>
                                        </div>
                                        {selectedPaymentMethod === "COD" && (
                                            <CheckCircle size={20} color="#10b981" />
                                        )}
                                    </div>
                                </div>

                                {/* VietQR Payment */}
                                <div
                                    onClick={() => setSelectedPaymentMethod("VIETQR")}
                                    style={{
                                        padding: "1.25rem",
                                        border: selectedPaymentMethod === "VIETQR" ? "2px solid #10b981" : "1px solid #e5e7eb",
                                        borderRadius: "8px",
                                        background: selectedPaymentMethod === "VIETQR" ? "#f0fdf4" : "white",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                        <div style={{ fontSize: "2rem" }}>📱</div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, fontWeight: "bold", fontSize: "1rem" }}>
                                                Viet QR / Quét Mã
                                            </p>
                                            <p style={{ margin: "0.5rem 0 0", color: "#6b7280", fontSize: "0.85rem" }}>
                                                Quét mã QR hoặc chuyển khoản liên ngân hàng
                                            </p>
                                        </div>
                                        {selectedPaymentMethod === "VIETQR" && (
                                            <CheckCircle size={20} color="#10b981" />
                                        )}
                                    </div>
                                </div>

                                {/* Bank Wire Payment */}
                                <div
                                    onClick={() => setSelectedPaymentMethod("BANKWIRE")}
                                    style={{
                                        padding: "1.25rem",
                                        border: selectedPaymentMethod === "BANKWIRE" ? "2px solid #10b981" : "1px solid #e5e7eb",
                                        borderRadius: "8px",
                                        background: selectedPaymentMethod === "BANKWIRE" ? "#f0fdf4" : "white",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                        <div style={{ fontSize: "2rem" }}>🏦</div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, fontWeight: "bold", fontSize: "1rem" }}>
                                                Chuyển Khoản Ngân Hàng
                                            </p>
                                            <p style={{ margin: "0.5rem 0 0", color: "#6b7280", fontSize: "0.85rem" }}>
                                                Chuyển tiền trực tiếp đến tài khoản
                                            </p>
                                        </div>
                                        {selectedPaymentMethod === "BANKWIRE" && (
                                            <CheckCircle size={20} color="#10b981" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bank Details Form - Show only if bankwire selected */}
                        {selectedPaymentMethod === "BANKWIRE" && (
                            <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "1.5rem" }}>
                                <h2 style={{ fontSize: "1.1rem", fontWeight: "bold", margin: "0 0 1.5rem" }}>
                                    Thông Tin Chuyển Khoản
                                </h2>

                                <div style={{ marginBottom: "1rem" }}>
                                    <label style={{ display: "block", fontWeight: "bold", marginBottom: "0.5rem" }}>
                                        Tên Ngân Hàng *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="VD: Vietcombank, Techcombank, ..."
                                        onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                                        style={{
                                            width: "100%",
                                            padding: "0.75rem",
                                            border: "1px solid #e5e7eb",
                                            borderRadius: "8px",
                                            boxSizing: "border-box",
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: "1rem" }}>
                                    <label style={{ display: "block", fontWeight: "bold", marginBottom: "0.5rem" }}>
                                        Số Tài Khoản *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="VD: 1234567890"
                                        onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                                        style={{
                                            width: "100%",
                                            padding: "0.75rem",
                                            border: "1px solid #e5e7eb",
                                            borderRadius: "8px",
                                            boxSizing: "border-box",
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: "1rem" }}>
                                    <label style={{ display: "block", fontWeight: "bold", marginBottom: "0.5rem" }}>
                                        Tên Chủ Tài Khoản *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="VD: Nguyen Van A"
                                        onChange={(e) => setBankDetails({ ...bankDetails, accountOwner: e.target.value })}
                                        style={{
                                            width: "100%",
                                            padding: "0.75rem",
                                            border: "1px solid #e5e7eb",
                                            borderRadius: "8px",
                                            boxSizing: "border-box",
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Delivery Info */}
                        <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                            <h2 style={{ fontSize: "1.1rem", fontWeight: "bold", margin: "0 0 1rem" }}>
                                📍 Địa Chỉ Giao Hàng
                            </h2>
                            <div style={{ background: "#f9fafb", borderRadius: "8px", padding: "1rem" }}>
                                <p style={{ margin: "0.5rem 0", fontSize: "0.9rem" }}>
                                    <strong>Số điện thoại:</strong> {address.phone}
                                </p>
                                <p style={{ margin: "0.5rem 0", fontSize: "0.9rem", wordBreak: "break-word" }}>
                                    <strong>Địa chỉ:</strong> {address.fullAddress}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", height: "fit-content", position: "sticky", top: "20px" }}>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", margin: "0 0 1rem" }}>
                            Tóm Tắt Đơn Hàng
                        </h3>

                        {/* Items Summary */}
                        <div style={{ maxHeight: "300px", overflowY: "auto", marginBottom: "1.5rem", borderBottom: "1px solid #f0f0f0", paddingBottom: "1rem" }}>
                            {items.map((item) => (
                                <div key={item.id} style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem", fontSize: "0.85rem" }}>
                                    <span style={{ flex: 1 }}>{item.productName}</span>
                                    <span style={{ color: "#6b7280" }}>x{item.quantity}</span>
                                    <span style={{ fontWeight: "bold", minWidth: "70px", textAlign: "right" }}>
                                        {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Pricing */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280", fontSize: "0.9rem" }}>
                                <span>Tạm tính:</span>
                                <span>{(total - shippingFee).toLocaleString("vi-VN")}đ</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280", fontSize: "0.9rem" }}>
                                <span>Phí vận chuyển:</span>
                                <span>{shippingFee.toLocaleString("vi-VN")}đ</span>
                            </div>
                        </div>

                        <div style={{ borderTop: "2px solid #f0f0f0", paddingTop: "1rem", marginBottom: "1.5rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.2rem", fontWeight: "bold" }}>
                                <span>Tổng cộng:</span>
                                <span style={{ color: "#ef4444" }}>{total.toLocaleString("vi-VN")}đ</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={isProcessing}
                            style={{
                                width: "100%",
                                padding: "0.85rem",
                                background: isProcessing ? "#d1d5db" : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                fontWeight: "bold",
                                cursor: isProcessing ? "not-allowed" : "pointer",
                                fontSize: "1rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.5rem",
                            }}
                        >
                            {isProcessing && <Loader size={18} style={{ animation: "spin 1s linear infinite" }} />}
                            {isProcessing ? "Đang xử lý..." : "💳 Thanh Toán"}
                        </button>

                        <button
                            onClick={() => navigate("/cart")}
                            disabled={isProcessing}
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                background: "white",
                                color: "#3b82f6",
                                border: "2px solid #3b82f6",
                                borderRadius: "8px",
                                fontWeight: "bold",
                                cursor: isProcessing ? "not-allowed" : "pointer",
                                fontSize: "0.95rem",
                                marginTop: "0.75rem",
                            }}
                        >
                            ← Quay Lại Giỏ Hàng
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default PaymentPage;

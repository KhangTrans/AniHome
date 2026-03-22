import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    CheckCircle,
    Copy,
    MapPin,
    Phone,
    Package,
    TrendingUp,
    Clock,
    Home,
    ArrowRight,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useToast } from "../../context/ToastContext";

const OrderConfirmationPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();
    const [copied, setCopied] = useState(false);

    // Get order data from location state
    const { items = [], shippingAddress = "", phone = "", paymentMethod = "cod", total = 0 } = location.state || {};

    // Generate order ID
    const orderId = `HP${Date.now()}`;

    // Get payment method label
    const getPaymentMethodLabel = (method) => {
        const methods = {
            cod: { label: "Thanh toán khi nhận hàng (COD)", icon: "💰" },
            bank: { label: "Chuyển khoản ngân hàng", icon: "🏦" },
            momo: { label: "Ví điện tử Momo/ZaloPay", icon: "📱" },
        };
        return methods[method] || methods.cod;
    };

    const paymentInfo = getPaymentMethodLabel(paymentMethod);

    const handleCopyOrderId = () => {
        navigator.clipboard.writeText(orderId);
        setCopied(true);
        toast.success("Đã sao chép mã đơn hàng");
        setTimeout(() => setCopied(false), 2000);
    };

    if (!items.length) {
        return (
            <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
                <Navbar />
                <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
                    <div
                        style={{
                            background: "white",
                            borderRadius: "12px",
                            padding: "3rem",
                            textAlign: "center",
                        }}
                    >
                        <p style={{ color: "#6b7280" }}>Không có dữ liệu đơn hàng</p>
                        <button
                            onClick={() => navigate("/shelters")}
                            style={{
                                marginTop: "2rem",
                                padding: "0.75rem 2rem",
                                background: "#3b82f6",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                            }}
                        >
                            Quay lại
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
            <Navbar />

            {/* Success Banner */}
            <div
                style={{
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "white",
                    padding: "2rem 1rem",
                    textAlign: "center",
                }}
            >
                <CheckCircle size={48} style={{ margin: "0 auto", marginBottom: "1rem" }} />
                <h1 style={{ fontSize: "2rem", fontWeight: "bold", margin: "0 0 0.5rem" }}>
                    Đặt Hàng Thành Công!
                </h1>
                <p style={{ margin: 0, opacity: 0.9, fontSize: "1rem" }}>
                    Cảm ơn bạn đã tin tưởng HomePaws. Đơn hàng của bạn đang được xử lý
                </p>
            </div>

            <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem 1rem" }}>
                {/* Order ID Section */}
                <div
                    style={{
                        background: "white",
                        borderRadius: "12px",
                        padding: "2rem",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                        marginBottom: "1.5rem",
                    }}
                >
                    <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                        <p style={{ color: "#6b7280", fontSize: "0.9rem", margin: 0 }}>
                            Mã Đơn Hàng
                        </p>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "1rem",
                                marginTop: "0.75rem",
                            }}
                        >
                            <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#ef4444", margin: 0 }}>
                                {orderId}
                            </p>
                            <button
                                onClick={handleCopyOrderId}
                                style={{
                                    background: "#f3f4f6",
                                    border: "none",
                                    padding: "0.5rem",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.25rem",
                                    color: "#4b5563",
                                    fontWeight: "600",
                                }}
                            >
                                <Copy size={16} /> {copied ? "Đã sao chép" : "Sao chép"}
                            </button>
                        </div>
                    </div>

                    {/* Status Timeline */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-around",
                            padding: "1.5rem 0",
                        }}
                    >
                        <div style={{ textAlign: "center" }}>
                            <div
                                style={{
                                    width: "60px",
                                    height: "60px",
                                    borderRadius: "50%",
                                    background: "#d1fae5",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 0.75rem",
                                }}
                            >
                                <CheckCircle size={32} color="#10b981" />
                            </div>
                            <p style={{ fontSize: "0.9rem", fontWeight: "bold", margin: 0 }}>
                                Đã Đặt
                            </p>
                        </div>

                        <div
                            style={{
                                flex: 1,
                                height: "2px",
                                background: "#e5e7eb",
                                margin: "0 1rem 2rem",
                            }}
                        ></div>

                        <div style={{ textAlign: "center" }}>
                            <div
                                style={{
                                    width: "60px",
                                    height: "60px",
                                    borderRadius: "50%",
                                    background: "#fef3c7",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 0.75rem",
                                }}
                            >
                                <Clock size={32} color="#f59e0b" />
                            </div>
                            <p style={{ fontSize: "0.9rem", fontWeight: "bold", margin: 0 }}>
                                Chờ Xác Nhận
                            </p>
                        </div>

                        <div
                            style={{
                                flex: 1,
                                height: "2px",
                                background: "#e5e7eb",
                                margin: "0 1rem 2rem",
                            }}
                        ></div>

                        <div style={{ textAlign: "center" }}>
                            <div
                                style={{
                                    width: "60px",
                                    height: "60px",
                                    borderRadius: "50%",
                                    background: "#e5e7eb",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 0.75rem",
                                }}
                            >
                                <TrendingUp size={32} color="#9ca3af" />
                            </div>
                            <p style={{ fontSize: "0.9rem", fontWeight: "bold", margin: 0 }}>
                                Đang Giao
                            </p>
                        </div>
                    </div>
                </div>

                {/* Order Details */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
                    {/* Shipping Info */}
                    <div
                        style={{
                            background: "white",
                            borderRadius: "12px",
                            padding: "1.5rem",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                        }}
                    >
                        <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <MapPin size={20} /> Địa Chỉ Giao Hàng
                        </h3>

                        <div
                            style={{
                                background: "#f9fafb",
                                padding: "1rem",
                                borderRadius: "8px",
                                lineHeight: "1.6",
                            }}
                        >
                            <p style={{ margin: 0, fontWeight: "bold" }}>
                                {shippingAddress.split(",")[0]}
                            </p>
                            <p style={{ margin: "0.25rem 0 0", color: "#6b7280", fontSize: "0.9rem" }}>
                                {shippingAddress}
                            </p>
                            <p style={{ margin: "0.5rem 0 0", color: "#6b7280", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <Phone size={16} /> {phone}
                            </p>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div
                        style={{
                            background: "white",
                            borderRadius: "12px",
                            padding: "1.5rem",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                        }}
                    >
                        <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ fontSize: "1.4rem" }}>{paymentInfo.icon}</span> Thanh Toán
                        </h3>

                        <div
                            style={{
                                background: "#f0fdf4",
                                padding: "1rem",
                                borderRadius: "8px",
                                borderLeft: "3px solid #10b981",
                            }}
                        >
                            <p style={{ margin: 0, fontWeight: "bold", color: "#15803d" }}>
                                {paymentInfo.label}
                            </p>
                            {paymentMethod === "cod" && (
                                <p style={{ margin: "0.5rem 0 0", color: "#15803d", fontSize: "0.9rem" }}>
                                    ✓ Thanh toán trực tiếp khi nhận hàng
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Products Summary */}
                <div
                    style={{
                        background: "white",
                        borderRadius: "12px",
                        padding: "1.5rem",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                        marginBottom: "1.5rem",
                    }}
                >
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Package size={20} /> Sản Phẩm Trong Đơn
                    </h3>

                    {items.map((item) => (
                        <div
                            key={item.id}
                            style={{
                                display: "flex",
                                gap: "1rem",
                                padding: "1rem",
                                borderBottom: "1px solid #f0f0f0",
                                alignItems: "flex-start",
                            }}
                        >
                            <img
                                src={item.imageUrl}
                                alt={item.productName}
                                style={{
                                    width: "80px",
                                    height: "80px",
                                    borderRadius: "8px",
                                    objectFit: "cover",
                                    border: "1px solid #e5e7eb",
                                }}
                            />

                            <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontWeight: "bold", color: "#1f2937" }}>
                                    {item.productName}
                                </p>
                                <p style={{ margin: "0.25rem 0 0", color: "#6b7280", fontSize: "0.9rem" }}>
                                    {item.unit}
                                </p>
                            </div>

                            <div style={{ textAlign: "right" }}>
                                <p style={{ margin: 0, color: "#6b7280", fontSize: "0.9rem" }}>
                                    x{item.quantity}
                                </p>
                                <p style={{ margin: "0.25rem 0 0", fontWeight: "bold", color: "#ef4444" }}>
                                    {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Total */}
                    <div
                        style={{
                            background: "linear-gradient(135deg, #fff7ed 0%, #fffbf0 100%)",
                            padding: "1.5rem",
                            borderRadius: "8px",
                            marginTop: "1rem",
                            borderLeft: "3px solid #f97316",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                            <span style={{ fontSize: "1.05rem", fontWeight: "bold", color: "#1f2937" }}>
                                Tổng cộng:
                            </span>
                            <span style={{ fontSize: "2rem", fontWeight: "bold", color: "#ef4444" }}>
                                {total.toLocaleString("vi-VN")}đ
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div
                    style={{
                        display: "flex",
                        gap: "1rem",
                        justifyContent: "center",
                        marginBottom: "2rem",
                    }}
                >
                    <button
                        onClick={() => navigate("/shelters")}
                        style={{
                            padding: "0.75rem 2rem",
                            background: "white",
                            color: "#3b82f6",
                            border: "2px solid #3b82f6",
                            borderRadius: "8px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                        }}
                    >
                        <Home size={18} /> Tiếp Tục Mua Sắm
                    </button>

                    <button
                        onClick={() => navigate("/profile")}
                        style={{
                            padding: "0.75rem 2rem",
                            background: "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                        }}
                    >
                        Xem Đơn Hàng Của Tôi
                        <ArrowRight size={18} />
                    </button>
                </div>

                {/* Help Section */}
                <div
                    style={{
                        background: "white",
                        borderRadius: "12px",
                        padding: "1.5rem",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                        textAlign: "center",
                    }}
                >
                    <p style={{ margin: 0, color: "#6b7280", fontSize: "0.95rem" }}>
                        Có câu hỏi? Liên hệ chúng tôi qua
                    </p>
                    <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginTop: "1rem", flexWrap: "wrap" }}>
                        <a
                            href="tel:1900-1234"
                            style={{
                                color: "#ef4444",
                                textDecoration: "none",
                                fontWeight: "bold",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                            }}
                        >
                            <Phone size={18} /> 1900 1234
                        </a>
                        <a
                            href="mailto:support@homepaws.vn"
                            style={{
                                color: "#ef4444",
                                textDecoration: "none",
                                fontWeight: "bold",
                            }}
                        >
                            support@homepaws.vn
                        </a>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default OrderConfirmationPage;

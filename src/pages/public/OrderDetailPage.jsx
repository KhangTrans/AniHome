import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Package, MapPin, DollarSign, Truck, ChevronLeft, X } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getOrderDetail, cancelOrder, getOrderStatusLabel, getPaymentStatusLabel } from "../../services/public/orderService";

const OrderDetailPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const toast = useToast();

    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState("");

    // Load order details on mount
    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        loadOrder();
    }, [orderId]);

    const loadOrder = async () => {
        setIsLoading(true);
        const result = await getOrderDetail(orderId);
        if (result.success) {
            setOrder(result.data);
        } else {
            toast.error(result.error);
        }
        setIsLoading(false);
    };

    const handleCancelOrder = async () => {
        if (!cancelReason.trim()) {
            toast.error("Vui lòng nhập lý do hủy đơn hàng");
            return;
        }

        setIsCancelling(true);
        const result = await cancelOrder(orderId, cancelReason);
        setIsCancelling(false);

        if (result.success) {
            toast.success(result.message);
            setShowCancelModal(false);
            setCancelReason("");
            loadOrder(); // Reload order data
        } else {
            toast.error(result.error);
        }
    };

    // Status progression timeline
    const statusSteps = [
        { status: "pending", label: "Chờ xác nhận" },
        { status: "confirmed", label: "Đã xác nhận" },
        { status: "processing", label: "Đang chuẩn bị" },
        { status: "shipped", label: "Đang giao hàng" },
        { status: "delivered", label: "Đã giao" },
    ];

    const currentStatusIndex = statusSteps.findIndex(
        s => s.status === order?.OrderStatus?.toLowerCase()
    );

    // Loading state
    if (isLoading) {
        return (
            <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
                <Navbar />
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ textAlign: "center" }}>
                        <p style={{ color: "#666" }}>Đang tải chi tiết đơn hàng...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Not found state
    if (!order) {
        return (
            <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
                <Navbar />
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
                    <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "3rem", textAlign: "center", maxWidth: "400px" }}>
                        <p style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "1rem" }}>❌ Không tìm thấy đơn hàng</p>
                        <button
                            onClick={() => navigate("/orders")}
                            style={{ marginTop: "1rem", padding: "0.75rem 2rem", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
                        >
                            Quay Lại Lịch Sử
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const orderStatus = getOrderStatusLabel(order.OrderStatus);
    const paymentStatus = getPaymentStatusLabel(order.PaymentStatus);
    const orderDate = new Date(order.OrderDate);
    const formattedDate = orderDate.toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" });

    return (
        <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Navbar />

            {/* Header */}
            <div style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", color: "white", padding: "1.5rem 1rem" }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", gap: "1rem" }}>
                    <button
                        onClick={() => navigate("/orders")}
                        style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", width: "40px", height: "40px", borderRadius: "8px", cursor: "pointer", fontSize: "1.2rem" }}
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: "1.8rem", fontWeight: "bold", margin: "0 0 0.25rem" }}>Đơn #{order.OrderID}</h1>
                        <p style={{ margin: 0, opacity: 0.9 }}>Đặt ngày {formattedDate}</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, maxWidth: "1200px", margin: "0 auto", padding: "2rem 1rem", width: "100%" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "2rem" }}>
                    {/* Left Column */}
                    <div>
                        {/* Status & Payment Section */}
                        <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "1.5rem" }}>
                            <h2 style={{ fontSize: "1rem", fontWeight: "bold", margin: "0 0 1rem" }}>Trạng Thái Đơn Hàng</h2>

                            {/* Status Timeline */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", position: "relative" }}>
                                {/* Progress bar */}
                                <div style={{
                                    position: "absolute",
                                    top: "20px",
                                    left: 0,
                                    right: 0,
                                    height: "4px",
                                    background: "#e5e7eb",
                                    borderRadius: "2px",
                                    zIndex: 0
                                }}></div>
                                <div style={{
                                    position: "absolute",
                                    top: "20px",
                                    left: 0,
                                    height: "4px",
                                    background: "#10b981",
                                    borderRadius: "2px",
                                    width: currentStatusIndex === -1 ? "0%" : `${((currentStatusIndex + 1) / statusSteps.length) * 100}%`,
                                    transition: "width 0.3s",
                                    zIndex: 0
                                }}></div>

                                {statusSteps.map((step, idx) => {
                                    const isCompleted = idx <= currentStatusIndex;
                                    return (
                                        <div key={step.status} style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1, flex: 1 }}>
                                            <div style={{
                                                width: "40px",
                                                height: "40px",
                                                borderRadius: "50%",
                                                background: isCompleted ? "#10b981" : "#e5e7eb",
                                                color: isCompleted ? "white" : "#999",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontWeight: "bold",
                                                marginBottom: "0.5rem",
                                                fontSize: "1.1rem"
                                            }}>
                                                {isCompleted ? "✓" : idx + 1}
                                            </div>
                                            <p style={{ margin: 0, fontSize: "0.8rem", textAlign: "center", color: isCompleted ? "#10b981" : "#999", fontWeight: isCompleted ? "bold" : "normal" }}>
                                                {step.label}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Current Status */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <p style={{ margin: "0 0 0.5rem", color: "#666" }}>Trạng thái hiện tại:</p>
                                    <div style={{
                                        display: "inline-block",
                                        padding: "0.75rem 1.5rem",
                                        borderRadius: "8px",
                                        background: orderStatus.color + "20",
                                        color: orderStatus.color,
                                        fontWeight: "bold",
                                        fontSize: "1rem"
                                    }}>
                                        {orderStatus.icon} {orderStatus.label}
                                    </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <p style={{ margin: "0 0 0.5rem", color: "#666" }}>Thanh toán:</p>
                                    <div style={{
                                        display: "inline-block",
                                        padding: "0.75rem 1.5rem",
                                        borderRadius: "8px",
                                        background: paymentStatus.color + "20",
                                        color: paymentStatus.color,
                                        fontWeight: "bold",
                                        fontSize: "1rem"
                                    }}>
                                        {paymentStatus.icon} {paymentStatus.label}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Info */}
                        <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "1.5rem" }}>
                            <h2 style={{ fontSize: "1rem", fontWeight: "bold", margin: "0 0 1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <MapPin size={20} /> Địa Chỉ Giao Hàng
                            </h2>
                            <div style={{ background: "#f9fafb", padding: "1rem", borderRadius: "8px" }}>
                                <p style={{ margin: "0.5rem 0", fontWeight: "bold" }}>{order.ShippingAddress?.RecipientName}</p>
                                <p style={{ margin: "0.5rem 0", color: "#666" }}>{order.ShippingAddress?.Phone}</p>
                                <p style={{ margin: "0.5rem 0", color: "#666" }}>{order.ShippingAddress?.FullAddress}</p>
                                {order.TrackingNumber && (
                                    <p style={{ margin: "0.75rem 0 0", color: "#3b82f6", fontWeight: "bold" }}>
                                        🚚 Mã vận đơn: {order.TrackingNumber}
                                    </p>
                                )}
                                {order.ShippingCarrier && (
                                    <p style={{ margin: "0.25rem 0 0", color: "#666" }}>
                                        Hãng: {order.ShippingCarrier} ({order.EstimatedDeliveryDays || "2-3"} ngày)
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Order Items */}
                        <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                            <h2 style={{ fontSize: "1rem", fontWeight: "bold", margin: "0 0 1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <Package size={20} /> Sản Phẩm ({order.OrderItems?.length || 0})
                            </h2>
                            {(order.OrderItems || []).map((item, idx) => (
                                <div key={idx} style={{ display: "flex", gap: "1rem", padding: "1rem", borderBottom: idx < (order.OrderItems?.length || 0) - 1 ? "1px solid #f0f0f0" : "none", alignItems: "flex-start" }}>
                                    <img src={item.ProductImage || "https://via.placeholder.com/80"} alt={item.ProductName} style={{ width: "80px", height: "80px", borderRadius: "8px", objectFit: "cover" }} />
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: "0 0 0.5rem", fontWeight: "bold" }}>{item.ProductName}</p>
                                        <p style={{ margin: "0.25rem 0", color: "#666", fontSize: "0.9rem" }}>Số lượng: {item.Quantity}</p>
                                        <p style={{ margin: "0.25rem 0", color: "#ef4444", fontWeight: "bold" }}>{item.Price?.toLocaleString("vi-VN")}đ × {item.Quantity} = {(item.Price * item.Quantity)?.toLocaleString("vi-VN")}đ</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - Summary */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        {/* Order Summary */}
                        <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                            <h3 style={{ fontSize: "1rem", fontWeight: "bold", margin: "0 0 1rem" }}>Tóm Tắt Đơn Hàng</h3>

                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280" }}>
                                    <span>Tạm tính:</span>
                                    <span>{(order.SubTotal || 0)?.toLocaleString("vi-VN")}đ</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280" }}>
                                    <span>Phí vận chuyển:</span>
                                    <span>{(order.ShippingFee || 0)?.toLocaleString("vi-VN")}đ</span>
                                </div>
                                {order.DiscountAmount > 0 && (
                                    <div style={{ display: "flex", justifyContent: "space-between", color: "#10b981" }}>
                                        <span>Giảm giá:</span>
                                        <span>-{order.DiscountAmount?.toLocaleString("vi-VN")}đ</span>
                                    </div>
                                )}
                            </div>

                            <div style={{ borderTop: "2px solid #f0f0f0", paddingTop: "1rem", marginBottom: "1rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.2rem", fontWeight: "bold" }}>
                                    <span>Tổng cộng:</span>
                                    <span style={{ color: "#ef4444" }}>{(order.TotalAmount || 0)?.toLocaleString("vi-VN")}đ</span>
                                </div>
                            </div>

                            <div style={{ background: "#f0f9ff", padding: "0.75rem", borderRadius: "8px", fontSize: "0.85rem", color: "#0369a1" }}>
                                <p style={{ margin: 0 }}>💳 Thanh toán: <strong>{order.PaymentMethod || "COD"}</strong></p>
                            </div>
                        </div>

                        {/* Cancel Button */}
                        {order.OrderStatus?.toLowerCase() === "pending" && (
                            <button
                                onClick={() => setShowCancelModal(true)}
                                style={{
                                    width: "100%",
                                    padding: "0.85rem",
                                    background: "#fee2e2",
                                    color: "#dc2626",
                                    border: "2px solid #fecaca",
                                    borderRadius: "8px",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                    fontSize: "0.95rem"
                                }}
                            >
                                ❌ Hủy Đơn Hàng
                            </button>
                        )}

                        {/* Print Invoice */}
                        <button
                            onClick={() => window.print()}
                            style={{
                                width: "100%",
                                padding: "0.85rem",
                                background: "#f3f4f6",
                                color: "#374151",
                                border: "none",
                                borderRadius: "8px",
                                fontWeight: "bold",
                                cursor: "pointer",
                                fontSize: "0.95rem"
                            }}
                        >
                            🖨️ In Hóa Đơn
                        </button>
                    </div>
                </div>
            </div>

            {/* Cancel Modal */}
            {showCancelModal && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000
                }}>
                    <div style={{
                        background: "white",
                        borderRadius: "12px",
                        padding: "2rem",
                        maxWidth: "400px",
                        width: "90%"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "bold" }}>Hủy Đơn Hàng</h3>
                            <button
                                onClick={() => { setShowCancelModal(false); setCancelReason(""); }}
                                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#999" }}
                            >
                                <X />
                            </button>
                        </div>

                        <p style={{ color: "#666", marginBottom: "1rem" }}>Vui lòng cho biết lý do hủy đơn hàng:</p>

                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="Nhập lý do hủy..."
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                minHeight: "100px",
                                boxSizing: "border-box",
                                marginBottom: "1rem",
                                fontFamily: "inherit",
                                resize: "vertical"
                            }}
                        />

                        <div style={{ display: "flex", gap: "0.75rem" }}>
                            <button
                                onClick={() => { setShowCancelModal(false); setCancelReason(""); }}
                                style={{
                                    flex: 1,
                                    padding: "0.75rem",
                                    background: "#f3f4f6",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontWeight: "bold"
                                }}
                            >
                                Đóng
                            </button>
                            <button
                                onClick={handleCancelOrder}
                                disabled={isCancelling}
                                style={{
                                    flex: 1,
                                    padding: "0.75rem",
                                    background: "#dc2626",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    cursor: isCancelling ? "not-allowed" : "pointer",
                                    fontWeight: "bold",
                                    opacity: isCancelling ? 0.5 : 1
                                }}
                            >
                                {isCancelling ? "Đang xử lý..." : "Xác Nhận Hủy"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default OrderDetailPage;

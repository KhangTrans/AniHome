import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, ChevronRight, Calendar, DollarSign, Loader } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getOrderHistory, getOrderStatusLabel, getPaymentStatusLabel } from "../../services/public/orderService";

const OrderHistoryPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const toast = useToast();

    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("all");

    // Load orders on mount
    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        loadOrders();
    }, []);

    const loadOrders = async () => {
        setIsLoading(true);
        const result = await getOrderHistory(currentPage, 10);
        if (result.success) {
            setOrders(result.data);
        } else {
            toast.error(result.error);
        }
        setIsLoading(false);
    };

    const filteredOrders = statusFilter === "all"
        ? orders
        : orders.filter(order => order.OrderStatus?.toLowerCase() === statusFilter.toLowerCase());

    // Loading state
    if (isLoading) {
        return (
            <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
                <Navbar />
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ textAlign: "center" }}>
                        <p style={{ color: "#666" }}>Đang tải lịch sử đơn hàng...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Empty state
    if (orders.length === 0) {
        return (
            <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
                <Navbar />
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
                    <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "3rem", textAlign: "center", maxWidth: "400px" }}>
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
                        <p style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Chưa có đơn hàng</p>
                        <p style={{ color: "#666", marginBottom: "1.5rem" }}>Bạn chưa thực hiện bất kỳ đơn hàng nào</p>
                        <button
                            onClick={() => navigate("/shelters")}
                            style={{ marginTop: "1rem", padding: "0.75rem 2rem", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
                        >
                            Khám Phá Sản Phẩm
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Navbar />

            {/* Header */}
            <div style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", color: "white", padding: "2rem 1rem" }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                    <h1 style={{ fontSize: "2rem", fontWeight: "bold", margin: "0 0 0.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <Package size={32} /> Lịch Sử Mua Hàng
                    </h1>
                    <p style={{ margin: 0, opacity: 0.9 }}>Theo dõi tất cả đơn hàng của bạn</p>
                </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, maxWidth: "1200px", margin: "0 auto", padding: "2rem 1rem", width: "100%" }}>
                {/* Filter Tabs */}
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
                    {[
                        { value: "all", label: "Tất cả", count: orders.length },
                        { value: "pending", label: "Chờ xác nhận", count: orders.filter(o => o.OrderStatus?.toLowerCase() === "pending").length },
                        { value: "shipped", label: "Đang giao", count: orders.filter(o => o.OrderStatus?.toLowerCase() === "shipped").length },
                        { value: "delivered", label: "Đã giao", count: orders.filter(o => o.OrderStatus?.toLowerCase() === "delivered").length },
                        { value: "cancelled", label: "Đã hủy", count: orders.filter(o => o.OrderStatus?.toLowerCase() === "cancelled").length },
                    ].map(tab => (
                        <button
                            key={tab.value}
                            onClick={() => setStatusFilter(tab.value)}
                            style={{
                                padding: "0.75rem 1.5rem",
                                border: statusFilter === tab.value ? "2px solid #3b82f6" : "1px solid #e5e7eb",
                                background: statusFilter === tab.value ? "#eff6ff" : "white",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: statusFilter === tab.value ? "bold" : "normal",
                                color: statusFilter === tab.value ? "#3b82f6" : "#666",
                            }}
                        >
                            {tab.label} <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>({tab.count})</span>
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {filteredOrders.length === 0 ? (
                        <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "2rem", textAlign: "center" }}>
                            <p style={{ color: "#999" }}>Không có đơn hàng trong danh mục này</p>
                        </div>
                    ) : (
                        filteredOrders.map(order => {
                            const orderStatus = getOrderStatusLabel(order.OrderStatus);
                            const paymentStatus = getPaymentStatusLabel(order.PaymentStatus);
                            const orderDate = new Date(order.OrderDate);
                            const formattedDate = orderDate.toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" });

                            return (
                                <div
                                    key={order.OrderID}
                                    onClick={() => navigate(`/orders/${order.OrderID}`)}
                                    style={{
                                        backgroundColor: "white",
                                        borderRadius: "12px",
                                        padding: "1.5rem",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                        display: "grid",
                                        gridTemplateColumns: "1fr 200px 200px auto",
                                        alignItems: "center",
                                        gap: "2rem",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                        ':hover': { boxShadow: "0 8px 16px rgba(0,0,0,0.1)" }
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)"}
                                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"}
                                >
                                    {/* Order Info */}
                                    <div>
                                        <p style={{ margin: "0 0 0.5rem", fontSize: "1rem", fontWeight: "bold" }}>
                                            Đơn #{order.OrderID}
                                        </p>
                                        <p style={{ margin: "0.25rem 0", color: "#666", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <Calendar size={16} />
                                            {formattedDate}
                                        </p>
                                        <p style={{ margin: "0.25rem 0", color: "#666", fontSize: "0.9rem" }}>
                                            {order.OrderItems?.length || 0} sản phẩm
                                        </p>
                                    </div>

                                    {/* Order Status */}
                                    <div style={{ textAlign: "center" }}>
                                        <div style={{
                                            display: "inline-block",
                                            padding: "0.5rem 1rem",
                                            borderRadius: "8px",
                                            background: orderStatus.color + "20",
                                            color: orderStatus.color,
                                            fontWeight: "bold",
                                            fontSize: "0.9rem"
                                        }}>
                                            {orderStatus.icon} {orderStatus.label}
                                        </div>
                                    </div>

                                    {/* Payment Status */}
                                    <div style={{ textAlign: "center" }}>
                                        <div style={{
                                            display: "inline-block",
                                            padding: "0.5rem 1rem",
                                            borderRadius: "8px",
                                            background: paymentStatus.color + "20",
                                            color: paymentStatus.color,
                                            fontWeight: "bold",
                                            fontSize: "0.9rem"
                                        }}>
                                            {paymentStatus.icon} {paymentStatus.label}
                                        </div>
                                    </div>

                                    {/* Total & Arrow */}
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                                        <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                                            <span style={{ color: "#999", fontSize: "0.9rem" }}>Tổng cộng:</span>
                                            <span style={{ fontSize: "1.3rem", fontWeight: "bold", color: "#ef4444" }}>
                                                <DollarSign size={18} style={{ display: "inline", marginRight: "0.25rem" }} />
                                                {(order.TotalAmount || 0).toLocaleString("vi-VN")}đ
                                            </span>
                                        </div>
                                        <ChevronRight size={24} color="#3b82f6" />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default OrderHistoryPage;

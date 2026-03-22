import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Package,
    Clock,
    CheckCircle,
    Truck,
    AlertCircle,
    Eye,
    Edit2,
    ChevronRight,
    Phone,
    MapPin,
    DollarSign,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
    getPartnerOrders,
    updateOrderStatus,
} from "../../services/public/marketplaceService";
import Modal from "../../components/Modal";

const SellerOrders = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const toast = useToast();

    // States
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [activeModal, setActiveModal] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all");

    // Order Status Config
    const statusConfig = {
        Pending: {
            color: "#f59e0b",
            label: "⏳ Chờ xác nhận",
            bgColor: "#fef3c7",
            nextStates: ["Shipping"],
        },
        Shipping: {
            color: "#3b82f6",
            label: "🚚 Đang giao",
            bgColor: "#dbeafe",
            nextStates: ["Completed", "Cancelled_BomHang"],
        },
        Completed: {
            color: "#10b981",
            label: "✓ Hoàn thành",
            bgColor: "#d1fae5",
            nextStates: [],
        },
        Cancelled_ByUser: {
            color: "#ef4444",
            label: "✕ Hủy (người mua)",
            bgColor: "#fee2e2",
            nextStates: [],
        },
        Cancelled_BomHang: {
            color: "#dc2626",
            label: "❌ Bom hàng",
            bgColor: "#fecaca",
            nextStates: [],
        },
    };

    // Fetch Orders
    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        const fetchOrders = async () => {
            setLoading(true);
            setError(null);

            const result = await getPartnerOrders();

            if (result.success) {
                setOrders(result.data || []);
            } else {
                setError(result.error || "Không thể tải danh sách đơn hàng");
                toast.error(result.error);
            }

            setLoading(false);
        };

        fetchOrders();
    }, [user, navigate, toast]);

    // Filter Orders
    const filteredOrders =
        filterStatus === "all"
            ? orders
            : orders.filter((order) => order.status === filterStatus);

    // Handle Update Status
    const handleUpdateStatus = async () => {
        if (!selectedOrder || !selectedStatus) {
            toast.error("Vui lòng chọn trạng thái mới");
            return;
        }

        setIsUpdatingStatus(true);

        const result = await updateOrderStatus(selectedOrder.orderID, selectedStatus);

        if (result.success) {
            toast.success("Cập nhật trạng thái thành công!");
            setOrders(
                orders.map((order) =>
                    order.orderID === selectedOrder.orderID
                        ? { ...order, status: selectedStatus }
                        : order
                )
            );
            setActiveModal(null);
        } else {
            toast.error(result.message || "Không thể cập nhật trạng thái");
        }

        setIsUpdatingStatus(false);
    };

    // Get Stats
    const stats = {
        total: orders.length,
        pending: orders.filter((o) => o.status === "Pending").length,
        shipping: orders.filter((o) => o.status === "Shipping").length,
        completed: orders.filter((o) => o.status === "Completed").length,
    };

    return (
        <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
            <Navbar />

            {/* Header Banner */}
            <div
                style={{
                    background: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
                    color: "white",
                    padding: "2rem 1rem",
                }}
            >
                <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                    <h1 style={{ fontSize: "2rem", fontWeight: "bold", margin: 0 }}>
                        📦 Quản Lý Đơn Hàng
                    </h1>
                    <p style={{ margin: "0.5rem 0 0", opacity: 0.9, fontSize: "1rem" }}>
                        Quản lý đơn hàng từ khách hàng của bạn
                    </p>
                </div>
            </div>

            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1rem" }}>
                {/* Stats Grid */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                        gap: "1rem",
                        marginBottom: "2rem",
                    }}
                >
                    <div
                        style={{
                            background: "white",
                            padding: "1.5rem",
                            borderRadius: "12px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                            textAlign: "center",
                            borderTop: "4px solid #10b981",
                        }}
                    >
                        <p style={{ color: "#6b7280", fontSize: "0.85rem", margin: 0 }}>
                            Tổng đơn
                        </p>
                        <p style={{ fontSize: "2.5rem", fontWeight: "bold", margin: "0.5rem 0 0", color: "#1f2937" }}>
                            {stats.total}
                        </p>
                    </div>

                    <div
                        style={{
                            background: "white",
                            padding: "1.5rem",
                            borderRadius: "12px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                            textAlign: "center",
                            borderTop: "4px solid #f59e0b",
                        }}
                    >
                        <p style={{ color: "#6b7280", fontSize: "0.85rem", margin: 0 }}>
                            Chờ xác nhận
                        </p>
                        <p style={{ fontSize: "2.5rem", fontWeight: "bold", margin: "0.5rem 0 0", color: "#f59e0b" }}>
                            {stats.pending}
                        </p>
                    </div>

                    <div
                        style={{
                            background: "white",
                            padding: "1.5rem",
                            borderRadius: "12px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                            textAlign: "center",
                            borderTop: "4px solid #3b82f6",
                        }}
                    >
                        <p style={{ color: "#6b7280", fontSize: "0.85rem", margin: 0 }}>
                            Đang giao
                        </p>
                        <p style={{ fontSize: "2.5rem", fontWeight: "bold", margin: "0.5rem 0 0", color: "#3b82f6" }}>
                            {stats.shipping}
                        </p>
                    </div>

                    <div
                        style={{
                            background: "white",
                            padding: "1.5rem",
                            borderRadius: "12px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                            textAlign: "center",
                            borderTop: "4px solid #10b981",
                        }}
                    >
                        <p style={{ color: "#6b7280", fontSize: "0.85rem", margin: 0 }}>
                            Hoàn thành
                        </p>
                        <p style={{ fontSize: "2.5rem", fontWeight: "bold", margin: "0.5rem 0 0", color: "#10b981" }}>
                            {stats.completed}
                        </p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div style={{ marginBottom: "2rem" }}>
                    <div
                        style={{
                            display: "flex",
                            gap: "0.5rem",
                            background: "white",
                            padding: "0.5rem",
                            borderRadius: "12px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                            overflowX: "auto",
                        }}
                    >
                        {["all", "Pending", "Shipping", "Completed"].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                style={{
                                    padding: "0.75rem 1.5rem",
                                    background:
                                        filterStatus === status
                                            ? statusConfig[status]?.color || "#ef4444"
                                            : "transparent",
                                    color:
                                        filterStatus === status ? "white" : "#6b7280",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    fontSize: "0.9rem",
                                    whiteSpace: "nowrap",
                                    transition: "all 0.3s ease",
                                }}
                            >
                                {status === "all"
                                    ? "📊 Tất Cả"
                                    : statusConfig[status]?.label || status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div
                        style={{
                            background: "white",
                            borderRadius: "12px",
                            padding: "3rem",
                            textAlign: "center",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                        }}
                    >
                        <div
                            style={{
                                display: "inline-block",
                                border: "4px solid #f3f3f3",
                                borderTop: "4px solid #ef4444",
                                borderRadius: "50%",
                                width: "50px",
                                height: "50px",
                                animation: "spin 1s linear infinite",
                            }}
                        />
                        <p style={{ color: "#666", marginTop: "1rem", fontSize: "1rem" }}>
                            Đang tải đơn hàng...
                        </p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div
                        style={{
                            background: "#fee2e2",
                            color: "#dc2626",
                            padding: "1.5rem",
                            borderRadius: "12px",
                            display: "flex",
                            gap: "0.75rem",
                            alignItems: "flex-start",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                        }}
                    >
                        <AlertCircle size={24} style={{ flexShrink: 0, marginTop: "0.25rem" }} />
                        <div>
                            <p style={{ fontWeight: "bold", margin: 0 }}>Lỗi tải dữ liệu</p>
                            <p style={{ margin: "0.5rem 0 0", opacity: 0.9 }}>{error}</p>
                        </div>
                    </div>
                )}

                {/* Orders List */}
                {!loading && filteredOrders.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        {filteredOrders.map((order) => {
                            const config = statusConfig[order.status] || statusConfig.Pending;
                            return (
                                <div
                                    key={order.orderID}
                                    style={{
                                        background: "white",
                                        borderRadius: "12px",
                                        padding: "1.5rem",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                        border: "1px solid #f0f0f0",
                                        transition: "all 0.3s ease",
                                    }}
                                >
                                    {/* Header Row */}
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "flex-start",
                                            marginBottom: "1.5rem",
                                            paddingBottom: "1.5rem",
                                            borderBottom: "1px solid #f0f0f0",
                                        }}
                                    >
                                        <div>
                                            <p
                                                style={{
                                                    color: "#6b7280",
                                                    fontSize: "0.85rem",
                                                    margin: 0,
                                                    fontWeight: "600",
                                                }}
                                            >
                                                Mã đơn
                                            </p>
                                            <p
                                                style={{
                                                    fontSize: "1.25rem",
                                                    fontWeight: "bold",
                                                    margin: "0.5rem 0 0",
                                                    color: "#ef4444",
                                                }}
                                            >
                                                #{order.orderID}
                                            </p>
                                        </div>

                                        <div
                                            style={{
                                                background: config.bgColor,
                                                color: config.color,
                                                padding: "0.5rem 1rem",
                                                borderRadius: "8px",
                                                fontWeight: "bold",
                                                fontSize: "0.9rem",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {config.label}
                                        </div>
                                    </div>

                                    {/* Content Grid */}
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "1fr 1fr",
                                            gap: "2rem",
                                            marginBottom: "1.5rem",
                                        }}
                                    >
                                        {/* Customer Info */}
                                        <div>
                                            <p
                                                style={{
                                                    color: "#6b7280",
                                                    fontSize: "0.85rem",
                                                    margin: 0,
                                                    fontWeight: "600",
                                                    marginBottom: "0.5rem",
                                                }}
                                            >
                                                Khách hàng
                                            </p>
                                            <p style={{ fontSize: "1.05rem", fontWeight: "bold", margin: 0 }}>
                                                {order.customerName}
                                            </p>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "0.5rem",
                                                    color: "#6b7280",
                                                    fontSize: "0.95rem",
                                                    marginTop: "0.5rem",
                                                }}
                                            >
                                                <Phone size={16} />
                                                {order.customerPhone}
                                            </div>
                                        </div>

                                        {/* Amount & Date */}
                                        <div>
                                            <p
                                                style={{
                                                    color: "#6b7280",
                                                    fontSize: "0.85rem",
                                                    margin: 0,
                                                    fontWeight: "600",
                                                    marginBottom: "0.5rem",
                                                }}
                                            >
                                                Tổng tiền
                                            </p>
                                            <p
                                                style={{
                                                    fontSize: "1.5rem",
                                                    fontWeight: "bold",
                                                    color: "#ef4444",
                                                    margin: 0,
                                                }}
                                            >
                                                {(order.totalAmount || 0).toLocaleString("vi-VN")}đ
                                            </p>
                                            <p
                                                style={{
                                                    color: "#9ca3af",
                                                    fontSize: "0.85rem",
                                                    margin: "0.5rem 0 0",
                                                }}
                                            >
                                                Số lượng: <span style={{ fontWeight: "bold" }}>1 sản phẩm</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div
                                        style={{
                                            background: "#f9fafb",
                                            padding: "1rem",
                                            borderRadius: "8px",
                                            marginBottom: "1rem",
                                            display: "flex",
                                            gap: "0.75rem",
                                        }}
                                    >
                                        <MapPin size={20} color="#6b7280" style={{ flexShrink: 0 }} />
                                        <div>
                                            <p
                                                style={{
                                                    margin: 0,
                                                    fontWeight: "600",
                                                    color: "#1f2937",
                                                    fontSize: "0.95rem",
                                                }}
                                            >
                                                Địa chỉ giao hàng
                                            </p>
                                            <p
                                                style={{
                                                    margin: "0.5rem 0 0",
                                                    color: "#6b7280",
                                                    fontSize: "0.9rem",
                                                    lineHeight: "1.5",
                                                }}
                                            >
                                                {order.shippingAddress}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Note */}
                                    {order.note && (
                                        <div
                                            style={{
                                                background: "#fffbeb",
                                                padding: "1rem",
                                                borderRadius: "8px",
                                                marginBottom: "1rem",
                                                borderLeft: "3px solid #f59e0b",
                                            }}
                                        >
                                            <p
                                                style={{
                                                    margin: 0,
                                                    fontWeight: "600",
                                                    color: "#92400e",
                                                    fontSize: "0.9rem",
                                                }}
                                            >
                                                📝 Ghi chú khách hàng
                                            </p>
                                            <p
                                                style={{
                                                    margin: "0.5rem 0 0",
                                                    color: "#78350f",
                                                    fontSize: "0.9rem",
                                                    lineHeight: "1.5",
                                                }}
                                            >
                                                {order.note}
                                            </p>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div style={{ display: "flex", gap: "0.75rem" }}>
                                        <button
                                            onClick={() => {
                                                setSelectedOrder(order);
                                                setSelectedStatus(order.status);
                                                setActiveModal("updateStatus");
                                            }}
                                            disabled={!config.nextStates || config.nextStates.length === 0}
                                            style={{
                                                flex: 1,
                                                padding: "0.75rem 1.5rem",
                                                background:
                                                    config.nextStates && config.nextStates.length > 0
                                                        ? config.color
                                                        : "#d1d5db",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "8px",
                                                fontWeight: "600",
                                                cursor:
                                                    config.nextStates && config.nextStates.length > 0
                                                        ? "pointer"
                                                        : "not-allowed",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "0.5rem",
                                                fontSize: "0.95rem",
                                                transition: "all 0.3s ease",
                                            }}
                                        >
                                            <Edit2 size={16} /> Cập Nhật Trạng Thái
                                        </button>
                                        <button
                                            style={{
                                                padding: "0.75rem 1.5rem",
                                                background: "#e5e7eb",
                                                color: "#1f2937",
                                                border: "none",
                                                borderRadius: "8px",
                                                fontWeight: "600",
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "0.5rem",
                                                fontSize: "0.95rem",
                                            }}
                                        >
                                            <Eye size={16} /> Chi Tiết
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredOrders.length === 0 && (
                    <div
                        style={{
                            background: "white",
                            borderRadius: "12px",
                            padding: "3rem",
                            textAlign: "center",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                        }}
                    >
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📦</div>
                        <p style={{ color: "#6b7280", fontSize: "1rem", marginBottom: "0.5rem" }}>
                            Không có đơn hàng nào
                        </p>
                        <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>
                            Các đơn hàng của bạn sẽ hiển thị tại đây
                        </p>
                    </div>
                )}
            </div>

            {/* Update Status Modal */}
            <Modal
                isOpen={activeModal === "updateStatus"}
                onClose={() => setActiveModal(null)}
                title={`Cập Nhật Trạng Thái - Đơn #${selectedOrder?.orderID}`}
            >
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {/* Current Status */}
                    <div>
                        <label style={{ display: "block", fontWeight: "bold", marginBottom: "0.5rem" }}>
                            Trạng thái hiện tại
                        </label>
                        <div
                            style={{
                                padding: "0.75rem",
                                background: statusConfig[selectedOrder?.status]?.bgColor,
                                color: statusConfig[selectedOrder?.status]?.color,
                                borderRadius: "8px",
                                fontWeight: "bold",
                            }}
                        >
                            {statusConfig[selectedOrder?.status]?.label}
                        </div>
                    </div>

                    {/* Next Status Options */}
                    <div>
                        <label style={{ display: "block", fontWeight: "bold", marginBottom: "0.75rem" }}>
                            Chuyển sang trạng thái
                        </label>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {selectedOrder &&
                                statusConfig[selectedOrder.status]?.nextStates?.map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setSelectedStatus(status)}
                                        style={{
                                            padding: "0.75rem",
                                            background:
                                                selectedStatus === status
                                                    ? statusConfig[status]?.bgColor
                                                    : "#f3f4f6",
                                            color:
                                                selectedStatus === status
                                                    ? statusConfig[status]?.color
                                                    : "#6b7280",
                                            border:
                                                selectedStatus === status
                                                    ? `2px solid ${statusConfig[status]?.color}`
                                                    : "1px solid #e5e7eb",
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                            fontWeight: selectedStatus === status ? "bold" : "normal",
                                        }}
                                    >
                                        {statusConfig[status]?.label}
                                    </button>
                                ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                        <button
                            onClick={handleUpdateStatus}
                            disabled={isUpdatingStatus}
                            style={{
                                flex: 1,
                                padding: "0.75rem",
                                background: "#3b82f6",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                fontWeight: "600",
                                cursor: isUpdatingStatus ? "not-allowed" : "pointer",
                                opacity: isUpdatingStatus ? 0.7 : 1,
                            }}
                        >
                            {isUpdatingStatus ? "Đang cập nhật..." : "✓ Xác Nhận"}
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
                            ✕ Hủy
                        </button>
                    </div>
                </div>
            </Modal>

            <Footer />
        </div>
    );
};

export default SellerOrders;

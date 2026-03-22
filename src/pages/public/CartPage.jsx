import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Trash2, Plus, Minus, MapPin } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getCart, removeFromCart, updateCartItem } from "../../services/public/cartService";
import { calculateShippingCost } from "../../services/public/shippingService";

const CartPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const toast = useToast();

    // Cart state
    const [cartItems, setCartItems] = useState([]);
    const [isLoadingCart, setIsLoadingCart] = useState(true);

    // Address state
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedWard, setSelectedWard] = useState("");
    const [phone, setPhone] = useState("");
    const [detailAddress, setDetailAddress] = useState("");
    const [confirmedAddress, setConfirmedAddress] = useState(null);

    // Shipping state
    const [shippingCarriers, setShippingCarriers] = useState([]);
    const [selectedShippingCarrier, setSelectedShippingCarrier] = useState("");
    const [shippingFee, setShippingFee] = useState(0);

    // Loading states
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingWards, setLoadingWards] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Load cart and provinces on mount
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoadingCart(true);

            // Load cart
            const cartResult = await getCart();
            if (cartResult.success && cartResult.data) {
                const items = (cartResult.data.items || []).map(item => ({
                    id: item.cartItemID,
                    cartItemID: item.cartItemID,
                    productName: item.productName || "Sản phẩm",
                    price: item.price || 0,
                    quantity: item.quantity || 1,
                    imageUrl: item.productImage || "https://via.placeholder.com/80",
                    selected: true,
                }));
                setCartItems(items);
            } else {
                toast.error("Không thể tải giỏ hàng");
            }

            // Load provinces
            setLoadingProvinces(true);
            try {
                const res = await fetch("https://provinces.open-api.vn/api/p/");
                const data = await res.json();
                setProvinces(data || []);
            } catch (err) {
                console.error("Failed to fetch provinces:", err);
            }
            setLoadingProvinces(false);

            setIsLoadingCart(false);
        };

        loadInitialData();
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

    // Handle quantity change
    const handleQuantityChange = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;

        const item = cartItems.find(i => i.id === itemId);
        if (!item || !item.cartItemID) {
            toast.error("Không tìm thấy sản phẩm");
            return;
        }

        if (newQuantity === 0) {
            await handleRemoveItem(itemId);
            return;
        }

        const result = await updateCartItem(item.cartItemID, newQuantity);
        if (result.success) {
            setCartItems(cartItems.map((i) =>
                i.id === itemId ? { ...i, quantity: newQuantity } : i
            ));
        } else {
            toast.error(result.error || "Không thể cập nhật số lượng");
        }
    };

    // Handle remove item
    const handleRemoveItem = async (itemId) => {
        const item = cartItems.find(i => i.id === itemId);
        if (!item) return;

        const result = await removeFromCart(item.cartItemID);
        if (result.success) {
            setCartItems(cartItems.filter((i) => i.id !== itemId));
            toast.success("Đã xóa sản phẩm");
        } else {
            toast.error(result.error || "Không thể xóa sản phẩm");
        }
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

        // Calculate shipping cost
        try {
            const totalWeight = cartItems.reduce((sum, item) => sum + item.quantity * 500, 0);

            // Use default warehouse district (HCM Quận 1)
            const response = await calculateShippingCost(1450, parseInt(selectedDistrict), totalWeight);

            if (response.success && response.data?.ShippingOptions) {
                const options = response.data.ShippingOptions;
                setShippingCarriers(options);
                if (options.length > 0) {
                    setSelectedShippingCarrier(options[0].CarrierCode);
                    setShippingFee(options[0].TotalCost || 0);
                }
                toast.success("Xác nhận địa chỉ thành công!");
            } else {
                setShippingFee(35000);
                toast.success("Xác nhận địa chỉ thành công!");
            }
        } catch (error) {
            console.error("[CartPage] Error calculating shipping:", error);
            setShippingFee(35000);
            toast.success("Xác nhận địa chỉ thành công!");
        }
    };

    // Compose full address whenever selections change
    useEffect(() => {
        const provinceName =
            provinces.find((p) => String(p.code) === String(selectedProvince))
                ?.name || "";
        const districtName =
            districts.find((d) => String(d.code) === String(selectedDistrict))
                ?.name || "";
        const wardName =
            wards.find((w) => String(w.code) === String(selectedWard))?.name || "";
        // Address composition happens on confirming, this is just to keep state consistent
    }, [
        selectedProvince,
        selectedDistrict,
        selectedWard,
        detailAddress,
        provinces,
        districts,
        wards,
    ]);

    // Handle edit address
    const handleEditAddress = () => {
        setConfirmedAddress(null);
        setShippingCarriers([]);
        setShippingFee(0);
        setSelectedProvince("");
        setSelectedDistrict("");
        setSelectedWard("");
        setPhone("");
        setDetailAddress("");
        setDistricts([]);
        setWards([]);
    };

    // Handle checkout
    const handleCheckout = async () => {
        if (!user) {
            navigate("/login");
            return;
        }

        if (cartItems.length === 0) {
            toast.error("Giỏ hàng trống");
            return;
        }

        if (!confirmedAddress) {
            toast.error("Vui lòng xác nhận địa chỉ giao hàng");
            return;
        }

        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            navigate("/payment", {
                state: {
                    items: cartItems,
                    address: confirmedAddress,
                    shippingCarrier: selectedShippingCarrier,
                    shippingFee,
                    total: subtotal + shippingFee,
                },
            });
        }, 1000);
    };

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal + shippingFee;

    // Loading state
    if (isLoadingCart) {
        return (
            <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
                <Navbar />
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ textAlign: "center" }}>
                        <p style={{ color: "#666" }}>Đang tải giỏ hàng...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Empty cart state
    if (cartItems.length === 0) {
        return (
            <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
                <Navbar />
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
                    <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "3rem", textAlign: "center", maxWidth: "400px" }}>
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🛒</div>
                        <p style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Giỏ hàng trống</p>
                        <button onClick={() => navigate("/shelters")} style={{ marginTop: "1rem", padding: "0.75rem 2rem", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
                            Tiếp Tục Mua Sắm
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
            <div style={{ padding: "1.5rem 1rem" }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                    <h1 style={{ fontSize: "2rem", fontWeight: "bold", margin: 0, display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <ShoppingCart size={32} /> Giỏ Hàng
                    </h1>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, maxWidth: "1200px", margin: "0 auto", padding: "2rem 1rem", width: "100%" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "2rem" }}>
                    {/* Left Column */}
                    <div>
                        {/* Cart Items */}
                        <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "1.5rem" }}>
                            <h2 style={{ fontSize: "1.1rem", fontWeight: "bold", margin: "0 0 1rem" }}>Sản Phẩm ({cartItems.length})</h2>
                            {cartItems.map((item) => (
                                <div key={item.id} style={{ display: "flex", gap: "1rem", padding: "1rem", borderBottom: "1px solid #f0f0f0", alignItems: "flex-start" }}>
                                    <img src={item.imageUrl} alt={item.productName} style={{ width: "80px", height: "80px", borderRadius: "8px", objectFit: "cover" }} />
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontWeight: "bold" }}>{item.productName}</p>
                                        <p style={{ margin: "0.5rem 0 0", color: "#ef4444", fontWeight: "bold" }}>{item.price.toLocaleString("vi-VN")}đ</p>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#f9fafb", padding: "0.5rem", borderRadius: "6px" }}>
                                        <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)} style={{ width: "28px", height: "28px", border: "none", background: "white", borderRadius: "4px", cursor: "pointer", color: "#ef4444" }}>−</button>
                                        <span style={{ width: "28px", textAlign: "center", fontWeight: "bold" }}>{item.quantity}</span>
                                        <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)} style={{ width: "28px", height: "28px", border: "none", background: "white", borderRadius: "4px", cursor: "pointer", color: "#3b82f6" }}>+</button>
                                    </div>
                                    <button onClick={() => handleRemoveItem(item.id)} style={{ background: "#fee2e2", border: "none", color: "#dc2626", width: "36px", height: "36px", borderRadius: "6px", cursor: "pointer" }}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Address Form */}
                        <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "1.5rem" }}>
                            <h2 style={{ fontSize: "1.1rem", fontWeight: "bold", margin: "0 0 1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <MapPin size={20} /> Địa Chỉ Giao Hàng
                            </h2>

                            {!confirmedAddress ? (
                                <div>
                                    <div style={{ marginBottom: "1rem" }}>
                                        <label style={{ display: "block", fontWeight: "bold", marginBottom: "0.5rem" }}>📱 Số Điện Thoại</label>
                                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Nhập số điện thoại" style={{ width: "100%", padding: "0.75rem", border: "1px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box" }} />
                                    </div>

                                    <div style={{ marginBottom: "1rem" }}>
                                        <label style={{ display: "block", fontWeight: "bold", marginBottom: "0.5rem" }}>Tỉnh / Thành phố *</label>
                                        <select value={selectedProvince} onChange={(e) => setSelectedProvince(e.target.value)} disabled={loadingProvinces} style={{ width: "100%", padding: "0.75rem", border: "1px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box", cursor: "pointer" }}>
                                            <option value="">-- Chọn Tỉnh/Thành phố --</option>
                                            {provinces.map((p) => (
                                                <option key={p.code} value={p.code}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={{ marginBottom: "1rem" }}>
                                        <label style={{ display: "block", fontWeight: "bold", marginBottom: "0.5rem" }}>Quận / Huyện *</label>
                                        <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} disabled={!selectedProvince || loadingDistricts} style={{ width: "100%", padding: "0.75rem", border: "1px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box", cursor: "pointer", color: selectedDistrict ? "var(--dark)" : "#999" }}>
                                            <option value="">{loadingDistricts ? "Đang tải..." : "-- Chọn Quận/Huyện --"}</option>
                                            {districts.map((d) => (
                                                <option key={d.code} value={d.code}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={{ marginBottom: "1rem" }}>
                                        <label style={{ display: "block", fontWeight: "bold", marginBottom: "0.5rem" }}>Phường / Xã *</label>
                                        <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)} disabled={!selectedDistrict || loadingWards} style={{ width: "100%", padding: "0.75rem", border: "1px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box", cursor: "pointer", color: selectedWard ? "var(--dark)" : "#999" }}>
                                            <option value="">{loadingWards ? "Đang tải..." : "-- Chọn Phường/Xã --"}</option>
                                            {wards.map((w) => (
                                                <option key={w.code} value={w.code}>{w.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div style={{ marginBottom: "1rem" }}>
                                        <label style={{ display: "block", fontWeight: "bold", marginBottom: "0.5rem" }}>Địa Chỉ Chi Tiết (Số nhà, đường) *</label>
                                        <input type="text" value={detailAddress} onChange={(e) => setDetailAddress(e.target.value)} placeholder="VD: 123 Đường Nguyễn Huệ" style={{ width: "100%", padding: "0.75rem", border: "1px solid #e5e7eb", borderRadius: "8px", boxSizing: "border-box" }} />
                                    </div>

                                    {selectedProvince && selectedDistrict && selectedWard && detailAddress && (
                                        <div style={{ padding: "0.75rem 1rem", background: "#f0fdf4", borderRadius: "8px", border: "2px solid #22c55e", marginBottom: "1rem", fontSize: "0.9rem" }}>
                                            <strong>📍 Địa chỉ đầy đủ:</strong>
                                            <div style={{ marginTop: "0.5rem", color: "#166534", lineHeight: 1.5 }}>
                                                {(() => {
                                                    const prov = provinces.find(p => String(p.code) === String(selectedProvince));
                                                    const dist = districts.find(d => String(d.code) === String(selectedDistrict));
                                                    const ward = wards.find(w => String(w.code) === String(selectedWard));
                                                    return `${detailAddress}, ${ward?.name || ''}, ${dist?.name || ''}, ${prov?.name || ''}`;
                                                })()}
                                            </div>
                                        </div>
                                    )}

                                    <button onClick={handleConfirmAddress} style={{ width: "100%", padding: "0.75rem", background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "0.95rem" }}>
                                        ✓ Xác Nhận Địa Chỉ
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ background: "#f0f9ff", border: "2px solid #3b82f6", borderRadius: "8px", padding: "1rem", marginBottom: "1rem" }}>
                                        <p style={{ margin: "0.5rem 0", fontSize: "0.9rem" }}><strong>📱 Số điện thoại:</strong> {confirmedAddress.phone}</p>
                                        <p style={{ margin: "0.5rem 0", fontSize: "0.9rem", wordBreak: "break-word" }}><strong>📍 Địa chỉ:</strong> {confirmedAddress.fullAddress}</p>
                                    </div>
                                    <button onClick={handleEditAddress} style={{ width: "100%", padding: "0.75rem", background: "#6b7280", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
                                        ✏️ Sửa Địa Chỉ
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Shipping Carriers */}
                        {confirmedAddress && shippingCarriers.length > 0 && (
                            <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "1.5rem" }}>
                                <h2 style={{ fontSize: "1.1rem", fontWeight: "bold", margin: "0 0 1rem" }}>📦 Chọn Hãng Vận Chuyền</h2>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                    {shippingCarriers.map((carrier) => (
                                        <div key={carrier.CarrierCode} onClick={() => { setSelectedShippingCarrier(carrier.CarrierCode); setShippingFee(carrier.TotalCost); }} style={{ padding: "1rem", border: selectedShippingCarrier === carrier.CarrierCode ? "2px solid #10b981" : "1px solid #e5e7eb", borderRadius: "8px", background: selectedShippingCarrier === carrier.CarrierCode ? "#f0fdf4" : "white", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: "bold" }}>{carrier.CarrierName}</p>
                                                <p style={{ margin: "0.25rem 0 0", color: "#6b7280", fontSize: "0.85rem" }}>{carrier.EstimatedDays || "2-3"} ngày giao hàng</p>
                                            </div>
                                            <span style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#ef4444" }}>{carrier.TotalCost.toLocaleString("vi-VN")}đ</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}


                    </div>

                    {/* Right Column - Summary */}
                    <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", height: "fit-content", position: "sticky", top: "20px" }}>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", margin: "0 0 1rem" }}>Tóm Tắt Đơn Hàng</h3>

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280" }}>
                                <span>Tạm tính:</span>
                                <span>{subtotal.toLocaleString("vi-VN")}đ</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", color: "#6b7280" }}>
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

                        <button onClick={handleCheckout} disabled={isProcessing || !confirmedAddress} style={{ width: "100%", padding: "0.85rem", background: !confirmedAddress || isProcessing ? "#d1d5db" : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: !confirmedAddress || isProcessing ? "not-allowed" : "pointer", fontSize: "1rem" }}>
                            {isProcessing ? "Đang xử lý..." : "💳 Thanh Toán"}
                        </button>

                        <p style={{ margin: "1rem 0 0", fontSize: "0.75rem", color: "#999", textAlign: "center" }}>
                            {!confirmedAddress ? "Vui lòng xác nhận địa chỉ để tiếp tục" : "Nhấn nút để hoàn tất đơn hàng"}
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default CartPage;

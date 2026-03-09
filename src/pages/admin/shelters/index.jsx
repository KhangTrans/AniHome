import React, { useState, useEffect } from "react";
import {
  Home,
  Trash2,
  CheckCircle,
  Ban,
  RefreshCw,
  Search,
  Filter,
  Plus,
  X,
  Eye,
  EyeOff,
  MapPin,
  Phone,
  Mail,
  User,
  PawPrint,
  Calendar,
  Heart,
  Users,
} from "lucide-react";
import { Modal } from "antd";
import {
  getAllShelters,
  getShelterDetail,
  createShelter,
  updateShelterStatus,
  deleteShelter,
  getAdminShelterStatusBadge,
} from "../../../services/admin/adminSheltersService";
import { useToast } from "../../../context/ToastContext";

const ShelterManager = () => {
  const toast = useToast();
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Create shelter states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Detail modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [shelterDetail, setShelterDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [createForm, setCreateForm] = useState({
    shelterName: "",
    location: "",
    regionID: "",
    description: "",
    managerUsername: "",
    managerPassword: "",
    managerFullName: "",
    managerEmail: "",
    managerPhone: "",
  });

  // Address dropdown states
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Fetch provinces on mount
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

  // Fetch districts when province changes
  useEffect(() => {
    if (!selectedProvince) {
      setDistricts([]);
      setWards([]);
      return;
    }
    const fetchDistricts = async () => {
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
    fetchDistricts();
    setSelectedDistrict("");
    setSelectedWard("");
    setWards([]);
  }, [selectedProvince]);

  // Fetch wards when district changes
  useEffect(() => {
    if (!selectedDistrict) {
      setWards([]);
      return;
    }
    const fetchWards = async () => {
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
    fetchWards();
    setSelectedWard("");
  }, [selectedDistrict]);

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
    const parts = [addressDetail, wardName, districtName, provinceName].filter(
      Boolean,
    );
    setCreateForm((f) => ({ ...f, location: parts.join(", ") }));
  }, [
    selectedProvince,
    selectedDistrict,
    selectedWard,
    addressDetail,
    provinces,
    districts,
    wards,
  ]);

  const resetAddressFields = () => {
    setSelectedProvince("");
    setSelectedDistrict("");
    setSelectedWard("");
    setAddressDetail("");
    setDistricts([]);
    setWards([]);
  };

  // Handle view detail
  const handleViewDetail = async (shelterId) => {
    setShowDetailModal(true);
    setLoadingDetail(true);
    setShelterDetail(null);

    const result = await getShelterDetail(shelterId);
    setLoadingDetail(false);
    if (result.success) {
      setShelterDetail(result.data);
    } else {
      toast.error("Không thể tải thông tin trạm: " + result.error);
      setShowDetailModal(false);
    }
  };

  // Pet status helpers
  const getPetStatusBadge = (status) =>
    ({
      Available: {
        text: "Sẵn sàng",
        color: "#10b981",
        bg: "#d1fae5",
        icon: "✅",
      },
      Adopted: {
        text: "Đã nhận nuôi",
        color: "#3b82f6",
        bg: "#dbeafe",
        icon: "🏠",
      },
      InTreatment: {
        text: "Đang điều trị",
        color: "#f59e0b",
        bg: "#fef3c7",
        icon: "💊",
      },
      Fostered: {
        text: "Tạm nuôi",
        color: "#8b5cf6",
        bg: "#ede9fe",
        icon: "🤝",
      },
      Lost: { text: "Thất lạc", color: "#ef4444", bg: "#fee2e2", icon: "🔍" },
    })[status] || { text: status, color: "#6b7280", bg: "#f3f4f6", icon: "❓" };

  // Fetch shelters
  const fetchShelters = async () => {
    setLoading(true);
    setError(null);

    const result = await getAllShelters({
      Status: statusFilter || undefined,
      Page: 1,
      PageSize: 50,
    });

    if (result.success) {
      setShelters(result.data.items || result.data || []);
    } else {
      setError(result.error);
      toast.error("Không thể tải danh sách shelters: " + result.error);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchShelters();
  }, [statusFilter]);

  // Handle status change
  const handleStatusChange = async (shelterId, newStatus) => {
    Modal.confirm({
      title: "Xác nhận thay đổi trạng thái",
      content: `Bạn có chắc muốn đổi trạng thái shelter này thành "${newStatus}"?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        const result = await updateShelterStatus(shelterId, newStatus);

        if (result.success) {
          toast.success(result.message);
          fetchShelters();
        } else {
          toast.error("Lỗi: " + result.error);
        }
      },
    });
  };

  // Handle delete
  const handleDelete = async (shelterId, shelterName) => {
    Modal.confirm({
      title: "⚠️ CẢNH BÁO",
      content: `Bạn có chắc muốn XÓA shelter "${shelterName}"? Hành động này KHÔNG THỂ HOÀN TÁC!`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        const result = await deleteShelter(shelterId);

        if (result.success) {
          toast.success(result.message);
          fetchShelters();
        } else {
          toast.error("Lỗi: " + result.error);
        }
      },
    });
  };

  // Handle create shelter
  const handleCreateShelter = async () => {
    if (
      !createForm.shelterName ||
      !selectedProvince ||
      !createForm.managerUsername ||
      !createForm.managerPassword ||
      !createForm.managerFullName ||
      !createForm.managerEmail
    ) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc!");
      return;
    }
    setCreating(true);
    const payload = {
      ...createForm,
      regionID: createForm.regionID ? Number(createForm.regionID) : undefined,
    };
    const result = await createShelter(payload);
    setCreating(false);
    if (result.success) {
      toast.success(result.message);
      setShowCreateModal(false);
      setCreateForm({
        shelterName: "",
        location: "",
        regionID: "",
        description: "",
        managerUsername: "",
        managerPassword: "",
        managerFullName: "",
        managerEmail: "",
        managerPhone: "",
      });
      setShowPassword(false);
      resetAddressFields();
      fetchShelters();
    } else {
      toast.error("Lỗi: " + result.error);
    }
  };

  // Filter shelters by search term
  const filteredShelters = shelters.filter(
    (shelter) =>
      shelter.shelterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shelter.location?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const inputStyle = {
    width: "100%",
    padding: "0.6rem 0.75rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "0.95rem",
    outline: "none",
  };
  const labelStyle = {
    display: "block",
    marginBottom: "0.3rem",
    fontWeight: 600,
    fontSize: "0.9rem",
    color: "var(--dark)",
  };

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-title-wrapper">
          <h1 className="admin-page-title">Shelter Management</h1>
          <p className="admin-page-subtitle">
            Quản lý tất cả các trạm cứu hộ trong hệ thống
          </p>
        </div>
        <div
          className="admin-page-actions"
          style={{ display: "flex", gap: "0.5rem" }}
        >
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <Plus size={18} />
            <span className="hide-mobile-text">Thêm mới</span>
          </button>
          <button
            onClick={fetchShelters}
            className="btn btn-outline"
            disabled={loading}
          >
            <RefreshCw size={18} />
            <span className="hide-mobile-text">Làm mới</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: "1 1 250px", minWidth: "0", position: "relative" }}>
          <Search
            size={20}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--gray)",
            }}
          />
          <input
            type="text"
            placeholder="Tìm kiếm shelter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem 1rem 0.75rem 2.8rem",
              border: "1px solid #ddd",
              borderRadius: "8px",
              outline: "none",
              fontSize: "1rem",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            overflowX: "auto",
            flexWrap: "wrap",
          }}
        >
          <Filter size={20} color="var(--gray)" style={{ flexShrink: 0 }} />
          {["", "Active", "Inactive", "Pending"].map((status) => (
            <button
              key={status || "all"}
              onClick={() => setStatusFilter(status)}
              className="btn"
              style={{
                padding: "0.6rem 1rem",
                borderRadius: "20px",
                background:
                  statusFilter === status ? "var(--primary)" : "white",
                color: statusFilter === status ? "white" : "var(--dark)",
                border: statusFilter === status ? "none" : "1px solid #ddd",
                fontSize: "0.9rem",
                whiteSpace: "nowrap",
              }}
            >
              {status || "Tất cả"}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <div
            style={{
              display: "inline-block",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid var(--primary)",
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              animation: "spin 1s linear infinite",
            }}
          />
          <p style={{ marginTop: "1rem", color: "var(--gray)" }}>Đang tải...</p>
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
            textAlign: "center",
            marginBottom: "1rem",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="card" style={{ overflowX: "auto", padding: "0" }}>
          <div style={{ minWidth: "900px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    borderBottom: "2px solid #eee",
                    textAlign: "left",
                    background: "#f9fafb",
                  }}
                >
                  <th
                    style={{
                      padding: "1rem",
                      fontWeight: 600,
                      color: "var(--dark)",
                    }}
                  >
                    Shelter Name
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      fontWeight: 600,
                      color: "var(--dark)",
                    }}
                  >
                    Location
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      fontWeight: 600,
                      color: "var(--dark)",
                    }}
                  >
                    Region
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      fontWeight: 600,
                      color: "var(--dark)",
                    }}
                  >
                    Animals
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      fontWeight: 600,
                      color: "var(--dark)",
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      fontWeight: 600,
                      color: "var(--dark)",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredShelters.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      style={{
                        padding: "2rem",
                        textAlign: "center",
                        color: "var(--gray)",
                      }}
                    >
                      Không tìm thấy shelter nào
                    </td>
                  </tr>
                ) : (
                  filteredShelters.map((shelter) => {
                    const statusBadge = getAdminShelterStatusBadge(
                      shelter.status,
                    );
                    return (
                      <tr
                        key={shelter.shelterID}
                        style={{ borderBottom: "1px solid #eee" }}
                      >
                        <td style={{ padding: "1rem", fontWeight: "bold" }}>
                          {shelter.shelterName}
                        </td>
                        <td style={{ padding: "1rem" }}>{shelter.location}</td>
                        <td style={{ padding: "1rem" }}>
                          {shelter.regionName || "-"}
                        </td>
                        <td style={{ padding: "1rem" }}>
                          {shelter.totalPets || 0}
                        </td>
                        <td style={{ padding: "1rem" }}>
                          <span
                            style={{
                              padding: "0.25rem 0.75rem",
                              borderRadius: "20px",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              background: statusBadge.bg,
                              color: statusBadge.color,
                            }}
                          >
                            {statusBadge.icon} {statusBadge.text}
                          </span>
                        </td>
                        <td style={{ padding: "1rem" }}>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              onClick={() =>
                                handleViewDetail(shelter.shelterID)
                              }
                              className="btn btn-outline"
                              style={{
                                padding: "0.5rem 0.75rem",
                                fontSize: "0.85rem",
                                color: "#3b82f6",
                                borderColor: "#93c5fd",
                              }}
                              title="Xem chi tiết"
                            >
                              <Eye size={16} />
                            </button>
                            {shelter.status === "Pending" && (
                              <button
                                onClick={() =>
                                  handleStatusChange(
                                    shelter.shelterID,
                                    "Active",
                                  )
                                }
                                className="btn btn-secondary"
                                style={{
                                  padding: "0.5rem 0.75rem",
                                  fontSize: "0.85rem",
                                }}
                                title="Phê duyệt"
                              >
                                <CheckCircle size={16} /> Duyệt
                              </button>
                            )}
                            {shelter.status === "Active" && (
                              <button
                                onClick={() =>
                                  handleStatusChange(
                                    shelter.shelterID,
                                    "Inactive",
                                  )
                                }
                                className="btn btn-outline"
                                style={{
                                  padding: "0.5rem 0.75rem",
                                  fontSize: "0.85rem",
                                }}
                                title="Tạm ngưng"
                              >
                                <Ban size={16} />
                              </button>
                            )}
                            {shelter.status === "Inactive" && (
                              <button
                                onClick={() =>
                                  handleStatusChange(
                                    shelter.shelterID,
                                    "Active",
                                  )
                                }
                                className="btn btn-secondary"
                                style={{
                                  padding: "0.5rem 0.75rem",
                                  fontSize: "0.85rem",
                                }}
                                title="Kích hoạt lại"
                              >
                                <CheckCircle size={16} />
                              </button>
                            )}
                            <button
                              onClick={() =>
                                handleDelete(
                                  shelter.shelterID,
                                  shelter.shelterName,
                                )
                              }
                              className="btn btn-outline"
                              style={{
                                padding: "0.5rem 0.75rem",
                                color: "var(--danger)",
                                borderColor: "var(--danger)",
                                fontSize: "0.85rem",
                              }}
                              title="Xóa shelter"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Shelter Detail Modal ─── */}
      {showDetailModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "680px",
              maxHeight: "90vh",
              overflow: "auto",
              animation: "slideUp 0.3s ease-out",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid #eee",
                position: "sticky",
                top: 0,
                background: "white",
                zIndex: 10,
              }}
            >
              <h2 style={{ margin: 0, fontSize: "1.2rem" }}>
                🏥 Chi Tiết Trạm Cứu Hộ
              </h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setShelterDetail(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.25rem",
                }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "1.5rem" }}>
              {loadingDetail ? (
                <div style={{ textAlign: "center", padding: "3rem" }}>
                  <div
                    style={{
                      display: "inline-block",
                      border: "4px solid #f3f3f3",
                      borderTop: "4px solid var(--primary)",
                      borderRadius: "50%",
                      width: "45px",
                      height: "45px",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  <p style={{ marginTop: "0.75rem", color: "var(--gray)" }}>
                    Đang tải thông tin...
                  </p>
                </div>
              ) : shelterDetail ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.25rem",
                  }}
                >
                  {/* Shelter Info Header */}
                  <div
                    style={{
                      padding: "1rem 1.25rem",
                      borderRadius: "12px",
                      background:
                        "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
                      border: "1px solid #bbf7d0",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "0.75rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3
                          style={{
                            margin: "0 0 0.25rem",
                            fontSize: "1.15rem",
                            fontWeight: 700,
                            color: "var(--dark)",
                          }}
                        >
                          {shelterDetail.shelterName}
                        </h3>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            color: "#6b7280",
                            fontSize: "0.88rem",
                          }}
                        >
                          <MapPin size={14} />
                          <span>{shelterDetail.location || "—"}</span>
                        </div>
                      </div>
                      {(() => {
                        const badge = getAdminShelterStatusBadge(
                          shelterDetail.status,
                        );
                        return (
                          <span
                            style={{
                              padding: "0.25rem 0.75rem",
                              borderRadius: "20px",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              background: badge.bg,
                              color: badge.color,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {badge.icon} {badge.text}
                          </span>
                        );
                      })()}
                    </div>
                    {shelterDetail.regionName && (
                      <div
                        style={{
                          marginTop: "0.5rem",
                          fontSize: "0.85rem",
                          color: "#059669",
                        }}
                      >
                        🌍 Khu vực: <strong>{shelterDetail.regionName}</strong>
                      </div>
                    )}
                    {shelterDetail.description && (
                      <p
                        style={{
                          margin: "0.5rem 0 0",
                          fontSize: "0.88rem",
                          color: "#4b5563",
                          lineHeight: 1.5,
                        }}
                      >
                        {shelterDetail.description}
                      </p>
                    )}
                    {shelterDetail.createdAt && (
                      <div
                        style={{
                          marginTop: "0.5rem",
                          fontSize: "0.8rem",
                          color: "#9ca3af",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                        }}
                      >
                        <Calendar size={12} />
                        Ngày tạo:{" "}
                        {new Date(shelterDetail.createdAt).toLocaleDateString(
                          "vi-VN",
                        )}
                      </div>
                    )}
                  </div>

                  {/* Manager Info */}
                  <div>
                    <p
                      style={{
                        margin: "0 0 0.5rem",
                        fontWeight: 600,
                        color: "var(--primary)",
                        fontSize: "0.95rem",
                      }}
                    >
                      👤 Thông tin quản lý
                    </p>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "0.6rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.55rem 0.75rem",
                          background: "#f9fafb",
                          borderRadius: "8px",
                        }}
                      >
                        <User
                          size={15}
                          style={{ color: "var(--gray)", flexShrink: 0 }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: "0.72rem",
                              color: "var(--gray)",
                            }}
                          >
                            Họ tên
                          </div>
                          <div
                            style={{
                              fontSize: "0.88rem",
                              fontWeight: 600,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {shelterDetail.managerName || "—"}
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.55rem 0.75rem",
                          background: "#f9fafb",
                          borderRadius: "8px",
                        }}
                      >
                        <Mail
                          size={15}
                          style={{ color: "var(--gray)", flexShrink: 0 }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: "0.72rem",
                              color: "var(--gray)",
                            }}
                          >
                            Email
                          </div>
                          <div
                            style={{
                              fontSize: "0.88rem",
                              fontWeight: 600,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {shelterDetail.managerEmail || "—"}
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.55rem 0.75rem",
                          background: "#f9fafb",
                          borderRadius: "8px",
                        }}
                      >
                        <Phone
                          size={15}
                          style={{ color: "var(--gray)", flexShrink: 0 }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: "0.72rem",
                              color: "var(--gray)",
                            }}
                          >
                            SĐT
                          </div>
                          <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>
                            {shelterDetail.managerPhone || "—"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "0.6rem",
                    }}
                  >
                    <div
                      style={{
                        padding: "0.75rem",
                        borderRadius: "10px",
                        textAlign: "center",
                        background: "#eff6ff",
                        border: "1px solid #bfdbfe",
                      }}
                    >
                      <PawPrint
                        size={20}
                        style={{ color: "#3b82f6", marginBottom: "0.25rem" }}
                      />
                      <div
                        style={{
                          fontSize: "1.3rem",
                          fontWeight: 700,
                          color: "#1d4ed8",
                        }}
                      >
                        {shelterDetail.totalPets ?? 0}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#6b7280" }}>
                        Động vật
                      </div>
                    </div>
                    <div
                      style={{
                        padding: "0.75rem",
                        borderRadius: "10px",
                        textAlign: "center",
                        background: "#fef3c7",
                        border: "1px solid #fde68a",
                      }}
                    >
                      <Calendar
                        size={20}
                        style={{ color: "#f59e0b", marginBottom: "0.25rem" }}
                      />
                      <div
                        style={{
                          fontSize: "1.3rem",
                          fontWeight: 700,
                          color: "#b45309",
                        }}
                      >
                        {shelterDetail.totalEvents ?? 0}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#6b7280" }}>
                        Sự kiện
                      </div>
                    </div>
                    <div
                      style={{
                        padding: "0.75rem",
                        borderRadius: "10px",
                        textAlign: "center",
                        background: "#fce7f3",
                        border: "1px solid #fbcfe8",
                      }}
                    >
                      <Users
                        size={20}
                        style={{ color: "#ec4899", marginBottom: "0.25rem" }}
                      />
                      <div
                        style={{
                          fontSize: "1.3rem",
                          fontWeight: 700,
                          color: "#be185d",
                        }}
                      >
                        {shelterDetail.totalVolunteers ?? 0}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#6b7280" }}>
                        Tình nguyện viên
                      </div>
                    </div>
                  </div>

                  {/* Pets List */}
                  {shelterDetail.pets && shelterDetail.pets.length > 0 && (
                    <div>
                      <p
                        style={{
                          margin: "0 0 0.5rem",
                          fontWeight: 600,
                          color: "var(--primary)",
                          fontSize: "0.95rem",
                        }}
                      >
                        🐾 Danh sách động vật ({shelterDetail.pets.length})
                      </p>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.6rem",
                          maxHeight: "300px",
                          overflowY: "auto",
                          paddingRight: "0.25rem",
                        }}
                      >
                        {shelterDetail.pets.map((pet) => {
                          const petBadge = getPetStatusBadge(pet.status);
                          return (
                            <div
                              key={pet.petID}
                              style={{
                                display: "flex",
                                gap: "0.75rem",
                                padding: "0.75rem",
                                background: "#f9fafb",
                                borderRadius: "10px",
                                border: "1px solid #f3f4f6",
                                transition: "box-shadow 0.15s",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.boxShadow =
                                  "0 2px 8px rgba(0,0,0,0.08)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.boxShadow = "none")
                              }
                            >
                              {/* Pet Image */}
                              <div
                                style={{
                                  width: "64px",
                                  height: "64px",
                                  borderRadius: "10px",
                                  overflow: "hidden",
                                  flexShrink: 0,
                                  background: "#e5e7eb",
                                }}
                              >
                                {pet.imageURL ? (
                                  <img
                                    src={pet.imageURL}
                                    alt={pet.petName}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                      e.target.nextSibling.style.display =
                                        "flex";
                                    }}
                                  />
                                ) : null}
                                <div
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    display: pet.imageURL ? "none" : "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "1.5rem",
                                  }}
                                >
                                  {pet.categoryName === "Chó"
                                    ? "🐕"
                                    : pet.categoryName === "Mèo"
                                      ? "🐈"
                                      : "🐾"}
                                </div>
                              </div>

                              {/* Pet Info */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontWeight: 700,
                                      fontSize: "0.95rem",
                                      color: "var(--dark)",
                                    }}
                                  >
                                    {pet.petName}
                                  </span>
                                  <span
                                    style={{
                                      padding: "0.15rem 0.5rem",
                                      borderRadius: "12px",
                                      fontSize: "0.75rem",
                                      fontWeight: 600,
                                      background: petBadge.bg,
                                      color: petBadge.color,
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {petBadge.icon} {petBadge.text}
                                  </span>
                                </div>
                                <div
                                  style={{
                                    fontSize: "0.82rem",
                                    color: "#6b7280",
                                    marginTop: "0.15rem",
                                  }}
                                >
                                  {pet.breed && <span>{pet.breed}</span>}
                                  {pet.breed && pet.categoryName && (
                                    <span> • </span>
                                  )}
                                  {pet.categoryName && (
                                    <span style={{ color: "#f59e0b" }}>
                                      {pet.categoryName}
                                    </span>
                                  )}
                                </div>
                                {pet.description && (
                                  <p
                                    style={{
                                      margin: "0.25rem 0 0",
                                      fontSize: "0.8rem",
                                      color: "#9ca3af",
                                      lineHeight: 1.4,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      display: "-webkit-box",
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: "vertical",
                                    }}
                                  >
                                    {pet.description}
                                  </p>
                                )}
                                {pet.updatedAt && (
                                  <div
                                    style={{
                                      fontSize: "0.72rem",
                                      color: "#d1d5db",
                                      marginTop: "0.2rem",
                                    }}
                                  >
                                    Cập nhật:{" "}
                                    {new Date(pet.updatedAt).toLocaleDateString(
                                      "vi-VN",
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* No pets message */}
                  {shelterDetail.pets && shelterDetail.pets.length === 0 && (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "1.5rem",
                        background: "#f9fafb",
                        borderRadius: "10px",
                        color: "var(--gray)",
                      }}
                    >
                      <PawPrint
                        size={32}
                        style={{ opacity: 0.3, marginBottom: "0.5rem" }}
                      />
                      <p style={{ margin: 0 }}>
                        Chưa có động vật nào trong trạm
                      </p>
                    </div>
                  )}

                  {/* Close Button */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      paddingTop: "0.5rem",
                      borderTop: "1px solid #eee",
                    }}
                  >
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        setShelterDetail(null);
                      }}
                      className="btn btn-outline"
                      style={{ padding: "0.55rem 1.5rem" }}
                    >
                      Đóng
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Create Shelter Modal */}
      {showCreateModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid #eee",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "1.25rem" }}>
                🏥 Thêm Trạm Cứu Hộ Mới
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.25rem",
                }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Form */}
            <div
              style={{
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontWeight: 600,
                  color: "var(--primary)",
                  fontSize: "0.95rem",
                }}
              >
                📋 Thông tin trạm
              </p>
              <div>
                <label style={labelStyle}>Tên trạm cứu hộ *</label>
                <input
                  style={inputStyle}
                  placeholder="VD: Trạm Cứu Hộ ABC"
                  value={createForm.shelterName}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      shelterName: e.target.value,
                    }))
                  }
                />
              </div>
              {/* Địa chỉ - Dropdowns */}
              <div>
                <label style={labelStyle}>Tỉnh / Thành phố *</label>
                <select
                  style={{
                    ...inputStyle,
                    cursor: "pointer",
                    color: selectedProvince ? "var(--dark)" : "#999",
                  }}
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  disabled={loadingProvinces}
                >
                  <option value="">
                    {loadingProvinces
                      ? "Đang tải..."
                      : "-- Chọn Tỉnh/Thành phố --"}
                  </option>
                  {provinces.map((p) => (
                    <option
                      key={p.code}
                      value={p.code}
                      style={{ color: "var(--dark)" }}
                    >
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Quận / Huyện</label>
                  <select
                    style={{
                      ...inputStyle,
                      cursor: "pointer",
                      color: selectedDistrict ? "var(--dark)" : "#999",
                    }}
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    disabled={!selectedProvince || loadingDistricts}
                  >
                    <option value="">
                      {loadingDistricts
                        ? "Đang tải..."
                        : "-- Chọn Quận/Huyện --"}
                    </option>
                    {districts.map((d) => (
                      <option
                        key={d.code}
                        value={d.code}
                        style={{ color: "var(--dark)" }}
                      >
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Phường / Xã</label>
                  <select
                    style={{
                      ...inputStyle,
                      cursor: "pointer",
                      color: selectedWard ? "var(--dark)" : "#999",
                    }}
                    value={selectedWard}
                    onChange={(e) => setSelectedWard(e.target.value)}
                    disabled={!selectedDistrict || loadingWards}
                  >
                    <option value="">
                      {loadingWards ? "Đang tải..." : "-- Chọn Phường/Xã --"}
                    </option>
                    {wards.map((w) => (
                      <option
                        key={w.code}
                        value={w.code}
                        style={{ color: "var(--dark)" }}
                      >
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>
                  Địa chỉ chi tiết (Số nhà, đường)
                </label>
                <input
                  style={inputStyle}
                  placeholder="VD: 123 Đường Nguyễn Huệ"
                  value={addressDetail}
                  onChange={(e) => setAddressDetail(e.target.value)}
                />
              </div>
              {createForm.location && (
                <div
                  style={{
                    padding: "0.5rem 0.75rem",
                    background: "#f0fdf4",
                    borderRadius: "8px",
                    border: "1px solid #bbf7d0",
                    fontSize: "0.85rem",
                  }}
                >
                  📍 <strong>Địa chỉ:</strong> {createForm.location}
                </div>
              )}
              <div>
                <label style={labelStyle}>Khu vực *</label>
                <select
                  style={{
                    ...inputStyle,
                    cursor: "pointer",
                    color: createForm.regionID ? "var(--dark)" : "#999",
                  }}
                  value={createForm.regionID}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, regionID: e.target.value }))
                  }
                >
                  <option value="">-- Chọn khu vực --</option>
                  <option value="1" style={{ color: "var(--dark)" }}>
                    🏔️ Miền Bắc
                  </option>
                  <option value="2" style={{ color: "var(--dark)" }}>
                    🏖️ Miền Trung
                  </option>
                  <option value="3" style={{ color: "var(--dark)" }}>
                    🌆 Miền Nam
                  </option>
                  <option value="4" style={{ color: "var(--dark)" }}>
                    🌾 Miền Tây
                  </option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Mô tả</label>
                <textarea
                  style={{
                    ...inputStyle,
                    minHeight: "70px",
                    resize: "vertical",
                  }}
                  placeholder="Mô tả về trạm cứu hộ..."
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid #eee",
                  margin: "0.25rem 0",
                }}
              />
              <p
                style={{
                  margin: 0,
                  fontWeight: 600,
                  color: "var(--primary)",
                  fontSize: "0.95rem",
                }}
              >
                👤 Thông tin quản lý
              </p>
              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Họ tên quản lý *</label>
                  <input
                    style={inputStyle}
                    placeholder="Nguyễn Văn A"
                    value={createForm.managerFullName}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        managerFullName: e.target.value,
                      }))
                    }
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Username *</label>
                  <input
                    style={inputStyle}
                    placeholder="manager_abc"
                    value={createForm.managerUsername}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        managerUsername: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Mật khẩu *</label>
                <div style={{ position: "relative" }}>
                  <input
                    style={{ ...inputStyle, paddingRight: "2.5rem" }}
                    type={showPassword ? "text" : "password"}
                    placeholder="Password@123"
                    value={createForm.managerPassword}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        managerPassword: e.target.value,
                      }))
                    }
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "8px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--gray)",
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Email *</label>
                  <input
                    style={inputStyle}
                    type="email"
                    placeholder="manager@shelter.com"
                    value={createForm.managerEmail}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        managerEmail: e.target.value,
                      }))
                    }
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Số điện thoại</label>
                  <input
                    style={inputStyle}
                    type="tel"
                    placeholder="0909123456"
                    value={createForm.managerPhone}
                    onChange={(e) =>
                      setCreateForm((f) => ({
                        ...f,
                        managerPhone: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.75rem",
                padding: "1rem 1.5rem",
                borderTop: "1px solid #eee",
              }}
            >
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn btn-outline"
                style={{ padding: "0.6rem 1.25rem" }}
              >
                Hủy
              </button>
              <button
                onClick={handleCreateShelter}
                className="btn btn-primary"
                style={{ padding: "0.6rem 1.25rem" }}
                disabled={creating}
              >
                {creating ? "Đang tạo..." : "✅ Tạo trạm cứu hộ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShelterManager;

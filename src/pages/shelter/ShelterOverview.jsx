import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  List,
  Alert,
  Space,
  Spin,
  Modal,
  Flex,
} from "antd";
import {
  Package,
  MapPin,
  Plus,
  Clock,
  TrendingUp,
  PawPrint,
  User as UserIcon,
  Settings,
  Upload,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  getShelterDashboard,
  getShelterProfile,
  updateShelterProfile,
} from "../../services/shelter/shelterDashboardService";
import { uploadImage } from "../../services/public/uploadService";

const ShelterOverview = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  // Profile state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    shelterName: "",
    location: "",
    description: "",
    accountNumber: "",
    accountOwner: "",
    bankBin: "",
    bankName: "",
    imageUrls: [],
  });

  const shelterID = user?.shelterID || 1; // fallback for dev

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const result = await getShelterDashboard(shelterID);

        if (result.success) {
          setDashboardData(result.data);
        } else {
          toast.error(result.error || "Không thể tải dữ liệu dashboard");
        }
      } catch (error) {
        toast.error("Đã xảy ra lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [shelterID]);

  // Handle profile image upload
  const handleProfileImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newImageUrls = [...profileData.imageUrls];

    for (const file of files) {
      if (newImageUrls.length >= 5) {
        toast.error("Chỉ được upload tối đa 5 ảnh");
        break;
      }

      const result = await uploadImage(file);
      if (result.success) {
        newImageUrls.push(result.data.imageUrl);
      } else {
        toast.error(`Lỗi tải ảnh ${file.name}: ${result.error}`);
      }
    }

    setProfileData((prev) => ({ ...prev, imageUrls: newImageUrls }));
    e.target.value = "";
  };

  const handleRemoveProfileImage = (indexToRemove) => {
    setProfileData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleProfileUpdate = async () => {
    setProfileLoading(true);
    const result = await updateShelterProfile(shelterID, profileData);
    setProfileLoading(false);

    if (result.success) {
      toast.success(result.message);
      setShowProfileModal(false);
    } else {
      toast.error(result.error);
    }
  };

  const stats = dashboardData?.stats
    ? [
      {
        label: "Tổng Thú Cưng",
        value: dashboardData.stats.totalAnimals || 0,
        icon: <PawPrint size={32} />,
        color: "#FF6B6B",
      },
      {
        label: "Nhận Nuôi (Tháng)",
        value: dashboardData.stats.adoptionsMonth || 0,
        icon: <TrendingUp size={32} />,
        color: "#52C41A",
      },
      {
        label: "Đơn Đợi Duyệt",
        value: dashboardData.stats.pendingApps || 0,
        icon: <Clock size={32} />,
        color: "#FAAD14",
      },
      {
        label: "Hàng Tồn Thấp",
        value: dashboardData.stats.lowStockItems || 0,
        icon: <Package size={32} />,
        color: "#F5222D",
      },
    ]
    : [];

  const recentActivities = dashboardData?.recentActivities || [];
  const urgentAlerts = dashboardData?.urgentAlerts || [];

  return (
    <Spin spinning={loading}>
      <div>
        {/* Header Card */}
        <Card
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
            marginBottom: 24,
          }}
          styles={{
            body: { padding: "32px" },
          }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <h1
                style={{
                  fontSize: "2rem",
                  color: "white",
                  margin: 0,
                  marginBottom: 8,
                }}
              >
                {user?.shelterName || "Happy Paws Rescue"}
              </h1>
              <Space style={{ color: "white", opacity: 0.95 }}>
                <MapPin size={18} />
                <span style={{ fontSize: "1rem" }}>Dashboard Tổng Quan</span>
              </Space>
            </Col>
            <Col>
              <Button
                type="primary"
                size="large"
                icon={<Settings size={18} />}
                onClick={async () => {
                  setProfileLoading(true);
                  setShowProfileModal(true);
                  const result = await getShelterProfile(shelterID);
                  console.log("--- DEBUG: Shelter Profile Result ---", result);

                  if (result.success) {
                    // Normalize data to ensure all fields are captured (handle both camelCase and PascalCase)
                    const normalizedData = {
                      ...result.data,
                      shelterName:
                        result.data.shelterName ||
                        result.data.ShelterName ||
                        "",
                      location:
                        result.data.location || result.data.Location || "",
                      description:
                        result.data.description ||
                        result.data.Description ||
                        "",
                      accountNumber:
                        result.data.accountNumber ||
                        result.data.AccountNumber ||
                        "",
                      accountOwner:
                        result.data.accountOwner ||
                        result.data.AccountOwner ||
                        "",
                      bankBin: result.data.bankBin || result.data.BankBin || "",
                      bankName:
                        result.data.bankName || result.data.BankName || "",
                      imageUrls:
                        result.data.imageUrls || result.data.ImageUrls || [],
                    };
                    setProfileData(normalizedData);
                  } else {
                    toast.error("Không thể tải thông tin hồ sơ");
                  }
                  setProfileLoading(false);
                }}
                style={{
                  background: "white",
                  color: "#667eea",
                  border: "none",
                  fontWeight: 500,
                }}
              >
                Chỉnh sửa hồ sơ
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Stats Grid */}
        {stats.length > 0 && (
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {stats.map((stat, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 8,
                    borderLeft: `4px solid ${stat.color}`,
                  }}
                >
                  <Flex vertical style={{ width: "100%" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ color: stat.color }}>{stat.icon}</div>
                      <Statistic
                        value={stat.value}
                        styles={{
                          content: {
                            fontSize: "2rem",
                            fontWeight: 600,
                            color: stat.color,
                          },
                        }}
                      />
                    </div>
                    <div
                      style={{
                        color: "#8c8c8c",
                        fontSize: "0.9rem",
                        fontWeight: 500,
                      }}
                    >
                      {stat.label}
                    </div>
                  </Flex>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Content Grid */}
        <Row gutter={[16, 16]}>
          {/* Recent Activity */}
          <Col xs={24} lg={16}>
            <Card
              title={
                <span style={{ fontSize: "1.1rem", fontWeight: 600 }}>
                  Hoạt Động Gần Đây
                </span>
              }
              style={{ borderRadius: 8 }}
            >
              {recentActivities.length > 0 ? (
                <List
                  dataSource={recentActivities}
                  renderItem={(item, index) => (
                    <List.Item key={index}>
                      <List.Item.Meta
                        title={
                          <span style={{ fontWeight: 500 }}>
                            {item.description}
                          </span>
                        }
                        description={new Date(item.timestamp).toLocaleString(
                          "vi-VN",
                        )}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "#8c8c8c",
                  }}
                >
                  Chưa có hoạt động nào
                </div>
              )}
            </Card>
          </Col>

          {/* Urgent Alerts */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <span
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    color: "#F5222D",
                  }}
                >
                  ⚠️ Cảnh Báo Khẩn
                </span>
              }
              style={{
                borderRadius: 8,
                borderTop: "3px solid #F5222D",
              }}
            >
              {urgentAlerts.length > 0 ? (
                <Flex vertical gap="small" style={{ width: "100%" }}>
                  {urgentAlerts.map((alert, index) => {
                    const alertType =
                      alert.alertType === "LowStock"
                        ? "warning"
                        : alert.alertType === "HealthCheckDue"
                          ? "info"
                          : "error";
                    return (
                      <Alert
                        key={index}
                        message={alert.message}
                        type={alertType}
                        showIcon
                        style={{ fontSize: "0.9rem" }}
                      />
                    );
                  })}

                  <Button
                    type="link"
                    danger
                    style={{ padding: 0, marginTop: 8 }}
                  >
                    Xem tất cả cảnh báo →
                  </Button>
                </Flex>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "#8c8c8c",
                  }}
                >
                  ✅ Không có cảnh báo
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Profile Edit Modal */}
        <Modal
          title={
            <div style={{ fontSize: "1.25rem", fontWeight: 600 }}>
              Chỉnh sửa hồ sơ trạm cứu hộ
            </div>
          }
          open={showProfileModal}
          onCancel={() => setShowProfileModal(false)}
          onOk={handleProfileUpdate}
          okText="Lưu thay đổi"
          cancelText="Hủy"
          confirmLoading={profileLoading}
          width={700}
          styles={{ body: { padding: "20px 0" } }}
        >
          <div
            style={{ maxHeight: "60vh", overflowY: "auto", padding: "0 24px" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              <div style={{ gridColumn: "span 2" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 500,
                  }}
                >
                  Tên trạm cứu hộ
                </label>
                <input
                  className="profile-input"
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                  }}
                  value={profileData.shelterName}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      shelterName: e.target.value,
                    })
                  }
                />
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 500,
                  }}
                >
                  Địa chỉ
                </label>
                <input
                  className="profile-input"
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                  }}
                  value={profileData.location}
                  onChange={(e) =>
                    setProfileData({ ...profileData, location: e.target.value })
                  }
                />
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 500,
                  }}
                >
                  Mô tả trạm
                </label>
                <textarea
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    minHeight: "100px",
                  }}
                  value={profileData.description}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 500,
                  }}
                >
                  Tên ngân hàng
                </label>
                <input
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                  }}
                  value={profileData.bankName}
                  onChange={(e) =>
                    setProfileData({ ...profileData, bankName: e.target.value })
                  }
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 500,
                  }}
                >
                  Số tài khoản
                </label>
                <input
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                  }}
                  value={profileData.accountNumber}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      accountNumber: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "10px",
                  fontWeight: 500,
                }}
              >
                Hình ảnh trạm (Tối đa 5 ảnh)
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                {profileData.imageUrls.map((url, index) => (
                  <div
                    key={index}
                    style={{
                      position: "relative",
                      width: "100px",
                      height: "100px",
                    }}
                  >
                    <img
                      src={url}
                      alt="shelter"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                    <button
                      onClick={() => handleRemoveProfileImage(index)}
                      style={{
                        position: "absolute",
                        top: "-8px",
                        right: "-8px",
                        background: "#ff4d4f",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "24px",
                        height: "24px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {profileData.imageUrls.length < 5 && (
                  <label
                    style={{
                      width: "100px",
                      height: "100px",
                      border: "2px dashed #ddd",
                      borderRadius: "8px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "#8c8c8c",
                    }}
                  >
                    <Upload size={24} />
                    <span style={{ fontSize: "12px", marginTop: "4px" }}>
                      Tải ảnh
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleProfileImageUpload}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </Spin>
  );
};

export default ShelterOverview;

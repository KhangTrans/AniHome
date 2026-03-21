import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Select,
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
  Clock,
  TrendingUp,
  Image as ImageIcon,
  PawPrint,
  Settings,
  Upload,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  getShelterDashboard,
  getShelterDashboardInfo,
  getShelterProfile,
  getShelterMonthlyDonationTotal,
  updateShelterProfile,
} from "../../services/shelter/shelterDashboardService";
import { uploadImage } from "../../services/public/uploadService";

const ShelterOverview = () => {
  const { user } = useAuth();
  const toast = useToast();

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [shelterInfo, setShelterInfo] = useState(null);
  const [monthlyDonationTotal, setMonthlyDonationTotal] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const month = Number(localStorage.getItem("shelterDonationMonth"));
    return month >= 1 && month <= 12 ? month : currentMonth;
  });
  const [selectedYear, setSelectedYear] = useState(() => {
    const year = Number(localStorage.getItem("shelterDonationYear"));
    return year > 0 ? year : currentYear;
  });

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
  const currencyFormatter = new Intl.NumberFormat("vi-VN");

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [dashboardResult, monthlyDonationResult, shelterInfoResult] =
          await Promise.all([
          getShelterDashboard(shelterID),
          getShelterMonthlyDonationTotal(
            shelterID,
            selectedMonth,
            selectedYear,
          ),
          getShelterDashboardInfo(shelterID),
        ]);

        if (dashboardResult.success) {
          setDashboardData(dashboardResult.data);
        } else {
          toast.error(
            dashboardResult.error || "Không thể tải dữ liệu dashboard",
          );
        }

        if (monthlyDonationResult.success) {
          setMonthlyDonationTotal(monthlyDonationResult.totalAmount || 0);
        } else {
          setMonthlyDonationTotal(0);
        }

        if (shelterInfoResult.success) {
          setShelterInfo(shelterInfoResult.data);
        } else {
          setShelterInfo(null);
        }
      } catch (error) {
        toast.error("Đã xảy ra lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [shelterID, selectedMonth, selectedYear]);

  useEffect(() => {
    localStorage.setItem("shelterDonationMonth", String(selectedMonth));
    localStorage.setItem("shelterDonationYear", String(selectedYear));
  }, [selectedMonth, selectedYear]);

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

  const dashboardStats = dashboardData?.stats || dashboardData?.Stats || {};

  const stats = dashboardData
    ? [
      {
        label: "Tổng Thú Cưng",
        value: dashboardStats.totalAnimals ?? dashboardStats.TotalAnimals ?? 0,
        icon: <PawPrint size={32} />,
        color: "#FF6B6B",
      },
      {
        label: "Nhận Nuôi (Tháng)",
        value:
          dashboardStats.adoptionsMonth ?? dashboardStats.AdoptionsMonth ?? 0,
        icon: <TrendingUp size={32} />,
        color: "#52C41A",
      },
      {
        label: "Đơn Đợi Duyệt",
        value: dashboardStats.pendingApps ?? dashboardStats.PendingApps ?? 0,
        icon: <Clock size={32} />,
        color: "#FAAD14",
      },
      {
        label: `Quyên Góp Tháng ${selectedMonth}/${selectedYear}`,
        value: monthlyDonationTotal || 0,
        icon: <TrendingUp size={32} />,
        color: "#13C2C2",
        isCurrency: true,
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
            <Col flex="auto">
              <Space align="start" size={16}>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 12,
                    overflow: "hidden",
                    background: "rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(255,255,255,0.25)",
                    flexShrink: 0,
                  }}
                >
                  {shelterInfo?.imageUrls?.[0] || shelterInfo?.ImageUrls?.[0] ? (
                    <img
                      src={shelterInfo?.imageUrls?.[0] || shelterInfo?.ImageUrls?.[0]}
                      alt="Shelter"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <ImageIcon size={28} color="white" />
                  )}
                </div>

                <div>
              <h1
                style={{
                  fontSize: "2rem",
                  color: "white",
                  margin: 0,
                  marginBottom: 8,
                }}
              >
                {shelterInfo?.shelterName ||
                  shelterInfo?.ShelterName ||
                  user?.shelterName ||
                  "Happy Paws Rescue"}
              </h1>
              <Space style={{ color: "white", opacity: 0.95 }}>
                <MapPin size={18} />
                <span style={{ fontSize: "1rem" }}>
                  {shelterInfo?.location ||
                    shelterInfo?.Location ||
                    "Dashboard Tổng Quan"}
                </span>
              </Space>
                </div>
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

        <Card
          style={{
            marginBottom: 16,
            borderRadius: 8,
            border: "1px solid #e6f4ff",
            background: "#f7fbff",
          }}
        >
          <Row gutter={[12, 12]} align="middle" justify="space-between">
            <Col xs={24} md={9}>
              <div style={{ fontWeight: 600, color: "#1d39c4" }}>
                Bộ lọc tiền quyên góp
              </div>
              <div style={{ color: "#595959", fontSize: "0.9rem" }}>
                Chọn tháng/năm để xem tổng tiền chính xác.
              </div>
            </Col>

            <Col xs={24} md={15}>
              <Space wrap style={{ width: "100%", justifyContent: "flex-end" }}>
                <Select
                  value={selectedMonth}
                  style={{ width: 130 }}
                  options={Array.from({ length: 12 }, (_, index) => ({
                    label: `Tháng ${index + 1}`,
                    value: index + 1,
                  }))}
                  onChange={setSelectedMonth}
                />
                <Select
                  value={selectedYear}
                  style={{ width: 130 }}
                  options={Array.from({ length: 6 }, (_, index) => {
                    const year = currentYear - index;
                    return { label: `Năm ${year}`, value: year };
                  })}
                  onChange={setSelectedYear}
                />
                <Button
                  onClick={() => {
                    setSelectedMonth(currentMonth);
                    setSelectedYear(currentYear);
                  }}
                >
                  Tháng hiện tại
                </Button>
              </Space>
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
                        formatter={(value) =>
                          stat.isCurrency
                            ? `${currencyFormatter.format(Number(value) || 0)} đ`
                            : value
                        }
                        styles={{
                          content: {
                            fontSize: stat.isCurrency ? "1.5rem" : "2rem",
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
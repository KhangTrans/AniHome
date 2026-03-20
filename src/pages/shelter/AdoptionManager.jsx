import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Card,
  Button,
  Tag,
  Space,
  Typography,
  Spin,
  Tooltip,
  Modal,
  Badge,
} from "antd";
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  User,
  MapPin,
  Home,
  Info,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
  getAdoptionsByShelter,
  updateAdoptionStatus,
} from "../../services/shelter/adoptionService";

const { Title, Text } = Typography;

const AdoptionManager = () => {
  const { user } = useAuth();
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // stores requestId of the item being updated
  const [statusFilter, setStatusFilter] = useState('all'); // Filter state: all, Pending, Approved, Rejected

  const shelterId = user?.shelterID || 1;

  const fetchAdoptions = useCallback(async (filterStatus) => {
    setLoading(true);
    try {
      const status = filterStatus === 'all' ? null : filterStatus;
      console.log('[ADOPTION MANAGER] Fetching adoptions with status:', status);
      const result = await getAdoptionsByShelter(shelterId, status);
      if (result.success) {
        console.log(`[ADOPTION MANAGER] Data Received (${filterStatus}):`, result.data);
        // Map API response fields to component expected fields
        const mappedData = (result.data || []).map(item => ({
          ...item,
          phoneNumber: item.phone || item.phoneNumber,
          housingType: item.homeType || item.housingType,
          hasOtherPets: item.hasPets !== undefined ? item.hasPets : item.hasOtherPets,
          adoptionRequestID: item.requestID || item.adoptionRequestID || item.id || item.adoptionID,
        }));
        setAdoptions(mappedData);
      } else {
        toast.error(
          result.error || "Không thể tải danh sách yêu cầu nhận nuôi",
        );
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [shelterId]);

  useEffect(() => {
    fetchAdoptions(statusFilter);
  }, [fetchAdoptions, statusFilter]);

  const handleUpdateStatus = async (requestId, status) => {
    setActionLoading(requestId);
    try {
      const result = await updateAdoptionStatus(shelterId, requestId, status);
      if (result.success) {
        // Custom message based on status
        const statusMessages = {
          "Approved": "✅ Đã duyệt thành công! Yêu cầu đã được xử lý.",
          "Rejected": "❌ Đã từ chối thành công!",
          "Pending": "⏳ Đã cập nhật trạng thái chờ",
          "AlreadyAdopted": "📋 Đã cập nhật: Pet này đã được nhận nuôi"
        };
        const message = statusMessages[status] || result.message;
        toast.success(message);
        fetchAdoptions(statusFilter); // Reload data with current filter
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Lỗi khi cập nhật trạng thái");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "Approved":
        return (
          <Tag
            style={{
              backgroundColor: "#52c41a",
              color: "#fff",
              borderColor: "#52c41a",
            }}
            icon={
              <CheckCircle
                size={14}
                style={{ verticalAlign: "middle", marginRight: 4 }}
              />
            }
          >
            Đã duyệt
          </Tag>
        );
      case "Rejected":
        return (
          <Tag
            style={{
              backgroundColor: "#ff4d4f",
              color: "#fff",
              borderColor: "#ff4d4f",
            }}
            icon={
              <XCircle
                size={14}
                style={{ verticalAlign: "middle", marginRight: 4 }}
              />
            }
          >
            Từ chối
          </Tag>
        );
      case "Pending":
        return (
          <Tag
            style={{
              backgroundColor: "#faad14",
              color: "#fff",
              borderColor: "#faad14",
            }}
            icon={
              <RefreshCw
                size={14}
                className="animate-spin-slow"
                style={{ verticalAlign: "middle", marginRight: 4 }}
              />
            }
          >
            Đang chờ
          </Tag>
        );
      case "AlreadyAdopted":
        return (
          <Tag
            style={{
              backgroundColor: "#1890ff",
              color: "#fff",
              borderColor: "#1890ff",
            }}
            icon={
              <CheckCircle
                size={14}
                style={{ verticalAlign: "middle", marginRight: 4 }}
              />
            }
          >
            Đã nhận nuôi
          </Tag>
        );
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: "Thông tin người đăng ký",
      key: "userinfo",
      render: (_, record) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <Text strong>
            <User size={14} style={{ marginRight: 4 }} /> {record.fullName}
          </Text>
          <Text type="secondary" size="small">
            {record.phoneNumber}
          </Text>
          <Text type="secondary" size="small">
            <MapPin size={12} /> {record.address || "N/A"}
          </Text>
        </div>
      ),
    },
    {
      title: "Thú cưng",
      key: "pet",
      render: (_, record) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <Text strong>{record.petName}</Text>
          <Tag color="blue">Pet ID: {record.petID}</Tag>
        </div>
      ),
    },
    {
      title: "Chi tiết nhà ở",
      key: "housing",
      render: (_, record) => (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <Text>
            <Home size={14} /> {record.housingType || "N/A"}
          </Text>
          <Text type="secondary" size="small">
            Đã có thú cưng: {record.hasOtherPets ? "Có" : "Chưa"}
          </Text>
        </div>
      ),
    },
    {
      title: "Lý do nhận nuôi",
      dataIndex: "reason",
      key: "reason",
      width: 250,
      render: (text) => (
        <Tooltip title={text}>
          <div
            style={{
              maxWidth: 250,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {text}
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Ngày đăng ký",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Thao tác",
      key: "action",
      fixed: "right",
      render: (_, record) => {
        const requestId =
          record.adoptionRequestID ||
          record.id ||
          record.adoptionID ||
          record.requestID;

        // Nếu status là Pending, hiển thị buttons
        if (record.status === "Pending") {
          return (
            <Space size="middle">
              <Tooltip title="">
                <Button
                  type="primary"
                  loading={actionLoading === requestId}
                  onClick={() => {
                    console.log("Action on Request:", requestId, record);
                    handleUpdateStatus(requestId, "Approved");
                  }}
                  style={{
                    backgroundColor: "#52c41a",
                    borderColor: "#52c41a",
                    color: "#fff",
                  }}
                >
                  Duyệt
                </Button>
              </Tooltip>
              <Button
                danger
                loading={actionLoading === requestId}
                onClick={() => {
                  console.log("Rejecting Request:", requestId, record);
                  handleUpdateStatus(requestId, "Rejected");
                }}
              >
                Từ chối
              </Button>
            </Space>
          );
        }

        // Nếu không phải Pending, hiển thị "Đã xử lý"
        return (
          <Tag color="success" style={{ fontSize: "0.85rem", padding: "0.4rem 0.8rem" }}>
            ✓ Đã xử lý
          </Tag>
        );
      },
    },
  ];

  return (
    <div className="adoption-manager">
      <div
        style={{
          marginBottom: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Quản Lý Nhận Nuôi
          </Title>
          <Text type="secondary">
            Xem và xét duyệt các yêu cầu nhận nuôi thú cưng tại trạm
          </Text>
        </div>
        <Button
          icon={<RefreshCw size={16} />}
          onClick={() => fetchAdoptions(statusFilter)}
          loading={loading}
        >
          Làm mới
        </Button>
      </div>

      <Card className="glass-card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <Text strong>Lọc theo trạng thái:</Text>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Button
              type={statusFilter === "all" ? "primary" : "default"}
              danger={statusFilter === "all"}
              onClick={() => {
                setStatusFilter("all");
              }}
              style={{
                backgroundColor: statusFilter === "all" ? "#ff4d4f" : "transparent",
                borderColor: statusFilter === "all" ? "#ff4d4f" : "#d9d9d9",
                color: statusFilter === "all" ? "#fff" : "#000",
              }}
            >
              Tất cả
            </Button>
            <Button
              type={statusFilter === "Pending" ? "primary" : "default"}
              onClick={() => {
                setStatusFilter("Pending");
              }}
              style={{
                backgroundColor: statusFilter === "Pending" ? "#faad14" : "transparent",
                borderColor: statusFilter === "Pending" ? "#faad14" : "#d9d9d9",
                color: statusFilter === "Pending" ? "#fff" : "#000",
              }}
            >
              Đang chờ
            </Button>
            <Button
              type={statusFilter === "Approved" ? "primary" : "default"}
              onClick={() => {
                setStatusFilter("Approved");
              }}
              style={{
                backgroundColor: statusFilter === "Approved" ? "#52c41a" : "transparent",
                borderColor: statusFilter === "Approved" ? "#52c41a" : "#d9d9d9",
                color: statusFilter === "Approved" ? "#fff" : "#000",
              }}
            >
              Đã duyệt
            </Button>
            <Button
              type={statusFilter === "Rejected" ? "primary" : "default"}
              onClick={() => {
                setStatusFilter("Rejected");
              }}
              style={{
                backgroundColor: statusFilter === "Rejected" ? "#f5222d" : "transparent",
                borderColor: statusFilter === "Rejected" ? "#f5222d" : "#d9d9d9",
                color: statusFilter === "Rejected" ? "#fff" : "#000",
              }}
            >
              Đã từ chối
            </Button>
            <Button
              type={statusFilter === "AlreadyAdopted" ? "primary" : "default"}
              onClick={() => {
                setStatusFilter("AlreadyAdopted");
              }}
              style={{
                backgroundColor: statusFilter === "AlreadyAdopted" ? "#1890ff" : "transparent",
                borderColor: statusFilter === "AlreadyAdopted" ? "#1890ff" : "#d9d9d9",
                color: statusFilter === "AlreadyAdopted" ? "#fff" : "#000",
              }}
            >
              Đã được nhận nuôi
            </Button>
          </div>
        </div>
      </Card>

      <Card className="glass-card">
        {adoptions.length === 0 && !loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <Text type="secondary">Không có yêu cầu nhận nuôi</Text>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={adoptions}
            rowKey={(record, index) =>
              record.adoptionRequestID || `adoption-${index}`
            }
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 1000 }}
          />
        )}
      </Card>
    </div>
  );
};

export default AdoptionManager;

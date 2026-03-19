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

  const shelterId = user?.shelterID || 1;

  const fetchAdoptions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAdoptionsByShelter(shelterId);
      if (result.success) {
        console.log("Adoption Data Received:", result.data);
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
    fetchAdoptions();
  }, [fetchAdoptions]);

  const handleUpdateStatus = async (requestId, status) => {
    setActionLoading(requestId);
    try {
      const result = await updateAdoptionStatus(shelterId, requestId, status);
      if (result.success) {
        toast.success(result.message);
        fetchAdoptions(); // Reload data
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
            color="success"
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
            color="error"
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
            color="warning"
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
        if (record.status !== "Pending") return null;

        const requestId =
          record.adoptionRequestID ||
          record.id ||
          record.adoptionID ||
          record.requestID;

        return (
          <Space size="middle">
            <Button
              type="primary"
              className="btn-success"
              loading={actionLoading === requestId}
              onClick={() => {
                console.log("Action on Request:", requestId, record);
                handleUpdateStatus(requestId, "Approved");
              }}
            >
              Duyệt
            </Button>
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
          onClick={fetchAdoptions}
          loading={loading}
        >
          Làm mới
        </Button>
      </div>

      <Card className="glass-card">
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
      </Card>
    </div>
  );
};

export default AdoptionManager;

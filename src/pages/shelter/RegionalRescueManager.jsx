import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Input,
  message,
  Card,
  Typography,
  Tooltip,
  Image,
} from "antd";
import {
  MapPin,
  Phone,
  User,
  AlertCircle,
  Eye,
  Clock,
  ExternalLink,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  getRegionalRequests,
  processRescueRequest,
} from "../../services/public/surrenderService";
import { useAuth } from "../../context/AuthContext";

const { Title, Text } = Typography;
const { TextArea } = Input;

const RegionalRescueManager = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processModalVisible, setProcessModalVisible] = useState(false);
  const [processStatus, setProcessStatus] = useState(null); // 1: Agree, 2: Refuse
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all"); // all, Pending, Approved, Rejected
  const { user } = useAuth();

  console.log('[REGIONAL RESCUE] User:', user);

  // Initial fetch on component mount
  useEffect(() => {
    console.log('[REGIONAL RESCUE] Component mounted, initial fetch trigger');
    // Fetch all requests initially
    fetchRequests(null);
  }, []);

  // Fetch when status filter changes
  useEffect(() => {
    console.log('[REGIONAL RESCUE] Status filter changed to:', statusFilter);
    const status = statusFilter === "all" ? null : statusFilter;
    fetchRequests(status);
  }, [statusFilter]);

  const fetchRequests = async (filterStatus = null) => {
    setLoading(true);
    console.log('[REGIONAL RESCUE] Fetching requests with status:', filterStatus);
    console.log('[REGIONAL RESCUE] User shelterID:', user?.shelterID);
    const result = await getRegionalRequests(filterStatus);
    console.log('[REGIONAL RESCUE] Fetch result:', result);
    if (result.success) {
      console.log('[REGIONAL RESCUE] Data received, count:', result.data?.length || 0);
      setRequests(result.data || []);
    } else {
      console.error('[REGIONAL RESCUE] Error:', result.error);
      message.error(result.error);
      setRequests([]);
    }
    setLoading(false);
  };

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    // Fetch data with the selected status filter
    fetchRequests(newStatus === "all" ? null : newStatus);
  };

  const handleOpenProcessModal = (request, status) => {
    console.log("[DEBUG] Modal opened with request:", request);
    console.log("[DEBUG] RequestID value:", request.RequestID);
    console.log("[DEBUG] All keys:", Object.keys(request));
    setSelectedRequest(request);
    setProcessStatus(status);
    setNotes(
      status === 1
        ? "Đội cứu hộ của trạm đang trên đường đến địa chỉ của bạn."
        : "",
    );
    setProcessModalVisible(true);
  };

  const handleProcessSubmit = async () => {
    if (!notes.trim()) {
      message.warning("Vui lòng nhập ghi chú.");
      return;
    }

    console.log("[DEBUG] Submitting with selectedRequest:", selectedRequest);
    console.log("[DEBUG] requestID to send:", selectedRequest.requestID);

    setProcessing(true);
    const result = await processRescueRequest(selectedRequest.requestID, {
      action: processStatus === 1 ? "Approved" : "Rejected",
      notes: notes,
    });

    if (result.success) {
      message.success(
        processStatus === 1
          ? "Đã tiếp nhận yêu cầu giải cứu"
          : "Đã từ chối yêu cầu",
      );
      setProcessModalVisible(false);

      if (processStatus === 1) {
        // If accepting, reset to "Tất cả" filter
        await fetchRequests(null);
        setStatusFilter("all");
      } else {
        // If rejecting, stay on Rejected filter
        await fetchRequests("Rejected");
        setStatusFilter("Rejected");
      }
    } else {
      message.error(result.error);
    }
    setProcessing(false);
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "Pending":
      case 0:
        return (
          <Tag
            icon={<Clock size={12} />}
            style={{
              backgroundColor: "#faad14",
              color: "#fff",
              borderColor: "#faad14",
            }}
          >
            Chờ xử lý
          </Tag>
        );
      case "Approved":
      case 1:
        return (
          <Tag
            icon={<CheckCircle size={12} />}
            style={{
              backgroundColor: "#52c41a",
              color: "#fff",
              borderColor: "#52c41a",
            }}
          >
            Đã tiếp nhận
          </Tag>
        );
      case "Rejected":
      case 2:
        return (
          <Tag
            icon={<XCircle size={12} />}
            style={{
              backgroundColor: "#ff4d4f",
              color: "#fff",
              borderColor: "#ff4d4f",
            }}
          >
            Đã từ chối
          </Tag>
        );
      default:
        return <Tag color="default">Không xác định</Tag>;
    }
  };

  // Filter requests based on selected status
  const filteredRequests = statusFilter === "all"
    ? requests
    : requests.filter(r => r.status === statusFilter);

  const columns = [
    {
      title: "Hình ảnh",
      dataIndex: "imageUrls",
      key: "imageUrls",
      width: 100,
      render: (urls) => (
        <Image
          src={urls?.[0]}
          alt="thú cưng"
          width={60}
          height={60}
          className="rounded-lg object-cover"
        />
      ),
    },
    {
      title: "Thông tin thú cưng",
      key: "petInfo",
      render: (_, record) => (
        <div>
          <div className="font-bold text-primary">{record.petName}</div>
          <div className="text-gray-500 text-xs">{record.breed}</div>
          <Tag color="volcano" className="mt-1" style={{ fontSize: "10px" }}>
            {record.healthStatus}
          </Tag>
        </div>
      ),
    },
    {
      title: "Vị trí & Địa chỉ",
      key: "location",
      render: (_, record) => (
        <div>
          <div className="flex items-start gap-1 text-xs">
            <MapPin size={14} className="text-red-500 mt-0.5 shrink-0" />
            <span>{record.userAddress}</span>
          </div>
          <a
            href={`https://www.google.com/maps?q=${record.latitude},${record.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-500 flex items-center gap-1 mt-1 hover:underline"
          >
            Xem trên bản đồ <ExternalLink size={12} />
          </a>
        </div>
      ),
    },
    {
      title: "Người báo cáo",
      key: "reporter",
      render: (_, record) => (
        <div className="text-xs">
          <div className="flex items-center gap-1">
            <User size={14} className="text-gray-400" />
            <span>{record.fullName || "Người dùng ẩn danh"}</span>
          </div>
          {record.phoneNumber && (
            <div className="flex items-center gap-1 mt-1">
              <Phone size={14} className="text-gray-400" />
              <span>{record.phoneNumber}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
    },
    {
      title: "Trạm xử lý",
      key: "approvedInfo",
      render: (_, record) => {
        if (record.status === "Pending" || record.status === 0) {
          return <Text type="secondary" className="text-xs">Chờ xử lý</Text>;
        }
        return (
          <div className="text-xs">
            <div className="font-medium">{record.approvedByShelterName || "N/A"}</div>
            {record.approvedAt && (
              <div className="text-gray-500">
                {new Date(record.approvedAt).toLocaleDateString("vi-VN")}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Hành động",
      key: "actions",
      width: 200,
      render: (_, record) => {
        if (record.status === "Pending" || record.status === 0) {
          return (
            <Space size="middle">
              <Button
                type="primary"
                onClick={() => handleOpenProcessModal(record, 1)}
                style={{
                  backgroundColor: "#52c41a",
                  borderColor: "#52c41a",
                  color: "#fff",
                }}
              >
                Tiếp nhận
              </Button>
              <Button
                danger
                onClick={() => handleOpenProcessModal(record, 2)}
              >
                Từ chối
              </Button>
            </Space>
          );
        } else if ((record.status === "Rejected" || record.status === 2) && statusFilter === "Rejected") {
          return (
            <Button
              type="primary"
              onClick={() => handleOpenProcessModal(record, 1)}
              style={{
                backgroundColor: "#52c41a",
                borderColor: "#52c41a",
                color: "#fff",
              }}
            >
              Tiếp nhận
            </Button>
          );
        } else {
          return <span className="text-gray-400 text-xs italic">Đã xử lý</span>;
        }
      },
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 bg-transparent">
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
            Cứu hộ khu vực
          </Title>
          <Text type="secondary">
            Quản lý các yêu cầu cứu hộ và từ bỏ thú cưng trong khu vực của bạn.
          </Text>
        </div>
        <Button
          type="primary"
          onClick={fetchRequests}
          icon={<AlertCircle size={16} />}
          className="flex items-center gap-2"
        >
          Làm mới
        </Button>
      </div>

      <Card className="shadow-sm border-none rounded-2xl overflow-hidden" style={{ marginBottom: "1.5rem" }}>
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-medium text-gray-700">Lọc theo trạng thái:</span>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Button
              type={statusFilter === "all" ? "primary" : "default"}
              danger={statusFilter === "all"}
              onClick={() => handleStatusFilterChange("all")}
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
              onClick={() => handleStatusFilterChange("Pending")}
              style={{
                backgroundColor: statusFilter === "Pending" ? "#faad14" : "transparent",
                borderColor: statusFilter === "Pending" ? "#faad14" : "#d9d9d9",
                color: statusFilter === "Pending" ? "#fff" : "#000",
              }}
            >
              Chờ xử lý
            </Button>
            <Button
              type={statusFilter === "Approved" ? "primary" : "default"}
              onClick={() => handleStatusFilterChange("Approved")}
              style={{
                backgroundColor: statusFilter === "Approved" ? "#52c41a" : "transparent",
                borderColor: statusFilter === "Approved" ? "#52c41a" : "#d9d9d9",
                color: statusFilter === "Approved" ? "#fff" : "#000",
              }}
            >
              Đã tiếp nhận
            </Button>
            <Button
              type={statusFilter === "Rejected" ? "primary" : "default"}
              onClick={() => handleStatusFilterChange("Rejected")}
              style={{
                backgroundColor: statusFilter === "Rejected" ? "#f5222d" : "transparent",
                borderColor: statusFilter === "Rejected" ? "#f5222d" : "#d9d9d9",
                color: statusFilter === "Rejected" ? "#fff" : "#000",
              }}
            >
              Đã từ chối
            </Button>
          </div>
        </div>
      </Card>

      <Card className="shadow-sm border-none rounded-2xl overflow-hidden">
        {filteredRequests.length === 0 && !loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <Text type="secondary">Không có yêu cầu cứu hộ</Text>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredRequests}
            loading={loading}
            rowKey="requestID"
            pagination={{ pageSize: 10 }}
            className="rescue-table"
          />
        )}
      </Card>

      {/* Process Modal */}
      <Modal
        title={processStatus === 1 ? "Xác nhận tiếp nhận" : "Xác nhận từ chối"}
        open={processModalVisible}
        onOk={handleProcessSubmit}
        onCancel={() => setProcessModalVisible(false)}
        confirmLoading={processing}
        okText={processStatus === 1 ? "Tiếp nhận ngay" : "Xác nhận từ chối"}
        okButtonProps={{
          danger: processStatus === 2,
          className: processStatus === 1 ? "bg-green-500 border-none" : "",
        }}
        cancelText="Hủy"
        width={500}
      >
        <div className="py-4 space-y-4">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 italic text-gray-600 text-sm">
            "{selectedRequest?.reason}"
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú phản hồi cho người báo cáo:
            </label>
            <TextArea
              rows={4}
              placeholder="Nhập ghi chú (VD: Thời gian dự kiến đến, lý do từ chối...)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="rounded-xl"
            />
          </div>
        </div>
      </Modal>

      <style jsx>{`
        .rescue-table :global(.ant-table-thead > tr > th) {
          background: #f8fafc;
          font-weight: 600;
        }
        .rescue-table :global(.ant-table-tbody > tr:hover > td) {
          background: #f1f5f9;
        }
      `}</style>
    </div>
  );
};

export default RegionalRescueManager;

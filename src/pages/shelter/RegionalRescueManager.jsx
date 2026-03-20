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
  Radio,
} from "antd";
import {
  MapPin,
  Phone,
  User,
  AlertCircle,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
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

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async (filterStatus = null) => {
    setLoading(true);
    const result = await getRegionalRequests(filterStatus);
    if (result.success) {
      setRequests(result.data);
    } else {
      message.error(result.error);
    }
    setLoading(false);
  };

  const handleStatusFilterChange = (e) => {
    const newStatus = e.target.value;
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
      fetchRequests(); // Refresh list
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
          <Tag icon={<Clock size={12} />} color="warning">
            Chờ xử lý
          </Tag>
        );
      case "Approved":
      case 1:
        return (
          <Tag icon={<CheckCircle size={12} />} color="success">
            Đã tiếp nhận
          </Tag>
        );
      case "Rejected":
      case 2:
        return (
          <Tag icon={<XCircle size={12} />} color="error">
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
      title: "Hành động",
      key: "actions",
      width: 150,
      render: (_, record) =>
        record.status === "Pending" || record.status === 0 ? (
          <Space>
            <Tooltip title="Tiếp nhận">
              <Button
                type="primary"
                shape="circle"
                icon={<CheckCircle size={18} />}
                onClick={() => handleOpenProcessModal(record, 1)}
                className="flex items-center justify-center bg-green-500 border-none hover:bg-green-600"
              />
            </Tooltip>
            <Tooltip title="Từ chối">
              <Button
                type="primary"
                danger
                shape="circle"
                icon={<XCircle size={18} />}
                onClick={() => handleOpenProcessModal(record, 2)}
                className="flex items-center justify-center"
              />
            </Tooltip>
          </Space>
        ) : (
          <span className="text-gray-400 text-xs italic">Đã xử lý</span>
        ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 bg-transparent">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} className="!mb-1">
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

      <Card className="shadow-sm border-none rounded-2xl overflow-hidden">
        <div className="mb-4 flex items-center gap-4">
          <span className="font-medium text-gray-700">Lọc theo trạng thái:</span>
          <Radio.Group
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            <Radio.Button value="all">Tất cả</Radio.Button>
            <Radio.Button value="Pending">Chờ xử lý</Radio.Button>
            <Radio.Button value="Approved">Đã tiếp nhận</Radio.Button>
            <Radio.Button value="Rejected">Đã từ chối</Radio.Button>
          </Radio.Group>
        </div>
        <Table
          columns={columns}
          dataSource={filteredRequests}
          loading={loading}
          rowKey="requestID"
          pagination={{ pageSize: 10 }}
          className="rescue-table"
        />
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

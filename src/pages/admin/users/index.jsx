import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Input,
  Select,
  Tag,
  Button,
  Space,
  Card,
  Avatar,
  Modal,
  Descriptions,
  Statistic,
  Row,
  Col,
  Typography,
  Tooltip,
  Badge,
  Flex,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  StopOutlined,
  CheckCircleOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  FileTextOutlined,
  HeartOutlined,
  HomeOutlined,
  TeamOutlined,
  CrownOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import {
  getAllUsers,
  getUserDetail,
  updateUserStatus,
  ROLE_OPTIONS,
  getRoleBadge,
  getStatusBadge,
} from "../../../services/admin/adminUsersService";
import { useToast } from "../../../context/ToastContext";

const { Title, Text } = Typography;
const { confirm } = Modal;

const UserManager = () => {
  const toast = useToast();

  // ── State ──
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState(undefined);
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // ── Fetch Users ──
  const fetchUsers = useCallback(
    async (params = {}) => {
      setLoading(true);
      const page = params.page || pagination.current;
      const size = params.pageSize || pagination.pageSize;

      const queryParams = {
        PageNumber: page,
        PageSize: size,
        ...(searchTerm && { Search: searchTerm }),
        ...(roleFilter && { RoleID: Number(roleFilter) }),
      };
      if (statusFilter === "true") queryParams.IsActive = true;
      else if (statusFilter === "false") queryParams.IsActive = false;

      // Apply overrides
      if (params.Search !== undefined) {
        if (params.Search) queryParams.Search = params.Search;
        else delete queryParams.Search;
      }
      if (params.RoleID !== undefined) {
        if (params.RoleID) queryParams.RoleID = Number(params.RoleID);
        else delete queryParams.RoleID;
      }
      if (params.IsActive !== undefined) {
        if (params.IsActive === "true") queryParams.IsActive = true;
        else if (params.IsActive === "false") queryParams.IsActive = false;
        else delete queryParams.IsActive;
      }

      const result = await getAllUsers(queryParams);

      if (result.success) {
        const data = result.data;
        setUsers(data.items || []);
        setPagination((prev) => ({
          ...prev,
          current: data.currentPage || page,
          total: data.totalCount || 0,
        }));
      } else {
        toast.error("Không thể tải danh sách người dùng: " + result.error);
      }
      setLoading(false);
    },
    [
      searchTerm,
      roleFilter,
      statusFilter,
      pagination.current,
      pagination.pageSize,
      toast,
    ],
  );

  useEffect(() => {
    fetchUsers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──
  const handleSearch = (value) => {
    setSearchTerm(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchUsers({ page: 1, Search: value });
  };

  const handleRoleChange = (value) => {
    setRoleFilter(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchUsers({ page: 1, RoleID: value || undefined });
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchUsers({ page: 1, IsActive: value });
  };

  const handleTableChange = (pag) => {
    setPagination((prev) => ({
      ...prev,
      current: pag.current,
      pageSize: pag.pageSize,
    }));
    fetchUsers({ page: pag.current, pageSize: pag.pageSize });
  };

  // View Detail
  const handleViewDetail = async (userId) => {
    setDetailOpen(true);
    setLoadingDetail(true);
    setSelectedUser(null);

    const result = await getUserDetail(userId);
    setLoadingDetail(false);
    if (result.success) {
      setSelectedUser(result.data);
    } else {
      toast.error("Không thể tải thông tin người dùng: " + result.error);
      setDetailOpen(false);
    }
  };

  // Ban / Unban
  const handleToggleStatus = (user) => {
    const isBanning = user.isActive;
    confirm({
      title: isBanning ? "🚫 Cấm tài khoản?" : "✅ Kích hoạt tài khoản?",
      icon: <ExclamationCircleFilled />,
      content: (
        <div>
          <p>
            Bạn có chắc muốn <strong>{isBanning ? "cấm" : "kích hoạt"}</strong>{" "}
            tài khoản:
          </p>
          <Card size="small" style={{ marginTop: 8 }}>
            <Space>
              <Avatar style={{ background: isBanning ? "#ef4444" : "#10b981" }}>
                {(user.fullName || user.username || "?")
                  .charAt(0)
                  .toUpperCase()}
              </Avatar>
              <div>
                <Text strong>{user.fullName || user.username}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {user.email}
                </Text>
              </div>
            </Space>
          </Card>
        </div>
      ),
      okText: isBanning ? "Cấm tài khoản" : "Kích hoạt",
      okType: isBanning ? "danger" : "primary",
      cancelText: "Hủy",
      onOk: async () => {
        const result = await updateUserStatus(user.userID, !user.isActive);
        if (result.success) {
          toast.success(result.message);
          fetchUsers();
          if (selectedUser && selectedUser.userID === user.userID) {
            setSelectedUser((prev) =>
              prev ? { ...prev, isActive: !user.isActive } : null,
            );
          }
        } else {
          toast.error("Lỗi: " + result.error);
        }
      },
    });
  };

  // ── Role / Status helpers ──
  const getRoleTag = (roleName) => {
    const map = {
      Admin: { color: "purple", icon: <CrownOutlined /> },
      ShelterManager: { color: "blue", icon: <HomeOutlined /> },
      Volunteer: { color: "orange", icon: <TeamOutlined /> },
      Customer: { color: "green", icon: <UserOutlined /> },
    };
    const cfg = map[roleName] || { color: "default", icon: <UserOutlined /> };
    return (
      <Tag
        color={cfg.color}
        icon={cfg.icon}
        style={{ borderRadius: 12, fontWeight: 600 }}
      >
        {roleName === "ShelterManager" ? "Shelter Manager" : roleName}
      </Tag>
    );
  };

  const getStatusTag = (isActive) => (
    <Badge
      status={isActive ? "success" : "error"}
      text={
        <Text
          style={{
            color: isActive ? "#10b981" : "#ef4444",
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          {isActive ? "Hoạt động" : "Bị cấm"}
        </Text>
      }
    />
  );

  // ── Avatar color from name ──
  const getAvatarColor = (name) => {
    const colors = [
      "#f56a00",
      "#7265e6",
      "#ffbf00",
      "#00a2ae",
      "#87d068",
      "#eb2f96",
      "#1677ff",
      "#faad14",
    ];
    const idx = (name || "").charCodeAt(0) % colors.length;
    return colors[idx];
  };

  // ── Table Columns ──
  const columns = [
    {
      title: "#",
      key: "index",
      width: 50,
      align: "center",
      render: (_, __, idx) => (
        <Text type="secondary">
          {(pagination.current - 1) * pagination.pageSize + idx + 1}
        </Text>
      ),
    },
    {
      title: "Người dùng",
      key: "user",
      ellipsis: true,
      render: (_, record) => (
        <Space>
          <Avatar
            size={40}
            style={{
              background: getAvatarColor(record.fullName || record.username),
              fontWeight: 700,
            }}
            src={record.avatarURL || undefined}
          >
            {(record.fullName || record.username || "?")
              .charAt(0)
              .toUpperCase()}
          </Avatar>
          <div>
            <Text strong style={{ display: "block", lineHeight: 1.3 }}>
              {record.fullName || "—"}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              @{record.username}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ellipsis: true,
      render: (text) => <Text style={{ fontSize: 13 }}>{text || "—"}</Text>,
    },
    {
      title: "SĐT",
      dataIndex: "phone",
      key: "phone",
      width: 130,
      render: (text) => <Text style={{ fontSize: 13 }}>{text || "—"}</Text>,
    },
    {
      title: "Vai trò",
      dataIndex: "roleName",
      key: "roleName",
      width: 150,
      render: (roleName) => getRoleTag(roleName),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 130,
      render: (isActive) => getStatusTag(isActive),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date) => (
        <Text type="secondary" style={{ fontSize: 13 }}>
          {date ? new Date(date).toLocaleDateString("vi-VN") : "—"}
        </Text>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 130,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record.userID)}
              style={{ color: "#1677ff" }}
            />
          </Tooltip>
          {record.isActive ? (
            <Tooltip title="Cấm tài khoản">
              <Button
                type="text"
                danger
                icon={<StopOutlined />}
                onClick={() => handleToggleStatus(record)}
              />
            </Tooltip>
          ) : (
            <Tooltip title="Kích hoạt tài khoản">
              <Button
                type="text"
                icon={<CheckCircleOutlined />}
                onClick={() => handleToggleStatus(record)}
                style={{ color: "#10b981" }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  // ── Stat cards for detail modal ──
  const statCards = selectedUser
    ? [
        {
          title: "Bài viết",
          value: selectedUser.totalPosts ?? 0,
          icon: <FileTextOutlined />,
          color: "#1677ff",
        },
        {
          title: "Yêu cầu nhận nuôi",
          value: selectedUser.totalAdoptionRequests ?? 0,
          icon: <HeartOutlined />,
          color: "#ef4444",
        },
        {
          title: "Quyên góp",
          value: selectedUser.totalDonations ?? 0,
          icon: <TeamOutlined />,
          color: "#10b981",
        },
        {
          title: "Quản lý trạm",
          value: selectedUser.managedSheltersCount ?? 0,
          icon: <HomeOutlined />,
          color: "#f59e0b",
        },
      ]
    : [];

  // ── Render ──
  return (
    <div>
      {/* Header */}
      <div className="admin-page-header">
        <div className="admin-page-title-wrapper">
          <h1 className="admin-page-title">Quản Lý Người Dùng</h1>
          <p className="admin-page-subtitle">
            Xem, tìm kiếm, lọc và quản lý tất cả người dùng trong hệ thống
          </p>
        </div>
        <div className="admin-page-actions">
          <Button
            icon={<ReloadOutlined spin={loading} />}
            onClick={() => fetchUsers()}
            loading={loading}
          >
            <span className="hide-mobile-text">Làm mới</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card
        size="small"
        style={{ marginBottom: 16, borderRadius: 12 }}
        styles={{ body: { padding: "12px 16px" } }}
      >
        <Flex gap={12} wrap="wrap" align="center">
          <Input.Search
            placeholder="Tìm theo username, email, họ tên..."
            allowClear
            enterButton={
              <>
                <SearchOutlined /> Tìm
              </>
            }
            onSearch={handleSearch}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: 380, flex: "1 1 280px" }}
            size="middle"
          />
          <Select
            placeholder="Tất cả vai trò"
            value={roleFilter}
            onChange={handleRoleChange}
            allowClear
            style={{ minWidth: 160 }}
            options={[
              { value: 1, label: "👑 Admin" },
              { value: 2, label: "🏠 Shelter Manager" },
              { value: 3, label: "🤝 Volunteer" },
              { value: 4, label: "👤 Customer" },
            ]}
          />
          <Select
            placeholder="Tất cả trạng thái"
            value={statusFilter}
            onChange={handleStatusChange}
            allowClear
            style={{ minWidth: 170 }}
            options={[
              { value: "true", label: "✅ Đang hoạt động" },
              { value: "false", label: "🚫 Đã bị cấm" },
            ]}
          />
        </Flex>
      </Card>

      {/* Users Table */}
      <Card style={{ borderRadius: 12 }} styles={{ body: { padding: 0 } }}>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="userID"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} / ${total} người dùng`,
            pageSizeOptions: ["10", "20", "50"],
            style: { padding: "0 16px" },
          }}
          onChange={handleTableChange}
          scroll={{ x: 950 }}
          rowClassName={(record) => (!record.isActive ? "banned-row" : "")}
          locale={{
            emptyText: (
              <div style={{ padding: "2rem 0" }}>
                <UserOutlined
                  style={{
                    fontSize: 40,
                    color: "#d9d9d9",
                    display: "block",
                    marginBottom: 8,
                  }}
                />
                <Text type="secondary">Không tìm thấy người dùng nào</Text>
              </div>
            ),
          }}
        />
      </Card>

      {/* ─── User Detail Modal ─── */}
      <Modal
        title={
          <Space>
            <UserOutlined />
            <span>Chi Tiết Người Dùng</span>
          </Space>
        }
        open={detailOpen}
        onCancel={() => {
          setDetailOpen(false);
          setSelectedUser(null);
        }}
        footer={
          selectedUser ? (
            <Flex justify="space-between" align="center">
              <Button
                onClick={() => {
                  setDetailOpen(false);
                  setSelectedUser(null);
                }}
              >
                Đóng
              </Button>
              <Button
                type={selectedUser.isActive ? "default" : "primary"}
                danger={selectedUser.isActive}
                icon={
                  selectedUser.isActive ? (
                    <StopOutlined />
                  ) : (
                    <CheckCircleOutlined />
                  )
                }
                onClick={() => {
                  setDetailOpen(false);
                  handleToggleStatus(selectedUser);
                }}
                style={
                  !selectedUser.isActive
                    ? { background: "#10b981", borderColor: "#10b981" }
                    : {}
                }
              >
                {selectedUser.isActive
                  ? "Cấm tài khoản"
                  : "Kích hoạt tài khoản"}
              </Button>
            </Flex>
          ) : null
        }
        width={580}
        loading={loadingDetail}
        destroyOnClose
      >
        {selectedUser && (
          <div>
            {/* Profile Header */}
            <Card
              size="small"
              style={{
                marginBottom: 16,
                borderRadius: 12,
                background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
              }}
            >
              <Flex gap={16} align="center">
                <Avatar
                  size={64}
                  src={selectedUser.avatarURL || undefined}
                  style={{
                    background: getAvatarColor(
                      selectedUser.fullName || selectedUser.username,
                    ),
                    fontSize: 24,
                    fontWeight: 700,
                  }}
                >
                  {(selectedUser.fullName || selectedUser.username || "?")
                    .charAt(0)
                    .toUpperCase()}
                </Avatar>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Title level={4} style={{ margin: 0 }}>
                    {selectedUser.fullName || "—"}
                  </Title>
                  <Text type="secondary">@{selectedUser.username}</Text>
                  <div style={{ marginTop: 6 }}>
                    <Space size={4}>
                      {getRoleTag(selectedUser.roleName)}
                      {getStatusTag(selectedUser.isActive)}
                    </Space>
                  </div>
                </div>
              </Flex>
            </Card>

            {/* Info */}
            <Descriptions
              column={2}
              size="small"
              bordered
              style={{ marginBottom: 16 }}
              labelStyle={{ fontWeight: 600, background: "#fafafa" }}
            >
              <Descriptions.Item
                label={
                  <>
                    <MailOutlined /> Email
                  </>
                }
                span={2}
              >
                {selectedUser.email || "—"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <>
                    <PhoneOutlined /> SĐT
                  </>
                }
              >
                {selectedUser.phone || "—"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <>
                    <CalendarOutlined /> Ngày tạo
                  </>
                }
              >
                {selectedUser.createdAt
                  ? new Date(selectedUser.createdAt).toLocaleDateString("vi-VN")
                  : "—"}
              </Descriptions.Item>
            </Descriptions>

            {/* Activity Stats */}
            <Title level={5} style={{ marginBottom: 12 }}>
              📊 Thống kê hoạt động
            </Title>
            <Row gutter={[12, 12]}>
              {statCards.map((stat, idx) => (
                <Col span={12} key={idx}>
                  <Card
                    size="small"
                    style={{
                      borderRadius: 10,
                      borderLeft: `3px solid ${stat.color}`,
                    }}
                  >
                    <Statistic
                      title={
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {stat.title}
                        </Text>
                      }
                      value={stat.value}
                      prefix={
                        <span style={{ color: stat.color }}>{stat.icon}</span>
                      }
                      valueStyle={{ fontSize: 20, fontWeight: 700 }}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Modal>

      {/* Row highlight CSS */}
      <style>{`
        .banned-row {
          background: #fef2f2 !important;
        }
        .banned-row:hover > td {
          background: #fde8e8 !important;
        }
      `}</style>
    </div>
  );
};

export default UserManager;

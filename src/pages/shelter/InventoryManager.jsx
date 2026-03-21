import React, { useEffect, useState } from "react";
import {
  Card,
  Tabs,
  Table,
  Tag,
  Space,
  Row,
  Col,
  Progress,
  Statistic,
  Flex,
  Spin,
  Select,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Popconfirm,
} from "antd";
import {
  Package,
  ShoppingBag,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  getStoreStats,
  getStoreSupplies,
  getStoreProducts,
  getShelterSubscriptionPackages,
  getShelterSubscriptionStatus,
  subscribeShelterPackage,
  cancelShelterSubscription,
  addInventoryItem,
  updateInventoryStock,
} from "../../services/shelter/inventoryService";

const { TabPane } = Tabs;

const InventoryManager = () => {
  const { user } = useAuth();
  const toast = useToast();
  const shelterId = user?.shelterID || 1;
  const now = new Date();

  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [storeStats, setStoreStats] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [supplies, setSupplies] = useState([]);
  const [shopItems, setShopItems] = useState([]);
  const [needsSubscription, setNeedsSubscription] = useState(false);
  const [packages, setPackages] = useState([]);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [submittingInventory, setSubmittingInventory] = useState(false);
  const [editingSupply, setEditingSupply] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const isSubscriptionActive = (statusData) => {
    if (!statusData) return false;

    const statusValue = (statusData.status ?? statusData.Status ?? "")
      .toString()
      .toLowerCase();
    const isActiveFlag = statusData.isActive ?? statusData.IsActive;
    const daysRemaining = Number(
      statusData.daysRemaining ?? statusData.DaysRemaining ?? 0,
    );

    if (typeof isActiveFlag === "boolean") {
      return isActiveFlag && daysRemaining > 0;
    }

    return statusValue === "active" && daysRemaining > 0;
  };

  useEffect(() => {
    const fetchStoreData = async () => {
      setLoading(true);
      try {
        const subscriptionStatusResult = await getShelterSubscriptionStatus(
          shelterId,
        );

        const statusData = subscriptionStatusResult.data || null;
        const hasSubscription =
          subscriptionStatusResult.success && isSubscriptionActive(statusData);
        setSubscriptionStatus(hasSubscription ? statusData : null);
        setNeedsSubscription(!hasSubscription);

        if (!hasSubscription) {
          const packageResult = await getShelterSubscriptionPackages(shelterId);
          if (packageResult.success) {
            setPackages(packageResult.data);
            setSelectedPackageId(
              packageResult.data?.[0]?.packageID ??
                packageResult.data?.[0]?.PackageID ??
                null,
            );
          } else {
            setPackages([]);
            setSelectedPackageId(null);
          }

          setStoreStats(null);
          setSubscriptionStatus(null);
          setSupplies([]);
          setShopItems([]);
          return;
        }

        const [statsResult, suppliesResult, productsResult] = await Promise.all([
          getStoreStats(shelterId, month, year),
          getStoreSupplies(shelterId),
          getStoreProducts(shelterId),
        ]);

        if (statsResult.success) {
          setStoreStats(statsResult.data);
        } else {
          setStoreStats(null);
          toast.error(statsResult.error || "Không tải được thống kê cửa hàng");
        }

        const mappedSupplies = suppliesResult.success
          ? (suppliesResult.data || []).map((s, index) => ({
              id: s.supplyID ?? s.SupplyID ?? index + 1,
              name: s.itemName ?? s.ItemName ?? "N/A",
              quantity: Number(s.quantity ?? s.Quantity ?? 0),
              unit: s.unit ?? s.Unit ?? "",
              minReq: Number(s.minRequired ?? s.MinRequired ?? 0),
              status: s.status ?? s.Status ?? "Good",
              categoryName: s.categoryName ?? s.CategoryName ?? "Không phân loại",
            }))
          : [];

        if (suppliesResult.success) {
          setSupplies(mappedSupplies);
        } else {
          setSupplies([]);
          toast.error(suppliesResult.error || "Không tải được danh sách vật phẩm");
        }

        const mappedProducts = productsResult.success
          ? (productsResult.data || []).map((p, index) => ({
              id: p.productID ?? p.ProductID ?? index + 1,
              name: p.productName ?? p.ProductName ?? "N/A",
              price: Number(p.price ?? p.Price ?? 0),
              isActive: p.isActive ?? p.IsActive ?? true,
            }))
          : [];

        if (productsResult.success) {
          setShopItems(mappedProducts);
        } else {
          setShopItems([]);
          toast.error(productsResult.error || "Không tải được danh sách sản phẩm");
        }

        setPackages([]);
        setSelectedPackageId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [shelterId, month, year, reloadKey]);

  const getStockPercent = (quantity, minReq) => {
    if (!minReq || minReq <= 0) return 100;
    return Math.min(100, Math.round((quantity / minReq) * 100));
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      Good: { color: "success", text: "Đủ" },
      Low: { color: "warning", text: "Thấp" },
      Critical: { color: "error", text: "Rất Thấp" },
    };
    const config = statusConfig[status] || statusConfig.Good;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const suppliesColumns = [
    {
      title: "Tên Vật Phẩm",
      dataIndex: "name",
      key: "name",
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "Số Lượng",
      key: "quantity",
      render: (_, record) => `${record.quantity} ${record.unit}`,
    },
    {
      title: "Mức Tối Thiểu",
      key: "minReq",
      render: (_, record) => (
        <span style={{ color: "#8c8c8c" }}>
          {record.minReq} {record.unit}
        </span>
      ),
    },
    {
      title: "Tình Trạng",
      key: "status",
      render: (_, record) => (
        <Flex vertical gap="small" style={{ width: "100%" }}>
          {getStatusTag(record.status)}
          <Progress
            percent={getStockPercent(record.quantity, record.minReq)}
            size="small"
            strokeColor={
              record.status === "Good"
                ? "#52C41A"
                : record.status === "Low"
                  ? "#FAAD14"
                  : "#F5222D"
            }
            showInfo={false}
          />
        </Flex>
      ),
    },
    {
      title: "Danh Mục",
      dataIndex: "categoryName",
      key: "categoryName",
      render: (text) => (
        <span style={{ color: "#8c8c8c" }}>{text || "Không phân loại"}</span>
      ),
    },
    {
      title: "Hành Động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => {
              setEditingSupply(record);
              editForm.setFieldsValue({ quantity: record.quantity });
              setShowEditModal(true);
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa vật phẩm"
            description="Backend chưa hỗ trợ endpoint xóa vật phẩm."
            onConfirm={() => toast.error("Hiện chưa có API xóa vật phẩm")}
            okText="Đã hiểu"
            cancelText="Hủy"
          >
            <Button type="link" danger size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const shopColumns = [
    {
      title: "Tên Sản Phẩm",
      dataIndex: "name",
      key: "name",
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => (
        <span style={{ color: "#FF6B6B", fontWeight: 500 }}>
          {price.toLocaleString("vi-VN")}₫
        </span>
      ),
    },
    {
      title: "Trạng Thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "success" : "default"}>
          {isActive ? "Đang bán" : "Đã ẩn"}
        </Tag>
      ),
    },
    {
      title: "Hành Động",
      key: "action",
      render: () => (
        <Space>
          <Button type="link" size="small" onClick={() => toast.error("API sửa sản phẩm chưa được nối ở màn này")}>
            Sửa
          </Button>
          <Button type="link" danger size="small" onClick={() => toast.error("API xóa sản phẩm chưa được nối ở màn này")}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const handleSubscribePackage = async () => {
    if (!selectedPackageId) {
      toast.warning("Vui long chon mot goi truoc khi dang ky");
      return;
    }

    setSubmitting(true);
    const result = await subscribeShelterPackage(shelterId, selectedPackageId);
    setSubmitting(false);

    if (result.success) {
      toast.success(result.message || "Dang ky goi thanh cong");
      window.location.reload();
      return;
    }

    toast.error(result.error || "Dang ky goi that bai");
  };

  const handleCancelSubscription = async () => {
    setCancelling(true);
    const result = await cancelShelterSubscription(shelterId);
    setCancelling(false);

    if (result.success) {
      toast.success(result.message || "Huy goi thanh cong");
      window.location.reload();
      return;
    }

    toast.error(result.error || "Khong the huy goi");
  };

  const handleAddSupply = async () => {
    try {
      const values = await addForm.validateFields();
      setSubmittingInventory(true);

      const result = await addInventoryItem(shelterId, values);
      if (result.success) {
        toast.success(result.message || "Thêm vật phẩm thành công");
        setShowAddModal(false);
        addForm.resetFields();
        setReloadKey((prev) => prev + 1);
      } else {
        toast.error(result.error || "Không thể thêm vật phẩm");
      }
    } finally {
      setSubmittingInventory(false);
    }
  };

  const handleEditQuantity = async () => {
    if (!editingSupply) return;

    try {
      const values = await editForm.validateFields();
      setSubmittingInventory(true);
      const result = await updateInventoryStock(
        shelterId,
        editingSupply.id,
        values.quantity,
      );

      if (result.success) {
        toast.success(result.message || "Cập nhật số lượng thành công");
        setShowEditModal(false);
        setEditingSupply(null);
        editForm.resetFields();
        setReloadKey((prev) => prev + 1);
      } else {
        toast.error(result.error || "Không thể cập nhật số lượng");
      }
    } finally {
      setSubmittingInventory(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <div>
      {needsSubscription ? (
        <Card style={{ borderRadius: 10, border: "1px solid #ffe58f" }}>
          <Space direction="vertical" size={14} style={{ width: "100%" }}>
            <h2 style={{ margin: 0 }}>Kho & Cua Hang chua duoc kich hoat</h2>
            <div style={{ color: "#595959" }}>
              Tai khoan cua ban chua dang ky goi gian hang. Vui long dang ky goi
              truoc, sau do thong tin Kho & Cua Hang se hien thi.
            </div>

            {packages.length > 0 && (
              <Row gutter={[12, 12]}>
                {packages.map((pkg, index) => (
                  <Col xs={24} md={8} key={pkg.packageID ?? pkg.PackageID ?? index}>
                    <Card
                      size="small"
                      hoverable
                      onClick={() =>
                        setSelectedPackageId(pkg.packageID ?? pkg.PackageID)
                      }
                      style={{
                        height: "100%",
                        border:
                          selectedPackageId === (pkg.packageID ?? pkg.PackageID)
                            ? "2px solid #1677ff"
                            : "1px solid #f0f0f0",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>
                        {pkg.packageName ?? pkg.PackageName}
                      </div>
                      <div style={{ marginTop: 6, color: "#666" }}>
                        {(pkg.description ?? pkg.Description) || "Goi dang ky gian hang"}
                      </div>
                      <div style={{ marginTop: 8, fontWeight: 700, color: "#1d4ed8" }}>
                        {Number(pkg.price ?? pkg.Price ?? 0).toLocaleString("vi-VN")} d
                      </div>
                      <div style={{ color: "#999", fontSize: "0.85rem" }}>
                        {pkg.durationDays ?? pkg.DurationDays ?? 0} ngay
                      </div>
                      <Button
                        type={
                          selectedPackageId === (pkg.packageID ?? pkg.PackageID)
                            ? "primary"
                            : "default"
                        }
                        style={{ marginTop: 10 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPackageId(pkg.packageID ?? pkg.PackageID);
                        }}
                      >
                        {selectedPackageId === (pkg.packageID ?? pkg.PackageID)
                          ? "Da chon"
                          : "Chon goi nay"}
                      </Button>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}

            <Space>
              <Button
                type="primary"
                loading={submitting}
                onClick={handleSubscribePackage}
              >
                Dang ky goi da chon
              </Button>
              <Button onClick={() => window.location.reload()}>
                Toi da dang ky, tai lai
              </Button>
            </Space>
          </Space>
        </Card>
      ) : (
        <>
      {subscriptionStatus && (
        <Card style={{ borderRadius: 8, marginBottom: 16 }}>
          <Row justify="space-between" align="middle" gutter={[12, 12]}>
            <Col>
              <div style={{ fontWeight: 600 }}>Gói đăng ký hiện tại</div>
              <div style={{ color: "#666", marginTop: 4 }}>
                Trạng thái: {subscriptionStatus.status || subscriptionStatus.Status || "Active"}{" "}
                - Còn lại: {subscriptionStatus.daysRemaining ?? subscriptionStatus.DaysRemaining ?? 0} ngày
              </div>
            </Col>
            <Col>
              <Button danger loading={cancelling} onClick={handleCancelSubscription}>
                Hủy gói đăng ký
              </Button>
            </Col>
          </Row>
        </Card>
      )}

      {/* Header with Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 600 }}>
            Kho & Cửa Hàng
          </h1>
        </Col>

        <Col xs={24} sm={8}>
          <Card hoverable style={{ borderLeft: "4px solid #FF6B6B" }}>
            <Statistic
              title="Tổng Vật Phẩm"
              value={
                storeStats?.totalSupplies ??
                storeStats?.TotalSupplies ??
                supplies.length
              }
              prefix={<Package size={24} style={{ color: "#FF6B6B" }} />}
              styles={{ content: { color: "#FF6B6B" } }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card hoverable style={{ borderLeft: "4px solid #52C41A" }}>
            <Statistic
              title="Sản Phẩm Shop"
              value={
                storeStats?.totalShopProducts ??
                storeStats?.TotalShopProducts ??
                shopItems.length
              }
              prefix={<ShoppingBag size={24} style={{ color: "#52C41A" }} />}
              styles={{ content: { color: "#52C41A" } }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card hoverable style={{ borderLeft: "4px solid #1890FF" }}>
            <Statistic
              title="Doanh Thu Tháng"
              value={
                Number(
                  storeStats?.monthlyRevenue ?? storeStats?.MonthlyRevenue ?? 0,
                ) || 0
              }
              prefix={<DollarSign size={24} style={{ color: "#1890FF" }} />}
              suffix="₫"
              formatter={(value) => Number(value || 0).toLocaleString("vi-VN")}
              styles={{ content: { color: "#1890FF", fontSize: "1.5rem" } }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ borderRadius: 8, marginBottom: 16 }}>
        <Space wrap>
          <span style={{ color: "#666" }}>Kỳ thống kê:</span>
          <Select
            value={month}
            style={{ width: 130 }}
            onChange={setMonth}
            options={Array.from({ length: 12 }, (_, index) => ({
              label: `Tháng ${index + 1}`,
              value: index + 1,
            }))}
          />
          <Select
            value={year}
            style={{ width: 130 }}
            onChange={setYear}
            options={Array.from({ length: 6 }, (_, index) => {
              const y = now.getFullYear() - index;
              return { label: `Năm ${y}`, value: y };
            })}
          />
        </Space>
      </Card>

      {/* Tabs for Supplies and Shop */}
      <Card style={{ borderRadius: 8 }}>
        <Tabs
          defaultActiveKey="supplies"
          size="large"
          tabBarExtraContent={
            <Button type="primary" onClick={() => setShowAddModal(true)}>
              Thêm vật phẩm
            </Button>
          }
        >
          <TabPane
            tab={
              <span>
                <Package
                  size={18}
                  style={{ marginRight: 8, verticalAlign: "middle" }}
                />
                Vật Phẩm Nội Bộ
              </span>
            }
            key="supplies"
          >
            <Flex vertical gap="middle" style={{ width: "100%" }}>
              {/* Critical Items Alert */}
              {supplies.some((item) => item.status === "Critical") && (
                <Card
                  size="small"
                  style={{
                    background: "#FFF1F0",
                    border: "1px solid #FFCCC7",
                  }}
                >
                  <Space>
                    <AlertCircle size={20} color="#F5222D" />
                    <span style={{ fontWeight: 500 }}>
                      Cảnh báo:{" "}
                      {supplies.filter((s) => s.status === "Critical").length}{" "}
                      vật phẩm ở mức rất thấp!
                    </span>
                  </Space>
                </Card>
              )}

              <Table
                columns={suppliesColumns}
                dataSource={supplies}
                rowKey="id"
                locale={{ emptyText: "Chưa có vật phẩm nội bộ" }}
                pagination={{ pageSize: 10, showSizeChanger: false }}
              />
            </Flex>
          </TabPane>

          <TabPane
            tab={
              <span>
                <ShoppingBag
                  size={18}
                  style={{ marginRight: 8, verticalAlign: "middle" }}
                />
                Sản Phẩm Gây Quỹ
              </span>
            }
            key="shop"
          >
            <Table
              columns={shopColumns}
              dataSource={shopItems}
              rowKey="id"
              locale={{ emptyText: "Trạm chưa có sản phẩm gây quỹ" }}
              pagination={{ pageSize: 10, showSizeChanger: false }}
            />
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title="Thêm vật phẩm mới"
        open={showAddModal}
        onCancel={() => setShowAddModal(false)}
        onOk={handleAddSupply}
        confirmLoading={submittingInventory}
        okText="Thêm"
        cancelText="Hủy"
      >
        <Form form={addForm} layout="vertical">
          <Form.Item
            label="Tên vật phẩm"
            name="itemName"
            rules={[{ required: true, message: "Vui lòng nhập tên vật phẩm" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Category ID"
            name="categoryID"
            rules={[{ required: true, message: "Vui lòng nhập category ID" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Đơn vị"
            name="unit"
            rules={[{ required: true, message: "Vui lòng nhập đơn vị" }]}
          >
            <Input />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label="Số lượng"
                name="quantity"
                rules={[{ required: true, message: "Nhập số lượng" }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Mức tối thiểu"
                name="minRequired"
                rules={[{ required: true, message: "Nhập mức tối thiểu" }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title={`Cập nhật số lượng: ${editingSupply?.name || ""}`}
        open={showEditModal}
        onCancel={() => {
          setShowEditModal(false);
          setEditingSupply(null);
        }}
        onOk={handleEditQuantity}
        confirmLoading={submittingInventory}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            label="Số lượng mới"
            name="quantity"
            rules={[{ required: true, message: "Vui lòng nhập số lượng mới" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
        </>
      )}
      </div>
    </Spin>
  );
};

export default InventoryManager;

import React, { useEffect, useState } from "react";
import {
  Card,
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
  Edit2,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  getStoreStats,
  getStoreProducts,
  getShelterSubscriptionPackages,
  getShelterSubscriptionStatus,
  subscribeShelterPackage,
  cancelShelterSubscription,
  createProduct,
  updateProduct,
  deleteProduct,
  INVENTORY_CATEGORIES,
} from "../../services/shelter/inventoryService";

// Utility: Compress image to reduce base64 size
const compressImage = (base64String) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Scale down if image is too large (max 1200px width)
      if (width > 1200) {
        height = Math.round((height * 1200) / width);
        width = 1200;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Compress with 0.7 quality (70%)
      const compressed = canvas.toDataURL('image/jpeg', 0.7);
      resolve(compressed);
    };
    img.src = base64String;
  });
};

const InventoryManager = () => {
  const { user } = useAuth();
  const toast = useToast();
  const shelterId = user?.shelterID || 1;
  const now = new Date();

  // State Management
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [storeStats, setStoreStats] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [products, setProducts] = useState([]);
  const [needsSubscription, setNeedsSubscription] = useState(false);
  const [packages, setPackages] = useState([]);
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [productImages, setProductImages] = useState([]);
  const [editProductImages, setEditProductImages] = useState([]);
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
          setProducts([]);
          return;
        }

        const [statsResult, productsResult] = await Promise.all([
          getStoreStats(shelterId, month, year),
          getStoreProducts(shelterId),
        ]);

        if (statsResult.success) {
          setStoreStats(statsResult.data);
        } else {
          setStoreStats(null);
          toast.error(statsResult.error || "Không tải được thống kê cửa hàng");
        }

        const mappedProducts = productsResult.success
          ? (productsResult.data || []).map((p, index) => ({
            id: p.productID ?? p.ProductID ?? index + 1,
            name: p.productName ?? p.ProductName ?? "N/A",
            price: Number(p.price ?? p.Price ?? 0),
            quantity: Number(p.quantity ?? p.Quantity ?? 0),
            unit: p.unit ?? p.Unit ?? "",
            categoryID: p.categoryID ?? p.CategoryID ?? 1,
            categoryName: p.categoryName ?? p.CategoryName ?? "N/A",
            description: p.description ?? p.Description ?? "",
            isActive: p.isActive ?? p.IsActive ?? true,
            imageUrls: p.imageUrls ?? p.ImageUrls ?? [],
          }))
          : [];

        if (productsResult.success) {
          setProducts(mappedProducts);
        } else {
          setProducts([]);
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

  const getCategoryLabel = (categoryID) => {
    const found = INVENTORY_CATEGORIES.find(
      (cat) => cat.value === categoryID || (Number(categoryID) === INVENTORY_CATEGORIES.indexOf(cat) + 1)
    );
    return found ? `${found.icon} ${found.label}` : "N/A";
  };

  const productsColumns = [
    {
      title: "Tên Sản Phẩm",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: "Danh Mục",
      dataIndex: "categoryID",
      key: "categoryID",
      width: 150,
      render: (categoryID) => getCategoryLabel(categoryID),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      width: 120,
      render: (price) => (
        <span style={{ color: "#FF6B6B", fontWeight: 500 }}>
          {price.toLocaleString("vi-VN")}₫
        </span>
      ),
    },
    {
      title: "Số Lượng",
      key: "stock",
      width: 120,
      render: (_, record) => `${record.quantity} ${record.unit}`,
    },
    {
      title: "Trạng Thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (isActive) => (
        <Tag color={isActive ? "success" : "default"}>
          {isActive ? "Hoạt động" : "Ẩn"}
        </Tag>
      ),
    },
    {
      title: "Hành Động",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<Edit2 size={14} />}
            onClick={() => {
              setEditingProduct(record);
              setEditProductImages(record.imageUrls && record.imageUrls.length > 0 ? record.imageUrls : []);
              editForm.setFieldsValue({
                productName: record.name,
                price: record.price,
                quantity: record.quantity,
                unit: record.unit,
                categoryID: record.categoryID,
                description: record.description,
                isActive: record.isActive,
              });
              setShowEditModal(true);
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa sản phẩm"
            description="Bạn chắc chắn muốn xóa sản phẩm này?"
            onConfirm={() => handleDeleteProduct(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="link"
              danger
              size="small"
              icon={<Trash2 size={14} />}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleSubscribePackage = async () => {
    if (!selectedPackageId) {
      toast.warning("Vui lòng chọn một gói trước khi đăng ký");
      return;
    }

    setSubmitting(true);
    const result = await subscribeShelterPackage(shelterId, selectedPackageId);
    setSubmitting(false);

    if (result.success) {
      toast.success(result.message || "Đăng ký gói thành công");
      window.location.reload();
      return;
    }

    toast.error(result.error || "Đăng ký gói thất bại");
  };

  const handleCancelSubscription = async () => {
    setCancelling(true);
    const result = await cancelShelterSubscription(shelterId);
    setCancelling(false);

    if (result.success) {
      toast.success(result.message || "Hủy gói thành công");
      window.location.reload();
      return;
    }

    toast.error(result.error || "Không thể hủy gói");
  };

  const handleAddProduct = async () => {
    try {
      const values = await addForm.validateFields();

      if (productImages.length === 0) {
        toast.error("Vui lòng thêm ít nhất 1 hình ảnh");
        return;
      }

      if (!values.price || values.price <= 0) {
        toast.error("Giá phải lớn hơn 0");
        return;
      }

      setSubmittingProduct(true);

      const result = await createProduct(shelterId, {
        productName: values.productName,
        price: values.price,
        quantity: values.quantity,
        unit: values.unit,
        categoryID: values.categoryID,
        description: values.description,
        imageUrls: productImages,
      });

      if (result.success) {
        toast.success(result.message || "Thêm sản phẩm thành công");
        setShowAddModal(false);
        addForm.resetFields();
        setProductImages([]);
        setReloadKey((prev) => prev + 1);
      } else {
        toast.error(result.error || "Không thể thêm sản phẩm");
      }
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      const values = await editForm.validateFields();

      if (editProductImages.length === 0) {
        toast.error("Vui lòng thêm ít nhất 1 hình ảnh");
        return;
      }

      if (!values.price || values.price <= 0) {
        toast.error("Giá phải lớn hơn 0");
        return;
      }

      setSubmittingProduct(true);

      const result = await updateProduct(shelterId, editingProduct.id, {
        productName: values.productName,
        price: values.price,
        quantity: values.quantity,
        unit: values.unit,
        categoryID: values.categoryID,
        description: values.description,
        imageUrls: editProductImages,
        isActive: values.isActive !== undefined ? values.isActive : true,
      });

      if (result.success) {
        toast.success(result.message || "Cập nhật sản phẩm thành công");
        setShowEditModal(false);
        setEditingProduct(null);
        setEditProductImages([]);
        editForm.resetFields();
        setReloadKey((prev) => prev + 1);
      } else {
        toast.error(result.error || "Không thể cập nhật sản phẩm");
      }
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    setSubmittingProduct(true);
    const result = await deleteProduct(shelterId, productId);
    setSubmittingProduct(false);

    if (result.success) {
      toast.success(result.message || "Xóa sản phẩm thành công");
      setReloadKey((prev) => prev + 1);
    } else {
      toast.error(result.error || "Không thể xóa sản phẩm");
    }
  };

  return (
    <Spin spinning={loading}>
      <div>
        {needsSubscription ? (
          <Card style={{ borderRadius: 10, border: "1px solid #ffe58f" }}>
            <Space direction="vertical" size={14} style={{ width: "100%" }}>
              <h2 style={{ margin: 0 }}>Kho & Cửa Hàng chưa được kích hoạt</h2>
              <div style={{ color: "#595959" }}>
                Tài khoản của bạn chưa đăng ký gói giản hàng. Vui lòng đăng ký gói
                trước, sau đó thông tin Kho & Cửa Hàng sẽ hiển thị.
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
                          {(pkg.description ?? pkg.Description) || "Gói đăng ký giản hàng"}
                        </div>
                        <div style={{ marginTop: 8, fontWeight: 700, color: "#1d4ed8" }}>
                          {Number(pkg.price ?? pkg.Price ?? 0).toLocaleString("vi-VN")}₫
                        </div>
                        <div style={{ color: "#999", fontSize: "0.85rem" }}>
                          {pkg.durationDays ?? pkg.DurationDays ?? 0} ngày
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
                            ? "Đã chọn"
                            : "Chọn gói này"}
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
                  Đăng ký gói đã chọn
                </Button>
                <Button onClick={() => window.location.reload()}>
                  Tôi đã đăng ký, tải lại
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
                  Kho & Cửa Hàng (Sản Phẩm)
                </h1>
              </Col>

              <Col xs={24} sm={8}>
                <Card hoverable style={{ borderLeft: "4px solid #FF6B6B" }}>
                  <Statistic
                    title="Tổng Sản Phẩm"
                    value={
                      storeStats?.totalSupplies ??
                      storeStats?.TotalSupplies ??
                      products.length
                    }
                    prefix={<Package size={24} style={{ color: "#FF6B6B" }} />}
                    styles={{ content: { color: "#FF6B6B" } }}
                  />
                </Card>
              </Col>

              <Col xs={24} sm={8}>
                <Card hoverable style={{ borderLeft: "4px solid #52C41A" }}>
                  <Statistic
                    title="Sản Phẩm Hoạt Động"
                    value={products.filter((p) => p.isActive).length}
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

            {/* Unified Products Table */}
            <Card style={{ borderRadius: 8 }}>
              <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
                <h3 style={{ margin: 0 }}>Danh Sách Sản Phẩm</h3>
                <Button type="primary" onClick={() => {
                  addForm.resetFields();
                  setProductImages([]);
                  setShowAddModal(true);
                }}>
                  + Thêm Sản Phẩm
                </Button>
              </Flex>

              <Table
                columns={productsColumns}
                dataSource={products}
                rowKey="id"
                locale={{ emptyText: products.length === 0 ? "Chưa có sản phẩm" : "Không tìm thấy sản phẩm" }}
                pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Tổng ${total} sản phẩm` }}
                scroll={{ x: 1000 }}
              />
            </Card>

            {/* Add Product Modal */}
            <Modal
              title="Thêm Sản Phẩm Mới"
              open={showAddModal}
              onCancel={() => {
                setShowAddModal(false);
                addForm.resetFields();
                setProductImages([]);
              }}
              onOk={handleAddProduct}
              confirmLoading={submittingProduct}
              okText="Thêm"
              cancelText="Hủy"
              width={600}
            >
              <Form form={addForm} layout="vertical">
                <Form.Item
                  label="Tên Sản Phẩm"
                  name="productName"
                  rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
                >
                  <Input placeholder="Nhập tên sản phẩm" />
                </Form.Item>

                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item
                      label="Danh Mục"
                      name="categoryID"
                      rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
                    >
                      <Select placeholder="Chọn danh mục">
                        {INVENTORY_CATEGORIES.map((cat, idx) => (
                          <Select.Option key={idx} value={idx + 1}>
                            {cat.icon} {cat.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      label="Giá (₫)"
                      name="price"
                      rules={[
                        { required: true, message: "Vui lòng nhập giá" },
                      ]}
                    >
                      <InputNumber min={1} style={{ width: "100%" }} placeholder="0" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item
                      label="Số Lượng"
                      name="quantity"
                      rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
                    >
                      <InputNumber min={0} style={{ width: "100%" }} placeholder="0" />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      label="Đơn Vị"
                      name="unit"
                      rules={[{ required: true, message: "Vui lòng nhập đơn vị" }]}
                    >
                      <Input placeholder="kg, cái, hộp, ..." />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label="Mô Tả"
                  name="description"
                  rules={[
                    { required: true, message: "Vui lòng nhập mô tả sản phẩm" },
                    { min: 10, message: "Mô tả phải ít nhất 10 ký tự" },
                  ]}
                >
                  <Input.TextArea rows={3} placeholder="Nhập thông tin chi tiết về sản phẩm (ít nhất 10 ký tự)" />
                </Form.Item>

                <Form.Item label="Hình Ảnh Sản Phẩm" required>
                  <div style={{
                    border: "2px dashed #d9d9d9",
                    borderRadius: "6px",
                    padding: "16px",
                    textAlign: "center",
                    cursor: "pointer",
                    backgroundColor: "#fafafa"
                  }}>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      style={{ display: "none" }}
                      id="product-images-input"
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        for (const file of files) {
                          const reader = new FileReader();
                          reader.onload = async (event) => {
                            try {
                              const base64 = event.target?.result;
                              const compressed = await compressImage(base64);
                              setProductImages((prev) => [...prev, compressed]);
                            } catch (error) {
                              console.error('Image compression error:', error);
                              toast.error('Lỗi khi nén hình ảnh');
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <label htmlFor="product-images-input" style={{ cursor: "pointer", display: "block" }}>
                      <Upload size={32} style={{ color: "#1890ff", marginBottom: "8px" }} />
                      <div style={{ color: "#666" }}>Nhấp để chọn hoặc kéo thả hình ảnh</div>
                    </label>
                  </div>

                  {productImages.length > 0 && (
                    <div style={{ marginTop: "12px" }}>
                      <div style={{ marginBottom: "8px", fontSize: "12px", color: "#666" }}>
                        {productImages.length} hình đã chọn
                      </div>
                      <Row gutter={8}>
                        {productImages.map((img, idx) => (
                          <Col key={idx} span={6}>
                            <div style={{
                              position: "relative",
                              paddingBottom: "100%",
                              backgroundColor: "#f0f0f0",
                              borderRadius: "4px",
                              overflow: "hidden"
                            }}>
                              <img
                                src={img}
                                alt={`preview-${idx}`}
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover"
                                }}
                              />
                              <div
                                onClick={() => setProductImages((prev) => prev.filter((_, i) => i !== idx))}
                                style={{
                                  position: "absolute",
                                  top: 4,
                                  right: 4,
                                  background: "rgba(255, 0, 0, 0.7)",
                                  color: "white",
                                  borderRadius: "50%",
                                  width: "24px",
                                  height: "24px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  fontSize: "14px"
                                }}
                              >
                                ✕
                              </div>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}

                  {productImages.length === 0 && (
                    <div style={{ color: "#ff4d4f", fontSize: "12px", marginTop: "8px" }}>
                      ⚠️ Vui lòng thêm ít nhất 1 hình ảnh
                    </div>
                  )}
                </Form.Item>
              </Form>
            </Modal>

            {/* Edit Product Modal */}
            <Modal
              title={`Chỉnh Sửa: ${editingProduct?.name || ""}`}
              open={showEditModal}
              onCancel={() => {
                setShowEditModal(false);
                setEditingProduct(null);
                setEditProductImages([]);
                editForm.resetFields();
              }}
              onOk={handleUpdateProduct}
              confirmLoading={submittingProduct}
              okText="Lưu"
              cancelText="Hủy"
              width={600}
            >
              <Form form={editForm} layout="vertical">
                <Form.Item
                  label="Tên Sản Phẩm"
                  name="productName"
                  rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
                >
                  <Input placeholder="Nhập tên sản phẩm" />
                </Form.Item>

                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item
                      label="Danh Mục"
                      name="categoryID"
                      rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
                    >
                      <Select placeholder="Chọn danh mục">
                        {INVENTORY_CATEGORIES.map((cat, idx) => (
                          <Select.Option key={idx} value={idx + 1}>
                            {cat.icon} {cat.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      label="Giá (₫)"
                      name="price"
                      rules={[
                        { required: true, message: "Vui lòng nhập giá" },
                      ]}
                    >
                      <InputNumber min={1} style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item
                      label="Số Lượng"
                      name="quantity"
                      rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
                    >
                      <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      label="Đơn Vị"
                      name="unit"
                      rules={[{ required: true, message: "Vui lòng nhập đơn vị" }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  label="Mô Tả"
                  name="description"
                  rules={[
                    { required: true, message: "Vui lòng nhập mô tả sản phẩm" },
                    { min: 10, message: "Mô tả phải ít nhất 10 ký tự" },
                  ]}
                >
                  <Input.TextArea rows={3} placeholder="Nhập thông tin chi tiết về sản phẩm (ít nhất 10 ký tự)" />
                </Form.Item>

                <Form.Item label="Hình Ảnh Sản Phẩm" required>
                  <div style={{
                    border: "2px dashed #d9d9d9",
                    borderRadius: "6px",
                    padding: "16px",
                    textAlign: "center",
                    cursor: "pointer",
                    backgroundColor: "#fafafa"
                  }}>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      style={{ display: "none" }}
                      id="edit-product-images-input"
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        for (const file of files) {
                          const reader = new FileReader();
                          reader.onload = async (event) => {
                            try {
                              const base64 = event.target?.result;
                              const compressed = await compressImage(base64);
                              setEditProductImages((prev) => [...prev, compressed]);
                            } catch (error) {
                              console.error('Image compression error:', error);
                              toast.error('Lỗi khi nén hình ảnh');
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <label htmlFor="edit-product-images-input" style={{ cursor: "pointer", display: "block" }}>
                      <Upload size={32} style={{ color: "#1890ff", marginBottom: "8px" }} />
                      <div style={{ color: "#666" }}>Nhấp để chọn hoặc kéo thả hình ảnh</div>
                    </label>
                  </div>

                  {editProductImages.length > 0 && (
                    <div style={{ marginTop: "12px" }}>
                      <div style={{ marginBottom: "8px", fontSize: "12px", color: "#666" }}>
                        {editProductImages.length} hình đã chọn
                      </div>
                      <Row gutter={8}>
                        {editProductImages.map((img, idx) => (
                          <Col key={idx} span={6}>
                            <div style={{
                              position: "relative",
                              paddingBottom: "100%",
                              backgroundColor: "#f0f0f0",
                              borderRadius: "4px",
                              overflow: "hidden"
                            }}>
                              <img
                                src={img}
                                alt={`preview-${idx}`}
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover"
                                }}
                              />
                              <div
                                onClick={() => setEditProductImages((prev) => prev.filter((_, i) => i !== idx))}
                                style={{
                                  position: "absolute",
                                  top: 4,
                                  right: 4,
                                  background: "rgba(255, 0, 0, 0.7)",
                                  color: "white",
                                  borderRadius: "50%",
                                  width: "24px",
                                  height: "24px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "pointer",
                                  fontSize: "14px"
                                }}
                              >
                                ✕
                              </div>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}

                  {editProductImages.length === 0 && (
                    <div style={{ color: "#ff4d4f", fontSize: "12px", marginTop: "8px" }}>
                      ⚠️ Vui lòng thêm ít nhất 1 hình ảnh
                    </div>
                  )}
                </Form.Item>

                <Form.Item
                  label="Trạng Thái"
                  name="isActive"
                >
                  <Select>
                    <Select.Option value={true}>Hoạt động</Select.Option>
                    <Select.Option value={false}>Ẩn</Select.Option>
                  </Select>
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

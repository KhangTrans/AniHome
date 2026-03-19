import React, { useState, useEffect } from "react";
import {
  Card,
  Input,
  Button,
  Tag,
  Space,
  Badge,
  Tooltip,
  Row,
  Col,
  Modal,
  Spin,
  Pagination,
} from "antd";
import { Plus, Eye, Edit, Trash2, RefreshCw } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  getShelterPets,
  addShelterPet,
  updateShelterPet,
  updatePetStatus,
  deleteShelterPet,
  PET_STATUS_OPTIONS,
} from "../../services/shelter/shelterPetsService";
import PetFormModal from "./components/PetFormModal";
import PetDetailModal from "./components/PetDetailModal";

const { Search: AntSearch } = Input;

const AnimalManager = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    totalCount: 0,
  });

  // Modal states
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [editingPet, setEditingPet] = useState(null);

  const shelterID = user?.shelterID || 1; // fallback for dev

  // Fetch pets data
  const fetchPets = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        ...(filter !== "All" && { status: filter }),
        ...(searchTerm && { keyword: searchTerm }),
      };

      const result = await getShelterPets(shelterID, params);

      if (result.success) {
        setPets(result.data.items || []);
        setPagination((prev) => ({
          ...prev,
          totalCount: result.data.totalCount || 0,
        }));
      } else {
        toast.error(result.error || "Không thể tải danh sách thú cưng");
      }
    } catch {
      toast.error("Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [
    shelterID,
    pagination.page,
    pagination.pageSize,
    filter,
    searchTerm,
    toast,
  ]);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Handle add/edit pet
  const handleSubmitPet = async (values) => {
    setFormLoading(true);
    try {
      let result;
      if (editingPet) {
        result = await updateShelterPet(shelterID, editingPet.petID, values);
      } else {
        result = await addShelterPet(shelterID, values);
      }

      if (result.success) {
        toast.success(result.message);
        setFormModalVisible(false);
        setEditingPet(null);
        fetchPets();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Đã xảy ra lỗi khi lưu thông tin thú cưng");
    } finally {
      setFormLoading(false);
    }
  };

  // Handle view detail
  const handleViewDetail = (pet) => {
    setSelectedPet(pet);
    setDetailModalVisible(true);
  };

  // Handle delete pet
  const handleDelete = (petId, petName) => {
    Modal.confirm({
      title: "⚠️ XÁC NHẬN XÓA",
      content: `Bạn có chắc chắn muốn xóa hồ sơ thú cưng "${petName}"? Hành động này không thể hoàn tác.`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        setLoading(true);
        try {
          const result = await deleteShelterPet(petId);
          if (result.success) {
            toast.success(result.message || "Xóa thú cưng thành công");
            fetchPets();
          } else {
            toast.error(result.error || "Xóa thú cưng thất bại");
          }
        } catch (error) {
          toast.error("Đã xảy ra lỗi khi xóa thú cưng");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // Handle status change via modal with option buttons
  const handleStatusChange = (pet) => {
    const modal = Modal.info({
      title: "Thay Đổi Trạng Thái",
      icon: null,
      width: 400,
      content: (
        <div>
          <p style={{ marginBottom: "1rem" }}>
            Chọn trạng thái mới cho <strong>{pet.petName}</strong>:
          </p>
          <Space direction="vertical" style={{ width: "100%" }}>
            {PET_STATUS_OPTIONS.map((option) => (
              <Button
                key={option.value}
                block
                type={pet.status === option.value ? "primary" : "default"}
                disabled={pet.status === option.value}
                onClick={async () => {
                  modal.destroy();
                  setLoading(true);
                  const result = await updatePetStatus(
                    shelterID,
                    pet.petID,
                    option.value,
                  );

                  if (result.success) {
                    toast.success(result.message);
                    fetchPets();
                  } else {
                    toast.error(result.error);
                    setLoading(false);
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: "0.5rem",
                }}
              >
                <Tag color={option.color}>{option.label}</Tag>
                {pet.status === option.value && (
                  <span style={{ marginLeft: "auto", color: "#8c8c8c" }}>
                    (hiện tại)
                  </span>
                )}
              </Button>
            ))}
          </Space>
        </div>
      ),
      footer: (
        <Button onClick={() => modal.destroy()} style={{ marginTop: "1rem" }}>
          Hủy
        </Button>
      ),
    });
  };

  // Handle page change
  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const getStatusDisplay = (status) => {
    const statusObj = PET_STATUS_OPTIONS.find((s) => s.value === status);
    return statusObj || { label: status, color: "default" };
  };

  return (
    <Spin spinning={loading}>
      <div>
        {/* Header */}
        <div
          style={{
            marginBottom: "2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 600 }}>
              Quản Lý Thú Cưng
            </h1>
            <p style={{ color: "#8c8c8c", margin: "0.5rem 0 0 0" }}>
              Quản lý hồ sơ thú cưng tại trạm ({pagination.totalCount} thú cưng)
            </p>
          </div>
          <Space>
            <Button icon={<RefreshCw size={16} />} onClick={fetchPets}>
              Làm Mới
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<Plus size={18} />}
              onClick={() => {
                setEditingPet(null);
                setFormModalVisible(true);
              }}
            >
              Thêm Hồ Sơ Mới
            </Button>
          </Space>
        </div>

        {/* Filters & Search */}
        <Card style={{ marginBottom: "1.5rem" }}>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <AntSearch
              placeholder="Tìm theo tên thú cưng..."
              size="large"
              allowClear
              onSearch={handleSearch}
              onChange={(e) => !e.target.value && handleSearch("")}
              style={{ width: "100%" }}
            />

            <Space size="small" wrap>
              <span style={{ color: "#8c8c8c", marginRight: "0.5rem" }}>
                Lọc theo trạng thái:
              </span>
              <Button
                type={filter === "All" ? "primary" : "default"}
                onClick={() => {
                  setFilter("All");
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                size="middle"
              >
                Tất Cả
              </Button>
              {PET_STATUS_OPTIONS.map((status) => (
                <Button
                  key={status.value}
                  type={filter === status.value ? "primary" : "default"}
                  onClick={() => {
                    setFilter(status.value);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  size="middle"
                >
                  {status.label}
                </Button>
              ))}
            </Space>
          </Space>
        </Card>

        {/* Animals Grid */}
        <Row gutter={[16, 16]}>
          {pets.map((pet) => {
            const statusDisplay = getStatusDisplay(pet.status);
            return (
              <Col key={pet.petID} xs={24} sm={12} md={8} lg={6}>
                <Badge.Ribbon
                  text={statusDisplay.label}
                  color={statusDisplay.color}
                >
                  <Card
                    hoverable
                    cover={
                      <div
                        style={{
                          position: "relative",
                          overflow: "hidden",
                          height: "200px",
                          cursor: "pointer",
                        }}
                        onClick={() => handleViewDetail(pet)}
                      >
                        <img
                          alt={pet.petName}
                          src={
                            pet.imageURL ||
                            "https://via.placeholder.com/400x300?text=No+Image"
                          }
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.3s",
                          }}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.transform = "scale(1.05)")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.transform = "scale(1)")
                          }
                        />
                      </div>
                    }
                    actions={[
                      <Tooltip title="Xem Chi Tiết">
                        <Eye
                          size={18}
                          style={{ cursor: "pointer" }}
                          onClick={() => handleViewDetail(pet)}
                        />
                      </Tooltip>,
                      <Tooltip title="Chỉnh Sửa Hồ Sơ">
                        <Edit
                          size={18}
                          style={{ cursor: "pointer", color: "#faad14" }}
                          onClick={() => {
                            setEditingPet(pet);
                            setFormModalVisible(true);
                          }}
                        />
                      </Tooltip>,
                      <Tooltip title="Thay Đổi Trạng Thái">
                        <RefreshCw
                          size={18}
                          style={{ cursor: "pointer", color: "#1890ff" }}
                          onClick={() => handleStatusChange(pet)}
                        />
                      </Tooltip>,
                      <Tooltip title="Xóa">
                        <Trash2
                          size={18}
                          style={{ cursor: "pointer", color: "#ff4d4f" }}
                          onClick={() => handleDelete(pet.petID, pet.petName)}
                        />
                      </Tooltip>,
                    ]}
                  >
                    <Card.Meta
                      title={
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ fontSize: "1.1rem", fontWeight: 600 }}>
                            {pet.petName}
                          </span>
                          <span
                            style={{ fontSize: "0.85rem", color: "#8c8c8c" }}
                          >
                            {pet.gender === "Male" ? "♂️" : "♀️"} {pet.age} tuổi
                          </span>
                        </div>
                      }
                      description={
                        <div>
                          <Space
                            size="small"
                            wrap
                            style={{ marginBottom: "0.5rem" }}
                          >
                            <Tag color="blue">{pet.breed}</Tag>
                            <Tag color="purple">{pet.categoryName}</Tag>
                          </Space>
                          <p
                            style={{
                              marginTop: "0.5rem",
                              color: "#595959",
                              fontSize: "0.875rem",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {pet.description || pet.healthStatus}
                          </p>
                        </div>
                      }
                    />
                  </Card>
                </Badge.Ribbon>
              </Col>
            );
          })}
        </Row>

        {pets.length === 0 && !loading && (
          <Card style={{ textAlign: "center", padding: "3rem" }}>
            <p style={{ color: "#8c8c8c", fontSize: "1rem" }}>
              Không tìm thấy thú cưng nào phù hợp với tiêu chí tìm kiếm.
            </p>
          </Card>
        )}

        {/* Pagination */}
        {pagination.totalCount > pagination.pageSize && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "2rem",
            }}
          >
            <Pagination
              current={pagination.page}
              total={pagination.totalCount}
              pageSize={pagination.pageSize}
              onChange={handlePageChange}
              showSizeChanger={false}
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} / ${total} thú cưng`
              }
            />
          </div>
        )}

        {/* Add Pet Modal */}
        <PetFormModal
          visible={formModalVisible}
          onCancel={() => {
            setFormModalVisible(false);
            setEditingPet(null);
          }}
          onSubmit={handleSubmitPet}
          loading={formLoading}
          initialData={editingPet}
        />

        {/* Pet Detail Modal */}
        <PetDetailModal
          visible={detailModalVisible}
          onCancel={() => {
            setDetailModalVisible(false);
            setSelectedPet(null);
          }}
          pet={selectedPet}
        />
      </div>
    </Spin>
  );
};

export default AnimalManager;

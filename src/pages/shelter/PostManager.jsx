import React, { useState, useEffect } from "react";
import {
  Card,
  Input,
  Button,
  Tag,
  Space,
  Row,
  Col,
  Spin,
  Pagination,
  Badge,
} from "antd";
import { Plus, RefreshCw, Eye } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { formatPostDate } from "../../services/public/postsService";
import {
  createNewPost,
  getMyPostsManagement,
  getMyPostById,
} from "../../services/shelter/shelterPostsService";
import PostFormModal from "./components/PostFormModal";
import PostDetailModal from "./components/PostDetailModal";

const { Search: AntSearch } = Input;

// Hàm hỗ trợ loại bỏ các thẻ HTML và giải mã ký tự đặc biệt cho phần trích dẫn
const stripHtml = (html) => {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  const text = doc.body.textContent || "";
  return text.replace(/&nbsp;/g, " ");
};

const PostManager = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    totalCount: 0,
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Trigger for manual refresh

  const [formModalVisible, setFormModalVisible] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loadingDetailId, setLoadingDetailId] = useState(null);

  const fetchPosts = React.useCallback(async () => {
    const shelterId = user?.shelterID;

    // Ensure user is logged in with valid shelterID
    if (!shelterId) {
      console.warn("ShelterId not available, skipping fetch");
      return;
    }

    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        ...(filterType !== "All" && { postType: filterType }),
        ...(searchTerm && { searchTerm }),
      };

      console.log("Fetching management posts with params:", params);
      // Use management endpoint to see all posts (Pending + Published + Rejected)
      const result = await getMyPostsManagement(params);
          total = result.data.totalCount || 0;
        }

        console.log("Posts fetched successfully:", items);
        setPosts(items);
        setPagination((prev) => ({
          ...prev,
          totalCount: total,
        }));
      } else {
        toast.error(result.error || "Không thể tải danh sách bài viết");
      }
    } catch (error) {
      console.error("Fetch posts error:", error);
      toast.error("Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, filterType, searchTerm, toast, user, refreshTrigger]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleCreatePost = async (values) => {
    const shelterId = user?.shelterID;
    if (!shelterId) {
      toast.error("ShelterId not available");
      return;
    }

    setFormLoading(true);
    try {
      const postData = {
        title: values.title,
        content: values.content,
        postType: values.postType,
        imageUrls: values.imageUrls,
      };

      const result = await createNewPost(shelterId, postData);

      if (result.success) {
        toast.success("Tạo bài viết mới thành công!");
        setFormModalVisible(false);
        // Reset pagination to page 1 and trigger refresh
        setPagination((prev) => ({ ...prev, page: 1 }));
        setRefreshTrigger((prev) => prev + 1);
      } else {
        toast.error(result.error || "Tạo bài viết failed");
      }
    } catch (error) {
      toast.error("Lỗi khi thêm bài viết mới");
    } finally {
      setFormLoading(false);
    }
  };

  const handleViewDetails = async (postId) => {
    setLoadingDetailId(postId);
    try {
      const result = await getMyPostById(postId);

      if (result.success) {
        setSelectedPost(result.data);
        setDetailModalVisible(true);
      } else {
        toast.error(result.error || "Không thể tải chi tiết bài viết");
      }
    } catch (err) {
      toast.error("Lỗi khi kết nối đến server");
    } finally {
      setLoadingDetailId(null);
    }
  };

  const POST_TYPES = [
    { label: "Story", value: "Story", color: "purple" },
    { label: "News", value: "News", color: "blue" },
    { label: "Event", value: "Event", color: "orange" },
  ];

  return (
    <Spin spinning={loading}>
      <div>
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
              Quản Lý Bài Viết
            </h1>
            <p style={{ color: "#8c8c8c", margin: "0.5rem 0 0 0" }}>
              Quản lý danh sách bài viết ({pagination.totalCount} bài)
            </p>
          </div>
          <Space>
            <Button icon={<RefreshCw size={16} />} onClick={fetchPosts}>
              Làm Mới
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<Plus size={18} />}
              onClick={() => setFormModalVisible(true)}
            >
              Thêm Bài Mới
            </Button>
          </Space>
        </div>

        <Card style={{ marginBottom: "1.5rem" }}>
          <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
            <AntSearch
              placeholder="Tìm theo tiêu đề bài viết..."
              size="large"
              allowClear
              onSearch={handleSearch}
              onChange={(e) => !e.target.value && handleSearch("")}
              style={{ width: "100%" }}
            />
            <Space size="small" wrap>
              <span style={{ color: "#8c8c8c", marginRight: "0.5rem" }}>
                Lọc theo loại:
              </span>
              <Button
                type={filterType === "All" ? "primary" : "default"}
                onClick={() => {
                  setFilterType("All");
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                size="middle"
              >
                Tất Cả
              </Button>
              {POST_TYPES.map((type) => (
                <Button
                  key={type.value}
                  type={filterType === type.value ? "primary" : "default"}
                  onClick={() => {
                    setFilterType(type.value);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  size="middle"
                >
                  {type.label}
                </Button>
              ))}
            </Space>
          </Space>
        </Card>

        <Row gutter={[16, 16]}>
          {posts.map((post) => {
            const typeObj = POST_TYPES.find(
              (t) => t.value === post.postType,
            ) || { color: "default" };

            // Phân tích trạng thái bài viết
            let statusConfig = { text: "Chưa rõ", color: "default" };
            if (post.status === "Pending") {
              statusConfig = { text: "Đang chờ duyệt", color: "warning" };
            } else if (
              post.status === "Published" ||
              post.status === "Approved"
            ) {
              statusConfig = { text: "Đã duyệt", color: "success" };
            } else if (post.status === "Rejected") {
              statusConfig = { text: "Đã từ chối", color: "error" };
            }

            // Xử lý thumbnail (trường string JSON)
            let coverImg = "https://placehold.co/400x300?text=No+Cover";
            try {
              if (post.thumbnail) {
                const parsed = JSON.parse(post.thumbnail);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  coverImg = parsed[0];
                }
              } else if (post.images && post.images.length > 0) {
                // Để phòng ngừa nếu api có trả dạng mảng cũ
                coverImg = post.images[0].imageUrl || post.images[0];
              }
            } catch (e) {
              console.error("Lỗi parse thumbnail", e);
            }

            return (
              <Col
                key={post.postID || post.postId || Math.random()}
                xs={24}
                sm={12}
                md={8}
                lg={6}
              >
                <Badge.Ribbon
                  text={statusConfig.text}
                  color={
                    statusConfig.color === "warning"
                      ? "#faad14"
                      : statusConfig.color === "success"
                        ? "#52c41a"
                        : statusConfig.color === "error"
                          ? "#ff4d4f"
                          : "#d9d9d9"
                  }
                >
                  <Card
                    hoverable
                    cover={
                      <div
                        style={{
                          height: "180px",
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        <img
                          alt="Cover"
                          src={coverImg}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    }
                  >
                    <Card.Meta
                      title={
                        <div
                          style={{
                            wordWrap: "break-word",
                            whiteSpace: "normal",
                          }}
                        >
                          {post.title}
                        </div>
                      }
                      description={
                        <div style={{ marginTop: "0.5rem" }}>
                          <Space>
                            <Tag color={typeObj.color}>{post.postType}</Tag>
                            <span
                              style={{ fontSize: "0.85rem", color: "#8c8c8c" }}
                            >
                              {formatPostDate(post.createdAt)}
                            </span>
                          </Space>
                          <p
                            style={{
                              marginTop: "0.5rem",
                              color: "#595959",
                              fontSize: "0.875rem",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {stripHtml(post.excerpt || post.content)}
                          </p>
                        </div>
                      }
                    />
                    <div
                      style={{ padding: "0 24px 24px 24px", marginTop: "1rem" }}
                    >
                      <Button
                        type="dashed"
                        block
                        icon={<Eye size={16} />}
                        loading={
                          loadingDetailId === (post.postID || post.postId)
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(post.postID || post.postId);
                        }}
                      >
                        Nội dung bài
                      </Button>
                    </div>
                  </Card>
                </Badge.Ribbon>
              </Col>
            );
          })}
        </Row>

        {posts.length === 0 && !loading && (
          <Card style={{ textAlign: "center", padding: "3rem" }}>
            <p style={{ color: "#8c8c8c", fontSize: "1rem" }}>
              Không tìm thấy bài viết nào.
            </p>
          </Card>
        )}

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
              onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
              showSizeChanger={false}
            />
          </div>
        )}

        <PostFormModal
          visible={formModalVisible}
          onCancel={() => setFormModalVisible(false)}
          onSubmit={handleCreatePost}
          loading={formLoading}
        />

        <PostDetailModal
          visible={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          post={selectedPost}
        />
      </div>
    </Spin>
  );
};

export default PostManager;

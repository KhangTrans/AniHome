import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Tag,
  Space,
  Row,
  Col,
  Spin,
  Modal,
  Input,
  Pagination,
  Empty,
} from "antd";
import { Check, X, Eye, RefreshCw } from "lucide-react";
import { useToast } from "../../../context/ToastContext";
import {
  getPendingPosts,
  reviewPost,
  getPostReviewStatusBadge,
} from "../../../services/admin/adminModerationService";
import { formatPostDate } from "../../../services/public/postsService";

const ContentModerator = () => {
  const toast = useToast();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    totalCount: 0,
  });

  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const fetchPendingPosts = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        status: "Pending",
      };

      const result = await getPendingPosts(params);

      // The API might return an array directly or an object with items
      if (result.success) {
        let items = [];
        let total = 0;

        if (Array.isArray(result.data)) {
          items = result.data;
          total = items.length;
        } else if (result.data && result.data.items) {
          items = result.data.items;
          total = result.data.totalCount || 0;
        }

        setPosts(items);
        setPagination((prev) => ({
          ...prev,
          totalCount: total,
        }));
      } else {
        toast.error(result.error || "Không thể tải danh sách bài viết");
      }
    } catch {
      toast.error("Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, toast]);

  useEffect(() => {
    fetchPendingPosts();
  }, [fetchPendingPosts]);

  const handleApprove = async (postId) => {
    setProcessingId(postId);
    try {
      const result = await reviewPost(postId, {
        isApproved: true,
        note: "Nội dung hợp lệ",
      });

      if (result.success) {
        toast.success("Duyệt bài viết thành công!");
        fetchPendingPosts();
      } else {
        toast.error(result.error || "Lỗi khi duyệt bài viết");
      }
    } catch {
      toast.error("Lỗi khi kết nối đến máy chủ");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectClick = (postId) => {
    setSelectedPostId(postId);
    setRejectReason("");
    setRejectModalVisible(true);
  };

  const submitReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }

    setProcessingId(selectedPostId);
    setRejectModalVisible(false);

    try {
      const result = await reviewPost(selectedPostId, {
        isApproved: false,
        note: rejectReason,
      });

      if (result.success) {
        toast.success("Đã từ chối bài viết");
        fetchPendingPosts();
      } else {
        toast.error(result.error || "Lỗi khi từ chối bài viết");
      }
    } catch {
      toast.error("Lỗi khi kết nối đến máy chủ");
    } finally {
      setProcessingId(null);
      setSelectedPostId(null);
    }
  };

  const getPostTypeColor = (type) => {
    switch (type) {
      case "Story":
        return "purple";
      case "News":
        return "blue";
      case "Event":
        return "orange";
      default:
        return "default";
    }
  };

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
              Kiểm Duyệt Nội Dung
            </h1>
            <p style={{ color: "#8c8c8c", margin: "0.5rem 0 0 0" }}>
              Xem và duyệt các bài viết đang chờ xuất bản (
              {pagination.totalCount} bài chờ)
            </p>
          </div>
          <Button icon={<RefreshCw size={16} />} onClick={fetchPendingPosts}>
            Làm Mới
          </Button>
        </div>

        <Row gutter={[16, 16]}>
          {posts.map((post) => {
            const badge = getPostReviewStatusBadge("pending");

            return (
              <Col
                key={post.postId || post.postID || post.id}
                xs={24}
                sm={12}
                md={8}
                lg={8}
              >
                <Card
                  hoverable
                  style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  bodyStyle={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "1rem",
                    }}
                  >
                    <Tag color={getPostTypeColor(post.postType)}>
                      {post.postType || "Bài Viết"}
                    </Tag>
                    <Tag color={badge.color} style={{ background: badge.bg }}>
                      {badge.text}
                    </Tag>
                  </div>

                  <h3
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      marginBottom: "0.5rem",
                      wordWrap: "break-word",
                    }}
                  >
                    {post.title}
                  </h3>

                  <div
                    style={{
                      color: "#8c8c8c",
                      fontSize: "0.85rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <div>
                      Đăng bởi: {post.authorName || post.author || "Khách"}
                    </div>
                    {post.createdAt && (
                      <div>Ngày đăng: {formatPostDate(post.createdAt)}</div>
                    )}
                  </div>

                  {/* Trích đoạn nếu có nội dung */}
                  {post.content && (
                    <p
                      style={{
                        marginTop: "0.5rem",
                        color: "#595959",
                        fontSize: "0.875rem",
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        flex: 1,
                        marginBottom: "1.5rem",
                      }}
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                  )}

                  <div
                    style={{
                      marginTop: "auto",
                      display: "flex",
                      gap: "0.5rem",
                    }}
                  >
                    <Button
                      style={{ flex: 1 }}
                      icon={<Eye size={16} />}
                      onClick={() =>
                        toast.info("Tính năng xem chi tiết đang phát triển")
                      }
                    >
                      Xem
                    </Button>
                    <Button
                      type="primary"
                      style={{
                        flex: 1,
                        background: "#10b981",
                        borderColor: "#10b981",
                      }}
                      icon={<Check size={16} />}
                      loading={
                        processingId === (post.postId || post.postID || post.id)
                      }
                      onClick={() =>
                        handleApprove(post.postId || post.postID || post.id)
                      }
                    >
                      Duyệt
                    </Button>
                    <Button
                      type="primary"
                      danger
                      style={{ flex: 1 }}
                      icon={<X size={16} />}
                      loading={
                        processingId === (post.postId || post.postID || post.id)
                      }
                      onClick={() =>
                        handleRejectClick(post.postId || post.postID || post.id)
                      }
                    >
                      Từ chối
                    </Button>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>

        {posts.length === 0 && !loading && (
          <Card style={{ marginTop: "1rem" }}>
            <Empty
              description="Không có bài viết nào đang cập duyệt."
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
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

        <Modal
          title="Từ chối bài viết"
          open={rejectModalVisible}
          onOk={submitReject}
          onCancel={() => {
            setRejectModalVisible(false);
            setRejectReason("");
          }}
          okText="Xác nhận Từ chối"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
          confirmLoading={processingId === selectedPostId}
        >
          <p style={{ marginBottom: "0.5rem" }}>
            Vui lòng nhập lý do từ chối bài viết này. Lý do sẽ được hiển thị cho
            người đăng:
          </p>
          <Input.TextArea
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Ví dụ: Hình ảnh không hợp lệ, nội dung không phù hợp..."
          />
        </Modal>
      </div>
    </Spin>
  );
};

export default ContentModerator;

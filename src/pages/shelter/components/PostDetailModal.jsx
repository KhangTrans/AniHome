import React from "react";
import { Modal, Tag, Space, Typography, Carousel } from "antd";
import { formatPostDate } from "../../../services/public/postsService";

const { Title, Text, Paragraph } = Typography;

const PostDetailModal = ({ visible, onCancel, post }) => {
  if (!post) return null;

  // Lấy danh sách ảnh từ chuỗi JSON thumbnail/images
  let images = [];
  try {
    if (post.thumbnail) {
      const parsed = JSON.parse(post.thumbnail);
      if (Array.isArray(parsed)) {
        images = parsed;
      }
    } else if (post.images && post.images.length > 0) {
      images = post.images.map((img) => img.imageUrl || img);
    }
  } catch (e) {
    console.error("Lỗi parse thumbnail detail modal", e);
  }

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

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "warning";
      case "Published":
      case "Approved":
        return "success";
      case "Rejected":
        return "error";
      default:
        return "default";
    }
  };

  const statusText =
    {
      Pending: "Đang chờ duyệt",
      Published: "Đã duyệt",
      Approved: "Đã duyệt",
      Rejected: "Đã từ chối",
    }[post.status] || "Chưa rõ";

  return (
    <Modal
      title="Chi Tiết Bài Viết"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
      centered
    >
      {/* Thêm CSS để kiểm soát hình ảnh bên trong nội dung HTML */}
      <style>
        {`
          .rich-text-content img {
            max-width: 100% !important;
            height: auto !important;
            border-radius: 12px;
            display: block;
            margin: 16px auto;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          .rich-text-content iframe {
            max-width: 100%;
            border-radius: 12px;
          }
        `}
      </style>

      <div style={{ padding: "10px 0" }}>
        {/* Gallery / Hình ảnh */}
        {images.length > 0 && (
          <div
            style={{
              marginBottom: "20px",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            {images.length === 1 ? (
              <img
                src={images[0]}
                alt="Post"
                style={{
                  width: "100%",
                  maxHeight: "400px",
                  objectFit: "cover",
                }}
              />
            ) : (
              <Carousel autoplay>
                {images.map((img, index) => (
                  <div key={index}>
                    <div
                      style={{
                        height: "400px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#f0f2f5",
                      }}
                    >
                      <img
                        src={img}
                        alt={`Post img ${index + 1}`}
                        style={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          objectFit: "contain",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </Carousel>
            )}
          </div>
        )}

        {/* Tiêu đề & Thông tin cơ bản */}
        <Typography>
          <Title level={3} style={{ marginBottom: "12px", fontSize: "24px" }}>
            {post.title}
          </Title>

          <Space wrap style={{ marginBottom: "24px" }}>
            <Tag
              color={getPostTypeColor(post.postType)}
              style={{ borderRadius: "4px", padding: "2px 8px" }}
            >
              {post.postType}
            </Tag>
            <Tag
              color={getStatusColor(post.status)}
              style={{ borderRadius: "4px", padding: "2px 8px" }}
            >
              {statusText}
            </Tag>
            <Text type="secondary" style={{ fontSize: "14px" }}>
              Bởi <strong>{post.authorName || post.author || "Khách"}</strong> •{" "}
              {formatPostDate(post.createdAt)}
            </Text>
          </Space>

          {/* Nội dung đầy đủ HTML (Richtext) */}
          {post.content && (
            <div
              className="rich-text-content"
              style={{
                fontSize: "16px",
                lineHeight: "1.8",
                color: "#262626",
                textAlign: "justify",
              }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          )}

          {!post.content && post.excerpt && (
            <Paragraph
              style={{ fontSize: "16px", lineHeight: "1.8", color: "#262626" }}
            >
              {post.excerpt}
            </Paragraph>
          )}

          {!post.content && !post.excerpt && (
            <Paragraph
              type="secondary"
              italic
              style={{ textAlign: "center", padding: "20px" }}
            >
              Không có nội dung chi tiết.
            </Paragraph>
          )}
        </Typography>
      </div>
    </Modal>
  );
};

export default PostDetailModal;

import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  User,
  Tag,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  getPostById,
  formatPostDate,
} from "../../services/public/postsService";

const BlogDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPostDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getPostById(id);
        if (result.success) {
          // Xử lý status
          if (
            result.data.status !== "Published" &&
            result.data.status !== "Approved"
          ) {
            setError("Bài viết không tồn tại hoặc chưa được duyệt.");
          } else {
            setPost(result.data);
          }
        } else {
          setError(result.error || "Không thể tải bài viết.");
        }
      } catch (err) {
        setError("Lỗi kết nối máy chủ.");
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [id]);

  // Hàm parse thumbnail
  const getDisplayImage = (postData) => {
    try {
      if (postData.thumbnail) {
        const parsed = JSON.parse(postData.thumbnail);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      } else if (postData.images && postData.images.length > 0) {
        return postData.images[0].imageUrl || postData.images[0];
      }
    } catch (e) {}
    return "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80";
  };

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: "#f8fafc",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Navbar />
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "4rem",
          }}
        >
          <Loader2 size={48} className="animate-spin" color="var(--primary)" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div
        style={{
          backgroundColor: "#f8fafc",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Navbar />
        <div style={{ flex: 1, padding: "4rem 2rem" }}>
          <div
            style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}
          >
            <div
              style={{
                background: "#fee2e2",
                color: "#dc2626",
                padding: "2rem",
                borderRadius: "16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              <AlertCircle size={48} />
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
                Rất tiếc!
              </h2>
              <p>{error || "Không tìm thấy bài viết này."}</p>
            </div>
            <button
              onClick={() => navigate("/blog")}
              className="btn btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <ArrowLeft size={18} /> Quay lại danh sách
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#fff",
        minHeight: "100vh",
        fontFamily: "var(--font-main)",
      }}
    >
      <Navbar />

      {/* Article Header & Cover */}
      <div
        style={{
          position: "relative",
          height: "50vh",
          minHeight: "400px",
          width: "100%",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%)",
            zIndex: 1,
          }}
        ></div>
        <img
          src={getDisplayImage(post)}
          alt={post.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 2,
            padding: "3rem 2rem",
            color: "white",
          }}
        >
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <span
                style={{
                  background: "var(--primary)",
                  color: "white",
                  padding: "6px 16px",
                  borderRadius: "30px",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Tag size={14} /> {post.postType}
              </span>
              <span
                style={{
                  background: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(4px)",
                  padding: "6px 16px",
                  borderRadius: "30px",
                  fontSize: "0.85rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Calendar size={14} /> {formatPostDate(post.createdAt)}
              </span>
              <span
                style={{
                  background: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(4px)",
                  padding: "6px 16px",
                  borderRadius: "30px",
                  fontSize: "0.85rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <User size={14} />{" "}
                {post.authorName || post.author || "Quản trị viên"}
              </span>
            </div>
            <h1
              style={{
                fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
                fontWeight: 800,
                lineHeight: 1.3,
                margin: 0,
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {post.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div style={{ padding: "4rem 2rem", background: "#fff" }}>
        <div
          style={{ maxWidth: "800px", margin: "0 auto", position: "relative" }}
        >
          <button
            onClick={() => navigate("/blog")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#64748b",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: 600,
              marginBottom: "2rem",
              padding: 0,
            }}
            className="hover:text-primary transition-colors"
          >
            <ArrowLeft size={18} /> Quay lại danh sách
          </button>

          {post.excerpt && (
            <div
              style={{
                fontSize: "1.15rem",
                lineHeight: 1.8,
                color: "#475569",
                marginBottom: "3rem",
                fontStyle: "italic",
                borderLeft: "4px solid var(--primary)",
                background: "#f8fafc",
                padding: "1.5rem",
              }}
              dangerouslySetInnerHTML={{ __html: post.excerpt }}
            />
          )}

          {/* Scoped CSS for rich text content */}
          <style>
            {`
              .blog-rich-content {
                font-size: 1.15rem;
                line-height: 1.8;
                color: #334155;
                overflow-wrap: anywhere;
                word-break: break-word;
              }
              .blog-rich-content * {
                max-width: 100%;
              }
              .blog-rich-content p {
                margin-bottom: 1.5rem;
              }
              .blog-rich-content h1, .blog-rich-content h2, .blog-rich-content h3 {
                color: #1e293b;
                margin-top: 2.5rem;
                margin-bottom: 1rem;
                font-weight: 700;
              }
              .blog-rich-content h2 {
                font-size: 1.8rem;
              }
              .blog-rich-content h3 {
                font-size: 1.5rem;
              }
              .blog-rich-content img {
                max-width: 100%;
                height: auto;
                border-radius: 16px;
                margin: 2rem auto;
                box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
                display: block;
              }
              .blog-rich-content a {
                color: var(--primary);
                text-decoration: none;
                font-weight: 500;
              }
              .blog-rich-content a:hover {
                text-decoration: underline;
              }
              .blog-rich-content ul, .blog-rich-content ol {
                margin-top: 1rem;
                margin-bottom: 1.5rem;
                padding-left: 1.5rem;
              }
              .blog-rich-content li {
                margin-bottom: 0.5rem;
              }
              .blog-rich-content blockquote {
                border-left: 4px solid var(--primary);
                padding-left: 1.5rem;
                font-style: italic;
                color: #475569;
                background: #f8fafc;
                padding: 1.5rem;
                margin: 2rem 0;
                border-radius: 0 8px 8px 0;
              }
            `}
          </style>

          {post.content ? (
            <div
              className="blog-rich-content"
              dangerouslySetInnerHTML={{
                __html: post.content.replace(/&nbsp;/g, " "),
              }}
            />
          ) : (
            <p
              style={{
                textAlign: "center",
                color: "#94a3b8",
                padding: "4rem 0",
                fontStyle: "italic",
              }}
            >
              Nội dung bài viết đang được cập nhật...
            </p>
          )}

          {/* Tags or Bottom Info */}
          <div
            style={{
              marginTop: "4rem",
              paddingTop: "2rem",
              borderTop: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "#f1f5f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#64748b",
                }}
              >
                <User size={24} />
              </div>
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.85rem",
                    color: "#64748b",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    letterSpacing: "1px",
                  }}
                >
                  Tác giả
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "#1e293b",
                  }}
                >
                  {post.authorName || post.author || "Quản trị viên"}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/blog")}
              className="btn btn-primary btn-outline"
            >
              Đọc thêm bài khác
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BlogDetailPage;

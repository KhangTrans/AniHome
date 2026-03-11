import React, { useState, useEffect } from "react";
import { Calendar, User, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getPosts, formatPostDate } from "../../services/public/postsService";
import Pagination from "../../components/Pagination";

const BlogListPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchBlogPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          page: currentPage,
          pageSize: pageSize,
          status: "Published", // Chỉ lấy bài viết đã duyệt/xuất bản
        };

        const result = await getPosts(params);

        if (result.success) {
          // Xử lý dữ liệu trả về từ backend (có thể là mảng trực tiếp hoặc obj có items)
          let items = [];
          if (Array.isArray(result.data)) {
            items = result.data;
          } else if (result.data && result.data.items) {
            items = result.data.items;
            setTotalPages(result.data.totalPages || 1);
          }
          setPosts(items);
        } else {
          setError(result.error || "Không thể tải danh sách bài viết");
        }
      } catch (err) {
        setError("Đã có lỗi xảy ra kết nối đến máy chủ.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Hàm parse thumbnail JSON string
  const getDisplayImage = (post) => {
    try {
      if (post.thumbnail) {
        const parsed = JSON.parse(post.thumbnail);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      }
    } catch (e) {}
    return "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80";
  };

  const stripHtml = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, "").substring(0, 150) + "...";
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ padding: "4rem 2rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div
            className="text-center mb-16"
            style={{ textAlign: "center", marginBottom: "3rem" }}
          >
            <h1
              style={{
                fontSize: "3.5rem",
                fontWeight: 800,
                marginBottom: "1rem",
                color: "var(--dark)",
                background: "linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Cộng Đồng Cứu Hộ
            </h1>
            <p
              style={{
                color: "#64748b",
                fontSize: "1.2rem",
                maxWidth: "700px",
                margin: "0 auto",
              }}
            >
              Những câu chuyện cảm động, kinh nghiệm chăm sóc và tin tức mới
              nhất từ hệ thống trạm cứu hộ PetRescue.
            </p>
          </div>

          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "4rem 0",
              }}
            >
              <Loader2
                size={48}
                className="animate-spin"
                color="var(--primary)"
              />
            </div>
          ) : error ? (
            <div
              style={{
                background: "#fee2e2",
                color: "#dc2626",
                padding: "2rem",
                borderRadius: "16px",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                justifyContent: "center",
              }}
            >
              <AlertCircle size={24} /> {error}
            </div>
          ) : posts.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "4rem 0",
                color: "#94a3b8",
              }}
            >
              Hiện chưa có bài viết nào được xuất bản.
            </div>
          ) : (
            <>
              <div
                className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                  gap: "2rem",
                }}
              >
                {posts.map((post) => (
                  <article
                    key={post.postID || post.id}
                    className="group"
                    style={{
                      background: "white",
                      borderRadius: "24px",
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                      boxShadow:
                        "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)",
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                      border: "1px solid #f1f5f9",
                    }}
                  >
                    <Link
                      to={`/blog/${post.postID || post.id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div
                        style={{
                          height: "240px",
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        <img
                          src={getDisplayImage(post)}
                          alt={post.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.5s ease",
                          }}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.transform = "scale(1.1)")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.transform = "scale(1)")
                          }
                        />
                        <div
                          style={{
                            position: "absolute",
                            top: "16px",
                            left: "16px",
                            background: "var(--primary)",
                            color: "white",
                            padding: "4px 12px",
                            borderRadius: "8px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                          }}
                        >
                          {post.postType || "Cảm hứng"}
                        </div>
                      </div>
                      <div
                        className="p-6"
                        style={{
                          padding: "1.5rem",
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            fontSize: "0.85rem",
                            color: "#94a3b8",
                            marginBottom: "1rem",
                          }}
                        >
                          <Calendar size={14} />{" "}
                          {formatPostDate(post.createdAt)}
                        </div>
                        <h2
                          style={{
                            fontSize: "1.35rem",
                            fontWeight: 700,
                            marginBottom: "1rem",
                            lineHeight: "1.4",
                            color: "#1e293b",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {post.title}
                        </h2>
                        <p
                          style={{
                            color: "#64748b",
                            marginBottom: "1.5rem",
                            lineHeight: "1.6",
                            fontSize: "0.95rem",
                            flex: 1,
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {post.excerpt || stripHtml(post.content)}
                        </p>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingTop: "1.5rem",
                            borderTop: "1px solid #f1f5f9",
                            marginTop: "auto",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.75rem",
                            }}
                          >
                            <div
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "10px",
                                background: "#f1f5f9",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#64748b",
                              }}
                            >
                              <User size={16} />
                            </div>
                            <span
                              style={{
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                color: "#475569",
                              }}
                            >
                              {post.authorName || "Quản trị viên"}
                            </span>
                          </div>
                          <span
                            style={{
                              color: "var(--primary)",
                              fontWeight: 700,
                              fontSize: "0.9rem",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            Xem thêm <ArrowRight size={16} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>

              {totalPages > 1 && (
                <div style={{ marginTop: "4rem" }}>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogListPage;

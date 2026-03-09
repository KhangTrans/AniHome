import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import Sidebar from "../../components/Sidebar";
import "./AdminLayout.css";
import AdminOverview from "./dashboard";
import ShelterManager from "./shelters";
import ContentModerator from "./moderation/ContentModerator";
import ReportManager from "./moderation/ReportManager";
import CategoryEditor from "./categories";
import UserManager from "./users";
import {
  LayoutDashboard,
  Home,
  FileText,
  AlertTriangle,
  Layers,
  Users,
  Menu,
} from "lucide-react";

const { Sider, Content } = Layout;

const SuperAdminDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setCollapsed(mobile); // Auto collapse on mobile
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const sidebarItems = [
    {
      label: "Tổng Quan",
      path: "/admin",
      icon: <LayoutDashboard size={20} />,
      exact: true,
    },
    {
      label: "Quản Lý Trạm",
      path: "/admin/shelters",
      icon: <Home size={20} />,
    },
    {
      label: "Kiểm Duyệt Nội Dung",
      path: "/admin/content",
      icon: <FileText size={20} />,
    },
    {
      label: "Báo Cáo Vi Phạm",
      path: "/admin/reports",
      icon: <AlertTriangle size={20} />,
    },
    {
      label: "Quản Lý Người Dùng",
      path: "/admin/users",
      icon: <Users size={20} />,
    },
    {
      label: "Danh Mục",
      path: "/admin/categories",
      icon: <Layers size={20} />,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Mobile Overlay */}
      {isMobile && !collapsed && (
        <div
          onClick={() => setCollapsed(true)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
            zIndex: 900,
          }}
        />
      )}

      {/* Mobile Header */}
      <div className="admin-mobile-header">
        <div className="admin-mobile-header-content">
          <button
            className="admin-mobile-menu-btn"
            onClick={() => setCollapsed(!collapsed)}
          >
            <Menu size={24} />
          </button>
          <h1 className="admin-mobile-title">Quản Trị Viên</h1>
        </div>
      </div>

      <Sider
        width={260}
        collapsedWidth={isMobile ? 0 : 80}
        breakpoint="md"
        collapsed={collapsed}
        onCollapse={(collapsed) => setCollapsed(collapsed)}
        collapsible
        trigger={null}
        style={{
          background: "white",
          borderRight: "1px solid #e5e7eb",
          position: isMobile ? "fixed" : "relative",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: isMobile ? 999 : 50,
          overflow: "auto",
          height: "100vh",
        }}
        className="admin-sider"
      >
        <Sidebar
          title="Quản Trị Viên"
          items={sidebarItems}
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          onClose={() => setCollapsed(true)}
        />
      </Sider>

      <Layout
        style={{
          transition: "margin-left 0.2s",
          minHeight: "100vh",
        }}
      >
        <Content
          style={{
            background: "var(--light)",
            padding: isMobile ? "1rem" : "1.5rem 2rem",
            paddingTop: isMobile ? "5rem" : "1.5rem",
          }}
        >
          <Routes>
            <Route path="/" element={<AdminOverview />} />
            <Route path="/shelters" element={<ShelterManager />} />
            <Route path="/content" element={<ContentModerator />} />
            <Route path="/reports" element={<ReportManager />} />
            <Route path="/users" element={<UserManager />} />
            <Route path="/categories" element={<CategoryEditor />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default SuperAdminDashboard;

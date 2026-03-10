import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import Sidebar from "../../components/Sidebar";
import "./ShelterLayout.css";
import ShelterOverview from "./ShelterOverview";
import AnimalManager from "./AnimalManager";
import ScheduleManager from "./ScheduleManager";
import InventoryManager from "./InventoryManager";
import AdoptionManager from "./AdoptionManager";
import { Home, Calendar, Package, Dog, Menu, Heart } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  startNotificationConnection,
  stopConnection,
} from "../../services/notificationHub";

const { Sider, Content } = Layout;

const ShelterDashboard = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // SignalR Connection
  useEffect(() => {
    if (user && user.roleID === 2) {
      // 2 = shelter_admin
      const shelterId = user.shelterID;
      if (shelterId) {
        startNotificationConnection(shelterId);
      }
    }

    return () => {
      stopConnection();
    };
  }, [user]);

  useEffect(() => {
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
      path: "/shelter",
      icon: <Home size={20} />,
      exact: true,
    },
    { label: "Thú Cưng", path: "/shelter/animals", icon: <Dog size={20} /> },
    {
      label: "Yêu Cầu Nhận Nuôi",
      path: "/shelter/adoptions",
      icon: <Heart size={20} />,
    },
    {
      label: "Lịch Hẹn",
      path: "/shelter/calendar",
      icon: <Calendar size={20} />,
    },
    {
      label: "Kho & Cửa Hàng",
      path: "/shelter/inventory",
      icon: <Package size={20} />,
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
      <div className="shelter-mobile-header">
        <div className="shelter-mobile-header-content">
          <button
            className="shelter-mobile-menu-btn"
            onClick={() => setCollapsed(!collapsed)}
          >
            <Menu size={24} />
          </button>
          <h1 className="shelter-mobile-title">Quản Lý Trạm</h1>
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
        className="shelter-sider"
      >
        <Sidebar
          title="Quản Lý Trạm"
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
            <Route path="/" element={<ShelterOverview />} />
            <Route path="/animals" element={<AnimalManager />} />
            <Route path="/adoptions" element={<AdoptionManager />} />
            <Route path="/calendar" element={<ScheduleManager />} />
            <Route path="/inventory" element={<InventoryManager />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ShelterDashboard;

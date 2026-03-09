import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Button, Divider, Tooltip } from 'antd';
import { Shield, LogOut, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ title, items, collapsed, onToggle, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Convert items to antd Menu items format
  const menuItems = items.map((item, index) => ({
    key: item.path,
    icon: collapsed ? (
      <Tooltip title={item.label} placement="right">
        {item.icon}
      </Tooltip>
    ) : item.icon,
    label: collapsed ? null : item.label,
    onClick: () => {
      navigate(item.path);
      if (isMobile && onClose) {
        onClose();
      }
    },
  }));

  // Get selected key based on current path
  const getSelectedKey = () => {
    const currentPath = location.pathname;
    // Exact match or find closest match
    const exactMatch = items.find(item => 
      item.exact ? currentPath === item.path : currentPath.startsWith(item.path)
    );
    return exactMatch ? exactMatch.path : items[0]?.path;
  };

  return (
    <div className="sidebar-container">
      <div className="sidebar-header" style={{ 
        padding: collapsed ? '1.5rem 1rem' : '1.5rem 1.5rem 1rem',
        justifyContent: collapsed ? 'center' : 'space-between'
      }}>
        {!collapsed && (
          <div className="sidebar-title-wrapper">
             <Shield color="var(--primary)" size={28} />
             <h2 className="sidebar-title">{title}</h2>
          </div>
        )}
        {collapsed && (
          <Shield color="var(--primary)" size={28} />
        )}
        {!collapsed && isMobile && (
          <button onClick={onClose} className="sidebar-close-btn">
              <X size={24} />
          </button>
        )}
      </div>

      {/* Toggle button for desktop */}
      {!isMobile && onToggle && (
        <div style={{ padding: '0 1rem 1rem', textAlign: collapsed ? 'center' : 'right' }}>
          <Button
            type="text"
            icon={collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            onClick={onToggle}
            style={{
              width: collapsed ? '100%' : 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            {!collapsed && 'Thu gọn'}
          </Button>
        </div>
      )}

      <Menu
        mode="inline"
        selectedKeys={[getSelectedKey()]}
        items={menuItems}
        inlineCollapsed={collapsed}
        style={{
          border: 'none',
          flex: 1,
          padding: collapsed ? '0.5rem 0.25rem' : '0.5rem 0.5rem',
        }}
        theme="light"
      />

      <div className="sidebar-footer" style={{
        padding: collapsed ? '1rem 0.5rem 1.5rem' : '1rem 1.5rem 1.5rem',
      }}>
        <Divider style={{ margin: '0 0 1rem 0' }} />
        {collapsed ? (
          <Tooltip title="Đăng Xuất" placement="right">
            <Button
              type="text"
              danger
              icon={<LogOut size={20} />}
              onClick={logout}
              block
              size="large"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 'auto',
                padding: '1rem',
              }}
            />
          </Tooltip>
        ) : (
          <Button
            type="text"
            danger
            icon={<LogOut size={20} />}
            onClick={logout}
            block
            size="large"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              gap: '1rem',
              height: 'auto',
              padding: '1rem',
            }}
          >
            Đăng Xuất
          </Button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

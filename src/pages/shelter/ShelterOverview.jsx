import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Button, List, Alert, Space, Spin } from 'antd';
import { 
  Package, 
  MapPin, 
  Plus,
  Clock,
  TrendingUp,
  PawPrint
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getShelterDashboard } from '../../services/shelter/shelterDashboardService';

const ShelterOverview = () => {
  const { user } = useAuth();
  const toast = useToast();
  
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  const shelterID = user?.shelterID || 1; // fallback for dev

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      
      setLoading(true);
      try {
        const result = await getShelterDashboard(shelterID);
        
        if (result.success) {
          setDashboardData(result.data);
        } else {
          toast.error(result.error || 'Không thể tải dữ liệu dashboard');
        }
      } catch (error) {
        toast.error('Đã xảy ra lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [shelterID]);

  const stats = dashboardData?.stats ? [
    { 
      label: 'Tổng Thú Cưng', 
      value: dashboardData.stats.totalPets || 0, 
      icon: <PawPrint size={32} />, 
      color: '#FF6B6B' 
    },
    { 
      label: 'Nhận Nuôi (Tháng)', 
      value: dashboardData.stats.adoptedThisMonth || 0, 
      icon: <TrendingUp size={32} />, 
      color: '#52C41A' 
    },
    { 
      label: 'Đơn Đợi Duyệt', 
      value: dashboardData.stats.pendingAdoptions || 0, 
      icon: <Clock size={32} />, 
      color: '#FAAD14' 
    },
    { 
      label: 'Hàng Tồn Thấp', 
      value: dashboardData.stats.lowStockItems || 0, 
      icon: <Package size={32} />, 
      color: '#F5222D' 
    },
  ] : [];

  const recentActivities = dashboardData?.recentActivities || [];
  const urgentAlerts = dashboardData?.urgentAlerts || [];

  return (
    <Spin spinning={loading}>
      <div>
        {/* Header Card */}
        <Card 
          style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            marginBottom: 24
          }}
          bodyStyle={{ padding: '32px' }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <h1 style={{ 
                fontSize: '2rem', 
                color: 'white', 
                margin: 0,
                marginBottom: 8 
              }}>
                {user?.shelterName || 'Happy Paws Rescue'}
              </h1>
              <Space style={{ color: 'white', opacity: 0.95 }}>
                <MapPin size={18} />
                <span style={{ fontSize: '1rem' }}>Dashboard Tổng Quan</span>
              </Space>
            </Col>
            <Col>
              <Button 
                type="primary" 
                size="large" 
                icon={<Plus size={18} />}
                style={{ 
                  background: 'white',
                  color: '#667eea',
                  border: 'none',
                  fontWeight: 500
                }}
              >
                Đăng Ký Nhanh
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Stats Grid */}
        {stats.length > 0 && (
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {stats.map((stat, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card 
                  hoverable
                  style={{ 
                    borderRadius: 8,
                    borderLeft: `4px solid ${stat.color}`
                  }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center' 
                    }}>
                      <div style={{ color: stat.color }}>
                        {stat.icon}
                      </div>
                      <Statistic 
                        value={stat.value} 
                        valueStyle={{ 
                          fontSize: '2rem',
                          fontWeight: 600,
                          color: stat.color
                        }} 
                      />
                    </div>
                    <div style={{ 
                      color: '#8c8c8c', 
                      fontSize: '0.9rem',
                      fontWeight: 500
                    }}>
                      {stat.label}
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Content Grid */}
        <Row gutter={[16, 16]}>
          {/* Recent Activity */}
          <Col xs={24} lg={16}>
            <Card 
              title={<span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Hoạt Động Gần Đây</span>}
              style={{ borderRadius: 8 }}
            >
              {recentActivities.length > 0 ? (
                <List
                  dataSource={recentActivities}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        title={<span style={{ fontWeight: 500 }}>{item.description}</span>}
                        description={new Date(item.timestamp).toLocaleString('vi-VN')}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#8c8c8c' }}>
                  Chưa có hoạt động nào
                </div>
              )}
            </Card>
          </Col>
          
          {/* Urgent Alerts */}
          <Col xs={24} lg={8}>
            <Card 
              title={<span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#F5222D' }}>⚠️ Cảnh Báo Khẩn</span>}
              style={{ 
                borderRadius: 8,
                borderTop: '3px solid #F5222D'
              }}
            >
              {urgentAlerts.length > 0 ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                  {urgentAlerts.map((alert, index) => {
                    const alertType = alert.alertType === 'LowStock' ? 'warning' : 
                                     alert.alertType === 'HealthCheckDue' ? 'info' : 'error';
                    return (
                      <Alert
                        key={index}
                        message={alert.message}
                        type={alertType}
                        showIcon
                        style={{ fontSize: '0.9rem' }}
                      />
                    );
                  })}
                  
                  <Button 
                    type="link" 
                    danger 
                    style={{ padding: 0, marginTop: 8 }}
                  >
                    Xem tất cả cảnh báo →
                  </Button>
                </Space>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#8c8c8c' }}>
                  ✅ Không có cảnh báo
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  );
};

export default ShelterOverview;

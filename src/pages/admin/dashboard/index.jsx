import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Home, 
  PawPrint, 
  Heart, 
  Clock, 
  AlertTriangle, 
  DollarSign,
  TrendingUp,
  FileText,
  ChevronRight,
  Download
} from 'lucide-react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Tabs, 
  Tag, 
  Button, 
  Spin, 
  Empty,
  Typography,
  Space,
  Divider
} from 'antd';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement,
  LineElement,
  Title,
  Filler
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { getAdminDashboard } from '../../../services/admin/adminDashboardService';
import { useToast } from '../../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const { Title: AntTitle, Text } = Typography;

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement,
  LineElement,
  Title, 
  Filler
);

const AdminOverview = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const result = await getAdminDashboard();
    if (result.success) {
      setData(result.data);
    } else {
      toast.error('Không thể tải dữ liệu dashboard: ' + result.error);
    }
    setLoading(false);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Chart Data Preparation
  const adoptionChartData = {
    labels: ['Thành công', 'Đang chờ', 'Trả lại'],
    datasets: [
      {
        data: data?.adoptionRates ? [
          data.adoptionRates.successful,
          data.adoptionRates.pending,
          data.adoptionRates.returned
        ] : [0, 0, 0],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        hoverOffset: 4,
        borderWidth: 0,
      },
    ],
  };

  const financialChartData = {
    labels: data?.financials?.map(f => f.month) || [],
    datasets: [
      {
        label: 'Quyên góp',
        data: data?.financials?.map(f => f.donations) || [],
        backgroundColor: 'rgba(79, 70, 229, 0.8)',
        borderRadius: 6,
      },
      {
        label: 'Chi phí',
        data: data?.financials?.map(f => f.expenses) || [],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderRadius: 6,
      },
    ],
  };

  const pendingPostsColumns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Tác giả',
      dataIndex: 'authorName',
      key: 'authorName',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="link" 
          icon={<ChevronRight size={16} />} 
          onClick={() => navigate(`/admin/content?id=${record.postID}`)}
        >
          Xử lý
        </Button>
      ),
    },
  ];

  const urgentReportsColumns = [
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
      render: (text) => <Tag color="error">{text}</Tag>
    },
    {
      title: 'Người báo cáo',
      dataIndex: 'reporterName',
      key: 'reporterName',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="link" 
          icon={<ChevronRight size={16} />} 
          onClick={() => navigate(`/admin/reports?id=${record.reportID}`)}
        >
          Xử lý
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  const summary = {
    totalUsers: data?.totalUsers || 0,
    totalShelters: data?.totalShelters || 0,
    totalPets: data?.totalPets || 0,
    totalAdoptions: (data?.adoptionRates?.successful || 0) + (data?.adoptionRates?.pending || 0) + (data?.adoptionRates?.returned || 0),
    totalDonations: data?.totalDonations || 0,
    pendingShelters: data?.pendingSheltersCount || 0,
    activeReports: data?.pendingReportsCount || 0,
    pendingBlogs: data?.pendingBlogsCount || 0
  };

  return (
    <div className="admin-dashboard-wrapper">
      <div className="admin-page-header" style={{ marginBottom: '2rem' }}>
        <div className="admin-page-title-wrapper">
          <AntTitle level={2} style={{ margin: 0 }}>Tổng Quan Hệ Thống</AntTitle>
          <Text type="secondary">Chào mừng trở lại, quản trị viên. Đây là tình hình hôm nay.</Text>
        </div>
        <div className="admin-page-actions">
          <Button icon={<Download size={18} />} type="primary">Xuất báo cáo</Button>
        </div>
      </div>

      {/* Stat Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '2rem' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            bordered={false} 
            className="stat-card" 
            onClick={() => navigate('/admin/users')}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title="Tổng Người Dùng"
              value={summary.totalUsers}
              prefix={<Users size={20} style={{ marginRight: 8, color: '#3b82f6' }} />}
            />
            <div style={{ marginTop: 10 }}><Tag color="blue"><TrendingUp size={12} /> Cập nhật mới</Tag></div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            bordered={false} 
            className="stat-card" 
            onClick={() => navigate('/admin/shelters')}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title="Tổng Trạm Cứu Hộ"
              value={summary.totalShelters}
              prefix={<Home size={20} style={{ marginRight: 8, color: '#10b981' }} />}
            />
            <div style={{ marginTop: 10 }}>
                {summary.pendingShelters > 0 ? 
                  <Tag color="warning"><Clock size={12} /> {summary.pendingShelters} chờ duyệt</Tag> : 
                  <Tag color="success">Ổn định</Tag>
                }
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            bordered={false} 
            className="stat-card" 
            onClick={() => navigate('/admin/pets')}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title="Thú Cưng Hệ Thống"
              value={summary.totalPets}
              prefix={<PawPrint size={20} style={{ marginRight: 8, color: '#f59e0b' }} />}
            />
            <div style={{ marginTop: 10 }}><Text type="secondary" style={{ fontSize: 12 }}>Đã có {summary.totalAdoptions} ca nhận nuôi</Text></div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            bordered={false} 
            className="stat-card" 
            onClick={() => navigate('/admin/donations')}
            style={{ cursor: 'pointer' }}
          >
            <Statistic
              title="Tổng Quyên Góp"
              value={summary.totalDonations}
              formatter={(val) => formatCurrency(val)}
              prefix={<DollarSign size={20} style={{ marginRight: 8, color: '#ef4444' }} />}
            />
            <div style={{ marginTop: 10 }}>
                {summary.activeReports > 0 && <Tag color="error"><AlertTriangle size={12} /> {summary.activeReports} báo cáo mới</Tag>}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts section */}
      <Row gutter={[16, 16]} style={{ marginBottom: '2rem' }}>
        <Col xs={24} xl={8}>
          <Card title="Tỷ Lệ Nhận Nuôi" bordered={false} style={{ height: '100%' }}>
            <div style={{ height: 300, position: 'relative' }}>
              <Doughnut 
                data={adoptionChartData} 
                options={{ 
                  maintainAspectRatio: false, 
                  plugins: { legend: { position: 'bottom' } },
                  cutout: '70%'
                }} 
              />
              <div style={{
                position: 'absolute',
                top: '44%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center'
              }}>
                <AntTitle level={3} style={{ margin: 0 }}>{summary.totalAdoptions}</AntTitle>
                <Text type="secondary">Tổng ca</Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} xl={16}>
          <Card title="Biến Động Tài Chính (6 Tháng)" bordered={false} style={{ height: '100%' }}>
            <div style={{ height: 300 }}>
              <Bar 
                data={financialChartData} 
                options={{ 
                  maintainAspectRatio: false,
                  scales: { y: { beginAtZero: true } },
                  plugins: { legend: { position: 'top' } }
                }} 
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Tasks Section */}
      <Card bordered={false} title="Danh Sách Công Việc Cần Xử Lý">
        <Tabs defaultActiveKey="1" items={[
          {
            key: '1',
            label: (
              <Space>
                <FileText size={18} />
                Bài viết chờ duyệt
                {summary.pendingBlogs > 0 && <Tag color="blue">{summary.pendingBlogs}</Tag>}
              </Space>
            ),
            children: (
              <Table 
                dataSource={data?.recentPendingPosts || []} 
                columns={pendingPostsColumns} 
                pagination={false}
                locale={{ 
                  emptyText: summary.pendingBlogs > 0 
                    ? <div style={{ padding: '20px' }}>
                        <Text>Có {summary.pendingBlogs} bài viết đang chờ, hãy vào trang quản lý để xem.</Text>
                        <br />
                        <Button type="primary" size="small" style={{ marginTop: 10 }} onClick={() => navigate('/admin/content')}>Đi tới trang kiểm duyệt</Button>
                      </div>
                    : <Empty description="Không có bài viết nào chờ duyệt" /> 
                }}
                rowKey="postID"
              />
            )
          },
          {
            key: '2',
            label: (
              <Space>
                <AlertTriangle size={18} />
                Báo cáo vi phạm
                {summary.activeReports > 0 && <Tag color="red">{summary.activeReports}</Tag>}
              </Space>
            ),
            children: (
              <Table 
                dataSource={data?.recentUrgentReports || []} 
                columns={urgentReportsColumns} 
                pagination={false}
                locale={{ 
                  emptyText: summary.activeReports > 0 
                    ? <div style={{ padding: '20px' }}>
                        <Text>Có {summary.activeReports} báo cáo mới, hãy vào trang báo cáo để xử lý.</Text>
                        <br />
                        <Button type="primary" size="small" style={{ marginTop: 10 }} onClick={() => navigate('/admin/reports')}>Đi tới trang báo cáo</Button>
                      </div>
                    : <Empty description="Không có báo cáo nào cần xử lý" /> 
                }}
                rowKey="reportID"
              />
            )
          }
        ]} />
      </Card>

      <style>{`
        .stat-card {
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          border-radius: 12px;
          transition: transform 0.2s;
        }
        .stat-card:hover {
          transform: translateY(-5px);
        }
        .admin-dashboard-wrapper .ant-card-head {
          border-bottom: none;
          padding: 1.5rem 1.5rem 0;
        }
        .admin-dashboard-wrapper .ant-card-head-title {
          font-weight: 700;
          font-size: 1.1rem;
        }
        .admin-dashboard-wrapper .ant-card-body {
          padding: 1.5rem;
        }
      `}</style>
    </div>
  );
};

export default AdminOverview;

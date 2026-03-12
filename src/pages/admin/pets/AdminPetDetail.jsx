import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Tag, 
  Button, 
  Space, 
  Image, 
  Statistic, 
  Descriptions, 
  Spin, 
  Empty,
  Divider,
  Breadcrumb
} from 'antd';
import { 
  ArrowLeft, 
  Heart, 
  Stethoscope, 
  ClipboardList, 
  MapPin, 
  Home, 
  Calendar,
  PawPrint,
  Clock
} from 'lucide-react';
import { getAdminPetDetail } from '../../../services/admin/adminPetsService';
import { useToast } from '../../../context/ToastContext';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const AdminPetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [pet, setPet] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      const result = await getAdminPetDetail(id);
      if (result.success) {
        setPet(result.data);
      } else {
        toast.error(result.error);
      }
      setLoading(false);
    };
    fetchDetail();
  }, [id]);

  const getStatusDisplay = (status) => {
    switch (status?.toLowerCase()) {
      case 'available': return { text: 'Sẵn sàng', color: 'success' };
      case 'pending': return { text: 'Chờ duyệt', color: 'warning' };
      case 'adopted': return { text: 'Đã nhận nuôi', color: 'blue' };
      case 'intreatment': return { text: 'Đang điều trị', color: 'orange' };
      default: return { text: status, color: 'default' };
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <Spin size="large" tip="Đang tải thông tin thú cưng..." />
    </div>
  );

  if (!pet) return (
    <div style={{ padding: '2rem' }}>
      <Button icon={<ArrowLeft size={16} />} onClick={() => navigate('/admin/pets')} style={{ marginBottom: '1rem' }}> Quay lại</Button>
      <Empty description="Không tìm thấy thông tin thú cưng" />
    </div>
  );

  const status = getStatusDisplay(pet.status);

  return (
    <div className="admin-pet-detail-page">
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Chi Tiết Thú Cưng: {pet.petName}</Title>
          <Text type="secondary">Cập nhật lần cuối: {pet.updatedAt ? dayjs(pet.updatedAt).format('DD/MM/YYYY HH:mm') : 'N/A'}</Text>
        </div>
        <Button 
          icon={<ArrowLeft size={16} />} 
          onClick={() => navigate('/admin/pets')}
          size="large"
        >
          Quay lại danh sách
        </Button>
      </div>

      <Row gutter={[24, 24]}>
        {/* Left Column: Basic Info & Images */}
        <Col xs={24} lg={16}>
          <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={10}>
                <Image
                  src={pet.imageURL || 'https://via.placeholder.com/400?text=No+Image'}
                  style={{ width: '100%', borderRadius: '12px', objectFit: 'cover', aspectRatio: '1/1' }}
                  fallback="https://via.placeholder.com/400?text=Error"
                />
                
                {pet.images && pet.images.length > 0 && (
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Image.PreviewGroup>
                      {pet.images.map((img, idx) => (
                        <Image
                          key={idx}
                          src={img.imageURL}
                          width={60}
                          height={60}
                          style={{ borderRadius: '6px', objectFit: 'cover' }}
                        />
                      ))}
                    </Image.PreviewGroup>
                  </div>
                )}
              </Col>
              
              <Col xs={24} md={14}>
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <div>
                    <Space size={8}>
                      <Title level={3} style={{ margin: 0 }}>{pet.petName}</Title>
                      <Tag color={status.color} style={{ fontSize: '14px', padding: '4px 12px' }}>
                        {status.text.toUpperCase()}
                      </Tag>
                    </Space>
                    <div style={{ marginTop: '8px' }}>
                      <Tag icon={<PawPrint size={12} />} color="blue">{pet.categoryName}</Tag>
                      <Tag color="cyan">{pet.breed}</Tag>
                    </div>
                  </div>

                  <Descriptions column={1} bordered size="small" labelStyle={{ fontWeight: 600, width: '140px' }}>
                    <Descriptions.Item label="Mã ID">PET#{pet.petID}</Descriptions.Item>
                    <Descriptions.Item label="Trạm sở hữu">{pet.shelterName}</Descriptions.Item>
                    <Descriptions.Item label="Khu vực">
                      <Space size={4}>
                        <MapPin size={14} style={{ color: 'var(--primary)' }} />
                        {pet.shelterLocation || 'N/A'}
                      </Space>
                    </Descriptions.Item>
                  </Descriptions>

                  <div>
                    <Text strong style={{ display: 'block', marginBottom: '8px' }}>Mô tả chi tiết:</Text>
                    <Paragraph type="secondary" style={{ whiteSpace: 'pre-wrap' }}>
                      {pet.description || 'Không có mô tả cho thú cưng này.'}
                    </Paragraph>
                  </div>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Shelter Info Card */}
          <Card 
            title={<Title level={4} style={{ margin: 0 }}>Thông Tin Trạm Cứu Hộ</Title>}
            bordered={false} 
            style={{ marginTop: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
          >
            <Space align="start" size="large">
               <div style={{ background: '#f0f2f5', padding: '16px', borderRadius: '50%' }}>
                 <Home size={32} color="var(--primary)" />
               </div>
               <div>
                 <Title level={5} style={{ margin: '0 0 4px' }}>{pet.shelterName}</Title>
                 <Text type="secondary">{pet.shelterLocation}</Text>
                 <div style={{ marginTop: '12px' }}>
                   <Button type="primary" ghost size="small" onClick={() => navigate(`/admin/shelters?name=${pet.shelterName}`)}>
                     Quản lý trạm này
                   </Button>
                 </div>
               </div>
            </Space>
          </Card>
        </Col>

        {/* Right Column: Stats & Management */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* Quick Stats */}
            <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <Title level={4} style={{ marginBottom: '20px' }}>Thống Kê Hoạt Động</Title>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <div className="stat-item">
                    <Statistic 
                      title="Yêu cầu nhận nuôi" 
                      value={pet.adoptionRequestsCount || 0} 
                      prefix={<Heart size={20} color="#ff4d4f" style={{ marginRight: '8px' }} />}
                    />
                  </div>
                </Col>
                <Col span={24}>
                  <Divider style={{ margin: '8px 0' }} />
                  <div className="stat-item">
                    <Statistic 
                      title="Hồ sơ sức khỏe" 
                      value={pet.healthRecordsCount || 0} 
                      prefix={<Stethoscope size={20} color="#52c41a" style={{ marginRight: '8px' }} />}
                    />
                  </div>
                </Col>
                <Col span={24}>
                  <Divider style={{ margin: '8px 0' }} />
                  <div className="stat-item">
                    <Statistic 
                      title="Công việc liên quan" 
                      value={pet.tasksCount || 0} 
                      prefix={<ClipboardList size={20} color="#1890ff" style={{ marginRight: '8px' }} />}
                    />
                  </div>
                </Col>
              </Row>
            </Card>

            {/* Quick Actions for Admin */}
            <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <Title level={4} style={{ marginBottom: '16px' }}>Thao Tác Quản Trị</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button block icon={<Heart size={16} />}>Xem hồ sơ nhận nuôi</Button>
                <Button block icon={<Stethoscope size={16} />}>Theo dõi sức khỏe</Button>
                <Button block icon={<ClipboardList size={16} />}>Danh sách công việc</Button>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>

      <style>{`
        .admin-pet-detail-page .stat-item {
          padding: 8px 12px;
          border-radius: 8px;
          transition: background 0.3s;
        }
        .admin-pet-detail-page .stat-item:hover {
          background: #f5f5f5;
        }
        .admin-pet-detail-page .ant-descriptions-item-label {
          background-color: #fafafa !important;
        }
      `}</style>
    </div>
  );
};

export default AdminPetDetail;

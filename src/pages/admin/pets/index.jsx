import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Input, 
  Select, 
  Button, 
  Space, 
  Tag, 
  Image, 
  Card, 
  Typography,
  Breadcrumb,
  Tooltip,
  Avatar
} from 'antd';
import { 
  Search, 
  Filter, 
  Eye, 
  RefreshCw,
  PawPrint,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { getAdminPets } from '../../../services/admin/adminPetsService';
import { getAllCategories } from '../../../services/admin/adminCategoriesService';
import { useToast } from '../../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

const AdminPetManagement = () => {
  const toast = useToast();
  const navigate = useNavigate();
  
  // State
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [filters, setFilters] = useState({
    keyword: '',
    categoryId: null,
    status: null,
    shelterId: null,
    page: 1,
    pageSize: 10
  });

  // Load categories and shelters
  useEffect(() => {
    const fetchData = async () => {
      const [catResult, shelterResult] = await Promise.all([
        getAllCategories(),
        import('../../../services/admin/adminSheltersService').then(m => m.getAllShelters({ PageSize: 100 }))
      ]);

      if (catResult.success) {
        setCategories(catResult.data.filter(cat => cat.categoryType === 'Pet'));
      }
      if (shelterResult.success) {
        setShelters(shelterResult.data.items);
      }
    };
    fetchData();
  }, []);

  // Load pets
  useEffect(() => {
    fetchPets();
  }, [filters.page, filters.pageSize, filters.categoryId, filters.status, filters.shelterId]);

  const fetchPets = async () => {
    setLoading(true);
    const result = await getAdminPets(filters);
    if (result.success) {
      setData(result.data.items);
      setTotal(result.data.totalCount);
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
    fetchPets();
  };

  const handleReset = () => {
    setFilters({
      keyword: '',
      categoryId: null,
      status: null,
      shelterId: null,
      page: 1,
      pageSize: 10
    });
  };

  const getStatusDisplay = (status) => {
    switch (status?.toLowerCase()) {
      case 'available': return { text: 'Sẵn sàng', color: 'success' };
      case 'pending': return { text: 'Chờ duyệt', color: 'warning' };
      case 'adopted': return { text: 'Đã nhận nuôi', color: 'blue' };
      case 'intreatment': return { text: 'Đang điều trị', color: 'orange' };
      default: return { text: status, color: 'default' };
    }
  };

  const columns = [
    {
      title: 'Thú cưng',
      key: 'petInfo',
      width: 250,
      render: (_, record) => (
        <Space>
          <Image
            src={record.imageURL || 'https://via.placeholder.com/150?text=No+Image'}
            alt={record.petName}
            width={60}
            height={60}
            style={{ objectFit: 'cover', borderRadius: '8px' }}
            fallback="https://via.placeholder.com/150?text=Error"
          />
          <div>
            <Text strong style={{ display: 'block' }}>{record.petName}</Text>
            <Tag icon={<PawPrint size={10} />} color="processing">{record.breed}</Tag>
          </div>
        </Space>
      ),
    },
    {
      title: 'Loài',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (text) => <Tag color="orange">{text}</Tag>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const display = getStatusDisplay(status);
        return (
          <Tag color={display.color}>
            {display.text.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Trạm cứu hộ',
      key: 'shelter',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: '0.9rem' }}>{record.shelterName}</Text>
          <Space size={4}>
            <MapPin size={12} style={{ color: 'var(--gray)' }} />
            <Text type="secondary" style={{ fontSize: '0.8rem' }}>ID: {record.shelterID}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button 
              type="primary" 
              ghost 
              icon={<Eye size={16} />} 
              onClick={() => navigate(`/admin/pets/${record.petID}`)}
            />
          </Tooltip>
          <Tooltip title="Xem trang trạm">
            <Button 
              icon={<ExternalLink size={16} />} 
              onClick={() => navigate(`/admin/shelters?id=${record.shelterID}`)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-pets-page">
      <div className="admin-page-header" style={{ marginBottom: '2rem' }}>
        <div className="admin-page-title-wrapper">
          <Title level={2} style={{ margin: '0 0 8px' }}>Danh Sách Thú Cưng</Title>
          <Text type="secondary">Quản lý và giám sát tất cả thú cưng trên hệ thống từ các trạm cứu hộ.</Text>
        </div>
      </div>

      <Card bordered={false} style={{ marginBottom: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>Tìm kiếm</Text>
            <Input 
              prefix={<Search size={16} style={{ color: 'var(--gray)' }} />}
              placeholder="Tên thú cưng, giống loài..."
              value={filters.keyword}
              onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
              onPressEnter={handleSearch}
              allowClear
            />
          </div>
          
          <div style={{ width: '160px' }}>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>Loài</Text>
            <Select
              style={{ width: '100%' }}
              placeholder="Tất cả loài"
              value={filters.categoryId}
              onChange={(val) => setFilters(prev => ({ ...prev, categoryId: val, page: 1 }))}
              allowClear
            >
              {categories.map(cat => (
                <Option key={cat.categoryID} value={cat.categoryID}>{cat.categoryName}</Option>
              ))}
            </Select>
          </div>

          <div style={{ width: '160px' }}>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>Trạng thái</Text>
            <Select
              style={{ width: '100%' }}
              placeholder="Tất cả"
              value={filters.status}
              onChange={(val) => setFilters(prev => ({ ...prev, status: val, page: 1 }))}
              allowClear
            >
              <Option value="Available">Sẵn sàng</Option>
              <Option value="Adopted">Đã nhận nuôi</Option>
              <Option value="Pending">Chờ duyệt</Option>
              <Option value="InTreatment">Đang điều trị</Option>
            </Select>
          </div>

          <div style={{ width: '220px' }}>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>Trạm cứu hộ</Text>
            <Select
              showSearch
              style={{ width: '100%' }}
              placeholder="Chọn trạm"
              optionFilterProp="children"
              value={filters.shelterId}
              onChange={(val) => setFilters(prev => ({ ...prev, shelterId: val, page: 1 }))}
              allowClear
            >
              {shelters.map(shelter => (
                <Option key={shelter.shelterID} value={shelter.shelterID}>{shelter.shelterName}</Option>
              ))}
            </Select>
          </div>

          <Space>
            <Button type="primary" icon={<Search size={16} />} onClick={handleSearch}>Tìm kiếm</Button>
            <Button icon={<RefreshCw size={16} />} onClick={handleReset}>Làm mới</Button>
          </Space>
        </div>
      </Card>

      <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Table 
          columns={columns} 
          dataSource={data} 
          loading={loading}
          rowKey="petID"
          pagination={{
            current: filters.page,
            pageSize: filters.pageSize,
            total: total,
            showSizeChanger: true,
            onChange: (page, pageSize) => {
              setFilters(prev => ({ ...prev, page, pageSize }));
            },
            showTotal: (total) => `Tổng cộng ${total} thú cưng`
          }}
        />
      </Card>

      <style>{`
        .admin-pets-page .ant-table-thead > tr > th {
          background: #fafafa;
          font-weight: 700;
        }
        .admin-pets-page .stat-card {
          transition: transform 0.2s;
        }
        .admin-pets-page .stat-card:hover {
          transform: translateY(-4px);
        }
      `}</style>
    </div>
  );
};

export default AdminPetManagement;

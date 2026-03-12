import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Input, 
  Select, 
  Button, 
  Space, 
  Tag, 
  Card, 
  Typography, 
  DatePicker,
  Tooltip
} from 'antd';
import { 
  Search, 
  RefreshCw, 
  Filter, 
  Download,
  Calendar,
  CreditCard,
  User,
  Hash
} from 'lucide-react';
import { getAdminDonations } from '../../../services/admin/adminDonationsService';
import { getAllShelters } from '../../../services/admin/adminSheltersService';
import { useToast } from '../../../context/ToastContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const AdminDonationHistory = () => {
  const toast = useToast();
  
  // State
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [shelters, setShelters] = useState([]);
  const [filters, setFilters] = useState({
    keyword: '',
    fromDate: null,
    toDate: null,
    shelterId: null,
    page: 1,
    pageSize: 10
  });

  // Load shelters for filter
  useEffect(() => {
    const fetchShelters = async () => {
      const result = await getAllShelters({ PageSize: 100 });
      if (result.success) {
        setShelters(result.data.items || []);
      }
    };
    fetchShelters();
  }, []);

  // Load donations
  useEffect(() => {
    fetchDonations();
  }, [filters.page, filters.pageSize, filters.shelterId, filters.fromDate, filters.toDate]);

  const fetchDonations = async () => {
    setLoading(true);
    const result = await getAdminDonations(filters);
    if (result.success) {
      setData(result.data.items || []);
      setTotal(result.data.totalCount || 0);
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
    fetchDonations();
  };

  const handleReset = () => {
    setFilters({
      keyword: '',
      fromDate: null,
      toDate: null,
      shelterId: null,
      page: 1,
      pageSize: 10
    });
  };

  const handleDateRangeChange = (dates) => {
    if (dates) {
      setFilters(prev => ({
        ...prev,
        fromDate: dates[0].toISOString(),
        toDate: dates[1].toISOString(),
        page: 1
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        fromDate: null,
        toDate: null,
        page: 1
      }));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusDisplay = (status) => {
    switch (status?.toLowerCase()) {
      case 'success': 
        return { text: 'Thành công', color: 'success' };
      case 'pending': 
        return { text: 'Chờ xử lý', color: 'warning' };
      case 'failed': 
        return { text: 'Thất bại', color: 'error' };
      default: 
        return { text: status, color: 'default' };
    }
  };

  const columns = [
    {
      title: 'Mã GD',
      dataIndex: 'transactionID',
      key: 'transactionID',
      width: 100,
      render: (id) => <Text strong>#{id}</Text>
    },
    {
      title: 'Người quyên góp',
      key: 'donor',
      width: 200,
      render: (_, record) => (
        <Space>
          <div style={{ background: '#f0f2f5', padding: '8px', borderRadius: '50%' }}>
            <User size={16} color="var(--primary)" />
          </div>
          <div>
            <Text strong style={{ display: 'block' }}>{record.donorName || 'Người dùng ẩn danh'}</Text>
            <Text type="secondary" style={{ fontSize: '0.8rem' }}>{record.paymentMethod}</Text>
          </div>
        </Space>
      )
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => (
        <Text strong style={{ color: '#52c41a', fontSize: '1.05rem' }}>
          {formatCurrency(amount)}
        </Text>
      )
    },
    {
      title: 'Trạm thụ hưởng',
      dataIndex: 'targetShelterName',
      key: 'targetShelterName',
      render: (text) => (
        <Space size={4}>
          <CreditCard size={14} style={{ color: 'var(--gray)' }} />
          <Text>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Ngày giao dịch',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      render: (date) => (
        <Space direction="vertical" size={0}>
          <Text>{dayjs(date).format('DD/MM/YYYY')}</Text>
          <Text type="secondary" style={{ fontSize: '0.8rem' }}>{dayjs(date).format('HH:mm')}</Text>
        </Space>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const display = getStatusDisplay(status);
        return <Tag color={display.color}>{display.text.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Lời nhắn',
      dataIndex: 'message',
      key: 'message',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (message) => (
        <Tooltip placement="topLeft" title={message}>
          {message || <Text type="secondary" italic>Không có lời nhắn</Text>}
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="admin-donations-page">
      <div className="admin-page-header" style={{ marginBottom: '2rem' }}>
        <div className="admin-page-title-wrapper">
          <Title level={2} style={{ margin: 0 }}>Lịch Sử Quyên Góp</Title>
          <Text type="secondary">Theo dõi và quản lý toàn bộ các giao dịch quyên góp trên hệ thống.</Text>
        </div>
        <Button icon={<Download size={18} />} type="primary" ghost>Xuất báo cáo (CSV)</Button>
      </div>

      <Card bordered={false} style={{ marginBottom: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>Tìm kiếm</Text>
            <Input 
              prefix={<Search size={16} style={{ color: 'var(--gray)' }} />}
              placeholder="Tên người dùng, tin nhắn..."
              value={filters.keyword}
              onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
              onPressEnter={handleSearch}
              allowClear
            />
          </div>
          
          <div style={{ width: '280px' }}>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>Khoảng thời gian</Text>
            <RangePicker 
              style={{ width: '100%' }}
              onChange={handleDateRangeChange}
              value={filters.fromDate ? [dayjs(filters.fromDate), dayjs(filters.toDate)] : null}
            />
          </div>

          <div style={{ width: '200px' }}>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>Trạm cứu hộ</Text>
            <Select
              showSearch
              style={{ width: '100%' }}
              placeholder="Tất cả trạm"
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
          rowKey="transactionID"
          pagination={{
            current: filters.page,
            pageSize: filters.pageSize,
            total: total,
            showSizeChanger: true,
            onChange: (page, pageSize) => {
              setFilters(prev => ({ ...prev, page, pageSize }));
            },
            showTotal: (total) => `Tổng cộng ${total} giao dịch`
          }}
        />
      </Card>

      <style>{`
        .admin-donations-page .ant-table-thead > tr > th {
          background: #fafafa;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
};

export default AdminDonationHistory;

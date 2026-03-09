import React, { useState } from 'react';
import { Card, Tabs, Table, Tag, Button, Space, Row, Col, Progress, Statistic } from 'antd';
import { Package, ShoppingBag, Plus, AlertCircle, TrendingUp, DollarSign } from 'lucide-react';

const { TabPane } = Tabs;

const InventoryManager = () => {
  const supplies = [
    { 
      id: 1, 
      name: 'Thức Ăn Chó (Khô)', 
      quantity: 450, 
      unit: 'kg',
      status: 'Good', 
      minReq: 100,
      percentage: 90
    },
    { 
      id: 2, 
      name: 'Thức Ăn Mèo (Ướt)', 
      quantity: 12, 
      unit: 'hộp',
      status: 'Critical', 
      minReq: 50,
      percentage: 24
    },
    { 
      id: 3, 
      name: 'Vaccine', 
      quantity: 50, 
      unit: 'liều',
      status: 'Low', 
      minReq: 60,
      percentage: 45
    },
    { 
      id: 4, 
      name: 'Xô Vệ Sinh Mèo', 
      quantity: 180, 
      unit: 'kg',
      status: 'Good', 
      minReq: 50,
      percentage: 85
    },
  ];

  const shopItems = [
    { 
      id: 1, 
      name: 'Áo Rescue', 
      price: 250000, 
      stock: 50, 
      category: 'Quần Áo',
      sales: 120
    },
    { 
      id: 2, 
      name: 'Cốc In Hình Chân', 
      price: 120000, 
      stock: 30, 
      category: 'Phụ Kiện',
      sales: 85
    },
    { 
      id: 3, 
      name: 'Túi Vải Canvas', 
      price: 180000, 
      stock: 25, 
      category: 'Phụ Kiện',
      sales: 45
    },
  ];

  const getStatusTag = (status) => {
    const statusConfig = {
      Good: { color: 'success', text: 'Đủ' },
      Low: { color: 'warning', text: 'Thấp' },
      Critical: { color: 'error', text: 'Rất Thấp' }
    };
    const config = statusConfig[status] || statusConfig.Good;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const suppliesColumns = [
    {
      title: 'Tên Vật Phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>
    },
    {
      title: 'Số Lượng',
      key: 'quantity',
      render: (_, record) => `${record.quantity} ${record.unit}`
    },
    {
      title: 'Mức Tối Thiểu',
      key: 'minReq',
      render: (_, record) => (
        <span style={{ color: '#8c8c8c' }}>{record.minReq} {record.unit}</span>
      )
    },
    {
      title: 'Tình Trạng',
      key: 'status',
      render: (_, record) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          {getStatusTag(record.status)}
          <Progress 
            percent={record.percentage} 
            size="small"
            strokeColor={
              record.status === 'Good' ? '#52C41A' : 
              record.status === 'Low' ? '#FAAD14' : '#F5222D'
            }
            showInfo={false}
          />
        </Space>
      )
    },
    {
      title: 'Hành Động',
      key: 'action',
      render: () => (
        <Space>
          <Button type="link" size="small">Sửa</Button>
          <Button type="link" danger size="small">Xóa</Button>
        </Space>
      )
    }
  ];

  const shopColumns = [
    {
      title: 'Tên Sản Phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>
    },
    {
      title: 'Danh Mục',
      dataIndex: 'category',
      key: 'category',
      render: (category) => <Tag color="blue">{category}</Tag>
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => (
        <span style={{ color: '#FF6B6B', fontWeight: 500 }}>
          {price.toLocaleString('vi-VN')}₫
        </span>
      )
    },
    {
      title: 'Tồn Kho',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => (
        <span style={{ color: stock < 20 ? '#F5222D' : '#52C41A' }}>
          {stock} còn lại
        </span>
      )
    },
    {
      title: 'Đã Bán',
      dataIndex: 'sales',
      key: 'sales'
    },
    {
      title: 'Hành Động',
      key: 'action',
      render: () => (
        <Space>
          <Button type="link" size="small">Sửa</Button>
          <Button type="link" danger size="small">Xóa</Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      {/* Header with Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
            Kho & Cửa Hàng
          </h1>
        </Col>
        
        <Col xs={24} sm={8}>
          <Card 
            hoverable
            style={{ borderLeft: '4px solid #FF6B6B' }}
          >
            <Statistic
              title="Tổng Vật Phẩm"
              value={supplies.length}
              prefix={<Package size={24} style={{ color: '#FF6B6B' }} />}
              valueStyle={{ color: '#FF6B6B' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={8}>
          <Card 
            hoverable
            style={{ borderLeft: '4px solid #52C41A' }}
          >
            <Statistic
              title="Sản Phẩm Shop"
              value={shopItems.length}
              prefix={<ShoppingBag size={24} style={{ color: '#52C41A' }} />}
              valueStyle={{ color: '#52C41A' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={8}>
          <Card 
            hoverable
            style={{ borderLeft: '4px solid #1890FF' }}
          >
            <Statistic
              title="Doanh Thu Tháng"
              value={15250000}
              prefix={<DollarSign size={24} style={{ color: '#1890FF' }} />}
              suffix="₫"
              valueStyle={{ color: '#1890FF', fontSize: '1.5rem' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs for Supplies and Shop */}
      <Card style={{ borderRadius: 8 }}>
        <Tabs
          defaultActiveKey="supplies"
          size="large"
          tabBarExtraContent={
            <Button type="primary" icon={<Plus size={16} />}>
              Thêm Mới
            </Button>
          }
        >
          <TabPane 
            tab={
              <span>
                <Package size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Vật Phẩm Nội Bộ
              </span>
            } 
            key="supplies"
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {/* Critical Items Alert */}
              {supplies.some(item => item.status === 'Critical') && (
                <Card 
                  size="small"
                  style={{ 
                    background: '#FFF1F0', 
                    border: '1px solid #FFCCC7' 
                  }}
                >
                  <Space>
                    <AlertCircle size={20} color="#F5222D" />
                    <span style={{ fontWeight: 500 }}>
                      Cảnh báo: {supplies.filter(s => s.status === 'Critical').length} vật phẩm ở mức rất thấp!
                    </span>
                  </Space>
                </Card>
              )}

              <Table 
                columns={suppliesColumns} 
                dataSource={supplies}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </Space>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <ShoppingBag size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Sản Phẩm Gây Quỹ
              </span>
            } 
            key="shop"
          >
            <Table 
              columns={shopColumns} 
              dataSource={shopItems}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default InventoryManager;

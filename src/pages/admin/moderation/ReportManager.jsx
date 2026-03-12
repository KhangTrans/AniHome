import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Tag, 
  Space, 
  Card, 
  Typography, 
  Modal, 
  Select, 
  InputNumber,
  Form,
  Empty,
  Tooltip,
  Breadcrumb
} from 'antd';
import { 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  UserX, 
  ShieldAlert,
  Search,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { getReports, handleReport } from '../../../services/admin/adminModerationService';
import { useToast } from '../../../context/ToastContext';

const { Title, Text } = Typography;
const { Option } = Select;

const ReportManager = () => {
  const toast = useToast();
  const [form] = Form.useForm();
  
  // State
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    const result = await getReports({ status: 'pending' });
    if (result.success) {
      // Backend might return array directly or wrapped in items
      setReports(Array.isArray(result.data) ? result.data : (result.data.items || []));
    } else {
      toast.error('Không thể tải danh sách báo cáo: ' + result.error);
    }
    setLoading(false);
  };

  const showHandleModal = (report) => {
    setSelectedReport(report);
    setIsModalVisible(true);
    form.setFieldsValue({
      action: 'Resolved',
      offendingUserID: report.offendingUserID || 0
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedReport(null);
    form.resetFields();
  };

  const onFinish = async (values) => {
    setSubmitting(true);
    const result = await handleReport(selectedReport.reportID, values);
    if (result.success) {
      toast.success(result.message || 'Xử lý báo cáo thành công!');
      handleCancel();
      fetchReports();
    } else {
      toast.error(result.error);
    }
    setSubmitting(false);
  };

  const getTargetTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'post': return 'blue';
      case 'user': return 'orange';
      case 'shelter': return 'purple';
      case 'comment': return 'cyan';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'reportID',
      key: 'reportID',
      width: 80,
      render: (id) => <Text strong>#{id}</Text>
    },
    {
      title: 'Lý do báo cáo',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason) => (
        <Space>
          <AlertTriangle size={16} color="#ef4444" />
          <Text>{reason}</Text>
        </Space>
      )
    },
    {
      title: 'Đối tượng',
      key: 'target',
      render: (_, record) => (
        <Space>
          <Tag color={getTargetTypeColor(record.targetType)}>
            {record.targetType?.toUpperCase()}
          </Tag>
          <Text type="secondary">ID: {record.targetID}</Text>
        </Space>
      )
    },
    {
      title: 'Người báo cáo',
      dataIndex: 'reporterName',
      key: 'reporterName',
      render: (name) => <Text>{name || 'Người dùng ẩn danh'}</Text>
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Button 
          type="primary" 
          danger 
          ghost
          icon={<ShieldAlert size={16} style={{ marginRight: '4px' }} />}
          onClick={() => showHandleModal(record)}
        >
          Xử lý
        </Button>
      )
    }
  ];

  return (
    <div className="report-manager-page">
      <div className="admin-page-header" style={{ marginBottom: '2rem' }}>
        <div className="admin-page-title-wrapper">
          <Title level={2} style={{ margin: 0 }}>Quản Lý Báo Cáo Vi Phạm</Title>
          <Text type="secondary">Xem và xử lý các báo cáo từ người dùng về nội dung hoặc tài khoản vi phạm.</Text>
        </div>
        <Button 
          icon={<RefreshCw size={18} />} 
          onClick={fetchReports} 
          loading={loading}
        >
          Làm mới
        </Button>
      </div>

      <Card bordered={false} style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <Table 
          columns={columns} 
          dataSource={reports} 
          loading={loading}
          rowKey="reportID"
          pagination={{
            showTotal: (total) => `Tổng cộng ${total} báo cáo`
          }}
          locale={{
            emptyText: <Empty description="Hiện không có báo cáo nào chờ xử lý" />
          }}
        />
      </Card>

      {/* Handle Report Modal */}
      <Modal
        title={
          <Space>
            <ShieldAlert size={20} color="#ef4444" />
            <span>Xử lý báo cáo #{selectedReport?.reportID}</span>
          </Space>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <Text strong>Lý do: </Text>
          <Text type="danger">{selectedReport?.reason}</Text>
          <br />
          <Text strong>Đối tượng: </Text>
          <Tag color={getTargetTypeColor(selectedReport?.targetType)}>
            {selectedReport?.targetType?.toUpperCase()} (ID: {selectedReport?.targetID})
          </Tag>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ action: 'Resolved', offendingUserID: 0 }}
        >
          <Form.Item
            name="action"
            label="Chọn hành động"
            rules={[{ required: true, message: 'Vui lòng chọn hành động' }]}
          >
            <Select style={{ width: '100%' }}>
              <Option value="Resolved">Resolved (Đã giải quyết)</Option>
              <Option value="Dismissed">Dismissed (Bác bỏ báo cáo)</Option>
              <Option value="Banned">Banned (Khóa đối tượng vi phạm)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="offendingUserID"
            label="ID người vi phạm (tùy chọn)"
            extra="Nhập ID nếu bạn muốn xử lý trực tiếp tài khoản vi phạm"
          >
            <InputNumber style={{ width: '100%' }} placeholder="Ví dụ: 105" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCancel}>Hủy bỏ</Button>
              <Button type="primary" danger htmlType="submit" loading={submitting}>
                Xác nhận xử lý
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .report-manager-page .ant-table-thead > tr > th {
          background: #fafafa;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
};

export default ReportManager;

import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Spin,
  Typography,
  Divider,
  Avatar,
  Upload,
  Space,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  PhoneOutlined,
  MailOutlined,
  PictureOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { getAdminProfile, updateAdminProfile } from "../../../services/admin";
import { uploadImage } from "../../../services/public/uploadService";

const { Title, Text } = Typography;

const AdminProfilePage = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileForm] = Form.useForm();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const result = await getAdminProfile();
    if (result.success) {
      setProfileData(result.data);
      profileForm.setFieldsValue({
        fullName: result.data.fullName,
        phone: result.data.phone,
        email: result.data.email,
        avatarUrl: result.data.avatarUrl,
      });
    } else {
      toast.error("Không thể tải thông tin admin: " + result.error);
    }
    setLoading(false);
  };

  const handleUpdateProfile = async (values) => {
    setSubmitting(true);

    const avatarUrl =
      profileForm.getFieldValue("avatarUrl") || profileData?.avatarUrl || null;

    const result = await updateAdminProfile({
      userId: profileData?.userId || user?.userId,
      email: values.email,
      fullName: values.fullName,
      phone: values.phone || null,
      avatarUrl: avatarUrl,
    });
    setSubmitting(false);

    if (result.success) {
      toast.success(result.message || "Cập nhật thành công!");
      const newData = {
        ...profileData,
        fullName: values.fullName,
        email: values.email,
        phone: values.phone || profileData?.phone,
        avatarUrl: avatarUrl,
      };
      setProfileData(newData);
      profileForm.setFieldsValue(newData);
      
      // Đồng bộ thông tin user trên toàn ứng dụng
      updateUser({
        fullName: values.fullName,
        avatarUrl: avatarUrl
      });
    } else {
      toast.error(result.error || "Cập nhật thất bại");
    }
  };

  const handleAvatarUpload = async (options) => {
    const { file, onSuccess, onError } = options;
    setLoadingAvatar(true);
    const result = await uploadImage(file);
    setLoadingAvatar(false);

    if (result.success) {
      const imageUrl = result.data.imageUrl;
      profileForm.setFieldsValue({ avatarUrl: imageUrl });
      setProfileData({ ...profileData, avatarUrl: imageUrl });
      onSuccess("Ok");
      toast.success("Tải ảnh lên thành công!");
    } else {
      onError(result.error);
      toast.error(result.error || "Tải ảnh thất bại. Vui lòng thử lại.");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}>
        <Spin size="large" tip="Đang tải thông tin..." />
      </div>
    );
  }

  return (
    <div className="admin-profile-container">
      <div className="admin-page-header">
        <div className="admin-page-title-wrapper">
          <h1 className="admin-page-title">Hồ Sơ Admin</h1>
          <p className="admin-page-subtitle">Quản lý thông tin cá nhân và cài đặt tài khoản quản trị</p>
        </div>
      </div>

      <div style={{ 
        height: '160px', 
        background: 'linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%)', 
        borderRadius: '16px 16px 0 0',
        marginBottom: '-80px'
      }}></div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card
            variant="borderless"
            style={{
              textAlign: "center",
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              borderRadius: "16px",
              paddingTop: '20px'
            }}
          >
            <div style={{ marginBottom: "1.5rem", position: "relative", display: "inline-block" }}>
              <Avatar
                size={160}
                src={profileData?.avatarUrl}
                icon={!profileData?.avatarUrl && <UserOutlined />}
                style={{ 
                  border: "6px solid #fff", 
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  backgroundColor: '#f3f4f6'
                }}
              />
              {loadingAvatar && (
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(255,255,255,0.7)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Spin size="large" />
                </div>
              )}
            </div>
            <Title level={3} style={{ marginBottom: "0.25rem" }}>
              {profileData?.fullName || "Admin"}
            </Title>
            <Text type="secondary" style={{ display: "block", marginBottom: "1.5rem", fontSize: '1rem' }}>
              Quản Trị Viên Hệ Thống
            </Text>
            
            <Divider style={{ margin: '1rem 0' }} />
            
            <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ 
                  width: '36px', height: '36px', borderRadius: '8px', 
                  background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <MailOutlined />
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: '0.8rem', display: 'block' }}>Email</Text>
                  <Text strong>{profileData?.email}</Text>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ 
                  width: '36px', height: '36px', borderRadius: '8px', 
                  background: 'rgba(16, 185, 129, 0.1)', color: '#10b981',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <PhoneOutlined />
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: '0.8rem', display: 'block' }}>Số điện thoại</Text>
                  <Text strong>{profileData?.phone || 'Chưa cập nhật'}</Text>
                </div>
              </div>
            </div>

            <Upload
              accept=".jpg,.jpeg,.png,.gif,.webp"
              showUploadList={false}
              customRequest={handleAvatarUpload}
            >
              <Button 
                type="primary" 
                ghost 
                icon={<UploadOutlined />} 
                loading={loadingAvatar} 
                block
                style={{ borderRadius: '8px', height: '40px' }}
              >
                Cập nhật ảnh
              </Button>
            </Upload>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card
            variant="borderless"
            title={<><EditOutlined style={{ marginRight: '8px', color: 'var(--primary)' }} /> Thông Tin Cơ Bản</>}
            style={{
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              borderRadius: "16px",
            }}
          >
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={handleUpdateProfile}
              initialValues={profileData}
            >
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label="Họ và Tên"
                    name="fullName"
                    rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên" size="large" />
                  </Form.Item>
                </Col>
                
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Địa chỉ Email"
                    name="email"
                    rules={[
                      { required: true, message: "Vui lòng nhập email!" },
                      { type: "email", message: "Email không hợp lệ!" }
                    ]}
                  >
                    <Input prefix={<MailOutlined />} placeholder="admin@example.com" size="large" />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label="Số điện thoại"
                    name="phone"
                    rules={[
                      { required: true, message: "Vui lòng nhập số điện thoại!" },
                      { pattern: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ!" }
                    ]}
                  >
                    <Input prefix={<PhoneOutlined />} placeholder="0123456789" size="large" />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item label="Đường dẫn ảnh đại diện (URL)" name="avatarUrl">
                    <Input prefix={<PictureOutlined />} placeholder="https://cloudinary.com/..." size="large" />
                  </Form.Item>
                </Col>
              </Row>

              <div style={{ 
                marginTop: '1rem',
                padding: '1.5rem', 
                background: '#f9fafb', 
                borderRadius: '12px',
                border: '1px solid #f3f4f6'
              }}>
                 <Text type="secondary" italic>
                   * Lưu ý: Thay đổi thông tin cá nhân sẽ được cập nhật ngay lập tức trên hệ thống. 
                   Hãy đảm bảo các thông tin liên lạc là chính xác để thuận tiện cho việc quản lý.
                 </Text>
              </div>

              <Divider />

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  icon={<EditOutlined />}
                  size="large"
                  style={{ 
                    minWidth: "180px", 
                    height: '45px', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)'
                  }}
                >
                  Lưu Thay Đổi
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminProfilePage;

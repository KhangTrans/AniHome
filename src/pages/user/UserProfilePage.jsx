import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Tabs,
  Spin,
  Typography,
  Divider,
  Avatar,
  Upload,
  Space,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  LockOutlined,
  PhoneOutlined,
  MailOutlined,
  PictureOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  getUserProfile,
  updateProfile,
  changePassword,
} from "../../services/user/userService";
import { uploadImage } from "../../services/public/uploadService";
import Navbar from "../../components/Navbar";
import { PawPrint } from "lucide-react";

const { Title, Text } = Typography;

const UserProfilePage = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const currentUserId = user?.userId; // Sửa lại lấy đúng `userId` từ token đã lưu

  useEffect(() => {
    fetchProfile();
  }, [currentUserId]);

  const fetchProfile = async () => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const result = await getUserProfile(currentUserId);
    if (result.success) {
      setProfileData(result.data);
      profileForm.setFieldsValue({
        fullName: result.data.fullName,
        phone: result.data.phone,
        email: result.data.email,
        avatarUrl: result.data.avatarUrl,
      });
    } else {
      toast.error("Không thể tải thông tin người dùng: " + result.error);
    }
    setLoading(false);
  };

  const handleUpdateProfile = async (values) => {
    setSubmitting(true);

    // Lấy avatarUrl từ form values, fallback về profileData state
    // (đảm bảo URL được upload qua setFieldsValue luôn được gửi lên)
    const avatarUrl =
      profileForm.getFieldValue("avatarUrl") || profileData?.avatarUrl || null;

    const result = await updateProfile({
      userId: currentUserId,
      email: profileData?.email,
      fullName: values.fullName,
      phone: values.phone || null,
      avatarUrl: avatarUrl,
    });
    setSubmitting(false);

    if (result.success) {
      toast.success(result.message || "Cập nhật thành công!");
      // Cập nhật cả state VÀ form instance để không bị mất khi switch tab
      const newData = {
        fullName: values.fullName,
        phone: values.phone || profileData?.phone,
        avatarUrl: avatarUrl,
      };
      setProfileData((prev) => ({ ...prev, ...newData }));
      profileForm.setFieldsValue(newData);
    } else {
      toast.error(result.error || "Cập nhật thất bại");
    }
  };

  const handleChangePassword = async (values) => {
    setSubmitting(true);
    const result = await changePassword({
      userId: currentUserId,
      oldPassword: values.oldPassword,
      newPassword: values.newPassword,
      confirmNewPassword: values.confirmNewPassword,
    });
    setSubmitting(false);

    if (result.success) {
      toast.success(result.message || "Đổi mật khẩu thành công!");
      passwordForm.resetFields();
    } else {
      toast.error(result.error || "Đổi mật khẩu thất bại");
    }
  };

  const handleAvatarUpload = async (options) => {
    const { file, onSuccess, onError } = options;
    setLoadingAvatar(true);
    const result = await uploadImage(file);
    setLoadingAvatar(false);

    if (result.success) {
      const imageUrl = result.data.imageUrl;
      // Update form data and avatar immediately preview
      profileForm.setFieldsValue({ avatarUrl: imageUrl });
      setProfileData({ ...profileData, avatarUrl: imageUrl });
      onSuccess("Ok");
      toast.success(result.data.message || "Tải ảnh lên thành công!");
    } else {
      onError(result.error);
      toast.error(result.error || "Tải ảnh thất bại. Vui lòng thử lại.");
    }
  };

  const ProfileTab = (
    <div style={{ marginTop: "1rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "2rem",
          gap: "1.5rem",
        }}
      >
        <Avatar
          size={100}
          src={profileData?.avatarUrl}
          icon={!profileData?.avatarUrl && <UserOutlined />}
          style={{ border: "2px solid #f0f0f0" }}
        />
        <div>
          <Title level={4} style={{ margin: 0 }}>
            {profileData?.fullName || "Người dùng"}
          </Title>
          <Text type="secondary">{profileData?.email}</Text>
        </div>
      </div>

      <Form form={profileForm} layout="vertical" onFinish={handleUpdateProfile}>
        <Form.Item label="Email (Không thể thay đổi)" name="email">
          <Input prefix={<MailOutlined />} disabled />
        </Form.Item>

        <Form.Item
          label="Họ và Tên"
          name="fullName"
          rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên" />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phone"
          rules={[
            {
              pattern: /^[0-9]{10,11}$/,
              message: "Số điện thoại không hợp lệ (10-11 số)",
            },
          ]}
        >
          <Input prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại" />
        </Form.Item>

        <Form.Item label="Đường dẫn ảnh đại diện (URL)">
          <Space.Compact style={{ width: "100%" }}>
            <Form.Item name="avatarUrl" noStyle>
              <Input prefix={<PictureOutlined />} placeholder="https://..." />
            </Form.Item>
            <Upload
              accept=".jpg,.jpeg,.png,.gif,.webp"
              showUploadList={false}
              customRequest={handleAvatarUpload}
            >
              <Button
                icon={
                  loadingAvatar ? <Spin size="small" /> : <UploadOutlined />
                }
              >
                {loadingAvatar ? "Đang tải..." : "Tải ảnh lên"}
              </Button>
            </Upload>
          </Space.Compact>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            icon={<EditOutlined />}
          >
            Lưu thay đổi
          </Button>
        </Form.Item>
      </Form>
    </div>
  );

  const PasswordTab = (
    <div style={{ marginTop: "1rem" }}>
      <Form
        form={passwordForm}
        layout="vertical"
        onFinish={handleChangePassword}
      >
        <Form.Item
          label="Mật khẩu hiện tại"
          name="oldPassword"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu hiện tại!" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Nhập mật khẩu hiện tại"
          />
        </Form.Item>

        <Form.Item
          label="Mật khẩu mới"
          name="newPassword"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới!" },
            { min: 6, message: "Mật khẩu phải từ 6 ký tự trở lên!" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Nhập mật khẩu mới"
          />
        </Form.Item>

        <Form.Item
          label="Xác nhận mật khẩu mới"
          name="confirmNewPassword"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu mới!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Mật khẩu xác nhận không khớp!"),
                );
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Nhập lại mật khẩu mới"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            icon={<LockOutlined />}
          >
            Đổi mật khẩu
          </Button>
        </Form.Item>
      </Form>
    </div>
  );

  return (
    <div
      style={{
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />

      <div
        style={{
          maxWidth: "800px",
          width: "100%",
          margin: "2rem auto",
          padding: "0 1rem",
          flex: 1,
        }}
      >
        <Card
          variant="borderless"
          style={{
            boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
            borderRadius: "16px",
          }}
        >
          <Title level={3} style={{ marginBottom: "0.5rem" }}>
            Hồ Sơ Cá Nhân
          </Title>
          <Text type="secondary">
            Quản lý thông tin tài khoản và bảo mật của bạn
          </Text>
          <Divider />

          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "3rem 0",
              }}
            >
              <Spin size="large" />
            </div>
          ) : (
            <Tabs
              defaultActiveKey="1"
              items={[
                {
                  key: "1",
                  label: "Hồ Sơ Của Tôi",
                  children: ProfileTab,
                },
                {
                  key: "2",
                  label: "Bảo Mật",
                  children: PasswordTab,
                },
              ]}
            />
          )}
        </Card>
      </div>

      {/* Footer */}
      <footer
        style={{
          background: "#fff",
          color: "var(--dark)",
          padding: "4rem 2rem",
          marginTop: "auto",
          borderTop: "1px solid #eee",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "3rem",
          }}
        >
          <div>
            <h4
              style={{
                fontSize: "1.2rem",
                marginBottom: "1rem",
                color: "var(--primary)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <PawPrint size={20} /> PetRescue
            </h4>
            <p style={{ color: "var(--gray)", fontSize: "0.9rem" }}>
              Làm cho thế giới tốt đẹp hơn, từng bé một.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Liên Kết</h4>
            <ul
              style={{
                listStyle: "none",
                color: "var(--gray)",
                fontSize: "0.9rem",
                lineHeight: "2",
              }}
            >
              <li>
                <a href="#">Về Chúng Tôi</a>
              </li>
              <li>
                <a href="#">Tình Nguyện</a>
              </li>
              <li>
                <a href="#">Quyên Góp</a>
              </li>
              <li>
                <a href="#">Điều Khoản</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Liên Hệ</h4>
            <p
              style={{
                color: "var(--gray)",
                fontSize: "0.9rem",
                marginBottom: "0.5rem",
              }}
            >
              123 Đường Cứu Hộ, TP.HCM
            </p>
            <p style={{ color: "var(--gray)", fontSize: "0.9rem" }}>
              hello@petrescue.com
            </p>
          </div>
        </div>
        <div
          style={{
            textAlign: "center",
            marginTop: "3rem",
            paddingTop: "2rem",
            borderTop: "1px solid #eee",
            color: "var(--gray)",
            fontSize: "0.8rem",
          }}
        >
          &copy; 2026 Animal Rescue Platform. Built for EXE101 Demo.
        </div>
      </footer>
    </div>
  );
};

export default UserProfilePage;

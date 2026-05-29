import React, { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { User, Mail, Phone, Lock, Save, MapPin, Camera, Eye, EyeOff } from "lucide-react";
import { updateProfile, changePassword } from "../../services/user/userService";
import { uploadImage } from "../../services/public/uploadService";

const PartnerProfile = () => {
  const { user, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });

  const fileInputRef = useRef(null);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      return;
    }
    
    toast.loading("Đang tải ảnh lên...", { id: "uploadAvatar" });
    try {
      const uploadRes = await uploadImage(file);
      
      if (uploadRes.success && uploadRes.data.imageUrl) {
        const imageUrl = uploadRes.data.imageUrl;
        
        const response = await updateProfile({
          userId: user.userId || user.id,
          email: formData.email || user.usernameOrEmail,
          fullName: formData.fullName,
          phone: formData.phone,
          avatarUrl: imageUrl,
        });

        if (response.success) {
          updateUser({ avatar: imageUrl, avatarURL: imageUrl });
          toast.success("Cập nhật ảnh đại diện thành công!", { id: "uploadAvatar" });
        } else {
          toast.error(response.error || "Lỗi khi lưu ảnh đại diện", { id: "uploadAvatar" });
        }
      } else {
        toast.error(uploadRes.error || "Tải ảnh lên thất bại", { id: "uploadAvatar" });
      }
    } catch (error) {
      toast.error("Lỗi kết nối khi tải ảnh", { id: "uploadAvatar" });
    }
  };

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await updateProfile({
        userId: user.userId || user.id,
        email: formData.email || user.usernameOrEmail,
        fullName: formData.fullName,
        phone: formData.phone,
        avatarUrl: user.avatarURL || user.avatarUrl,
      });

      if (response.success) {
        updateUser({
          email: formData.email,
          fullName: formData.fullName,
          phone: formData.phone,
          address: formData.address,
        });
        toast.success("Cập nhật thông tin thành công!");
      } else {
        toast.error(response.error || "Có lỗi xảy ra khi cập nhật!");
      }
    } catch (error) {
      toast.error("Lỗi khi kết nối đến server!");
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }
    
    try {
      const response = await changePassword({
        userId: user.userId || user.id,
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmNewPassword: passwordData.confirmPassword,
      });

      if (response.success) {
        toast.success("Đổi mật khẩu thành công!");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(response.error || "Có lỗi xảy ra khi đổi mật khẩu!");
      }
    } catch (error) {
      toast.error("Lỗi kết nối khi đổi mật khẩu!");
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: "800", color: "#1e293b", margin: 0 }}>
          Hồ Sơ Cá Nhân
        </h2>
        <p style={{ color: "#64748b", marginTop: "0.25rem" }}>
          Quản lý thông tin tài khoản và bảo mật của bạn
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "2rem" }}>
        {/* Profile Form */}
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "2rem",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
          border: "1px solid #f1f5f9"
        }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "1.5rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "1rem" }}>
            Thông tin chung
          </h3>

          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem" }}>
            <div style={{ position: "relative" }}>
              <div style={{ 
                width: "100px", height: "100px", borderRadius: "50%", 
                backgroundColor: "#e2e8f0", display: "flex", alignItems: "center", 
                justifyContent: "center", overflow: "hidden" 
              }}>
                {(user?.avatarURL || user?.avatarUrl || user?.avatar) ? (
                  <img src={user?.avatarURL || user?.avatarUrl || user?.avatar} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <User size={40} color="#94a3b8" />
                )}
              </div>
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                style={{ display: "none" }} 
              />
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  position: "absolute", bottom: 0, right: 0, 
                  backgroundColor: "var(--primary, #FF6B6B)", color: "white", 
                  border: "none", borderRadius: "50%", width: "32px", height: "32px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}
                title="Thay đổi ảnh đại diện"
              >
                <Camera size={16} />
              </button>
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "#1e293b" }}>Ảnh đại diện</h4>
              <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                Định dạng JPG, PNG. Kích thước tối đa 5MB.
              </p>
            </div>
          </div>

          <form onSubmit={saveProfile} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.9rem", fontWeight: "600", color: "#334155" }}>Tên đăng nhập</label>
              <div style={{ position: "relative" }}>
                <User size={18} color="#94a3b8" style={{ position: "absolute", top: "12px", left: "12px" }} />
                <input
                  type="text"
                  value={user?.username || user?.usernameOrEmail || ""}
                  disabled
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem 0.75rem 2.5rem",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    backgroundColor: "#f8fafc",
                    color: "#94a3b8",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.9rem", fontWeight: "600", color: "#334155" }}>Email</label>
              <div style={{ position: "relative" }}>
                <Mail size={18} color="#94a3b8" style={{ position: "absolute", top: "12px", left: "12px" }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem 0.75rem 2.5rem",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    outline: "none",
                    backgroundColor: "#f8fafc",
                    color: "#94a3b8",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.9rem", fontWeight: "600", color: "#334155" }}>Họ và tên / Tên thương hiệu</label>
              <div style={{ position: "relative" }}>
                <User size={18} color="#94a3b8" style={{ position: "absolute", top: "12px", left: "12px" }} />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleProfileChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem 0.75rem 2.5rem",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    outline: "none",
                  }}
                  required
                />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.9rem", fontWeight: "600", color: "#334155" }}>Số điện thoại</label>
              <div style={{ position: "relative" }}>
                <Phone size={18} color="#94a3b8" style={{ position: "absolute", top: "12px", left: "12px" }} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleProfileChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem 0.75rem 2.5rem",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    outline: "none",
                  }}
                />
              </div>
            </div>



            <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
              <Save size={18} /> Lưu thay đổi
            </button>
          </form>
        </div>

        {/* Password Form */}
        <div style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          padding: "2rem",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
          border: "1px solid #f1f5f9"
        }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "1.5rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "1rem" }}>
            Đổi mật khẩu
          </h3>
          <form onSubmit={updatePassword} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.9rem", fontWeight: "600", color: "#334155" }}>Mật khẩu hiện tại</label>
              <div style={{ position: "relative" }}>
                <Lock size={18} color="#94a3b8" style={{ position: "absolute", top: "12px", left: "12px" }} />
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem 2.5rem 0.75rem 2.5rem",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    outline: "none",
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={{
                    position: "absolute", top: "12px", right: "12px",
                    background: "none", border: "none", cursor: "pointer", padding: 0
                  }}
                  title={showCurrentPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showCurrentPassword ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.9rem", fontWeight: "600", color: "#334155" }}>Mật khẩu mới</label>
              <div style={{ position: "relative" }}>
                <Lock size={18} color="#94a3b8" style={{ position: "absolute", top: "12px", left: "12px" }} />
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem 2.5rem 0.75rem 2.5rem",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    outline: "none",
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: "absolute", top: "12px", right: "12px",
                    background: "none", border: "none", cursor: "pointer", padding: 0
                  }}
                  title={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showNewPassword ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label style={{ fontSize: "0.9rem", fontWeight: "600", color: "#334155" }}>Xác nhận mật khẩu mới</label>
              <div style={{ position: "relative" }}>
                <Lock size={18} color="#94a3b8" style={{ position: "absolute", top: "12px", left: "12px" }} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem 2.5rem 0.75rem 2.5rem",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    outline: "none",
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: "absolute", top: "12px", right: "12px",
                    background: "none", border: "none", cursor: "pointer", padding: 0
                  }}
                  title={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showConfirmPassword ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-outline" style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
              <Save size={18} /> Cập nhật mật khẩu
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PartnerProfile;

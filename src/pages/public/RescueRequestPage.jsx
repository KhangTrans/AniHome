import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { uploadImage } from "../../services/public/uploadService";
import { submitRescueRequest } from "../../services/public/surrenderService";
import { PawPrint, MapPin, ImagePlus, X, Loader2 } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "./RescueRequestPage.css";

const REGIONS = [
  { id: 1, name: "Miền Bắc" },
  { id: 2, name: "Miền Trung" },
  { id: 3, name: "Miền Nam" },
];

const RescueRequestPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    petName: "",
    breed: "Chó",
    healthStatus: "",
    reason: "",
    userAddress: "",
    regionID: "",
    latitude: 0,
    longitude: 0,
  });

  // Guard the page on mount
  React.useEffect(() => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thực hiện báo cáo.");
      navigate("/login", { state: { from: "/rescue-request" } });
    }
  }, [user, navigate]);

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle Image Selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (imageFiles.length + files.length > 3) {
      toast.error("Vui lòng tải lên tối đa 3 hình ảnh.");
      return;
    }

    const newFiles = [...imageFiles, ...files].slice(0, 3);
    setImageFiles(newFiles);

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(newPreviews);
  };

  // Remove Image
  const handleRemoveImage = (index) => {
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    setImageFiles(newFiles);

    const newPreviews = [...imagePreviews];
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  // Get Current Location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt không hỗ trợ lấy vị trí.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        toast.success("Đã cập nhật vị trí tọa độ thành công!");
      },
      (error) => {
        toast.error(
          "Không thể lấy vị trí. Vui lòng cấp quyền vị trí cho trang web.",
        );
      },
    );
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (imageFiles.length === 0) {
      toast.error("Vui lòng tải lên ít nhất 1 hình ảnh.");
      return;
    }
    if (
      !formData.petName ||
      !formData.reason ||
      !formData.userAddress ||
      !formData.regionID
    ) {
      toast.error("Vui lòng nhập đầy đủ các thông tin bắt buộc.");
      return;
    }

    setLoading(true);

    try {
      const uploadedUrls = [];
      window.scrollTo(0, 0);
      const loadingToastId = toast.loading(
        "Đang đẩy hình ảnh và xử lý dữ liệu...",
      );

      for (const file of imageFiles) {
        const uploadResult = await uploadImage(file);
        if (uploadResult.success && uploadResult.data?.imageUrl) {
          uploadedUrls.push(uploadResult.data.imageUrl);
        } else {
          toast.dismiss(loadingToastId);
          toast.error(
            "Lỗi khi tải lên hình: " + (uploadResult.error || "Unknown error"),
          );
          setLoading(false);
          return;
        }
      }

      const payload = {
        petName: formData.petName,
        breed: formData.breed,
        healthStatus: formData.healthStatus,
        imageUrls: uploadedUrls,
        imageURL: uploadedUrls.length > 0 ? uploadedUrls[0] : "", // Bổ sung imageURL đơn
        reason: formData.reason,
        userAddress: formData.userAddress,
        regionID: Number(formData.regionID),
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        userId: Number(user?.userId) || null, // Đồng bộ key userId
      };

      await submitRescueRequest(payload);

      toast.dismiss(loadingToastId);
      toast.success(
        "Cảm ơn bạn! Thông tin đã được gửi đến Trạm cứu hộ gần nhất trong khu vực. Chúng tôi sẽ xử lý và liên hệ sớm.",
        { duration: 5000 },
      );

      navigate("/");
    } catch (error) {
      console.error("Rescue request submission error:", error);
      toast.dismiss();
      const errorMsg =
        typeof error === "string"
          ? error
          : error?.message || "Có lỗi xảy ra, vui lòng thử lại.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rescue-request-page-wrapper">
      <Navbar />
      <div className="rescue-request-page">
        <div className="rr-header">
          <div
            className="container"
            style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}
          >
            <div className="rr-header-icon">
              <PawPrint size={40} />
            </div>
            <h1>Báo Cáo Cứu Hộ & Từ Bỏ Thú Cưng</h1>
            <p>
              Thông tin của bạn sẽ được gửi ngay lập tức đến trạm cứu hộ gần
              nhất để kịp thời hỗ trợ các bé.
            </p>
            <div className="rr-header-steps">
              <div className="step">
                <span>1</span>
                <p>Tải ảnh</p>
              </div>
              <div className="step">
                <span>2</span>
                <p>Nhập thông tin</p>
              </div>
              <div className="step">
                <span>3</span>
                <p>Gửi báo cáo</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rr-content-container">
          <div className="rr-form-wrapper">
            <form onSubmit={handleSubmit}>
              {/* PHẦN 1: THÔNG TIN THÚ CƯNG */}
              <div className="rr-section">
                <div className="rr-section-title">
                  <span className="section-icon-number">📸</span>
                  <span className="section-text">Thông Tin Thú Cưng</span>
                </div>

                <div className="form-group">
                  <label className="required-field">
                    Hình Ảnh (Tối đa 3 ảnh)
                  </label>
                  <div
                    className="rr-image-upload-box"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImagePlus
                      size={48}
                      color="var(--primary)"
                      style={{ marginBottom: "10px" }}
                    />
                    <span>Nhấn để chọn 1 - 3 ảnh</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                    />
                  </div>
                  {imagePreviews.length > 0 && (
                    <div className="rr-image-preview-container">
                      {imagePreviews.map((url, index) => (
                        <div key={index} className="rr-image-preview-item">
                          <img src={url} alt={`Preview ${index}`} />
                          <div
                            className="rr-remove-image"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(index);
                            }}
                          >
                            <X size={16} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-grid form-grid-2col">
                  <div className="form-group">
                    <label className="required-field">
                      Tên thú cưng / Đặc điểm nhận dạng
                    </label>
                    <input
                      required
                      type="text"
                      className="form-control"
                      name="petName"
                      value={formData.petName}
                      onChange={handleChange}
                      placeholder="VD: Chó cỏ màu vàng, có vòng cổ..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Giống loài</label>
                    <select
                      className="form-select"
                      name="breed"
                      value={formData.breed}
                      onChange={handleChange}
                    >
                      <option value="Chó">Chó</option>
                      <option value="Mèo">Mèo</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Tình trạng sức khỏe</label>
                  <textarea
                    className="form-control"
                    name="healthStatus"
                    rows="3"
                    value={formData.healthStatus}
                    onChange={handleChange}
                    placeholder="Bị thương ở đâu, suy nhược hay triệu chứng làm sao..."
                  ></textarea>
                </div>
              </div>

              {/* PHẦN 2: THÔNG TIN VỊ TRÍ & LÝ DO */}
              <div className="rr-section mt-4">
                <div className="rr-section-title">
                  <span className="section-icon-number">📍</span>
                  <span className="section-text">Thông Tin Vị Trí & Lý Do
                  </span>
                </div>

                <div className="form-group">
                  <label className="required-field">
                    Lý do cần giải cứu / Từ bỏ thú cưng
                  </label>
                  <textarea
                    required
                    className="form-control"
                    name="reason"
                    rows="3"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Giải thích vì sao cần cứu hộ, bị bỏ rơi hay bạn không có khả năng nuôi nữa..."
                  ></textarea>
                </div>

                <div className="form-grid form-grid-2col">
                  <div className="form-group">
                    <label className="required-field">Khu vực (Region)</label>
                    <select
                      required
                      className="form-select"
                      name="regionID"
                      value={formData.regionID}
                      onChange={handleChange}
                    >
                      <option value="">-- Chọn khu vực --</option>
                      {REGIONS.map((region) => (
                        <option key={region.id} value={region.id}>
                          {region.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="required-field">
                      Địa chỉ chi tiết nơi phát hiện / Đang giữ
                    </label>
                    <input
                      required
                      type="text"
                      className="form-control"
                      name="userAddress"
                      value={formData.userAddress}
                      onChange={handleChange}
                      placeholder="VD: 12 Nguyễn Văn Cừ, Quận 5..."
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <div className="rr-coordinates-box">
                    <div className="coordinates-display">
                      <div className="coord-item">
                        <span className="coord-label">Latitude</span>
                        <span className="coord-value">
                          {formData.latitude !== 0
                            ? formData.latitude.toFixed(6)
                            : "Chưa có"}
                        </span>
                      </div>
                      <div className="coord-item">
                        <span className="coord-label">Longitude</span>
                        <span className="coord-value">
                          {formData.longitude !== 0
                            ? formData.longitude.toFixed(6)
                            : "Chưa có"}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rr-location-btn"
                      onClick={handleGetLocation}
                    >
                      <MapPin size={18} /> Lấy vị trí ngay
                    </button>
                  </div>
                </div>
              </div>

              <div className="rr-submit-container">
                <button
                  type="submit"
                  className="rr-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <span
                      style={{ display: "inline-flex", alignItems: "center" }}
                    >
                      <Loader2
                        className="spinner-icon"
                        size={20}
                        style={{ marginRight: "8px" }}
                      />{" "}
                      Đang Gửi...
                    </span>
                  ) : (
                    "Gửi Báo Cáo Cứu Hộ"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RescueRequestPage;

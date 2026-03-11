import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LifeBuoy } from "lucide-react";
import toast from "react-hot-toast";
import "./RescueFloatingButton.css";

const RescueFloatingButton = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Ẩn nút nếu đang ở các trang Dashboard (Admin, Shelter, Partner)
  const isDashboard =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/shelter") ||
    location.pathname.startsWith("/partner") ||
    location.pathname.startsWith("/volunteer");

  if (isDashboard) return null;

  const handleClick = () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để gửi báo cáo cứu hộ!", {
        icon: "🔒",
        duration: 4000,
      });
      // Chuyển hướng tới login và có state để quay lại
      navigate("/login", { state: { from: { pathname: "/rescue-request" } } });
    } else {
      navigate("/rescue-request");
    }
  };

  return (
    <div
      className="rescue-float-container"
      onClick={handleClick}
      title="Báo cáo cứu hộ khẩn cấp"
    >
      <div className="rescue-float-button">
        <LifeBuoy className="rescue-icon" />
        <span className="rescue-text">Cứu Hộ</span>
      </div>
      <div className="rescue-pulse"></div>
    </div>
  );
};

export default RescueFloatingButton;

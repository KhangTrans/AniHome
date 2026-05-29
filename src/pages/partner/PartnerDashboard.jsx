import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import PartnerOnboarding from "./PartnerOnboarding";
import toast from "react-hot-toast";
import {
  getPartnerSubscriptionStatus,
  registerPartnerProfile,
  getPartnerProducts,
  createPartnerProduct,
  updatePartnerProduct,
  deletePartnerProduct,
  getCategories,
  getPartnerOrders,
  getPartnerProfile,
  updatePartnerProfile,
  getPartnerPatients,
  createPartnerHealthRecord,
  updatePartnerHealthRecord,
  deletePartnerHealthRecord
} from "../../services/public/marketplaceService";
import { changePassword } from "../../services/user/userService";
import { uploadImage } from "../../services/public/uploadService";
import { getPets } from "../../services/public/petsService";
import { getShelters } from "../../services/public/sheltersService";
import { getPartnerEvents, createPartnerEvent, updatePartnerEvent, deletePartnerEvent } from "../../services/partner/partnerEventsService";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
import {
  ShoppingBag,
  Stethoscope,
  Sparkles,
  User,
  LogOut,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  Package,
  Calendar,
  Heart,
  Plus,
  Edit,
  Trash2,
  Activity,
  UserCheck,
  Clipboard,
  Layers,
  Search,
  CheckCircle,
  XCircle,
  FileText,
  Upload,
  Filter,
  Wallet,
  AlertTriangle,
  Store,
  Megaphone,
  MoreVertical,
  Download,
  Star,
  Briefcase,
  Eye,
  EyeOff
} from "lucide-react";

// Utility: Compress image to reduce base64 size
const compressImage = (base64String) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Scale down if image is too large (max 1200px width)
      if (width > 1200) {
        height = Math.round((height * 1200) / width);
        width = 1200;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      // Compress with 0.7 quality (70%)
      const compressed = canvas.toDataURL('image/jpeg', 0.7);
      resolve(compressed);
    };
    img.src = base64String;
  });
};

const PartnerDashboard = () => {
  const { user, logout } = useAuth();
  const [activeCategory, setActiveCategory] = useState(null);
  const [currentTab, setCurrentTab] = useState("overview");

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);

  const [appointments, setAppointments] = useState([]);

  const [patients, setPatients] = useState([]);

  const [packages, setPackages] = useState(() => {
    const saved = localStorage.getItem("partner_packages");
    return saved ? JSON.parse(saved) : [
      { id: 1, name: "Gói Khám Sức Khỏe Toàn Diện", type: "vet", price: 850000, duration: "60 phút", desc: "Bao gồm siêu âm, xét nghiệm máu cơ bản và tư vấn bác sĩ." },
      { id: 2, name: "Gói Tắm & Cắt Tỉa Lông Cao Cấp", type: "spa", price: 450000, duration: "90 phút", desc: "Vệ sinh tai, cắt móng, vắt tuyến hôi, tắm sấy và tỉa lông nghệ thuật." },
      { id: 3, name: "Gói Triệt Sản Thú Cưng", type: "vet", price: 1200000, duration: "120 phút", desc: "Phẫu thuật vô trùng, chăm tiện nghi, chăm sóc hậu phẫu chuyên sâu." },
      { id: 4, name: "Gói Vệ Sinh Răng Miệng Spa", type: "spa", price: 250000, duration: "30 phút", desc: "Đánh răng, cạo cao răng mảng bám nhẹ và xịt thơm miệng chuyên dụng." }
    ];
  });

  // Modals / Form state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: "", category: "", categoryID: "", price: "", stock: "", image: "", desc: "", unit: "cái" });

  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [packageForm, setPackageForm] = useState({ name: "", price: "", duration: "", desc: "" });

  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [appointmentForm, setAppointmentForm] = useState({ petName: "", ownerName: "", date: "", time: "", type: "", notes: "", status: "pending" });
  const [appointmentViewMode, setAppointmentViewMode] = useState("list"); // "list" or "calendar"
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("");

  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [hasDbProfile, setHasDbProfile] = useState(false);

  // DB patients data
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [dbPatientsLoaded, setDbPatientsLoaded] = useState(false);

  // Health record creation form
  const [showAddHRModal, setShowAddHRModal] = useState(false);
  const [editingHealthRecord, setEditingHealthRecord] = useState(null);
  const [hrForm, setHrForm] = useState({ petID: "", weight: "", conditionDetails: "", vaccinationStatus: "N/A", petName: "", breed: "", ownerName: "" });
  const [isSavingHR, setIsSavingHR] = useState(false);
  const [completingAppointmentId, setCompletingAppointmentId] = useState(null);
  const [ehrSearch, setEhrSearch] = useState("");
  const [allPets, setAllPets] = useState([]);

  // Cascading shelter pet selection states
  const [shelterRegions, setShelterRegions] = useState([]);
  const [sheltersList, setSheltersList] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedShelterId, setSelectedShelterId] = useState("");
  const [shelterPets, setShelterPets] = useState([]);
  const [aptPetSource, setAptPetSource] = useState("db"); // "db" or "external"
  const [aptSelectedRegion, setAptSelectedRegion] = useState("");
  const [aptSelectedShelterId, setAptSelectedShelterId] = useState("");
  const [aptShelterPets, setAptShelterPets] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [aptSearchQuery, setAptSearchQuery] = useState("");

  // Profile tab specific states
  const [profileSubTab, setProfileSubTab] = useState("info");
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [partnerProfile, setPartnerProfile] = useState({
    storeName: "",
    address: "",
    contactPhone: "",
    description: "",
    fullName: "",
    avatarUrl: "",
    username: "",
    email: ""
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Load category selection from localStorage & database
  const userId = user?.userId || "default_partner";

  useEffect(() => {
    const checkPartnerProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const result = await getPartnerSubscriptionStatus();
        if (result.success && result.data && result.data.partnerProfileID) {
          // Partner has a profile in the DB!
          const storeType = result.data.storeType;
          if (storeType) {
            const category = storeType.toLowerCase();
            setActiveCategory(category);
            localStorage.setItem(`partner_category_${userId}`, category);
            setHasDbProfile(true);

            // Fetch full profile details
            const profileRes = await getPartnerProfile();
            if (profileRes.success && profileRes.data) {
              setPartnerProfile({
                storeName: profileRes.data.storeName || "",
                address: profileRes.data.address || "",
                contactPhone: profileRes.data.contactPhone || "",
                description: profileRes.data.description || "",
                fullName: profileRes.data.fullName || "",
                avatarUrl: profileRes.data.avatarUrl || "",
                username: profileRes.data.username || "",
                email: profileRes.data.email || ""
              });
              if (profileRes.data.avatarUrl) {
                setAvatarPreview(profileRes.data.avatarUrl);
              }
            }
          } else {
            setActiveCategory(null);
            setHasDbProfile(false);
          }
        } else {
          // No profile in DB. They MUST choose one. Do not fallback to localStorage.
          setActiveCategory(null);
          setHasDbProfile(false);
          localStorage.removeItem(`partner_category_${userId}`);
        }
      } catch (err) {
        console.error("Error loading partner profile:", err);
        setActiveCategory(null);
        setHasDbProfile(false);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (user) {
      checkPartnerProfile();
    } else {
      setIsLoadingProfile(false);
    }
  }, [userId, user]);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    const loadingToast = toast.loading("Đang lưu thông tin hồ sơ...");
    try {
      let finalAvatarUrl = partnerProfile.avatarUrl;

      if (avatarFile) {
        const uploadRes = await uploadImage(avatarFile);
        if (uploadRes.success) {
          finalAvatarUrl = uploadRes.data?.imageUrl || uploadRes.imageUrl;
        } else {
          toast.error("Không thể tải ảnh đại diện lên hệ thống: " + uploadRes.error, { id: loadingToast });
          setIsSavingProfile(false);
          return;
        }
      }

      const updateRes = await updatePartnerProfile({
        storeName: partnerProfile.storeName,
        address: partnerProfile.address,
        contactPhone: partnerProfile.contactPhone,
        description: partnerProfile.description,
        fullName: partnerProfile.fullName,
        avatarUrl: finalAvatarUrl
      });

      if (updateRes.success) {
        toast.success("Cập nhật hồ sơ đối tác thành công!", { id: loadingToast });
        setPartnerProfile(prev => ({
          ...prev,
          avatarUrl: finalAvatarUrl
        }));
      } else {
        toast.error(updateRes.error || "Cập nhật hồ sơ thất bại", { id: loadingToast });
      }
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi xảy ra khi lưu thay đổi.", { id: loadingToast });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin đổi mật khẩu.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("Mật khẩu mới và xác nhận mật khẩu mới không khớp.");
      return;
    }
    setIsChangingPassword(true);
    const loadingToast = toast.loading("Đang thực hiện đổi mật khẩu...");
    try {
      const res = await changePassword({
        userId: user?.userId,
        oldPassword,
        newPassword,
        confirmNewPassword
      });
      if (res.success) {
        toast.success("Thay đổi mật khẩu thành công!", { id: loadingToast });
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        toast.error(res.error || "Không thể thay đổi mật khẩu", { id: loadingToast });
      }
    } catch (err) {
      console.error(err);
      toast.error("Có lỗi xảy ra khi đổi mật khẩu.", { id: loadingToast });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Load products from database
  const fetchProducts = async () => {
    try {
      const result = await getPartnerProducts();
      if (result.success) {
        const mapped = result.data.map(p => {
          // Extract Image robustly
          let img = "https://via.placeholder.com/50";
          const urls = p.imageUrls || p.ImageUrls || p.imageUrl || p.ImageUrl;

          if (Array.isArray(urls) && urls.length > 0) {
            img = urls[0];
          } else if (typeof urls === "string" && urls.trim() !== "") {
            // Check if it's a JSON array string
            if (urls.startsWith("[") && urls.endsWith("]")) {
              try {
                const parsed = JSON.parse(urls);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  img = parsed[0];
                }
              } catch (e) {
                img = urls;
              }
            } else if (urls.includes(",")) {
              img = urls.split(",")[0].trim();
            } else {
              img = urls;
            }
          }

          // Extract Category robustly
          let catName = "Khác";
          if (p.categoryName || p.CategoryName) {
            catName = p.categoryName || p.CategoryName;
          } else if (p.category && (p.category.categoryName || p.category.name)) {
            catName = p.category.categoryName || p.category.name;
          } else if (p.Category && (p.Category.CategoryName || p.Category.Name)) {
            catName = p.Category.CategoryName || p.Category.Name;
          }

          // Extract Stock robustly
          let productStock = 0;
          if (p.quantity !== undefined && p.quantity !== null) productStock = p.quantity;
          else if (p.Quantity !== undefined && p.Quantity !== null) productStock = p.Quantity;
          else if (p.stock !== undefined && p.stock !== null) productStock = p.stock;
          else if (p.Stock !== undefined && p.Stock !== null) productStock = p.Stock;

          return {
            id: p.productID || p.ProductID || p.id || p.Id,
            name: p.productName || p.ProductName || p.name || p.Name,
            category: catName,
            categoryID: p.categoryID || p.CategoryID || p.categoryId,
            price: p.price || p.Price || 0,
            stock: productStock,
            unit: p.unit || p.Unit || "cái",
            image: img,
            desc: p.description || p.Description || p.desc || "",
            isActive: p.isActive !== undefined ? p.isActive : (p.IsActive !== undefined ? p.IsActive : true)
          };
        });
        setProducts(mapped);
      } else {
        toast.error("Không thể tải danh sách sản phẩm từ máy chủ.");
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  useEffect(() => {
    const fetchPartnerOrdersData = async () => {
      try {
        const result = await getPartnerOrders();
        if (result.success) {
          setOrders(result.data);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };

    if (hasDbProfile && activeCategory === "shop") {
      fetchProducts();
      fetchPartnerOrdersData();
    }
  }, [hasDbProfile, activeCategory]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await getCategories();
        if (result.success) {
          setCategoriesList(result.data);
        }
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    };
    if (hasDbProfile) {
      loadCategories();
    }
  }, [hasDbProfile]);

  // Fetch patients from database for vet/spa workspace
  useEffect(() => {
    const fetchPatientsFromDB = async () => {
      if (dbPatientsLoaded) return;
      setIsLoadingPatients(true);
      try {
        const result = await getPartnerPatients();
        if (result.success && result.data.length > 0) {
          // Map DB data to the patients state format
          const mapped = result.data.map(p => ({
            id: p.petID,
            name: p.petName,
            petName: p.petName,
            breed: p.breed || "Chưa rõ",
            status: p.status || "Khỏe mạnh",
            image: p.imageURL || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=150&q=80",
            description: p.description || "",
            categoryName: p.categoryName || "Chưa phân loại",
            shelterName: p.shelterName || "Hệ thống",
            owner: p.shelterName || "Hệ thống",
            weight: p.healthRecords?.length > 0 ? `${p.healthRecords[0].weight || "?"} kg` : "Chưa cập nhật",
            vaccines: p.healthRecords
              ?.filter(hr => hr.vaccinationStatus && hr.vaccinationStatus !== "N/A")
              .map(hr => hr.vaccinationStatus)
              .filter((v, i, arr) => arr.indexOf(v) === i) || [],
            notes: p.healthRecords?.length > 0
              ? p.healthRecords[0].conditionDetails || "Chưa có ghi chú"
              : "Chưa có bệnh án",
            healthRecords: p.healthRecords || []
          }));
          setPatients(mapped);
          setDbPatientsLoaded(true);
          setSelectedPatient(prev => {
            if (!prev) return null;
            const updated = mapped.find(p => p.id === prev.id);
            return updated || prev;
          });
        }
      } catch (err) {
        console.error("Error fetching patients from DB:", err);
      } finally {
        setIsLoadingPatients(false);
      }
    };

    if (hasDbProfile && (activeCategory === "vet" || activeCategory === "spa")) {
      fetchPatientsFromDB();
    }
  }, [hasDbProfile, activeCategory, dbPatientsLoaded]);

  // Fetch all pets for dropdown selection
  useEffect(() => {
    const fetchAllPets = async () => {
      try {
        const result = await getPets({ page: 1, pageSize: 1000 });
        if (result.success && result.data?.items) {
          setAllPets(result.data.items);
        }
      } catch (err) {
        console.error("Error fetching all pets for dropdown:", err);
      }
    };
    if (hasDbProfile && (activeCategory === "vet" || activeCategory === "spa")) {
      fetchAllPets();
    }
  }, [hasDbProfile, activeCategory]);

  // Load all shelters to extract unique regions and names
  useEffect(() => {
    const loadSheltersData = async () => {
      try {
        const result = await getShelters({ page: 1, pageSize: 100 });
        if (result.success && result.data?.items) {
          setSheltersList(result.data.items);

          // Extract unique region names
          const regions = result.data.items
            .map(s => s.regionName)
            .filter((v, i, self) => v && self.indexOf(v) === i);
          setShelterRegions(regions);
        }
      } catch (err) {
        console.error("Error loading shelters data:", err);
      }
    };
    if (hasDbProfile && (activeCategory === "vet" || activeCategory === "spa")) {
      loadSheltersData();
    }
  }, [hasDbProfile, activeCategory]);

  // Fetch pets dynamically when a shelter is selected
  useEffect(() => {
    const fetchPetsForShelter = async () => {
      if (!selectedShelterId) {
        setShelterPets([]);
        return;
      }
      try {
        const result = await getPets({ shelterId: Number(selectedShelterId), page: 1, pageSize: 200 });
        if (result.success && result.data?.items) {
          setShelterPets(result.data.items);
        }
      } catch (err) {
        console.error("Error fetching pets for shelter:", err);
      }
    };
    fetchPetsForShelter();
  }, [selectedShelterId]);

  // Fetch pets dynamically when a shelter is selected for appointment
  useEffect(() => {
    const fetchPetsForAptShelter = async () => {
      if (!aptSelectedShelterId) {
        setAptShelterPets([]);
        return;
      }
      try {
        const result = await getPets({ shelterId: Number(aptSelectedShelterId), page: 1, pageSize: 200 });
        if (result.success && result.data?.items) {
          setAptShelterPets(result.data.items);
        }
      } catch (err) {
        console.error("Error fetching pets for appointment shelter:", err);
      }
    };
    fetchPetsForAptShelter();
  }, [aptSelectedShelterId]);

  const fetchAppointments = async () => {
    try {
      const result = await getPartnerEvents();
      if (result.success) {
        if (Array.isArray(result.data)) {
          const mapped = result.data.map(e => {
            let dateStr = "";
            let timeStr = "";
            if (e.startTime) {
              const dt = new Date(e.startTime);
              dateStr = dt.toISOString().split("T")[0];
              let hours = dt.getHours();
              const minutes = String(dt.getMinutes()).padStart(2, "0");
              const ampm = hours >= 12 ? "PM" : "AM";
              hours = hours % 12;
              hours = hours ? hours : 12;
              timeStr = `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
            }

            let petName = e.title || "";
            let ownerName = "";
            let notes = e.description || "";
            let status = "approved";
            let category = activeCategory || "vet";
            if (e.description && e.description.includes("|")) {
              const parts = e.description.split("|");
              const ownerPart = parts.find(p => p.trim().startsWith("Owner:"));
              const notesPart = parts.find(p => p.trim().startsWith("Notes:"));
              const petPart = parts.find(p => p.trim().startsWith("Pet:"));
              const statusPart = parts.find(p => p.trim().startsWith("Status:"));
              const categoryPart = parts.find(p => p.trim().startsWith("Category:"));
              if (ownerPart) ownerName = ownerPart.replace("Owner:", "").trim();
              if (notesPart) notes = notesPart.replace("Notes:", "").trim();
              if (petPart) petName = petPart.replace("Pet:", "").trim();
              if (statusPart) status = statusPart.replace("Status:", "").trim();
              if (categoryPart) category = categoryPart.replace("Category:", "").trim();
            }

            return {
              id: e.eventID,
              petName: petName || "Thú cưng",
              ownerName: ownerName || "Khách hàng",
              date: dateStr,
              time: timeStr,
              type: e.eventType || "Khám định kỳ",
              status: status,
              notes: notes,
              petID: e.petID,
              category: category
            };
          });
          setAppointments(mapped);
        }
      } else {
        toast.error(result.error || "Không thể tải lịch hẹn");
      }
    } catch (err) {
      console.error("Error fetching partner events:", err);
      toast.error("Đã xảy ra lỗi khi kết nối máy chủ để tải lịch hẹn");
    }
  };

  useEffect(() => {
    if (hasDbProfile && (activeCategory === "vet" || activeCategory === "spa")) {
      fetchAppointments();
    }
  }, [hasDbProfile, activeCategory]);

  useEffect(() => {
    localStorage.setItem("partner_packages", JSON.stringify(packages));
  }, [packages]);

  const handleCategorySelected = async (cat) => {
    try {
      setIsLoadingProfile(true);
      const mappedType = cat === "shop" ? "Shop" : cat === "vet" ? "Vet" : "Spa";

      const registerResult = await registerPartnerProfile({
        storeName: user.fullName || user.username || "Cửa Hàng Đối Tác",
        storeType: mappedType,
        address: "N/A",
        regionID: 1,
        contactPhone: user.phone || "0000000000",
        description: `Hồ sơ đối tác chuyên biệt cho ${mappedType}.`
      });

      if (registerResult.success) {
        toast.success(`Thiết lập không gian làm việc ${mappedType} thành công!`);
        setActiveCategory(cat);
        localStorage.setItem(`partner_category_${userId}`, cat);
        setHasDbProfile(true);
        setCurrentTab("overview");
      } else {
        toast.error(registerResult.error || "Không thể lưu hồ sơ đối tác lên máy chủ.");
      }
    } catch (err) {
      toast.error("Không thể thiết lập không gian làm việc.");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleSwitchService = () => {
    if (hasDbProfile) {
      toast.error("Bạn đã liên kết dịch vụ này với tài khoản. Không thể thay đổi loại hình kinh doanh.");
      return;
    }
    localStorage.removeItem(`partner_category_${userId}`);
    setActiveCategory(null);
  };

  // Product Actions
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.stock) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc!");
      return;
    }

    const payload = {
      productName: productForm.name,
      price: Number(productForm.price),
      quantity: Number(productForm.stock),
      unit: productForm.unit || "cái",
      categoryID: productForm.categoryID ? Number(productForm.categoryID) : null,
      imageUrls: [productForm.image].filter(Boolean),
      description: productForm.desc || "",
      isActive: true
    };

    try {
      if (editingProduct) {
        const result = await updatePartnerProduct(editingProduct.id, payload);
        if (result.success) {
          toast.success("Cập nhật sản phẩm thành công!");
          fetchProducts();
        } else {
          toast.error(result.message || "Không thể cập nhật sản phẩm.");
        }
      } else {
        const result = await createPartnerProduct(payload);
        if (result.success) {
          toast.success("Thêm sản phẩm mới thành công!");
          fetchProducts();
        } else {
          toast.error(result.message || "Không thể thêm sản phẩm.");
        }
      }
      setShowProductModal(false);
      setEditingProduct(null);
      setProductForm({ name: "", category: "", categoryID: "", price: "", stock: "", image: "", desc: "", unit: "cái" });
    } catch (err) {
      toast.error("Đã xảy ra lỗi khi lưu sản phẩm.");
    }
  };

  const handleEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      category: prod.category,
      categoryID: prod.categoryID || "",
      price: prod.price,
      stock: prod.stock,
      image: prod.image,
      desc: prod.desc,
      unit: prod.unit || "cái"
    });
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        const result = await deletePartnerProduct(id);
        if (result.success) {
          toast.success("Đã xóa sản phẩm.");
          fetchProducts();
        } else {
          toast.error(result.message || "Không thể xóa sản phẩm.");
        }
      } catch (err) {
        toast.error("Đã xảy ra lỗi khi xóa sản phẩm.");
      }
    }
  };

  // Appointment Actions
  const handleUpdateAppointmentStatus = async (id, newStatus) => {
    const app = appointments.find(a => a.id === id);
    if (!app) return;

    if (newStatus === "completed" && (activeCategory === "vet" || activeCategory === "spa")) {
      // Vet & Spa: open shared EHR/care record modal
      const matchedPet = allPets.find(p => (p.petName || "").toLowerCase() === (app.petName || "").toLowerCase());
      const isSpa = activeCategory === "spa";
      setHrForm({
        petID: matchedPet ? matchedPet.petID.toString() : "external",
        weight: "",
        conditionDetails: isSpa
          ? `Đã hoàn thành dịch vụ: ${app.type || "Spa & Grooming"}${app.notes ? `\nYêu cầu đặc biệt: ${app.notes}` : ""}`
          : `Khám & điều trị theo lịch hẹn: ${app.type || "Chưa rõ"}${app.notes ? `\nGhi chú đặt lịch: ${app.notes}` : ""}`,
        vaccinationStatus: "N/A",
        petName: matchedPet ? "" : (app.petName || ""),
        breed: "",
        ownerName: matchedPet ? "" : (app.ownerName || "")
      });
      setEditingHealthRecord(null);
      setShowAddHRModal(true);
      setCompletingAppointmentId(id);
      toast(
        isSpa
          ? "Vui lòng ghi nhận hồ sơ chăm sóc cho buổi làm đẹp này!"
          : "Vui lòng ghi nhận thêm thông tin bệnh án y tế (EHR) cho ca khám này!",
        { icon: isSpa ? "✂️" : "📝" }
      );
    } else {
      // Spa or non-completed: directly update status
      const newDesc = `Pet: ${app.petName} | Owner: ${app.ownerName} | Notes: ${app.notes || ""} | Status: ${newStatus} | Category: ${app.category || activeCategory}`;
      const dateObj = new Date(app.date + "T" + convertTimeTo24h(app.time) + ":00");
      const payload = {
        eventName: app.petName,
        eventDate: dateObj.toISOString(),
        eventType: app.type,
        description: newDesc,
        location: partnerProfile.address || "Tại cửa hàng",
        petID: app.petID || null
      };
      const result = await updatePartnerEvent(id, payload);
      if (result.success) {
        setAppointments(appointments.map(a => a.id === id ? { ...a, status: newStatus } : a));
        const statusLabel = newStatus === "approved" ? "Đã duyệt" : newStatus === "completed" ? "Đã hoàn thành" : "Đã hủy";
        toast.success(`Đã cập nhật trạng thái lịch hẹn thành: ${statusLabel}`);
      } else {
        toast.error("Không thể cập nhật trạng thái lịch hẹn lên máy chủ");
      }
    }
  };

  const convertTimeTo24h = (timeStr) => {
    if (!timeStr) return "";
    if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr;
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return timeStr;
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = match[3].toUpperCase();
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${minutes}`;
  };

  const convertTimeTo12h = (time24) => {
    if (!time24) return "";
    const match = time24.match(/^(\d{2}):(\d{2})$/);
    if (!match) return time24;
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
  };

  const getDaysInMonth = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();
    const firstDay = new Date(year, month, 1);

    // Monday as 0, Sunday as 6
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days = [];
    const prevMonthEnd = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({ day: prevMonthEnd - i, isCurrentMonth: false, dateStr: null });
    }

    const totalDays = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= totalDays; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      days.push({ day: i, isCurrentMonth: true, dateStr });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, isCurrentMonth: false, dateStr: null });
    }

    return days;
  };

  const navigateCalendarMonth = (monthsOffset) => {
    setCurrentCalendarDate(prev => {
      const nextDate = new Date(prev);
      nextDate.setMonth(prev.getMonth() + monthsOffset);
      return nextDate;
    });
  };

  const handleCreateAppointment = (specificDate = null) => {
    setEditingAppointment(null);
    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, "0");
    const currentMinutes = String(now.getMinutes()).padStart(2, "0");
    const currentTimeStr = `${currentHours}:${currentMinutes}`;

    setAppointmentForm({
      petName: "",
      ownerName: "",
      date: specificDate || now.toISOString().split("T")[0],
      time: currentTimeStr,
      type: "",
      notes: "",
      status: "pending",
      petID: null
    });
    setAptPetSource("db");
    setAptSelectedRegion("");
    setAptSelectedShelterId("");
    setShowAppointmentModal(true);
  };

  const handleEditAppointment = (app) => {
    if (app.status === "completed") {
      toast.error("Không thể sửa lịch hẹn đã hoàn thành!");
      return;
    }
    setEditingAppointment(app);
    setAppointmentForm({
      petName: app.petName || "",
      ownerName: app.ownerName || "",
      date: app.date || "",
      time: convertTimeTo24h(app.time || ""),
      type: app.type || "",
      notes: app.notes || "",
      status: app.status || "pending",
      petID: app.petID || null
    });
    setAptPetSource(app.petID ? "db" : "external");
    setAptSelectedRegion("");
    setAptSelectedShelterId("");
    setShowAppointmentModal(true);
  };

  const handleDeleteAppointment = async (id) => {
    const app = appointments.find(a => a.id === id);
    if (app && app.status === "completed") {
      toast.error("Không thể xóa lịch hẹn đã hoàn thành!");
      return;
    }
    if (window.confirm("Bạn có chắc chắn muốn xóa lịch hẹn này khỏi danh sách?")) {
      const loadingToast = toast.loading("Đang xóa lịch hẹn...");
      try {
        const result = await deletePartnerEvent(id);
        if (result.success) {
          toast.success("Đã xóa lịch hẹn thành công!", { id: loadingToast });
          fetchAppointments();
        } else {
          toast.error(result.error || "Không thể xóa lịch hẹn", { id: loadingToast });
        }
      } catch (err) {
        toast.error("Đã xảy ra lỗi khi xóa lịch hẹn", { id: loadingToast });
      }
    }
  };

  const handleEditHealthRecord = (hr) => {
    setEditingHealthRecord(hr);
    setHrForm({
      petID: selectedPatient.id.toString(),
      weight: hr.weight ? hr.weight.toString() : "",
      conditionDetails: hr.conditionDetails || "",
      vaccinationStatus: hr.vaccinationStatus || "N/A"
    });
    setShowAddHRModal(true);
  };

  const handleDeleteHealthRecord = async (recordId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hồ sơ bệnh án này không?")) {
      const loadingToast = toast.loading("Đang xóa bệnh án...");
      try {
        const result = await deletePartnerHealthRecord(recordId);
        if (result.success) {
          toast.success("Xóa bệnh án thành công!", { id: loadingToast });
          setDbPatientsLoaded(false);
        } else {
          toast.error(result.error || "Không thể xóa bệnh án", { id: loadingToast });
        }
      } catch (err) {
        console.error(err);
        toast.error("Có lỗi xảy ra khi xóa bệnh án.", { id: loadingToast });
      }
    }
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    if (!appointmentForm.petName || !appointmentForm.ownerName || !appointmentForm.date || !appointmentForm.time || !appointmentForm.type) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    // Validation: Date must not be in the past
    const todayStr = new Date().toISOString().split("T")[0];
    if (appointmentForm.date < todayStr) {
      toast.error("Không thể đặt lịch hẹn cho ngày trong quá khứ!");
      return;
    }

    const formattedTime = convertTimeTo12h(appointmentForm.time);
    const descCombined = `Pet: ${appointmentForm.petName} | Owner: ${appointmentForm.ownerName} | Notes: ${appointmentForm.notes || ""} | Category: ${activeCategory}`;
    const dateObj = new Date(`${appointmentForm.date}T${appointmentForm.time}:00`);

    const payload = {
      eventName: appointmentForm.petName,
      eventDate: dateObj.toISOString(),
      eventType: appointmentForm.type,
      description: descCombined,
      location: partnerProfile.address || "Tại cửa hàng",
      petID: aptPetSource === "db" && appointmentForm.petID ? Number(appointmentForm.petID) : null
    };

    const loadingToast = toast.loading(editingAppointment ? "Đang cập nhật lịch hẹn..." : "Đang tạo lịch hẹn...");
    try {
      let result;
      if (editingAppointment) {
        result = await updatePartnerEvent(editingAppointment.id, payload);
      } else {
        result = await createPartnerEvent(payload);
      }
      if (result.success) {
        toast.success(editingAppointment ? "Cập nhật lịch hẹn thành công!" : "Tạo lịch hẹn mới thành công!", { id: loadingToast });
        fetchAppointments();
        setShowAppointmentModal(false);
        setEditingAppointment(null);
      } else {
        toast.error(result.error || "Không thể lưu lịch hẹn", { id: loadingToast });
      }
    } catch (err) {
      toast.error("Đã xảy ra lỗi khi lưu lịch hẹn", { id: loadingToast });
    }
  };

  // Service Package Actions
  const handlePackageSubmit = (e) => {
    e.preventDefault();
    if (!packageForm.name || !packageForm.price || !packageForm.duration) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    if (editingPackage) {
      setPackages(packages.map(p => p.id === editingPackage.id ? { ...p, ...packageForm, price: Number(packageForm.price) } : p));
      toast.success("Cập nhật gói dịch vụ thành công!");
    } else {
      const newPkg = {
        id: Date.now(),
        ...packageForm,
        type: activeCategory,
        price: Number(packageForm.price)
      };
      setPackages([...packages, newPkg]);
      toast.success("Thêm gói dịch vụ mới thành công!");
    }

    setShowPackageModal(false);
    setEditingPackage(null);
    setPackageForm({ name: "", price: "", duration: "", desc: "" });
  };

  const handleEditPackage = (pkg) => {
    setEditingPackage(pkg);
    setPackageForm({ name: pkg.name, price: pkg.price, duration: pkg.duration, desc: pkg.desc });
    setShowPackageModal(true);
  };

  const handleDeletePackage = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa gói dịch vụ này?")) {
      setPackages(packages.filter(p => p.id !== id));
      toast.success("Đã xóa gói dịch vụ.");
    }
  };

  const handleExportCSV = () => {
    const headers = "Mã đơn,Ngày đặt,Khách hàng,Tổng tiền (VNĐ),Trạng thái\n";
    const dataRows = orders.length > 0 ? orders : [
      { id: "ORD-1001", orderDate: "2026-05-25", customerName: "Nguyễn Văn Hùng", totalAmount: 450000 },
      { id: "ORD-1002", orderDate: "2026-05-26", customerName: "Trần Thị Lan", totalAmount: 850000 },
      { id: "ORD-1003", orderDate: "2026-05-27", customerName: "Lê Minh Tuấn", totalAmount: 350000 }
    ];
    const rows = dataRows.map(o => {
      const orderId = o.orderID || o.id;
      const date = o.orderDate || new Date(o.createdAt).toLocaleDateString("vi-VN");
      const customer = o.customerName || "Khách mua hàng";
      const total = o.totalAmount || o.totalPrice || 0;
      return `"${orderId}","${date}","${customer}",${total},"Đã hoàn thành"`;
    }).join("\n");
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(headers + rows);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", `Bao_cao_doanh_thu_${new Date().toLocaleDateString("vi-VN")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Xuất báo cáo doanh thu CSV thành công!");
  };

  if (isLoadingProfile) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ border: "4px solid #f3f3f3", borderTop: "4px solid var(--primary)", borderRadius: "50%", width: "40px", height: "40px", animation: "spin 1s linear infinite", margin: "0 auto 1rem" }}></div>
          <p style={{ color: "#666", fontWeight: "600" }}>Đang tải cấu hình không gian làm việc...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Render onboarding if no active category is set
  if (!activeCategory) {
    return <PartnerOnboarding onComplete={handleCategorySelected} />;
  }

  // Active Category metadata
  const getCategoryLabel = () => {
    if (activeCategory === "shop") return "Cửa hàng (Shop)";
    if (activeCategory === "vet") return "Thú y (Veterinary)";
    if (activeCategory === "spa") return "Dịch vụ Spa & Grooming";
    return "";
  };

  const getCategoryIcon = () => {
    if (activeCategory === "shop") return <ShoppingBag size={20} color="var(--primary)" />;
    if (activeCategory === "vet") return <Stethoscope size={20} color="var(--secondary)" />;
    if (activeCategory === "spa") return <Sparkles size={20} color="#9b93ff" />;
  };

  // --- STATS COMPUTATION FOR SHOP ---
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyOrders = orders.filter(o => {
    if (!o.orderDate && !o.OrderDate && !o.createdAt && !o.CreatedAt) return false;
    const date = new Date(o.orderDate || o.OrderDate || o.createdAt || o.CreatedAt);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const monthlyRevenue = monthlyOrders.reduce((sum, order) => {
    const amount = order.totalAmount || order.TotalAmount || order.totalPrice || order.TotalPrice || 0;
    return sum + amount;
  }, 0);

  const totalOrdersSold = orders.length;

  // Chart data: Group orders by month (last 6 months)
  const chartLabels = [];
  const chartDataPoints = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - i, 1);
    chartLabels.push(`T${d.getMonth() + 1}/${d.getFullYear()}`);
    const monthOrders = orders.filter(o => {
      if (!o.orderDate && !o.OrderDate && !o.createdAt && !o.CreatedAt) return false;
      const date = new Date(o.orderDate || o.OrderDate || o.createdAt || o.CreatedAt);
      return date.getMonth() === d.getMonth() && date.getFullYear() === d.getFullYear();
    });
    const rev = monthOrders.reduce((sum, o) => sum + (o.totalAmount || o.TotalAmount || o.totalPrice || o.TotalPrice || 0), 0);
    chartDataPoints.push(rev);
  }

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Doanh thu (₫)',
        data: chartDataPoints,
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Biểu đồ Doanh Thu 6 tháng gần nhất (₫)', font: { size: 16 } }
    }
  };
  // ------------------------------------

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f4f6f8",
        fontFamily: "'Be Vietnam Pro', sans-serif",
      }}
    >
      {/* Sidebar Navigation */}
      <aside
        style={{
          width: "280px",
          backgroundColor: "#ffffff",
          borderRight: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
          flexShrink: 0,
          zIndex: 40,
        }}
      >
        {/* Logo and Workspace identifier */}
        <div
          style={{
            padding: "1.5rem 1.5rem 1.25rem",
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <img src="/logo_wed.png" alt="HomePaws" style={{ height: "40px", objectFit: "contain" }} />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.6rem 0.8rem",
              backgroundColor: activeCategory === "shop" ? "#FFF0F0" : activeCategory === "vet" ? "#EBFBFA" : "#F4F3FF",
              borderRadius: "12px",
            }}
          >
            {getCategoryIcon()}
            <span
              style={{
                fontSize: "0.82rem",
                fontWeight: "700",
                color: "#1e293b",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {getCategoryLabel()}
            </span>
          </div>
        </div>

        {/* Tab Items */}
        <nav style={{ flex: 1, padding: "1.5rem 1rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          {/* Universal Tab */}
          <button
            onClick={() => setCurrentTab("overview")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.8rem 1rem",
              borderRadius: "10px",
              backgroundColor: currentTab === "overview" ? "#f1f5f9" : "transparent",
              color: currentTab === "overview" ? "#1e293b" : "#64748b",
              fontWeight: currentTab === "overview" ? "700" : "500",
              textAlign: "left",
              fontSize: "0.95rem",
              transition: "all 0.2s"
            }}
          >
            <Activity size={18} /> Tổng quan
          </button>

          {/* Shop specific tabs */}
          {activeCategory === "shop" && (
            <>
              <button
                onClick={() => setCurrentTab("products")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.8rem 1rem",
                  borderRadius: "10px",
                  backgroundColor: currentTab === "products" ? "#f1f5f9" : "transparent",
                  color: currentTab === "products" ? "#1e293b" : "#64748b",
                  fontWeight: currentTab === "products" ? "700" : "500",
                  textAlign: "left",
                  fontSize: "0.95rem",
                  transition: "all 0.2s"
                }}
              >
                <Package size={18} /> Quản lý sản phẩm
              </button>
              <button
                onClick={() => setCurrentTab("revenue")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.8rem 1rem",
                  borderRadius: "10px",
                  backgroundColor: currentTab === "revenue" ? "#f1f5f9" : "transparent",
                  color: currentTab === "revenue" ? "#1e293b" : "#64748b",
                  fontWeight: currentTab === "revenue" ? "700" : "500",
                  textAlign: "left",
                  fontSize: "0.95rem",
                  transition: "all 0.2s"
                }}
              >
                <TrendingUp size={18} /> Báo cáo doanh thu
              </button>
            </>
          )}

          {/* Veterinary specific tabs */}
          {activeCategory === "vet" && (
            <>
              <button
                onClick={() => setCurrentTab("appointments")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.8rem 1rem",
                  borderRadius: "10px",
                  backgroundColor: currentTab === "appointments" ? "#f1f5f9" : "transparent",
                  color: currentTab === "appointments" ? "#1e293b" : "#64748b",
                  fontWeight: currentTab === "appointments" ? "700" : "500",
                  textAlign: "left",
                  fontSize: "0.95rem",
                  transition: "all 0.2s"
                }}
              >
                <Calendar size={18} /> Quản lý lịch hẹn
              </button>
              <button
                onClick={() => setCurrentTab("ehr")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.8rem 1rem",
                  borderRadius: "10px",
                  backgroundColor: currentTab === "ehr" ? "#f1f5f9" : "transparent",
                  color: currentTab === "ehr" ? "#1e293b" : "#64748b",
                  fontWeight: currentTab === "ehr" ? "700" : "500",
                  textAlign: "left",
                  fontSize: "0.95rem",
                  transition: "all 0.2s"
                }}
              >
                <Clipboard size={18} /> Hồ sơ sức khỏe (EHR)
              </button>
              <button
                onClick={() => setCurrentTab("packages")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.8rem 1rem",
                  borderRadius: "10px",
                  backgroundColor: currentTab === "packages" ? "#f1f5f9" : "transparent",
                  color: currentTab === "packages" ? "#1e293b" : "#64748b",
                  fontWeight: currentTab === "packages" ? "700" : "500",
                  textAlign: "left",
                  fontSize: "0.95rem",
                  transition: "all 0.2s"
                }}
              >
                <Layers size={18} /> Gói dịch vụ y tế
              </button>
            </>
          )}

          {/* Spa specific tabs */}
          {activeCategory === "spa" && (
            <>
              <button
                onClick={() => setCurrentTab("appointments")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.8rem 1rem",
                  borderRadius: "10px",
                  backgroundColor: currentTab === "appointments" ? "#f1f5f9" : "transparent",
                  color: currentTab === "appointments" ? "#1e293b" : "#64748b",
                  fontWeight: currentTab === "appointments" ? "700" : "500",
                  textAlign: "left",
                  fontSize: "0.95rem",
                  transition: "all 0.2s"
                }}
              >
                <Calendar size={18} /> Lịch hẹn làm đẹp
              </button>
              <button
                onClick={() => setCurrentTab("wellness")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.8rem 1rem",
                  borderRadius: "10px",
                  backgroundColor: currentTab === "wellness" ? "#f1f5f9" : "transparent",
                  color: currentTab === "wellness" ? "#1e293b" : "#64748b",
                  fontWeight: currentTab === "wellness" ? "700" : "500",
                  textAlign: "left",
                  fontSize: "0.95rem",
                  transition: "all 0.2s"
                }}
              >
                <UserCheck size={18} /> Hồ sơ & Kiểu dáng Pet
              </button>
              <button
                onClick={() => setCurrentTab("packages")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.8rem 1rem",
                  borderRadius: "10px",
                  backgroundColor: currentTab === "packages" ? "#f1f5f9" : "transparent",
                  color: currentTab === "packages" ? "#1e293b" : "#64748b",
                  fontWeight: currentTab === "packages" ? "700" : "500",
                  textAlign: "left",
                  fontSize: "0.95rem",
                  transition: "all 0.2s"
                }}
              >
                <Layers size={18} /> Gói dịch vụ Spa
              </button>
            </>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div
          style={{
            padding: "1.5rem",
            borderTop: "1px solid #f1f5f9",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          {/* Switch Service selection */}
          {!hasDbProfile && (
            <button
              onClick={handleSwitchService}
              className="btn btn-outline"
              style={{
                padding: "0.6rem",
                fontSize: "0.85rem",
                borderRadius: "10px",
                justifyContent: "center",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                width: "100%",
              }}
            >
              🔄 Đổi Dịch Vụ
            </button>
          )}

          {/* User profile card & Logout */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              onClick={() => setCurrentTab("profile")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                flex: 1,
                cursor: "pointer",
                padding: "0.5rem",
                borderRadius: "12px",
                backgroundColor: currentTab === "profile" ? "#f1f5f9" : "transparent",
                transition: "all 0.2s"
              }}
              className="hover-scale"
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  color: "#475569",
                  overflow: "hidden"
                }}
              >
                {partnerProfile.avatarUrl ? (
                  <img src={partnerProfile.avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <User size={18} />
                )}
              </div>
              <div style={{ flex: 1, overflow: "hidden" }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.85rem",
                    fontWeight: "bold",
                    color: "#1e293b",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  {partnerProfile.storeName || user?.fullName || "Đối tác"}
                </p>
                <p style={{ margin: 0, fontSize: "0.72rem", color: "#64748b" }}>Partner</p>
              </div>
            </div>
            <button
              onClick={logout}
              style={{
                background: "transparent",
                color: "var(--danger)",
                cursor: "pointer",
                padding: "8px",
                display: "flex",
                borderRadius: "8px",
                transition: "all 0.2s"
              }}
              title="Đăng xuất"
              className="hover-scale"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main style={{ flex: 1, padding: "2.5rem 3rem", overflowY: "auto", overflowX: "hidden", height: "100vh" }}>

        {/* PROFILE TAB (COMMON FOR ALL WORKSPACES) */}
        {currentTab === "profile" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div>
              <h2 style={{ fontSize: "2.25rem", fontWeight: "800", color: "#1e293b", margin: 0 }}>
                Hồ sơ Đối tác
              </h2>
              <p style={{ color: "#64748b", marginTop: "0.5rem", fontSize: "1rem" }}>
                Cập nhật thông tin phòng khám và cài đặt hiển thị trên ứng dụng HomePaws.
              </p>
            </div>

            {/* Profile Details Card */}
            <div className="card" style={{ padding: "2rem", borderRadius: "20px", border: "1px solid #f1f5f9", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "2rem", marginBottom: "2rem", paddingBottom: "2rem", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ position: "relative" }}>
                  <div style={{ width: "100px", height: "100px", borderRadius: "50%", backgroundColor: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", border: "4px solid #ffffff", boxShadow: "0 4px 10px rgba(0,0,0,0.08)", overflow: "hidden" }}>
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <User size={40} color="#94a3b8" />
                    )}
                  </div>
                  <label style={{ position: "absolute", bottom: "0", right: "0", width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#f05a5b", color: "white", border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", transition: "all 0.2s" }} className="hover-scale" title="Thay đổi Avatar">
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setAvatarFile(e.target.files[0]);
                        setAvatarPreview(URL.createObjectURL(e.target.files[0]));
                      }
                    }} />
                    <Upload size={14} />
                  </label>
                </div>
                <div>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#1e293b", margin: "0 0 0.5rem" }}>
                    {partnerProfile.storeName || user?.fullName || "Đối tác kinh doanh"}
                  </h3>
                  <p style={{ color: "#64748b", margin: 0, fontSize: "0.95rem" }}>
                    {partnerProfile.email || user?.email || "partner@homepaws.com"}
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#475569" }}>Tên đăng nhập (Username)</label>
                  <input type="text" value={partnerProfile.username || user?.username || ""} disabled style={{ padding: "0.8rem 1rem", borderRadius: "10px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", color: "#94a3b8", fontSize: "0.95rem", outline: "none", cursor: "not-allowed" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#475569" }}>Địa chỉ Email</label>
                  <input type="text" value={partnerProfile.email || user?.email || ""} disabled style={{ padding: "0.8rem 1rem", borderRadius: "10px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", color: "#94a3b8", fontSize: "0.95rem", outline: "none", cursor: "not-allowed" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#475569" }}>Tên đối tác / Phòng khám</label>
                  <input type="text" value={partnerProfile.storeName} onChange={(e) => setPartnerProfile({ ...partnerProfile, storeName: e.target.value, fullName: e.target.value })} style={{ padding: "0.8rem 1rem", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "0.95rem", outline: "none" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#475569" }}>Số điện thoại liên hệ</label>
                  <input type="text" value={partnerProfile.contactPhone} onChange={(e) => setPartnerProfile({ ...partnerProfile, contactPhone: e.target.value })} style={{ padding: "0.8rem 1rem", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "0.95rem", outline: "none" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", gridColumn: "span 2" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#475569" }}>Địa chỉ kinh doanh</label>
                  <input type="text" value={partnerProfile.address} onChange={(e) => setPartnerProfile({ ...partnerProfile, address: e.target.value })} style={{ padding: "0.8rem 1rem", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "0.95rem", outline: "none" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", gridColumn: "span 2" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#475569" }}>Mô tả ngắn gọn (Giới thiệu)</label>
                  <textarea rows="4" value={partnerProfile.description} onChange={(e) => setPartnerProfile({ ...partnerProfile, description: e.target.value })} style={{ padding: "0.8rem 1rem", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "0.95rem", fontFamily: "inherit", outline: "none" }}></textarea>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem" }}>
                <button onClick={handleSaveProfile} disabled={isSavingProfile} style={{ backgroundColor: "#f05a5b", color: "white", padding: "0.8rem 2.5rem", borderRadius: "9999px", fontWeight: "bold", border: "none", cursor: isSavingProfile ? "not-allowed" : "pointer", fontSize: "0.95rem", boxShadow: "0 4px 10px rgba(240, 90, 91, 0.25)", transition: "all 0.2s" }} className="hover-scale">
                  {isSavingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </div>

            {/* Security & Password Card */}
            <div className="card" style={{ padding: "2rem", borderRadius: "20px", border: "1px solid #f1f5f9", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.03)" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#1e293b", margin: "0 0 1.5rem" }}>Đổi mật khẩu</h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#475569" }}>Mật khẩu hiện tại</label>
                  <div style={{ position: "relative" }}>
                    <input type={showCurrentPassword ? "text" : "password"} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Nhập mật khẩu hiện tại" style={{ width: "100%", padding: "0.8rem 2.5rem 0.8rem 1rem", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }} />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center" }}>
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#475569" }}>Mật khẩu mới</label>
                  <div style={{ position: "relative" }}>
                    <input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nhập mật khẩu mới" style={{ width: "100%", padding: "0.8rem 2.5rem 0.8rem 1rem", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }} />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center" }}>
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#475569" }}>Xác nhận mật khẩu mới</label>
                  <div style={{ position: "relative" }}>
                    <input type={showConfirmPassword ? "text" : "password"} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="Nhập lại mật khẩu mới" style={{ width: "100%", padding: "0.8rem 2.5rem 0.8rem 1rem", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "0.95rem", outline: "none", boxSizing: "border-box" }} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center" }}>
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem" }}>
                <button onClick={handleUpdatePassword} disabled={isChangingPassword} style={{ backgroundColor: "#1e293b", color: "white", padding: "0.8rem 2.5rem", borderRadius: "9999px", fontWeight: "bold", border: "none", cursor: isChangingPassword ? "not-allowed" : "pointer", fontSize: "0.95rem", boxShadow: "0 4px 10px rgba(30, 41, 59, 0.25)", transition: "all 0.2s" }} className="hover-scale">
                  {isChangingPassword ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {currentTab === "overview" && (
          <div>
            {activeCategory === "vet" ? (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
                <div>
                  <h2 style={{ fontSize: "2rem", fontWeight: "800", color: "#1e293b", margin: 0 }}>
                    Quản lý Dịch vụ & Lịch hẹn
                  </h2>
                  <p style={{ color: "#64748b", marginTop: "0.25rem", fontSize: "0.95rem" }}>
                    Tổng quan các hoạt động thăm khám và dịch vụ trong ngày.
                  </p>
                </div>
                <button
                  onClick={handleCreateAppointment}
                  style={{
                    backgroundColor: "#ff6b6b",
                    color: "white",
                    padding: "0.6rem 1.25rem",
                    borderRadius: "9999px",
                    border: "none",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                    boxShadow: "0 4px 6px rgba(255, 107, 107, 0.2)"
                  }}
                >
                  <Plus size={18} /> Tạo lịch hẹn mới
                </button>
              </div>
            ) : activeCategory === "spa" ? (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
                <div>
                  <h2 style={{ fontSize: "2rem", fontWeight: "800", color: "#1e293b", margin: 0 }}>
                    Quản lý Spa & Grooming
                  </h2>
                  <p style={{ color: "#64748b", marginTop: "0.25rem", fontSize: "0.95rem" }}>
                    Tổng quan các dịch vụ làm đẹp và lịch hẹn chăm sóc thú cưng trong ngày.
                  </p>
                </div>
                <button
                  onClick={handleCreateAppointment}
                  style={{
                    backgroundColor: "#7066e0",
                    color: "white",
                    padding: "0.6rem 1.25rem",
                    borderRadius: "9999px",
                    border: "none",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                    boxShadow: "0 4px 6px rgba(112, 102, 224, 0.2)"
                  }}
                >
                  <Plus size={18} /> Tạo lịch hẹn mới
                </button>
              </div>
            ) : (
              <div style={{ marginBottom: "2rem" }}>
                <h2 style={{ fontSize: "2rem", fontWeight: "800", color: "#1e293b", margin: 0 }}>
                  Xin chào, {user?.fullName || "Đối tác"}!
                </h2>
                <p style={{ color: "#64748b", marginTop: "0.25rem" }}>
                  Chào mừng đến với bảng quản trị {getCategoryLabel()}. Dưới đây là thống kê sơ lược hôm nay.
                </p>
              </div>
            )}

            {/* KPI Cards Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "1.5rem",
                marginBottom: "2.5rem",
              }}
            >
              {activeCategory === "shop" ? (
                <>
                  {/* KPI 1 */}
                  <div style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "20px",
                    padding: "1.5rem",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)",
                    position: "relative",
                    border: "1px solid #f1f5f9"
                  }}>
                    <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0, fontWeight: "600" }}>Doanh Thu Tháng Này</p>
                    <h3 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#1e293b", margin: "0.5rem 0" }}>
                      {monthlyRevenue.toLocaleString("vi-VN")} ₫
                    </h3>
                    <span style={{ fontSize: "0.75rem", color: "var(--success)", fontWeight: "bold" }}>
                      Cập nhật từ cơ sở dữ liệu
                    </span>
                    <div style={{ position: "absolute", right: "1.5rem", top: "1.5rem", opacity: 0.15 }}>
                      <Wallet size={40} color="#64748b" />
                    </div>
                  </div>

                  {/* KPI 2 */}
                  <div style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "20px",
                    padding: "1.5rem",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)",
                    position: "relative",
                    border: "1px solid #f1f5f9"
                  }}>
                    <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0, fontWeight: "600" }}>Số Lượng Sản Phẩm</p>
                    <h3 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#1e293b", margin: "0.5rem 0" }}>
                      {products.length} mặt hàng
                    </h3>
                    <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      Có {products.filter(p => p.stock < 5).length} sản phẩm sắp hết hàng
                    </span>
                    <div style={{ position: "absolute", right: "1.5rem", top: "1.5rem", opacity: 0.15 }}>
                      <Package size={40} color="#64748b" />
                    </div>
                  </div>

                  {/* KPI 3 */}
                  <div style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "20px",
                    padding: "1.5rem",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)",
                    position: "relative",
                    border: "1px solid #f1f5f9"
                  }}>
                    <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0, fontWeight: "600" }}>Tổng Đơn Hàng Đã Bán</p>
                    <h3 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#1e293b", margin: "0.5rem 0" }}>
                      {totalOrdersSold.toLocaleString("vi-VN")} đơn
                    </h3>
                    <span style={{ fontSize: "0.75rem", color: "var(--success)", fontWeight: "bold" }}>
                      Thống kê toàn thời gian
                    </span>
                    <div style={{ position: "absolute", right: "1.5rem", top: "1.5rem", opacity: 0.15 }}>
                      <ShoppingBag size={40} color="#64748b" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* KPI 1 */}
                  <div style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "16px",
                    padding: "1.5rem",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    border: "1px solid #f1f5f9"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <p style={{ color: "#475569", fontSize: "0.9rem", margin: 0, fontWeight: "600" }}>Lịch hẹn hôm nay</p>
                      <div style={{ backgroundColor: "#f3e8ff", padding: "8px", borderRadius: "50%" }}>
                        <Calendar size={20} color="#9333ea" />
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                      <h3 style={{ fontSize: "2.2rem", fontWeight: "800", color: "#1e293b", margin: 0 }}>
                        {appointments.filter(a => a.category === activeCategory && (a.status === "pending" || a.status === "approved")).length}
                      </h3>
                      <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                        {appointments.filter(a => a.category === activeCategory && a.status === "pending").length} đang chờ
                      </span>
                    </div>
                  </div>

                  {/* KPI 2 */}
                  <div style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "16px",
                    padding: "1.5rem",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    border: "1px solid #f1f5f9"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <p style={{ color: "#475569", fontSize: "0.9rem", margin: 0, fontWeight: "600" }}>
                        {activeCategory === "spa" ? "Khách hàng" : "Bệnh nhân"}
                      </p>
                      <div style={{ backgroundColor: activeCategory === "spa" ? "#f3e8ff" : "#fee2e2", padding: "8px", borderRadius: "50%" }}>
                        <Briefcase size={20} color={activeCategory === "spa" ? "#9333ea" : "#ef4444"} />
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                      <h3 style={{ fontSize: "2.2rem", fontWeight: "800", color: "#1e293b", margin: 0 }}>
                        {activeCategory === "spa"
                          ? [...new Set(appointments.filter(a => a.category === "spa").map(a => a.ownerName))].length
                          : patients.length}
                      </h3>
                      <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                        {activeCategory === "spa" ? "khách đã đến" : "thú cưng trong hệ thống"}
                      </span>
                    </div>
                  </div>

                  {/* KPI 3 */}
                  <div style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "16px",
                    padding: "1.5rem",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    border: "1px solid #f1f5f9"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <p style={{ color: "#475569", fontSize: "0.9rem", margin: 0, fontWeight: "600" }}>
                        {activeCategory === "spa" ? "Hoàn thành hôm nay" : "Đánh giá gần đây"}
                      </p>
                      <div style={{ backgroundColor: activeCategory === "spa" ? "#dcfce7" : "#fef3c7", padding: "8px", borderRadius: "50%" }}>
                        {activeCategory === "spa"
                          ? <CheckCircle size={20} color="#16a34a" />
                          : <Star size={20} color="#d97706" fill="#d97706" />}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                      <h3 style={{ fontSize: "2.2rem", fontWeight: "800", color: "#1e293b", margin: 0 }}>
                        {activeCategory === "spa"
                          ? appointments.filter(a => a.category === "spa" && a.status === "completed").length
                          : "4.8"}
                      </h3>
                      <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                        {activeCategory === "spa" ? "dịch vụ đã hoàn tất" : "/ 5.0 (24 lượt)"}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Actions / Charts layout */}
            {activeCategory === "shop" ? (
              <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "1.5rem" }}>
                {/* Left Side: CSS Chart & Recent Orders */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {/* Revenue Chart Card */}
                  <div style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "20px",
                    padding: "1.5rem",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
                    border: "1px solid #f1f5f9"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                      <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#1e293b", margin: 0 }}>Báo cáo Doanh Thu hôm nay</h3>
                      <MoreVertical size={20} style={{ color: "#94a3b8", cursor: "pointer" }} />
                    </div>

                    <div style={{ display: "flex", gap: "1rem", height: "180px", position: "relative" }}>
                      {/* Y-Axis scale labels */}
                      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", color: "#94a3b8", fontSize: "0.75rem", paddingBottom: "20px" }}>
                        <span>50M</span>
                        <span>25M</span>
                        <span>0</span>
                      </div>

                      {/* Bar columns */}
                      <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-end", flex: 1, paddingBottom: "20px", borderBottom: "1px solid #f1f5f9" }}>
                        {[
                          { label: "T1", val: 35 },
                          { label: "T2", val: 55 },
                          { label: "T3", val: 40 },
                          { label: "T4", val: 75 },
                          { label: "T5", val: 90, primary: true }
                        ].map((item, index) => (
                          <div key={index} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "15%", height: "100%", justifyContent: "flex-end" }}>
                            <div style={{
                              height: `${item.val}%`,
                              width: "100%",
                              backgroundColor: item.primary ? "#f05a5b" : "#e2e8f0",
                              borderRadius: "4px",
                              transition: "all 0.3s"
                            }}></div>
                            <span style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "6px" }}>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recent Orders Card */}
                  <div style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "20px",
                    padding: "1.5rem",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
                    border: "1px solid #f1f5f9"
                  }}>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#1e293b", margin: "0 0 1rem" }}>Đơn hàng gần đây</h3>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                        <thead>
                          <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                            <th style={{ padding: "0.75rem 1rem", fontSize: "0.82rem", fontWeight: "600", color: "#64748b" }}>Mã đơn</th>
                            <th style={{ padding: "0.75rem 1rem", fontSize: "0.82rem", fontWeight: "600", color: "#64748b" }}>Khách hàng</th>
                            <th style={{ padding: "0.75rem 1rem", fontSize: "0.82rem", fontWeight: "600", color: "#64748b" }}>Tổng cộng</th>
                            <th style={{ padding: "0.75rem 1rem", fontSize: "0.82rem", fontWeight: "600", color: "#64748b" }}>Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.length > 0 ? (
                            orders.slice(0, 5).map((order, index) => (
                              <tr key={index} style={{ borderBottom: "1px solid #f8fafc" }}>
                                <td style={{ padding: "0.75rem 1rem", fontSize: "0.88rem", fontWeight: "600", color: "#f05a5b" }}>
                                  #{order.orderID || order.id || `ORD-${1000 + index}`}
                                </td>
                                <td style={{ padding: "0.75rem 1rem", fontSize: "0.88rem", color: "#1e293b" }}>
                                  {order.customerName || order.fullName || "Khách mua hàng"}
                                </td>
                                <td style={{ padding: "0.75rem 1rem", fontSize: "0.88rem", fontWeight: "600", color: "#1e293b" }}>
                                  {(order.totalAmount || order.totalPrice || 0).toLocaleString("vi-VN")} ₫
                                </td>
                                <td style={{ padding: "0.75rem 1rem" }}>
                                  <span style={{
                                    fontSize: "0.75rem",
                                    padding: "3px 8px",
                                    borderRadius: "9999px",
                                    fontWeight: "600",
                                    backgroundColor: "#d1fae5",
                                    color: "#065f46"
                                  }}>
                                    Đã hoàn thành
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" style={{ padding: "2rem", textAlign: "center", color: "#94a3b8", fontSize: "0.9rem" }}>
                                Chưa có đơn hàng nào được ghi nhận.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Right Side: Action Suggestions & Best Sellers */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {/* Action Suggestions */}
                  <div style={{
                    background: "linear-gradient(135deg, #fdf8f6 0%, #f1f5f9 100%)",
                    borderRadius: "20px",
                    padding: "1.5rem",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
                    border: "1px solid #f1f5f9"
                  }}>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#1e293b", margin: "0 0 1.25rem" }}>Gợi ý hành động</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        backgroundColor: "#ffffff",
                        padding: "1rem",
                        borderRadius: "14px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                      }}>
                        <div style={{
                          backgroundColor: "#fef2f2",
                          color: "#ef4444",
                          borderRadius: "10px",
                          width: "36px",
                          height: "36px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          <Store size={20} />
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: "700", fontSize: "0.88rem", color: "#1e293b" }}>Nhập thêm hàng</p>
                          <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748b" }}>{products.filter(p => p.stock === 0).length} sản phẩm đang hết</p>
                        </div>
                      </div>

                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        backgroundColor: "#ffffff",
                        padding: "1rem",
                        borderRadius: "14px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                      }}>
                        <div style={{
                          backgroundColor: "#f5f3ff",
                          color: "#8b5cf6",
                          borderRadius: "10px",
                          width: "36px",
                          height: "36px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          <Megaphone size={20} />
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: "700", fontSize: "0.88rem", color: "#1e293b" }}>Tạo khuyến mãi mới</p>
                          <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748b" }}>Tăng doanh số cuối tuần</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Best Selling Products Preview */}
                  <div style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "20px",
                    padding: "1.5rem",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
                    border: "1px solid #f1f5f9"
                  }}>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#1e293b", margin: "0 0 1rem" }}>Sản phẩm của cửa hàng</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {products.length > 0 ? (
                        products.slice(0, 3).map((prod) => (
                          <div key={prod.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", borderBottom: "1px solid #f8fafc", paddingBottom: "0.5rem" }}>
                            <img
                              src={prod.image || "https://via.placeholder.com/40"}
                              alt={prod.name}
                              style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "8px", backgroundColor: "#f8fafc" }}
                              onError={(e) => { e.target.src = "https://via.placeholder.com/40"; }}
                            />
                            <div style={{ flex: 1, overflow: "hidden" }}>
                              <p style={{ margin: 0, fontWeight: "600", fontSize: "0.85rem", color: "#1e293b", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                {prod.name}
                              </p>
                              <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>
                                {prod.price.toLocaleString("vi-VN")} ₫ • Tồn: {prod.stock}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p style={{ margin: 0, fontSize: "0.85rem", color: "#94a3b8", textAlign: "center", padding: "1rem" }}>
                          Chưa có sản phẩm nào.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : activeCategory === "spa" ? (
              <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: "1.5rem" }}>
                {/* Left: Lịch hẹn Spa gần đây */}
                <div style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "16px",
                  padding: "1.5rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  border: "1px solid #f1f5f9"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#1e293b", margin: 0 }}>Lịch hẹn Spa gần đây</h3>
                    <div style={{ display: "flex", gap: "1rem", color: "#64748b", cursor: "pointer" }}>
                      <Filter size={20} />
                      <MoreVertical size={20} />
                    </div>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                      <thead>
                        <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                          <th style={{ padding: "0.75rem 0", fontSize: "0.85rem", fontWeight: "600", color: "#64748b" }}>Thú cưng</th>
                          <th style={{ padding: "0.75rem 0", fontSize: "0.85rem", fontWeight: "600", color: "#64748b" }}>Chủ nuôi</th>
                          <th style={{ padding: "0.75rem 0", fontSize: "0.85rem", fontWeight: "600", color: "#64748b" }}>Ngày hẹn</th>
                          <th style={{ padding: "0.75rem 0", fontSize: "0.85rem", fontWeight: "600", color: "#64748b" }}>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const spaApps = appointments.filter(a => a.category === "spa").slice(0, 6);
                          if (spaApps.length === 0) {
                            return (
                              <tr>
                                <td colSpan="4" style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>
                                  <Sparkles size={36} style={{ marginBottom: "0.5rem", opacity: 0.3 }} />
                                  <p style={{ margin: 0 }}>Chưa có lịch hẹn spa nào.</p>
                                </td>
                              </tr>
                            );
                          }
                          return spaApps.map((app, index) => (
                            <tr key={app.id} style={{ borderBottom: index < spaApps.length - 1 ? "1px dashed #e2e8f0" : "none" }}>
                              <td style={{ padding: "0.85rem 0", fontWeight: "700", fontSize: "0.9rem", color: "#1e293b" }}>{app.petName}</td>
                              <td style={{ padding: "0.85rem 0", fontSize: "0.85rem", color: "#475569" }}>{app.ownerName}</td>
                              <td style={{ padding: "0.85rem 0", fontSize: "0.85rem", color: "#475569" }}>
                                <div>{app.date}</div>
                                <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{app.time}</div>
                              </td>
                              <td style={{ padding: "0.85rem 0" }}>
                                <span style={{
                                  fontSize: "0.78rem",
                                  padding: "3px 10px",
                                  borderRadius: "9999px",
                                  fontWeight: "600",
                                  backgroundColor:
                                    app.status === "completed" ? "#d1fae5" :
                                    app.status === "pending" ? "#fef3c7" :
                                    app.status === "approved" ? "#dbeafe" : "#fee2e2",
                                  color:
                                    app.status === "completed" ? "#065f46" :
                                    app.status === "pending" ? "#92400e" :
                                    app.status === "approved" ? "#1e40af" : "#991b1b"
                                }}>
                                  {app.status === "completed" ? "Đã xong" :
                                   app.status === "pending" ? "Đang chờ" :
                                   app.status === "approved" ? "Đã duyệt" : "Đã hủy"}
                                </span>
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right: Gói dịch vụ Spa & Hành động nhanh */}
                <div style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "16px",
                  padding: "1.5rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  border: "1px solid #f1f5f9",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem"
                }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Sparkles size={20} color="#7066e0" /> Gói dịch vụ Spa
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {packages.filter(p => p.type === "spa").slice(0, 4).map(pkg => (
                      <div key={pkg.id} style={{ border: "1px solid #f1f5f9", borderRadius: "12px", padding: "0.85rem 1rem" }}>
                        <p style={{ margin: 0, fontWeight: "700", fontSize: "0.88rem", color: "#1e293b" }}>{pkg.name}</p>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.35rem" }}>
                          <span style={{ fontSize: "0.78rem", color: "#64748b" }}>{pkg.duration}</span>
                          <span style={{ fontSize: "0.88rem", fontWeight: "700", color: "#7066e0" }}>
                            {pkg.price.toLocaleString("vi-VN")} ₫
                          </span>
                        </div>
                      </div>
                    ))}
                    {packages.filter(p => p.type === "spa").length === 0 && (
                      <p style={{ color: "#94a3b8", fontSize: "0.85rem", textAlign: "center", padding: "1rem 0" }}>Chưa có gói dịch vụ spa.</p>
                    )}
                  </div>
                  <button
                    onClick={() => setCurrentTab("packages")}
                    style={{ width: "100%", padding: "0.75rem", backgroundColor: "transparent", border: "none", color: "#7066e0", fontWeight: "600", fontSize: "0.9rem", cursor: "pointer", borderTop: "1px solid #f1f5f9", marginTop: "auto" }}
                  >
                    Quản lý gói dịch vụ →
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: "1.5rem" }}>
                {/* Left: Danh sách bệnh nhân gần đây từ DB */}
                <div style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "16px",
                  padding: "1.5rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  border: "1px solid #f1f5f9"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#1e293b", margin: 0 }}>Bệnh nhân gần đây</h3>
                    <div style={{ display: "flex", gap: "1rem", color: "#64748b", cursor: "pointer" }}>
                      <Filter size={20} />
                      <MoreVertical size={20} />
                    </div>
                  </div>

                  {isLoadingPatients ? (
                    <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
                      <div style={{ border: "3px solid #f3f3f3", borderTop: "3px solid var(--primary)", borderRadius: "50%", width: "30px", height: "30px", animation: "spin 1s linear infinite", margin: "0 auto 1rem" }}></div>
                      Đang tải dữ liệu từ cơ sở dữ liệu...
                    </div>
                  ) : patients.length > 0 ? (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                        <thead>
                          <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                            <th style={{ padding: "0.75rem 0", fontSize: "0.85rem", fontWeight: "600", color: "#64748b" }}>Thú cưng</th>
                            <th style={{ padding: "0.75rem 0", fontSize: "0.85rem", fontWeight: "600", color: "#64748b" }}>Giống loài</th>
                            <th style={{ padding: "0.75rem 0", fontSize: "0.85rem", fontWeight: "600", color: "#64748b" }}>Trạng thái</th>
                            <th style={{ padding: "0.75rem 0", fontSize: "0.85rem", fontWeight: "600", color: "#64748b" }}>Hồ sơ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {patients.slice(0, 6).map((pt, index) => (
                            <tr key={pt.id} style={{ borderBottom: index < Math.min(patients.length, 6) - 1 ? "1px dashed #e2e8f0" : "none" }}>
                              <td style={{ padding: "1rem 0" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                  <img
                                    src={pt.image || "https://via.placeholder.com/40"}
                                    alt={pt.name}
                                    style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
                                    onError={(e) => { e.target.src = "https://via.placeholder.com/40"; }}
                                  />
                                  <div>
                                    <p style={{ margin: 0, fontWeight: "700", fontSize: "0.9rem", color: "#1e293b" }}>{pt.name}</p>
                                    <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748b" }}>{pt.categoryName}</p>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: "1rem 0" }}>
                                <span style={{ fontSize: "0.85rem", color: "#475569" }}>{pt.breed}</span>
                              </td>
                              <td style={{ padding: "1rem 0" }}>
                                <span style={{
                                  fontSize: "0.8rem",
                                  padding: "4px 10px",
                                  borderRadius: "20px",
                                  fontWeight: "600",
                                  backgroundColor: pt.status === "Available" ? "#d1fae5" : pt.status === "Adopted" ? "#dbeafe" : "#fef3c7",
                                  color: pt.status === "Available" ? "#065f46" : pt.status === "Adopted" ? "#1e40af" : "#92400e"
                                }}>
                                  {pt.status}
                                </span>
                              </td>
                              <td style={{ padding: "1rem 0" }}>
                                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                                  {pt.healthRecords?.length || 0} bệnh án
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
                      <Clipboard size={40} style={{ marginBottom: "0.5rem", opacity: 0.3 }} />
                      <p>Chưa có dữ liệu bệnh nhân trong hệ thống.</p>
                    </div>
                  )}
                </div>

                {/* Right: Hồ sơ sức khỏe gần đây từ DB */}
                <div style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "16px",
                  padding: "1.5rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  border: "1px solid #f1f5f9"
                }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#1e293b", margin: "0 0 1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Clipboard size={20} color="#b45309" /> Hồ sơ sức khỏe
                  </h3>

                  <div style={{ position: "relative", marginBottom: "1.2rem" }}>
                    <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input type="text" placeholder="Tìm kiếm tên..." value={ehrSearch} onChange={(e) => setEhrSearch(e.target.value)} style={{ width: "100%", padding: "0.6rem 1rem 0.6rem 2.2rem", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.85rem", outline: "none", color: "#475569" }} />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {patients
                      .filter(pt => !ehrSearch || (pt.name || "").toLowerCase().includes(ehrSearch.toLowerCase()))
                      .slice(0, 4).map((pt) => {
                        const lastRecord = pt.healthRecords?.[0];
                        return (
                          <div key={pt.id} style={{ border: "1px solid #f1f5f9", borderRadius: "12px", padding: "1rem", position: "relative", cursor: "pointer", transition: "all 0.2s" }} onClick={() => { setSelectedPatient(pt); setCurrentTab("ehr"); }} className="hover-scale">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                              <p style={{ margin: 0, fontWeight: "700", fontSize: "0.9rem", color: "#1e293b" }}>{pt.name} <span style={{ fontWeight: "500", color: "#64748b" }}>({pt.breed})</span></p>
                              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>ID: PT-{pt.id}</span>
                            </div>
                            <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.8rem", color: "#64748b" }}>
                              {lastRecord ? `Lần khám cuối: ${new Date(lastRecord.createdAt).toLocaleDateString("vi-VN")}` : "Chưa có bệnh án"}
                            </p>
                            <a style={{ color: "#b45309", fontSize: "0.85rem", fontWeight: "600", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                              Xem chi tiết <span>→</span>
                            </a>
                          </div>
                        );
                      })}
                  </div>

                  <button onClick={() => setCurrentTab("ehr")} style={{ width: "100%", padding: "0.75rem", backgroundColor: "transparent", border: "none", color: "#b45309", fontWeight: "600", fontSize: "0.9rem", marginTop: "1rem", cursor: "pointer", borderTop: "1px solid #f1f5f9" }}>
                    Xem tất cả hồ sơ
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SHOP WORKSPACE - PRODUCTS TAB */}
        {activeCategory === "shop" && currentTab === "products" && (() => {
          const filteredProducts = products.filter(prod => {
            const matchesSearch = prod.name.toLowerCase().includes(productSearch.toLowerCase());
            // Map category matching dynamically
            const catName = prod.category === "Khác" && prod.categoryID && categoriesList.find(c => (c.categoryID || c.id) === prod.categoryID)
              ? (categoriesList.find(c => (c.categoryID || c.id) === prod.categoryID).categoryName || categoriesList.find(c => (c.categoryID || c.id) === prod.categoryID).name)
              : prod.category;
            const matchesCategory = !productCategoryFilter || catName === productCategoryFilter;
            return matchesSearch && matchesCategory;
          });

          const outOfStockCount = products.filter(p => p.stock === 0).length;

          return (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h1 style={{ fontSize: "2.25rem", fontWeight: "800", color: "#1e293b", margin: 0 }}>
                    Sản phẩm
                  </h1>
                  <p style={{ color: "#64748b", marginTop: "0.25rem", fontSize: "0.95rem" }}>
                    Quản lý kho hàng, giá cả và trạng thái sản phẩm.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                  <button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      padding: "0.6rem 1.25rem",
                      borderRadius: "9999px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#ffffff",
                      color: "#1e293b",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    <Filter size={18} /> Lọc
                  </button>
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setProductForm({ name: "", category: "Food", price: "", stock: "", image: "", desc: "" });
                      setShowProductModal(true);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      padding: "0.6rem 1.25rem",
                      borderRadius: "9999px",
                      border: "none",
                      backgroundColor: "#f05a5b",
                      color: "#ffffff",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    <span style={{ fontSize: "16px", fontWeight: "bold" }}>+</span> Thêm sản phẩm mới
                  </button>
                </div>
              </div>

              {/* Top KPIs section */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
                {/* KPI 1 */}
                <div style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "20px",
                  padding: "1.5rem",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)",
                  position: "relative",
                  border: "1px solid #f1f5f9"
                }}>
                  <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0, fontWeight: "600" }}>Doanh thu tháng này</p>
                  <h2 style={{ fontSize: "1.85rem", fontWeight: "800", color: "#1e293b", margin: "0.5rem 0" }}>
                    {(monthlyRevenue / 1000000).toFixed(1)}M <span style={{ fontSize: "1rem", fontWeight: "600", color: "#64748b" }}>VNĐ</span>
                  </h2>
                  <div style={{ fontSize: "0.82rem", color: "#f05a5b", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ fontSize: "14px" }}>↗</span> +12.5% so với tháng trước
                  </div>
                  <div style={{ position: "absolute", right: "1.5rem", top: "1.5rem", opacity: 0.15 }}>
                    <Wallet size={48} color="#64748b" />
                  </div>
                </div>

                {/* KPI 2 */}
                <div style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "20px",
                  padding: "1.5rem",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)",
                  position: "relative",
                  border: "1px solid #f1f5f9"
                }}>
                  <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0, fontWeight: "600" }}>Đơn hàng mới</p>
                  <h2 style={{ fontSize: "1.85rem", fontWeight: "800", color: "#1e293b", margin: "0.5rem 0" }}>
                    {totalOrdersSold || 128} <span style={{ fontSize: "1rem", fontWeight: "600", color: "#64748b" }}>đơn</span>
                  </h2>
                  <div style={{ fontSize: "0.82rem", color: "#f05a5b", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ fontSize: "14px" }}>↗</span> +5% so với tháng trước
                  </div>
                  <div style={{ position: "absolute", right: "1.5rem", top: "1.5rem", opacity: 0.15 }}>
                    <ShoppingBag size={48} color="#64748b" />
                  </div>
                </div>

                {/* KPI 3 */}
                <div style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "20px",
                  padding: "1.5rem",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)",
                  position: "relative",
                  border: "1px solid #f1f5f9"
                }}>
                  <p style={{ color: "#64748b", fontSize: "0.85rem", margin: 0, fontWeight: "600" }}>Sản phẩm hết hàng</p>
                  <h2 style={{ fontSize: "1.85rem", fontWeight: "800", color: "#1e293b", margin: "0.5rem 0" }}>
                    {outOfStockCount || 12} <span style={{ fontSize: "1rem", fontWeight: "600", color: "#64748b" }}>mục</span>
                  </h2>
                  <div style={{ fontSize: "0.82rem", color: "#b45309", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                    <AlertTriangle size={14} style={{ color: "#d97706" }} /> Cần nhập hàng ngay
                  </div>
                  <div style={{ position: "absolute", right: "1.5rem", top: "1.5rem", opacity: 0.15 }}>
                    <AlertTriangle size={48} color="#ef4444" />
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "1.5rem" }}>
                {/* Left Side: Search, Filters & Products Table */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {/* Search and Category tags row */}
                  <div style={{ display: "flex", alignItems: "center", justifyItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                    <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
                      <Search size={18} style={{
                        position: "absolute",
                        left: "1rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#94a3b8"
                      }} />
                      <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "0.6rem 1rem 0.6rem 2.5rem",
                          borderRadius: "9999px",
                          border: "1px solid #e2e8f0",
                          fontSize: "0.9rem",
                          backgroundColor: "#ffffff",
                          outline: "none"
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      {["Thức ăn", "Phụ kiện", "Dịch vụ"].map(cat => {
                        const isSelected = productCategoryFilter === cat;
                        return (
                          <button
                            key={cat}
                            onClick={() => setProductCategoryFilter(isSelected ? "" : cat)}
                            style={{
                              padding: "0.5rem 1rem",
                              borderRadius: "9999px",
                              border: "none",
                              backgroundColor: isSelected ? "#e2e8f0" : "#f1f5f9",
                              color: isSelected ? "#1e293b" : "#475569",
                              fontSize: "0.85rem",
                              fontWeight: "600",
                              cursor: "pointer",
                              transition: "all 0.2s"
                            }}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Table Card */}
                  <div style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "20px",
                    overflow: "hidden",
                    border: "1px solid #f1f5f9",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)"
                  }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                          <th style={{ padding: "1rem 1.25rem", fontSize: "0.85rem", fontWeight: "600", color: "#64748b" }}>Sản phẩm</th>
                          <th style={{ padding: "1rem 1.25rem", fontSize: "0.85rem", fontWeight: "600", color: "#64748b" }}>Danh mục</th>
                          <th style={{ padding: "1rem 1.25rem", fontSize: "0.85rem", fontWeight: "600", color: "#64748b" }}>Giá (VNĐ)</th>
                          <th style={{ padding: "1rem 1.25rem", fontSize: "0.85rem", fontWeight: "600", color: "#64748b" }}>Tổn kho</th>
                          <th style={{ padding: "1rem 1.25rem", fontSize: "0.85rem", fontWeight: "600", color: "#64748b" }}>Trạng thái</th>
                          <th style={{ padding: "1rem 1.25rem", fontSize: "0.85rem", fontWeight: "600", color: "#64748b", textAlign: "center" }}>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.length > 0 ? (
                          filteredProducts.map((prod) => {
                            const catName = prod.category === "Khác" && prod.categoryID && categoriesList.find(c => (c.categoryID || c.id) === prod.categoryID)
                              ? (categoriesList.find(c => (c.categoryID || c.id) === prod.categoryID).categoryName || categoriesList.find(c => (c.categoryID || c.id) === prod.categoryID).name)
                              : prod.category;

                            let statusText = "Đang bán";
                            let statusBg = "#e0e7ff";
                            let statusColor = "#6366f1";

                            if (prod.stock === 0) {
                              statusText = "Hết hàng";
                              statusBg = "#fee2e2";
                              statusColor = "#f87171";
                            } else if (!prod.isActive) {
                              statusText = "Tạm ngưng";
                              statusBg = "#f1f5f9";
                              statusColor = "#94a3b8";
                            }

                            return (
                              <tr key={prod.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                                <td style={{ padding: "0.75rem 1.25rem" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                    <img
                                      src={prod.image || "https://via.placeholder.com/50"}
                                      alt={prod.name}
                                      style={{ width: "45px", height: "45px", objectFit: "cover", borderRadius: "10px", backgroundColor: "#f8fafc" }}
                                      onError={(e) => { e.target.src = "https://via.placeholder.com/50"; }}
                                    />
                                    <span style={{ fontWeight: "600", color: "#1e293b", fontSize: "0.9rem" }}>{prod.name}</span>
                                  </div>
                                </td>
                                <td style={{ padding: "0.75rem 1.25rem", fontSize: "0.88rem", color: "#64748b" }}>
                                  {catName}
                                </td>
                                <td style={{ padding: "0.75rem 1.25rem", fontWeight: "600", color: "#1e293b", fontSize: "0.9rem" }}>
                                  {prod.price.toLocaleString("vi-VN")}
                                </td>
                                <td style={{ padding: "0.75rem 1.25rem", fontSize: "0.9rem", color: prod.stock === 0 ? "#f87171" : "#1e293b", fontWeight: "600" }}>
                                  {prod.stock !== null && prod.stock !== undefined ? prod.stock : "-"}
                                </td>
                                <td style={{ padding: "0.75rem 1.25rem" }}>
                                  <span style={{
                                    fontSize: "0.78rem",
                                    padding: "4px 10px",
                                    borderRadius: "9999px",
                                    fontWeight: "600",
                                    backgroundColor: statusBg,
                                    color: statusColor,
                                    display: "inline-block"
                                  }}>
                                    {statusText}
                                  </span>
                                </td>
                                <td style={{ padding: "0.75rem 1.25rem", textAlign: "center" }}>
                                  <div style={{ display: "flex", gap: "0.4rem", justifyContent: "center" }}>
                                    <button
                                      onClick={() => handleEditProduct(prod)}
                                      style={{ padding: "6px", backgroundColor: "#f1f5f9", border: "none", borderRadius: "8px", color: "#64748b", cursor: "pointer" }}
                                    >
                                      <Edit size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProduct(prod.id)}
                                      style={{ padding: "6px", backgroundColor: "#fee2e2", border: "none", borderRadius: "8px", color: "#ef4444", cursor: "pointer" }}
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="6" style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>
                              Không tìm thấy sản phẩm nào khớp với bộ lọc.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>

                    {/* Pagination Footer */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "1rem 1.5rem",
                      borderTop: "1px solid #f1f5f9",
                      fontSize: "0.85rem",
                      color: "#64748b"
                    }}>
                      <span>Hiển thị 1-{filteredProducts.length} trong {products.length} sản phẩm</span>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button style={{
                          padding: "0.35rem 0.6rem",
                          border: "1px solid #e2e8f0",
                          borderRadius: "6px",
                          backgroundColor: "#ffffff",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center"
                        }}>
                          <ChevronLeft size={16} />
                        </button>
                        <button style={{
                          padding: "0.35rem 0.6rem",
                          border: "1px solid #e2e8f0",
                          borderRadius: "6px",
                          backgroundColor: "#ffffff",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center"
                        }}>
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Charts & Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  {/* Revenue Chart Card */}
                  <div style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "20px",
                    padding: "1.5rem",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
                    border: "1px solid #f1f5f9"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                      <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#1e293b", margin: 0 }}>Biểu đồ doanh thu</h3>
                      <MoreVertical size={20} style={{ color: "#94a3b8", cursor: "pointer" }} />
                    </div>

                    <div style={{ display: "flex", gap: "1rem", height: "180px", position: "relative" }}>
                      {/* Y-Axis scale labels */}
                      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", color: "#94a3b8", fontSize: "0.75rem", paddingBottom: "20px" }}>
                        <span>50M</span>
                        <span>25M</span>
                        <span>0</span>
                      </div>

                      {/* Bar columns */}
                      <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-end", flex: 1, paddingBottom: "20px", borderBottom: "1px solid #f1f5f9" }}>
                        {[
                          { label: "T1", val: 35 },
                          { label: "T2", val: 55 },
                          { label: "T3", val: 40 },
                          { label: "T4", val: 75 },
                          { label: "T5", val: 90, primary: true }
                        ].map((item, index) => (
                          <div key={index} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "15%", height: "100%", justifyContent: "flex-end" }}>
                            <div style={{
                              height: `${item.val}%`,
                              width: "100%",
                              backgroundColor: item.primary ? "#f05a5b" : "#e2e8f0",
                              borderRadius: "4px",
                              transition: "all 0.3s"
                            }}></div>
                            <span style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "6px" }}>{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Suggestion Card */}
                  <div style={{
                    background: "linear-gradient(135deg, #fdf8f6 0%, #f1f5f9 100%)",
                    borderRadius: "20px",
                    padding: "1.5rem",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
                    border: "1px solid #f1f5f9"
                  }}>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#1e293b", margin: "0 0 1.25rem" }}>Gợi ý hành động</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      {/* Suggestion 1 */}
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        backgroundColor: "#ffffff",
                        padding: "1rem",
                        borderRadius: "14px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                      }}>
                        <div style={{
                          backgroundColor: "#fef2f2",
                          color: "#ef4444",
                          borderRadius: "10px",
                          width: "36px",
                          height: "36px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          <Store size={20} />
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: "700", fontSize: "0.88rem", color: "#1e293b" }}>Nhập thêm hàng</p>
                          <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748b" }}>{outOfStockCount || 12} sản phẩm đang hết</p>
                        </div>
                      </div>

                      {/* Suggestion 2 */}
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        backgroundColor: "#ffffff",
                        padding: "1rem",
                        borderRadius: "14px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
                      }}>
                        <div style={{
                          backgroundColor: "#f5f3ff",
                          color: "#8b5cf6",
                          borderRadius: "10px",
                          width: "36px",
                          height: "36px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          <Megaphone size={20} />
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: "700", fontSize: "0.88rem", color: "#1e293b" }}>Tạo khuyến mãi mới</p>
                          <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748b" }}>Tăng doanh số cuối tuần</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* SHOP WORKSPACE - REVENUE STATISTICS TAB */}
        {activeCategory === "shop" && currentTab === "revenue" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", width: "100%" }}>
            {/* Header with Export Button */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h1 style={{ fontSize: "2.25rem", fontWeight: "800", color: "#1e293b", margin: 0 }}>
                  Thống kê Doanh thu
                </h1>
                <p style={{ color: "#64748b", marginTop: "0.25rem", fontSize: "0.95rem" }}>
                  Số liệu chi tiết về kết quả kinh doanh, báo cáo giao dịch và tăng trưởng theo tháng.
                </p>
              </div>
              <button
                onClick={handleExportCSV}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.6rem 1.25rem",
                  borderRadius: "9999px",
                  border: "none",
                  backgroundColor: "#f05a5b",
                  color: "#ffffff",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                <Download size={16} /> Xuất báo cáo CSV
              </button>
            </div>

            {/* Filter Selector Row */}
            <div style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center",
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "1rem 1.5rem",
              border: "1px solid #f1f5f9"
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "600" }}>Khoảng thời gian</span>
                <select style={{
                  padding: "0.4rem 0.8rem",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#ffffff",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  color: "#1e293b"
                }}>
                  <option>6 tháng gần nhất</option>
                  <option>Tháng này</option>
                  <option>Quý này</option>
                  <option>Năm nay</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "600" }}>Loại báo cáo</span>
                <select style={{
                  padding: "0.4rem 0.8rem",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#ffffff",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  color: "#1e293b"
                }}>
                  <option>Doanh số tổng hợp</option>
                  <option>Phân tích theo danh mục</option>
                </select>
              </div>
            </div>

            {/* Chart container */}
            <div style={{
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              padding: "2rem",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)",
              border: "1px solid #f1f5f9"
            }}>
              <h3 style={{ fontSize: "1.10rem", fontWeight: "700", marginBottom: "2.5rem", color: "#1e293b" }}>Tăng trưởng doanh thu 2026</h3>

              {/* Sleek Custom Animated SVG/CSS Bar Chart */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                {/* Visual Chart Bars */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: "240px", paddingBottom: "1rem", borderBottom: "2px solid #f1f5f9", position: "relative" }}>
                  {/* Grid Lines */}
                  <div style={{ position: "absolute", left: 0, right: 0, top: "25%", borderBottom: "1px dashed #f1f5f9", zIndex: 1 }}></div>
                  <div style={{ position: "absolute", left: 0, right: 0, top: "50%", borderBottom: "1px dashed #f1f5f9", zIndex: 1 }}></div>
                  <div style={{ position: "absolute", left: 0, right: 0, top: "75%", borderBottom: "1px dashed #f1f5f9", zIndex: 1 }}></div>

                  {/* Bars */}
                  {[
                    { month: "Tháng 1", val: 85, display: "85M" },
                    { month: "Tháng 2", val: 110, display: "110M" },
                    { month: "Tháng 3", val: 95, display: "95M" },
                    { month: "Tháng 4", val: 130, display: "130M" },
                    { month: "Tháng 5", val: 142.5, display: "142.5M", primary: true },
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "15%", zIndex: 2 }}>
                      <div
                        style={{
                          height: `${(item.val / 150) * 100}%`,
                          width: "100%",
                          backgroundColor: item.primary ? "#f05a5b" : "#e2e8f0",
                          borderRadius: "8px 8px 0 0",
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "center",
                          paddingTop: "6px",
                          color: item.primary ? "white" : "#475569",
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                          transition: "height 1s ease",
                          cursor: "pointer",
                          boxShadow: "0 4px 6px rgba(0,0,0,0.02)"
                        }}
                        className="hover-scale"
                      >
                        {item.display}
                      </div>
                      <span style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "8px", fontWeight: "600" }}>{item.month}</span>
                    </div>
                  ))}
                </div>

                {/* Summary Row */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginTop: "1rem", textAlign: "center" }}>
                  <div style={{ padding: "1rem", backgroundColor: "#f8fafc", borderRadius: "16px", border: "1px solid #f1f5f9" }}>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>Doanh thu quý gần nhất</p>
                    <p style={{ margin: "4px 0 0", fontSize: "1.3rem", fontWeight: "bold", color: "#1e293b" }}>367.500.000 ₫</p>
                  </div>
                  <div style={{ padding: "1rem", backgroundColor: "#f8fafc", borderRadius: "16px", border: "1px solid #f1f5f9" }}>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>Đơn hàng bán ra (Tháng 5)</p>
                    <p style={{ margin: "4px 0 0", fontSize: "1.3rem", fontWeight: "bold", color: "#1e293b" }}>380 đơn</p>
                  </div>
                  <div style={{ padding: "1rem", backgroundColor: "#f8fafc", borderRadius: "16px", border: "1px solid #f1f5f9" }}>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>Doanh thu trung bình tháng</p>
                    <p style={{ margin: "4px 0 0", fontSize: "1.3rem", fontWeight: "bold", color: "#1e293b" }}>112.500.000 ₫</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Transaction Report Table */}
            <div style={{
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              padding: "1.5rem",
              border: "1px solid #f1f5f9",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)"
            }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#1e293b", margin: "0 0 1rem" }}>Báo cáo chi tiết giao dịch doanh thu</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                      <th style={{ padding: "1rem", fontSize: "0.85rem", fontWeight: "600", color: "#64748b" }}>Mã đơn hàng</th>
                      <th style={{ padding: "1rem", fontSize: "0.85rem", fontWeight: "600", color: "#64748b" }}>Ngày giao dịch</th>
                      <th style={{ padding: "1rem", fontSize: "0.85rem", fontWeight: "600", color: "#64748b" }}>Khách hàng</th>
                      <th style={{ padding: "1rem", fontSize: "0.85rem", fontWeight: "600", color: "#64748b" }}>Doanh thu thu về</th>
                      <th style={{ padding: "1rem", fontSize: "0.85rem", fontWeight: "600", color: "#64748b" }}>Trạng thái thanh toán</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length > 0 ? (
                      orders.map((o, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid #f8fafc" }}>
                          <td style={{ padding: "1rem", fontSize: "0.88rem", fontWeight: "600", color: "#f05a5b" }}>
                            #{o.orderID || o.id}
                          </td>
                          <td style={{ padding: "1rem", fontSize: "0.88rem", color: "#64748b" }}>
                            {o.orderDate || new Date(o.createdAt).toLocaleDateString("vi-VN")}
                          </td>
                          <td style={{ padding: "1rem", fontSize: "0.88rem", color: "#1e293b" }}>
                            {o.customerName || o.fullName || "Khách mua hàng"}
                          </td>
                          <td style={{ padding: "1rem", fontSize: "0.88rem", fontWeight: "600", color: "#1e293b" }}>
                            {(o.totalAmount || o.totalPrice || 0).toLocaleString("vi-VN")} ₫
                          </td>
                          <td style={{ padding: "1rem" }}>
                            <span style={{
                              fontSize: "0.78rem",
                              padding: "4px 10px",
                              borderRadius: "9999px",
                              fontWeight: "600",
                              backgroundColor: "#d1fae5",
                              color: "#065f46",
                              display: "inline-block"
                            }}>
                              Đã nhận thanh toán
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      // Realistic fallback records
                      [
                        { id: "ORD-1001", date: "2026-05-25", customer: "Nguyễn Văn Hùng", total: 450000 },
                        { id: "ORD-1002", date: "2026-05-26", customer: "Trần Thị Lan", total: 850000 },
                        { id: "ORD-1003", date: "2026-05-27", customer: "Lê Minh Tuấn", total: 350000 }
                      ].map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid #f8fafc" }}>
                          <td style={{ padding: "1rem", fontSize: "0.88rem", fontWeight: "600", color: "#f05a5b" }}>
                            #{item.id}
                          </td>
                          <td style={{ padding: "1rem", fontSize: "0.88rem", color: "#64748b" }}>
                            {item.date}
                          </td>
                          <td style={{ padding: "1rem", fontSize: "0.88rem", color: "#1e293b" }}>
                            {item.customer}
                          </td>
                          <td style={{ padding: "1rem", fontSize: "0.88rem", fontWeight: "600", color: "#1e293b" }}>
                            {item.total.toLocaleString("vi-VN")} ₫
                          </td>
                          <td style={{ padding: "1rem" }}>
                            <span style={{
                              fontSize: "0.78rem",
                              padding: "4px 10px",
                              borderRadius: "9999px",
                              fontWeight: "600",
                              backgroundColor: "#d1fae5",
                              color: "#065f46",
                              display: "inline-block"
                            }}>
                              Đã nhận thanh toán
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VET WORKSPACE - APPOINTMENTS TAB */}
        {activeCategory === "vet" && currentTab === "appointments" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1rem" }}>
              <div>
                <h2 style={{ fontSize: "2rem", fontWeight: "800", color: "#1e293b", margin: 0 }}>
                  Quản lý lịch hẹn khám y tế
                </h2>
                <p style={{ color: "#64748b", marginTop: "0.5rem", fontSize: "1rem" }}>
                  Xem danh sách đặt chỗ của khách hàng và cập nhật tiến độ thực hiện dịch vụ.
                </p>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                {/* View Mode Toggle */}
                <div style={{ display: "flex", backgroundColor: "#e2e8f0", padding: "4px", borderRadius: "9999px" }}>
                  <button
                    onClick={() => setAppointmentViewMode("list")}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "9999px",
                      border: "none",
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      backgroundColor: appointmentViewMode === "list" ? "#ffffff" : "transparent",
                      color: appointmentViewMode === "list" ? "#1e293b" : "#64748b",
                      transition: "all 0.2s",
                      boxShadow: appointmentViewMode === "list" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                    }}
                  >
                    Danh sách
                  </button>
                  <button
                    onClick={() => setAppointmentViewMode("calendar")}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "9999px",
                      border: "none",
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      backgroundColor: appointmentViewMode === "calendar" ? "#ffffff" : "transparent",
                      color: appointmentViewMode === "calendar" ? "#1e293b" : "#64748b",
                      transition: "all 0.2s",
                      boxShadow: appointmentViewMode === "calendar" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                    }}
                  >
                    Lịch tháng
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
                  <Search size={16} style={{ position: "absolute", left: "12px", color: "#64748b" }} />
                  <input
                    type="text"
                    placeholder="Tìm tên thú cưng, chủ nuôi..."
                    value={aptSearchQuery}
                    onChange={(e) => setAptSearchQuery(e.target.value)}
                    style={{
                      padding: "0.6rem 1rem 0.6rem 2.2rem",
                      borderRadius: "9999px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#ffffff",
                      color: "#1e293b",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      outline: "none",
                      width: "220px",
                      transition: "all 0.2s"
                    }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Filter size={18} style={{ color: "#64748b" }} />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                      padding: "0.6rem 1.25rem",
                      borderRadius: "9999px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#ffffff",
                      color: "#1e293b",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      outline: "none"
                    }}
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Đang chờ (Pending)</option>
                    <option value="approved">Đã duyệt (Approved)</option>
                    <option value="completed">Đã xong (Completed)</option>
                    <option value="cancelled">Đã hủy (Cancelled)</option>
                  </select>
                </div>
                <button
                  onClick={() => handleCreateAppointment()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.6rem 1.25rem",
                    borderRadius: "9999px",
                    border: "none",
                    backgroundColor: "#f05a5b",
                    color: "white",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    boxShadow: "0 4px 6px rgba(240, 90, 91, 0.2)"
                  }}
                >
                  <Plus size={18} /> Tạo lịch hẹn mới
                </button>
              </div>
            </div>

            {appointmentViewMode === "calendar" ? (
              <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "1.5rem", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                {/* Calendar Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <button
                    onClick={() => navigateCalendarMonth(-1)}
                    style={{ padding: "0.5rem 1rem", backgroundColor: "#f1f5f9", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", color: "#475569", transition: "all 0.2s" }}
                  >
                    ◀ Tháng trước
                  </button>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#1e293b", margin: 0 }}>
                    Tháng {currentCalendarDate.getMonth() + 1} - {currentCalendarDate.getFullYear()}
                  </h3>
                  <button
                    onClick={() => navigateCalendarMonth(1)}
                    style={{ padding: "0.5rem 1rem", backgroundColor: "#f1f5f9", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", color: "#475569", transition: "all 0.2s" }}
                  >
                    Tháng sau ▶
                  </button>
                </div>

                {/* Calendar Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "1px", backgroundColor: "#e2e8f0", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
                  {/* Days of Week Header */}
                  {["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"].map((dayName, idx) => (
                    <div key={idx} style={{ backgroundColor: "#f8fafc", padding: "0.75rem", textAlign: "center", fontWeight: "bold", fontSize: "0.85rem", color: "#64748b" }}>
                      {dayName}
                    </div>
                  ))}

                  {/* Calendar Days */}
                  {getDaysInMonth(currentCalendarDate).map((dayObj, idx) => {
                    const dayApps = dayObj.dateStr
                      ? appointments.filter(app => {
                          if (app.date !== dayObj.dateStr) return false;
                          if (app.category !== "vet") return false;
                          if (statusFilter !== "all" && app.status !== statusFilter) return false;
                          const q = aptSearchQuery.toLowerCase().trim();
                          if (q) {
                            return (app.petName?.toLowerCase().includes(q) || app.ownerName?.toLowerCase().includes(q));
                          }
                          return true;
                        })
                      : [];

                    return (
                      <div
                        key={idx}
                        onClick={(e) => {
                          if (e.target === e.currentTarget && dayObj.dateStr) {
                            handleCreateAppointment(dayObj.dateStr);
                          }
                        }}
                        style={{
                          backgroundColor: dayObj.isCurrentMonth ? "#ffffff" : "#f8fafc",
                          minHeight: "110px",
                          padding: "0.5rem",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          cursor: dayObj.dateStr ? "pointer" : "default",
                          transition: "background-color 0.2s",
                          position: "relative"
                        }}
                        onMouseEnter={(e) => { if (dayObj.dateStr) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                        onMouseLeave={(e) => { if (dayObj.dateStr) e.currentTarget.style.backgroundColor = dayObj.isCurrentMonth ? '#ffffff' : '#f8fafc'; }}
                      >
                        {/* Day Number */}
                        <div style={{
                          alignSelf: "flex-end",
                          fontWeight: "bold",
                          fontSize: "0.9rem",
                          color: dayObj.isCurrentMonth ? "#1e293b" : "#94a3b8",
                          marginBottom: "0.25rem"
                        }}>
                          {dayObj.day}
                        </div>

                        {/* Day Apps Pills */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", flex: 1, overflowY: "auto", maxHeight: "75px" }}>
                          {dayApps.map(app => {
                            let pillBg = "#fef9c3";
                            let pillColor = "#a16207";
                            if (app.status === "approved") { pillBg = "#e0e7ff"; pillColor = "#4f46e5"; }
                            else if (app.status === "completed") { pillBg = "#d1fae5"; pillColor = "#059669"; }
                            else if (app.status === "cancelled") { pillBg = "#fee2e2"; pillColor = "#dc2626"; }

                            return (
                              <div
                                key={app.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditAppointment(app);
                                }}
                                style={{
                                  fontSize: "0.75rem",
                                  fontWeight: "700",
                                  padding: "3px 6px",
                                  borderRadius: "6px",
                                  backgroundColor: pillBg,
                                  color: pillColor,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  cursor: "pointer",
                                  borderLeft: `3px solid ${app.status === "pending" ? "#eab308" : app.status === "approved" ? "#6366f1" : app.status === "completed" ? "#10b981" : "#ef4444"}`
                                }}
                                title={`${app.petName} - ${app.time} (${app.type})`}
                              >
                                {app.time.split(" ")[0]} {app.petName}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* List */
              <div className="card" style={{ padding: 0, overflow: "hidden", border: "1px solid #e2e8f0", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr>
                      <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.85rem", fontWeight: "bold", color: "#64748b", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>Thú cưng & Chủ</th>
                      <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.85rem", fontWeight: "bold", color: "#64748b", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>Dịch vụ</th>
                      <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.85rem", fontWeight: "bold", color: "#64748b", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>Thời gian</th>
                      <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.85rem", fontWeight: "bold", color: "#64748b", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>Ghi chú</th>
                      <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.85rem", fontWeight: "bold", color: "#64748b", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>Trạng thái</th>
                      <th style={{ padding: "1.25rem 1.5rem", fontSize: "0.85rem", fontWeight: "bold", color: "#64748b", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc", textAlign: "center" }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments
                      .filter(app => app.category === "vet")
                      .filter(app => statusFilter === "all" || app.status === statusFilter)
                      .filter(app => {
                        const q = aptSearchQuery.toLowerCase().trim();
                        if (!q) return true;
                        return (app.petName?.toLowerCase().includes(q) || app.ownerName?.toLowerCase().includes(q));
                      })
                      .sort((a, b) => {
                        const weights = { pending: 1, completed: 2, cancelled: 3, approved: 4 };
                        return (weights[a.status] || 99) - (weights[b.status] || 99);
                      })
                      .map((app) => {
                        const pat = patients.find(p => p.name === app.petName) || {};
                        return (
                          <tr key={app.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background-color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <td style={{ padding: "1rem 1.5rem" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <img src={pat.image || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=40&q=80"} alt={app.petName} style={{ width: "45px", height: "45px", borderRadius: "50%", objectFit: "cover", border: "2px solid #f1f5f9" }} />
                                <div>
                                  <div style={{ fontWeight: "bold", color: "#1e293b", fontSize: "1rem" }}>{app.petName} {pat.breed ? `(${pat.breed.split(' ')[0]})` : ''}</div>
                                  <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "2px" }}>{app.ownerName}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: "1rem 1.5rem" }}>
                              <span style={{ fontSize: "0.85rem", padding: "6px 12px", borderRadius: "9999px", background: "#f1f5f9", fontWeight: "600", color: "#475569" }}>
                                {app.type}
                              </span>
                            </td>
                            <td style={{ padding: "1rem 1.5rem" }}>
                              <div style={{ fontWeight: "600", color: "#1e293b", fontSize: "0.95rem" }}>{app.time}</div>
                              <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "2px" }}>{app.date}</div>
                            </td>
                            <td style={{ padding: "1rem 1.5rem", fontSize: "0.85rem", color: "#475569" }}>{app.notes || "Không có ghi chú"}</td>
                            <td style={{ padding: "1rem 1.5rem" }}>
                              <span
                                style={{
                                  fontSize: "0.85rem",
                                  padding: "6px 12px",
                                  borderRadius: "9999px",
                                  fontWeight: "600",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                  backgroundColor: app.status === "pending" ? "#fef9c3" : app.status === "approved" ? "#e0e7ff" : app.status === "completed" ? "#d1fae5" : "#fee2e2",
                                  color: app.status === "pending" ? "#a16207" : app.status === "approved" ? "#4f46e5" : app.status === "completed" ? "#059669" : "#dc2626",
                                }}
                              >
                                <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: app.status === "pending" ? "#eab308" : app.status === "approved" ? "#6366f1" : app.status === "completed" ? "#10b981" : "#ef4444" }}></div>
                                {app.status === "pending" ? "Đang chờ" : app.status === "approved" ? "Đã duyệt" : app.status === "completed" ? "Đã xong" : "Đã hủy"}
                              </span>
                            </td>
                            <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>
                              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", alignItems: "center" }}>
                                {/* Quick Status Transitions */}
                                {(app.status === "pending" || app.status === "approved") && (
                                  <div style={{ display: "flex", gap: "0.4rem" }}>
                                    {app.status === "pending" && (
                                      <button
                                        onClick={() => handleUpdateAppointmentStatus(app.id, "approved")}
                                        style={{ padding: "6px 12px", fontSize: "0.8rem", backgroundColor: "#4f46e5", color: "white", borderRadius: "8px", fontWeight: "600", border: "none", cursor: "pointer", transition: "all 0.2s" }}
                                      >
                                        Duyệt
                                      </button>
                                    )}
                                    {app.status === "approved" && (
                                      <button
                                        onClick={() => handleUpdateAppointmentStatus(app.id, "completed")}
                                        style={{ padding: "6px 12px", fontSize: "0.8rem", backgroundColor: "#10b981", color: "white", borderRadius: "8px", fontWeight: "600", border: "none", cursor: "pointer", transition: "all 0.2s" }}
                                      >
                                        Hoàn thành
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleUpdateAppointmentStatus(app.id, "cancelled")}
                                      style={{ padding: "6px 12px", fontSize: "0.8rem", backgroundColor: "#fef2f2", color: "#ef4444", border: "1px solid #fee2e2", borderRadius: "8px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }}
                                    >
                                      Hủy
                                    </button>
                                  </div>
                                )}

                                {/* Divider */}
                                {(app.status === "pending" || app.status === "approved") && (
                                  <div style={{ width: "1px", height: "18px", backgroundColor: "#cbd5e1" }} />
                                )}

                                {/* Management Actions */}
                                <div style={{ display: "flex", gap: "0.4rem" }}>
                                  <button
                                    onClick={() => handleEditAppointment(app)}
                                    disabled={app.status === "completed"}
                                    style={{
                                      padding: "6px",
                                      backgroundColor: "#f1f5f9",
                                      border: "none",
                                      borderRadius: "8px",
                                      color: app.status === "completed" ? "#cbd5e1" : "#64748b",
                                      cursor: app.status === "completed" ? "not-allowed" : "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      transition: "all 0.2s",
                                      opacity: app.status === "completed" ? 0.6 : 1
                                    }}
                                    title={app.status === "completed" ? "Không thể sửa lịch hẹn đã hoàn thành" : "Sửa lịch hẹn"}
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAppointment(app.id)}
                                    disabled={app.status === "completed"}
                                    style={{
                                      padding: "6px",
                                      backgroundColor: app.status === "completed" ? "#f8fafc" : "#fee2e2",
                                      border: "none",
                                      borderRadius: "8px",
                                      color: app.status === "completed" ? "#cbd5e1" : "#ef4444",
                                      cursor: app.status === "completed" ? "not-allowed" : "pointer",
                                      display: "flex",
                                      alignItems: "center",
                                      transition: "all 0.2s",
                                      opacity: app.status === "completed" ? 0.6 : 1
                                    }}
                                    title={app.status === "completed" ? "Không thể xóa lịch hẹn đã hoàn thành" : "Xóa lịch hẹn"}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SPA WORKSPACE - APPOINTMENTS TAB */}
        {activeCategory === "spa" && currentTab === "appointments" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
              <div>
                <h2 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#1e293b", margin: 0 }}>
                  {activeCategory === "vet" ? "Quản lý lịch hẹn khám y tế" : "Quản lý lịch hẹn Spa làm đẹp"}
                </h2>
                <p style={{ color: "#64748b", marginTop: "0.25rem" }}>
                  Xem danh sách đặt chỗ của khách hàng và cập nhật tiến độ thực hiện dịch vụ.
                </p>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
                  <Search size={16} style={{ position: "absolute", left: "12px", color: "#64748b" }} />
                  <input
                    type="text"
                    placeholder="Tìm tên thú cưng, chủ nuôi..."
                    value={aptSearchQuery}
                    onChange={(e) => setAptSearchQuery(e.target.value)}
                    style={{
                      padding: "0.6rem 1rem 0.6rem 2.2rem",
                      borderRadius: "9999px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#ffffff",
                      color: "#1e293b",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      outline: "none",
                      width: "220px",
                      transition: "all 0.2s"
                    }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Filter size={18} style={{ color: "#64748b" }} />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                      padding: "0.6rem 1.25rem",
                      borderRadius: "9999px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#ffffff",
                      color: "#1e293b",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      outline: "none"
                    }}
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Đang chờ (Pending)</option>
                    <option value="approved">Đã duyệt (Approved)</option>
                    <option value="completed">Đã xong (Completed)</option>
                    <option value="cancelled">Đã hủy (Cancelled)</option>
                  </select>
                </div>
                <button
                  onClick={handleCreateAppointment}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.6rem 1.25rem",
                    borderRadius: "9999px",
                    border: "none",
                    backgroundColor: "#7066e0",
                    color: "white",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    boxShadow: "0 4px 6px rgba(112, 102, 224, 0.2)"
                  }}
                >
                  <Plus size={18} /> Tạo lịch hẹn mới
                </button>
              </div>
            </div>

            {/* View Mode Toggle for Spa */}
            <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", backgroundColor: "#f1f5f9", borderRadius: "9999px", padding: "4px", gap: "2px" }}>
                <button
                  onClick={() => setAppointmentViewMode("list")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "9999px",
                    border: "none",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    backgroundColor: appointmentViewMode === "list" ? "#ffffff" : "transparent",
                    color: appointmentViewMode === "list" ? "#1e293b" : "#64748b",
                    transition: "all 0.2s",
                    boxShadow: appointmentViewMode === "list" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                  }}
                >
                  Danh sách
                </button>
                <button
                  onClick={() => setAppointmentViewMode("calendar")}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "9999px",
                    border: "none",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    cursor: "pointer",
                    backgroundColor: appointmentViewMode === "calendar" ? "#ffffff" : "transparent",
                    color: appointmentViewMode === "calendar" ? "#1e293b" : "#64748b",
                    transition: "all 0.2s",
                    boxShadow: appointmentViewMode === "calendar" ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                  }}
                >
                  Lịch tháng
                </button>
              </div>
            </div>

            {appointmentViewMode === "calendar" ? (
              <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "1.5rem", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                {/* Calendar Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <button
                    onClick={() => navigateCalendarMonth(-1)}
                    style={{ padding: "0.5rem 1rem", backgroundColor: "#f1f5f9", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", color: "#475569" }}
                  >
                    ◄ Tháng trước
                  </button>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#1e293b", margin: 0 }}>
                    Tháng {currentCalendarDate.getMonth() + 1} - {currentCalendarDate.getFullYear()}
                  </h3>
                  <button
                    onClick={() => navigateCalendarMonth(1)}
                    style={{ padding: "0.5rem 1rem", backgroundColor: "#f1f5f9", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", color: "#475569" }}
                  >
                    Tháng sau ►
                  </button>
                </div>
                {/* Calendar Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "1px", backgroundColor: "#e2e8f0", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
                  {["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"].map((dayName, idx) => (
                    <div key={idx} style={{ backgroundColor: "#f8fafc", padding: "0.75rem", textAlign: "center", fontWeight: "bold", fontSize: "0.85rem", color: "#64748b" }}>
                      {dayName}
                    </div>
                  ))}
                  {getDaysInMonth(currentCalendarDate).map((dayObj, idx) => {
                    const dayApps = dayObj.dateStr
                      ? appointments.filter(app => {
                          if (app.date !== dayObj.dateStr) return false;
                          if (app.category !== "spa") return false;
                          if (statusFilter !== "all" && app.status !== statusFilter) return false;
                          const q = aptSearchQuery.toLowerCase().trim();
                          if (q) return (app.petName?.toLowerCase().includes(q) || app.ownerName?.toLowerCase().includes(q));
                          return true;
                        })
                      : [];
                    return (
                      <div
                        key={idx}
                        onClick={(e) => { if (e.target === e.currentTarget && dayObj.dateStr) handleCreateAppointment(dayObj.dateStr); }}
                        style={{
                          backgroundColor: dayObj.isCurrentMonth ? "#ffffff" : "#f8fafc",
                          minHeight: "110px",
                          padding: "0.5rem",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          cursor: dayObj.dateStr ? "pointer" : "default",
                          transition: "background-color 0.2s",
                          position: "relative"
                        }}
                      >
                        <div style={{ fontSize: "0.85rem", fontWeight: dayObj.isCurrentMonth ? "600" : "400", color: dayObj.isCurrentMonth ? "#1e293b" : "#cbd5e1", marginBottom: "4px" }}>
                          {dayObj.day}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px", overflow: "hidden" }}>
                          {dayApps.slice(0, 3).map(app => {
                            const pillBg = app.status === "pending" ? "#fef9c3" : app.status === "approved" ? "#e0e7ff" : app.status === "completed" ? "#d1fae5" : "#fee2e2";
                            const pillColor = app.status === "pending" ? "#854d0e" : app.status === "approved" ? "#4338ca" : app.status === "completed" ? "#065f46" : "#991b1b";
                            return (
                              <div
                                key={app.id}
                                onClick={(e) => { e.stopPropagation(); handleEditAppointment(app); }}
                                style={{
                                  fontSize: "0.72rem",
                                  fontWeight: "700",
                                  padding: "3px 6px",
                                  borderRadius: "6px",
                                  backgroundColor: pillBg,
                                  color: pillColor,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  cursor: "pointer",
                                  borderLeft: `3px solid ${app.status === "pending" ? "#eab308" : app.status === "approved" ? "#7066e0" : app.status === "completed" ? "#10b981" : "#ef4444"}`
                                }}
                                title={`${app.petName} - ${app.time} (${app.type})`}
                              >
                                {app.time.split(" ")[0]} {app.petName}
                              </div>
                            );
                          })}
                          {dayApps.length > 3 && (
                            <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: "600" }}>+{dayApps.length - 3} khác</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
            <div className="card" style={{ padding: 0, overflow: "hidden", border: "1px solid #e2e8f0" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    <th style={{ padding: "1rem 1.5rem", fontSize: "0.85rem", fontWeight: "bold", color: "#475569" }}>Pet cưng</th>
                    <th style={{ padding: "1rem 1.5rem", fontSize: "0.85rem", fontWeight: "bold", color: "#475569" }}>Chủ nuôi</th>
                    <th style={{ padding: "1rem 1.5rem", fontSize: "0.85rem", fontWeight: "bold", color: "#475569" }}>Thời gian</th>
                    <th style={{ padding: "1rem 1.5rem", fontSize: "0.85rem", fontWeight: "bold", color: "#475569" }}>Dịch vụ</th>
                    <th style={{ padding: "1rem 1.5rem", fontSize: "0.85rem", fontWeight: "bold", color: "#475569" }}>Ghi chú</th>
                    <th style={{ padding: "1rem 1.5rem", fontSize: "0.85rem", fontWeight: "bold", color: "#475569" }}>Trạng thái</th>
                    <th style={{ padding: "1rem 1.5rem", fontSize: "0.85rem", fontWeight: "bold", color: "#475569", textAlign: "center" }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments
                    .filter(app => app.category === activeCategory)
                    .filter(app => statusFilter === "all" || app.status === statusFilter)
                    .filter(app => {
                      const q = aptSearchQuery.toLowerCase().trim();
                      if (!q) return true;
                      return (app.petName?.toLowerCase().includes(q) || app.ownerName?.toLowerCase().includes(q));
                    })
                    .sort((a, b) => {
                      const weights = { pending: 1, completed: 2, cancelled: 3, approved: 4 };
                      return (weights[a.status] || 99) - (weights[b.status] || 99);
                    })
                    .map((app) => (
                      <tr key={app.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "1rem 1.5rem", fontWeight: "bold", color: "#1e293b" }}>{app.petName}</td>
                        <td style={{ padding: "1rem 1.5rem" }}>{app.ownerName}</td>
                        <td style={{ padding: "1rem 1.5rem" }}>
                          <div>{app.date}</div>
                          <div style={{ fontSize: "0.8rem", color: "#64748b" }}>{app.time}</div>
                        </td>
                        <td style={{ padding: "1rem 1.5rem" }}>
                          <span style={{ fontSize: "0.8rem", padding: "4px 8px", borderRadius: "12px", background: activeCategory === "vet" ? "#EBFBFA" : "#F4F3FF", fontWeight: "600", color: activeCategory === "vet" ? "var(--secondary)" : "#7066e0" }}>
                            {app.type}
                          </span>
                        </td>
                        <td style={{ padding: "1rem 1.5rem", fontSize: "0.85rem", color: "#475569" }}>{app.notes}</td>
                        <td style={{ padding: "1rem 1.5rem" }}>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              padding: "4px 8px",
                              borderRadius: "12px",
                              fontWeight: "bold",
                              backgroundColor: app.status === "pending" ? "#fef3c7" : app.status === "approved" ? "#dbeafe" : app.status === "completed" ? "#d1fae5" : "#fee2e2",
                              color: app.status === "pending" ? "#b45309" : app.status === "approved" ? "#1d4ed8" : app.status === "completed" ? "#047857" : "#b91c1c",
                            }}
                          >
                            {app.status === "pending" ? "Chờ duyệt" : app.status === "approved" ? "Đã duyệt" : app.status === "completed" ? "Đã hoàn thành" : "Đã hủy"}
                          </span>
                        </td>
                        <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>
                          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", alignItems: "center" }}>
                            {/* Quick Status Transitions */}
                            {(app.status === "pending" || app.status === "approved") && (
                              <div style={{ display: "flex", gap: "0.4rem" }}>
                                {app.status === "pending" && (
                                  <button
                                    onClick={() => handleUpdateAppointmentStatus(app.id, "approved")}
                                    style={{ padding: "5px 10px", fontSize: "0.75rem", backgroundColor: "var(--secondary)", color: "white", borderRadius: "6px", fontWeight: "bold", border: "none", cursor: "pointer" }}
                                  >
                                    Duyệt
                                  </button>
                                )}
                                {app.status === "approved" && (
                                  <button
                                    onClick={() => handleUpdateAppointmentStatus(app.id, "completed")}
                                    style={{ padding: "5px 10px", fontSize: "0.75rem", backgroundColor: "var(--success)", color: "white", borderRadius: "6px", fontWeight: "bold", border: "none", cursor: "pointer" }}
                                  >
                                    Hoàn thành
                                  </button>
                                )}
                                <button
                                  onClick={() => handleUpdateAppointmentStatus(app.id, "cancelled")}
                                  style={{ padding: "5px 10px", fontSize: "0.75rem", backgroundColor: "#fee2e2", color: "var(--danger)", borderRadius: "6px", fontWeight: "bold", border: "none", cursor: "pointer" }}
                                >
                                  Hủy
                                </button>
                              </div>
                            )}

                            {/* Divider */}
                            {(app.status === "pending" || app.status === "approved") && (
                              <div style={{ width: "1px", height: "16px", backgroundColor: "#cbd5e1" }} />
                            )}

                            {/* Management Actions */}
                            <div style={{ display: "flex", gap: "0.4rem" }}>
                              <button
                                onClick={() => handleEditAppointment(app)}
                                disabled={app.status === "completed"}
                                style={{
                                  padding: "5px",
                                  backgroundColor: "#f1f5f9",
                                  border: "none",
                                  borderRadius: "6px",
                                  color: app.status === "completed" ? "#cbd5e1" : "#64748b",
                                  cursor: app.status === "completed" ? "not-allowed" : "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  opacity: app.status === "completed" ? 0.6 : 1
                                }}
                                title={app.status === "completed" ? "Không thể sửa lịch hẹn đã hoàn thành" : "Sửa lịch hẹn"}
                              >
                                <Edit size={12} />
                              </button>
                              <button
                                onClick={() => handleDeleteAppointment(app.id)}
                                disabled={app.status === "completed"}
                                style={{
                                  padding: "5px",
                                  backgroundColor: app.status === "completed" ? "#f8fafc" : "#fee2e2",
                                  border: "none",
                                  borderRadius: "6px",
                                  color: app.status === "completed" ? "#cbd5e1" : "#ef4444",
                                  cursor: app.status === "completed" ? "not-allowed" : "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  opacity: app.status === "completed" ? 0.6 : 1
                                }}
                                title={app.status === "completed" ? "Không thể xóa lịch hẹn đã hoàn thành" : "Xóa lịch hẹn"}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            )} {/* end calendar/list conditional */}
          </div>
        )}

        {/* VETERINARY WORKSPACE - EHR HEALTH RECORDS TAB */}
        {activeCategory === "vet" && currentTab === "ehr" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
              <div>
                <h2 style={{ fontSize: "2rem", fontWeight: "800", color: "#1e293b", margin: 0 }}>
                  Hồ sơ sức khỏe y tế điện tử (EHR)
                </h2>
                <p style={{ color: "#64748b", marginTop: "0.5rem", fontSize: "1rem" }}>
                  Tra cứu lịch sử khám bệnh, tiêm phòng và ghi chú y tế của bệnh nhân thú cưng.
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "1.5rem" }}>
              {/* Patient List from DB */}
              <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", overflow: "hidden", background: "#fff", border: "1px solid rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "1.25rem", margin: 0, color: "#1e293b", fontWeight: "bold" }}>Danh sách bệnh nhân</h3>
                  <span style={{ fontSize: "0.8rem", backgroundColor: "#e0e7ff", color: "#4f46e5", padding: "4px 10px", borderRadius: "9999px", fontWeight: "600" }}>{patients.length} con</span>
                </div>
                <div style={{ position: "relative" }}>
                  <Search size={16} color="#94a3b8" style={{ position: "absolute", top: "12px", left: "12px" }} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm tên thú cưng..."
                    value={ehrSearch}
                    onChange={(e) => setEhrSearch(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px 10px 36px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      outline: "none",
                      fontSize: "0.95rem",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
                {isLoadingPatients ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                    <div style={{ border: "3px solid #f3f3f3", borderTop: "3px solid var(--primary)", borderRadius: "50%", width: "30px", height: "30px", animation: "spin 1s linear infinite", margin: "0 auto 0.5rem" }}></div>
                    Đang tải...
                  </div>
                ) : (
                  <div className="hide-scrollbar" style={{ display: "flex", flexDirection: "column", gap: "0.75rem", overflowY: "auto", overflowX: "hidden", flex: 1, maxHeight: "500px" }}>
                    {patients
                      .filter(p => !ehrSearch || (p.name || "").toLowerCase().includes(ehrSearch.toLowerCase()))
                      .map((pat) => (
                        <div
                          key={pat.id}
                          onClick={() => setSelectedPatient(pat)}
                          onMouseEnter={(e) => {
                            if (selectedPatient?.id !== pat.id) {
                              e.currentTarget.style.backgroundColor = "#f1f5f9";
                              e.currentTarget.style.borderColor = "#cbd5e1";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedPatient?.id !== pat.id) {
                              e.currentTarget.style.backgroundColor = "#f8fafc";
                              e.currentTarget.style.borderColor = "#e2e8f0";
                            }
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            padding: "0.75rem",
                            borderRadius: "10px",
                            border: selectedPatient?.id === pat.id ? "1px solid #cbd5e1" : "1px solid #e2e8f0",
                            cursor: "pointer",
                            backgroundColor: selectedPatient?.id === pat.id ? "#ffffff" : "#f8fafc",
                            boxShadow: selectedPatient?.id === pat.id ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                            transition: "background-color 0.2s, border-color 0.2s, box-shadow 0.2s",
                          }}
                        >
                          <img
                            src={pat.image || "https://via.placeholder.com/40"}
                            alt={pat.name}
                            style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "50%", border: "2px solid #e2e8f0", flexShrink: 0 }}
                            onError={(e) => { e.target.src = "https://via.placeholder.com/40"; }}
                          />
                          <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                            <div style={{ fontWeight: "bold", fontSize: "0.9rem", color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pat.name}</div>
                            <div style={{ fontSize: "0.8rem", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {pat.breed} • {pat.healthRecords?.length || 0} bệnh án
                            </div>
                          </div>
                          <ChevronRight size={16} color={selectedPatient?.id === pat.id ? "#1e293b" : "#94a3b8"} style={{ flexShrink: 0 }} />
                        </div>
                      ))}
                    {patients.filter(p => !ehrSearch || (p.name || "").toLowerCase().includes(ehrSearch.toLowerCase())).length === 0 && (
                      <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                        Không tìm thấy bệnh nhân.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Patient Details Panel - shows DB health records */}
              <div className="card" style={{ padding: "1.5rem", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", minHeight: "500px", display: "flex", flexDirection: "column" }}>
                {selectedPatient ? (
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "1.25rem", marginBottom: "1.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                        <img
                          src={selectedPatient.image}
                          alt={selectedPatient.name}
                          style={{ width: "70px", height: "70px", objectFit: "cover", borderRadius: "50%", border: "3px solid #f8fafc" }}
                          onError={(e) => { e.target.src = "https://via.placeholder.com/70"; }}
                        />
                        <div>
                          <h3 style={{ fontSize: "1.5rem", margin: 0, fontWeight: "800", color: "#1e293b" }}>{selectedPatient.name}</h3>
                          <p style={{ margin: "4px 0 0", fontSize: "0.95rem", color: "#64748b" }}>
                            <span style={{ fontWeight: "600", color: "#475569" }}>Trạm:</span> {selectedPatient.shelterName || selectedPatient.owner}
                          </p>
                        </div>
                      </div>
                      <button onClick={() => { setHrForm({ petID: selectedPatient.id, weight: "", conditionDetails: "", vaccinationStatus: "N/A" }); setShowAddHRModal(true); }} style={{ padding: "8px 16px", backgroundColor: "#f05a5b", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <Plus size={16} /> Thêm bệnh án
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
                      <div style={{ padding: "1rem", backgroundColor: "#f8fafc", borderRadius: "12px" }}>
                        <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>Giống loài</p>
                        <p style={{ margin: "4px 0 0", fontWeight: "bold", color: "#1e293b", fontSize: "1.1rem" }}>{selectedPatient.breed}</p>
                      </div>
                      <div style={{ padding: "1rem", backgroundColor: "#f8fafc", borderRadius: "12px" }}>
                        <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>Loại</p>
                        <p style={{ margin: "4px 0 0", fontWeight: "bold", color: "#1e293b", fontSize: "1.1rem" }}>{selectedPatient.categoryName}</p>
                      </div>
                      <div style={{ padding: "1rem", backgroundColor: "#f8fafc", borderRadius: "12px" }}>
                        <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>Cân nặng</p>
                        <p style={{ margin: "4px 0 0", fontWeight: "bold", color: "#1e293b", fontSize: "1.1rem" }}>{selectedPatient.weight}</p>
                      </div>
                    </div>

                    {/* Vaccination Status from DB */}
                    <div style={{ marginBottom: "2rem" }}>
                      <h4 style={{ margin: "0 0 1rem", fontSize: "1.1rem", color: "#1e293b", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Clipboard size={18} color="#4f46e5" /> Tình trạng tiêm chủng
                      </h4>
                      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                        {selectedPatient.vaccines?.length > 0 ? selectedPatient.vaccines.map((vac, i) => (
                          <span key={i} style={{ fontSize: "0.9rem", padding: "8px 16px", backgroundColor: "#e0e7ff", borderRadius: "9999px", color: "#4f46e5", fontWeight: "600" }}>
                            💉 {vac}
                          </span>
                        )) : <span style={{ fontSize: "0.9rem", color: "#64748b", fontStyle: "italic" }}>Chưa có thông tin tiêm chủng</span>}
                      </div>
                    </div>

                    {/* Health Records History from DB */}
                    <div>
                      <h4 style={{ margin: "0 0 1rem", fontSize: "1.1rem", color: "#1e293b", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <FileText size={18} color="#e11d48" /> Lịch sử bệnh án ({selectedPatient.healthRecords?.length || 0})
                      </h4>
                      {selectedPatient.healthRecords?.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "300px", overflowY: "auto" }}>
                          {selectedPatient.healthRecords.map((hr) => (
                            <div key={hr.recordID} style={{ padding: "1rem", backgroundColor: "#fff1f2", borderRadius: "12px", border: "1px solid #ffe4e6" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                                <span style={{ fontWeight: "700", fontSize: "0.9rem", color: "#be123c" }}>Bệnh án #{hr.recordID}</span>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                  <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{new Date(hr.createdAt).toLocaleDateString("vi-VN")}</span>
                                  <button
                                    onClick={() => handleEditHealthRecord(hr)}
                                    style={{ border: "none", backgroundColor: "transparent", color: "#64748b", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center" }}
                                    title="Sửa bệnh án"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteHealthRecord(hr.recordID)}
                                    style={{ border: "none", backgroundColor: "transparent", color: "#ef4444", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center" }}
                                    title="Xóa bệnh án"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                              <div style={{ display: "flex", gap: "1rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                                {hr.weight && <span style={{ fontSize: "0.85rem", color: "#475569" }}>⚖️ {hr.weight} kg</span>}
                                {hr.vaccinationStatus && hr.vaccinationStatus !== "N/A" && <span style={{ fontSize: "0.85rem", color: "#475569" }}>💉 {hr.vaccinationStatus}</span>}
                              </div>
                              <p style={{ margin: 0, fontSize: "0.9rem", color: "#be123c", lineHeight: "1.5" }}>
                                {hr.conditionDetails || "Không có ghi chú"}
                              </p>
                              <p style={{ margin: "0.5rem 0 0", fontSize: "0.8rem", color: "#94a3b8" }}>
                                Bác sĩ: {hr.volunteerName}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ padding: "2rem", backgroundColor: "#f8fafc", borderRadius: "12px", textAlign: "center", color: "#94a3b8" }}>
                          Chưa có bệnh án nào cho bệnh nhân này.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
                    <Clipboard size={64} style={{ marginBottom: "1rem", opacity: 0.5 }} />
                    <p style={{ margin: 0, fontSize: "1.1rem" }}>Vui lòng chọn một bệnh nhân để xem chi tiết hồ sơ.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SPA WORKSPACE - WELLNESS & PET PROFILE TAB */}
        {activeCategory === "spa" && currentTab === "wellness" && (
          <div>
            <div style={{ marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#1e293b", margin: 0 }}>
                Hồ sơ Chăm sóc & Tạo kiểu Pet cưng
              </h2>
              <p style={{ color: "#64748b", marginTop: "0.25rem" }}>
                Ghi chú các yêu cầu đặc biệt của chủ nuôi về kiểu lông, da nhạy cảm và phong cách tạo kiểu của pet.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.25fr", gap: "2rem" }}>
              {/* Patient List */}
              <div className="card" style={{ padding: "1.5rem" }}>
                <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "#1e293b" }}>Danh sách pet làm đẹp</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {patients.slice(0, 2).map((pat) => (
                    <div
                      key={pat.id}
                      onClick={() => setSelectedPatient(pat)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "1rem",
                        borderRadius: "12px",
                        border: selectedPatient?.id === pat.id ? "2px solid #9b93ff" : "1px solid #e2e8f0",
                        cursor: "pointer",
                        backgroundColor: selectedPatient?.id === pat.id ? "#F4F3FF" : "#ffffff",
                        transition: "all 0.2s",
                      }}
                      className="hover-scale"
                    >
                      <img
                        src={pat.image}
                        alt={pat.name}
                        style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "50%" }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "bold", fontSize: "0.95rem" }}>{pat.name}</div>
                        <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                          {pat.breed} • {pat.age}
                        </div>
                      </div>
                      <ChevronRight size={18} color="#94a3b8" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Pet Styling Care Card */}
              <div className="card" style={{ minHeight: "350px", display: "flex", flexDirection: "column" }}>
                {selectedPatient ? (
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", borderBottom: "1px solid #f1f5f9", paddingBottom: "1.25rem", marginBottom: "1.25rem" }}>
                      <img
                        src={selectedPatient.image}
                        alt={selectedPatient.name}
                        style={{ width: "64px", height: "64px", objectFit: "cover", borderRadius: "50%" }}
                      />
                      <div>
                        <h3 style={{ fontSize: "1.25rem", margin: 0 }}>{selectedPatient.name}</h3>
                        <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>Chủ: {selectedPatient.owner}</p>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.5rem" }}>
                      <div style={{ padding: "0.75rem", backgroundColor: "#f8fafc", borderRadius: "10px" }}>
                        <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>Kiểu lông yêu thích:</p>
                        <p style={{ margin: "2px 0 0", fontWeight: "bold" }}>
                          {selectedPatient.name === "Luna" ? "Cắt Poodle Teddy tròn" : "Tỉa gọn gàng tự nhiên"}
                        </p>
                      </div>
                      <div style={{ padding: "0.75rem", backgroundColor: "#f8fafc", borderRadius: "10px" }}>
                        <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>Loại da & Lông:</p>
                        <p style={{ margin: "2px 0 0", fontWeight: "bold" }}>
                          {selectedPatient.name === "Luna" ? "Tơ xoăn, dễ rối" : "Dày, rụng lông vừa"}
                        </p>
                      </div>
                    </div>

                    <div style={{ marginBottom: "1.5rem" }}>
                      <p style={{ margin: "0 0 0.5rem", fontSize: "0.8rem", color: "#64748b", fontWeight: "bold", textTransform: "uppercase" }}>Yêu cầu dịch vụ đặc biệt</p>
                      <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "0.88rem", color: "#334155", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        <li>Cạo vắt tuyến hôi nhẹ nhàng, pet nhát.</li>
                        <li>Sử dụng dầu gội hương thảo dược dưỡng lông bóng mượt.</li>
                        <li>Cắt móng dũa tròn, không cắt quá sát tủy móng.</li>
                      </ul>
                    </div>

                    <div>
                      <p style={{ margin: "0 0 0.5rem", fontSize: "0.8rem", color: "#64748b", fontWeight: "bold", textTransform: "uppercase" }}>Đánh giá thể trạng sau tắm</p>
                      <div style={{ padding: "1rem", backgroundColor: "#fdf8f6", borderRadius: "10px", fontSize: "0.9rem", color: "#b45309", borderLeft: "4px solid #9b93ff" }}>
                        Tai có hiện tượng tích tụ sáp màu nâu nhẹ, đã vệ sinh sạch sẽ bằng nước rửa chuyên dụng. Cần nhắc chủ nuôi nhỏ tai.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
                    <Sparkles size={48} style={{ marginBottom: "1rem" }} />
                    <p style={{ margin: 0 }}>Chọn một bé pet làm đẹp để xem ghi chú và phong cách tạo kiểu chi tiết.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VET & SPA WORKSPACE - PACKAGES CRUD TAB */}
        {(activeCategory === "vet" || activeCategory === "spa") && currentTab === "packages" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <div>
                <h2 style={{ fontSize: "1.75rem", fontWeight: "800", color: "#1e293b", margin: 0 }}>
                  {activeCategory === "vet" ? "Cấu hình Gói dịch vụ y tế" : "Cấu hình Gói dịch vụ Spa làm đẹp"}
                </h2>
                <p style={{ color: "#64748b", marginTop: "0.25rem" }}>
                  Tạo mới các combo, dịch vụ chăm sóc thú cưng để giới thiệu trên ứng dụng HomePaws.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingPackage(null);
                  setPackageForm({ name: "", price: "", duration: "", desc: "" });
                  setShowPackageModal(true);
                }}
                className="btn btn-primary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  borderRadius: "10px",
                  backgroundColor: activeCategory === "vet" ? "var(--secondary)" : "#7066e0",
                  boxShadow: activeCategory === "vet" ? "0 4px 6px rgba(78, 205, 196, 0.2)" : "0 4px 6px rgba(112, 102, 224, 0.2)",
                }}
              >
                <Plus size={18} /> Thêm gói dịch vụ
              </button>
            </div>

            {/* Packages Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
              {packages
                .filter(p => p.type === activeCategory)
                .map((pkg) => (
                  <div key={pkg.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                        <h4 style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#1e293b", margin: 0 }}>{pkg.name}</h4>
                        <span style={{ fontSize: "0.78rem", padding: "4px 8px", backgroundColor: "#f1f5f9", borderRadius: "8px", fontWeight: "bold", color: "#475569" }}>
                          ⏱ {pkg.duration}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.85rem", color: "#64748b", lineHeight: "1.5", marginBottom: "1.5rem" }}>
                        {pkg.desc}
                      </p>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "1rem" }}>
                      <span style={{ fontSize: "1.25rem", fontWeight: "800", color: activeCategory === "vet" ? "var(--secondary)" : "#7066e0" }}>
                        {pkg.price.toLocaleString("vi-VN")} ₫
                      </span>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button
                          onClick={() => handleEditPackage(pkg)}
                          style={{ padding: "6px", backgroundColor: "#f1f5f9", borderRadius: "6px", color: "var(--secondary)" }}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeletePackage(pkg.id)}
                          style={{ padding: "6px", backgroundColor: "#fee2e2", borderRadius: "6px", color: "var(--danger)" }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

      </main>

      {/* PRODUCT DIALOG / MODAL */}
      {showProductModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "1rem",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "2rem",
              width: "100%",
              maxWidth: "500px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1.5rem" }}>
              {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
            </h3>

            <form onSubmit={handleProductSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Tên sản phẩm *</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  style={{ padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Danh mục *</label>
                  <select
                    value={productForm.categoryID || ""}
                    onChange={(e) => setProductForm({ ...productForm, categoryID: e.target.value ? Number(e.target.value) : null })}
                    style={{ padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "white" }}
                    required
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categoriesList.length > 0 ? (
                      categoriesList.map(cat => (
                        <option key={cat.categoryID || cat.id} value={cat.categoryID || cat.id}>
                          {cat.categoryName || cat.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="1">Thức ăn (Food)</option>
                        <option value="2">Y tế (Veterinary)</option>
                        <option value="3">Vệ sinh/Grooming</option>
                        <option value="4">Đồ chơi (Toys)</option>
                      </>
                    )}
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Hình ảnh sản phẩm</label>
                  <div style={{
                    border: "2px dashed #cbd5e1",
                    borderRadius: "8px",
                    padding: "16px",
                    textAlign: "center",
                    cursor: "pointer",
                    backgroundColor: "#f8fafc",
                    position: "relative"
                  }}>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer", zIndex: 10 }}
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = async (event) => {
                            try {
                              const base64 = event.target.result;
                              const compressed = await compressImage(base64);
                              setProductForm({ ...productForm, image: compressed });
                            } catch (error) {
                              toast.error('Lỗi khi tải hình ảnh');
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    {productForm.image ? (
                      <div style={{ position: "relative" }}>
                        <img src={productForm.image} alt="preview" style={{ maxHeight: "80px", maxWidth: "100%", objectFit: "contain", borderRadius: "4px" }} />
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "#64748b", fontSize: "0.85rem", gap: "4px" }}>
                        <Upload size={20} style={{ color: "#3b82f6" }} />
                        Nhấp để tải ảnh lên
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Giá bán (₫) *</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    style={{ padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", width: "100%", boxSizing: "border-box" }}
                    required
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Số lượng *</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    style={{ padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", width: "100%", boxSizing: "border-box" }}
                    required
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Đơn vị tính *</label>
                  <input
                    type="text"
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    placeholder="cái, hộp..."
                    style={{ padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", width: "100%", boxSizing: "border-box" }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Mô tả chi tiết</label>
                <textarea
                  value={productForm.desc}
                  onChange={(e) => setProductForm({ ...productForm, desc: e.target.value })}
                  style={{ padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", minHeight: "80px", fontFamily: "inherit" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="btn btn-outline"
                  style={{ borderRadius: "8px" }}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" style={{ borderRadius: "8px" }}>
                  {editingProduct ? "Lưu thay đổi" : "Tạo sản phẩm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SERVICE PACKAGE DIALOG / MODAL */}
      {showPackageModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "1rem",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "2rem",
              width: "100%",
              maxWidth: "480px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1.5rem" }}>
              {editingPackage ? "Chỉnh sửa gói dịch vụ" : "Thêm gói dịch vụ mới"}
            </h3>

            <form onSubmit={handlePackageSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Tên dịch vụ *</label>
                <input
                  type="text"
                  value={packageForm.name}
                  onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                  style={{ padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Giá gói (₫) *</label>
                  <input
                    type="number"
                    value={packageForm.price}
                    onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                    style={{ padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                    required
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Thời lượng ước tính *</label>
                  <input
                    type="text"
                    value={packageForm.duration}
                    placeholder="e.g. 60 phút"
                    onChange={(e) => setPackageForm({ ...packageForm, duration: e.target.value })}
                    style={{ padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Mô tả dịch vụ</label>
                <textarea
                  value={packageForm.desc}
                  onChange={(e) => setPackageForm({ ...packageForm, desc: e.target.value })}
                  style={{ padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", minHeight: "80px", fontFamily: "inherit" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setShowPackageModal(false)}
                  className="btn btn-outline"
                  style={{ borderRadius: "8px" }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    borderRadius: "8px",
                    backgroundColor: activeCategory === "vet" ? "var(--secondary)" : "#7066e0",
                    border: "none",
                  }}
                >
                  {editingPackage ? "Lưu thay đổi" : "Tạo gói"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HEALTH RECORD CREATION MODAL */}
      {showAddHRModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "1rem",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "2rem",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FileText size={20} color={activeCategory === "spa" ? "#7066e0" : "#e11d48"} />
              {editingHealthRecord
                ? (activeCategory === "spa" ? "Chỉnh sửa hồ sơ chăm sóc" : "Chỉnh sửa bệnh án")
                : (activeCategory === "spa" ? "Thêm hồ sơ chăm sóc" : "Thêm bệnh án mới")}
            </h3>

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!hrForm.petID) {
                toast.error("Vui lòng chọn thú cưng!");
                return;
              }
              setIsSavingHR(true);
              const loadingToast = toast.loading("Đang lưu bệnh án...");
              try {
                let result;
                if (editingHealthRecord) {
                  result = await updatePartnerHealthRecord(editingHealthRecord.recordID, {
                    petID: Number(hrForm.petID),
                    weight: hrForm.weight ? Number(hrForm.weight) : null,
                    conditionDetails: hrForm.conditionDetails || "",
                    vaccinationStatus: hrForm.vaccinationStatus || "N/A"
                  });
                } else {
                  result = await createPartnerHealthRecord({
                    petID: hrForm.petID === "external" ? 0 : Number(hrForm.petID),
                    weight: hrForm.weight ? Number(hrForm.weight) : null,
                    conditionDetails: hrForm.conditionDetails || "",
                    vaccinationStatus: hrForm.vaccinationStatus || "N/A",
                    petName: hrForm.petID === "external" ? hrForm.petName : null,
                    breed: hrForm.petID === "external" ? hrForm.breed : null,
                    ownerName: hrForm.petID === "external" ? hrForm.ownerName : null
                  });
                }

                if (result.success) {
                  toast.success(editingHealthRecord ? "Cập nhật bệnh án thành công!" : "Tạo bệnh án thành công!", { id: loadingToast });
                  if (completingAppointmentId) {
                    const app = appointments.find(a => a.id === completingAppointmentId);
                    if (app) {
                      const newDesc = `Pet: ${app.petName} | Owner: ${app.ownerName} | Notes: ${app.notes || ""} | Status: completed`;
                      const dateObj = new Date(app.date + "T" + convertTimeTo24h(app.time) + ":00");
                      await updatePartnerEvent(app.id, {
                        eventName: app.petName,
                        eventDate: dateObj.toISOString(),
                        eventType: app.type,
                        description: newDesc,
                        location: partnerProfile.address || "Tại cửa hàng",
                        petID: app.petID || null
                      });
                    }
                    setCompletingAppointmentId(null);
                    fetchAppointments();
                    toast.success(activeCategory === "spa" ? "Đã hoàn thành dịch vụ spa và lưu hồ sơ chăm sóc!" : "Đã hoàn thành lịch hẹn khám!");
                  }
                  setShowAddHRModal(false);
                  setEditingHealthRecord(null);
                  setHrForm({ petID: "", weight: "", conditionDetails: "", vaccinationStatus: "N/A", petName: "", breed: "", ownerName: "" });
                  // Refresh patient data
                  setDbPatientsLoaded(false);
                } else {
                  toast.error(result.error || "Không thể lưu bệnh án", { id: loadingToast });
                }
              } catch (err) {
                console.error(err);
                toast.error("Có lỗi xảy ra khi lưu bệnh án.", { id: loadingToast });
              } finally {
                setIsSavingHR(false);
              }
            }} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

              {editingHealthRecord ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Thú cưng (Đang sửa)</label>
                  <input
                    type="text"
                    value={selectedPatient ? `${selectedPatient.name} (${selectedPatient.breed})` : "Thú cưng"}
                    disabled
                    style={{ padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", width: "100%", boxSizing: "border-box", backgroundColor: "#f1f5f9", fontSize: "0.95rem" }}
                  />
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Nguồn thú cưng *</label>
                    <div style={{ display: "flex", gap: "1.5rem" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.9rem", cursor: "pointer" }}>
                        <input
                          type="radio"
                          name="petSource"
                          value="db"
                          checked={hrForm.petID !== "external"}
                          onChange={() => {
                            setHrForm({ ...hrForm, petID: "", petName: "", breed: "", ownerName: "" });
                            setSelectedRegion("");
                            setSelectedShelterId("");
                          }}
                        />
                        Chọn từ Trạm cứu hộ
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.9rem", cursor: "pointer" }}>
                        <input
                          type="radio"
                          name="petSource"
                          value="external"
                          checked={hrForm.petID === "external"}
                          onChange={() => {
                            setHrForm({ ...hrForm, petID: "external", petName: "", breed: "", ownerName: "" });
                            setSelectedRegion("");
                            setSelectedShelterId("");
                          }}
                        />
                        Nhập thủ công (Khách ngoài)
                      </label>
                    </div>
                  </div>

                  {hrForm.petID !== "external" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      {/* Region Select */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                        <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Khu vực *</label>
                        <select
                          value={selectedRegion}
                          onChange={(e) => {
                            setSelectedRegion(e.target.value);
                            setSelectedShelterId("");
                            setHrForm({ ...hrForm, petID: "" });
                          }}
                          style={{ padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", width: "100%", boxSizing: "border-box", fontSize: "0.95rem" }}
                          required={hrForm.petID !== "external"}
                        >
                          <option value="">-- Chọn khu vực --</option>
                          {shelterRegions.map(reg => (
                            <option key={reg} value={reg}>{reg}</option>
                          ))}
                        </select>
                      </div>

                      {/* Shelter Select */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                        <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Trạm cứu hộ *</label>
                        <select
                          value={selectedShelterId}
                          onChange={(e) => {
                            setSelectedShelterId(e.target.value);
                            setHrForm({ ...hrForm, petID: "" });
                          }}
                          disabled={!selectedRegion}
                          style={{ padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", width: "100%", boxSizing: "border-box", fontSize: "0.95rem", backgroundColor: !selectedRegion ? "#f1f5f9" : "#ffffff" }}
                          required={hrForm.petID !== "external"}
                        >
                          <option value="">-- Chọn trạm cứu hộ --</option>
                          {sheltersList
                            .filter(s => s.regionName === selectedRegion)
                            .map(s => (
                              <option key={s.shelterID} value={s.shelterID}>{s.shelterName}</option>
                            ))}
                        </select>
                      </div>

                      {/* Pet Select */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                        <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Thú cưng trong trạm *</label>
                        <select
                          value={hrForm.petID}
                          onChange={(e) => setHrForm({ ...hrForm, petID: e.target.value })}
                          disabled={!selectedShelterId}
                          style={{ padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", width: "100%", boxSizing: "border-box", fontSize: "0.95rem", backgroundColor: !selectedShelterId ? "#f1f5f9" : "#ffffff" }}
                          required={hrForm.petID !== "external"}
                        >
                          <option value="">-- Chọn thú cưng --</option>
                          {shelterPets.map(p => (
                            <option key={p.petID} value={p.petID}>{p.petName} ({p.breed || "Chưa rõ"}) - ID: {p.petID}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </>
              )}

              {hrForm.petID === "external" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Tên thú cưng *</label>
                    <input
                      type="text"
                      value={hrForm.petName}
                      onChange={(e) => setHrForm({ ...hrForm, petName: e.target.value })}
                      placeholder="VD: Lulu, Max"
                      style={{ padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", width: "100%", boxSizing: "border-box" }}
                      required
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Tên chủ nuôi *</label>
                    <input
                      type="text"
                      value={hrForm.ownerName}
                      onChange={(e) => setHrForm({ ...hrForm, ownerName: e.target.value })}
                      placeholder="VD: Nguyễn Văn Hùng"
                      style={{ padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", width: "100%", boxSizing: "border-box" }}
                      required
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", gridColumn: "span 2" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Giống loài</label>
                    <input
                      type="text"
                      value={hrForm.breed}
                      onChange={(e) => setHrForm({ ...hrForm, breed: e.target.value })}
                      placeholder="VD: Chó Husky, Mèo Anh Lông Ngắn"
                      style={{ padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", width: "100%", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Cân nặng (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={hrForm.weight}
                    onChange={(e) => setHrForm({ ...hrForm, weight: e.target.value })}
                    placeholder="VD: 5.5"
                    style={{ padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", width: "100%", boxSizing: "border-box" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>
                    {activeCategory === "spa" ? "Dịch vụ bổ sung / Ghi chú lông da" : "Tình trạng tiêm chủng"}
                  </label>
                  <input
                    type="text"
                    value={hrForm.vaccinationStatus}
                    onChange={(e) => setHrForm({ ...hrForm, vaccinationStatus: e.target.value })}
                    placeholder="VD: Đã tiêm dại"
                    style={{ padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", width: "100%", boxSizing: "border-box" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>
                {activeCategory === "spa" ? "Ghi chú dịch vụ & yêu cầu của khách hàng *" : "Chi tiết tình trạng / Ghi chú bác sĩ *"}
              </label>
                <textarea
                  value={hrForm.conditionDetails}
                  onChange={(e) => setHrForm({ ...hrForm, conditionDetails: e.target.value })}
                  placeholder={activeCategory === "spa" ? "Nhập ghi chú dịch vụ, yêu cầu đặc biệt, kiểu lông..." : "Nhập chi tiết chẩn đoán, đơn thuốc, ghi chú..."}
                  style={{ padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", minHeight: "100px", fontFamily: "inherit", fontSize: "0.95rem" }}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddHRModal(false);
                    setEditingHealthRecord(null);
                    setHrForm({ petID: "", weight: "", conditionDetails: "", vaccinationStatus: "N/A" });
                    setCompletingAppointmentId(null);
                  }}
                  className="btn btn-outline"
                  style={{ borderRadius: "8px" }}
                  disabled={isSavingHR}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ borderRadius: "8px", backgroundColor: activeCategory === "spa" ? "#7066e0" : "#f05a5b", border: "none" }}
                  disabled={isSavingHR}
                >
                  {isSavingHR ? "Đang lưu..." : editingHealthRecord ? "Lưu thay đổi" : (activeCategory === "spa" ? "Lưu hồ sơ chăm sóc" : "Tạo bệnh án")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* APPOINTMENT DIALOG / MODAL */}
      {showAppointmentModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "1rem",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "2rem",
              width: "100%",
              maxWidth: "520px",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", color: activeCategory === "vet" ? "#f05a5b" : "#7066e0" }}>
              <Calendar size={20} />
              {editingAppointment ? "Chỉnh sửa lịch hẹn" : "Tạo lịch hẹn mới"}
            </h3>

            <form onSubmit={handleAppointmentSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Pet Source Selection */}
              {!editingAppointment && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Nguồn thú cưng *</label>
                  <div style={{ display: "flex", gap: "1.5rem" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.9rem", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="aptPetSource"
                        value="db"
                        checked={aptPetSource === "db"}
                        onChange={() => {
                          setAptPetSource("db");
                          setAppointmentForm({ ...appointmentForm, petID: "", petName: "", ownerName: "" });
                          setAptSelectedRegion("");
                          setAptSelectedShelterId("");
                        }}
                      />
                      Chọn từ Trạm cứu hộ
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.9rem", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="aptPetSource"
                        value="external"
                        checked={aptPetSource === "external"}
                        onChange={() => {
                          setAptPetSource("external");
                          setAppointmentForm({ ...appointmentForm, petID: null, petName: "", ownerName: "" });
                          setAptSelectedRegion("");
                          setAptSelectedShelterId("");
                        }}
                      />
                      Nhập thủ công (Khách ngoài)
                    </label>
                  </div>
                </div>
              )}

              {aptPetSource === "db" && !editingAppointment ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {/* Region Select */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Khu vực *</label>
                    <select
                      value={aptSelectedRegion}
                      onChange={(e) => {
                        setAptSelectedRegion(e.target.value);
                        setAptSelectedShelterId("");
                        setAppointmentForm({ ...appointmentForm, petID: "", petName: "", ownerName: "" });
                      }}
                      style={{ padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", width: "100%", boxSizing: "border-box", fontSize: "0.95rem", backgroundColor: "white" }}
                      required={aptPetSource === "db"}
                    >
                      <option value="">-- Chọn khu vực --</option>
                      {shelterRegions.map(reg => (
                        <option key={reg} value={reg}>{reg}</option>
                      ))}
                    </select>
                  </div>

                  {/* Shelter Select */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Trạm cứu hộ *</label>
                    <select
                      value={aptSelectedShelterId}
                      onChange={(e) => {
                        setAptSelectedShelterId(e.target.value);
                        setAppointmentForm({ ...appointmentForm, petID: "", petName: "", ownerName: "" });
                      }}
                      disabled={!aptSelectedRegion}
                      style={{ padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", width: "100%", boxSizing: "border-box", fontSize: "0.95rem", backgroundColor: !aptSelectedRegion ? "#f1f5f9" : "#ffffff" }}
                      required={aptPetSource === "db"}
                    >
                      <option value="">-- Chọn trạm cứu hộ --</option>
                      {sheltersList
                        .filter(s => s.regionName === aptSelectedRegion)
                        .map(s => (
                          <option key={s.shelterID} value={s.shelterID}>{s.shelterName}</option>
                        ))}
                    </select>
                  </div>

                  {/* Pet Select */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Thú cưng trong trạm *</label>
                    <select
                      value={appointmentForm.petID || ""}
                      onChange={(e) => {
                        const petId = e.target.value;
                        const pet = aptShelterPets.find(p => p.petID.toString() === petId);
                        const shelter = sheltersList.find(s => s.shelterID.toString() === aptSelectedShelterId);
                        setAppointmentForm({
                          ...appointmentForm,
                          petID: petId,
                          petName: pet ? pet.petName : "",
                          ownerName: shelter ? shelter.shelterName : ""
                        });
                      }}
                      disabled={!aptSelectedShelterId}
                      style={{ padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", width: "100%", boxSizing: "border-box", fontSize: "0.95rem", backgroundColor: !aptSelectedShelterId ? "#f1f5f9" : "#ffffff" }}
                      required={aptPetSource === "db"}
                    >
                      <option value="">-- Chọn thú cưng --</option>
                      {aptShelterPets.map(p => (
                        <option key={p.petID} value={p.petID}>{p.petName} ({p.breed || "Chưa rõ"}) - ID: {p.petID}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Tên thú cưng *</label>
                    <input
                      type="text"
                      value={appointmentForm.petName}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, petName: e.target.value })}
                      placeholder="VD: Lulu, Max"
                      style={{ padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", width: "100%", boxSizing: "border-box" }}
                      required
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Tên chủ nuôi *</label>
                    <input
                      type="text"
                      value={appointmentForm.ownerName}
                      onChange={(e) => setAppointmentForm({ ...appointmentForm, ownerName: e.target.value })}
                      placeholder="VD: Nguyễn Văn Hùng"
                      style={{ padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", width: "100%", boxSizing: "border-box" }}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Date & Time */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Ngày hẹn *</label>
                  <input
                    type="date"
                    value={appointmentForm.date}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                    style={{ padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                    required
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Giờ hẹn *</label>
                  <input
                    type="time"
                    value={appointmentForm.time}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, time: e.target.value })}
                    style={{ padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box", width: "100%", height: "40px", fontSize: "0.95rem" }}
                    required
                  />
                </div>
              </div>

              {/* Service Type / Package */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Dịch vụ khám / Spa *</label>
                <input
                  type="text"
                  value={appointmentForm.type}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, type: e.target.value })}
                  placeholder="VD: Khám tổng quát, Tiêm vaccine"
                  style={{ padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                  required
                  list="service-suggestions"
                />
                <datalist id="service-suggestions">
                  {packages.filter(p => p.type === activeCategory).map(p => (
                    <option key={p.id} value={p.name}>{p.price.toLocaleString("vi-VN")} ₫</option>
                  ))}
                </datalist>
              </div>

              {/* Status (If editing) */}
              {editingAppointment && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Trạng thái lịch hẹn</label>
                  <select
                    value={appointmentForm.status}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, status: e.target.value })}
                    style={{ padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", width: "100%", fontSize: "0.95rem" }}
                  >
                    <option value="pending">Chờ duyệt (Pending)</option>
                    <option value="approved">Đã duyệt (Approved)</option>
                    <option value="completed">Hoàn thành (Completed)</option>
                    <option value="cancelled">Đã hủy (Cancelled)</option>
                  </select>
                </div>
              )}

              {/* Notes */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "bold" }}>Ghi chú lịch hẹn</label>
                <textarea
                  value={appointmentForm.notes}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })}
                  placeholder="VD: Pet bị dị ứng thuốc, cần lưu ý..."
                  style={{ padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid #cbd5e1", minHeight: "80px", fontFamily: "inherit" }}
                />
              </div>

              {/* Modal buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setShowAppointmentModal(false)}
                  className="btn btn-outline"
                  style={{ borderRadius: "8px" }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    borderRadius: "8px",
                    backgroundColor: activeCategory === "vet" ? "#f05a5b" : "#7066e0",
                    border: "none",
                  }}
                >
                  {editingAppointment ? "Cập nhật" : "Tạo lịch hẹn"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PartnerDashboard;

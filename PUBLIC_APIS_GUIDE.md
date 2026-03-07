# 🚀 PUBLIC APIs IMPLEMENTATION GUIDE

## ✅ HOÀN THÀNH TẤT CẢ PUBLIC APIs

Hệ thống đã implement đầy đủ **16 PUBLIC endpoints** theo documentation backend!

---

## 📦 API SERVICES STRUCTURE

```
src/services/
├── authService.js          ✅ 8 functions (register, login, forgot-password, newsletter...)
├── petsService.js          ✅ 2 functions (getPets, getPetById)
├── sheltersService.js      ✅ 2 functions (getShelters, getShelterById)
├── postsService.js         ✅ 2 functions (getPosts, getPostById)
├── homeStatsService.js     ✅ 1 function (getHomeStats)
├── adoptionService.js      ✅ 1 function (submitAdoptionRequest)
├── donationService.js      ✅ 1 function (createVNPayDonation)
└── uploadService.js        ✅ 2 functions (uploadImage, uploadMultipleImages)
```

---

## 🐾 1. PETS APIs

### Import
```javascript
import { getPets, getPetById, formatPetAge, getPetStatusColor } from '@/services/petsService';
```

### GET /api/pets - Danh sách thú cưng
```javascript
const result = await getPets({
  keyword: 'golden',        // Tìm kiếm theo tên (optional)
  categoryId: 1,           // Lọc theo loại (optional)
  page: 1,                 // Trang hiện tại (default: 1)
  pageSize: 9,             // Số lượng (default: 9)
});

if (result.success) {
  console.log(result.data.items);      // Danh sách pets
  console.log(result.data.totalPages); // Tổng số trang
}
```

### GET /api/pets/{id} - Chi tiết thú cưng
```javascript
const result = await getPetById(123);

if (result.success) {
  const pet = result.data;
  console.log(pet.name, pet.age, pet.breed);
}
```

### Utility Functions
```javascript
formatPetAge(18)              // "1 year 6 months"
getPetStatusColor('Available') // "#10b981"
```

---

## 🏠 2. SHELTERS APIs

### Import
```javascript
import { getShelters, getShelterById, formatPhoneNumber } from '@/services/sheltersService';
```

### GET /api/shelters - Danh sách trạm cứu hộ
```javascript
const result = await getShelters({
  location: 'Hanoi',       // Lọc theo địa điểm (optional)
  status: 'Active',        // Active/Inactive (optional)
  page: 1,
  pageSize: 10,
});

if (result.success) {
  console.log(result.data.items);
}
```

### GET /api/shelters/{id} - Chi tiết trạm
```javascript
const result = await getShelterById(5);

if (result.success) {
  const shelter = result.data;
  console.log(shelter.name, shelter.address, shelter.phone);
}
```

---

## 📝 3. POSTS APIs

### Import
```javascript
import { getPosts, getPostById, formatPostDate, getReadingTime } from '@/services/postsService';
```

### GET /api/posts - Danh sách bài viết
```javascript
const result = await getPosts({
  postType: 'News',        // News, Story, Guide, Event (optional)
  searchKeyword: 'rescue', // Tìm kiếm (optional)
  page: 1,
  pageSize: 10,
});

if (result.success) {
  console.log(result.data.items);
}
```

### GET /api/posts/{id} - Chi tiết bài viết
```javascript
const result = await getPostById(42);

if (result.success) {
  const post = result.data;
  console.log(post.title, post.content, post.author);
}
```

---

## 📊 4. HOME STATS API

### Import
```javascript
import { getHomeStats, formatNumber, formatCurrency } from '@/services/homeStatsService';
```

### GET /api/homestats - Thống kê trang chủ
```javascript
const result = await getHomeStats();

if (result.success) {
  const stats = result.data;
  console.log(stats.totalPets);       // Tổng số thú cưng
  console.log(stats.adoptedPets);     // Số đã được nhận nuôi
  console.log(stats.totalShelters);   // Số trạm cứu hộ
  console.log(stats.totalVolunteers); // Số tình nguyện viên
  console.log(stats.totalDonations);  // Tổng tiền quyên góp
}
```

### Utility Functions
```javascript
formatNumber(1234567)      // "1,234,567"
formatCurrency(500000)     // "500.000đ"
```

---

## ❤️ 5. ADOPTION REQUEST API

### Import
```javascript
import { submitAdoptionRequest, validateAdoptionForm } from '@/services/adoptionService';
```

### POST /api/adoptions - Gửi yêu cầu nhận nuôi
```javascript
const adoptionData = {
  petId: 123,                          // Required
  adopterName: 'Nguyen Van A',         // Required
  adopterEmail: 'user@example.com',    // Required
  adopterPhone: '0901234567',          // Required
  adopterAddress: '123 Street, Hanoi', // Required
  reason: 'Tôi yêu động vật...',       // Required (min 20 chars)
  experience: 'Đã nuôi 2 con chó',     // Optional
  hasOtherPets: true,                  // Optional
  livingSpace: 'Nhà riêng có sân',     // Optional
};

// Validate trước khi submit
const validation = validateAdoptionForm(adoptionData);
if (!validation.isValid) {
  console.log(validation.errors);
  return;
}

// Submit request
const result = await submitAdoptionRequest(adoptionData);

if (result.success) {
  alert('Adoption request submitted successfully!');
}
```

**💡 NOTE**: userId tự động được lấy từ auth context nếu user đã đăng nhập. Nếu chưa đăng nhập, userId sẽ là `null`.

---

## 💰 6. DONATION API (VNPay)

### Import
```javascript
import { 
  createVNPayDonation, 
  validateDonationForm, 
  DONATION_PRESETS,
  formatCurrencyVND 
} from '@/services/donationService';
```

### POST /api/donations/vnpay - Tạo link thanh toán
```javascript
const donationData = {
  amount: 500000,                    // Required (VND, min: 10,000)
  donorName: 'Nguyen Van B',         // Required
  donorEmail: 'donor@example.com',   // Required
  donorPhone: '0912345678',          // Optional
  message: 'Ủng hộ cứu hộ động vật', // Optional
};

// Validate
const validation = validateDonationForm(donationData);
if (!validation.isValid) {
  console.log(validation.errors);
  return;
}

// Create payment
const result = await createVNPayDonation(donationData);

if (result.success) {
  // Redirect user to VNPay payment page
  window.location.href = result.paymentUrl;
}
```

### Payment Flow
1. User nhập thông tin quyên góp
2. Call `createVNPayDonation()` → Nhận `paymentUrl`
3. Redirect user đến `paymentUrl` (VNPay)
4. User thanh toán trên VNPay
5. VNPay callback về backend `/api/donations/vnpay-callback`
6. Backend redirect về frontend:
   - Success: `http://frontend.com/donation/success`
   - Failed: `http://frontend.com/donation/failed`

### Predefined Amounts
```javascript
import { DONATION_PRESETS } from '@/services/donationService';

DONATION_PRESETS.forEach(preset => {
  console.log(preset.label, preset.value);
  // "50,000đ" 50000
  // "100,000đ" 100000
  // ...
});
```

---

## 📤 7. UPLOAD IMAGE API

### Import
```javascript
import { 
  uploadImage, 
  uploadMultipleImages,
  compressImage,
  getImagePreview 
} from '@/services/uploadService';
```

### POST /api/upload - Upload một ảnh
```javascript
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  
  if (!file) return;

  // Option 1: Upload directly
  const result = await uploadImage(file);

  if (result.success) {
    console.log('Image URL:', result.imageUrl);
  } else {
    console.error(result.error);
  }
};
```

### Upload với Progress Tracking
```javascript
const handleFileUpload = async (file) => {
  const result = await uploadImage(file, {
    onProgress: (percent) => {
      console.log(`Upload progress: ${percent}%`);
      // Update progress bar UI
    }
  });

  if (result.success) {
    console.log('Uploaded:', result.imageUrl);
  }
};
```

### Compress trước khi upload (giảm dung lượng)
```javascript
const handleFileUpload = async (file) => {
  // Compress image (max 1920x1080, quality 80%)
  const compressedFile = await compressImage(file, {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8,
  });

  // Upload compressed file
  const result = await uploadImage(compressedFile);
};
```

### Upload nhiều ảnh cùng lúc
```javascript
const handleMultipleUpload = async (files) => {
  const result = await uploadMultipleImages(files, {
    onProgress: (percent) => {
      console.log(`Upload progress: ${percent}%`);
    }
  });

  if (result.success) {
    console.log('Uploaded:', result.imageUrls);
    console.log(`${result.uploadedCount} successful, ${result.failedCount} failed`);
  }
};
```

### Preview ảnh trước khi upload
```javascript
const handleFileSelect = async (event) => {
  const file = event.target.files[0];
  
  // Get preview URL
  const previewUrl = await getImagePreview(file);
  
  // Display preview
  document.getElementById('preview').src = previewUrl;
};
```

### File Validation
- **Allowed formats**: JPG, JPEG, PNG, GIF, WebP
- **Max size**: 5MB
- Validation tự động, không cần code thêm

---

## 📧 8. NEWSLETTER SUBSCRIPTION

### Import
```javascript
import { subscribeNewsletter } from '@/services/authService';
```

### POST /api/auth/subscribe - Đăng ký nhận bản tin
```javascript
const handleNewsletterSubmit = async (email) => {
  const result = await subscribeNewsletter(email);

  if (result.success) {
    alert('Đăng ký nhận bản tin thành công!');
  } else {
    alert(result.error);
  }
};
```

---

## 🔧 ERROR HANDLING

Tất cả API functions đều return consistent format:

### Success Response
```javascript
{
  success: true,
  data: { ... }         // hoặc message: "..."
}
```

### Error Response
```javascript
{
  success: false,
  error: "Error message"
}
```

### Example Usage
```javascript
const result = await getPets({ page: 1 });

if (result.success) {
  // Handle success
  setPets(result.data.items);
} else {
  // Handle error
  toast.error(result.error);
}
```

---

## 🎯 BEST PRACTICES

### 1. Always check `success` flag
```javascript
const result = await getPets();
if (result.success) {
  // Proceed
} else {
  console.error(result.error);
}
```

### 2. Handle loading states
```javascript
const [loading, setLoading] = useState(false);

const fetchPets = async () => {
  setLoading(true);
  const result = await getPets();
  setLoading(false);
  
  if (result.success) {
    setPets(result.data.items);
  }
};
```

### 3. Show user-friendly errors
```javascript
const result = await submitAdoptionRequest(data);

if (!result.success) {
  toast.error(result.error || 'Something went wrong');
}
```

### 4. Validate before API calls
```javascript
// Validate form
const validation = validateAdoptionForm(formData);

if (!validation.isValid) {
  setErrors(validation.errors);
  return; // Don't call API
}

// Call API only if valid
const result = await submitAdoptionRequest(formData);
```

---

## 📱 EXAMPLE: Complete Component

```javascript
import { useState, useEffect } from 'react';
import { getPets } from '@/services/petsService';

export default function PetsPage() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 9,
    keyword: '',
    categoryId: null,
  });

  useEffect(() => {
    fetchPets();
  }, [filters]);

  const fetchPets = async () => {
    setLoading(true);
    setError(null);

    const result = await getPets(filters);

    setLoading(false);

    if (result.success) {
      setPets(result.data.items);
    } else {
      setError(result.error);
    }
  };

  const handleSearch = (keyword) => {
    setFilters(prev => ({ ...prev, keyword, page: 1 }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <input 
        type="text" 
        placeholder="Search pets..."
        onChange={(e) => handleSearch(e.target.value)}
      />
      
      <div className="pets-grid">
        {pets.map(pet => (
          <PetCard key={pet.id} pet={pet} />
        ))}
      </div>
    </div>
  );
}
```

---

## 🚀 NEXT STEPS

1. **Test APIs**: Start dev server và test từng API
   ```bash
   npm run dev
   ```

2. **Create UI Pages**: Tạo pages tương ứng:
   - Pet listing page
   - Shelter listing page
   - Blog posts page
   - Donation page
   - Upload image component

3. **Handle VNPay Callback**: Tạo success/failed pages cho donation

4. **Add Loading States**: Implement loading indicators

5. **Error Notifications**: Setup toast/notification system

---

## ✅ SUMMARY

**Đã implement đầy đủ 16 PUBLIC endpoints:**
- ✅ 8 Auth APIs (register, login, forgot-password, newsletter...)
- ✅ 2 Pets APIs (list, detail)
- ✅ 2 Shelters APIs (list, detail)
- ✅ 2 Posts APIs (list, detail)
- ✅ 1 HomeStats API
- ✅ 1 Adoption API
- ✅ 1 Donation API (VNPay)
- ✅ 2 Upload APIs (single, multiple)

**Tất cả services đều có:**
- ✅ Proper error handling
- ✅ Validation functions
- ✅ Utility helpers
- ✅ Consistent return format
- ✅ TypeScript-friendly structure

🎉 **Sẵn sàng để build UI và test với backend!**

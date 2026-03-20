import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { submitAdoptionRequest } from '../services/public/adoptionService';
import toast from 'react-hot-toast';

const AdoptionFormModal = ({ animal, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    adopterName: '',
    adopterPhone: '',
    adopterAddress: '',
    livingSpace: 'house',
    hasOtherPets: false,
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const adoptionData = {
        petId: animal.id,
        adopterName: formData.adopterName,
        adopterPhone: formData.adopterPhone,
        adopterAddress: formData.adopterAddress,
        reason: formData.reason,
        livingSpace: formData.livingSpace,
        hasOtherPets: formData.hasOtherPets
      };

      console.log('[ADOPTION FORM] Submitting form data:', adoptionData);
      const result = await submitAdoptionRequest(adoptionData);

      console.log('[ADOPTION FORM] Success:', result);
      setSuccess(true);
      toast.success(result.message || 'Đăng ký nhận nuôi thành công!');

      if (onSubmit) onSubmit(adoptionData);
    } catch (error) {
      console.error('[ADOPTION FORM] Error:', error);
      toast.error(error?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!animal) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        animation: 'fadeIn 0.3s ease'
      }}>
        {success ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 1.5rem' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Đăng Ký Thành Công!</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              Cảm ơn bạn đã quan tâm đến việc nhận nuôi <strong>{animal.name}</strong>. Trạm cứu hộ sẽ liên hệ với bạn trong thời gian sớm nhất.
            </p>
            <button
              onClick={onClose}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              Đóng
            </button>
          </div>
        ) : (
          <>
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Đăng Ký Nhận Nuôi {animal.name}</h2>
              <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={24} color="#666" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Họ và Tên *</label>
                <input
                  type="text"
                  name="adopterName"
                  required
                  value={formData.adopterName}
                  onChange={handleChange}
                  className="form-control"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px' }}
                  placeholder="Nhập họ tên của bạn"
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Số Điện Thoại *</label>
                <input
                  type="tel"
                  name="adopterPhone"
                  required
                  value={formData.adopterPhone}
                  onChange={handleChange}
                  className="form-control"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px' }}
                  placeholder="0912..."
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Địa Chỉ *</label>
                <input
                  type="text"
                  name="adopterAddress"
                  required
                  value={formData.adopterAddress}
                  onChange={handleChange}
                  className="form-control"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px' }}
                  placeholder="Số nhà, Đường, Quận/Huyện..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Loại Nhà Ở *</label>
                  <select
                    name="livingSpace"
                    required
                    value={formData.livingSpace}
                    onChange={handleChange}
                    className="form-control"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px' }}
                  >
                    <option value="">-- Chọn loại nhà ở --</option>
                    <option value="house">Nhà riêng</option>
                    <option value="apartment">Chung cư</option>
                    <option value="room">Phòng trọ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Có nuôi thú cưng khác? *</label>
                  <select
                    name="hasOtherPets"
                    required
                    value={formData.hasOtherPets ? 'yes' : 'no'}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        hasOtherPets: e.target.value === 'yes'
                      });
                    }}
                    className="form-control"
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px' }}
                  >
                    <option value="">-- Chọn --</option>
                    <option value="no">Chưa có</option>
                    <option value="yes">Đã có</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Tại sao bạn muốn nhận nuôi? *</label>
                <textarea
                  name="reason"
                  required
                  value={formData.reason}
                  onChange={handleChange}
                  rows="3"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', resize: 'vertical' }}
                  placeholder="Chia sẻ lý do và kinh nghiệm nuôi thú cưng của bạn..."
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="btn btn-outline"
                  style={{ flex: 1, padding: '0.75rem' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '0.75rem' }}
                >
                  {isSubmitting ? 'Đang gửi...' : 'Gửi Đăng Ký'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AdoptionFormModal;

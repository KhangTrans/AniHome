import { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { 
  createVNPayDonation, 
  validateDonationForm,
  DONATION_PRESETS,
  formatCurrencyVND,
  parseCurrencyInput,
  getDonationImpactMessage
} from '../../services/public/donationService';
import { Heart, CreditCard, Mail, Phone, User } from 'lucide-react';

/**
 * DONATION PAGE
 * Trang quyên góp với VNPay payment
 */
export default function DonationPage() {
  const toast = useToast();
  const [formData, setFormData] = useState({
    amount: '',
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [customAmount, setCustomAmount] = useState(false);

  const handlePresetAmount = (amount) => {
    setFormData(prev => ({ ...prev, amount }));
    setCustomAmount(false);
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: null }));
    }
  };

  const handleCustomAmountChange = (e) => {
    const value = parseCurrencyInput(e.target.value);
    setFormData(prev => ({ ...prev, amount: value }));
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: null }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validation = validateDonationForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);

    // Create VNPay payment
    const result = await createVNPayDonation(formData);

    setLoading(false);

    if (result.success) {
      // Redirect to VNPay
      window.location.href = result.paymentUrl;
    } else {
      toast.error(result.error || 'Failed to create payment. Please try again.');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '60px 20px'
    }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px', color: 'white' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>💰</div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '15px' }}>Make a Donation</h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
            Help us rescue and care for animals in need
          </p>
        </div>

        {/* Form Card */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          <form onSubmit={handleSubmit}>
            {/* Amount Selection */}
            <div style={{ marginBottom: '30px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '1.1rem', 
                fontWeight: '600',
                marginBottom: '15px'
              }}>
                Select Amount
              </label>

              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                marginBottom: '15px'
              }}>
                {DONATION_PRESETS.map(preset => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handlePresetAmount(preset.value)}
                    style={{
                      padding: '16px',
                      border: formData.amount === preset.value && !customAmount
                        ? '2px solid #3b82f6' 
                        : '2px solid #e5e7eb',
                      background: formData.amount === preset.value && !customAmount
                        ? '#dbeafe'
                        : 'white',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div>
                <label style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                  fontSize: '0.9rem',
                  color: '#666'
                }}>
                  <input 
                    type="checkbox"
                    checked={customAmount}
                    onChange={(e) => setCustomAmount(e.target.checked)}
                  />
                  Custom Amount
                </label>

                {customAmount && (
                  <input
                    type="text"
                    value={formData.amount ? formatCurrencyVND(formData.amount) : ''}
                    onChange={handleCustomAmountChange}
                    placeholder="Enter custom amount..."
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: errors.amount ? '2px solid #ef4444' : '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '1rem',
                    }}
                  />
                )}
              </div>

              {errors.amount && (
                <p style={{ color: '#ef4444', fontSize: '0.9rem', marginTop: '8px' }}>
                  {errors.amount}
                </p>
              )}

              {/* Impact Message */}
              {formData.amount && (
                <div style={{
                  marginTop: '15px',
                  padding: '12px',
                  background: '#f0fdf4',
                  borderRadius: '8px',
                  color: '#15803d',
                  fontSize: '0.95rem',
                  textAlign: 'center',
                  fontWeight: '500'
                }}>
                  {getDonationImpactMessage(formData.amount)}
                </div>
              )}
            </div>

            {/* Donor Information */}
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '15px' }}>
                Your Information
              </h3>

              <InputField
                icon={<User size={20} />}
                name="donorName"
                value={formData.donorName}
                onChange={handleInputChange}
                placeholder="Full Name *"
                error={errors.donorName}
              />

              <InputField
                icon={<Mail size={20} />}
                name="donorEmail"
                type="email"
                value={formData.donorEmail}
                onChange={handleInputChange}
                placeholder="Email Address *"
                error={errors.donorEmail}
              />

              <InputField
                icon={<Phone size={20} />}
                name="donorPhone"
                value={formData.donorPhone}
                onChange={handleInputChange}
                placeholder="Phone Number (optional)"
                error={errors.donorPhone}
              />

              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Leave a message (optional)"
                rows={4}
                style={{
                  width: '100%',
                  padding: '14px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '18px',
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}
            >
              {loading ? (
                'Processing...'
              ) : (
                <>
                  <CreditCard size={22} />
                  Proceed to Payment
                </>
              )}
            </button>
          </form>

          {/* Security Note */}
          <div style={{ 
            marginTop: '25px',
            padding: '15px',
            background: '#f3f4f6',
            borderRadius: '12px',
            fontSize: '0.85rem',
            color: '#666',
            textAlign: 'center'
          }}>
            🔒 Secure payment powered by VNPay
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Input Field Component
 */
function InputField({ icon, error, ...props }) {
  return (
    <div style={{ marginBottom: '15px' }}>
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute',
          left: '14px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#9ca3af'
        }}>
          {icon}
        </div>
        <input
          {...props}
          style={{
            width: '100%',
            padding: '14px 14px 14px 50px',
            border: error ? '2px solid #ef4444' : '2px solid #e5e7eb',
            borderRadius: '12px',
            fontSize: '1rem',
          }}
        />
      </div>
      {error && (
        <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '5px' }}>
          {error}
        </p>
      )}
    </div>
  );
}

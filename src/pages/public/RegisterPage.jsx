import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, User, UserCircle, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { validateRegistrationForm } from '../../utils/validation';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmNewPassword: '',
    fullName: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  // Auto redirect after 3 seconds when registration successful
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error cho field đang edit
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: []
      }));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');
    
    // Validate form
    const validation = validateRegistrationForm(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await register(formData);
      
      if (result.success) {
        // Hiển thị success message trên form
        setSuccessMessage(result.message || 'Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
        // Clear form
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmNewPassword: '',
          fullName: '',
        });
      } else {
        setServerError(result.message);
      }
    } catch {
      setServerError('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFieldErrors = (fieldErrors) => {
    if (!fieldErrors || fieldErrors.length === 0) return null;
    
    return (
      <div style={{ marginTop: '0.25rem' }}>
        {fieldErrors.map((error, index) => (
          <div key={index} style={{ 
            color: '#dc2626', 
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            marginTop: '0.25rem'
          }}>
            <AlertCircle size={12} />
            <span>{error}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '1rem'
    }}>
      <div className="card" style={{ 
        maxWidth: '480px', 
        width: '100%', 
        padding: '2.5rem',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        <Link to="/login" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          fontSize: '0.9rem', 
          color: 'var(--gray)', 
          marginBottom: '1.5rem',
          textDecoration: 'none'
        }}>
          <ArrowLeft size={16} /> Back to Login
        </Link>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', color: 'var(--primary)', fontWeight: '800' }}>Create Account</h2>
          <p style={{ color: 'var(--gray)' }}>Join our rescue community</p>
        </div>

        {successMessage && (
          <div style={{ 
            background: '#d1fae5', 
            color: '#065f46', 
            padding: '1rem', 
            borderRadius: '12px', 
            marginBottom: '1.5rem', 
            fontSize: '0.9rem',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            border: '1px solid #10b981'
          }}>
            <CheckCircle size={20} />
            <div>
              <div style={{ fontWeight: '600' }}>{successMessage}</div>
              <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Tự động chuyển sau 3 giây hoặc{' '}
                <Link to="/login" style={{ color: '#065f46', fontWeight: '700', textDecoration: 'underline' }}>
                  click vào đây
                </Link>
              </div>
            </div>
          </div>
        )}

        {serverError && (
          <div style={{ 
            background: '#fee2e2', 
            color: '#b91c1c', 
            padding: '0.75rem', 
            borderRadius: '12px', 
            marginBottom: '1.5rem', 
            fontSize: '0.9rem',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            {serverError}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Username */}
          <div>
            <div style={{ position: 'relative' }}>
              <UserCircle size={20} color="var(--gray)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
              <input
                type="text"
                name="username"
                placeholder="Username (3-50 characters, no spaces)"
                value={formData.username}
                onChange={handleChange}
                style={{
                  width: '100%', 
                  padding: '0.8rem 1rem 0.8rem 2.8rem',
                  borderRadius: '12px', 
                  border: errors.username?.length ? '1px solid #dc2626' : '1px solid #eee',
                  backgroundColor: '#f9f9f9', 
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            {renderFieldErrors(errors.username)}
          </div>

          {/* Email */}
          <div>
            <div style={{ position: 'relative' }}>
              <Mail size={20} color="var(--gray)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: '100%', 
                  padding: '0.8rem 1rem 0.8rem 2.8rem',
                  borderRadius: '12px', 
                  border: errors.email?.length ? '1px solid #dc2626' : '1px solid #eee',
                  backgroundColor: '#f9f9f9', 
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            {renderFieldErrors(errors.email)}
          </div>

          {/* Full Name */}
          <div>
            <div style={{ position: 'relative' }}>
              <User size={20} color="var(--gray)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                style={{
                  width: '100%', 
                  padding: '0.8rem 1rem 0.8rem 2.8rem',
                  borderRadius: '12px', 
                  border: errors.fullName?.length ? '1px solid #dc2626' : '1px solid #eee',
                  backgroundColor: '#f9f9f9', 
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            {renderFieldErrors(errors.fullName)}
          </div>
          
          {/* Password */}
          <div>
            <div style={{ position: 'relative' }}>
              <Lock size={20} color="var(--gray)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                style={{
                  width: '100%', 
                  padding: '0.8rem 1rem 0.8rem 2.8rem',
                  borderRadius: '12px', 
                  border: errors.password?.length ? '1px solid #dc2626' : '1px solid #eee',
                  backgroundColor: '#f9f9f9', 
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            {renderFieldErrors(errors.password)}
            <div style={{ 
              fontSize: '0.7rem', 
              color: 'var(--gray)', 
              marginTop: '0.5rem',
              paddingLeft: '0.5rem'
            }}>
              • 6-50 characters • 1 uppercase • 1 special character • No spaces
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <div style={{ position: 'relative' }}>
              <Lock size={20} color="var(--gray)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
              <input
                type="password"
                name="confirmNewPassword"
                placeholder="Confirm Password"
                value={formData.confirmNewPassword}
                onChange={handleChange}
                style={{
                  width: '100%', 
                  padding: '0.8rem 1rem 0.8rem 2.8rem',
                  borderRadius: '12px', 
                  border: errors.confirmPassword?.length ? '1px solid #dc2626' : '1px solid #eee',
                  backgroundColor: '#f9f9f9', 
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            {renderFieldErrors(errors.confirmPassword)}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={isSubmitting || successMessage}
            style={{ 
              justifyContent: 'center', 
              padding: '1rem', 
              marginTop: '0.5rem',
              opacity: (isSubmitting || successMessage) ? 0.7 : 1,
              cursor: (isSubmitting || successMessage) ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Creating Account...' : successMessage ? 'Registration Successful!' : 'Sign Up'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

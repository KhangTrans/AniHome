import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, User, UserCircle, ArrowLeft, AlertCircle } from 'lucide-react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

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
        // Redirect based on role (mặc định roleID = 4 cho user thường)
        const roleID = result.user.roleID;
        switch (roleID) {
          case 1: navigate('/admin'); break;
          case 2: navigate('/shelter'); break;
          case 3: navigate('/volunteer'); break;
          default: navigate('/');
        }
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
            disabled={isSubmitting}
            style={{ 
              justifyContent: 'center', 
              padding: '1rem', 
              marginTop: '0.5rem',
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
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

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Key, ArrowLeft, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { forgotPassword, resetPassword } from '../../services/public/authService';
import { validateForgotPasswordEmail, validateResetPasswordForm } from '../../utils/validation';

const ForgotPasswordPage = () => {
  // State for 2-step flow
  const [step, setStep] = useState(1); // 1 = Enter Email, 2 = Enter Code & New Password
  
  // Step 1 state
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  
  // Step 2 state
  const [formData, setFormData] = useState({
    token: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isResetting, setIsResetting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const navigate = useNavigate();

  // STEP 1: Send Reset Code to Email
  const handleSendCode = async (e) => {
    e.preventDefault();
    setEmailError('');
    setServerError('');
    
    // Validate email
    const validation = validateForgotPasswordEmail(email);
    if (!validation.isValid) {
      setEmailError(validation.errors.email[0]);
      return;
    }
    
    setIsSendingCode(true);
    
    try {
      const result = await forgotPassword(email);
      
      if (result.success) {
        setSuccessMessage('Reset code sent! Check your email.');
        // Move to step 2 after 1.5 seconds
        setTimeout(() => {
          setStep(2);
          setSuccessMessage('');
        }, 1500);
      } else {
        setEmailError(result.error);
      }
    } catch {
      setEmailError('Failed to send reset code. Please try again.');
    } finally {
      setIsSendingCode(false);
    }
  };

  // STEP 2: Reset Password with Code
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setServerError('');
    
    // Validate form
    const validation = validateResetPasswordForm({
      email,
      token: formData.token,
      newPassword: formData.newPassword,
      confirmNewPassword: formData.confirmNewPassword,
    });
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    setIsResetting(true);
    
    try {
      const result = await resetPassword({
        email,
        token: formData.token.replace(/\s/g, ''), // Remove spaces
        newPassword: formData.newPassword,
        confirmNewPassword: formData.confirmNewPassword,
      });
      
      if (result.success) {
        setSuccessMessage('Password reset successfully!');
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setServerError(result.error);
      }
    } catch {
      setServerError('Password reset failed. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: []
      }));
    }
  };

  const handleResendCode = async () => {
    setStep(1);
    setFormData({
      token: '',
      newPassword: '',
      confirmNewPassword: '',
    });
    setErrors({});
    setServerError('');
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
          <h2 style={{ fontSize: '2rem', color: 'var(--primary)', fontWeight: '800' }}>
            {step === 1 ? 'Forgot Password?' : 'Reset Password'}
          </h2>
          <p style={{ color: 'var(--gray)', marginTop: '0.5rem' }}>
            {step === 1 
              ? 'Enter your email to receive a reset code' 
              : 'Enter the code sent to your email'}
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div style={{ 
            background: '#d1fae5', 
            color: '#065f46', 
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
            <CheckCircle size={16} />
            {successMessage}
          </div>
        )}

        {/* Server Error */}
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

        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleSendCode} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ position: 'relative' }}>
                <Mail size={20} color="var(--gray)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                  }}
                  style={{
                    width: '100%', 
                    padding: '0.8rem 1rem 0.8rem 2.8rem',
                    borderRadius: '12px', 
                    border: emailError ? '1px solid #dc2626' : '1px solid #eee',
                    backgroundColor: '#f9f9f9', 
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              {emailError && (
                <div style={{ 
                  color: '#dc2626', 
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  marginTop: '0.5rem'
                }}>
                  <AlertCircle size={12} />
                  <span>{emailError}</span>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isSendingCode}
              style={{ 
                justifyContent: 'center', 
                padding: '1rem', 
                marginTop: '0.5rem',
                opacity: isSendingCode ? 0.7 : 1,
                cursor: isSendingCode ? 'not-allowed' : 'pointer'
              }}
            >
              {isSendingCode ? 'Sending...' : 'Send Reset Code'}
            </button>

            <div style={{ 
              marginTop: '1rem', 
              padding: '1rem', 
              background: '#f0f9ff', 
              borderRadius: '12px',
              fontSize: '0.85rem',
              color: '#0369a1'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Clock size={16} />
                <strong>Note:</strong>
              </div>
              The reset code will be sent to your email and expires in 15 minutes.
            </div>
          </form>
        )}

        {/* STEP 2: Enter Code & New Password */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Email Display (Read-only) */}
            <div>
              <div style={{ position: 'relative' }}>
                <Mail size={20} color="var(--gray)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
                <input
                  type="email"
                  value={email}
                  readOnly
                  style={{
                    width: '100%', 
                    padding: '0.8rem 1rem 0.8rem 2.8rem',
                    borderRadius: '12px', 
                    border: '1px solid #eee',
                    backgroundColor: '#f3f4f6', 
                    outline: 'none',
                    fontFamily: 'inherit',
                    color: 'var(--gray)',
                    cursor: 'not-allowed'
                  }}
                />
              </div>
            </div>

            {/* Reset Code */}
            <div>
              <div style={{ position: 'relative' }}>
                <Key size={20} color="var(--gray)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
                <input
                  type="text"
                  name="token"
                  placeholder="Enter 6-digit code"
                  value={formData.token}
                  onChange={handleChange}
                  maxLength="6"
                  style={{
                    width: '100%', 
                    padding: '0.8rem 1rem 0.8rem 2.8rem',
                    borderRadius: '12px', 
                    border: errors.token?.length ? '1px solid #dc2626' : '1px solid #eee',
                    backgroundColor: '#f9f9f9', 
                    outline: 'none',
                    fontFamily: 'inherit',
                    fontSize: '1.2rem',
                    letterSpacing: '0.2rem',
                    textAlign: 'center'
                  }}
                />
              </div>
              {renderFieldErrors(errors.token)}
            </div>

            {/* New Password */}
            <div>
              <div style={{ position: 'relative' }}>
                <Lock size={20} color="var(--gray)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
                <input
                  type="password"
                  name="newPassword"
                  placeholder="New Password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  style={{
                    width: '100%', 
                    padding: '0.8rem 1rem 0.8rem 2.8rem',
                    borderRadius: '12px', 
                    border: errors.newPassword?.length ? '1px solid #dc2626' : '1px solid #eee',
                    backgroundColor: '#f9f9f9', 
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              {renderFieldErrors(errors.newPassword)}
              <div style={{ 
                fontSize: '0.7rem', 
                color: 'var(--gray)', 
                marginTop: '0.5rem',
                paddingLeft: '0.5rem'
              }}>
                • 6+ characters • 1 uppercase • 1 special character • No spaces
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <div style={{ position: 'relative' }}>
                <Lock size={20} color="var(--gray)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
                <input
                  type="password"
                  name="confirmNewPassword"
                  placeholder="Confirm New Password"
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
              disabled={isResetting}
              style={{ 
                justifyContent: 'center', 
                padding: '1rem', 
                marginTop: '0.5rem',
                opacity: isResetting ? 0.7 : 1,
                cursor: isResetting ? 'not-allowed' : 'pointer'
              }}
            >
              {isResetting ? 'Resetting Password...' : 'Reset Password'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={handleResendCode}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Didn't receive code? Resend
              </button>
            </div>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          Remember your password?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
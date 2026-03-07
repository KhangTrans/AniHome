import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { validateLoginForm } from '../../utils/validation';

const LoginPage = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    const validation = validateLoginForm(usernameOrEmail, password);
    
    if (!validation.isValid) {
      const errorMessages = Object.values(validation.errors).flat();
      setError(errorMessages.join(', '));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await login(usernameOrEmail, password);
      
      if (result.success) {
        // Redirect based on roleID
        const roleID = result.role;
        switch (roleID) {
          case 1: navigate('/admin'); break;    // Super Admin
          case 2: navigate('/shelter'); break;   // Shelter Admin
          case 3: navigate('/volunteer'); break; // Volunteer
          default: navigate('/');                // User (roleID = 4)
        }
      } else {
        setError(result.message);
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setError('');
      const result = await loginWithGoogle(credentialResponse.credential);
      
      if (result.success) {
        toast.success('Google login successful!');
        
        // Redirect based on roleID
        const roleID = result.role;
        switch (roleID) {
          case 1: navigate('/admin'); break;    // Super Admin
          case 2: navigate('/shelter'); break;   // Shelter Admin
          case 3: navigate('/volunteer'); break; // Volunteer
          default: navigate('/');                // User (roleID = 4)
        }
      } else {
        setError(result.message || 'Google login failed');
        toast.error(result.message || 'Google login failed');
      }
    } catch (err) {
      const errorMsg = 'Google login failed. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleGoogleLoginError = () => {
    const errorMsg = 'Google login was cancelled or failed';
    setError(errorMsg);
    toast.error(errorMsg);
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
        maxWidth: '400px', 
        width: '100%', 
        padding: '2.5rem',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', color: 'var(--primary)', fontWeight: '800' }}>Welcome Back</h2>
          <p style={{ color: 'var(--gray)' }}>Please enter your details</p>
        </div>

        {error && (
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
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Mail size={20} color="var(--gray)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
            <input
              type="text"
              placeholder="Username or Email"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              style={{
                width: '100%', 
                padding: '0.8rem 1rem 0.8rem 2.8rem',
                borderRadius: '12px', 
                border: '1px solid #eee',
                backgroundColor: '#f9f9f9', 
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>
          
          <div style={{ position: 'relative' }}>
            <Lock size={20} color="var(--gray)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%', 
                padding: '0.8rem 1rem 0.8rem 2.8rem',
                borderRadius: '12px', 
                border: '1px solid #eee',
                backgroundColor: '#f9f9f9', 
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ textAlign: 'right' }}>
            <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none' }}>
              Forgot Password?
            </Link>
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
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'} <ArrowRight size={18} />
          </button>
        </form>

        {/* Google Login Button */}
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem', 
            marginBottom: '1rem' 
          }}>
            <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }}></div>
            <span style={{ color: 'var(--gray)', fontSize: '0.85rem' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }}></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={handleGoogleLoginError}
              theme="outline"
              size="large"
              width="100%"
              text="continue_with"
              shape="rectangular"
            />
          </div>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--gray)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('admin@rescue.com');
  const [password, setPassword] = useState('123'); // Pre-filled for demo convenience
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    const result = login(email, password);
    if (result.success) {
      // Redirect based on role
      switch (result.role) {
        case 'super_admin': navigate('/admin'); break;
        case 'shelter_admin': navigate('/shelter'); break;
        case 'volunteer': navigate('/volunteer'); break;
        default: navigate('/');
      }
    } else {
      setError(result.message);
    }
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
            background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', 
            borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div style={{ position: 'relative' }}>
            <Mail size={20} color="var(--gray)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem',
                borderRadius: '12px', border: '1px solid #eee',
                backgroundColor: '#f9f9f9', outline: 'none',
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
                width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem',
                borderRadius: '12px', border: '1px solid #eee',
                backgroundColor: '#f9f9f9', outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ textAlign: 'right' }}>
            <a href="#" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>Forgot Password?</a>
          </div>

          <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', padding: '1rem', marginTop: '0.5rem' }}>
            Sign In <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--gray)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>Sign up</Link>
        </div>

        {/* Quick Fill Helper for Demo */}
        <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--gray)', marginBottom: '0.5rem', textAlign: 'center' }}>DEMO QUICK FILL</p>
          <div className="flex gap-2 justify-center flex-wrap">
            <button type="button" onClick={() => { setEmail('admin@rescue.com'); setPassword('123'); }} style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', border: '1px solid #eee', background: 'white', cursor: 'pointer' }}>Super Admin</button>
            <button type="button" onClick={() => { setEmail('shelter@rescue.com'); setPassword('123'); }} style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', border: '1px solid #eee', background: 'white', cursor: 'pointer' }}>Shelter</button>
            <button type="button" onClick={() => { setEmail('volunteer@rescue.com'); setPassword('123'); }} style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', border: '1px solid #eee', background: 'white', cursor: 'pointer' }}>Volunteer</button>
            <button type="button" onClick={() => { setEmail('user@gmail.com'); setPassword('123'); }} style={{ fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', border: '1px solid #eee', background: 'white', cursor: 'pointer' }}>User</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, Shield, ArrowLeft } from 'lucide-react';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('adopter'); // Default role
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    if (!email || !password || !name) return;
    
    const result = register(email, password, name, role);
    if (result.success) {
      // Redirect based on selected role for immediate demo feedback
      switch (role) {
        case 'super_admin': navigate('/admin'); break;
        case 'shelter_admin': navigate('/shelter'); break;
        case 'volunteer': navigate('/volunteer'); break;
        default: navigate('/');
      }
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
        <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--gray)', marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> Back to Login
        </Link>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', color: 'var(--primary)', fontWeight: '800' }}>Create Account</h2>
          <p style={{ color: 'var(--gray)' }}>Join our rescue community</p>
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div style={{ position: 'relative' }}>
            <User size={20} color="var(--gray)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem',
                borderRadius: '12px', border: '1px solid #eee',
                backgroundColor: '#f9f9f9', outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Mail size={20} color="var(--gray)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              required
              style={{
                width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem',
                borderRadius: '12px', border: '1px solid #eee',
                backgroundColor: '#f9f9f9', outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Shield size={20} color="var(--gray)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem',
                borderRadius: '12px', border: '1px solid #eee',
                backgroundColor: '#f9f9f9', outline: 'none',
                fontFamily: 'inherit', color: 'var(--dark)'
              }}
            >
              <option value="adopter">Adopter</option>
              <option value="volunteer">Volunteer</option>
              <option value="shelter_admin">Shelter Admin</option>
              {/* Not typically selectable in public app, but here for demo availability */}
              <option value="super_admin">Super Admin (Demo Purpose)</option> 
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', padding: '1rem', marginTop: '0.5rem' }}>
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;

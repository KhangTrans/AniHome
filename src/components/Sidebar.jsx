import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, LogOut, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ title, items, isOpen, onClose }) => {
  const { logout } = useAuth();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        ></div>
      )}

      <div className={`
          fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-50 transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static
      `}
      style={{
        width: 'var(--sidebar-width)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <Shield color="var(--primary)" size={32} />
             <h2 style={{ fontSize: '1.2rem', color: 'var(--dark)', fontWeight: 'bold' }}>{title}</h2>
          </div>
          <button onClick={onClose} className="md:hidden text-gray-500">
              <X size={24} />
          </button>
        </div>

        <nav style={{ flex: 1, padding: '1rem' }}>
          <ul style={{ listStyle: 'none' }}>
            {items.map((item, index) => (
              <li key={index} style={{ marginBottom: '0.5rem' }}>
                <NavLink 
                  to={item.path}
                  end={item.exact}
                  onClick={() => { if(window.innerWidth < 768) onClose && onClose() }}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    borderRadius: '12px',
                    color: isActive ? 'var(--primary)' : 'var(--gray)',
                    backgroundColor: isActive ? '#FFF0F0' : 'transparent',
                    fontWeight: isActive ? 600 : 500,
                    transition: 'all 0.2s',
                    textDecoration: 'none'
                  })}
                  className={({ isActive }) => isActive ? "bg-red-50 text-primary" : "text-gray-600 hover:bg-gray-50"}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div style={{ padding: '2rem', borderTop: '1px solid #eee' }}>
          <button className="btn w-full items-center justify-start gap-4" style={{ color: 'var(--danger)', background: 'transparent', padding: '1rem' }} onClick={logout}>
            <LogOut size={20} />
            <span>Đăng Xuất</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

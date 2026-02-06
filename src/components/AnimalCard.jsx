import React from 'react';
import { Heart, Info, CheckCircle } from 'lucide-react';

const AnimalCard = ({ animal, isAdmin = false, onAction }) => {
  return (
    <div className="card hover-lift group" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <div style={{ position: 'relative', height: '240px', width: '100%', overflow: 'hidden' }}>
        <img 
          src={animal.image} 
          alt={animal.name} 
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=500&q=80'; }}
          className="card-img-zoom"
        />
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: 'bold',
          color: animal.status === 'Ready for Adoption' || animal.status === 'Sẵn sàng' ? 'var(--success)' : 'var(--warning)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {animal.status === 'Ready for Adoption' ? 'Sẵn sàng' : animal.status}
        </div>
      </div>
      
      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700, color: 'var(--dark)' }}>{animal.name}</h3>
          <span style={{ color: 'var(--gray)', fontSize: '0.9rem', background: '#f3f4f6', padding: '0.2rem 0.8rem', borderRadius: '12px' }}>{animal.breed}</span>
        </div>
        
        <p style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '1.5rem', flex: 1, lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {animal.description}
        </p>

        <div style={{ display: 'flex', gap: '0.8rem', marginTop: 'auto' }}>
          {isAdmin ? (
            <>
              <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => onAction('approve')}>
                Duyệt <CheckCircle size={18} />
              </button>
              <button className="btn btn-outline" style={{ padding: '0.6rem' }} onClick={() => onAction('details')}>
                <Info size={18} />
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => onAction && onAction('adopt')}>
                Nhận Nuôi <Heart size={18} className="ml-1" />
              </button>
              <button className="btn btn-outline" style={{ padding: '0.6rem 1rem', borderColor: '#fee2e2', color: 'var(--primary)' }} onClick={() => onAction && onAction('donate')}>
                 Ủng Hộ
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnimalCard;

import React, { useState, useEffect } from 'react';
import { MapPin, Search, Filter, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { getShelters } from '../../services/public/sheltersService';
import { useToast } from '../../context/ToastContext';

const ShelterListPage = () => {
  const toast = useToast();
  const [regionFilter, setRegionFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // API States
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch shelters from API
  useEffect(() => {
    const fetchShelters = async () => {
      setLoading(true);
      setError(null);

      const result = await getShelters({ page: 1, pageSize: 50 });

      if (result.success) {
        setShelters(result.data.items || []);
      } else {
        setError(result.error);
        toast.error('Failed to load shelters: ' + result.error);
      }

      setLoading(false);
    };

    fetchShelters();
  }, [toast]);

  const filteredShelters = shelters.filter(shelter => {
    // Determine region match. If filter is 'All', it matches.
    // Otherwise, check if shelter.region (e.g. 'Miền Bắc') includes the filter keyword (e.g. 'Bắc')
    let matchesRegion = regionFilter === 'All';
    if (!matchesRegion) {
        if (regionFilter === 'Miền Bắc') matchesRegion = shelter.region.includes('Bắc');
        if (regionFilter === 'Miền Trung') matchesRegion = shelter.region.includes('Trung');
        if (regionFilter === 'Miền Nam') matchesRegion = shelter.region.includes('Nam');
    }

    const matchesSearch = shelter.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          shelter.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', fontFamily: 'var(--font-main)' }}>
      <Navbar />
      <div style={{ padding: '2rem' }} className="animate-fadeIn">
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }} className="animate-slideUp">
           <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--dark)', fontWeight: 800 }}>Đối Tác Cứu Hộ</h1>
           <p style={{ color: 'var(--gray)', fontSize: '1.1rem' }}>Kết nối với các trạm cứu hộ uy tín trên toàn quốc.</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ 
              display: 'inline-block',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ marginTop: '20px', color: '#666' }}>Đang tải danh sách trạm...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div style={{ 
            background: '#fee2e2', 
            color: '#dc2626',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Controls */}
        {!loading && !error && (
        <>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '3rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }} className="animate-slideUp delay-100">
           
           <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)' }} size={20} />
              <input 
                type="text" 
                placeholder="Tìm trạm theo tên hoặc địa điểm..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', borderRadius: '8px', border: '1px solid #eee', outline: 'none', fontSize: '1rem', transition: 'border-color 0.2s' }}
                className="focus:border-primary"
              />
           </div>

           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', paddingBottom: '5px' }}>
              <Filter size={20} color="var(--gray)" />
              {['All', 'Miền Bắc', 'Miền Trung', 'Miền Nam'].map(region => (
                <button 
                  key={region} 
                  onClick={() => setRegionFilter(region)}
                  className="btn hover-scale"
                  style={{ 
                      whiteSpace: 'nowrap',
                      backgroundColor: regionFilter === region ? 'var(--dark)' : 'white',
                      color: regionFilter === region ? 'white' : 'var(--dark)',
                      border: regionFilter === region ? 'none' : '1px solid #ddd',
                      padding: '0.6rem 1.2rem',
                      borderRadius: '20px',
                      cursor: 'pointer'
                  }}
                >
                  {region === 'All' ? 'Tất cả' : region}
                </button>
              ))}
           </div>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
           {filteredShelters.map((shelter, index) => (
             <div key={shelter.id} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: 'none', animationDelay: `${index * 50}ms` }} className="card hover-lift group animate-fadeIn">
                <div style={{ height: '240px', overflow: 'hidden', position: 'relative' }}>
                   <img 
                     src={shelter.image} 
                     alt={shelter.name} 
                     onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80'; }}
                     className="card-img-zoom"
                   />
                   <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.9)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                      {shelter.animalCount} Bé
                   </div>
                </div>
                <div style={{ padding: '1.5rem' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700, color: 'var(--dark)' }}>{shelter.name}</h3>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', marginBottom: '1rem', fontSize: '0.95rem' }}>
                      <MapPin size={16} color="var(--primary)" /> {shelter.address}
                      <span style={{ height: '4px', width: '4px', borderRadius: '50%', background: '#ccc', margin: '0 4px' }}></span>
                      <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>{shelter.region}</span>
                   </div>
                   <p style={{ color: '#4b5563', marginBottom: '1.5rem', lineHeight: '1.6', fontSize: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {shelter.description}
                   </p>
                   
                   <Link to={`/shelters/${shelter.id}`} className="btn btn-outline hover:bg-primary hover:text-white hover:border-primary transition-colors" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.8rem', borderRadius: '12px', fontWeight: 600 }}>
                      Ghé Thăm Trạm <ArrowRight size={18} />
                   </Link>
                </div>
             </div>
           ))}
        </div>
        </>
        )}

      </div>
      </div>
    </div>
  );
};

export default ShelterListPage;

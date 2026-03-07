import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Globe, ArrowLeft, Heart } from 'lucide-react';
import AnimalCard from '../../components/AnimalCard';
import Navbar from '../../components/Navbar';
import { getShelterById } from '../../services/public/sheltersService';
import { getPets } from '../../services/public/petsService';
import AdoptionFormModal from '../../components/AdoptionFormModal';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const ShelterDetailPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const toast = useToast();
    
    // API States
    const [shelter, setShelter] = useState(null);
    const [animals, setAnimals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal States
    const [activeModal, setActiveModal] = useState(null);
    const [selectedAnimal, setSelectedAnimal] = useState(null);

    // Fetch shelter and animals on mount
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            // Fetch shelter details
            const shelterResult = await getShelterById(id);
            if (!shelterResult.success) {
                setError(shelterResult.error || 'Failed to load shelter details');
                toast.error('Không thể tải thông tin trạm: ' + shelterResult.error);
                setLoading(false);
                return;
            }
            setShelter(shelterResult.data);

            // Fetch all animals and filter by shelterId
            const petsResult = await getPets({ page: 1, pageSize: 100 });
            if (petsResult.success) {
                const shelterAnimals = (petsResult.data.items || []).filter(
                    animal => animal.shelterId === parseInt(id)
                );
                setAnimals(shelterAnimals);
            } else {
                toast.error('Không thể tải danh sách thú cưng: ' + petsResult.error);
            }

            setLoading(false);
        };

        fetchData();
    }, [id, toast]);

    const handleAction = (type, animal) => {
        setSelectedAnimal(animal);
        if (type === 'adopt') {
            if (!user) {
                toast.warning('Vui lòng đăng nhập để đăng ký nhận nuôi!');
                return;
            }
            setActiveModal('adoptForm');
        } else if (type === 'donate') {
            setActiveModal('donate');
        }
    };

    return (
        <div style={{ backgroundColor: '#fff', minHeight: '100vh', fontFamily: 'var(--font-main)' }}>
            <Navbar />
            
            {/* Loading State */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                    <div style={{ 
                        display: 'inline-block',
                        border: '4px solid #f3f3f3',
                        borderTop: '4px solid #3b82f6',
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        animation: 'spin 1s linear infinite'
                    }} />
                    <p style={{ marginTop: '20px', color: '#666' }}>Đang tải thông tin trạm...</p>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div style={{ maxWidth: '800px', margin: '100px auto', padding: '0 20px' }}>
                    <div style={{ 
                        background: '#fee2e2', 
                        color: '#dc2626',
                        padding: '40px',
                        borderRadius: '12px',
                        textAlign: 'center'
                    }}>
                        <h2 style={{ marginBottom: '10px' }}>⚠️ Không thể tải dữ liệu</h2>
                        <p>{error}</p>
                        <Link to="/shelters" className="btn btn-primary" style={{ marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <ArrowLeft size={16} /> Quay lại danh sách
                        </Link>
                    </div>
                </div>
            )}

            {/* Content */}
            {!loading && !error && shelter && (
            <>
            {/* Hero */}
            <div style={{ position: 'relative', height: '300px' }}>
                <img src={shelter.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={shelter.name} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}></div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem', color: 'white' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <Link to="/shelters" style={{ color: 'white', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', opacity: 0.8 }}>
                            <ArrowLeft size={16} /> Quay lại danh sách
                        </Link>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>{shelter.name}</h1>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', opacity: 0.9 }}>
                            <MapPin size={18} /> {shelter.address}
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', display: 'flex', gap: '3rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                
                {/* Sidebar Info */}
                <div style={{ flex: '1 1 300px', position: 'sticky', top: '100px', background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #eee', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Liên Hệ</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: '#4b5563' }}>
                            <Phone size={18} color="var(--primary)" /> <span>{shelter.phone || '0123 456 789'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: '#4b5563' }}>
                            <Mail size={18} color="var(--primary)" /> <span>{shelter.email || 'contact@shelter.com'}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: '#4b5563' }}>
                           <Globe size={18} color="var(--primary)" /> <span>www.website.com</span>
                        </div>
                    </div>
                    
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginTop: '2rem', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Về Chúng Tôi</h3>
                    <p style={{ color: '#666', lineHeight: 1.6 }}>
                        {shelter.description}
                    </p>
                    
                    <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                        <Heart size={18} /> Ủng Hộ Trạm
                    </button>
                </div>

                {/* Main Content */}
                <div style={{ flex: '2 1 500px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Danh Sách Thú Cưng ({animals.length})</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                        {animals.length > 0 ? animals.map(animal => (
                            <AnimalCard 
                                key={animal.id} 
                                animal={{...animal, status: animal.status === 'Available' ? 'Sẵn sàng' : animal.status === 'Pending' ? 'Đang duyệt' : animal.status}} 
                                onAction={(action) => handleAction(action, animal)}
                            />
                        )) : (
                            <p style={{ color: '#666', gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>Chưa có thú cưng nào được cập nhật.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
             {activeModal === 'adoptForm' && selectedAnimal && (
                <AdoptionFormModal 
                  animal={selectedAnimal} 
                  onClose={() => setActiveModal(null)}
                  onSubmit={(data) => {
                    console.log('Submission:', data);
                  }}
                />
              )}
             
              <Modal isOpen={activeModal === 'donate'} onClose={() => setActiveModal(null)} title={`Quyên góp cho ${selectedAnimal?.name}`}>
                  <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <p>Tính năng này đang được phát triển.</p>
                    <button onClick={() => setActiveModal(null)} className="btn btn-primary" style={{ marginTop: '1rem' }}>Đóng</button>
                  </div>
              </Modal>
            </>
            )}

        </div>
    );
};

export default ShelterDetailPage;

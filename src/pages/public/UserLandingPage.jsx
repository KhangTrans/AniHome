import React, { useState, useEffect, useRef } from 'react';
import { Search, Heart, Bell, User, LogIn, LayoutDashboard, CreditCard, CheckCircle, PawPrint, Calendar, Mail, ArrowRight, Filter, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimalCard from '../../components/AnimalCard';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import AdoptionFormModal from '../../components/AdoptionFormModal';
import { getPets } from '../../services/public/petsService';
import Navbar from '../../components/Navbar';

const UserLandingPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth(); 
  const toast = useToast();
  
  // Modal States
  const [activeModal, setActiveModal] = useState(null); // 'adoptForm', 'donate', 'success', 'success_donate'
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // API States
  const [animals, setAnimals] = useState([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);
  
  const carouselRef = useRef(null);

  // Fetch pets from API
  useEffect(() => {
    const fetchPets = async () => {
      setLoading(true);
      setError(null);

      const result = await getPets({ page: 1, pageSize: 50 });

      if (result.success) {
        setAnimals(result.data.items || []);
      } else {
        setError(result.error);
        toast.error('Failed to load pets: ' + result.error);
      }

      setLoading(false);
    };

    fetchPets();
  }, [toast]);

  useEffect(() => {
    const scrollContainer = carouselRef.current;
    if (!scrollContainer) return;

    const scrollInterval = setInterval(() => {
      // Auto-scroll logic to loop back or scroll next
      if (Math.ceil(scrollContainer.scrollLeft + scrollContainer.clientWidth) >= scrollContainer.scrollWidth) {
        scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollContainer.scrollBy({ left: 299, behavior: 'smooth' }); // 275px width + 24px gap
      }
    }, 3000);

    return () => clearInterval(scrollInterval);
  }, []);

  const stories = [
    { id: 1, title: 'Hành trình của Bella', text: 'Từ chú chó hoang thành cục cưng sofa!', img: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=200&q=80' },
    { id: 2, title: 'Đôi chân kỳ diệu', text: 'Mèo con 3 chân tìm được mái ấm.', img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=200&q=80' },
    { id: 3, title: 'Tình bạn già', text: 'Ông lão 80 tuổi nhận nuôi chú chó 10 tuổi.', img: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=200&q=80' },
  ];

  const filteredAnimals = animals.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.breed.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || a.type === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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
      
      if (user) {
          setFormData({ ...formData, name: user.name, email: user.email });
      }
  };

  const handleDonate = (e) => {
      e.preventDefault();
      setActiveModal('success_donate');
  }

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh', fontFamily: 'var(--font-main)' }}>
      
      {/* --- Navigation --- */}
      <Navbar />

      {/* --- Hero Section --- */}
      <header style={{ 
        padding: '8rem 2rem 10rem', 
        textAlign: 'center', 
        background: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.2)), url(https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1600&q=80) center/cover',
        color: 'white',
        borderRadius: '0 0 50px 50px',
        marginBottom: '6rem',
        position: 'relative'
      }} className="animate-fadeIn">
        <div style={{ maxWidth: '800px', margin: '0 auto' }} className="animate-slideUp">
            <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1.5rem', textShadow: '0 4px 20px rgba(0,0,0,0.5)', fontWeight: 800, lineHeight: 1.2 }}>
              Không chỉ là thú cưng,<br/>
              <span style={{ color: '#FF8787' }}>Là thành viên gia đình.</span>
            </h2>
            <p style={{ fontSize: '1.2rem', margin: '0 auto 2.5rem', opacity: 0.95, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
              Hàng ngàn động vật vô gia cư đang chờ đợi một mái ấm yêu thương. <br className="hidden md:block"/>Hãy thay đổi cuộc đời chúng ngay hôm nay.
            </p>
            
            {/* Search Box */}
            <div className="search-bar-container hover-scale">
              {/* Input Group */}
              <div className="search-input-group">
                 <Search color="var(--primary)" size={22} style={{ minWidth: '22px' }} />
                 <input 
                   type="text" 
                   placeholder="Tìm kiếm Golden, Mèo mướp..." 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   style={{ width: '100%', border: 'none', outline: 'none', fontSize: '1rem', color: 'var(--dark)', marginLeft: '12px', background: 'transparent' }} 
                 />
              </div>

              {/* Filter Group */}
              <div className="search-filter-group">
                 <Filter color="var(--gray)" size={20} />
                 <select 
                   value={categoryFilter}
                   onChange={(e) => setCategoryFilter(e.target.value)}
                   style={{ border: 'none', outline: 'none', fontSize: '1rem', color: 'var(--dark)', marginLeft: '8px', background: 'transparent', cursor: 'pointer' }}
                 >
                   <option value="All">Tất cả</option>
                   <option value="Chó">Chó</option>
                   <option value="Mèo">Mèo</option>
                 </select>
              </div>

              {/* Button */}
              <button className="btn btn-primary search-button">
                Tìm Ngay
              </button>
            </div>
        </div>
      </header>

      {/* --- Stats Section --- */}
      <section style={{ maxWidth: '1000px', margin: '-9rem auto 5rem', position: 'relative', zIndex: 10, padding: '0 1rem' }} className="animate-slideUp delay-200">
         <div style={{ 
            background: 'white', 
            borderRadius: '24px', 
            boxShadow: '0 20px 40px rgba(0,0,0,0.08)', 
            padding: '3rem', 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
            gap: '2rem', 
            textAlign: 'center' 
         }}>
             <div className="hover-lift" style={{ padding: '1rem', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: 800 }}>12k+</h3>
                <p style={{ color: 'var(--gray)', fontWeight: 600, fontSize: '1.1rem' }}>Động vật được cứu</p>
             </div>
             <div className="hover-lift" style={{ padding: '1rem', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '3rem', color: 'var(--secondary)', marginBottom: '0.5rem', fontWeight: 800 }}>8.5k</h3>
                <p style={{ color: 'var(--gray)', fontWeight: 600, fontSize: '1.1rem' }}>Ca nhận nuôi thành công</p>
             </div>
             <div className="hover-lift" style={{ padding: '1rem', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '3rem', color: 'var(--warning)', marginBottom: '0.5rem', fontWeight: 800 }}>15</h3>
                <p style={{ color: 'var(--gray)', fontWeight: 600, fontSize: '1.1rem' }}>Trạm cứu hộ hoạt động</p>
             </div>
         </div>
      </section>

      {/* --- Main Content --- */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        
        {/* Categories */}
        <div className="flex justify-center gap-4 mb-16 flex-wrap animate-fadeIn delay-300">
           {['All', 'Chó', 'Mèo'].map(cat => (
             <button 
               key={cat}
               onClick={() => setCategoryFilter(cat)}
               className={`filter-pill ${categoryFilter === cat ? 'active' : ''}`}
             >
               {cat === 'All' ? 'Tất cả' : cat}
             </button>
           ))}
        </div>

        {/* Animal Profiles */}
        <section id="featured" className="mb-20">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
              <div className="animate-slideInRight">
                  <h3 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 800 }}>Gặp Gỡ Thú Cưng</h3>
                  <p style={{ color: 'var(--gray)', fontSize: '1.1rem' }}>Những thành viên mới nhất đang chờ đợi mái ấm.</p>
              </div>
              <Link to="/shelters" className="text-primary font-bold flex items-center gap-2 hover:translate-x-2 transition-transform">Xem Tất Cả <ArrowRight size={20} /></Link>
          </div>
          
          <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {filteredAnimals.map((animal, index) => (
              <div key={animal.id} style={{ animationDelay: `${index * 100}ms` }} className="animate-fadeIn">
                  <AnimalCard 
                      animal={animal} 
                      onAction={(action) => handleAction(action, animal)}
                  />
              </div>
            ))}
          </div>
        </section>

        {/* How It Works (Steps) */}
        <section id="how-it-works" className="mb-20" style={{ padding: '4rem 2rem', background: '#f8f9fa', borderRadius: '32px', position: 'relative', overflow: 'hidden' }}>
           <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '8px', background: 'linear-gradient(to right, var(--primary), var(--secondary), var(--warning))' }}></div>
           <div style={{ textAlign: 'center', marginBottom: '4rem', maxWidth: '42rem', margin: '0 auto 4rem' }}>
              <h3 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 800 }}>Quy Trình Nhận Nuôi</h3>
              <p style={{ color: 'var(--gray)', fontSize: '1.1rem' }}>Ba bước đơn giản để đón thành viên mới về nhà.</p>
           </div>
           
           <div className="steps-grid">
              <div className="hidden md:block" style={{ position: 'absolute', top: '3rem', left: '16%', right: '16%', height: '2px', background: '#e5e7eb', zIndex: 0 }}></div>
              
              {[
                { icon: Search, color: 'var(--primary)', title: '1. Tìm Kiếm', desc: 'Tìm kiếm thú cưng phù hợp với bạn.' },
                { icon: Calendar, color: 'var(--secondary)', title: '2. Gặp Gỡ', desc: 'Đặt lịch hẹn với trạm cứu hộ để làm quen.' },
                { icon: CheckCircle, color: 'var(--success)', title: '3. Nhận Nuôi', desc: 'Hoàn tất thủ tục và đón bé về nhà.' }
              ].map((step, i) => (
                  <div key={i} className="hover-lift" style={{ textAlign: 'center', position: 'relative', zIndex: 1, padding: '1rem' }}>
                     <div style={{ 
                        width: '80px', height: '80px', background: 'white', borderRadius: '50%', margin: '0 auto 1.5rem', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                        border: `2px solid ${step.color}`
                     }}>
                        <step.icon color={step.color} size={32} />
                     </div>
                     <h4 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 700 }}>{step.title}</h4>
                     <p style={{ color: 'var(--gray)', fontSize: '1rem', padding: '0 1rem' }}>{step.desc}</p>
                  </div>
              ))}
           </div>
        </section>

        {/* Community Success Stories */}
        <section id="stories" className="mb-20">
           <h3 style={{ fontSize: '2.5rem', marginBottom: '3rem', textAlign: 'center', fontWeight: 800 }}>Câu Chuyện Hạnh Phúc</h3>
           <div style={{ display: 'flex', gap: '2rem', overflowX: 'auto', paddingBottom: '2rem', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }} className="hide-scrollbar">
              {stories.map(story => (
                <div key={story.id} className="card hover-lift" style={{ width: '350px', padding: 0, overflow: 'hidden', border: 'none', borderRadius: '20px', scrollSnapAlign: 'center', flexShrink: 0 }}>
                  <div style={{ height: '240px', overflow: 'hidden', position: 'relative' }}>
                      <img src={story.img} alt={story.title} className="card-img-zoom" />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)', display: 'flex', alignItems: 'flex-end', padding: '1.5rem' }}>
                         <h4 style={{ color: 'white', fontSize: '1.4rem', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{story.title}</h4>
                      </div>
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                     <p style={{ color: 'var(--gray)', fontSize: '1rem', lineHeight: 1.6 }}>{story.text}</p>
                  </div>
                </div>
              ))}
           </div>
        </section>

        {/* Partner Shelters Carousel */}
        <section className="mb-20">
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 700 }}>Đối Tác Tin Cậy</h3>
                <p style={{ color: 'var(--gray)', fontSize: '1.1rem' }}>Hợp tác cùng các trạm cứu hộ trên toàn quốc.</p>
            </div>
            
            <div ref={carouselRef} style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', padding: '1rem 0 2rem', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', maxWidth: '1200px', margin: '0 auto' }} className="hide-scrollbar">
                {[
                    { name: 'Happy Paws Rescue', img: 'https://images.unsplash.com/photo-1601758177266-bc599de8770c?auto=format&fit=crop&w=600&q=80' },
                    { name: 'Saigon Animal Shelter', img: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=600&q=80' },
                    { name: 'Danang Pet Care', img: 'https://images.unsplash.com/photo-1599182186790-264663bb53e1?auto=format&fit=crop&w=600&q=80' },
                    { name: 'Mountain Rescue', img: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=600&q=80' },
                    { name: 'Hanoi Love Pets', img: 'https://images.unsplash.com/photo-1548681528-6a5c45b63b80?auto=format&fit=crop&w=600&q=80' }
                ].map((shelter, i) => (
                    <div key={i} className="hover-lift" style={{ 
                        flex: '0 0 auto',
                        width: '265px', 
                        height: '400px', 
                        borderRadius: '24px', 
                        overflow: 'hidden', 
                        position: 'relative', 
                        scrollSnapAlign: 'center',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
                        cursor: 'pointer'
                    }}>
                        <img src={shelter.img} alt={shelter.name} className="card-img-zoom" />
                        <div style={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            left: 0, 
                            width: '100%', 
                            padding: '3rem 1.5rem 1.5rem', 
                            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'flex-end'
                        }}>
                            <div>
                                <h4 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.25rem', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>{shelter.name}</h4>
                                <span style={{ fontSize: '0.9rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <MapPin size={14} /> Xem chi tiết
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* Newsletter */}
        <section style={{ padding: '3rem 1.5rem', background: 'var(--dark)', borderRadius: '24px', color: 'white', textAlign: 'center' }}>
            <Mail size={48} color="var(--primary)" style={{ marginBottom: '1rem', display: 'inline-block' }} />
            <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Đừng Bỏ Lỡ Thông Tin</h3>
            <p style={{ opacity: 0.8, marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>Đăng ký để nhận tin tức mới nhất về các hoạt động cứu hộ.</p>
            <div className="newsletter-form">
                <input type="email" placeholder="Nhập email của bạn" className="newsletter-input" />
                <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>Đăng Ký</button>
            </div>
        </section>

      </main>
      
      {/* Footer */}
      <footer style={{ background: '#f8f9fa', color: 'var(--dark)', padding: '4rem 2rem', marginTop: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem' }}>
            <div>
               <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><PawPrint size={20} /> PetRescue</h4>
               <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>Làm cho thế giới tốt đẹp hơn, từng bé một.</p>
            </div>
            <div>
               <h4 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Liên Kết</h4>
               <ul style={{ listStyle: 'none', color: 'var(--gray)', fontSize: '0.9rem', lineHeight: '2' }}>
                  <li><a href="#">Về Chúng Tôi</a></li>
                  <li><a href="#">Tình Nguyện</a></li>
                  <li><a href="#">Quyên Góp</a></li>
                  <li><a href="#">Điều Khoản</a></li>
               </ul>
            </div>
            <div>
               <h4 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Liên Hệ</h4>
               <p style={{ color: 'var(--gray)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>123 Đường Cứu Hộ, TP.HCM</p>
               <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>hello@petrescue.com</p>
            </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #eee', color: 'var(--gray)', fontSize: '0.8rem' }}>
            &copy; 2026 Animal Rescue Platform. Built for EXE101 Demo.
        </div>
      </footer>

      {/* --- MODALS --- */}
      {/* Adoption Form Modal (New) */}
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
         <form onSubmit={handleDonate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <div style={{ padding: '1rem', background: '#eff6ff', color: '#1e40af', borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Đóng góp của bạn giúp cung cấp thức ăn và y tế cho <strong>{selectedAnimal?.name}</strong>.
             </div>
             
             <label style={{ fontWeight: 'bold', fontSize: '0.875rem', color: '#4b5563' }}>Chọn Số Tiền</label>
             <div style={{ display: 'flex', gap: '0.5rem' }}>
                 {['50k', '100k', '200k', '500k'].map(amt => (
                     <button type="button" key={amt} className="btn-outline" style={{ flex: 1, padding: '0.5rem 0', borderRadius: '0.5rem', borderColor: '#e5e7eb', color: 'var(--dark)' }}>{amt}</button>
                 ))}
             </div>
             
             <input type="text" placeholder="Số tiền khác" style={{ padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', width: '100%' }} />
             
             <div style={{ position: 'relative' }}>
                 <CreditCard size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                 <input type="text" placeholder="Số thẻ ngân hàng" style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }} />
             </div>
             
             <button className="btn btn-success" style={{ backgroundColor: 'var(--success)', color: 'white', justifyContent: 'center', marginTop: '0.5rem' }}>Quyên Góp Ngay</button>
         </form>
      </Modal>

      <Modal isOpen={activeModal === 'success_donate'} onClose={() => setActiveModal(null)} title="Quyên Góp Thành Công!">
         <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
             <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
             <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Cảm Ơn Tấm Lòng Của Bạn!</h3>
             <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>Chúng tôi đã nhận được quyên góp của bạn.</p>
             <button onClick={() => setActiveModal(null)} className="btn btn-primary">Đóng</button>
         </div>
      </Modal>

    </div>
  );
};

export default UserLandingPage;

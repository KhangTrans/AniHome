import React, { useState } from 'react';
import AnimalCard from '../../components/AnimalCard';
import { Plus, Search, Filter } from 'lucide-react';

const AnimalManager = () => {
  const [animals, setAnimals] = useState([
    {
      id: 1,
      name: 'Buddy',
      breed: 'Golden Retriever',
      status: 'Ready for Adoption',
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80',
      description: 'Friendly and energetic, loves to play fetch.'
    },
    {
      id: 2,
      name: 'Luna',
      breed: 'Siamese Cat',
      status: 'Under Treatment',
      image: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=400&q=80',
      description: 'Recovering from a minor surgery. Sweet natured.'
    },
    {
      id: 3,
      name: 'Max',
      breed: 'German Shepherd',
      status: 'Ready for Adoption',
      image: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=400&q=80',
      description: 'Trained and loyal. Good with kids.'
    }
  ]);

  const [filter, setFilter] = useState('All');

  const filteredAnimals = filter === 'All' ? animals : animals.filter(a => a.status === filter);

  return (
    <div style={{ padding: '2rem' }}>
       <div className="flex justify-between items-center mb-6">
         <h1>Animal Profiles</h1>
         <button className="btn btn-primary"><Plus size={18} /> Add New Profile</button>
       </div>

       {/* Toolbar */}
       <div className="card mb-6 flex gap-4 items-center p-3">
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)' }} />
            <input 
              type="text" 
              placeholder="Search by name..." 
              style={{ width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.2rem', borderRadius: '8px', border: '1px solid #eee' }} 
            />
          </div>
          <div className="flex gap-2">
             {['All', 'Ready for Adoption', 'Under Treatment', 'Adopted'].map(status => (
               <button 
                 key={status}
                 onClick={() => setFilter(status)}
                 className={`btn ${filter === status ? 'btn-secondary' : 'btn-outline'}`}
                 style={{ fontSize: '0.8rem' }}
               >
                 {status}
               </button>
             ))}
          </div>
       </div>

       <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {filteredAnimals.map(animal => (
            <AnimalCard key={animal.id} animal={animal} isAdmin={true} onAction={(action) => alert(`${action} on ${animal.name}`)} />
          ))}
       </div>
    </div>
  );
};

export default AnimalManager;

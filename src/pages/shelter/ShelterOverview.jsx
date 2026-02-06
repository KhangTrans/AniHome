import React from 'react';
import { 
  Package, 
  MapPin, 
  Plus,
  Clock,
  TrendingUp,
  PawPrint
} from 'lucide-react';

const ShelterOverview = () => {
  const stats = [
    { label: 'Total Animals', value: '45', icon: <PawPrint size={24} color="var(--primary)" />, color: '#FFEaa7' },
    { label: 'Adoptions (Month)', value: '12', icon: <TrendingUp size={24} color="var(--success)" />, color: '#55efc4' },
    { label: 'Pending Apps', value: '8', icon: <Clock size={24} color="var(--warning)" />, color: '#ffeab6' },
    { label: 'Low Stock Items', value: '3', icon: <Package size={24} color="var(--danger)" />, color: '#ffb8b8' },
  ];

  return (
    <div style={{ padding: '2rem' }}>
       {/* Header */}
       <div className="card mb-6" style={{ 
          backgroundImage: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)', 
          color: 'white',
          border: 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Happy Paws Rescue</h1>
            <div className="flex items-center gap-2">
              <MapPin size={18} />
              <span>123 Rescue Lane, Springfield</span>
            </div>
          </div>
          <button className="btn" style={{ background: 'white', color: 'var(--primary)' }}>
            <Plus size={18} /> Quick Register
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
           {stats.map((stat, index) => (
             <div key={index} className="card flex items-center gap-4">
                <div style={{ padding: '1rem', borderRadius: '50%', background: stat.color }}>
                  {stat.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.8rem', margin: 0 }}>{stat.value}</h3>
                  <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>{stat.label}</p>
                </div>
             </div>
           ))}
        </div>

        {/* Quick Actions / Recent Activity */}
        <div className="grid gap-4" style={{ gridTemplateColumns: '2fr 1fr' }}>
           <div className="card">
             <h3>Recent Activity</h3>
             <ul style={{ listStyle: 'none', marginTop: '1rem' }}>
               <li className="flex justify-between p-3 border-b">
                 <span>Matched <strong>Buddy</strong> with John Doe</span>
                 <span style={{ color: 'var(--gray)', fontSize: '0.8rem' }}>2 mins ago</span>
               </li>
               <li className="flex justify-between p-3 border-b">
                 <span>Updated health record for <strong>Luna</strong></span>
                 <span style={{ color: 'var(--gray)', fontSize: '0.8rem' }}>1 hour ago</span>
               </li>
               <li className="flex justify-between p-3">
                 <span>Received donation: 20kg Dog Food</span>
                 <span style={{ color: 'var(--gray)', fontSize: '0.8rem' }}>3 hours ago</span>
               </li>
             </ul>
           </div>
           
           <div className="card" style={{ backgroundColor: '#fff5f5', border: '1px solid #fed7d7' }}>
             <h3 style={{ color: 'var(--danger)' }}>Urgent Alerts</h3>
             <ul style={{ listStyle: 'none', marginTop: '1rem' }}>
               <li className="mb-2">⚠️ <strong>Vaccine Low:</strong> Rabies Shot</li>
               <li className="mb-2">⚠️ <strong>Vet Visit:</strong> Max (Leg Injury)</li>
             </ul>
           </div>
        </div>
    </div>
  );
};

export default ShelterOverview;

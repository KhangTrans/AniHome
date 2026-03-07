import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  CheckSquare, 
  Heart, 
  FileText, 
  Camera, 
  Upload, 
  Bell, 
  User, 
  LogOut,
  Calendar,
  ClipboardList
} from 'lucide-react';

const VolunteerDashboard = () => {
  const { user, logout } = useAuth();
  
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Feed the dogs in Kennel A', done: false, time: '08:00 AM' },
    { id: 2, text: 'Walk Max for 30 mins', done: true, time: '09:30 AM' },
    { id: 3, text: 'Update medical log for Luna', done: false, time: '11:00 AM' },
    { id: 4, text: 'Clean Cat Room B', done: false, time: '02:00 PM' },
  ]);

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const assignedAnimals = [
    { name: 'Max', breed: 'German Shepherd', image: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=150&q=80', task: 'Walk 4pm' },
    { name: 'Bella', breed: 'Siamese', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=150&q=80', task: 'Medication' },
    { name: 'Rocky', breed: 'Bulldog', image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=150&q=80', task: 'Bonding' },
  ];

  return (
    <div style={{ backgroundColor: 'var(--light)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Web Header */}
      <nav style={{ 
        backgroundColor: 'var(--white)', 
        padding: '1rem 2rem', 
        borderBottom: '1px solid #eee', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div className="flex items-center gap-2">
          <Heart fill="var(--primary)" color="var(--primary)" />
          <h1 style={{ fontSize: '1.25rem', color: 'var(--dark)', margin: 0 }}>Volunteer Portal</h1>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex items-center gap-3">
              <div style={{ textAlign: 'right', display: 'none', paddingRight: '10px' }} className="md:block">
                 <p style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: 0 }}>{user?.name || 'Volunteer'}</p>
                 <p style={{ fontSize: '0.8rem', color: 'var(--gray)', margin: 0 }}>Volunteer</p>
              </div>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <User size={20} />
              </div>
           </div>
           
           <div style={{ width: '1px', height: '24px', background: '#eee' }}></div>
           
           <button 
             onClick={logout} 
             className="btn btn-outline" 
             style={{ border: 'none', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
           >
             <LogOut size={18} /> Logout
           </button>
        </div>
      </nav>

      <main style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '2rem' }}>
        
        {/* Welcome Section */}
        <div className="mb-8">
           <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Hello, {user?.name?.split(' ')[0] || 'Friend'}!</h2>
           <p style={{ color: 'var(--gray)' }}>Thank you for making a difference today. Here is your schedule.</p>
        </div>

        <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
           
           {/* Left Column: Tasks */}
           <div className="flex flex-col gap-6">
              
              {/* Task Checklist */}
              <div className="card">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                     <ClipboardList color="var(--primary)" />
                     <h3 style={{ margin: 0 }}>Today's Tasks</h3>
                  </div>
                  <span className="badge badge-warning">{tasks.filter(t => !t.done).length} Pending</span>
                </div>
                
                <div className="flex flex-col gap-3">
                  {tasks.map(task => (
                    <div key={task.id} 
                      onClick={() => toggleTask(task.id)}
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '1rem', 
                        padding: '1rem',
                        background: task.done ? '#f9fafb' : 'white',
                        border: '1px solid #eee',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        borderLeft: task.done ? '4px solid var(--success)' : '4px solid var(--warning)'
                      }}
                    >
                      <div style={{ 
                        flexShrink: 0,
                        width: '24px', height: '24px', borderRadius: '6px', 
                        border: `2px solid ${task.done ? 'var(--success)' : '#ddd'}`,
                        background: task.done ? 'var(--success)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white'
                      }}>
                        {task.done && <CheckSquare size={16} />}
                      </div>
                      <div style={{ flex: 1 }}>
                         <p style={{ 
                           textDecoration: task.done ? 'line-through' : 'none',
                           fontWeight: 500,
                           color: task.done ? 'var(--gray)' : 'var(--dark)',
                           margin: 0
                         }}>{task.text}</p>
                         <p style={{ fontSize: '0.8rem', color: 'var(--gray)', marginTop: '2px' }}>
                           <ClockIconHelper /> {task.time}
                         </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Log Entry */}
              <div className="card">
                 <div className="flex items-center gap-2 mb-4">
                    <FileText color="var(--primary)" />
                    <h3 style={{ margin: 0 }}>Daily Activity Log</h3>
                 </div>
                 <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '1rem' }}>
                    <textarea 
                      placeholder="Note any observations about the animals or facility..." 
                      style={{ 
                        width: '100%', border: 'none', background: 'transparent', resize: 'vertical', 
                        outline: 'none', minHeight: '100px', fontFamily: 'inherit', fontSize: '1rem'
                      }} 
                    />
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                      <button className="btn btn-outline" style={{ fontSize: '0.9rem' }}>
                        <Camera size={18} /> Add Photo
                      </button>
                      <button className="btn btn-primary">Save Log</button>
                    </div>
                 </div>
              </div>

           </div>

           {/* Right Column: Assigned Animals & Quick Actions */}
           <div className="flex flex-col gap-6">
              
              {/* Assigned Animals Grid */}
              <div className="card">
                 <h3 className="mb-4">Assigned Friends</h3>
                 <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
                    {assignedAnimals.map((animal, i) => (
                      <div key={i} style={{ 
                        border: '1px solid #eee', borderRadius: '12px', padding: '1rem',
                        textAlign: 'center', transition: 'transform 0.2s', cursor: 'pointer'
                      }} className="hover:shadow-md">
                         <div style={{ 
                           width: '80px', height: '80px', borderRadius: '50%', 
                           margin: '0 auto 0.5rem', overflow: 'hidden',
                           border: '3px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' 
                         }}>
                            <img src={animal.image} alt={animal.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                         </div>
                         <h4 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{animal.name}</h4>
                         <p style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>{animal.breed}</p>
                         <div style={{ 
                           marginTop: '0.5rem', background: '#e0f2fe', color: '#0369a1', 
                           fontSize: '0.75rem', padding: '4px 8px', borderRadius: '20px', fontWeight: 'bold' 
                         }}>
                           {animal.task}
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

               {/* Quick Actions */}
              <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #ff9a9e 100%)', color: 'white', border: 'none' }}>
                 <h3 className="mb-4" style={{ color: 'white' }}>Quick Actions</h3>
                 <div className="grid grid-cols-2 gap-3">
                    <button className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', justifyContent: 'center' }}>
                       <Upload size={18} /> Health Report
                    </button>
                    <button className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', justifyContent: 'center' }}>
                       <Bell size={18} /> Emergency
                    </button>
                 </div>
              </div>

           </div>

        </div>
      </main>
    </div>
  );
};

const ClockIconHelper = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', verticalAlign: 'middle', marginBottom: '1px' }}>
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

export default VolunteerDashboard;

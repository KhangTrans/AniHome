import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, User, ChevronLeft, ChevronRight } from 'lucide-react';

const ScheduleManager = () => {
  const [appointments, setAppointments] = useState([
    { id: 1, title: 'Adoption Interview with John Doe', time: '10:00 AM', date: '2026-02-07', type: 'interview' },
    { id: 2, title: 'Vet Visit for Luna', time: '2:00 PM', date: '2026-02-07', type: 'medical' },
    { id: 3, title: 'Supply Delivery', time: '4:30 PM', date: '2026-02-07', type: 'logistics' },
    { id: 4, title: 'Volunteer Orientation', time: '9:00 AM', date: '2026-02-08', type: 'general' },
  ]);

  return (
    <div style={{ padding: '2rem' }}>
      <div className="flex justify-between items-center mb-6">
        <h1>Schedule</h1>
        <div className="flex gap-2">
           <button className="btn btn-outline"><ChevronLeft size={18} /></button>
           <button className="btn btn-outline">Today</button>
           <button className="btn btn-outline"><ChevronRight size={18} /></button>
        </div>
      </div>

      <div className="grid gap-6" style={{ gridTemplateColumns: '300px 1fr' }}>
         {/* Sidebar / Filters */}
         <div className="card h-fit">
            <h3 className="mb-4">Upcoming Events</h3>
            <div className="flex flex-col gap-3">
              {appointments.map(appt => (
                <div key={appt.id} style={{ padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem', borderLeft: '4px solid #60a5fa' }}>
                   <h4 style={{ fontSize: '0.9rem', marginBottom: '4px', margin: 0 }}>{appt.title}</h4>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
                      <Clock size={12} /> {appt.date} at {appt.time}
                   </div>
                </div>
              ))}
            </div>
            <button className="btn btn-primary w-full mt-4" style={{ width: '100%' }}>Add Event</button>
         </div>

         {/* Calendar View Mockup */}
         <div className="card" style={{ minHeight: '500px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '0.5rem', fontWeight: 'bold', color: '#6b7280' }}>
               <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', height: '400px' }}>
               {/* Just a visual mock of a month view */}
               {Array.from({ length: 35 }).map((_, i) => (
                 <div key={i} style={{ border: '1px solid #e5e7eb', padding: '0.5rem', minHeight: '80px', position: 'relative', backgroundColor: i === 7 ? '#eff6ff' : 'transparent' }}>
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>{i + 1 <= 30 ? i + 1 : ''}</span>
                    {i === 6 && <div style={{ fontSize: '0.7rem', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '4px', padding: '2px 4px', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Vet Visit</div>}
                    {i === 6 && <div style={{ fontSize: '0.7rem', backgroundColor: '#dcfce7', color: '#16a34a', borderRadius: '4px', padding: '2px 4px', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Interview</div>}
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default ScheduleManager;

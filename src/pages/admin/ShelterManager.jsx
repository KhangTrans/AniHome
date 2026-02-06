import React, { useState } from 'react';
import { Home, Trash2, CheckCircle, Ban } from 'lucide-react';

const ShelterManager = () => {
  const [shelters, setShelters] = useState([
    { id: 1, name: 'Happy Paws Rescue', location: 'Springfield', status: 'Active', animals: 45 },
    { id: 2, name: 'City Animal Control', location: 'Downtown', status: 'Active', animals: 120 },
    { id: 3, name: 'New Hope Sanctuary', location: 'Westside', status: 'Pending', animals: 0 },
  ]);

  const toggleStatus = (id) => {
    setShelters(shelters.map(s => {
      if (s.id === id) return { ...s, status: s.status === 'Active' ? 'Blocked' : 'Active' };
      return s;
    }));
  };

  const approveShelter = (id) => {
      setShelters(shelters.map(s => s.id === id ? { ...s, status: 'Active' } : s));
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 className="mb-4">Shelter Management</h1>
      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
              <th className="p-4">Shelter Name</th>
              <th className="p-4">Location</th>
              <th className="p-4">Animals</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shelters.map(shelter => (
              <tr key={shelter.id} style={{ borderBottom: '1px solid #eee' }}>
                <td className="p-4 font-bold">{shelter.name}</td>
                <td className="p-4">{shelter.location}</td>
                <td className="p-4">{shelter.animals}</td>
                <td className="p-4">
                  <span className={`badge ${shelter.status === 'Active' ? 'badge-success' : shelter.status === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>
                    {shelter.status}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                  {shelter.status === 'Pending' ? (
                      <button className="btn btn-success" onClick={() => approveShelter(shelter.id)} style={{ padding: '0.4rem', color: 'white', background: 'var(--success)' }}>
                         <CheckCircle size={16} /> Approve
                      </button>
                  ) : (
                      <button className="btn btn-outline" onClick={() => toggleStatus(shelter.id)} style={{ padding: '0.4rem' }}>
                        {shelter.status === 'Active' ? <Ban size={16} /> : <CheckCircle size={16} />}
                      </button>
                  )}
                  <button className="btn btn-outline" style={{ padding: '0.4rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShelterManager;

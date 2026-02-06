import React from 'react';
import { 
  Download, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const AdminOverview = () => {
  const pieData = {
    labels: ['Successful', 'Returned', 'Pending'],
    datasets: [
      {
        data: [75, 5, 20],
        backgroundColor: ['#2ECC71', '#E74C3C', '#F1C40F'],
        borderWidth: 0,
      },
    ],
  };

  const barData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Donations ($)',
        data: [12000, 19000, 3000, 5000, 2000, 3000],
        backgroundColor: '#4ECDC4',
        borderRadius: 8,
      },
      {
        label: 'Expenses ($)',
        data: [8000, 12000, 2500, 4000, 1500, 2800],
        backgroundColor: '#FF6B6B',
        borderRadius: 8,
      },
    ],
  };
    
  return (
      <div style={{ padding: '2rem' }}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 style={{ fontSize: '2rem', color: 'var(--dark)' }}>Admin Dashboard</h1>
            <p style={{ color: 'var(--gray)' }}>Welcome back, Administrator</p>
          </div>
          <button className="btn btn-primary">
            <Download size={18} /> Generate Financial Report
          </button>
        </div>

        {/* Charts Section */}
        <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 2fr', marginBottom: '2rem' }}>
          <div className="card">
            <h3 className="mb-4">Adoption Success Rate (Monthly)</h3>
            <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
              <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </div>
          <div className="card">
            <h3 className="mb-4">Donation & Expense Tracker</h3>
            <div style={{ height: '300px' }}>
              <Bar data={barData} options={{ maintainAspectRatio: false, responsive: true }} />
            </div>
          </div>
        </div>

        {/* Info Cards Section */}
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginBottom: '2rem' }}>
          {/* Pending Blog Posts */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3>Pending Blog Posts</h3>
              <span className="badge badge-warning">5 Pending</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center p-4" style={{ background: '#f8f9fa', borderRadius: '8px' }}>
                <div>
                  <h4 style={{ fontSize: '1rem' }}>My Rescue Journey</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>by Sarah J.</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-secondary" style={{ padding: '0.4rem' }} title="Approve"><CheckCircle size={18} /></button>
                  <button className="btn btn-outline" style={{ padding: '0.4rem', borderColor: 'var(--danger)', color: 'var(--danger)' }} title="Reject"><XCircle size={18} /></button>
                </div>
              </div>
              <div className="flex justify-between items-center p-4" style={{ background: '#f8f9fa', borderRadius: '8px' }}>
                <div>
                  <h4 style={{ fontSize: '1rem' }}>Top 10 Dog Treats</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>by Mark D.</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-secondary" style={{ padding: '0.4rem' }}><CheckCircle size={18} /></button>
                  <button className="btn btn-outline" style={{ padding: '0.4rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}><XCircle size={18} /></button>
                </div>
              </div>
            </div>
          </div>

          {/* User Reports */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3>User Reports</h3>
              <span className="badge badge-danger">3 Critical</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center p-4" style={{ background: '#FFF0F0', borderRadius: '8px' }}>
                <div>
                  <h4 style={{ fontSize: '1rem' }}>Inappropriate Comment</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>Reported by User123</p>
                </div>
                <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>Action</button>
              </div>
              <div className="flex justify-between items-center p-4" style={{ background: '#FFF0F0', borderRadius: '8px' }}>
                <div>
                  <h4 style={{ fontSize: '1rem' }}>Scam Alert</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>Reported by Anon</p>
                </div>
                <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>Action</button>
              </div>
            </div>
          </div>
        </div>

        {/* Supplies Inventory */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3>Supplies Inventory Overview</h3>
            <button className="btn btn-outline">Manage Inventory</button>
          </div>
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <InventoryItem name="Dog Food" quantity="450 kg" status="Good" />
            <InventoryItem name="Cat Litter" quantity="120 kg" status="Low" />
            <InventoryItem name="Medicine (Vaccines)" quantity="50 units" status="Critical" />
            <InventoryItem name="Blankets" quantity="200 pcs" status="Good" />
          </div>
        </div>
      </div>
  );
};

const InventoryItem = ({ name, quantity, status }) => {
  const getStatusColor = (s) => {
    if (s === 'Good') return 'var(--success)';
    if (s === 'Low') return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div style={{ 
      padding: '1.5rem', 
      border: `1px solid #eee`, 
      borderLeft: `4px solid ${getStatusColor(status)}`,
      borderRadius: '8px',
      background: '#fff' 
    }}>
      <h4 style={{ color: 'var(--gray)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{name}</h4>
      <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{quantity}</p>
      <span style={{ 
        color: getStatusColor(status), 
        fontWeight: 'bold', 
        fontSize: '0.8rem',
        background: `${getStatusColor(status)}20`,
        padding: '0.2rem 0.5rem',
        borderRadius: '4px'
      }}>{status} Stock</span>
    </div>
  );
};

export default AdminOverview;

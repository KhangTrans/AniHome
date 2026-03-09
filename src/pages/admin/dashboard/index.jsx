import React, { useState, useEffect } from 'react';
import { 
  Download, 
  CheckCircle, 
  XCircle,
  Users,
  Home,
  PawPrint,
  Heart
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { getAdminDashboard } from '../../../services/admin/adminDashboardService';
import { useToast } from '../../../context/ToastContext';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const AdminOverview = () => {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);

      const result = await getAdminDashboard();

      if (result.success) {
        setStats(result.data);
      } else {
        setError(result.error);
        toast.error('Không thể tải dữ liệu dashboard: ' + result.error);
      }

      setLoading(false);
    };

    fetchDashboard();
  }, [toast]);
  // Mock data for charts (will be replaced with API data later)
  const pieData = {
    labels: ['Successful', 'Returned', 'Pending'],
    datasets: [
      {
        data: stats ? [
          stats.successfulAdoptions || 75,
          stats.returnedAdoptions || 5,
          stats.pendingAdoptions || 20
        ] : [75, 5, 20],
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
        data: stats?.monthlyDonations || [12000, 19000, 3000, 5000, 2000, 3000],
        backgroundColor: '#4ECDC4',
        borderRadius: 8,
      },
      {
        label: 'Expenses ($)',
        data: stats?.monthlyExpenses || [8000, 12000, 2500, 4000, 1500, 2800],
        backgroundColor: '#FF6B6B',
        borderRadius: 8,
      },
    ],
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ 
          border: '4px solid #f3f3f3',
          borderTop: '4px solid var(--primary)',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ 
          background: '#fee2e2', 
          color: '#dc2626',
          padding: '2rem',
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <h3>⚠️ Không thể tải dữ liệu</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }
    
  return (
      <div>
        <div className="admin-page-header">
          <div className="admin-page-title-wrapper">
            <h1 className="admin-page-title">Admin Dashboard</h1>
            <p className="admin-page-subtitle">Welcome back, Administrator</p>
          </div>
          <div className="admin-page-actions">
            <button className="btn btn-primary">
              <Download size={18} /> 
              <span className="hide-mobile-text">Generate Financial Report</span>
              <span className="show-mobile-text">Report</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="admin-stats-grid">
            <StatCard
              title="Tổng Người Dùng"
              value={stats.totalUsers || 0}
              icon={<Users size={24} />}
              color="#3b82f6"
              change="+8.2%"
            />
            <StatCard
              title="Tổng Trạm Cứu Hộ"
              value={stats.totalShelters || 0}
              icon={<Home size={24} />}
              color="#10b981"
              change="+3 mới"
            />
            <StatCard
              title="Tổng Thú Cưng"
              value={stats.totalPets || 0}
              icon={<PawPrint size={24} />}
              color="#f59e0b"
              change={`${stats.availablePets || 0} sẵn sàng`}
            />
            <StatCard
              title="Tổng Nhận Nuôi"
              value={stats.totalAdoptions || 0}
              icon={<Heart size={24} />}
              color="#ef4444"
              change={`${stats.pendingAdoptions || 0} chờ duyệt`}
            />
          </div>
        )}

        {/* Charts Section */}
        <div className="admin-charts-grid">
          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Adoption Success Rate (Monthly)</h3>
            <div style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Donation & Expense Tracker</h3>
            <div style={{ height: '300px' }}>
              <Bar data={barData} options={{ maintainAspectRatio: false, responsive: true }} />
            </div>
          </div>
        </div>

        {/* Info Cards Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {/* Pending Blog Posts */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>Pending Blog Posts</h3>
              <span className="badge badge-warning">5 Pending</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                <div>
                  <h4 style={{ fontSize: '1rem' }}>My Rescue Journey</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>by Sarah J.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-secondary" style={{ padding: '0.4rem' }} title="Approve"><CheckCircle size={18} /></button>
                  <button className="btn btn-outline" style={{ padding: '0.4rem', borderColor: 'var(--danger)', color: 'var(--danger)' }} title="Reject"><XCircle size={18} /></button>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                <div>
                  <h4 style={{ fontSize: '1rem' }}>Top 10 Dog Treats</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>by Mark D.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-secondary" style={{ padding: '0.4rem' }}><CheckCircle size={18} /></button>
                  <button className="btn btn-outline" style={{ padding: '0.4rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}><XCircle size={18} /></button>
                </div>
              </div>
            </div>
          </div>

          {/* User Reports */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>User Reports</h3>
              <span className="badge badge-danger">3 Critical</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#FFF0F0', borderRadius: '8px' }}>
                <div>
                  <h4 style={{ fontSize: '1rem' }}>Inappropriate Comment</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--gray)' }}>Reported by User123</p>
                </div>
                <button className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>Action</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#FFF0F0', borderRadius: '8px' }}>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Supplies Inventory Overview</h3>
            <button className="btn btn-outline">Manage Inventory</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <InventoryItem name="Dog Food" quantity="450 kg" status="Good" />
            <InventoryItem name="Cat Litter" quantity="120 kg" status="Low" />
            <InventoryItem name="Medicine (Vaccines)" quantity="50 units" status="Critical" />
            <InventoryItem name="Blankets" quantity="200 pcs" status="Good" />
          </div>
        </div>
      </div>
  );
};

const StatCard = ({ title, value, icon, color, change }) => {
  return (
    <div className="card" style={{ 
      padding: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    }}>
      <div style={{ 
        background: `${color}20`,
        color: color,
        padding: '0.75rem',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ color: 'var(--gray)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>{title}</p>
        <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '0.25rem', color: 'var(--dark)' }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </h3>
        <p style={{ fontSize: '0.8rem', color: color, fontWeight: 600 }}>{change}</p>
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

import { useState, useEffect } from 'react';
import { getHomeStats, formatNumber, formatCurrency, calculateAdoptionRate } from '../services/public/homeStatsService';
import { Link } from 'react-router-dom';
import { Heart, Home, Users, DollarSign, TrendingUp, ArrowRight } from 'lucide-react';

/**
 * HOME STATS SECTION
 * Hiển thị thống kê tổng quan hệ thống (có thể dùng trong landing page)
 */
export default function HomeStatsSection() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      const result = await getHomeStats();

      setLoading(false);

      if (result.success) {
        setStats(result.data);
      } else {
        setError(result.error);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ 
          display: 'inline-block',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  if (error || !stats) {
    return null; // Don't show error, just hide the section
  }

  const adoptionRate = calculateAdoptionRate(stats.adoptedPets, stats.totalPets);

  return (
    <section style={{ 
      padding: '80px 20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '15px' }}>
            Our Impact in Numbers
          </h2>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
            Together, we're making a difference for animals in need
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '30px',
          marginBottom: '50px'
        }}>
          <StatCard
            icon={<Heart size={40} />}
            value={formatNumber(stats.totalPets)}
            label="Total Pets"
            color="#ef4444"
          />

          <StatCard
            icon={<TrendingUp size={40} />}
            value={formatNumber(stats.adoptedPets)}
            label="Successfully Adopted"
            color="#10b981"
            subtitle={`${adoptionRate}% adoption rate`}
          />

          <StatCard
            icon={<Home size={40} />}
            value={formatNumber(stats.totalShelters)}
            label="Partner Shelters"
            color="#8b5cf6"
          />

          <StatCard
            icon={<Users size={40} />}
            value={formatNumber(stats.totalVolunteers)}
            label="Volunteers"
            color="#f59e0b"
          />

          <StatCard
            icon={<DollarSign size={40} />}
            value={formatCurrency(stats.totalDonations)}
            label="Total Donations"
            color="#ec4899"
            fullWidth
          />
        </div>

        {/* CTA */}
        <div style={{ 
          textAlign: 'center',
          background: 'rgba(255,255,255,0.1)',
          padding: '40px',
          borderRadius: '16px',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ fontSize: '1.8rem', marginBottom: '15px' }}>
            Ready to Make a Difference?
          </h3>
          <p style={{ fontSize: '1.1rem', marginBottom: '30px', opacity: 0.9 }}>
            Join us in rescuing and finding homes for animals in need
          </p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/pets"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 32px',
                background: 'white',
                color: '#667eea',
                textDecoration: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: '600',
              }}
            >
              Adopt a Pet
              <ArrowRight size={20} />
            </Link>

            <Link
              to="/donation"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 32px',
                background: 'transparent',
                color: 'white',
                border: '2px solid white',
                textDecoration: 'none',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: '600',
              }}
            >
              Make a Donation
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
}

/**
 * Stat Card Component
 */
function StatCard({ icon, value, label, color, subtitle, fullWidth }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.15)',
      padding: '30px',
      borderRadius: '16px',
      backdropFilter: 'blur(10px)',
      textAlign: 'center',
      transition: 'transform 0.3s',
      gridColumn: fullWidth ? '1 / -1' : 'auto',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
    }}
    >
      <div style={{ 
        display: 'inline-flex',
        padding: '15px',
        background: color,
        borderRadius: '50%',
        marginBottom: '20px'
      }}>
        {icon}
      </div>

      <div style={{ 
        fontSize: fullWidth ? '3rem' : '2.5rem',
        fontWeight: '700',
        marginBottom: '10px'
      }}>
        {value}
      </div>

      <div style={{ 
        fontSize: '1.1rem',
        opacity: 0.9,
        fontWeight: '500'
      }}>
        {label}
      </div>

      {subtitle && (
        <div style={{ 
          fontSize: '0.9rem',
          opacity: 0.7,
          marginTop: '8px'
        }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

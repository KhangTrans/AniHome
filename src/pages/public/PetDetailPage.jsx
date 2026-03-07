import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPetById, formatPetAge } from '../../services/public/petsService';
import { ArrowLeft, MapPin, Calendar, Heart } from 'lucide-react';

/**
 * PET DETAIL PAGE
 * Hiển thị chi tiết thú cưng
 */
export default function PetDetailPage() {
  const { id } = useParams();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPetDetail = async () => {
      setLoading(true);
      setError(null);

      const result = await getPetById(id);

      setLoading(false);

      if (result.success) {
        setPet(result.data);
      } else {
        setError(result.error);
      }
    };

    fetchPetDetail();
  }, [id]);

  if (loading) {
    return (
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
        <p style={{ marginTop: '20px', color: '#666' }}>Loading pet details...</p>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div style={{ padding: '100px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>😿</div>
        <h2>Pet Not Found</h2>
        <p style={{ color: '#666', marginBottom: '30px' }}>{error || 'This pet does not exist'}</p>
        <Link to="/pets" style={{
          display: 'inline-block',
          padding: '12px 30px',
          background: '#3b82f6',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: '600',
        }}>
          Back to Pets List
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Back Button */}
      <div style={{ 
        background: 'white', 
        borderBottom: '1px solid #e5e7eb',
        padding: '20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Link 
            to="/pets"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: '#3b82f6',
              textDecoration: 'none',
              fontSize: '1rem',
              fontWeight: '500',
            }}
          >
            <ArrowLeft size={20} />
            Back to Pets
          </Link>
        </div>
      </div>

      {/* Pet Detail Content */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '40px 20px' 
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr',
          gap: '40px',
          '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr'
          }
        }}>
          {/* Left: Image */}
          <div>
            <div style={{
              background: `url(${pet.imageUrl}) center/cover no-repeat, #f3f4f6`,
              height: '500px',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }} />
          </div>

          {/* Right: Info */}
          <div>
            {/* Status Badge */}
            <div style={{ 
              display: 'inline-block',
              background: pet.status === 'Available' ? '#d1fae5' : '#fee2e2',
              color: pet.status === 'Available' ? '#10b981' : '#ef4444',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: '600',
              marginBottom: '20px'
            }}>
              {pet.status}
            </div>

            <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{pet.name}</h1>
            <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '30px' }}>
              {pet.breed}
            </p>

            {/* Quick Info Grid */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '20px',
              marginBottom: '30px'
            }}>
              <InfoItem label="Age" value={formatPetAge(pet.age)} />
              <InfoItem label="Gender" value={pet.gender} />
              <InfoItem label="Size" value={pet.size} />
              <InfoItem label="Weight" value={`${pet.weight} kg`} />
              <InfoItem label="Color" value={pet.color} />
              <InfoItem label="Vaccinated" value={pet.vaccinated ? 'Yes ✓' : 'No'} />
            </div>

            {/* Location */}
            {pet.shelterName && (
              <div style={{ 
                background: '#f3f4f6',
                padding: '15px',
                borderRadius: '12px',
                marginBottom: '30px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <MapPin size={20} color="#666" />
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>Shelter</div>
                  <div style={{ fontWeight: '600' }}>{pet.shelterName}</div>
                </div>
              </div>
            )}

            {/* Description */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '15px' }}>About {pet.name}</h3>
              <p style={{ 
                color: '#666',
                lineHeight: '1.8',
                fontSize: '1rem'
              }}>
                {pet.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '15px' }}>
              <Link
                to={`/adoption/${pet.id}`}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: '#3b82f6',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Heart size={20} />
                Adopt {pet.name}
              </Link>

              <button style={{
                padding: '16px 24px',
                background: 'white',
                color: '#3b82f6',
                border: '2px solid #3b82f6',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}>
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/**
 * Info Item Component
 */
function InfoItem({ label, value }) {
  return (
    <div style={{
      background: 'white',
      padding: '15px',
      borderRadius: '12px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '5px' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>
        {value}
      </div>
    </div>
  );
}

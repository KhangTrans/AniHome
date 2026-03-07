import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

/**
 * DONATION SUCCESS PAGE
 * Hiển thị sau khi thanh toán VNPay thành công
 */
export default function DonationSuccessPage() {
  useEffect(() => {
    // Optional: Track donation success in analytics
    console.log('Donation successful');
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '60px 40px',
        maxWidth: '600px',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Success Icon */}
        <div style={{
          width: '100px',
          height: '100px',
          background: '#d1fae5',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 30px',
          animation: 'scaleIn 0.5s ease-out'
        }}>
          <CheckCircle size={60} color="#10b981" strokeWidth={2.5} />
        </div>

        {/* Success Message */}
        <h1 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '15px',
          color: '#1f2937'
        }}>
          Thank You! 🎉
        </h1>

        <p style={{ 
          fontSize: '1.2rem',
          color: '#666',
          marginBottom: '30px',
          lineHeight: '1.8'
        }}>
          Your donation has been received successfully!<br />
          You're making a difference in the lives of rescued animals.
        </p>

        {/* Info Box */}
        <div style={{
          background: '#f9fafb',
          padding: '25px',
          borderRadius: '12px',
          marginBottom: '30px',
          textAlign: 'left'
        }}>
          <h3 style={{ 
            fontSize: '1.1rem', 
            marginBottom: '15px',
            color: '#374151'
          }}>
            What happens next?
          </h3>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            margin: 0,
            color: '#6b7280',
            fontSize: '1rem',
            lineHeight: '2'
          }}>
            <li>✅ Receipt sent to your email</li>
            <li>✅ Your donation will help feed and care for rescued animals</li>
            <li>✅ You'll receive updates on our rescue efforts</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '15px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <Link
            to="/"
            style={{
              padding: '14px 30px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
            }}
          >
            Back to Home
          </Link>

          <Link
            to="/pets"
            style={{
              padding: '14px 30px',
              background: 'white',
              color: '#667eea',
              border: '2px solid #667eea',
              textDecoration: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '600',
            }}
          >
            Browse Pets
          </Link>
        </div>

        {/* Share Section */}
        <div style={{ 
          marginTop: '40px',
          paddingTop: '30px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <p style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '15px' }}>
            Help us spread the word! Share with your friends:
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <ShareButton platform="facebook" />
            <ShareButton platform="twitter" />
            <ShareButton platform="linkedin" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Share Button Component
 */
function ShareButton({ platform }) {
  const toast = useToast();
  const configs = {
    facebook: { 
      label: 'Facebook', 
      color: '#1877f2',
      icon: '📘'
    },
    twitter: { 
      label: 'Twitter', 
      color: '#1da1f2',
      icon: '🐦'
    },
    linkedin: { 
      label: 'LinkedIn', 
      color: '#0a66c2',
      icon: '💼'
    },
  };

  const config = configs[platform];

  return (
    <button
      onClick={() => {
        toast.info(`Share on ${config.label}!`);
        // Implement actual share logic here
      }}
      style={{
        padding: '10px 20px',
        background: config.color,
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '600',
      }}
    >
      {config.icon} {config.label}
    </button>
  );
}

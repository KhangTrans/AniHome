import { Link } from 'react-router-dom';
import { XCircle, RefreshCw } from 'lucide-react';

/**
 * DONATION FAILED PAGE
 * Hiển thị khi thanh toán VNPay thất bại hoặc bị hủy
 */
export default function DonationFailedPage() {
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
        {/* Failed Icon */}
        <div style={{
          width: '100px',
          height: '100px',
          background: '#fee2e2',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 30px',
          animation: 'shake 0.5s ease-out'
        }}>
          <XCircle size={60} color="#ef4444" strokeWidth={2.5} />
        </div>

        {/* Failed Message */}
        <h1 style={{ 
          fontSize: '2.5rem', 
          marginBottom: '15px',
          color: '#1f2937'
        }}>
          Payment Failed
        </h1>

        <p style={{ 
          fontSize: '1.2rem',
          color: '#666',
          marginBottom: '30px',
          lineHeight: '1.8'
        }}>
          Your donation could not be processed.<br />
          This might be due to payment cancellation or a technical issue.
        </p>

        {/* Common Reasons */}
        <div style={{
          background: '#fef3c7',
          padding: '25px',
          borderRadius: '12px',
          marginBottom: '30px',
          textAlign: 'left'
        }}>
          <h3 style={{ 
            fontSize: '1.1rem', 
            marginBottom: '15px',
            color: '#92400e'
          }}>
            Common reasons:
          </h3>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            margin: 0,
            color: '#78350f',
            fontSize: '1rem',
            lineHeight: '2'
          }}>
            <li>❌ Payment was cancelled</li>
            <li>❌ Insufficient account balance</li>
            <li>❌ Network connection issue</li>
            <li>❌ Invalid card information</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '15px',
          marginBottom: '30px'
        }}>
          <Link
            to="/donation"
            style={{
              padding: '16px 30px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <RefreshCw size={20} />
            Try Again
          </Link>

          <Link
            to="/"
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
            Back to Home
          </Link>
        </div>

        {/* Help Section */}
        <div style={{ 
          marginTop: '30px',
          paddingTop: '30px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <p style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '10px' }}>
            Need help? Contact us:
          </p>
          <div style={{ 
            display: 'flex', 
            gap: '20px', 
            justifyContent: 'center',
            flexWrap: 'wrap',
            color: '#667eea',
            fontSize: '0.95rem',
            fontWeight: '500'
          }}>
            <a href="mailto:support@example.com" style={{ color: 'inherit', textDecoration: 'none' }}>
              📧 support@example.com
            </a>
            <a href="tel:+84123456789" style={{ color: 'inherit', textDecoration: 'none' }}>
              📞 +84 123 456 789
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-10px);
          }
          75% {
            transform: translateX(10px);
          }
        }
      `}</style>
    </div>
  );
}

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Home, Heart, Share2, Sparkles, ArrowRight } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { Button, Typography, Space, Card } from 'antd';

const { Title, Text } = Typography;

/**
 * TRANG CẢM ƠN (DONATION SUCCESS PAGE)
 * Hiển thị sau khi quyên góp thành công
 */
export default function DonationSuccessPage() {
  const toast = useToast();

  useEffect(() => {
    // Hiệu ứng pháo hoa hoặc log analytics
    console.log('Quyên góp thành công!');
    // Có thể thêm hiệu ứng confetti ở đây nếu có thư viện
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
      padding: '40px 20px'
    }}>
      <Card
        style={{
          borderRadius: '32px',
          padding: '40px',
          maxWidth: '650px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 30px 60px rgba(0,0,0,0.15)',
          border: 'none',
        }}
        bodyStyle={{ padding: 0 }}
      >
        {/* Success Icon with animation */}
        <div style={{
          width: '120px',
          height: '120px',
          background: '#ecfdf5',
          borderRadius: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 32px',
          transform: 'rotate(-5deg)',
          boxShadow: '0 20px 40px rgba(16, 185, 129, 0.1)'
        }}>
          <CheckCircle size={70} color="#10b981" strokeWidth={2.5} />
        </div>

        {/* Success Message */}
        <Title level={1} style={{ 
          fontSize: '2.8rem', 
          marginBottom: '16px',
          fontWeight: '800',
          color: '#1e293b',
          letterSpacing: '-1px'
        }}>
          Cảm Ơn Bạn! 🎉
        </Title>

        <p style={{ 
          fontSize: '1.25rem',
          color: '#64748b',
          marginBottom: '40px',
          lineHeight: '1.6',
          maxWidth: '500px',
          margin: '0 auto 40px'
        }}>
          Khoản quyên góp của bạn đã được tiếp nhận thành công. Bạn vừa thực hiện một hành động vô cùng ý nghĩa cho các bé thú cưng!
        </p>

        {/* Impact Box */}
        <div style={{
          background: '#f8fafc',
          padding: '30px',
          borderRadius: '24px',
          marginBottom: '40px',
          textAlign: 'left',
          border: '1px solid #e2e8f0'
        }}>
          <Title level={4} style={{ 
            fontSize: '1.1rem', 
            marginBottom: '20px',
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Sparkles size={20} color="#f59e0b" fill="#f59e0b" /> Điều gì sẽ xảy ra tiếp theo?
          </Title>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0, 
            margin: 0,
            color: '#475569',
            fontSize: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <li style={{ display: 'flex', gap: '12px' }}>
              <Text strong style={{ color: '#10b981' }}>✓</Text> 
              Thông báo xác nhận đã được gửi đến email của bạn.
            </li>
            <li style={{ display: 'flex', gap: '12px' }}>
              <Text strong style={{ color: '#10b981' }}>✓</Text> 
              Số tiền này sẽ được dùng để cung cấp thức ăn và y tế cho các bé.
            </li>
            <li style={{ display: 'flex', gap: '12px' }}>
              <Text strong style={{ color: '#10b981' }}>✓</Text> 
              Bạn có thể theo dõi hành trình của các bé qua mục tin tức.
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '16px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '32px'
        }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Button
              type="primary"
              size="large"
              icon={<Home size={18} />}
              style={{
                height: '56px',
                padding: '0 32px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                border: 'none',
                borderRadius: '16px',
                fontSize: '1rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 10px 20px rgba(79, 70, 229, 0.25)'
              }}
            >
              Về Trang Chủ
            </Button>
          </Link>

          <Link to="/pets" style={{ textDecoration: 'none' }}>
            <Button
              size="large"
              icon={<Heart size={18} />}
              style={{
                height: '56px',
                padding: '0 32px',
                borderRadius: '16px',
                fontSize: '1rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#4f46e5',
                borderColor: '#e2e8f0'
              }}
            >
              Xem Các Bé Khác
            </Button>
          </Link>
        </div>

        {/* Share Section */}
        <div style={{ 
          paddingTop: '32px',
          borderTop: '1px solid #f1f5f9'
        }}>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '16px', fontWeight: '500' }}>
            Lan tỏa niềm vui này đến cộng đồng:
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <ShareButton platform="facebook" />
            <ShareButton platform="messenger" />
            <ShareButton platform="copy" />
          </div>
        </div>
      </Card>

      <style>{`
        @keyframes scaleIn {
          0% { transform: scale(0.8) rotate(-10deg); opacity: 0; }
          70% { transform: scale(1.05) rotate(2deg); }
          100% { transform: scale(1) rotate(-5deg); opacity: 1; }
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
    facebook: { label: 'Facebook', color: '#1877f2', icon: <Share2 size={16} /> },
    messenger: { label: 'Messenger', color: '#0084ff', icon: <ArrowRight size={16} /> },
    copy: { label: 'Sao chép link', color: '#64748b', icon: <Share2 size={16} /> },
  };

  const config = configs[platform];

  return (
    <Button
      onClick={() => toast.success(`Đã chọn chia sẻ qua ${config.label}!`)}
      style={{
        background: platform === 'copy' ? '#f8fafc' : config.color,
        color: platform === 'copy' ? '#475569' : 'white',
        border: platform === 'copy' ? '1px solid #e2e8f0' : 'none',
        borderRadius: '12px',
        fontWeight: '600',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}
    >
      {config.icon} {config.label}
    </Button>
  );
}

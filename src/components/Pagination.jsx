import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Pagination Component
 * 
 * @param {number} currentPage - Trang hiện tại (1-indexed)
 * @param {number} totalPages - Tổng số trang
 * @param {function} onPageChange - Callback khi đổi trang
 * @param {number} totalCount - Tổng số items (optional, để hiển thị)
 */
const Pagination = ({ currentPage, totalPages, onPageChange, totalCount }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }

    return pages;
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      gap: '1rem', 
      marginTop: '3rem',
      padding: '1rem',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn hover-scale"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.6rem 1rem',
          borderRadius: '8px',
          border: '1px solid #ddd',
          background: currentPage === 1 ? '#f3f4f6' : 'white',
          color: currentPage === 1 ? '#9ca3af' : 'var(--dark)',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          fontWeight: 600,
          fontSize: '0.9rem'
        }}
      >
        <ChevronLeft size={18} />
        Trước
      </button>

      {/* Page Numbers */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <span key={`ellipsis-${index}`} style={{ color: '#9ca3af', padding: '0 0.5rem' }}>
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className="btn hover-scale"
              style={{
                padding: '0.6rem 1rem',
                borderRadius: '8px',
                border: currentPage === page ? 'none' : '1px solid #ddd',
                background: currentPage === page ? 'var(--primary)' : 'white',
                color: currentPage === page ? 'white' : 'var(--dark)',
                cursor: 'pointer',
                fontWeight: currentPage === page ? 700 : 600,
                minWidth: '40px',
                fontSize: '0.95rem'
              }}
            >
              {page}
            </button>
          )
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn hover-scale"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.6rem 1rem',
          borderRadius: '8px',
          border: '1px solid #ddd',
          background: currentPage === totalPages ? '#f3f4f6' : 'white',
          color: currentPage === totalPages ? '#9ca3af' : 'var(--dark)',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          fontWeight: 600,
          fontSize: '0.9rem'
        }}
      >
        Sau
        <ChevronRight size={18} />
      </button>

      {/* Total Count (Optional) */}
      {totalCount && (
        <span style={{ 
          marginLeft: '1rem', 
          color: '#6b7280', 
          fontSize: '0.9rem',
          fontWeight: 500 
        }}>
          Tổng: {totalCount}
        </span>
      )}
    </div>
  );
};

export default Pagination;

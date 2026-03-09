import React, { useState, useEffect } from 'react';
import { Home, Trash2, CheckCircle, Ban, RefreshCw, Search, Filter } from 'lucide-react';
import { Modal } from 'antd';
import { getAllShelters, updateShelterStatus, deleteShelter, getAdminShelterStatusBadge } from '../../../services/admin/adminSheltersService';
import { useToast } from '../../../context/ToastContext';

const ShelterManager = () => {
  const toast = useToast();
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch shelters
  const fetchShelters = async () => {
    setLoading(true);
    setError(null);

    const result = await getAllShelters({ 
      status: statusFilter || undefined,
      page: 1,
      pageSize: 50 
    });

    if (result.success) {
      setShelters(result.data.items || result.data || []);
    } else {
      setError(result.error);
      toast.error('Không thể tải danh sách shelters: ' + result.error);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchShelters();
  }, [statusFilter]);

  // Handle status change
  const handleStatusChange = async (shelterId, newStatus) => {
    Modal.confirm({
      title: 'Xác nhận thay đổi trạng thái',
      content: `Bạn có chắc muốn đổi trạng thái shelter này thành "${newStatus}"?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: async () => {
        const result = await updateShelterStatus(shelterId, newStatus);
        
        if (result.success) {
          toast.success(result.message);
          fetchShelters();
        } else {
          toast.error('Lỗi: ' + result.error);
        }
      },
    });
  };

  // Handle delete
  const handleDelete = async (shelterId, shelterName) => {
    Modal.confirm({
      title: '⚠️ CẢNH BÁO',
      content: `Bạn có chắc muốn XÓA shelter "${shelterName}"? Hành động này KHÔNG THỂ HOÀN TÁC!`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        const result = await deleteShelter(shelterId);
        
        if (result.success) {
          toast.success(result.message);
          fetchShelters();
        } else {
          toast.error('Lỗi: ' + result.error);
        }
      },
    });
  };

  // Filter shelters by search term
  const filteredShelters = shelters.filter(shelter => 
    shelter.shelterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shelter.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-title-wrapper">
          <h1 className="admin-page-title">Shelter Management</h1>
          <p className="admin-page-subtitle">Quản lý tất cả các trạm cứu hộ trong hệ thống</p>
        </div>
        <div className="admin-page-actions">
          <button 
            onClick={fetchShelters} 
            className="btn btn-outline"
            disabled={loading}
          >
            <RefreshCw size={18} /> 
            <span className="hide-mobile-text">Làm mới</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 250px', minWidth: '0', position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)' }} />
          <input
            type="text"
            placeholder="Tìm kiếm shelter..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.8rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              outline: 'none',
              fontSize: '1rem'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', flexWrap: 'wrap' }}>
          <Filter size={20} color="var(--gray)" style={{ flexShrink: 0 }} />
          {['', 'Active', 'Inactive', 'Pending'].map(status => (
            <button
              key={status || 'all'}
              onClick={() => setStatusFilter(status)}
              className="btn"
              style={{
                padding: '0.6rem 1rem',
                borderRadius: '20px',
                background: statusFilter === status ? 'var(--primary)' : 'white',
                color: statusFilter === status ? 'white' : 'var(--dark)',
                border: statusFilter === status ? 'none' : '1px solid #ddd',
                fontSize: '0.9rem',
                whiteSpace: 'nowrap'
              }}
            >
              {status || 'Tất cả'}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ 
            display: 'inline-block',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid var(--primary)',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ marginTop: '1rem', color: 'var(--gray)' }}>Đang tải...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div style={{ 
          background: '#fee2e2', 
          color: '#dc2626',
          padding: '1.5rem',
          borderRadius: '12px',
          textAlign: 'center',
          marginBottom: '1rem'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="card" style={{ overflowX: 'auto', padding: '0' }}>
          <div style={{ minWidth: '900px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', background: '#f9fafb' }}>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--dark)' }}>Shelter Name</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--dark)' }}>Location</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--dark)' }}>Region</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--dark)' }}>Animals</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--dark)' }}>Status</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--dark)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredShelters.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray)' }}>
                    Không tìm thấy shelter nào
                  </td>
                </tr>
              ) : (
                filteredShelters.map(shelter => {
                  const statusBadge = getAdminShelterStatusBadge(shelter.status);
                  return (
                    <tr key={shelter.shelterID} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '1rem', fontWeight: 'bold' }}>{shelter.shelterName}</td>
                      <td style={{ padding: '1rem' }}>{shelter.location}</td>
                      <td style={{ padding: '1rem' }}>{shelter.regionName || '-'}</td>
                      <td style={{ padding: '1rem' }}>{shelter.totalPets || 0}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          background: statusBadge.bg,
                          color: statusBadge.color
                        }}>
                          {statusBadge.icon} {statusBadge.text}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {shelter.status === 'Pending' && (
                            <button 
                              onClick={() => handleStatusChange(shelter.shelterID, 'Active')}
                              className="btn btn-secondary" 
                              style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                              title="Phê duyệt"
                            >
                              <CheckCircle size={16} /> Duyệt
                            </button>
                          )}
                          {shelter.status === 'Active' && (
                            <button 
                              onClick={() => handleStatusChange(shelter.shelterID, 'Inactive')}
                              className="btn btn-outline" 
                              style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                              title="Tạm ngưng"
                            >
                              <Ban size={16} />
                            </button>
                          )}
                          {shelter.status === 'Inactive' && (
                            <button 
                              onClick={() => handleStatusChange(shelter.shelterID, 'Active')}
                              className="btn btn-secondary" 
                              style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                              title="Kích hoạt lại"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(shelter.shelterID, shelter.shelterName)}
                            className="btn btn-outline" 
                            style={{ 
                              padding: '0.5rem 0.75rem', 
                              color: 'var(--danger)', 
                              borderColor: 'var(--danger)',
                              fontSize: '0.85rem'
                            }}
                            title="Xóa shelter"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShelterManager;

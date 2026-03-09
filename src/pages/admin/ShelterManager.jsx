import React, { useState, useEffect, useRef } from 'react';
import { Home, Trash2, CheckCircle, Ban, RefreshCw, Search, Filter, Plus, X, Eye, EyeOff } from 'lucide-react';
import { Modal } from 'antd';
import { getAllShelters, createShelter, updateShelterStatus, deleteShelter, getAdminShelterStatusBadge } from '../../services/admin/adminSheltersService';
import { useToast } from '../../context/ToastContext';

const ShelterManager = () => {
  const toast = useToast();
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, totalCount: 0 });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [createForm, setCreateForm] = useState({
    shelterName: '', location: '', regionID: '', description: '',
    managerUsername: '', managerPassword: '', managerFullName: '', managerEmail: '', managerPhone: '',
  });

  // Refs to always access latest values
  const statusRef = useRef(statusFilter);
  const searchRef = useRef(searchTerm);
  const pageRef = useRef(pagination.page);

  // Fetch shelters
  const fetchShelters = async ({ Status, Keyword, Page } = {}) => {
    // Update refs if overrides provided
    if (Status !== undefined) statusRef.current = Status;
    if (Keyword !== undefined) searchRef.current = Keyword;
    if (Page !== undefined) pageRef.current = Page;

    setLoading(true);
    setError(null);

    const result = await getAllShelters({ 
      Status: statusRef.current || undefined,
      Keyword: searchRef.current || undefined,
      Page: pageRef.current || 1,
      PageSize: pagination.pageSize,
    });

    if (result.success) {
      const data = result.data;
      let items = data.items || [];
      // Client-side filter fallback in case backend ignores Status param
      const currentStatus = statusRef.current;
      if (currentStatus && items.length > 0) {
        const hasWrongStatus = items.some(s => (s.status || s.Status) !== currentStatus);
        if (hasWrongStatus) {
          items = items.filter(s => (s.status || s.Status) === currentStatus);
        }
      }
      setShelters(items);
      setPagination(prev => ({
        ...prev,
        totalCount: data.totalCount || 0,
        page: data.currentPage || prev.page,
      }));
    } else {
      setError(result.error);
      toast.error('Không thể tải danh sách shelters: ' + result.error);
    }

    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchShelters(); }, []);

  // Search khi nhấn Enter hoặc click
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchShelters({ Keyword: searchTerm, Page: 1 });
  };

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

  // Handle create shelter
  const handleCreateShelter = async () => {
    if (!createForm.shelterName || !createForm.location || !createForm.managerUsername || !createForm.managerPassword || !createForm.managerFullName || !createForm.managerEmail) {
      toast.error('Vui lòng điền đầy đủ các trường bắt buộc!');
      return;
    }
    setCreating(true);
    const payload = { ...createForm, regionID: createForm.regionID ? Number(createForm.regionID) : undefined };
    const result = await createShelter(payload);
    setCreating(false);
    if (result.success) {
      toast.success(result.message);
      setShowCreateModal(false);
      setCreateForm({ shelterName: '', location: '', regionID: '', description: '', managerUsername: '', managerPassword: '', managerFullName: '', managerEmail: '', managerPhone: '' });
      setShowPassword(false);
      fetchShelters({ Page: 1 });
    } else {
      toast.error('Lỗi: ' + result.error);
    }
  };

  const totalPages = Math.ceil(pagination.totalCount / pagination.pageSize);

  const inputStyle = { width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' };
  const labelStyle = { display: 'block', marginBottom: '0.3rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--dark)' };

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-title-wrapper">
          <h1 className="admin-page-title">Shelter Management</h1>
          <p className="admin-page-subtitle">Quản lý tất cả các trạm cứu hộ trong hệ thống</p>
        </div>
        <div className="admin-page-actions">
          <button 
            onClick={() => setShowCreateModal(true)} 
            className="btn btn-outline"
          >
            <Plus size={18} /> 
            <span className="hide-mobile-text">Thêm mới</span>
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
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
              onClick={() => { setStatusFilter(status); setPagination(prev => ({ ...prev, page: 1 })); fetchShelters({ Status: status, Page: 1 }); }}
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
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--dark)' }}>Tên Trạm</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--dark)' }}>Địa Chỉ</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--dark)' }}>Khu Vực</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--dark)' }}>Quản Lý</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--dark)' }}>Số Thú Cưng</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--dark)' }}>Trạng Thái</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--dark)' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {shelters.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray)' }}>
                    Không tìm thấy shelter nào
                  </td>
                </tr>
              ) : (
                shelters.map(shelter => {
                  const statusBadge = getAdminShelterStatusBadge(shelter.status);
                  return (
                    <tr key={shelter.shelterID} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '1rem', fontWeight: 'bold' }}>{shelter.shelterName}</td>
                      <td style={{ padding: '1rem' }}>{shelter.location}</td>
                      <td style={{ padding: '1rem' }}>{shelter.regionName || '-'}</td>
                      <td style={{ padding: '1rem' }}>{shelter.managerName || '-'}</td>
                      <td style={{ padding: '1rem' }}>{shelter.totalAnimals || 0}</td>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '1rem' }}>
              <button
                onClick={() => { const newPage = pagination.page - 1; setPagination(prev => ({ ...prev, page: newPage })); fetchShelters({ Page: newPage }); }}
                disabled={pagination.page <= 1}
                className="btn btn-outline"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                ← Trước
              </button>
              <span style={{ fontSize: '0.9rem', color: 'var(--gray)' }}>
                Trang {pagination.page} / {totalPages} ({pagination.totalCount} kết quả)
              </span>
              <button
                onClick={() => { const newPage = pagination.page + 1; setPagination(prev => ({ ...prev, page: newPage })); fetchShelters({ Page: newPage }); }}
                disabled={pagination.page >= totalPages}
                className="btn btn-outline"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                Sau →
              </button>
            </div>
          )}
        </div>
      )}
      {/* Create Shelter Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #eee' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>🏥 Thêm Trạm Cứu Hộ Mới</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}><X size={22} /></button>
            </div>

            {/* Form */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--primary)', fontSize: '0.95rem' }}>📋 Thông tin trạm</p>
              <div>
                <label style={labelStyle}>Tên trạm cứu hộ *</label>
                <input style={inputStyle} placeholder="VD: Trạm Cứu Hộ ABC" value={createForm.shelterName} onChange={e => setCreateForm(f => ({ ...f, shelterName: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Địa chỉ *</label>
                <input style={inputStyle} placeholder="VD: 123 Đường XYZ, Quận 1, TP.HCM" value={createForm.location} onChange={e => setCreateForm(f => ({ ...f, location: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Region ID</label>
                  <input style={inputStyle} type="number" placeholder="VD: 1" value={createForm.regionID} onChange={e => setCreateForm(f => ({ ...f, regionID: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Mô tả</label>
                <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} placeholder="Mô tả về trạm cứu hộ..." value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '0.25rem 0' }} />
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--primary)', fontSize: '0.95rem' }}>👤 Thông tin quản lý</p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Họ tên quản lý *</label>
                  <input style={inputStyle} placeholder="Nguyễn Văn A" value={createForm.managerFullName} onChange={e => setCreateForm(f => ({ ...f, managerFullName: e.target.value }))} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Username *</label>
                  <input style={inputStyle} placeholder="manager_abc" value={createForm.managerUsername} onChange={e => setCreateForm(f => ({ ...f, managerUsername: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Mật khẩu *</label>
                <div style={{ position: 'relative' }}>
                  <input style={{ ...inputStyle, paddingRight: '2.5rem' }} type={showPassword ? 'text' : 'password'} placeholder="Password@123" value={createForm.managerPassword} onChange={e => setCreateForm(f => ({ ...f, managerPassword: e.target.value }))} />
                  <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray)' }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Email *</label>
                  <input style={inputStyle} type="email" placeholder="manager@shelter.com" value={createForm.managerEmail} onChange={e => setCreateForm(f => ({ ...f, managerEmail: e.target.value }))} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Số điện thoại</label>
                  <input style={inputStyle} type="tel" placeholder="0909123456" value={createForm.managerPhone} onChange={e => setCreateForm(f => ({ ...f, managerPhone: e.target.value }))} />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', padding: '1rem 1.5rem', borderTop: '1px solid #eee' }}>
              <button onClick={() => setShowCreateModal(false)} className="btn btn-outline" style={{ padding: '0.6rem 1.25rem' }}>Hủy</button>
              <button onClick={handleCreateShelter} className="btn btn-primary" style={{ padding: '0.6rem 1.25rem' }} disabled={creating}>
                {creating ? 'Đang tạo...' : '✅ Tạo trạm cứu hộ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShelterManager;

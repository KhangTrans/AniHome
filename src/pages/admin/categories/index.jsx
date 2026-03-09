import React, { useState, useEffect, useCallback } from 'react';
import { Edit2, Trash, Layers, RefreshCw } from 'lucide-react';
import { Modal } from 'antd';
import { useToast } from '../../../context/ToastContext';
import { 
  getAllCategories, 
  createCategory, 
  updateCategory,
  deleteCategory,
} from '../../../services/admin/adminCategoriesService';
import CategoryForm from './components/CategoryForm';

const CategoryEditor = () => {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    const result = await getAllCategories();
    
    if (result.success) {
      setCategories(result.data);
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  }, [toast]);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFormSubmit = async (formData) => {
    setSubmitting(true);
    
    let result;
    if (formData.categoryID) {
      // Edit mode
      result = await updateCategory(formData.categoryID, formData);
    } else {
      // Add mode
      result = await createCategory(formData);
    }
    
    if (result.success) {
      toast.success(result.message);
      setEditingCategory(null);
      loadCategories(); // Reload list
    } else {
      toast.error(result.error);
    }
    setSubmitting(false);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
  };

  const handleDeleteCategory = async (category) => {
    if (category.itemCount > 0) {
      toast.error(`Không thể xóa thể loại "${category.categoryName}" vì còn ${category.itemCount} mục liên quan!`);
      return;
    }

    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc muốn xóa thể loại "${category.categoryName}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        const result = await deleteCategory(category.categoryID);
        
        if (result.success) {
          toast.success(result.data?.message || 'Đã xóa thể loại!');
          loadCategories();
        } else {
          toast.error(result.error);
        }
      },
    });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="mb-0">Quản lý thể loại</h1>
        <button className="btn btn-outline" onClick={loadCategories} disabled={loading}>
          <RefreshCw size={18} className={loading ? 'spin' : ''} /> Làm mới
        </button>
      </div>
      
      <div className="grid gap-6" style={{ gridTemplateColumns: '380px 1fr' }}>
        
        {/* Add/Edit Form */}
        <CategoryForm 
          category={editingCategory}
          onSubmit={handleFormSubmit}
          onCancel={handleCancelEdit}
          submitting={submitting}
        />

        {/* List */}
        <div className="card">
          <h3 className="mb-4">Danh sách thể loại</h3>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <RefreshCw size={32} className="spin" style={{ color: 'var(--primary)' }} />
              <p style={{ marginTop: '1rem', color: '#666' }}>Đang tải...</p>
            </div>
          ) : categories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              <Layers size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
              <p>Chưa có thể loại nào. Hãy thêm mới!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {categories.map((cat) => (
                <div 
                  key={cat.categoryID} 
                  className="flex justify-between items-center p-3" 
                  style={{ borderBottom: '1px solid #eee' }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Layers size={20} color="var(--primary)" />
                    <div>
                      <span style={{ fontWeight: '500', display: 'block' }}>{cat.categoryName}</span>
                      <span style={{ fontSize: '0.875rem', color: '#666' }}>{cat.categoryType}</span>
                    </div>
                    <span className="badge badge-success">{cat.itemCount} mục</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      className="btn btn-outline" 
                      onClick={() => handleEditCategory(cat)}
                      style={{ padding: '0.4rem' }}
                      title="Chỉnh sửa thể loại"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      className="btn btn-outline" 
                      onClick={() => handleDeleteCategory(cat)} 
                      disabled={cat.itemCount > 0}
                      style={{ 
                        padding: '0.4rem', 
                        color: cat.itemCount > 0 ? '#ccc' : 'var(--danger)', 
                        borderColor: cat.itemCount > 0 ? '#ccc' : 'var(--danger)',
                        cursor: cat.itemCount > 0 ? 'not-allowed' : 'pointer'
                      }}
                      title={cat.itemCount > 0 ? `Không thể xóa vì còn ${cat.itemCount} mục liên quan` : 'Xóa thể loại'}
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CategoryEditor;
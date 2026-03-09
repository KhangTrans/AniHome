import React, { useState, useEffect } from 'react';
import { Plus, Save, X } from 'lucide-react';
import { Select } from 'antd';
import { validateCategoryData, CATEGORY_TYPES } from '../../../../services/admin/adminCategoriesService';

/**
 * CategoryForm Component
 * Reusable form for both adding new and editing existing categories
 * 
 * @param {Object} props
 * @param {Object|null} props.category - Category to edit (null for add mode)
 * @param {Function} props.onSubmit - Callback when form is submitted
 * @param {Function} props.onCancel - Callback to cancel editing
 * @param {boolean} props.submitting - Loading state
 */
const CategoryForm = ({ category = null, onSubmit, onCancel, submitting = false }) => {
  const isEditMode = category !== null;
  
  const [formData, setFormData] = useState({
    categoryName: '',
    categoryType: 'Pet',
  });
  const [errors, setErrors] = useState({});

  // Initialize form when category prop changes
  useEffect(() => {
    if (category) {
      setFormData({
        categoryName: category.categoryName || '',
        categoryType: category.categoryType || 'Pet',
      });
    } else {
      setFormData({
        categoryName: '',
        categoryType: 'Pet',
      });
    }
    setErrors({});
  }, [category]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate
    const validation = validateCategoryData(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    // Pass data to parent with category ID if editing
    onSubmit({
      ...formData,
      ...(isEditMode && { categoryID: category.categoryID }),
    });
  };

  const handleCancel = () => {
    setFormData({
      categoryName: '',
      categoryType: 'Pet',
    });
    setErrors({});
    if (onCancel) onCancel();
  };

  return (
    <div style={{width:300, height:400}}>
      <h3 className="mb-4">
        {isEditMode ? 'Chỉnh sửa thể loại' : 'Thêm thể loại mới'}
      </h3>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="form-label">Tên thể loại</label>
          <input 
            type="text" 
            name="categoryName"
            placeholder="VD: Chó, Mèo, Hamster..." 
            value={formData.categoryName} 
            onChange={handleInputChange}
            className={errors.categoryName ? 'input-error' : ''}
            style={{ 
              padding: '0.8rem 1rem', 
              borderRadius: '8px', 
              border: '1px solid #e0e0e0', 
              width: '100%',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'all 0.2s ease',
            }} 
            disabled={submitting}
            onFocus={(e) => e.target.style.borderColor = '#FF6B6B'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          />
          {errors.categoryName && (
            <span className="text-danger" style={{ fontSize: '0.875rem' }}>
              {errors.categoryName}
            </span>
          )}
        </div>

        <div>
          <label className="form-label">Loại thể loại</label>
          <Select
            value={formData.categoryType}
            onChange={(value) => handleInputChange({ target: { name: 'categoryType', value } })}
            disabled={submitting}
            style={{ width: '100%' }}
            size="large"
            options={CATEGORY_TYPES.map(type => ({
              value: type.value,
              label: type.label,
            }))}
            status={errors.categoryType ? 'error' : ''}
          />
          {errors.categoryType && (
            <span className="text-danger" style={{ fontSize: '0.875rem' }}>
              {errors.categoryType}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button 
            type="submit" 
            className="btn btn-primary justify-center flex-1" 
            disabled={submitting || !formData.categoryName.trim()}
          >
            {isEditMode ? <Save size={18} /> : <Plus size={18} />}
            {submitting 
              ? 'Đang xử lý...' 
              : isEditMode 
                ? 'Lưu thay đổi' 
                : 'Thêm thể loại'
            }
          </button>
          
          {isEditMode && (
            <button 
              type="button"
              className="btn btn-outline" 
              onClick={handleCancel}
              disabled={submitting}
            >
              <X size={18} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;

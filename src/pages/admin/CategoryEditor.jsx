import React, { useState } from 'react';
import { Plus, Edit2, Trash, Layers, Check, X } from 'lucide-react';

const CategoryEditor = () => {
  const [categories, setCategories] = useState([
    { id: 1, name: 'Dogs', count: 120 },
    { id: 2, name: 'Cats', count: 85 },
    { id: 3, name: 'Birds', count: 12 },
    { id: 4, name: 'Medical Supplies', count: 45 },
  ]);

  const [newCat, setNewCat] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const addCategory = (e) => {
    e.preventDefault();
    if (newCat.trim()) {
      setCategories([...categories, { id: Date.now(), name: newCat.trim(), count: 0 }]);
      setNewCat('');
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const saveEdit = (id) => {
    setCategories(categories.map(c => c.id === id ? { ...c, name: editName } : c));
    setEditingId(null);
  };

  const deleteCategory = (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1 className="mb-4">Category Editor</h1>
      
      <div className="grid gap-6" style={{ gridTemplateColumns: 'minmax(300px, 1fr) 2fr' }}>
        
        {/* Add New Form */}
        <div className="card h-fit">
          <h3 className="mb-4">Add New Category</h3>
          <form onSubmit={addCategory} className="flex flex-col gap-4">
            <input 
              type="text" 
              placeholder="Category Name (e.g. Reptiles)" 
              value={newCat} 
              onChange={(e) => setNewCat(e.target.value)}
              style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #eee' }} 
            />
            <button type="submit" className="btn btn-primary justify-center" disabled={!newCat.trim()}>
              <Plus size={18} /> Add Category
            </button>
          </form>
        </div>

        {/* List */}
        <div className="card">
          <h3 className="mb-4">Existing Categories</h3>
          <div className="flex flex-col gap-2">
            {categories.map(cat => (
              <div key={cat.id} className="flex justify-between items-center p-3" style={{ borderBottom: '1px solid #eee' }}>
                <div className="flex items-center gap-3 flex-1">
                   <Layers size={20} color="var(--primary)" />
                   
                   {editingId === cat.id ? (
                     <input 
                       autoFocus
                       className="p-1 border rounded"
                       value={editName}
                       onChange={(e) => setEditName(e.target.value)}
                     /> 
                   ) : (
                     <span style={{ fontWeight: '500' }}>{cat.name}</span>
                   )}
                   
                   <span className="badge badge-success">{cat.count} items</span>
                </div>
                
                <div className="flex gap-2">
                  {editingId === cat.id ? (
                    <>
                      <button className="btn btn-success" onClick={() => saveEdit(cat.id)} style={{ padding: '0.4rem', color: 'white' }}><Check size={16} /></button>
                      <button className="btn btn-danger" onClick={() => setEditingId(null)} style={{ padding: '0.4rem', color: 'white' }}><X size={16} /></button>
                    </>
                  ) : (
                    <>
                       <button className="btn btn-outline" onClick={() => startEdit(cat)} style={{ padding: '0.4rem' }}><Edit2 size={16} /></button>
                       <button className="btn btn-outline" onClick={() => deleteCategory(cat.id)} style={{ padding: '0.4rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}><Trash size={16} /></button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CategoryEditor;

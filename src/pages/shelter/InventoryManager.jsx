import React, { useState } from 'react';
import { Package, ShoppingBag, Plus, AlertCircle } from 'lucide-react';

const InventoryManager = () => {
  const [activeTab, setActiveTab] = useState('supplies'); // supplies or shop

  const supplies = [
    { id: 1, name: 'Dog Food (Dry)', quantity: '450 kg', status: 'Good', minReq: '100 kg' },
    { id: 2, name: 'Cat Food (Wet)', quantity: '12 cans', status: 'Critical', minReq: '50 cans' },
    { id: 3, name: 'Vaccines', quantity: '50 units', status: 'Low', minReq: '60 units' },
  ];

  const shopItems = [
    { id: 1, name: 'Rescue T-Shirt', price: '$25.00', stock: 50, category: 'Apparel' },
    { id: 2, name: 'Paw Print Mug', price: '$12.00', stock: 30, category: 'Accessories' },
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <div className="flex justify-between items-center mb-6">
        <h1>Inventory & Shop</h1>
        <div style={{ backgroundColor: 'white', padding: '0.25rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', display: 'flex' }}>
           <button 
             onClick={() => setActiveTab('supplies')}
             style={{
               padding: '0.5rem 1rem', 
               borderRadius: '0.375rem', 
               transition: 'all 0.2s',
               border: 'none',
               cursor: 'pointer',
               backgroundColor: activeTab === 'supplies' ? '#dbeafe' : 'transparent',
               color: activeTab === 'supplies' ? '#2563eb' : '#6b7280',
               fontWeight: activeTab === 'supplies' ? 'bold' : 'normal'
             }}
           >
             Supplies
           </button>
           <button 
             onClick={() => setActiveTab('shop')}
             style={{
               padding: '0.5rem 1rem', 
               borderRadius: '0.375rem', 
               transition: 'all 0.2s',
               border: 'none',
               cursor: 'pointer',
               backgroundColor: activeTab === 'shop' ? '#dbeafe' : 'transparent',
               color: activeTab === 'shop' ? '#2563eb' : '#6b7280',
               fontWeight: activeTab === 'shop' ? 'bold' : 'normal'
             }}
           >
             Shop Products
           </button>
        </div>
      </div>

      {activeTab === 'supplies' ? (
        <div className="card">
           <div className="flex justify-between items-center mb-4">
              <h3>Internal Supplies</h3>
              <button className="btn btn-outline"><Plus size={16} /> Request Restock</button>
           </div>
           <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                 <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                    <th className="p-3">Item Name</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Min Required</th>
                    <th className="p-3">Status</th>
                 </tr>
              </thead>
              <tbody>
                 {supplies.map(item => (
                   <tr key={item.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                      <td className="p-3" style={{ fontWeight: 500 }}>{item.name}</td>
                      <td className="p-3">{item.quantity}</td>
                      <td className="p-3" style={{ color: '#6b7280' }}>{item.minReq}</td>
                      <td className="p-3">
                         <span className={`badge ${item.status === 'Good' ? 'badge-success' : item.status === 'Low' ? 'badge-warning' : 'badge-danger'}`}>
                           {item.status}
                         </span>
                      </td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      ) : (
        <div className="card">
           <div className="flex justify-between items-center mb-4">
              <h3>Shop Products (Fundraising)</h3>
              <button className="btn btn-primary"><Plus size={16} /> Add Product</button>
           </div>
           <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
              {shopItems.map(item => (
                <div key={item.id} style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                   <div style={{ height: '8rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                      <ShoppingBag size={32} />
                   </div>
                   <h4 style={{ fontWeight: 'bold' }}>{item.name}</h4>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#2563eb', fontWeight: 'bold' }}>{item.price}</span>
                      <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>{item.stock} left</span>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManager;

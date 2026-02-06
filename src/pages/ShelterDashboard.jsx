import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ShelterOverview from './shelter/ShelterOverview';
import AnimalManager from './shelter/AnimalManager';
import ScheduleManager from './shelter/ScheduleManager';
import InventoryManager from './shelter/InventoryManager';
import { 
  Home, 
  Calendar, 
  Package, 
  Dog,
  Menu
} from 'lucide-react';

const ShelterDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarItems = [
    { label: 'Tổng Quan', path: '/shelter', icon: <Home size={20} />, exact: true },
    { label: 'Thú Cưng', path: '/shelter/animals', icon: <Dog size={20} /> },
    { label: 'Lịch Hẹn', path: '/shelter/calendar', icon: <Calendar size={20} /> },
    { label: 'Kho & Cửa Hàng', path: '/shelter/inventory', icon: <Package size={20} /> },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--light)', position: 'relative' }}>
      {/* Mobile Header */}
      <div className="md:hidden p-4 bg-white flex items-center justify-between shadow-sm fixed top-0 left-0 right-0 z-20">
         <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(true)}>
               <Menu size={24} />
            </button>
            <h1 className="font-bold text-lg">Quản Lý Trạm</h1>
         </div>
      </div>

      <Sidebar 
        title="Quản Lý Trạm" 
        items={sidebarItems} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <main className="md:ml-[var(--sidebar-width)] pt-16 md:pt-0">
         <Routes>
            <Route path="/" element={<ShelterOverview />} />
            <Route path="/animals" element={<AnimalManager />} />
            <Route path="/calendar" element={<ScheduleManager />} />
            <Route path="/inventory" element={<InventoryManager />} />
         </Routes>
      </main>
    </div>
  );
};

export default ShelterDashboard;
